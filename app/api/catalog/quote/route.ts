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
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

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

function genId() {
  return `lead-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
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

  const supabase = getSupabaseAdmin()

  // 1. Resolve catálogo (precisa do user_id e project_id pra criar o Lead)
  const { data: catalog, error: catErr } = await supabase
    .from('catalogs')
    .select('id, user_id, project_id, name')
    .eq('slug', body.catalogSlug)
    .maybeSingle()

  if (catErr) {
    console.error('[/api/catalog/quote] catalog lookup error', catErr)
    return NextResponse.json({ error: 'Erro ao buscar catálogo' }, { status: 500 })
  }
  if (!catalog) {
    return NextResponse.json({ error: 'Catálogo não encontrado' }, { status: 404 })
  }

  // 2. Resolve produto (validação + busca do nome pra incluir no Lead)
  const { data: product, error: prodErr } = await supabase
    .from('products')
    .select('id, name, user_id')
    .eq('id', body.productId)
    .eq('user_id', catalog.user_id)
    .maybeSingle()

  if (prodErr) {
    console.error('[/api/catalog/quote] product lookup error', prodErr)
    return NextResponse.json({ error: 'Erro ao buscar produto' }, { status: 500 })
  }
  if (!product) {
    return NextResponse.json({ error: 'Produto não pertence a este catálogo' }, { status: 400 })
  }

  // 3. Monta contato em uma string só (CRM atual usa campo único)
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

  // 4. Notes acumula tudo (descrição + urgência + ref + produto)
  const notesParts = [
    `Produto: ${product.name}`,
    `Urgência: ${urgency}`,
    body.referenceUrl ? `Referência: ${body.referenceUrl}` : null,
    '',
    description,
  ].filter(Boolean)
  const notes = notesParts.join('\n')

  // 5. Cria Lead via admin client (bypass RLS — endpoint público)
  const leadRow = {
    id:         genId(),
    user_id:    catalog.user_id,
    project_id: catalog.project_id,
    name,
    contact,
    source:     'catalog',
    status:     'new',
    value:      0,
    notes,
    date:       new Date().toISOString().slice(0, 10),
  }

  const { error: insErr } = await supabase.from('leads').insert(leadRow)
  if (insErr) {
    console.error('[/api/catalog/quote] insert lead error', insErr)
    return NextResponse.json({ error: 'Erro ao salvar orçamento' }, { status: 500 })
  }

  return NextResponse.json({ success: true, leadId: leadRow.id })
}
