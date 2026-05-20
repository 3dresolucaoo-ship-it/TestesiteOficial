import { supabase }        from '@/lib/supabaseClient'
import { serviceError, validateRequired } from '@/lib/serviceError'
import { requireUserId }   from '@/lib/getUser'
import type { Lead, Affiliate, Order, OrderOrigin } from '@/lib/types'
import { uid }             from '@/lib/store'

// ─── Leads ────────────────────────────────────────────────────────────────────

/**
 * Mapeador mínimo row DB → Order, usado apenas dentro de convertToOrder.
 * O mapeador canônico vive em services/orders.ts — não importamos de lá
 * para evitar dependência circular (leads → orders → ...).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function orderFromDB(r: any): Order {
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
    qtyUsed:          r.qty_used != null ? Number(r.qty_used) : undefined,
    productId:        r.product_id         ?? undefined,
    productionCost:   r.production_cost != null ? Number(r.production_cost) : undefined,
    source:           r.source             ?? undefined,
    catalogSlug:      r.catalog_slug       ?? undefined,
    paymentId:        r.payment_id         ?? undefined,
    paymentStatus:    r.payment_status     ?? undefined,
    customerWhatsapp: r.customer_whatsapp  ?? undefined,
    sourceLeadId:     r.source_lead_id     ?? undefined,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function leadFromDB(r: any): Lead {
  return {
    id:               r.id,
    projectId:        r.project_id,
    name:             r.name,
    contact:          r.contact      ?? '',
    source:           r.source,
    status:           r.status,
    value:            Number(r.value ?? 0),
    notes:            r.notes        ?? '',
    date:             r.date,
    lastContactAt:    r.last_contact_at    ?? undefined,
    expectedValue:    r.expected_value != null ? Number(r.expected_value) : undefined,
    assignedTo:       r.assigned_to        ?? undefined,
    convertedOrderId: r.converted_order_id ?? undefined,
  }
}

function leadToDB(l: Lead, userId: string) {
  return {
    id:                 l.id,
    project_id:         l.projectId,
    name:               l.name,
    contact:            l.contact,
    source:             l.source,
    status:             l.status,
    value:              l.value,
    notes:              l.notes,
    date:               l.date,
    last_contact_at:    l.lastContactAt    ?? null,
    expected_value:     l.expectedValue    ?? null,
    assigned_to:        l.assignedTo       ?? null,
    converted_order_id: l.convertedOrderId ?? null,
    user_id:            userId,
  }
}

export const leadsService = {
  /**
   * Busca leads do usuário.
   * Quando projectId é fornecido (obrigatório em contextos multi-tenant como o dashboard V4),
   * filtra por projeto. O store legado omite projectId e recebe todos os projetos do user.
   * TODO: migrar store.tsx loadFromSupabase para passar projectId quando V4 substituir o store.
   */
  async getAll(projectId?: string): Promise<Lead[]> {
    const userId = await requireUserId()
    let query = supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
    if (projectId) {
      query = query.eq('project_id', projectId)
    }
    const { data, error } = await query.order('date', { ascending: false })
    if (error) serviceError('leadsService.getAll', error)
    return (data ?? []).map(leadFromDB)
  },

  async create(l: Lead): Promise<void> {
    validateRequired('leadsService.create', { id: l.id, projectId: l.projectId, name: l.name })
    const userId = await requireUserId()
    const { error } = await supabase.from('leads').insert(leadToDB(l, userId))
    if (error) serviceError('leadsService.create', error)
  },

  async update(l: Lead): Promise<void> {
    validateRequired('leadsService.update', { id: l.id })
    const userId = await requireUserId()
    const { error } = await supabase
      .from('leads')
      .update(leadToDB(l, userId))
      .eq('id', l.id)
      .eq('user_id', userId)
      .eq('project_id', l.projectId)
    if (error) serviceError('leadsService.update', error)
  },

  async delete(id: string, projectId: string): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .eq('project_id', projectId)
    if (error) serviceError('leadsService.delete', error)
  },

  /**
   * Converte um lead em pedido de forma atômica.
   *
   * Idempotência: se o lead já tem convertedOrderId e o pedido existe, devolve
   * o pedido existente sem criar duplicata.
   *
   * Fluxo:
   *   1. Busca lead (guard user_id + project_id)
   *   2. Se já convertido → retorna { order, alreadyConverted: true }
   *   3. Insere pedido com source_lead_id = leadId
   *   4. Atualiza lead: converted_order_id = orderId, status = 'won'
   *
   * @param leadId       ID do lead
   * @param projectId    project_id do lead (multi-tenant guard)
   * @param partialOrder Campos adicionais vindos do form (item, value, status, date, etc.)
   */
  async convertToOrder(
    leadId: string,
    projectId: string,
    partialOrder: Partial<Pick<Order, 'item' | 'value' | 'status' | 'date' | 'inventoryItemId' | 'qtyUsed' | 'productId'>>,
  ): Promise<{ order: Order; alreadyConverted: boolean }> {
    validateRequired('leadsService.convertToOrder', { leadId, projectId })

    const userId = await requireUserId()

    // 1. Busca lead com guard multi-tenant
    const { data: leadRow, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .single()

    if (fetchError) serviceError('leadsService.convertToOrder.fetch', fetchError)
    if (!leadRow) throw new Error('[leadsService.convertToOrder] Lead not found')

    const lead = leadFromDB(leadRow)

    // 2. Idempotência: lead já convertido → tenta devolver o pedido existente
    if (lead.convertedOrderId) {
      const { data: existingRow } = await supabase
        .from('orders')
        .select('*')
        .eq('id', lead.convertedOrderId)
        .eq('user_id', userId)
        .single()

      if (existingRow) {
        return { order: orderFromDB(existingRow), alreadyConverted: true }
      }
      // Pedido foi deletado: prossegue criando novo
    }

    // 3. Mapeia ContactSource → OrderOrigin
    const originMap: Record<string, OrderOrigin> = {
      whatsapp:  'whatsapp',
      instagram: 'instagram',
      facebook:  'facebook',
      shopee:    'other',
      referral:  'other',
      catalog:   'other',
      other:     'other',
    }

    const orderId = uid()
    const today   = new Date().toISOString().slice(0, 10)

    // Extrai whatsapp do contato se o campo parecer ser um número
    const whatsappContact   = lead.contact.replace(/\D/g, '')
    const customerWhatsapp  = whatsappContact.length >= 8 ? whatsappContact : undefined

    const newOrder: Order = {
      id:              orderId,
      projectId:       lead.projectId,
      clientName:      lead.name,
      origin:          originMap[lead.source] ?? 'other',
      item:            partialOrder.item   ?? '',
      value:           partialOrder.value  ?? lead.value,
      status:          partialOrder.status ?? 'lead',
      date:            partialOrder.date   ?? today,
      inventoryItemId: partialOrder.inventoryItemId,
      qtyUsed:         partialOrder.qtyUsed,
      productId:       partialOrder.productId,
      source:          'manual',
      customerWhatsapp,
      sourceLeadId:    leadId,
    }

    // 4a. Insere pedido com source_lead_id (campo da migration 20260520_leads_converted_order)
    const { error: insertError } = await supabase.from('orders').insert({
      id:                newOrder.id,
      project_id:        newOrder.projectId,
      client_name:       newOrder.clientName,
      origin:            newOrder.origin,
      item:              newOrder.item,
      value:             newOrder.value,
      status:            newOrder.status,
      date:              newOrder.date,
      inventory_item_id: newOrder.inventoryItemId  ?? null,
      qty_used:          newOrder.qtyUsed           ?? null,
      product_id:        newOrder.productId         ?? null,
      source:            'manual',
      customer_whatsapp: newOrder.customerWhatsapp  ?? null,
      source_lead_id:    leadId,
      user_id:           userId,
    })
    if (insertError) serviceError('leadsService.convertToOrder.insertOrder', insertError)

    // 4b. Atualiza lead: convertido + won
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        converted_order_id: orderId,
        status:             'won',
      })
      .eq('id', leadId)
      .eq('user_id', userId)
      .eq('project_id', projectId)

    if (updateError) serviceError('leadsService.convertToOrder.updateLead', updateError)

    return { order: newOrder, alreadyConverted: false }
  },
}

