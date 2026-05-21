/**
 * services/customersMetrics.ts — Metricas derivadas do modulo /customers
 *
 * Puro TS, zero React. Clientes nao tem tabela propria: sao derivados de
 * state.orders (campo clientName). Esta camada agrega e calcula tudo.
 *
 * Criado: 2026-05-20 (feature/customers-v4)
 */

import type { Order } from '@/lib/types'

// ---------------------------------------------------------------------------
// Tipo derivado: Customer (agregado de orders)
// ---------------------------------------------------------------------------

export type CustomerSegment = 'vip' | 'recorrente' | 'sumido' | 'novo'

export interface CustomerRow {
  /** Nome canonico (primeira ocorrencia, case-preserved) */
  name:          string
  /** Total de pedidos do cliente */
  totalOrders:   number
  /** Soma de valores pagos + entregues (LTV) */
  ltv:           number
  /** Ticket medio (ltv / pedidos pagos) */
  avgTicket:     number
  /** Data do ultimo pedido (ISO string) */
  lastOrderDate: string
  /** Dias desde o ultimo pedido */
  daysSinceLastOrder: number
  /** Segmento calculado */
  segment:       CustomerSegment
  /** Primeiro pedido (data ISO) */
  firstOrderDate: string
}

export type CustomerFilter = 'todos' | 'vip' | 'recorrente' | 'sumido' | 'novo'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Dias sem pedido para considerar cliente "sumido" */
const SUMIDO_THRESHOLD_DAYS = 60

/** Pedidos minimos para classificar como VIP (>= este valor E ltv alto) */
const VIP_MIN_ORDERS = 3

/** LTV minimo para VIP (R$) */
const VIP_MIN_LTV = 300

// ---------------------------------------------------------------------------
// Helper interno
// ---------------------------------------------------------------------------

function startOfDay(d: Date): Date {
  const r = new Date(d)
  r.setHours(0, 0, 0, 0)
  return r
}

function daysDiff(dateIso: string, today: Date): number {
  const d         = new Date(dateIso)
  const todayNorm = startOfDay(today)
  const then      = startOfDay(d)
  const diff      = todayNorm.getTime() - then.getTime()
  return Math.max(0, Math.floor(diff / 86400000))
}

function calcSegment(row: {
  totalOrders:        number
  ltv:                number
  daysSinceLastOrder: number
}): CustomerSegment {
  if (row.daysSinceLastOrder >= SUMIDO_THRESHOLD_DAYS) return 'sumido'
  if (row.totalOrders >= VIP_MIN_ORDERS && row.ltv >= VIP_MIN_LTV) return 'vip'
  if (row.totalOrders >= 2) return 'recorrente'
  return 'novo'
}

// ---------------------------------------------------------------------------
// Funcao principal: agrega orders -> CustomerRow[]
// ---------------------------------------------------------------------------

/**
 * Deriva lista de clientes a partir dos pedidos.
 * Multi-tenant: recebe orders ja filtrados por project_id se necessario.
 */
export function buildCustomerList(orders: Order[], today = new Date()): CustomerRow[] {
  if (orders.length === 0) return []

  const map = new Map<string, {
    name:       string
    allOrders:  Order[]
  }>()

  for (const o of orders) {
    const key = o.clientName.trim().toLowerCase()
    if (!map.has(key)) {
      map.set(key, { name: o.clientName.trim(), allOrders: [] })
    }
    map.get(key)!.allOrders.push(o)
  }

  const rows: CustomerRow[] = []

  for (const [, { name, allOrders }] of map) {
    const sorted     = [...allOrders].sort((a, b) => b.date.localeCompare(a.date))
    const lastDate   = sorted[0].date
    const firstDate  = sorted[sorted.length - 1].date
    const days       = daysDiff(lastDate, today)

    const paid = allOrders.filter((o) => o.status === 'paid' || o.status === 'delivered')
    const ltv  = paid.reduce((s, o) => s + (o.value ?? 0), 0)
    const avg  = paid.length > 0 ? ltv / paid.length : 0

    const row: CustomerRow = {
      name,
      totalOrders:        allOrders.length,
      ltv,
      avgTicket:          avg,
      lastOrderDate:      lastDate,
      daysSinceLastOrder: days,
      firstOrderDate:     firstDate,
      segment:            calcSegment({ totalOrders: allOrders.length, ltv, daysSinceLastOrder: days }),
    }
    rows.push(row)
  }

  // Ordena por ltv desc (mais valioso primeiro)
  return rows.sort((a, b) => b.ltv - a.ltv)
}

// ---------------------------------------------------------------------------
// KPI de resumo do modulo
// ---------------------------------------------------------------------------

