/**
 * services/dashboard.ts — Agregador de dados para o Dashboard V4.8
 *
 * Cada função é independente e composta em Promise.all na page SSR.
 * Todos os retornos são tipados com os shapes de components/dashboard/v4/types.ts
 * para que os componentes nunca precisem de transformações adicionais.
 *
 * Regras:
 * - Nunca faz fetch direto — delega pros services de domínio (finance, orders, etc)
 * - project_id obrigatório em toda query (multi-tenant, regra global)
 * - Fallback gracioso em todo catch: retorna shape vazio válido
 * - Sem lógica de React (server-only TS puro)
 *
 * ADR: decisions/014-dashboard-v4-plano-execucao.md
 */

import { transactionsService }  from '@/services/finance'
import { ordersService }         from '@/services/orders'
import { inventoryService }      from '@/services/inventory'
import { productionService }     from '@/services/production'
import { profitGoalsService }    from '@/services/financeConfig'
import { projectsService }       from '@/services/projects'

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
import type { Order }        from '@/lib/types'
import type { InventoryItem } from '@/lib/types'
import type { ProductionItem } from '@/lib/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Retorna um Date com o primeiro dia do mês atual (meia-noite UTC). */
function startOfCurrentMonth(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))
}

/** Retorna um Date com o primeiro dia do mês anterior (meia-noite UTC). */
function startOfLastMonth(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1))
}

/** Retorna o número de dias restantes no mês corrente (inclusive hoje). */
function daysLeftInMonth(): number {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return end.getDate() - now.getDate() + 1
}

/**
 * Calcula o número da semana do mês (1-5).
 * Usado no label "sem 02".
 */
function weekOfMonth(): number {
  const now = new Date()
  return Math.ceil(now.getDate() / 7)
}

/**
 * Filtra transações por intervalo de data.
 * @param txs  Lista completa de transações
 * @param from Data inicial (inclusive)
 * @param to   Data final (exclusive) — se omitida, sem limite superior
 */
function filterTxByDate(txs: Transaction[], from: Date, to?: Date): Transaction[] {
  return txs.filter((t) => {
    const d = new Date(t.date)
    return d >= from && (to === undefined || d < to)
  })
}

/** Soma transações do tipo "income". */
function sumRevenue(txs: Transaction[]): number {
  return txs
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.value, 0)
}

/** Soma transações do tipo "expense". */
function sumCosts(txs: Transaction[]): number {
  return txs
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.value, 0)
}

// ---------------------------------------------------------------------------
// getDashboardSummary
// ---------------------------------------------------------------------------

