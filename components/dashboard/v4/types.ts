/**
 * types.ts — Tipos compartilhados do Dashboard V4.8
 *
 * Referência visual: mockups/dashboard/v4-hibrido.html
 * ADR: decisions/014-dashboard-v4-aprovado-mvp.md
 *
 * Convenção: todos os dados financeiros vêm de services/ (finance.ts,
 * financeConfig.ts, orders.ts). Este arquivo define os shapes que os
 * componentes do dashboard consomem — derivados dos types do domínio,
 * não duplicados.
 */

// ---------------------------------------------------------------------------
// Tema
// ---------------------------------------------------------------------------

/** Persistido em localStorage sob a chave 'hayzer-theme'. */
export type DashboardTheme = 'dark' | 'light'

// ---------------------------------------------------------------------------
// KPI Hero (cover-figure)
// ---------------------------------------------------------------------------

/**
 * Dados do bloco hero principal (cover-left):
 * receita, meta, âncora dinâmica e deltas.
 *
 * HTML referência: linha 2636–2660 (cover-left + cover-progress).
 */
export interface CoverHeroData {
  /** Receita bruta acumulada no mês corrente (R$). Alimenta count-up. */
  revenue: number
  /** Meta mensal configurada no projeto (profit_goals.monthly_target). */
  monthlyTarget: number
  /** Percentual atingido: (revenue / monthlyTarget) × 100. */
  progressPercent: number
  /** Valor restante para bater a meta. */
  remaining: number
  /** Dias úteis restantes no mês. */
  daysLeft: number
  /** Variação percentual vs mês anterior (ex: +26.8). */
  revenueVsLastMonth: number
  /** Total de pedidos fechados no mês. */
  ordersCount: number
  /** Label de semana corrente (ex: "sem 03"). */
  weekLabel: string
  /** Minutos desde última atualização. */
  lastUpdatedMin: number
}

/**
 * Estado do âncora dinâmico baseado em progressPercent.
 * HTML referência: linha 833-836 (cover-anchor states).
 */
export type CoverAnchorState = 'pico' | 'ok' | 'atencao' | 'alerta'

// ---------------------------------------------------------------------------
// KPI Satélites
// ---------------------------------------------------------------------------

/**
 * Variação de um KPI: positiva, negativa ou neutra (sem juízo de valor).
 * HTML referência: .kpi-mini-delta.up / .down / .neutral — linha 1050-1052.
 */
export type DeltaDirection = 'up' | 'down' | 'neutral'

/**
 * Um card satélite individual (4 ao total: Lucro, Margem, Custos, Pedidos).
 * HTML referência: .kpi-mini-card — linha 949-1052.
 */
export interface KpiSatellite {
  /** Chave única para identificar o satélite (não exibida). */
  key: string
  /** Label em PT-BR: "Lucro líquido", "Margem média", etc. */
  label: string
  /** Texto auxiliar abaixo do label: contexto extra. */
  meta: string
  /**
   * Valor formatado para exibição. Strings permitem sufixos arbitrários
   * (ex: "68,8%", "R$ 8.590", "47").
   */
  displayValue: string
  /** Delta textual (ex: "▲ +26,7% vs abr"). */
  deltaText: string
  deltaDirection: DeltaDirection
  /** Se true, aplica glow petrol e borda destacada (.highlight). */
  highlight?: boolean
}

// ---------------------------------------------------------------------------
// Próxima Ação
// ---------------------------------------------------------------------------

/**
 * Card "Próxima ação sugerida" — placeholder para o Copiloto Wave 6.
 * HTML referência: .next-action — linha 2123-2223.
 */
export interface NextActionData {
  /** Mensagem principal (aceita <strong> para destaque). */
  message: string
  /** Texto do botão primário. */
  ctaLabel: string
  /** Rota ou callback do CTA. */
  ctaHref?: string
  onCtaClick?: () => void
  onDismiss?: () => void
}

// ---------------------------------------------------------------------------
// Bento Grid — cards individuais
// ---------------------------------------------------------------------------

/**
 * Segmento do donut (margem por canal).
 * HTML referência: .donut-arc + .legend-row — linha 2797-2848.
 */
export interface DonutSegment {
  /** Nome do canal: "WhatsApp", "Mercado Livre", etc. */
  channel: string
  /** Percentual da receita total (soma dos segmentos = 100). */
  revenuePercent: number
  /** Margem líquida neste canal (pós-comissão). */
  marginPercent: number
  /** Comissão do canal em percentual (0 para direto). */
  channelFee: number
  /** Cor hex do segmento no SVG. */
  color: string
}

