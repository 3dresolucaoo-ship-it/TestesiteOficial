/**
 * Reconciliação orders ↔ transactions.
 *
 * Para cada order com status='paid' do usuário autenticado, garante que
 * exista uma transaction `tx-${orderId}` correspondente. Cria as faltantes.
 *
 * Idempotente — pode ser executado quantas vezes quiser. Usa o ID determinístico
 * `tx-${orderId}` exatamente como `core/flows/processOrder.ts` faz, garantindo
 * que orders já reconciliados não sejam duplicados (UNIQUE constraint no id).
 */

import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { createServerClient } from '@/lib/supabaseServer'

interface ReconcileResult {
  scanned: number
  alreadyOk: number
  created: number
  failed: number
  errors: string[]
}

export async function POST() {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServerClient()
  const result: ReconcileResult = {
    scanned: 0,
    alreadyOk: 0,
    created: 0,
    failed: 0,
    errors: [],
  }

  // 1. Pega todos os orders pagos do usuário
  const { data: paidOrders, error: ordersErr } = await supabase
    .from('orders')
    .select('id, project_id, client_name, item, value, date, origin')
    .eq('user_id', user.id)
    .eq('status', 'paid')

  if (ordersErr) {
    return NextResponse.json(
      { error: `Failed to fetch orders: ${ordersErr.message}` },
      { status: 500 },
    )
  }

  result.scanned = paidOrders?.length ?? 0
  if (result.scanned === 0) {
    return NextResponse.json({ result, message: 'Nenhum pedido pago encontrado.' })
  }

  // 2. Pega todas transactions com id começando com `tx-` do usuário
  const expectedIds = paidOrders!.map(o => `tx-${o.id}`)
  const { data: existing, error: txErr } = await supabase
    .from('transactions')
    .select('id')
    .eq('user_id', user.id)
    .in('id', expectedIds)

  if (txErr) {
    return NextResponse.json(
      { error: `Failed to fetch transactions: ${txErr.message}` },
      { status: 500 },
    )
  }

  const existingIds = new Set((existing ?? []).map(t => t.id))
  result.alreadyOk = existingIds.size

  // 3. Cria as faltantes
  const missing = paidOrders!.filter(o => !existingIds.has(`tx-${o.id}`))

  for (const order of missing) {
    const txRow = {
      id:          `tx-${order.id}`,
      project_id:  order.project_id,
      type:        'income',
      category:    'product_sale',
      description: `Venda: ${order.client_name} — ${order.item}`,
      value:       Number(order.value),
      date:        order.date,
      source:      order.origin ?? '',
      user_id:     user.id,
    }

    const { error } = await supabase.from('transactions').insert(txRow)

    if (error) {
      // 23505 = unique violation = já existe (race condition) — conta como ok
      if (error.code === '23505') {
        result.alreadyOk++
      } else {
        result.failed++
        result.errors.push(`Order ${order.id}: ${error.message}`)
      }
    } else {
      result.created++
    }
  }

  return NextResponse.json({
    result,
    message: result.created > 0
      ? `${result.created} transação(ões) criada(s) a partir de pedidos pagos.`
      : 'Tudo em dia. Nenhum pedido órfão encontrado.',
  })
}
