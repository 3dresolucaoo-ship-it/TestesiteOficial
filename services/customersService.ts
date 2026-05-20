import { supabase }                               from '@/lib/supabaseClient'
import { serviceError, validateRequired }          from '@/lib/serviceError'
import { requireUserId }                           from '@/lib/getUser'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Customer {
  id:         string
  projectId:  string
  name:       string
  whatsapp:   string | null
  email:      string | null
  notes:      string
  createdAt:  string
  updatedAt:  string
}

export interface CreateCustomerInput {
  name:      string
  whatsapp?: string | null
  email?:    string | null
  notes?:    string
}

export interface UpdateCustomerInput {
  name?:     string
  whatsapp?: string | null
  email?:    string | null
  notes?:    string
}

/**
 * Retorno de getCustomersWithLTV: Customer enriquecido com métricas derivadas
 * de orders. Felipe usa pra montar a lista /customers V4.
 *
 * LTV = SUM(orders.value WHERE customer_id = X AND status = 'paid')
 *   + fallback via client_name quando customer_id é NULL (pedidos legados
 *     anteriores à Wave 1 / migração de dados).
 *
 * days_since_last_order = NOW() - MAX(orders.created_at) — aparece como
 * "sumiu há X dias" na UI. NULL quando cliente nunca teve pedido.
 */
export interface CustomerWithLTV extends Customer {
  total_orders:          number
  total_spent:           number
  last_order_date:       string | null  // ISO 8601 — MAX(orders.created_at)
  days_since_last_order: number | null  // null = nunca comprou
}

/**
 * Linha de timeline do perfil do cliente.
 * Pedidos em ordem cronológica descendente (mais recente primeiro).
 */
export interface CustomerOrderSummary {
  id:         string
  item:       string
  value:      number
  status:     string
  date:       string
  createdAt:  string
}

/**
 * Retorno de getCustomerSummary: perfil completo com timeline de pedidos.
 */
