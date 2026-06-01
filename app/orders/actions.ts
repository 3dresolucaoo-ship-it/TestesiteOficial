'use server'

/**
 * app/orders/actions.ts — Server Actions pro modulo de Pedidos.
 *
 * Por que existe (descoberto 01/06/2026, validado em prod):
 * supabase.auth.getUser() do browser client trava 8-12s em Vercel Fluid Compute
 * cold-start (auth-js 2.106.0 _refreshAccessToken sincrono). Resultado:
 * ordersService.create/update/delete via syncAction NUNCA persistem em prod.
 *
 * Estrategia: WRITES de pedido via Server Actions cookie-based
 * (createServerClient funciona ok — SSR layout prova).
 *
 * Trade-off conhecido:
 * - Side effects automaticos do ADD_ORDER (auto-criar production task quando
 *   pedido tem product com print time, gerar transaction de receita, decrement
 *   de estoque) NAO sao replicados aqui. Eles vivem em core/flows/processOrder.ts
 *   e dependem da arquitetura legada. Maker precisa criar production task
 *   manualmente apos pedido por ora.
 *
 * Refactor estrutural (mover processOrder pra Server Action ou Edge Function):
 * Bloco 5 / ADR 030.
 *
 * Referencia decisao: ADR 031.
 */

import { createServerClient }      from '@/lib/supabaseServer'
import { revalidatePath }          from 'next/cache'
import { z }                       from 'zod'
import type { Order, OrderStatus, OrderOrigin, OrderSource } from '@/lib/types'

// ─── Schemas Zod ──────────────────────────────────────────────────────────────

const ORDER_STATUSES: readonly OrderStatus[] = ['lead', 'quote_sent', 'paid', 'delivered'] as const
const ORDER_ORIGINS:  readonly OrderOrigin[] = ['whatsapp', 'instagram', 'facebook', 'other'] as const

const CreateOrderSchema = z.object({
  id:               z.string().min(1),
  projectId:        z.string().min(1),
  clientName:       z.string().min(1, 'Nome do cliente obrigatorio'),
  origin:           z.enum(['whatsapp', 'instagram', 'facebook', 'other']),
  item:             z.string().min(1, 'Item obrigatorio'),
  value:            z.number().min(0),
  status:           z.enum(['lead', 'quote_sent', 'paid', 'delivered']),
  date:             z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve ser YYYY-MM-DD'),
  inventoryItemId:  z.string().optional(),
  qtyUsed:          z.number().optional(),
  productId:        z.string().optional(),
  productionCost:   z.number().optional(),
})

const UpdateOrderSchema = CreateOrderSchema.extend({
  // mesmo shape — update full row
})

const DeleteOrderSchema = z.object({
  id:        z.string().min(1),
  projectId: z.string().min(1),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthenticatedClient() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Nao autenticado')
  }
  return { supabase, userId: user.id }
}

// ─── Server Action: criar pedido standalone ───────────────────────────────────

export async function createOrder(
  rawInput: z.input<typeof CreateOrderSchema>,
): Promise<
  | { success: true; order: Order }
  | { success: false; error: string }
> {
  const parsed = CreateOrderSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') }
  }

  let supabase, userId
  try {
    ({ supabase, userId } = await getAuthenticatedClient())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const o = parsed.data
  const { error } = await supabase.from('orders').insert({
    id:                o.id,
    project_id:        o.projectId,
    user_id:           userId,
    client_name:       o.clientName,
    origin:            o.origin,
    item:              o.item,
    value:             o.value,
    status:            o.status,
    date:              o.date,
    inventory_item_id: o.inventoryItemId   ?? null,
    qty_used:          o.qtyUsed           ?? null,
    product_id:        o.productId         ?? null,
    production_cost:   o.productionCost    ?? null,
    source:            'manual' as OrderSource,
  })

  if (error) {
    return { success: false, error: `Erro Supabase: ${error.message}` }
  }

  revalidatePath('/orders')
  revalidatePath('/dashboard')

  const order: Order = {
    id:              o.id,
    projectId:       o.projectId,
    clientName:      o.clientName,
    origin:          o.origin as OrderOrigin,
    item:            o.item,
    value:           o.value,
    status:          o.status as OrderStatus,
    date:            o.date,
    inventoryItemId: o.inventoryItemId,
    qtyUsed:         o.qtyUsed,
    productId:       o.productId,
    productionCost:  o.productionCost,
    source:          'manual',
  }

  return { success: true, order }
}

// ─── Server Action: editar pedido ─────────────────────────────────────────────

export async function updateOrder(
  rawInput: z.input<typeof UpdateOrderSchema>,
): Promise<
  | { success: true; order: Order }
  | { success: false; error: string }
> {
  const parsed = UpdateOrderSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') }
  }

  let supabase, userId
  try {
    ({ supabase, userId } = await getAuthenticatedClient())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const o = parsed.data
  const { error } = await supabase
    .from('orders')
    .update({
      client_name:       o.clientName,
      origin:            o.origin,
      item:              o.item,
      value:             o.value,
      status:            o.status,
      date:              o.date,
      inventory_item_id: o.inventoryItemId   ?? null,
      qty_used:          o.qtyUsed           ?? null,
      product_id:        o.productId         ?? null,
      production_cost:   o.productionCost    ?? null,
    })
    .eq('id', o.id)
    .eq('user_id', userId)
    .eq('project_id', o.projectId)

  if (error) {
    return { success: false, error: `Erro ao atualizar pedido: ${error.message}` }
  }

  revalidatePath('/orders')
  revalidatePath('/dashboard')

  const order: Order = {
    id:              o.id,
    projectId:       o.projectId,
    clientName:      o.clientName,
    origin:          o.origin as OrderOrigin,
    item:            o.item,
    value:           o.value,
    status:          o.status as OrderStatus,
    date:            o.date,
    inventoryItemId: o.inventoryItemId,
    qtyUsed:         o.qtyUsed,
    productId:       o.productId,
    productionCost:  o.productionCost,
    source:          'manual',
  }

  return { success: true, order }
}

// ─── Server Action: deletar pedido ────────────────────────────────────────────

export async function deleteOrder(
  rawInput: z.input<typeof DeleteOrderSchema>,
): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  const parsed = DeleteOrderSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') }
  }

  let supabase, userId
  try {
    ({ supabase, userId } = await getAuthenticatedClient())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { id, projectId } = parsed.data
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .eq('project_id', projectId)

  if (error) {
    return { success: false, error: `Erro ao deletar pedido: ${error.message}` }
  }

  revalidatePath('/orders')
  revalidatePath('/dashboard')

  return { success: true }
}
