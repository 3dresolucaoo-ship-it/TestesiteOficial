import { supabase }        from '@/lib/supabaseClient'
import { serviceError, validateRequired } from '@/lib/serviceError'
import { requireUserId }   from '@/lib/getUser'
import type { Order }      from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDB(r: any): Order {
  return {
    id:               r.id,
    projectId:        r.project_id,
    clientName:       r.client_name,
    origin:           r.origin,
    item:             r.item,
    value:            Number(r.value),
    status:           r.status,
    date:             r.date,
    inventoryItemId:  r.inventory_item_id  ?? undefined,
    qtyUsed:          r.qty_used      != null ? Number(r.qty_used)       : undefined,
    productId:        r.product_id         ?? undefined,
    productionCost:   r.production_cost != null ? Number(r.production_cost) : undefined,
    // e-commerce fields
    source:           r.source            ?? undefined,
    catalogSlug:      r.catalog_slug      ?? undefined,
    paymentId:        r.payment_id        ?? undefined,
    paymentStatus:    r.payment_status    ?? undefined,
    customerWhatsapp: r.customer_whatsapp ?? undefined,
    // CRM traceability
    sourceLeadId:     r.source_lead_id    ?? undefined,
  }
}

function toDB(o: Order, userId: string) {
  return {
    id:                o.id,
    project_id:        o.projectId,
    client_name:       o.clientName,
    origin:            o.origin,
    item:              o.item,
    value:             o.value,
    status:            o.status,
    date:              o.date,
    inventory_item_id: o.inventoryItemId  ?? null,
    qty_used:          o.qtyUsed          ?? null,
    product_id:        o.productId        ?? null,
    production_cost:   o.productionCost   ?? null,
    user_id:           userId,
    // e-commerce fields
    source:            o.source            ?? null,
    catalog_slug:      o.catalogSlug       ?? null,
    payment_id:        o.paymentId         ?? null,
    payment_status:    o.paymentStatus     ?? null,
    customer_whatsapp: o.customerWhatsapp  ?? null,
    // CRM traceability
    source_lead_id:    o.sourceLeadId      ?? null,
  }
}

export const ordersService = {
  /**
   * Busca pedidos do usuário.
   * Quando projectId é fornecido (obrigatório em contextos multi-tenant como o dashboard V4),
   * filtra por projeto. O store legado omite projectId e recebe todos os projetos do user —
   * a filtragem nesse caso fica na UI via state.orders.filter(o => o.projectId === id).
   * TODO: migrar store.tsx loadFromSupabase para passar projectId quando V4 substituir o store.
   */
  async getAll(projectId?: string): Promise<Order[]> {
    const userId = await requireUserId()
    let query = supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
    if (projectId) {
      query = query.eq('project_id', projectId)
    }
    const { data, error } = await query.order('date', { ascending: false })
    if (error) serviceError('ordersService.getAll', error)
    return (data ?? []).map(fromDB)
  },

async create(o: Order): Promise<void> {
  validateRequired('ordersService.create', {
    id: o.id, projectId: o.projectId, clientName: o.clientName, item: o.item,
  })
  const userId = await requireUserId()
  const { error } = await supabase.from('orders').insert(toDB(o, userId))
  if (error) serviceError('ordersService.create', error)
},

  async update(o: Order): Promise<void> {
    validateRequired('ordersService.update', { id: o.id })
    const userId = await requireUserId()
    const { error } = await supabase
      .from('orders')
      .update(toDB(o, userId))
      .eq('id', o.id)
      .eq('user_id', userId)
      .eq('project_id', o.projectId)
    if (error) serviceError('ordersService.update', error)
  },

  async delete(id: string, projectId: string): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .eq('project_id', projectId)
    if (error) serviceError('ordersService.delete', error)
  },
}
