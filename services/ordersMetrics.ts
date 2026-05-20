/**
 * services/ordersMetrics.ts — Calculos derivados do modulo /orders
 *
 * Puro TS, zero React. Consumido por app/orders/page.tsx.
 * Cada funcao exportada cobre um gap de conteudo da Onda B.
 *
 * Criado: 2026-05-20 (onda B — B.1/B.2/B.3/B.4)
 */

import type { Order } from '@/lib/types'

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/** Retorna o inicio (00:00:00) de uma data sem alterar timezone local */
function startOfDay(d: Date): Date {
  const r = new Date(d)
  r.setHours(0, 0, 0, 0)
  return r
}

/** Segunda-feira da semana ISO da data informada */
function isoWeekMonday(d: Date): Date {
  const copy = new Date(d)
  const day  = copy.getDay() === 0 ? 7 : copy.getDay() // domingo = 7
  copy.setDate(copy.getDate() - day + 1)
  copy.setHours(0, 0, 0, 0)
  return copy
}

/** Domingo (fim) da semana ISO da data informada */
function isoWeekSunday(d: Date): Date {
  const mon = isoWeekMonday(d)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  sun.setHours(23, 59, 59, 999)
  return sun
}

/** Proximo dia util (seg-sex) a partir de "hoje" (exclui sabado/domingo) */
function nextWeekdayLabel(today: Date, daysAhead: number): string {
  const days: Record<number, string> = {
    0: 'domingo',
    1: 'segunda',
    2: 'terca',
    3: 'quarta',
    4: 'quinta',
    5: 'sexta',
    6: 'sabado',
  }
  const target = new Date(today)
  target.setDate(today.getDate() + daysAhead)
  return days[target.getDay()] ?? 'proximos dias'
}

/** Proximo dia util a partir de hoje (pula fds) */
function nextBusinessDayLabel(today: Date): string {
  const d = new Date(today)
  do {
    d.setDate(d.getDate() + 1)
  } while (d.getDay() === 0 || d.getDay() === 6)
  return nextWeekdayLabel(today, d.getDate() - today.getDate())
}

// ---------------------------------------------------------------------------
// B.1 — Numero da semana ISO do ano em PT-BR
// ---------------------------------------------------------------------------

/**
 * Retorna o numero da semana ISO do ano para a data informada.
 * Semana ISO: segunda como primeiro dia, semana 1 = semana com a 1a quinta.
 */
export function isoWeekNumber(d: Date): number {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum  = target.getUTCDay() || 7 // domingo = 7
  target.setUTCDate(target.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1))
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

// ---------------------------------------------------------------------------
// B.1 — Total entregues no mes corrente (independente do filtro de periodo)
// ---------------------------------------------------------------------------

/**
 * Conta pedidos com status 'delivered' dentro do mes corrente (1 ate hoje).
 * Ignora filtros de periodo selecionados — e o total do mes completo.
 */
export function totalEntreguesNoMes(orders: Order[], today = new Date()): number {
  const inicioMes = new Date(today.getFullYear(), today.getMonth(), 1)
  const fimMes    = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
  return orders.filter((o) => {
    if (o.status !== 'delivered') return false
    const d = new Date(o.date)
    return d >= inicioMes && d <= fimMes
  }).length
}

// ---------------------------------------------------------------------------
// B.2 — Dados para o subtitle maker BR humanizado
// ---------------------------------------------------------------------------

export interface SubtitleData {
  /** Pedidos com prazo na semana corrente e status != entregue */
  entregaNaSemana: number
  /** Dia mais proximo dentro da semana (ex: "sexta") */
  diaLimite:       string
  /** Pedidos com prazo < hoje e status != entregue */
  atrasados:       number
  /** Pedidos com status 'delivered' criados na semana corrente */
  saidosEssaSemana: number
  /** Estado calculado */
  estado:          'ritmo-certo' | 'atencao' | 'vazio'
}

/**
 * Calcula os dados para a frase viva humanizada do subtitulo.
 * Os pedidos nao possuem campo 'deadline'; usa-se 'date' como proxy de prazo.
 * Para ordens em producao/aguardando, assume prazo = date + 7 dias.
 */
export function calcSubtitleData(orders: Order[], today = new Date()): SubtitleData {
  if (orders.length === 0) {
    return {
      entregaNaSemana: 0,
      diaLimite:       'sexta',
      atrasados:       0,
      saidosEssaSemana: 0,
      estado:          'vazio',
    }
  }

  const todayStart  = startOfDay(today)
  const weekMonday  = isoWeekMonday(today)
  const weekSunday  = isoWeekSunday(today)

  // Proxy de prazo: pedidos ativos (lead/quote_sent/paid) tem prazo = date + 7d
  const withDeadline = orders
    .filter((o) => o.status !== 'delivered')
    .map((o) => {
      const orderDate = new Date(o.date)
      const deadline  = new Date(orderDate)
      deadline.setDate(orderDate.getDate() + 7)
      return { order: o, deadline }
    })

  // Pedidos pra entregar essa semana (deadline dentro da semana)
  const entregaNaSemana = withDeadline.filter(
    ({ deadline }) => deadline >= weekMonday && deadline <= weekSunday,
  ).length

  // Pedidos atrasados (deadline < hoje)
  const atrasados = withDeadline.filter(
    ({ deadline }) => deadline < todayStart,
  ).length

  // Pedidos entregues na semana corrente
  const saidosEssaSemana = orders.filter((o) => {
    if (o.status !== 'delivered') return false
    const d = new Date(o.date)
    return d >= weekMonday && d <= weekSunday
  }).length

  // Dia limite: proxima sexta ou domingo da semana, formatado
  const sexta = new Date(weekMonday)
  sexta.setDate(weekMonday.getDate() + 4)
  const diaLimite = today.getDay() <= 5 ? 'sexta' : 'domingo'

  const estado: SubtitleData['estado'] =
    orders.length === 0
      ? 'vazio'
      : atrasados > 0
      ? 'atencao'
      : 'ritmo-certo'

  return {
    entregaNaSemana,
    diaLimite,
    atrasados,
    saidosEssaSemana,
    estado,
  }
}

