/**
 * POST /api/catalog/quote
 *
 * Recebe form de orçamento da vitrine pública e cria um Lead no CRM do dono
 * do catálogo. Endpoint público (sem auth) — resolve dono via catalog.slug.
 *
 * Body:
 *   - productId:    string (id do produto sendo orçado)
 *   - catalogSlug:  string (slug do catálogo público)
 *   - name:         string (nome do cliente)
 *   - whatsapp:     string (opcional, mas pelo menos um de whatsapp/email)
 *   - email:        string (opcional)
 *   - description:  string (descrição do que precisa)
 *   - urgency:      'flexible' | 'normal' | 'urgent'
 *   - referenceUrl: string (opcional)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface QuoteBody {
  productId:    string
  catalogSlug:  string
  name:         string
  whatsapp?:    string
  email?:       string
  description:  string
  urgency?:     string
  referenceUrl?: string
}

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('[catalog/quote] Missing Supabase env vars')
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(req: NextRequest) {
  let body: QuoteBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido (JSON esperado)' }, { status: 400 })
  }

  const name        = (body.name        ?? '').trim()
  const description = (body.description ?? '').trim()
  const whatsapp    = (body.whatsapp    ?? '').trim()
  const email       = (body.email       ?? '').trim()

  if (!name) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
  }
  if (!description) {
    return NextResponse.json({ error: 'Descrição é obrigatória' }, { status: 400 })
  }
  if (!whatsapp && !email) {
    return NextResponse.json({ error: 'Informe WhatsApp ou email pra contato' }, { status: 400 })
  }
  if (!body.catalogSlug) {
    return NextResponse.json({ error: 'catalogSlug é obrigatório' }, { status: 400 })
  }
  if (!body.productId) {
    return NextResponse.json({ error: 'productId é obrigatório' }, { status: 400 })
  }

  // Monta contato em string única (CRM atual usa campo único)
  const contactParts: string[] = []
  if (whatsapp) contactParts.push(`WhatsApp: ${whatsapp}`)
  if (email)    contactParts.push(`Email: ${email}`)
  const contact = contactParts.join(' · ')

  const urgencyLabel: Record<string, string> = {
    flexible: 'Sem pressa',
    normal:   'Próximas semanas',
    urgent:   'Urgente',
  }
  const urgency = urgencyLabel[body.urgency ?? 'normal'] ?? 'Próximas semanas'

  // notes acumula urgência + ref + descrição (produto é resolvido server-side via RPC)
  const notesParts = [
    `Urgência: ${urgency}`,
    body.referenceUrl ? `Referência: ${body.referenceUrl}` : null,
    '',
    description,
  ].filter(Boolean)
  const notes = notesParts.join('\n')

  // Chama RPC SECURITY DEFINER (bypass RLS sem expor service_role)
  const supabase = getAnonClient()
  const { data: leadId, error } = await supabase.rpc('create_catalog_lead', {
    p_catalog_slug: body.catalogSlug,
    p_product_id:   body.productId,
    p_name:         name,
    p_contact:      contact,
    p_notes:        notes,
  })

  if (error) {
    console.error('[/api/catalog/quote] rpc error', error)
    // Erros de validação da RPC vêm com mensagens em PT-BR já formatadas
    const msg = error.message?.includes('Catálogo')  ? 'Catálogo não encontrado' :
                error.message?.includes('Produto')   ? 'Produto não pertence a este catálogo' :
                error.message ?? 'Erro ao salvar orçamento'
    const status = error.message?.includes('Catálogo') || error.message?.includes('Produto') ? 400 : 500
    return NextResponse.json({ error: msg }, { status })
  }

  return NextResponse.json({ success: true, leadId })
}
