import { supabase } from '@/lib/supabaseClient'
import { serviceError, validateRequired } from '@/lib/serviceError'
import { requireUserId } from '@/lib/getUser'
import type { InventoryItem, StockMovement, Order } from '@/lib/types'
import type { Product } from '@/core/products/types'

// ─── Inventory items ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function itemFromDB(r: any): InventoryItem {
  return {
    id:          r.id,
    projectId:   r.project_id,
    category:    r.category,
    name:        r.name,
    sku:         r.sku ?? '',
    quantity:    Number(r.quantity ?? 0),
    unit:        r.unit ?? 'un',
    costPrice:   Number(r.cost_price ?? 0),
    salePrice:   Number(r.sale_price ?? 0),
    notes:       r.notes ?? '',
    minStock:    r.min_stock != null ? Number(r.min_stock) : undefined,
    imageUrl:    r.image_url ?? undefined,
    filamentUso: r.filament_uso ?? undefined,
  }
}

function itemToDB(i: InventoryItem, userId: string) {
  return {
    id:           i.id,
    project_id:   i.projectId,
    category:     i.category,
    name:         i.name,
    sku:          i.sku,
    quantity:     i.quantity,
    unit:         i.unit,
    cost_price:   i.costPrice,
    sale_price:   i.salePrice,
    notes:        i.notes,
    min_stock:    i.minStock ?? null,
    image_url:    i.imageUrl ?? null,
    filament_uso: i.filamentUso ?? null,
    user_id:      userId,
  }
}