// ─── Affiliates ───────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function affFromDB(r: any): Affiliate {
  return {
    id:         r.id,
    projectId:  r.project_id,
    name:       r.name,
    platform:   r.platform   ?? '',
    code:       r.code       ?? '',
    totalSales: Number(r.total_sales ?? 0),
    commission: Number(r.commission  ?? 15),
    status:     r.status,
    date:       r.date,
  }
}

function affToDB(a: Affiliate, userId: string) {
  return {
    id:          a.id,
    project_id:  a.projectId,
    name:        a.name,
    platform:    a.platform,
    code:        a.code,
    total_sales: a.totalSales,
    commission:  a.commission,
    status:      a.status,
    date:        a.date,
    user_id:     userId,
  }
}

export const affiliatesService = {
  /**
   * Busca afiliados do usuário.
   * Quando projectId é fornecido (obrigatório em contextos multi-tenant como o dashboard V4),
   * filtra por projeto. O store legado omite projectId e recebe todos os projetos do user.
   * TODO: migrar store.tsx loadFromSupabase para passar projectId quando V4 substituir o store.
   */
  async getAll(projectId?: string): Promise<Affiliate[]> {
    const userId = await requireUserId()
    let query = supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', userId)
    if (projectId) {
      query = query.eq('project_id', projectId)
    }
    const { data, error } = await query.order('date', { ascending: false })
    if (error) serviceError('affiliatesService.getAll', error)
    return (data ?? []).map(affFromDB)
  },

  async create(a: Affiliate): Promise<void> {
    validateRequired('affiliatesService.create', { id: a.id, projectId: a.projectId, name: a.name })
    const userId = await requireUserId()
    const { error } = await supabase.from('affiliates').insert(affToDB(a, userId))
    if (error) serviceError('affiliatesService.create', error)
  },

  async update(a: Affiliate): Promise<void> {
    validateRequired('affiliatesService.update', { id: a.id })
    const userId = await requireUserId()
    const { error } = await supabase
      .from('affiliates')
      .update(affToDB(a, userId))
      .eq('id', a.id)
      .eq('user_id', userId)
      .eq('project_id', a.projectId)
    if (error) serviceError('affiliatesService.update', error)
  },

  async delete(id: string, projectId: string): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('affiliates')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .eq('project_id', projectId)
    if (error) serviceError('affiliatesService.delete', error)
  },
}
