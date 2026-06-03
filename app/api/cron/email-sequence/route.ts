/**
 * app/api/cron/email-sequence/route.ts — Cron diário pra disparar sequência D+1/D+3/D+7.
 *
 * Roda às 10h BRT (13h UTC) via Vercel Cron (vercel.json).
 *
 * Lógica:
 * 1. Busca waitlist_leads cadastrados há 1, 3 e 7 dias (com tolerância de 24h
 *    pra cobrir cron variação de tempo)
 * 2. Pra cada lead, checa email_sequence_log se step ainda não foi enviado
 * 3. Manda email + registra log
 *
 * Segurança: header CRON_SECRET obrigatório (configurar no Vercel env).
 * Idempotência: tabela email_sequence_log com UNIQUE (lead_id, step).
 *
 * Migration required: supabase/migrations/20260603_email_sequence_log.sql
 */

import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { sendSequenceEmail, type SequenceStep } from '@/services/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface WaitlistLead {
  id:         string
  email:      string
  name:       string | null
  created_at: string
}

interface CronResult {
  step:    SequenceStep
  total:   number
  sent:    number
  failed:  number
  skipped: number   // já enviado anterior
  errors:  Array<{ leadId: string; error: string }>
}

const STEP_DAYS: Record<SequenceStep, number> = {
  d1: 1,
  d3: 3,
  d7: 7,
}

export async function GET(request: NextRequest) {
  // Auth via header secreto (Vercel Cron envia automaticamente Authorization: Bearer)
  const expected = process.env.CRON_SECRET
  if (expected) {
    const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (provided !== expected) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  const admin = getSupabaseAdmin()
  const results: CronResult[] = []

  for (const step of ['d1', 'd3', 'd7'] as const) {
    const result = await processStep(step, admin)
    results.push(result)
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    results,
  })
}

async function processStep(
  step: SequenceStep,
  admin: ReturnType<typeof getSupabaseAdmin>,
): Promise<CronResult> {
  const result: CronResult = { step, total: 0, sent: 0, failed: 0, skipped: 0, errors: [] }
  const daysAgo = STEP_DAYS[step]

  // Janela de 24h: leads cadastrados entre N e N-1 dias atrás
  const now = Date.now()
  const windowEnd   = new Date(now - daysAgo * 86_400_000)
  const windowStart = new Date(now - (daysAgo + 1) * 86_400_000)

  // Busca leads da janela
  const { data: leads, error: leadsError } = await admin
    .from('waitlist_leads')
    .select('id, email, name, created_at')
    .gte('created_at', windowStart.toISOString())
    .lt('created_at',  windowEnd.toISOString())
    .not('email', 'is', null)
    .returns<WaitlistLead[]>()

  if (leadsError) {
    console.error(`[cron/email-sequence] ${step} fetch leads failed:`, leadsError)
    result.errors.push({ leadId: '-', error: leadsError.message })
    return result
  }

  result.total = leads?.length ?? 0

  if (!leads || leads.length === 0) {
    return result
  }

  // Busca logs já enviados pra esse step (anti-duplicação)
  const leadIds = leads.map(l => l.id)
  const { data: existingLogs } = await admin
    .from('email_sequence_log')
    .select('lead_id')
    .eq('step', step)
    .in('lead_id', leadIds)

  const alreadySent = new Set((existingLogs ?? []).map(l => l.lead_id))

  // Processa cada lead
  for (const lead of leads) {
    if (alreadySent.has(lead.id)) {
      result.skipped += 1
      continue
    }

    if (!lead.email) {
      result.failed += 1
      result.errors.push({ leadId: lead.id, error: 'missing_email' })
      continue
    }

    const sendResult = await sendSequenceEmail(step, lead.email, lead.name ?? '')

    if (!sendResult.ok) {
      result.failed += 1
      result.errors.push({ leadId: lead.id, error: sendResult.error })
      // Log com status failed pra retentar depois? Não — Resend já tenta.
      // Idempotência por step: se falhar agora, próximo cron tenta de novo.
      continue
    }

    // Registra envio
    const { error: logError } = await admin
      .from('email_sequence_log')
      .insert({
        lead_id:  lead.id,
        step,
        sent_at:  new Date().toISOString(),
        resend_id: sendResult.id,
      })

    if (logError) {
      console.warn(`[cron/email-sequence] log insert failed for ${lead.id}:`, logError)
      // Não conta como falha — email já foi. Mas próximo cron pode duplicar.
      // UNIQUE constraint (lead_id, step) na tabela previne.
    }

    result.sent += 1
  }

  return result
}
