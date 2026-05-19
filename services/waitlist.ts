/**
 * Waitlist service — captura de leads pré-lançamento (Fase 1 — launch 04/07/2026).
 *
 * Service-first (regra global do projeto): toda lógica DB mora aqui, nunca
 * direto no componente. Página/Server Action chama essas funções.
 */

import { createServerClient } from '@/lib/supabaseServer'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import {
  type WaitlistLeadStep1,
  type WaitlistLeadStep2,
  type WaitlistLead,
  type LeadCaptureMeta,
} from './waitlistSchema'

// ─── Tipos do retorno ───────────────────────────────────────────────────────

export type AddLeadResult =
  | { ok: true; leadId: string; email: string }
  | { ok: false; error: 'already_registered' | 'invalid_input' | 'unexpected'; message: string }

export type UpdateLeadResult =
  | { ok: true; leadId: string }
  | { ok: false; error: 'not_found' | 'unexpected'; message: string }

// ─── Inserir lead (etapa 1) ─────────────────────────────────────────────────

/**
 * Cria novo lead na waitlist com dados mínimos da etapa 1
 * + meta capturada automaticamente do request (UTM, referrer, geo, device, ip_hash).
 *
 * Idempotente por email: se já existe, retorna `already_registered`.
 */
export async function addLeadStep1(
  input: WaitlistLeadStep1,
  meta: LeadCaptureMeta
): Promise<AddLeadResult> {
  try {
    // Service role: bypass RLS pq anon não tem policy SELECT, e o
    // .insert().select() do supabase-js precisa de RETURNING (precisa de SELECT).
    // Insert público continua seguro: Server Action faz Zod + bot guards antes.
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('waitlist_leads')
      .insert({
        email:        input.email.toLowerCase().trim(),
        name:         input.name.trim(),
        whatsapp:     input.whatsapp?.trim() || null,
        consent_lgpd: input.consent_lgpd,
        consent_at:   input.consent_lgpd ? new Date().toISOString() : null,

        // Meta automática
        utm_source:   meta.utm_source   || null,
        utm_medium:   meta.utm_medium   || null,
        utm_campaign: meta.utm_campaign || null,
        utm_content:  meta.utm_content  || null,
        utm_term:     meta.utm_term     || null,
        referrer:     meta.referrer     || null,
        ip_country:   meta.ip_country   || null,
        ip_region:    meta.ip_region    || null,
        ip_city:      meta.ip_city      || null,
        ip_hash:      meta.ip_hash      || null,
        user_agent:   meta.user_agent   || null,
        device:       meta.device       || null,
      })
      .select('id, email')
      .single()

    if (error) {
      // Email duplicado (constraint unique)
      if (error.code === '23505') {
        return {
          ok:      false,
          error:   'already_registered',
          message: 'Este email já está na lista de espera.',
        }
      }
      console.error('[waitlist.addLeadStep1] insert error:', error)
      return {
        ok:      false,
        error:   'unexpected',
        message: 'Não foi possível concluir agora. Tenta de novo em instantes.',
      }
    }

    return { ok: true, leadId: data.id, email: data.email }
  } catch (err) {
    console.error('[waitlist.addLeadStep1] unexpected:', err)
    return {
      ok:      false,
      error:   'unexpected',
      message: 'Não foi possível concluir agora. Tenta de novo em instantes.',
    }
  }
}

// ─── Update lead (etapa 2 — qualificação opcional) ─────────────────────────

/**
 * Atualiza dados de qualificação opcionais (etapa 2 da tela /waitlist/obrigado).
 * NÃO falha se o lead não existir — retorna ok mesmo (defensivo, evita user trava).
 */
export async function updateLeadStep2(
  leadId: string,
  input: WaitlistLeadStep2
): Promise<UpdateLeadResult> {
  try {
    // Service role: anon não tem policy UPDATE; só admin_update (is_admin=true).
    // Backend valida o leadId via cookie httpOnly, então é seguro usar admin.
    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('waitlist_leads')
      .update({
        business_name: input.business_name?.trim() || null,
        segment:       input.segment       || null,
        size:          input.size          || null,
        revenue_band:  input.revenue_band  || null,
        pain:          input.pain?.trim()  || null,
        source:        input.source        || null,
        // bonifica score por completar etapa 2
        score:         50,
      })
      .eq('id', leadId)

    if (error) {
      console.error('[waitlist.updateLeadStep2] error:', error)
      return {
        ok:      false,
        error:   'unexpected',
        message: 'Não foi possível salvar agora. Você já está na lista.',
      }
    }

    return { ok: true, leadId }
  } catch (err) {
    console.error('[waitlist.updateLeadStep2] unexpected:', err)
    return {
      ok:      false,
      error:   'unexpected',
      message: 'Não foi possível salvar agora. Você já está na lista.',
    }
  }
}

// ─── Métricas admin (preparação Fase 1 semana 5) ───────────────────────────

export async function getWaitlistStats(): Promise<{
  total:     number
  byStatus:  Record<string, number>
  bySegment: Record<string, number>
}> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('waitlist_leads')
    .select('status, segment')

  if (error || !data) {
    return { total: 0, byStatus: {}, bySegment: {} }
  }

  const byStatus:  Record<string, number> = {}
  const bySegment: Record<string, number> = {}
  for (const row of data) {
    byStatus[row.status]  = (byStatus[row.status]  || 0) + 1
    if (row.segment) bySegment[row.segment] = (bySegment[row.segment] || 0) + 1
  }

  return { total: data.length, byStatus, bySegment }
}

// ─── Contagem pública pra social proof na landing ──────────────────────────

/**
 * Retorna o total de leads na waitlist.
 * Usa service_role pra evitar problema de RLS + anon SELECT.
 * Usado no Server Component da landing — sem exposição de dados sensíveis.
 */
export async function getWaitlistCount(): Promise<number> {
  try {
    const supabase = getSupabaseAdmin()
    const { count, error } = await supabase
      .from('waitlist_leads')
      .select('*', { count: 'exact', head: true })

    if (error || count === null) return 0
    return count
  } catch {
    return 0
  }
}

export type { WaitlistLead, WaitlistLeadStep1, WaitlistLeadStep2, LeadCaptureMeta }
