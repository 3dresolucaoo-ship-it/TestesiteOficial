/**
 * POST /api/encomenda
 *
 * Registra um pedido sob encomenda (produto fora de estoque).
 * Cria um Order com status 'lead' no banco — visível em /orders.
 *
 * Body: { productId, catalogSlug, customerName, whatsapp, quantity }
 * Response: { success: true }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin }          from '@/lib/supabaseAdmin'
import { encomendaSchema, zodErrorToPtBr } from '@/services/apiSchemas'
import { enforceApiRateLimit, getClientIp } from '@/services/apiRateLimit'

export async function POST(req: NextRequest) {
  try {
    // Otávio (Security) 2026-05-17: rate-limit DB-based — 20 req/min por IP.
    // Bloqueia flood de pedidos lead fake. Fail-OPEN se DB cair.
    const rl = await enforceApiRateLimit({
      endpoint: 'encomenda',
      ip:       getClientIp(req),
      limit:    20,
      windowMs: 60_000,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde um momento e tente novamente.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
      )
    }

    // Otávio (Security) 2026-05-16: validação Zod bloqueia XSS + limita payload
    const rawBody = await req.json()
    const parsed = encomendaSchema.safeParse(rawBody)
    if (!parsed.success) {
      const { message, fields } = zodErrorToPtBr(parsed.error)
      return NextResponse.json({ error: message, fields }, { status: 400 })
    }
    const { productId, catalogSlug, customerName, whatsapp, quantity } = parsed.data

    const admin = getSupabaseAdmin()

    // Busca catálogo → project_id + user_id
    const { data: catalog } = await admin
      .from('catalogs')
      .select('id, user_id, project_id')
      .eq('slug', catalogSlug)
      .eq('is_public', true)
      .maybeSingle()

    if (!catalog) {
      return NextResponse.json({ error: 'Catálogo não encontrado.' }, { status: 400 })
    }

    // Busca produto → nome + preço
    const { data: product } = await admin
      .from('products')
      .select('id, name, sale_price')
      .eq('id', productId)
      .maybeSingle()

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 400 })
    }

    const salePrice = Number(product.sale_price ?? 0)

    // Cria o pedido como 'lead' — vendedor precisa confirmar e produzir
    const { error: insertErr } = await admin.from('orders').insert({
      id:               crypto.randomUUID(),
      project_id:       catalog.project_id,
      user_id:          catalog.user_id,
      client_name:      customerName,
      origin:           'whatsapp',
      item:             `${product.name}${quantity > 1 ? ` (x${quantity})` : ''}`,
      value:            salePrice * quantity,
      status:           'lead',
      date:             new Date().toISOString().split('T')[0],
      product_id:       productId,
      source:           'catalog',
      catalog_slug:     catalogSlug,
      customer_whatsapp: whatsapp,
      payment_status:   'pending',
    })

    if (insertErr) {
      console.error('[/api/encomenda] insert error:', insertErr)
      return NextResponse.json({ error: 'Erro ao registrar pedido.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[/api/encomenda]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
