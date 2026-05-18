'use client'

/**
 * BentoGrid.tsx — Grade de 7 painéis operacionais (4 colunas)
 *
 * Referência HTML: linhas 2766-3149 (v4-hibrido.html)
 * Classes: .bento-grid · .bento-card · .span-2 · .span-4 · .highlight
 *          .donut-wrap · .bars-vertical · .queue-bars · .gauge-wrap
 *          .mini-list · .now-printing · .alert-filament
 *
 * 7 cards MVP aprovados (ADR-014):
 * 1. DonutCard     — Margem por canal (span 2, highlight)
 * 2. BarsCard      — Lucro 6 meses (span 2)
 * 3. QueueCard     — Fila Bambu 7 dias (span 1)
 * 4. GaugeCard     — Meta mensal % (span 1)
 * 5. TopCard       — Top 5 produtos lucro (span 1)
 * 6. NowPrintCard  — Em produção agora (span 1, highlight)
 * 7. AlertCard     — Alerta filamento crítico (span 4, full width)
 *
 * Todas as animações (barGrow, donutGrow, gaugeGrow, rowGrow) são CSS puro.
 * prefers-reduced-motion: skip via CSS global (v4-hibrido.html linha 2377-2395).
 *
 * Interatividade: tabindex + hover nos cards → CSS. Botão "Comprar agora"
 * no AlertCard → precisa 'use client'.
 *
 * TODO (backlog ADR-014): tooltips Recharts ao hover (Wave 4).
 */

import { RootHover } from './RootHover'
import type {
  DonutSegment,
  MonthBar,
  QueueDay,
  GoalGaugeData,
  TopProduct,
  ActivePrintJob,
  StockAlert,
} from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

// ---------------------------------------------------------------------------
// 1. Donut Card — Margem por canal
// ---------------------------------------------------------------------------

interface DonutCardProps {
  segments: DonutSegment[]
  avgMargin: number
}

function DonutCard({ segments, avgMargin }: DonutCardProps) {
  // SVG donut: circunferência = 2π × r36 ≈ 226.19
  const CIRCUMFERENCE = 226.19

  // Pré-computa offsets com reduce para evitar mutação de variável durante render
  // (react-hooks/immutability não permite `let offset = 0; offset += len` em .map())
  const segmentsWithOffsets = segments.reduce<
    Array<{ seg: DonutSegment; len: number; currOff: number; delay: number }>
  >((acc, seg, i) => {
    const prevOffset = acc.length > 0 ? acc[acc.length - 1].currOff + acc[acc.length - 1].len : 0
    const len = (seg.revenuePercent / 100) * CIRCUMFERENCE
    acc.push({ seg, len, currOff: -prevOffset, delay: 200 + i * 150 })
    return acc
  }, [])

  return (
    <article
      className="bento-card span-2 highlight"
      tabIndex={0}
      aria-labelledby="donut-title"
    >
      <RootHover />
      <header className="bento-header">
        <div>
          <div className="card-eyebrow">Margem por canal</div>
          <div className="card-title" id="donut-title">Margem por canal de venda</div>
        </div>
        <a href="/finance" className="card-action">ver detalhe →</a>
      </header>

      <div className="donut-wrap">
        {/* SVG donut */}
        <div
          className="donut-svg"
          role="img"
          aria-label="Distribuição de margem por canal de venda"
        >
          <svg viewBox="0 0 100 100" aria-hidden="true">
            {/* Anel de fundo */}
            <circle
              cx="50" cy="50" r="36"
              stroke="rgba(242,239,234,0.06)"
              strokeWidth="20"
              fill="none"
            />
            {/* Segmentos animados */}
            {segmentsWithOffsets.map(({ seg, len, currOff, delay }) => (
              <circle
                key={seg.channel}
                className="donut-arc"
                cx="50" cy="50" r="36"
                stroke={seg.color}
                strokeWidth="20"
                fill="none"
                role="img"
                aria-label={`${seg.channel}: ${seg.revenuePercent}% do faturamento, ${seg.marginPercent}% de margem`}
                style={{
                  ['--len' as string]:   len,
                  ['--off' as string]:   currOff,
                  ['--delay' as string]: `${delay}ms`,
                }}
              />
            ))}
          </svg>
          <div className="donut-center">
            <span className="label">média</span>
            <span className="value num">{avgMargin.toFixed(1)}%</span>
          </div>
        </div>

        {/* Legenda */}
        <div className="donut-legend" role="list">
          {segments.map((seg) => (
            <div className="legend-row" role="listitem" key={seg.channel}>
              <span className="legend-dot" style={{ background: seg.color }} />
              <span className="legend-name">
                {seg.channel}
                {seg.channelFee > 0 && (
                  <span style={{ color: 'var(--fog-400)', fontSize: '12px' }}>
                    {' · '}{seg.channelFee}%
                  </span>
                )}
              </span>
              <span className="legend-val num">{seg.marginPercent}%</span>
            </div>
          ))}
        </div>
      </div>
      <p className="footnote">
        Margem líquida pós-comissão · últimos 30 dias · WhatsApp puxa pra cima.
      </p>
    </article>
  )
}