export interface CustomerSummary extends CustomerWithLTV {
  orders: CustomerOrderSummary[]
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function customerFromDB(r: any): Customer {
  return {
    id:        r.id,
    projectId: r.project_id,
    name:      r.name,
    whatsapp:  r.whatsapp   ?? null,
    email:     r.email      ?? null,
    notes:     r.notes      ?? '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

function customerToDB(input: CreateCustomerInput, projectId: string, userId: string) {
  return {
    // id gerado pelo caller via uid() — mantém o padrão do projeto (text PK)
    project_id: projectId,
    user_id:    userId,
    name:       input.name,
    whatsapp:   input.whatsapp  ?? null,
    email:      input.email     ?? null,
    notes:      input.notes     ?? '',
  }
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

function diffInDays(isoDate: string): number {
  const diff = Date.now() - new Date(isoDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// ─── CRUD básico ──────────────────────────────────────────────────────────────

export const customersService = {

  async getAll(projectId: string): Promise<Customer[]> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) serviceError('customersService.getAll', error)
    return (data ?? []).map(customerFromDB)
  },

  async getById(projectId: string, customerId: string): Promise<Customer> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .single()

    if (error) serviceError('customersService.getById', error)
    return customerFromDB(data)
  },

  async create(projectId: string, input: CreateCustomerInput & { id: string }): Promise<Customer> {
    validateRequired('customersService.create', { id: input.id, projectId, name: input.name })
    const userId = await requireUserId()

    const { data, error } = await supabase
      .from('customers')
      .insert({ ...customerToDB(input, projectId, userId), id: input.id })
      .select()
      .single()

    if (error) serviceError('customersService.create', error)
    return customerFromDB(data)
  },

  async update(
    projectId:  string,
    customerId: string,
    input:      UpdateCustomerInput,
  ): Promise<Customer> {
    validateRequired('customersService.update', { customerId, projectId })
    const userId = await requireUserId()

    const patch: Record<string, unknown> = {}
    if (input.name     !== undefined) patch.name     = input.name
    if (input.whatsapp !== undefined) patch.whatsapp = input.whatsapp
    if (input.email    !== undefined) patch.email    = input.email
    if (input.notes    !== undefined) patch.notes    = input.notes

    const { data, error } = await supabase
      .from('customers')
      .update(patch)
      .eq('id', customerId)
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .select()
      .single()

    if (error) serviceError('customersService.update', error)
    return customerFromDB(data)
  },

  async delete(projectId: string, customerId: string): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId)
      .eq('user_id', userId)
      .eq('project_id', projectId)

    if (error) serviceError('customersService.delete', error)
  },

  // ─── Queries analíticas ─────────────────────────────────────────────────────

  /**
   * Lista clientes enriquecidos com LTV e alerta "sumiu há X dias".
   *
   * Uma única query com LEFT JOIN em orders evita N+1.
   *
   * LTV: SUM(value) WHERE status = 'paid' AND customer_id = X
   *   Pedidos legados (customer_id NULL) não entram no LTV por customer_id.
   *   A Wave 1 (tela "Importar de pedidos existentes") fará o dedup e
   *   preencherá customer_id retroativamente — até lá, total_spent pode ser
   *   subestimado para clientes antigos. Isso é intencional e documentado:
   *   ver supabase/migrations/20260510_customers_table.sql comentários.
   *
   * @param projectId  Obrigatório — multi-tenant
   * @param userId     Redundante com RLS mas reforça defesa em camadas
   */
  async getCustomersWithLTV(
    projectId: string,
    userId:    string,
  ): Promise<CustomerWithLTV[]> {
    // Busca clientes + pedidos relacionados via customer_id em uma call só.
    // Supabase PostgREST não suporta GROUP BY diretamente, então trazemos os
    // dados relacionados e agregamos no JS. Para volumes típicos de makers
    // (< 1000 clientes, < 5000 pedidos por projeto), isso é negligenciável.
    // Se volume crescer, substituir por uma RPC Postgres com GROUP BY.
    const { data: customers, error: custError } = await supabase
      .from('customers')
      .select(`
        id,
        project_id,
        name,
        whatsapp,
        email,
        notes,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (custError) serviceError('customersService.getCustomersWithLTV.customers', custError)
    if (!customers?.length) return []

    const customerIds = customers.map(c => c.id)

    // Traz apenas os campos necessários dos pedidos — sem `*` pra reduzir payload
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('customer_id, value, status, created_at')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .in('customer_id', customerIds)

    if (ordersError) serviceError('customersService.getCustomersWithLTV.orders', ordersError)

    // Agrega métricas por customer_id em memória — 2 queries, zero N+1
    const metricsMap = new Map<string, {
      total_orders:    number
      total_spent:     number
      last_order_date: string | null
    }>()

    for (const order of orders ?? []) {
      if (!order.customer_id) continue
      const m = metricsMap.get(order.customer_id) ?? {
        total_orders:    0,
        total_spent:     0,
        last_order_date: null,
      }
      m.total_orders++
      if (order.status === 'paid') {
        m.total_spent += Number(order.value ?? 0)
      }
      if (
        !m.last_order_date ||
        new Date(order.created_at) > new Date(m.last_order_date)
      ) {
        m.last_order_date = order.created_at
      }
      metricsMap.set(order.customer_id, m)
    }

    return customers.map(c => {
      const m = metricsMap.get(c.id)
      const last = m?.last_order_date ?? null
      return {
        ...customerFromDB(c),
        total_orders:          m?.total_orders    ?? 0,
        total_spent:           m?.total_spent     ?? 0,
        last_order_date:       last,
        days_since_last_order: last ? diffInDays(last) : null,
      }
    })
  },

  /**
   * Perfil completo de um cliente com timeline de pedidos.
   *
   * Retorna CustomerWithLTV + array de pedidos em ordem cronológica descendente.
   * Felipe usa pra montar o drawer/modal de perfil de cliente na /customers V4.
   *
   * @param projectId  Obrigatório — multi-tenant
   * @param userId     Redundante com RLS, defesa em camadas
   * @param customerId ID do cliente
   */
  async getCustomerSummary(
    projectId:  string,
    userId:     string,
    customerId: string,
  ): Promise<CustomerSummary> {
    // 1. Busca o registro do cliente (guard multi-tenant)
    const { data: customerRow, error: custError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .single()

    if (custError) serviceError('customersService.getCustomerSummary.customer', custError)
    if (!customerRow) throw new Error('[customersService.getCustomerSummary] Customer not found')

    // 2. Busca pedidos vinculados via customer_id
    const { data: orderRows, error: ordersError } = await supabase
      .from('orders')
      .select('id, item, value, status, date, created_at')
      .eq('customer_id', customerId)
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (ordersError) serviceError('customersService.getCustomerSummary.orders', ordersError)

    const orders: CustomerOrderSummary[] = (orderRows ?? []).map(o => ({
      id:        o.id,
      item:      o.item,
      value:     Number(o.value ?? 0),
      status:    o.status,
      date:      o.date,
      createdAt: o.created_at,
    }))

    // Agrega métricas do array local — já veio do banco, não faz nova query
    let total_spent   = 0
    let last_order_date: string | null = null

    for (const o of orders) {
      if (o.status === 'paid') total_spent += o.value
      if (!last_order_date || new Date(o.createdAt) > new Date(last_order_date)) {
        last_order_date = o.createdAt
      }
    }

    return {
      ...customerFromDB(customerRow),
      total_orders:          orders.length,
      total_spent,
      last_order_date,
      days_since_last_order: last_order_date ? diffInDays(last_order_date) : null,
      orders,
    }
  },
}