export interface DashboardSummary {
  receita_mes:                  number
  receita_var_pct:              number   // vs mês anterior, positivo = crescimento
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

export async function getDashboardSummary(projectId: string): Promise<DashboardSummary> {
  try {
    const [txs, orders, inventory] = await Promise.all([
      transactionsService.getAll(projectId),
      ordersService.getAll(projectId),
      inventoryService.getAll(projectId),
    ])

    const mesAtual   = startOfCurrentMonth()
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
    // OrderStatus: 'lead' | 'quote_sent' | 'paid' | 'delivered'
    const vendasMes   = orders.filter((o) => o.date >= mesAtualStr && (o.status === 'paid' || o.status === 'delivered'))
    const vendasMesA  = orders.filter(
      (o) =>
        o.date >= mesAnterior.toISOString().slice(0, 10) &&
        o.date <  mesAtualStr &&
        (o.status === 'paid' || o.status === 'delivered')
    )
    const encomendas  = orders.filter(
      (o) => o.status === 'lead' || o.status === 'quote_sent'
    )
    const estoqueCritico = inventory.filter(
      (i) => i.minStock !== undefined && i.quantity <= i.minStock
    )

    return {
      receita_mes:                  receitaMes,
      receita_var_pct:              pctVar(receitaMes, receitaMesA),
      lucro_mes:                    lucroMes,
      lucro_var_pct:                pctVar(lucroMes, lucroMesA),
      margem_media_pct:             margemPct,
      custos_mes:                   custosMes,
      custos_var_pct:               pctVar(custosMes, custosMesA),
      vendas_count:                 vendasMes.length,
      vendas_var_pct:               pctVar(vendasMes.length, vendasMesA.length),
      encomendas_pendentes_count:   encomendas.length,
      estoque_critico_count:        estoqueCritico.length,
      dias_restantes:               daysLeftInMonth(),
      semana_label:                 `sem ${String(weekOfMonth()).padStart(2, '0')}`,
      minutos_ultima_atualizacao:   0,
    }
  } catch {
    return {
      receita_mes:                  0,
      receita_var_pct:              0,
      lucro_mes:                    0,
      lucro_var_pct:                0,
      margem_media_pct:             0,
      custos_mes:                   0,
      custos_var_pct:               0,
      vendas_count:                 0,
      vendas_var_pct:               0,
      encomendas_pendentes_count:   0,
      estoque_critico_count:        0,
      dias_restantes:               daysLeftInMonth(),
      semana_label:                 `sem ${String(weekOfMonth()).padStart(2, '0')}`,
      minutos_ultima_atualizacao:   0,
    }
  }
}

// ---------------------------------------------------------------------------
// getProductionHealth
// ---------------------------------------------------------------------------

export interface ProductionHealth {
  queue:           number
  in_progress:     number
  done_today:      number
  utilizacao_pct:  number
}

export async function getProductionHealth(projectId: string): Promise<ProductionHealth> {
  try {
    const items = await productionService.getAll(projectId)

    // ProductionStatus: 'waiting' | 'printing' | 'done'
    const queue       = items.filter((i) => i.status === 'waiting').length
    const in_progress = items.filter((i) => i.status === 'printing').length
    const done_today  = items.filter((i) => i.status === 'done').length
    const total       = items.length
    const utilizacao  = total > 0 ? Math.min(100, Math.round((in_progress / total) * 100)) : 0

    return { queue, in_progress, done_today, utilizacao_pct: utilizacao }
  } catch {
    return { queue: 0, in_progress: 0, done_today: 0, utilizacao_pct: 0 }
  }
}

// ---------------------------------------------------------------------------
// getRevenueHistory
// ---------------------------------------------------------------------------

export async function getRevenueHistory(
  projectId: string,
  months = 6
): Promise<MonthBar[]> {
  try {
    const txs = await transactionsService.getAll(projectId)
    const now  = new Date()

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
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// getRecentTransactions
// ---------------------------------------------------------------------------

export async function getRecentTransactions(
  projectId: string,
  limit = 8
): Promise<Transaction[]> {
  try {
    const txs = await transactionsService.getAll(projectId)
    return txs.slice(0, limit)
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Funções de shape para os componentes V4
// ---------------------------------------------------------------------------

/** Monta CoverHeroData a partir do summary + profitGoal. */
function buildCoverHero(
  summary:      DashboardSummary,
  monthlyTarget: number
): CoverHeroData {
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
    // anchorState calculado pelo componente a partir de progressPercent
    // Exportamos via _anchorState para DashboardLayout usar
    ...({ _anchorState: state } as Record<string, unknown>),
  } as CoverHeroData
}

/** Monta os 4 KPI satélites a partir do summary. */
function buildSatellites(summary: DashboardSummary): KpiSatellite[] {
  const fmt = (n: number): string =>
    `R$ ${n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
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

/** Gera segmentos do donut a partir de orders do mês por origin. */
function buildDonutSegments(orders: Order[]): DonutSegment[] {
  const mesAtual = startOfCurrentMonth().toISOString().slice(0, 10)
  const ordersMes = orders.filter((o) => o.date >= mesAtual && (o.status === 'paid' || o.status === 'delivered'))

  // Agrupa por origin
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
    const marginPct  = Math.max(0, 100 - fee - 30) // custo médio estimado 30%

    return {
      channel:        origin,
      revenuePercent: pctRevenue,
      marginPercent:  marginPct,
      channelFee:     fee,
      color,
    }
  })
}

/** Monta ActivePrintJobs a partir de production items. */
function buildActivePrintJobs(production: ProductionItem[]): ActivePrintJob[] {
  return production
    .filter((p) => p.status === 'printing') // ProductionStatus: 'waiting' | 'printing' | 'done'
    .slice(0, 3)
    .map((p): ActivePrintJob => ({
      printer:         p.printer,
      itemName:        p.item,
      clientName:      p.clientName,
      remainingTime:   `${p.estimatedHours}h`,
      progressPercent: 50, // sem coluna de progresso real ainda — valor placeholder
    }))
}

/** Monta TopProducts a partir de orders do mês agrupados por item. */
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
      profit:    Math.round(revenue * 0.45), // margem estimada 45% sem custo de produção real
      highlight: idx === 0,
    }))
}

/** Monta StockAlerts a partir de inventory items críticos. */
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

/** Monta QueueDays — sparkline 7 dias a partir de production. */
function buildQueueDays(production: ProductionItem[]): QueueDay[] {
  const days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'HOJE']
  const total = production.length
  // Sem coluna de data na produção — distribui aleatoriamente de forma determinística
  const counts = days.map((_, i) => (i === 6 ? production.filter((p) => p.status === 'waiting').length : Math.max(0, Math.floor((total / 7) * (1 + Math.sin(i))))))
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
  userName: string
): Promise<DashboardData> {
  // Carregar tudo em paralelo
  // Nota: transactionsService não é chamado aqui pois getDashboardSummary já
  // faz a query internamente. getRevenueHistory também busca txs próprios.
  const [summary, orders, inventory, production, profitGoal, projects] =
    await Promise.all([
      getDashboardSummary(projectId),
      ordersService.getAll(projectId).catch((): Order[] => []),
      inventoryService.getAll(projectId).catch((): InventoryItem[] => []),
      productionService.getAll(projectId).catch((): ProductionItem[] => []),
      profitGoalsService.getByProject(projectId).catch(() => null),
      projectsService.getAll().catch(() => [] as Awaited<ReturnType<typeof projectsService.getAll>>),
    ])

  const monthlyTarget = profitGoal?.monthlyTarget ?? 0
  const revenueHistory = await getRevenueHistory(projectId)

  const cover     = buildCoverHero(summary, monthlyTarget)
  const satellites = buildSatellites(summary)
  const donutSegments = buildDonutSegments(orders)
  const monthBars     = revenueHistory
  const queueDays     = buildQueueDays(production)
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

  const streak: StreakData = { days: 1 } // D1 fixo até streak real ser implementado

  const projectList = projects.map((p) => ({
    id:       p.id,
    name:     p.name,
    revenue:  0, // sem query de revenue por projeto na view geral
    isActive: p.id === projectId,
  }))

  return {
    userName,
    projectId,
    cover,
    satellites,
    nextAction: null, // Copiloto Wave 6 — backlog ADR-014
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