// ---------------------------------------------------------------------------
// B.3 — Ticket medio + delta semana atual vs semana anterior
// ---------------------------------------------------------------------------

export interface HeroKpiData {
  count:       number
  totalPago:   number
  ticketMedio: number
  /** Delta em formato "+X%" ou "-X%" vs semana anterior. Null se sem dados ant. */
  delta:       string | null
}

/** Status considerados "fechados" para o hero KPI */
const CLOSED: ReadonlySet<Order['status']> = new Set(['paid', 'delivered'])

/**
 * Calcula metricas do hero KPI (faturado, ticket medio, delta semana).
 * Considera todos os pedidos de `orders` (ja filtrados por projeto se necessario).
 */
export function calcHeroKpiData(orders: Order[], today = new Date()): HeroKpiData {
  const fechados = orders.filter((o) => CLOSED.has(o.status))

  const count      = fechados.length
  const totalPago  = fechados.reduce((s, o) => s + (o.value ?? 0), 0)
  const ticketMedio = count > 0 ? totalPago / count : 0

  // Faturado semana atual
  const weekMonday  = isoWeekMonday(today)
  const weekSunday  = isoWeekSunday(today)
  const faturadoAtual = fechados
    .filter((o) => {
      const d = new Date(o.date)
      return d >= weekMonday && d <= weekSunday
    })
    .reduce((s, o) => s + (o.value ?? 0), 0)

  // Faturado semana anterior
  const prevMonday = new Date(weekMonday)
  prevMonday.setDate(weekMonday.getDate() - 7)
  const prevSunday = new Date(weekSunday)
  prevSunday.setDate(weekSunday.getDate() - 7)
  const faturadoAnterior = fechados
    .filter((o) => {
      const d = new Date(o.date)
      return d >= prevMonday && d <= prevSunday
    })
    .reduce((s, o) => s + (o.value ?? 0), 0)

  let delta: string | null = null
  if (faturadoAnterior > 0) {
    const pct = ((faturadoAtual - faturadoAnterior) / faturadoAnterior) * 100
    const sign = pct >= 0 ? '+' : ''
    const semRef = isoWeekNumber(prevMonday)
    delta = `${pct >= 0 ? '▲' : '▼'} ${sign}${Math.round(pct)}% vs sem ${String(semRef).padStart(2, '0')}`
  }

  return { count, totalPago, ticketMedio, delta }
}

// ---------------------------------------------------------------------------
// B.4 — Dados do satellite ATRASADOS
// ---------------------------------------------------------------------------

export interface AtrasadosData {
  count:        number
  /** Primeiros 3 nomes de cliente (exibidos no description) */
  clientNames:  string[]
  /** Urgencia label: "resolver ate {proximo dia util}" */
  urgenciaLabel: string
}

/**
 * Calcula dados para o satellite KPI de ATRASADOS.
 * Pedido atrasado = deadline (date + 7d) < hoje e status != delivered.
 */
export function calcAtrasadosData(orders: Order[], today = new Date()): AtrasadosData {
  const todayStart = startOfDay(today)

  const atrasados = orders
    .filter((o) => {
      if (o.status === 'delivered') return false
      const deadline = new Date(o.date)
      deadline.setDate(deadline.getDate() + 7)
      return deadline < todayStart
    })
    .sort((a, b) => a.date.localeCompare(b.date)) // mais antigos primeiro

  const count       = atrasados.length
  const clientNames = atrasados.slice(0, 3).map((o) => o.clientName.split(' ')[0])
  const urgenciaLabel = `resolver ate ${nextBusinessDayLabel(today)}`

  return { count, clientNames, urgenciaLabel }
}

// ---------------------------------------------------------------------------
// B.6 — Calculo de dias de atraso por pedido
// ---------------------------------------------------------------------------

/**
 * Retorna quantos dias o pedido esta atrasado (0 se nao atrasado).
 * Prazo proxy = date + 7 dias. So aplica em pedidos != delivered.
 */
export function diasAtraso(order: Order, today = new Date()): number {
  if (order.status === 'delivered') return 0
  const deadline = new Date(order.date)
  deadline.setDate(deadline.getDate() + 7)
  const todayStart = startOfDay(today)
  if (deadline >= todayStart) return 0
  const diff = todayStart.getTime() - deadline.getTime()
  return Math.floor(diff / 86400000)
}
