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
import { quoteSchema, zodErrorToPtBr } from '@/services/apiSchemas'

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('[catalog/quote] Missing Supabase env vars')
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(req: NextRequest) {
  // Otávio (Security) 2026-05-16: validação Zod (com refine pra whatsapp || email)
  // bloqueia XSS no name/description, limita tamanhos, valida URL de referência.
  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido (JSON esperado)' }, { status: 400 })
  }

  const parsed = quoteSchema.safeParse(rawBody)
  if (!parsed.success) {
    const { message, fields } = zodErrorToPtBr(parsed.error)
    return NextResponse.json({ error: message, fields }, { status: 400 })
  }
  const { productId, catalogSlug, name, whatsapp, email, description, urgency, referenceUrl } = parsed.data

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
  const urgencyText = urgencyLabel[urgency] ?? 'Próximas semanas'

  // notes acumula urgência + ref + descrição (produto é resolvido server-side via RPC)
  const notesParts = [
    `Urgência: ${urgencyText}`,
    referenceUrl ? `Referência: ${referenceUrl}` : null,
    '',
    description,
  ].filter(Boolean)
  const notes = notesParts.join('\n')

  // Chama RPC SECURITY DEFINER (bypass RLS sem expor service_role)
  const supabase = getAnonClient()
  const { data: leadId, error } = await supabase.rpc('create_catalog_lead', {
    p_catalog_slug: catalogSlug,
    p_product_id:   productId,
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