export interface CustomersKpiData {
  /** Total de clientes unicos */
  totalClientes:    number
  /** LTV medio por cliente */
  ltvMedio:         number
  /** Ticket medio geral */
  ticketMedio:      number
  /** Clientes sumidos (>= SUMIDO_THRESHOLD_DAYS sem pedido) */
  sumidos:          number
  /** Clientes VIP */
  vips:             number
  /** Clientes novos (1 pedido + nao sumido) */
  novos:            number
  /** Clientes recorrentes (2+ pedidos + nao sumido + nao vip) */
  recorrentes:      number
  /** Delta de clientes ativos vs mes anterior */
  deltaAtivos:      string | null
}

/**
 * Calcula KPIs agregados para o hero + satellites do ModuleShell.
 */
export function calcCustomersKpi(
  customers: CustomerRow[],
  orders:    Order[],
  today = new Date(),
): CustomersKpiData {
  const total      = customers.length
  const ltvTotal   = customers.reduce((s, c) => s + c.ltv, 0)
  const ltvMedio   = total > 0 ? ltvTotal / total : 0

  const paid = orders.filter((o) => o.status === 'paid' || o.status === 'delivered')
  const ticketGlobal = paid.length > 0
    ? paid.reduce((s, o) => s + (o.value ?? 0), 0) / paid.length
    : 0

  const sumidos     = customers.filter((c) => c.segment === 'sumido').length
  const vips        = customers.filter((c) => c.segment === 'vip').length
  const novos       = customers.filter((c) => c.segment === 'novo').length
  const recorrentes = customers.filter((c) => c.segment === 'recorrente').length

  // Delta: novos clientes esse mes vs mes passado
  const inicioMes  = new Date(today.getFullYear(), today.getMonth(), 1)
  const inicioAnterior = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const fimAnterior    = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59)

  const novosEsseMes = orders.filter((o) => {
    const d = new Date(o.date)
    return d >= inicioMes
  })
  const nomesMes = new Set(novosEsseMes.map((o) => o.clientName.trim().toLowerCase()))

  const novosMesAnterior = orders.filter((o) => {
    const d = new Date(o.date)
    return d >= inicioAnterior && d <= fimAnterior
  })
  const nomesMesAnterior = new Set(novosMesAnterior.map((o) => o.clientName.trim().toLowerCase()))

  let deltaAtivos: string | null = null
  if (nomesMesAnterior.size > 0) {
    const diff = nomesMes.size - nomesMesAnterior.size
    const pct  = (diff / nomesMesAnterior.size) * 100
    const sign = pct >= 0 ? '+' : ''
    deltaAtivos = `${pct >= 0 ? '▲' : '▼'} ${sign}${Math.round(pct)}% vs mes passado`
  }

  return {
    totalClientes: total,
    ltvMedio,
    ticketMedio: ticketGlobal,
    sumidos,
    vips,
    novos,
    recorrentes,
    deltaAtivos,
  }
}

// ---------------------------------------------------------------------------
// Helpers de formatacao (exportados para a page)
// ---------------------------------------------------------------------------

export function fmtBRL(n: number): string {
  return `R$ ${Math.round(n).toLocaleString('pt-BR')}`
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR')
}

export const SEGMENT_LABELS: Record<CustomerSegment, string> = {
  vip:        'VIP',
  recorrente: 'Recorrente',
  sumido:     'Sumido',
  novo:       'Novo',
}

export const SEGMENT_COLORS: Record<CustomerSegment, string> = {
  vip:        'text-[hsl(173_50%_55%)]',
  recorrente: 'text-[hsl(173_35%_65%)]',
  sumido:     'text-[hsl(28_67%_65%)]',
  novo:       'text-[#94908A]',
}

export const SEGMENT_BADGE_STYLE: Record<CustomerSegment, Record<string, string>> = {
  vip: {
    background:  'rgba(31,118,105,0.18)',
    color:       'hsl(173 50% 55%)',
    border:      '1px solid rgba(31,118,105,0.36)',
  },
  recorrente: {
    background:  'rgba(31,118,105,0.10)',
    color:       'hsl(173 35% 65%)',
    border:      '1px solid rgba(31,118,105,0.22)',
  },
  sumido: {
    background:  'rgba(208,138,74,0.16)',
    color:       'hsl(28 67% 68%)',
    border:      '1px solid rgba(208,138,74,0.32)',
  },
  novo: {
    background:  'rgba(148,144,138,0.10)',
    color:       '#94908A',
    border:      '1px solid rgba(148,144,138,0.22)',
  },
}