export const inventoryService = {
  async getAll(): Promise<InventoryItem[]> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId)
      .order('name')
    if (error) serviceError('inventoryService.getAll', error)
    return (data ?? []).map(itemFromDB)
  },

  async create(i: InventoryItem): Promise<void> {
    validateRequired('inventoryService.create', {
      id: i.id, projectId: i.projectId, name: i.name,
    })
    const userId = await requireUserId()
    const { error } = await supabase.from('inventory').insert(itemToDB(i, userId))
    if (error) serviceError('inventoryService.create', error)
  },

  async update(i: InventoryItem): Promise<void> {
    validateRequired('inventoryService.update', { id: i.id })
    const userId = await requireUserId()
    const { error } = await supabase
      .from('inventory')
      .update(itemToDB(i, userId))
      .eq('id', i.id)
      .eq('user_id', userId)
    if (error) serviceError('inventoryService.update', error)
  },

  async delete(id: string): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) serviceError('inventoryService.delete', error)
  },

  /** Patch only the quantity field (used for stock adjustments). */
  async setQuantity(id: string, quantity: number): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('inventory')
      .update({ quantity })
      .eq('id', id)
      .eq('user_id', userId)
    if (error) serviceError('inventoryService.setQuantity', error)
  },

  /**
   * Decrease inventory from a product template.
   *
   * materialUsed = product.materialGrams × quantity × (1 + product.failureRate)
   *
   * Converts grams to the inventory item's unit (g or kg) automatically.
   * Returns the movement record and the post-decrement inventory snapshot.
   * Returns null if the product has no linked inventory item.
   */
  async decreaseFromProduct(
    product:  Product,
    quantity: number,
    order:    Pick<Order, 'id' | 'projectId' | 'clientName' | 'item' | 'date'>,
  ): Promise<{ movement: StockMovement; updatedInventory: { id: string; newQuantity: number } } | null> {
    if (!product.inventoryItemId) return null

    const userId = await requireUserId()

    const { data: row, error: fetchErr } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', product.inventoryItemId)
      .eq('user_id', userId)
      .maybeSingle()
    if (fetchErr) serviceError('inventoryService.decreaseFromProduct (fetch)', fetchErr)
    if (!row) return null

    const item = itemFromDB(row)

    // Material used including failure waste (in grams)
    const materialUsedGrams = product.materialGrams * quantity * (1 + product.failureRate)

    // Convert to the inventory item's native unit
    const decreaseAmount = item.unit === 'kg'
      ? Math.round((materialUsedGrams / 1000) * 1000) / 1000
      : Math.round(materialUsedGrams * 1000) / 1000   // grams (or other unit — use as-is)

    const newQuantity = Math.max(0, item.quantity - decreaseAmount)

    const { error: updateErr } = await supabase
      .from('inventory')
      .update({ quantity: newQuantity })
      .eq('id', item.id)
      .eq('user_id', userId)
    if (updateErr) serviceError('inventoryService.decreaseFromProduct (update)', updateErr)

    const movement: StockMovement = {
      id:        `mv${Date.now().toString(36)}`,
      projectId: item.projectId,
      itemId:    item.id,
      type:      'out',
      quantity:  decreaseAmount,
      reason:    'sale',
      orderId:   order.id,
      date:      order.date,
      notes:     `Produção: ${product.name} × ${quantity} — pedido ${order.clientName}`,
    }

    const { error: mvErr } = await supabase
      .from('movements')
      .insert(mvToDB(movement, userId))
    if (mvErr) serviceError('inventoryService.decreaseFromProduct (movement)', mvErr)

    return { movement, updatedInventory: { id: item.id, newQuantity } }
  },

  /**
   * Manually decrease inventory by a fixed quantity.
   * Used when an order has a manual inventoryItemId link (no product template).
   */
  async decreaseManual(
    itemId:   string,
    qty:      number,
    order:    Pick<Order, 'id' | 'projectId' | 'clientName' | 'item' | 'date'>,
  ): Promise<{ movement: StockMovement; updatedInventory: { id: string; newQuantity: number } } | null> {
    const userId = await requireUserId()

    const { data: row, error: fetchErr } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', itemId)
      .eq('user_id', userId)
      .maybeSingle()
    if (fetchErr) serviceError('inventoryService.decreaseManual (fetch)', fetchErr)
    if (!row) return null

    const item = itemFromDB(row)
    const newQuantity = Math.max(0, item.quantity - qty)

    const { error: updateErr } = await supabase
      .from('inventory')
      .update({ quantity: newQuantity })
      .eq('id', item.id)
      .eq('user_id', userId)
    if (updateErr) serviceError('inventoryService.decreaseManual (update)', updateErr)

    const movement: StockMovement = {
      id:        `mv${Date.now().toString(36)}`,
      projectId: item.projectId,
      itemId:    item.id,
      type:      'out',
      quantity:  qty,
      reason:    'sale',
      orderId:   order.id,
      date:      order.date,
      notes:     `Venda: ${order.clientName} — ${order.item}`,
    }

    const { error: mvErr } = await supabase
      .from('movements')
      .insert(mvToDB(movement, userId))
    if (mvErr) serviceError('inventoryService.decreaseManual (movement)', mvErr)

    return { movement, updatedInventory: { id: item.id, newQuantity } }
  },
}

// ─── Stock movements ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mvFromDB(r: any): StockMovement {
  return {
    id:        r.id,
    projectId: r.project_id,
    itemId:    r.item_id,
    type:      r.type,
    quantity:  Number(r.quantity),
    reason:    r.reason,
    orderId:   r.order_id ?? undefined,
    date:      r.date,
    notes:     r.notes ?? '',
  }
}

function mvToDB(m: StockMovement, userId: string) {
  return {
    id:         m.id,
    project_id: m.projectId,
    item_id:    m.itemId,
    type:       m.type,
    quantity:   m.quantity,
    reason:     m.reason,
    order_id:   m.orderId ?? null,
    date:       m.date,
    notes:      m.notes,
    user_id:    userId,
  }
}

export const movementsService = {
  async getAll(): Promise<StockMovement[]> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('movements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) serviceError('movementsService.getAll', error)
    return (data ?? []).map(mvFromDB)
  },

  async create(m: StockMovement): Promise<void> {
    validateRequired('movementsService.create', {
      id: m.id, projectId: m.projectId, itemId: m.itemId,
    })
    const userId = await requireUserId()
    const { error } = await supabase.from('movements').insert(mvToDB(m, userId))
    if (error) serviceError('movementsService.create', error)
  },

  async delete(id: string): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('movements')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) serviceError('movementsService.delete', error)
  },
}