/**
 * Barra do gráfico de lucro mensal (6 meses).
 * HTML referência: .bar-col — linha 2873-2907.
 */
export interface MonthBar {
  /** Abreviação do mês em PT-BR: "DEZ", "JAN", etc. */
  monthLabel: string
  /** Valor do lucro (R$). */
  value: number
  /** Altura percentual relativa ao mês com maior valor (0-100). */
  heightPercent: number
  /** Se true, renderiza barra em âmbar (mês corrente). */
  isCurrent: boolean
}

/**
 * Trabalho na fila da impressora (sparkline 7 dias).
 * HTML referência: .queue-col — linha 2929-2936.
 */
export interface QueueDay {
  /** Abreviação do dia: "SÁB", "DOM", ..., "HOJE". */
  dayLabel: string
  /** Quantidade de jobs. */
  jobCount: number
  /** Altura percentual relativa ao dia com mais jobs (0-100). */
  heightPercent: number
  /** Se true, barra em âmbar + label "HOJE". */
  isToday: boolean
}

/**
 * Item na fila de impressão em andamento ("Em produção agora").
 * HTML referência: .now-print-item — linha 3068-3101.
 */
export interface ActivePrintJob {
  /** Nome da impressora (ex: "Bambu Lab X1-Carbon"). */
  printer: string
  /** Nome do item sendo impresso. */
  itemName: string
  /** Nome do cliente. */
  clientName: string
  /** Tempo restante formatado (ex: "3h12min"). */
  remainingTime: string
  /** Progresso 0-100. */
  progressPercent: number
}

/**
 * Produto no ranking de lucro (top 5).
 * HTML referência: .mini-list-item — linha 3009-3045.
 */
export interface TopProduct {
  name: string
  /** Quem comprou / referência. */
  buyer: string
  /** Quantidade vendida no mês. */
  qty: number
  /** Lucro total gerado no mês (R$). */
  profit: number
  /** Se true, usa cor petrol no valor (top performers). */
  highlight: boolean
}

/**
 * Alerta de estoque crítico (card span-4).
 * HTML referência: .alert-filament — linha 2858-1924.
 */
export interface StockAlert {
  /** Nome do material: "PLA Preto Voolt". */
  materialName: string
  /** Dias até esgotar no ritmo atual. */
  daysUntilEmpty: number
  /** Estoque atual em gramas. */
  currentGrams: number
  /** Consumo diário médio em gramas. */
  dailyConsumptionGrams: number
  /** Preço por kg (R$). */
  pricePerKg: number
  /** Impressoras afetadas. */
  affectedPrinters: string[]
  /** Prazo humano (ex: "comprar até segunda"). */
  urgencyLabel: string
}

// ---------------------------------------------------------------------------
// Gauge de meta
// ---------------------------------------------------------------------------

/**
 * Dados do gauge semi-circular da meta mensal.
 * HTML referência: .gauge-wrap — linha 2961-2988.
 */
export interface GoalGaugeData {
  /** Percentual atingido (0-100). */
  percent: number
  /** Meta em R$ (exibida nos thresholds). */
  targetValue: number
  /** Âncora Fraunces italic embaixo do valor. */
  anchor: string
}

// ---------------------------------------------------------------------------
// Streak
// ---------------------------------------------------------------------------

/**
 * Dados da streak pill fixa canto inferior esquerdo.
 * HTML referência: .streak-pill — linha 3184-3192.
 */
export interface StreakData {
  /** Dias consecutivos de uso. */
  days: number
}

// ---------------------------------------------------------------------------
// Dados agregados do dashboard (consumido pela page SSR)
// ---------------------------------------------------------------------------

/**
 * Shape completo dos dados do Dashboard V4.
 * A page.tsx (Server Component) computa estes dados a partir dos services
 * e os passa via props para DashboardLayout (Client Component).
 *
 * Separação intencional: services/ → cálculo → DashboardData → componentes.
 * Nenhum componente faz fetch direto.
 */
export interface DashboardData {
  /** Nome do usuário para o greeting personalizado. */
  userName: string
  /** ID do projeto ativo (multi-tenant, obrigatório). */
  projectId: string
  cover: CoverHeroData
  satellites: KpiSatellite[]
  nextAction: NextActionData | null
  donutSegments: DonutSegment[]
  monthBars: MonthBar[]
  queueDays: QueueDay[]
  activePrintJobs: ActivePrintJob[]
  topProducts: TopProduct[]
  stockAlerts: StockAlert[]
  goal: GoalGaugeData
  streak: StreakData
  /** Lista de projetos para o switcher. */
  projects: Array<{ id: string; name: string; revenue: number; isActive: boolean }>
}
