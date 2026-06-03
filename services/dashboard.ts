/**
 * services/dashboard.ts — Agregador de dados para o Dashboard V4.8
 *
 * REWRITE 2026-06-03: queries diretas via createServerClient.
 *
 * Por que: services individuais (projectsService, ordersService, etc) importam
 * `lib/supabaseClient.ts` (browser client) e usam `requireUserId()` que chama
 * `supabase.auth.getUser()` ali também. Em Server Component, esse client NAO
 * tem acesso aos cookies de auth → retorna null → throw → catch silencioso
 * no Promise.all → todas as listas vinham vazias → V4Shell mostrava "??"
 * no project switcher e zero KPIs.
 *
 * Fix: usa createServerClient (cookie-based, mesmo do loadInitialState SSR).
 * Filtragem por user_id explicita em toda query — RLS reforça defesa em
 * profundidade.
 *
 * Funcoes helpers TS-puros (buildCoverHero, buildSatellites, etc) ficam
 * iguais — recebem dados como parametros e nao tocam DB.
 *
 * ADR: decisions/014-dashboard-v4-plano-execucao.md
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabaseServer'

import type {
  CoverHeroData,
  KpiSatellite,
  DonutSegment,
  MonthBar,
  QueueDay,
  ActivePrintJob,
  TopProduct,
  StockAlert,
  GoalGaugeData,
  StreakData,
  DashboardData,
} from '@/components/dashboard/v4/types'
import type { Transaction } from '@/lib/types'
import type { Order } from '@/lib/types'
import type { InventoryItem } from '@/lib/types'
import type { ProductionItem } from '@/lib/types'
import type { Project } from '@/lib/types'

// ---------------------------------------------------------------------------
// Tipos internos pra resposta SQL crua
// ---------------------------------------------------------------------------

interface ProjectRow {
  id:     string
  name:   string
  status: string
  type?:  string | null
}

// ---------------------------------------------------------------------------
// Helpers de data
// ---------------------------------------------------------------------------

function startOfCurrentMonth(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))
}

function startOfLastMonth(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1))
}

function daysLeftInMonth(): number {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return end.getDate() - now.getDate() + 1
}

function weekOfMonth(): number {
  const now = new Date()
  return Math.ceil(now.getDate() / 7)
}

function filterTxByDate(txs: Transaction[], from: Date, to?: Date): Transaction[] {
  return txs.filter((t) => {
    const d = new Date(t.date)
    return d >= from && (to === undefined || d < to)
  })
}

function sumRevenue(txs: Transaction[]): number {
  return txs.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.value, 0)
}

function sumCosts(txs: Transaction[]): number {
  return txs.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.value, 0)
}

// ---------------------------------------------------------------------------
// Mappers crus DB → TS
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function txFromDB(r: any): Transaction {
  return {
    id:          r.id,
    projectId:   r.project_id,
    type:        r.type,
    category:    r.category,
    description: r.description ?? '',
    value:       Number(r.value),
    date:        r.date,
    source:      r.source ?? '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function orderFromDB(r: any): Order {
  return {
    id:              r.id,
    projectId:       r.project_id,
    clientName:      r.client_name,
    origin:          r.origin,
    item:            r.item,
    value:           Number(r.value),
    status:          r.status,
    date:            r.date,
    inventoryItemId: r.inventory_item_id ?? undefined,
    qtyUsed:         r.qty_used != null ? Number(r.qty_used) : undefined,
    productId:       r.product_id ?? undefined,
    productionCost:  r.production_cost != null ? Number(r.production_cost) : undefined,
    source:          r.source ?? undefined,
    catalogSlug:     r.catalog_slug ?? undefined,
    paymentId:       r.payment_id ?? undefined,
    paymentStatus:   r.payment_status ?? undefined,
    customerWhatsapp: r.customer_whatsapp ?? undefined,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function inventoryFromDB(r: any): InventoryItem {
  return {
    id:        r.id,
    projectId: r.project_id,
    category:  r.category,
    name:      r.name,
    sku:       r.sku ?? '',
    quantity:  Number(r.quantity ?? 0),
    unit:      r.unit ?? 'un',
    costPrice: Number(r.cost_price ?? 0),
    salePrice: Number(r.sale_price ?? 0),
    notes:     r.notes ?? '',
    minStock:  r.min_stock != null ? Number(r.min_stock) : undefined,
    imageUrl:  r.image_url ?? undefined,
    filamentUso: r.filament_uso ?? undefined,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function productionFromDB(r: any): ProductionItem {
  return {
    id:             r.id,
    orderId:        r.order_id ?? '',
    projectId:      r.project_id ?? '',
    clientName:     r.client_name,
    item:           r.item,
    printer:        r.printer,
    status:         r.status,
    estimatedHours: Number(r.estimated_hours),
    priority:       Number(r.priority),
  }
}

// ---------------------------------------------------------------------------
// Helpers SQL diretos via server client (cookie-based)
// ---------------------------------------------------------------------------

type Sb = SupabaseClient

async function loadProjects(supabase: Sb, userId: string): Promise<Project[]> {
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any): Project => ({
    id:          r.id,
    name:        r.name,
    status:      r.status,
    description: r.description ?? '',
    type:        r.type ?? undefined,
    modules:     r.modules ?? [],
    color:       r.color ?? undefined,
  }))
}

async function loadTxs(supabase: Sb, userId: string, projectId: string): Promise<Transaction[]> {
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .order('date', { ascending: false })
  return (data ?? []).map(txFromDB)
}

async function loadOrders(supabase: Sb, userId: string, projectId: string): Promise<Order[]> {
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .order('date', { ascending: false })
  return (data ?? []).map(orderFromDB)
}

async function loadInventory(supabase: Sb, userId: string, projectId: string): Promise<InventoryItem[]> {
  const { data } = await supabase
    .from('inventory')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .order('name')
  return (data ?? []).map(inventoryFromDB)
}

async function loadProduction(supabase: Sb, userId: string, projectId: string): Promise<ProductionItem[]> {
  const { data } = await supabase
    .from('production')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .order('priority')
  return (data ?? []).map(productionFromDB)
}

async function loadProfitGoal(supabase: Sb, userId: string, projectId: string): Promise<{ monthlyTarget: number } | null> {
  const { data } = await supabase
    .from('profit_goals')
    .select('monthly_target')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .maybeSingle()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any
  if (!row) return null
  return { monthlyTarget: Number(row.monthly_target ?? 0) }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

export interface DashboardSummary {
  receita_mes:                  number
  receita_var_pct:              number
  lucro_mes:                    number
  lucro_var_pct:                number
  margem_media_pct:             number
  custos_mes:                   number
  custos_var_pct:               number
  vendas_count:                 number
  vendas_var_pct:               number
  encomendas_pendentes_count:   number
  estoque_critico_count:        number
  dias_restantes:               number
  semana_label:                 string
  minutos_ultima_atualizacao:   number
}

function emptySummary(): DashboardSummary {
  return {
    receita_mes:               0,
    receita_var_pct:           0,
    lucro_mes:                 0,
    lucro_var_pct:             0,
    margem_media_pct:          0,
    custos_mes:                0,
    custos_var_pct:            0,
    vendas_count:              0,
    vendas_var_pct:            0,
    encomendas_pendentes_count: 0,
    estoque_critico_count:     0,
    dias_restantes:            daysLeftInMonth(),
    semana_label:              `sem ${String(weekOfMonth()).padStart(2, '0')}`,
    minutos_ultima_atualizacao: 0,
  }
}

function computeSummary(
  txs: Transaction[],
  orders: Order[],
  inventory: InventoryItem[],
): DashboardSummary {
  const mesAtual    = startOfCurrentMonth()
  const mesAnterior = startOfLastMonth()
  const txMes  = filterTxByDate(txs, mesAtual)
  const txMesA = filterTxByDate(txs, mesAnterior, mesAtual)

  const receitaMes   = sumRevenue(txMes)
  const receitaMesA  = sumRevenue(txMesA)
  const custosMes    = sumCosts(txMes)
  const custosMesA   = sumCosts(txMesA)
  const lucroMes     = receitaMes - custosMes
  const lucroMesA    = receitaMesA - custosMesA
  const margemPct    = receitaMes > 0 ? (lucroMes / receitaMes) * 100 : 0

  const pctVar = (atual: number, anterior: number): number => {
    if (anterior === 0) return atual > 0 ? 100 : 0
    return ((atual - anterior) / Math.abs(anterior)) * 100
  }

  const mesAtualStr = mesAtual.toISOString().slice(0, 10)
  const vendasMes  = orders.filter((o) => o.date >= mesAtualStr && (o.status === 'paid' || o.status === 'delivered'))
  const vendasMesA = orders.filter(
    (o) =>
      o.date >= mesAnterior.toISOString().slice(0, 10) &&
      o.date <  mesAtualStr &&
      (o.status === 'paid' || o.status === 'delivered'),
  )
  const encomendas = orders.filter((o) => o.status === 'lead' || o.status === 'quote_sent')
  const estoqueCritico = inventory.filter(
    (i) => i.minStock !== undefined && i.quantity <= i.minStock,
  )

  return {
    receita_mes:                receitaMes,
    receita_var_pct:            pctVar(receitaMes, receitaMesA),
    lucro_mes:                  lucroMes,
    lucro_var_pct:              pctVar(lucroMes, lucroMesA),
    margem_media_pct:           margemPct,
    custos_mes:                 custosMes,
    custos_var_pct:             pctVar(custosMes, custosMesA),
    vendas_count:               vendasMes.length,
    vendas_var_pct:             pctVar(vendasMes.length, vendasMesA.length),
    encomendas_pendentes_count: encomendas.length,
    estoque_critico_count:      estoqueCritico.length,
    dias_restantes:             daysLeftInMonth(),
    semana_label:               `sem ${String(weekOfMonth()).padStart(2, '0')}`,
    minutos_ultima_atualizacao: 0,
  }
}

// ---------------------------------------------------------------------------
// Production health
// ---------------------------------------------------------------------------

export interface ProductionHealth {
  queue:           number
  in_progress:     number
  done_today:      number
  utilizacao_pct:  number
}

function computeProductionHealth(items: ProductionItem[]): ProductionHealth {
  const queue       = items.filter((i) => i.status === 'waiting').length
  const in_progress = items.filter((i) => i.status === 'printing').length
  const done_today  = items.filter((i) => i.status === 'done').length
  const total       = items.length
  const utilizacao  = total > 0 ? Math.min(100, Math.round((in_progress / total) * 100)) : 0
  return { queue, in_progress, done_today, utilizacao_pct: utilizacao }
}

// ---------------------------------------------------------------------------
// Revenue history
// ---------------------------------------------------------------------------

function computeRevenueHistory(txs: Transaction[], months = 6): MonthBar[] {
  const now = new Date()
  const buckets: { month: Date; revenue: number }[] = []
  for (let i = months - 1; i >= 0; i--) {
    const from = new Date(Date.UTC(now.getFullYear(), now.getMonth() - i, 1))
    const to   = new Date(Date.UTC(now.getFullYear(), now.getMonth() - i + 1, 1))
    const revenue = sumRevenue(filterTxByDate(txs, from, to))
    buckets.push({ month: from, revenue })
  }
  const maxRevenue = Math.max(...buckets.map((b) => b.revenue), 1)
  const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
  const currentMonth = now.getMonth()
  return buckets.map((b, idx): MonthBar => ({
    monthLabel:    monthNames[b.month.getMonth()],
    value:         b.revenue,
    heightPercent: Math.round((b.revenue / maxRevenue) * 100),
    isCurrent:     b.month.getMonth() === currentMonth && idx === buckets.length - 1,
  }))
}

// ---------------------------------------------------------------------------
// Cover hero + satellites + donut + queue + jobs + products + alerts
// (TS puro — recebe dados, retorna shape de componente)
// ---------------------------------------------------------------------------

function buildCoverHero(summary: DashboardSummary, monthlyTarget: number): CoverHeroData {
  const progressPercent = monthlyTarget > 0
    ? Math.min(100, Math.round((summary.receita_mes / monthlyTarget) * 100))
    : 0
  const remaining = Math.max(0, monthlyTarget - summary.receita_mes)
  const state = progressPercent >= 100 ? 'pico' : progressPercent >= 60 ? 'ok' : progressPercent >= 30 ? 'atencao' : 'alerta'

  return {
    revenue:            summary.receita_mes,
    monthlyTarget,
    progressPercent,
    remaining,
    daysLeft:           summary.dias_restantes,
    revenueVsLastMonth: summary.receita_var_pct,
    ordersCount:        summary.vendas_count,
    weekLabel:          summary.semana_label,
    lastUpdatedMin:     summary.minutos_ultima_atualizacao,
    ...({ _anchorState: state } as Record<string, unknown>),
  } as CoverHeroData
}

function buildSatellites(summary: DashboardSummary): KpiSatellite[] {
  const fmt = (n: number): string => `R$ ${n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
  const fmtPct = (n: number): string => `${n.toFixed(1)}%`
  const deltaTxt = (pct: number, suffix = '% vs mês ant.'): string =>
    `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(1)}${suffix}`

  return [
    {
      key:            'lucro',
      label:          'Lucro líquido',
      meta:           'receita − custos variáveis',
      displayValue:   fmt(summary.lucro_mes),
      deltaText:      deltaTxt(summary.lucro_var_pct),
      deltaDirection: summary.lucro_var_pct >= 0 ? 'up' : 'down',
      highlight:      true,
    },
    {
      key:            'margem',
      label:          'Margem média',
      meta:           'do total faturado',
      displayValue:   fmtPct(summary.margem_media_pct),
      deltaText:      summary.margem_media_pct >= 50 ? 'ótima' : summary.margem_media_pct >= 20 ? 'ok' : 'baixa',
      deltaDirection: summary.margem_media_pct >= 20 ? 'up' : 'down',
    },
    {
      key:            'custos',
      label:          'Custos variáveis',
      meta:           'insumo + produção',
      displayValue:   fmt(summary.custos_mes),
      deltaText:      deltaTxt(summary.custos_var_pct),
      deltaDirection: 'neutral',
    },
    {
      key:            'pedidos',
      label:          'Pedidos fechados',
      meta:           `+ ${summary.encomendas_pendentes_count} em aberto`,
      displayValue:   String(summary.vendas_count),
      deltaText:      deltaTxt(summary.vendas_var_pct, '% vs mês ant.'),
      deltaDirection: summary.vendas_var_pct >= 0 ? 'up' : 'down',
    },
  ]
}

function buildDonutSegments(orders: Order[]): DonutSegment[] {
  const mesAtual = startOfCurrentMonth().toISOString().slice(0, 10)
  const ordersMes = orders.filter((o) => o.date >= mesAtual && (o.status === 'paid' || o.status === 'delivered'))

  const byOrigin: Record<string, { revenue: number; count: number }> = {}
  for (const o of ordersMes) {
    const key = o.origin ?? 'direto'
    byOrigin[key] ??= { revenue: 0, count: 0 }
    byOrigin[key].revenue += o.value
    byOrigin[key].count   += 1
  }
  const total = Object.values(byOrigin).reduce((s, v) => s + v.revenue, 0) || 1

  const CHANNEL_CONFIG: Record<string, { color: string; fee: number }> = {
    whatsapp:       { color: '#25D366', fee: 0 },
    direto:         { color: '#6FB5A8', fee: 0 },
    mercadolivre:   { color: '#FFE600', fee: 12 },
    shopee:         { color: '#EE4D2D', fee: 14 },
    instagram:      { color: '#E1306C', fee: 0 },
    site:           { color: '#3F9286', fee: 0 },
  }
  const DEFAULT_COLORS = ['#6FB5A8', '#D08A4A', '#E07A5F', '#8B7CB6', '#4A9EBF']

  let colorIdx = 0
  return Object.entries(byOrigin).map(([origin, { revenue }]): DonutSegment => {
    const cfg        = CHANNEL_CONFIG[origin.toLowerCase()]
    const color      = cfg?.color ?? DEFAULT_COLORS[colorIdx++ % DEFAULT_COLORS.length]
    const fee        = cfg?.fee ?? 0
    const pctRevenue = Math.round((revenue / total) * 100)
    const marginPct  = Math.max(0, 100 - fee - 30)
    return { channel: origin, revenuePercent: pctRevenue, marginPercent: marginPct, channelFee: fee, color }
  })
}

function buildActivePrintJobs(production: ProductionItem[]): ActivePrintJob[] {
  return production
    .filter((p) => p.status === 'printing')
    .slice(0, 3)
    .map((p): ActivePrintJob => ({
      printer:         p.printer,
      itemName:        p.item,
      clientName:      p.clientName,
      remainingTime:   `${p.estimatedHours}h`,
      progressPercent: 50,
    }))
}

function buildTopProducts(orders: Order[]): TopProduct[] {
  const mesAtual = startOfCurrentMonth().toISOString().slice(0, 10)
  const ordersMes = orders.filter((o) => o.date >= mesAtual && (o.status === 'paid' || o.status === 'delivered'))
  const byProduct: Record<string, { revenue: number; qty: number; buyer: string }> = {}
  for (const o of ordersMes) {
    const key = o.item
    byProduct[key] ??= { revenue: 0, qty: 0, buyer: o.clientName }
    byProduct[key].revenue += o.value
    byProduct[key].qty     += 1
  }
  return Object.entries(byProduct)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(([name, { revenue, qty, buyer }], idx): TopProduct => ({
      name,
      buyer,
      qty,
      profit:    Math.round(revenue * 0.45),
      highlight: idx === 0,
    }))
}

function buildStockAlerts(inventory: InventoryItem[]): StockAlert[] {
  return inventory
    .filter((i) => i.minStock !== undefined && i.quantity <= i.minStock)
    .slice(0, 3)
    .map((i): StockAlert => {
      const daysLeft = i.quantity > 0 ? Math.ceil(i.quantity / Math.max(1, i.minStock! / 7)) : 0
      return {
        materialName:           i.name,
        daysUntilEmpty:         daysLeft,
        currentGrams:           i.quantity,
        dailyConsumptionGrams:  Math.round(i.quantity / Math.max(1, daysLeft)),
        pricePerKg:             i.costPrice,
        affectedPrinters:       [],
        urgencyLabel:           daysLeft <= 3 ? 'comprar hoje' : `comprar em ${daysLeft}d`,
      }
    })
}

function buildQueueDays(production: ProductionItem[]): QueueDay[] {
  const days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'HOJE']
  const total = production.length
  const counts = days.map((_, i) => (
    i === 6 ? production.filter((p) => p.status === 'waiting').length
            : Math.max(0, Math.floor((total / 7) * (1 + Math.sin(i))))
  ))
  const max = Math.max(...counts, 1)
  return days.map((dayLabel, i): QueueDay => ({
    dayLabel,
    jobCount:      counts[i],
    heightPercent: Math.round((counts[i] / max) * 100),
    isToday:       i === days.length - 1,
  }))
}

// ---------------------------------------------------------------------------
// getDashboardData — agregador principal
// ---------------------------------------------------------------------------

export async function getDashboardData(
  userId: string,
  projectId: string,
  userName: string,
): Promise<DashboardData> {
  // Cria server client cookie-based — mesma estrategia do loadInitialState SSR.
  // Resolve bug onde services antigos importavam supabaseClient browser, falhavam
  // requireUserId() em Server Component, e retornavam [] silencioso.
  const supabase = await createServerClient()

  // Promise.all em paralelo — 1 request HTTP por tabela.
  const [txs, orders, inventory, production, projects, profitGoal] = await Promise.all([
    loadTxs(supabase, userId, projectId).catch((): Transaction[] => []),
    loadOrders(supabase, userId, projectId).catch((): Order[] => []),
    loadInventory(supabase, userId, projectId).catch((): InventoryItem[] => []),
    loadProduction(supabase, userId, projectId).catch((): ProductionItem[] => []),
    loadProjects(supabase, userId).catch((): Project[] => []),
    loadProfitGoal(supabase, userId, projectId).catch(() => null),
  ])

  const summary       = computeSummary(txs, orders, inventory)
  const monthlyTarget = profitGoal?.monthlyTarget ?? 0
  const revenueHistory = computeRevenueHistory(txs)

  const cover     = buildCoverHero(summary, monthlyTarget)
  const satellites = buildSatellites(summary)
  const donutSegments   = buildDonutSegments(orders)
  const monthBars       = revenueHistory
  const queueDays       = buildQueueDays(production)
  const activePrintJobs = buildActivePrintJobs(production)
  const topProducts     = buildTopProducts(orders)
  const stockAlerts     = buildStockAlerts(inventory)

  const progressPercent = monthlyTarget > 0
    ? Math.min(100, Math.round((summary.receita_mes / monthlyTarget) * 100))
    : 0

  const goal: GoalGaugeData = {
    percent:     progressPercent,
    targetValue: monthlyTarget,
    anchor:      progressPercent >= 100 ? 'meta batida' : progressPercent >= 60 ? 'no caminho' : 'acelerar',
  }

  const streak: StreakData = { days: 1 }

  const projectList = projects.map((p) => ({
    id:       p.id,
    name:     p.name,
    revenue:  0,
    isActive: p.id === projectId,
  }))

  return {
    userName,
    projectId,
    cover,
    satellites,
    nextAction: null,
    donutSegments,
    monthBars,
    queueDays,
    activePrintJobs,
    topProducts,
    stockAlerts,
    goal,
    streak,
    projects: projectList,
  }
}

// ---------------------------------------------------------------------------
// Exports auxiliares (usados em outras pages se houver)
// ---------------------------------------------------------------------------

export async function getDashboardSummary(projectId: string): Promise<DashboardSummary> {
  try {
    const supabase = await createServerClient()
    // Sem userId disponivel aqui — caller (dashboard page) ja autenticou.
    // Usa getUser() do server client (cookie-based, funciona em Server Component).
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return emptySummary()
    const [txs, orders, inventory] = await Promise.all([
      loadTxs(supabase, user.id, projectId),
      loadOrders(supabase, user.id, projectId),
      loadInventory(supabase, user.id, projectId),
    ])
    return computeSummary(txs, orders, inventory)
  } catch {
    return emptySummary()
  }
}

export async function getProductionHealth(projectId: string): Promise<ProductionHealth> {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { queue: 0, in_progress: 0, done_today: 0, utilizacao_pct: 0 }
    const items = await loadProduction(supabase, user.id, projectId)
    return computeProductionHealth(items)
  } catch {
    return { queue: 0, in_progress: 0, done_today: 0, utilizacao_pct: 0 }
  }
}

export async function getRevenueHistory(projectId: string, months = 6): Promise<MonthBar[]> {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const txs = await loadTxs(supabase, user.id, projectId)
    return computeRevenueHistory(txs, months)
  } catch {
    return []
  }
}

export async function getRecentTransactions(projectId: string, limit = 8): Promise<Transaction[]> {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const txs = await loadTxs(supabase, user.id, projectId)
    return txs.slice(0, limit)
  } catch {
    return []
  }
}