// ---------------------------------------------------------------------------
// 2. Bars Card — Lucro 6 meses
// ---------------------------------------------------------------------------

function BarsCard({ bars }: { bars: MonthBar[] }) {
  return (
    <article
      className="bento-card span-2"
      tabIndex={0}
      aria-labelledby="bar-title"
    >
      <RootHover />
      <header className="bento-header">
        <div>
          <div className="card-eyebrow">Lucro · 6 meses</div>
          <div className="card-title" id="bar-title">A subida é real</div>
        </div>
        <a href="/finance" className="card-action">exportar CSV</a>
      </header>

      <div
        className="bars-vertical"
        role="img"
        aria-label="Lucro mensal dos últimos 6 meses em barras verticais"
      >
        {bars.map((bar, i) => (
          <div className="bar-col" key={bar.monthLabel}>
            <span
              className="bar-val num"
              style={{ animationDelay: `${100 + i * 80}ms` }}
            >
              R$ {(bar.value / 1000).toFixed(1)}k
            </span>
            <div
              className={`bar${bar.isCurrent ? ' current' : ''}`}
              style={{
                height: `${bar.heightPercent}%`,
                animationDelay: `${100 + i * 80}ms`,
              }}
              aria-hidden="true"
            />
            <span className="bar-label">{bar.monthLabel}</span>
          </div>
        ))}
      </div>

      <div className="bento-footer" style={{ marginTop: '18px' }}>
        <span className="bento-footer-mono">Mês atual em âmbar</span>
        <a href="/finance" className="card-action">ver série completa →</a>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// 3. Queue Card — Fila impressora 7 dias
// ---------------------------------------------------------------------------

function QueueCard({ days }: { days: QueueDay[] }) {
  const totalJobs     = days.reduce((acc, d) => acc + d.jobCount, 0)
  const todayJobs     = days.find((d) => d.isToday)?.jobCount ?? 0

  return (
    <article
      className="bento-card"
      tabIndex={0}
      aria-labelledby="queue-title"
    >
      <RootHover />
      <header className="bento-header">
        <div>
          <div className="card-eyebrow">Fila de impressão · 7 dias</div>
          <div className="card-title" id="queue-title">Bambu X1 + Ender V3 SE</div>
        </div>
      </header>

      <div
        className="queue-bars"
        role="img"
        aria-label="Trabalhos por dia da semana, hoje em destaque"
      >
        {days.map((day, i) => (
          <div className="queue-col" key={day.dayLabel}>
            <div
              className={`queue-bar${day.isToday ? ' today' : ''}`}
              style={{
                height: `${day.heightPercent}%`,
                animationDelay: `${80 + i * 60}ms`,
              }}
              aria-label={`${day.isToday ? 'Hoje' : day.dayLabel}: ${day.jobCount} jobs`}
            />
            <span className={`queue-day${day.isToday ? ' today' : ''}`}>
              {day.dayLabel}
            </span>
          </div>
        ))}
      </div>

      <div className="queue-foot">
        <span>{totalJobs} jobs esta semana</span>
        <span className="em">{todayJobs} hoje</span>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// 4. Gauge Card — Meta mensal
// ---------------------------------------------------------------------------

function GaugeCard({ goal }: { goal: GoalGaugeData }) {
  // Semi-circunferência: π × r80 ≈ 251.33; target = percent * 251.33 / 100
  const SEMI_CIRCUM = 251.33
  const fillTarget  = (goal.percent / 100) * SEMI_CIRCUM

  return (
    <article
      className="bento-card"
      tabIndex={0}
      aria-labelledby="gauge-title"
    >
      <RootHover />
      <header className="bento-header">
        <div>
          <div className="card-eyebrow">Meta de maio</div>
          <div className="card-title" id="gauge-title">
            {goal.percent.toFixed(0)}% caminhado
          </div>
        </div>
      </header>

      <div
        className="gauge-wrap"
        role="img"
        aria-label={`Gauge da meta mensal: ${goal.percent.toFixed(0)}% atingido de R$ ${formatBRL(goal.targetValue)}`}
      >
        <svg viewBox="0 0 200 110" aria-hidden="true">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#155A50" />
              <stop offset="55%"  stopColor="#1F7669" />
              <stop offset="100%" stopColor="#6FB5A8" />
            </linearGradient>
          </defs>
          {/* Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            stroke="rgba(242,239,234,0.07)"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
          />
          {/* Fill animado */}
          <path
            className="gauge-fill"
            d="M 20 100 A 80 80 0 0 1 180 100"
            stroke="url(#gaugeGrad)"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            style={{ ['--target' as string]: fillTarget }}
          />
          {/* Threshold 70% */}
          <line
            x1="146" y1="33" x2="153" y2="40"
            stroke="rgba(208,138,74,0.45)"
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />
        </svg>
        <div className="gauge-center">
          <div className="gauge-value num">{goal.percent.toFixed(0)}%</div>
          <div className="gauge-anchor">{goal.anchor}</div>
        </div>
      </div>

      <div className="gauge-thresholds">
        <span>0</span>
        <span>
          ALVO <strong>R$ {formatBRL(goal.targetValue)}</strong>
        </span>
        <span>100%</span>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// 5. Top Card — Top 5 produtos por lucro
// ---------------------------------------------------------------------------

function TopCard({ products }: { products: TopProduct[] }) {
  return (
    <article
      className="bento-card"
      tabIndex={0}
      aria-labelledby="top-title"
    >
      <RootHover />
      <header className="bento-header">
        <div>
          <div className="card-eyebrow">Top 5 · mês</div>
          <div className="card-title" id="top-title">Quem deu mais lucro</div>
        </div>
      </header>

      <div className="mini-list">
        {products.map((p) => (
          <div className="mini-list-item" key={p.name}>
            <div style={{ minWidth: 0 }}>
              <div className="name">{p.name}</div>
              <span className="who">{p.buyer} · {p.qty} un.</span>
            </div>
            <span className={`meta${p.highlight ? ' petrol' : ''}`}>
              R$ {formatBRL(p.profit)}
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// 6. Now Print Card — Em produção agora
// ---------------------------------------------------------------------------

function NowPrintCard({ jobs }: { jobs: ActivePrintJob[] }) {
  return (
    <article
      className="bento-card highlight"
      tabIndex={0}
      aria-labelledby="now-title"
    >
      <RootHover />
      <header className="bento-header">
        <div>
          <div className="card-eyebrow">Imprimindo · agora</div>
          <div className="card-title" id="now-title">
            {jobs.length} {jobs.length === 1 ? 'peça' : 'peças'} nas máquinas
          </div>
        </div>
        <span className="pill-petrol" aria-label="Dados ao vivo">ao vivo</span>
      </header>

      <div className="now-printing">
        {jobs.map((job) => (
          <div className="now-print-item" key={`${job.printer}-${job.itemName}`}>
            <span className="now-print-led" aria-hidden="true" />
            <div className="now-print-name">
              {job.printer}
              <span className="who">{job.itemName} · {job.clientName}</span>
            </div>
            <span className="now-print-time">{job.remainingTime}</span>
            <div
              className="now-print-progress"
              aria-label={`${job.progressPercent}% concluído`}
            >
              <div
                className="now-print-progress-fill"
                style={{
                  width: `${job.progressPercent}%`,
                  animationDelay: '600ms',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// 7. Alert Card — Filamento crítico (span 4)
// ---------------------------------------------------------------------------

function AlertCard({ alert }: { alert: StockAlert }) {
  return (
    <article
      className="bento-card span-4"
      tabIndex={0}
      aria-labelledby="alert-title"
    >
      <RootHover />
      <header className="bento-header">
        <div>
          <div className="card-eyebrow">Atenção · estoque crítico</div>
          <div className="card-title" id="alert-title">
            {alert.materialName} pra acabar
          </div>
        </div>
        <span className="pill-warning">{alert.urgencyLabel}</span>
      </header>

      <div className="alert-filament">
        <div className="alert-icon-wrap" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3L2 20h20L12 3z" />
            <line x1="12" y1="10" x2="12" y2="14" />
            <circle cx="12" cy="17" r="0.6" fill="currentColor" />
          </svg>
        </div>

        <div className="alert-body">
          <span className="alert-title">
            <em>{alert.materialName}</em> acaba em{' '}
            <strong style={{ color: 'var(--ember-400)' }}>
              {alert.daysUntilEmpty} {alert.daysUntilEmpty === 1 ? 'dia' : 'dias'}
            </strong>{' '}
            no ritmo atual
          </span>
          <span className="alert-sub">
            Spool atual em <strong>{alert.currentGrams}g</strong> · consumo médio{' '}
            <strong>{alert.dailyConsumptionGrams}g/dia</strong> esta semana ·
            preço <strong>R$ {alert.pricePerKg}/kg</strong>.{' '}
            {alert.affectedPrinters.join(' + ')} puxam do mesmo spool.
            Sem reposição, fila para.
          </span>
        </div>

        <button
          className="alert-cta"
          type="button"
          aria-label={`Comprar ${alert.materialName} agora`}
        >
          Comprar agora
          <svg
            width="14" height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// Props do BentoGrid
// ---------------------------------------------------------------------------

interface BentoGridProps {
  donutSegments: DonutSegment[]
  monthBars: MonthBar[]
  queueDays: QueueDay[]
  goal: GoalGaugeData
  topProducts: TopProduct[]
  activePrintJobs: ActivePrintJob[]
  stockAlerts: StockAlert[]
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function BentoGrid({
  donutSegments,
  monthBars,
  queueDays,
  goal,
  topProducts,
  activePrintJobs,
  stockAlerts,
}: BentoGridProps) {
  const avgMargin =
    donutSegments.length > 0
      ? donutSegments.reduce((acc, s) => acc + s.marginPercent * s.revenuePercent, 0) / 100
      : 0

  return (
    <>
      {/* Section header */}
      <div className="section-header fade-in delay-2">
        <h2 className="section-title">
          O que tá <em>acontecendo</em>
        </h2>
        <span className="section-tag">
          {7 - (stockAlerts.length > 0 ? 0 : 1)} painéis · atualiza sozinho
        </span>
      </div>

      {/* Grid */}
      <section
        className="bento-grid fade-in delay-2"
        aria-label="Painéis operacionais"
      >
        <DonutCard segments={donutSegments} avgMargin={avgMargin} />
        <BarsCard bars={monthBars} />
        <QueueCard days={queueDays} />
        <GaugeCard goal={goal} />
        <TopCard products={topProducts} />
        <NowPrintCard jobs={activePrintJobs} />
        {stockAlerts.map((alert) => (
          <AlertCard key={alert.materialName} alert={alert} />
        ))}
      </section>
    </>
  )
}
