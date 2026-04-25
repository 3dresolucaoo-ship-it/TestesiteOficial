/**
 * Admin-client order processing flow — webhook use only.
 *
 * Mirrors the logic of processNewOrder (core/flows/processOrder.ts) but:
 *   - Uses the Supabase admin client (service role key) instead of requireUserId()
 *   - Accepts merchantId explicitly as the DB owner of all inserted rows
 *   - Enforces idempotency via payment_id before any insert
 *   - Does NOT decrement inventory (stock reduces only when production → done)
 *   - Returns void — no UI dispatch needed in webhook context
 *
 * Column mappings are kept in sync with the toDB() functions in each service
 * file (services/orders.ts, services/production.ts, services/finance.ts).
 * If those mappings change, update here accordingly.
 */

import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import type { Order } from '@/lib/types'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Persist a catalog order and its side effects using the admin client.
 *
 * @param order      - fully constructed Order (source='catalog', status='paid',
 *                     paymentId set, customerWhatsapp set)
 * @param merchantId - user_id of the catalog owner; becomes the DB user_id on
 *                     all inserted rows, replacing the cookie-session user
 *
 * Side effects (in order):
 *   1. Idempotency guard — aborts if paymentId already exists in orders table
 *   2. Insert order row
 *   3. Insert production task (if order.productId is set)
 *   4. Insert finance transaction (income / product_sale)
 */
export async function processNewOrderAdmin(
  order: Order,
  merchantId: string,
): Promise<void> {
  const admin = getSupabaseAdmin()

  // Reusable context string for all log messages — enables grep-based reconciliation
  const ctx = [
    `orderId=${order.id}`,
    `merchantId=${merchantId}`,
    `paymentId=${order.paymentId ?? 'n/a'}`,
    `productId=${order.productId ?? 'n/a'}`,
    `catalogSlug=${order.catalogSlug ?? 'n/a'}`,
  ].join(' | ')

  // ── 1. Idempotency guard (application-level) ───────────────────────────────
  // The UNIQUE constraint on payment_id is the DB-level guarantee.
  // This check is the early-exit fast path to avoid unnecessary writes.
  if (order.paymentId) {
    const { data: existing } = await admin
      .from('orders')
      .select('id')
      .eq('payment_id', order.paymentId)
      .maybeSingle()

    if (existing) {
      console.warn(`[processOrderAdmin] Duplicate paymentId — skipping. ${ctx} | existingOrderId=${existing.id}`)
      return
    }
  }

  // ── 2. Insert order ────────────────────────────────────────────────────────
  // Mirrors toDB() in services/orders.ts — keep in sync if columns change.
  const orderRow = {
    id:                order.id,
    project_id:        order.projectId,
    client_name:       order.clientName,
    origin:            order.origin,
    item:              order.item,
    value:             order.value,
    status:            order.status,
    date:              order.date,
    inventory_item_id: order.inventoryItemId  ?? null,
    qty_used:          order.qtyUsed          ?? null,
    product_id:        order.productId        ?? null,
    production_cost:   order.productionCost   ?? null,
    // e-commerce fields
    source:            order.source           ?? null,
    catalog_slug:      order.catalogSlug      ?? null,
    payment_id:        order.paymentId        ?? null,
    payment_status:    order.paymentStatus    ?? null,
    customer_whatsapp: order.customerWhatsapp ?? null,
    // explicit user_id — bypasses RLS via admin client
    user_id:           merchantId,
  }

  const { error: orderErr } = await admin.from('orders').insert(orderRow)

  if (orderErr) {
    // 23505 = unique_violation — race condition, second webhook for same payment
    if (orderErr.code === '23505') {
      console.warn(`[processOrderAdmin] Race condition on payment_id UNIQUE — already inserted. ${ctx}`)
      return
    }
    throw new Error(`[processOrderAdmin] Failed to insert order: ${orderErr.message} | ${ctx}`)
  }

  // ── 3. Production task ─────────────────────────────────────────────────────
  // Mirrors toDB() in services/production.ts.
  // Non-fatal: if this fails the order is already committed; admin can retry.
  if (order.productId) {
    const { data: product } = await admin
      .from('products')
      .select('name, print_time_hours')
      .eq('id', order.productId)
      .maybeSingle()

    if (product) {
      const productionRow = {
        id:              uid(),
        order_id:        order.id,
        client_name:     order.clientName,
        item:            product.name,
        printer:         'bambu',
        status:          'waiting',
        estimated_hours: Number(product.print_time_hours ?? 0),
        priority:        0,
        user_id:         merchantId,
      }

      const { error: prodErr } = await admin.from('production').insert(productionRow)
      if (prodErr) {
        console.error(
          `[processOrderAdmin] Production task failed (non-fatal) — reprocess manually. ${ctx} | error=${prodErr.message}`,
        )
      }
    } else {
      console.warn(
        `[processOrderAdmin] Product not found for production task — skipping. ${ctx}`,
      )
    }
  }

  // ── 4. Finance transaction ─────────────────────────────────────────────────
  // Mirrors toDB() in services/finance.ts.
  // Idempotent: duplicate key (23505) is silently ignored — tx-{orderId} is unique.
  const transactionRow = {
    id:          `tx-${order.id}`,
    project_id:  order.projectId,
    type:        'income',
    category:    'product_sale',
    description: `Venda: ${order.clientName} — ${order.item}`,
    value:       order.value,
    date:        order.date,
    source:      order.origin,
    user_id:     merchantId,
  }

  const { error: txErr } = await admin.from('transactions').insert(transactionRow)
  if (txErr && txErr.code !== '23505') {
    // Non-fatal: transaction missed but order is committed. Log for reconciliation.
    console.error(
      `[processOrderAdmin] Transaction failed (non-fatal) — reprocess manually. ${ctx} | error=${txErr.message}`,
    )
  }

  console.info(`[processOrderAdmin] Order created OK | ${ctx}`)
}
