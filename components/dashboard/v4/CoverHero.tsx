'use client'

/**
 * CoverHero.tsx — Bloco editorial principal (receita + satélites)
 *
 * Referência HTML: linhas 2633-2711 (v4-hibrido.html)
 * Classes: .cover · .cover-left · .cover-figure · .cover-progress
 *          .kpi-satellites · .kpi-mini-card
 *
 * Mecanismos de dopamina aplicados:
 * - #1 Variable reward: count-up animado (0 → R$ X em 1.2s)
 * - #3 Salience: número gigante 96px Fraunces
 * - #4 Loss aversion: barra de progresso + "faltam R$ X · N dias"
 * - #2 Zeigarnik: cérebro quer completar a barra
 *
 * count-up: implementado via requestAnimationFrame, CSS puro.
 * prefers-reduced-motion: saltar animação (valor final imediato).
 *
 * Dependência de interatividade: count-up + âncora dinâmica → 'use client'.
 */

import { useEffect, useRef, useState } from 'react'
import type { CoverHeroData, CoverAnchorState, KpiSatellite } from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function getAnchorState(progressPercent: number): CoverAnchorState {
  if (progressPercent >= 100) return 'pico'
  if (progressPercent >= 75)  return 'ok'
  if (progressPercent >= 25)  return 'atencao'
  return 'alerta'
}

/** Textos do âncora dinâmico por estado de meta. */
const ANCHOR_COPY: Record<CoverAnchorState, React.ReactNode> = {
  pico:    <>esse mês foi um <em>viraço</em>, meta batida, pode respirar.</>,
  ok:      <>esse mês <em>tá no ritmo</em>, recorde do trimestre, dá pra respirar.</>,
  atencao: <>dá pra recuperar, mas precisa <em>acelerar</em> essa semana.</>,
  alerta:  <>meta em risco — <em>precisa correr</em> pro mês não fechar no vermelho.</>,
}

// ---------------------------------------------------------------------------
// Sub-componente: count-up
// ---------------------------------------------------------------------------

interface CountUpProps {
  target: number
  /** Duração em ms. */
  duration?: number
}

function CountUp({ target, duration = 1200 }: CountUpProps) {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // Respeitar prefers-reduced-motion — usa requestAnimationFrame pra evitar
    // setState síncrono dentro de effect (react-hooks/set-state-in-effect).
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      const raf = requestAnimationFrame(() => setDisplayed(target))
      return () => cancelAnimationFrame(raf)
    }

    const start     = performance.now()
    const easeOut   = (t: number) => 1 - Math.pow(1 - t, 3)

    const step = (now: number) => {
      const elapsed  = Math.min(now - start, duration)
      const progress = easeOut(elapsed / duration)
      setDisplayed(Math.round(target * progress))
      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(step)
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  // Reinicia count-up ao voltar pelo bfcache
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setDisplayed(0)
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  return <>{formatBRL(displayed)}</>
}

// ---------------------------------------------------------------------------
// Sub-componente: KPI mini-card (satélite)
// ---------------------------------------------------------------------------

interface KpiMiniCardProps {
  satellite: KpiSatellite
}

function KpiMiniCard({ satellite }: KpiMiniCardProps) {
  const deltaClass =
    satellite.deltaDirection === 'up'      ? 'kpi-mini-delta up' :
    satellite.deltaDirection === 'down'    ? 'kpi-mini-delta down' :
                                              'kpi-mini-delta neutral'

  return (
    <article
      className={`kpi-mini-card${satellite.highlight ? ' highlight' : ''}`}
      aria-label={`${satellite.label}: ${satellite.displayValue}`}
    >
      <div className="kpi-mini-left">
        <span className="kpi-mini-label">{satellite.label}</span>
        <span className="kpi-mini-meta">{satellite.meta}</span>
      </div>
      <div className="kpi-mini-right">
        <span className="kpi-mini-value num">{satellite.displayValue}</span>
        <span className={deltaClass} aria-label={satellite.deltaText}>
          {satellite.deltaText}
        </span>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CoverHeroProps {
  data: CoverHeroData
  satellites: KpiSatellite[]
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function CoverHero({ data, satellites }: CoverHeroProps) {
  const anchorState = getAnchorState(data.progressPercent)
  const anchorCopy  = ANCHOR_COPY[anchorState]

  return (
    <section
      className="cover fade-in delay-1"
      aria-label="Visão geral do mês"
    >
      {/* ── COVER LEFT ── */}
      <div className="cover-left">
        <span className="cover-eyebrow">
          Receita do mês · {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} · até hoje
        </span>
        <div className="hairline" aria-hidden="true" />

        {/* Figura Fraunces 96px */}
        <h1 className="cover-figure num">
          <span className="currency">R$</span>
          <CountUp target={data.revenue} />
          <span className="decimal">,00</span>
        </h1>

        {/* Barra de progresso da meta */}
        <div
          className="cover-progress"
          role="progressbar"
          aria-label="Progresso da meta mensal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={data.progressPercent}
        >
          <div className="cover-progress-meta">
            <span className="cover-progress-pct num">
              {data.progressPercent.toFixed(0)}%
            </span>
            <span className="cover-progress-info">
              da meta · faltam{' '}
              <strong>R$ {formatBRL(data.remaining)}</strong> · {data.daysLeft} dias
            </span>
          </div>
          <div className="cover-progress-bar">
            <div
              className="cover-progress-fill"
              style={{ ['--target' as string]: `${data.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Âncora dinâmica */}
        <p
          className={`cover-anchor state-${anchorState}`}
          id="coverAnchor"
          data-progress={data.progressPercent}
        >
          {anchorCopy}
        </p>

        {/* Meta-linha */}
        <p className="cover-meta">
          {new Date().toLocaleDateString('pt-BR', { month: 'long' })}{' '}
          <span className="sep">·</span> {data.weekLabel}{' '}
          <span className="sep">·</span> atualizado há {data.lastUpdatedMin} min
          <br className="mobile-break" />
          <span className="sep mobile-hidden">·</span>{' '}
          <strong>+{data.revenueVsLastMonth.toFixed(1)}%</strong> vs mês anterior{' '}
          <span className="sep">·</span> {data.ordersCount} pedidos fechados
        </p>
      </div>

      {/* ── KPI SATÉLITES (coluna direita) ── */}
      <aside
        className="kpi-satellites"
        aria-label="Indicadores secundários do mês"
      >
        {satellites.map((s) => (
          <KpiMiniCard key={s.key} satellite={s} />
        ))}
      </aside>
    </section>
  )
}
