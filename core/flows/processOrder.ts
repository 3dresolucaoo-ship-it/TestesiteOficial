/**
 * Central order-processing flow.
 *
 * This module is the SINGLE source of truth for all business-logic side effects
 * triggered by order creation or payment.  No other layer (reducer, UI component,
 * background job) should directly create transactions or decrement inventory.
 *
 * Webhook handlers and the UI both call these functions — keeping the behaviour
 * identical regardless of how an order enters the system.
 */

import type { Order, Transaction, StockMovement, ProductionItem } from '@/lib/types'
import { ordersService }       from '@/services/orders'
import { productionService }   from '@/services/production'
import { transactionsService } from '@/services/finance'
import { inventoryService }    from '@/services/inventory'
import { productsService }     from '@/services/products'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

// ─── Return shape ─────────────────────────────────────────────────────────────

export interface InventoryDelta {
  /** The movement record that was persisted. */
  movement:          StockMovement
  /** ID of the affected item and its new quantity, for local-state patching. */
  updatedInventory:  { id: string; newQuantity: number }
}

export interface ProcessOrderResult {
  order:            Order
  productionTask?:  ProductionItem
  transaction?:     Transaction
  inventoryDelta?:  InventoryDelta
}

// ─── Shared helper: paid side effects ─────────────────────────────────────────

/**
 * Creates a finance transaction and (optionally) decrements inventory for a paid
 * order.  Called by both processNewOrder and processOrderUpdate.
 */
async function applyPaidSideEffects(
  order: Order,
): Promise<{ transaction: Transaction; inventoryDelta?: InventoryDelta }> {
  // ── Finance transaction ──────────────────────────────────────────────────
  const transaction: Transaction = {
    id:          `tx-${order.id}`,
    projectId:   order.projectId,
    type:        'income',
    category:    'product_sale',
    description: `Venda: ${order.clientName} — ${order.item}`,
    value:       order.value,
    date:        order.date,
    source:      order.origin,
  }
  // Idempotent — ignore duplicate-key errors (order can be re-marked paid via edit).
  // Any other error (constraint, RLS, network) is a real failure and must propagate.
  try {
    await transactionsService.create(transaction)
  } catch (err: unknown) {
    const pg = err as { code?: string }
    if (pg?.code !== '23505') throw err
  }

  // ── Inventory decrement ──────────────────────────────────────────────────
  let inventoryDelta: InventoryDelta | undefined

  if (order.productId) {
    // Product-template path: let the engine calculate exact material usage
    const product = await productsService.getById(order.productId)
    if (product) {
      const result = await inventoryService.decreaseFromProduct(product, 1, order)
      if (result) inventoryDelta = result
    }
  } else if (order.inventoryItemId) {
    // Manual path: use the quantity the user specified
    const result = await inventoryService.decreaseManual(
      order.inventoryItemId,
      order.qtyUsed ?? 1,
      order,
    )
    if (result) inventoryDelta = result
  }

  return { transaction, inventoryDelta }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Persist a brand-new order and all derived side effects in one coordinated
 * sequence of Supabase writes.
 *
 * Side effects triggered:
 *  • Production task — when order.productId is set
 *  • Finance transaction — when order.status === 'paid'
 *  • Inventory decrement — when paid and inventory is linked (via product or manual)
 *
 * The caller is responsible for dispatching the returned entities to the
 * in-memory store (rawDispatch) so the UI reflects the changes immediately.
 */
export async function processNewOrder(order: Order): Promise<ProcessOrderResult> {
  await ordersService.create(order)

  const result: ProcessOrderResult = { order }

  // ── Auto-schedule production task ──────────────────────────────────────────
  if (order.productId) {
    const product = await productsService.getById(order.productId)
    if (product) {
      const productionTask: ProductionItem = {
        id:             uid(),
        orderId:        order.id,
        clientName:     order.clientName,
        item:           product.name,
        printer:        'bambu',
        status:         'waiting',
        estimatedHours: product.printTimeHours,
        priority:       0,
      }
      await productionService.create(productionTask)
      result.productionTask = productionTask
    }
  }

  // ── Paid side effects (transaction + inventory) ────────────────────────────
  if (order.status === 'paid') {
    const { transaction, inventoryDelta } = await applyPaidSideEffects(order)
    result.transaction    = transaction
    result.inventoryDelta = inventoryDelta
  }

  return result
}

/**
 * Update an existing order and apply any side effects introduced by the change.
 *
 * Currently the only change that triggers new side effects is a status
 * transition to 'paid'.  All other edits only update the order row itself.
 *
 * The caller is responsible for dispatching the returned entities to the
 * in-memory store (rawDispatch) so the UI reflects the changes immediately.
 */
export async function processOrderUpdate(
  prevOrder:  Order,
  nextOrder:  Order,
): Promise<ProcessOrderResult> {
  await ordersService.update(nextOrder)

  const result: ProcessOrderResult = { order: nextOrder }

  const wasJustPaid = prevOrder.status !== 'paid' && nextOrder.status === 'paid'
  if (wasJustPaid) {
    const { transaction, inventoryDelta } = await applyPaidSideEffects(nextOrder)
    result.transaction    = transaction
    result.inventoryDelta = inventoryDelta
  }

  return result
}
