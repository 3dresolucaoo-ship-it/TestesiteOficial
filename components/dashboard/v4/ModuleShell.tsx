'use client'

/**
 * ModuleShell.tsx — Shell editorial V4 para todos os módulos do dashboard.
 *
 * Extrai o pattern visual do mockup orders-v4-tom-novo.html e expoe como
 * componente reusavel. Cada modulo importa e passa seus dados via props;
 * o conteudo principal (tabela, cards, etc.) vai como children.
 *
 * Blocos presentes:
 *   1. PageHeader   — eyebrow mono + titulo Fraunces 64px + frase viva + acoes
 *   2. KpiRow       — 1 card hero petrol glow + N cards satelite
 *   3. FilterBar    — tabs horizontais com contagem + search input
 *   4. children     — conteudo livre (tabela, grid, cards)
 *
 * Visual library usada: UnderlineMarker, GlowPetrol, RootSvg
 * Convencoes: zero em-dash, PT-BR em UI, TypeScript estrito, zero any
 *
 * ADR referencia: decisions/014-dashboard-v4-aprovado-mvp.md
 * Mockup referencia: mockups/orders-v4-tom-novo.html
 */

import { useCallback, useState, useId } from 'react'
import { UnderlineMarker } from '@/components/visual-library'
import { GlowPetrol }      from '@/components/visual-library'
import { RootSvg }         from '@/components/visual-library'
import { useCountUp }      from '@/lib/hooks/useCountUp'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModuleShellAction {
  label:    string
  onClick:  () => void
  icon?:    React.ReactNode
}

export interface ModuleShellHeroKpi {
  /** Eyebrow mono acima do valor. Ex: "FATURADO · 7 DIAS" */
  label:        string
  /** Valor principal formatado. Ex: "R$ 4.280" */
  value:        string
  /** Sufixo menor do valor. Ex: ",50" */
  unit?:        string
  /** Delta textual. Ex: "+18% vs sem 02" */
  delta?:       string
  /** Linha descritiva abaixo do valor. */
  description?: string
}

export type KpiTone = 'neutral' | 'ember' | 'red' | 'petrol'

export interface ModuleShellSatelliteKpi {
  label:        string
  value:        string
  description?: string
  /** Texto de alerta pequeno (ex: "resolver ate quinta"). */
  alertText?:   string
  tone?:        KpiTone
}

export interface ModuleShellTab {
  id:      string
  label:   string
  count:   number
  active?: boolean
}

export interface ModuleShellProps {
  // --- Header ---
  /** Texto mono uppercase do eyebrow. Ex: "MAIO · SEM 03 · 12 ABERTOS · 35 ENTREGUES" */
  eyebrow:            string
  /** Palavra principal em Fraunces 64px. Ex: "Pedidos" */
  title:              string
  /** Sufixo italic subescrito com UnderlineMarker ember. Ex: "essa semana" */
  titleItalicSuffix?: string
  /**
   * Frase viva abaixo do titulo. Aceita ReactNode para incluir
   * UnderlineMarker ou HighlightedText inline.
   */
  livePhrase?:        React.ReactNode
  /** Botao primario petrol (ex: "Novo pedido"). */
  primaryAction?:     ModuleShellAction
  /** Botao ghost secundario (ex: "Exportar CSV"). */
  secondaryAction?:   ModuleShellAction

  // --- KPIs ---
  heroKpi:         ModuleShellHeroKpi
  satelliteKpis:   ModuleShellSatelliteKpi[]

  // --- Filter bar ---
  tabs:               ModuleShellTab[]
  onTabChange:        (id: string) => void
  searchPlaceholder?: string
  onSearch:           (q: string) => void

  // --- Conteudo ---
  children: React.ReactNode

  /** Classe extra aplicada no wrapper externo (raramente necessario). */
  className?: string
}

// ---------------------------------------------------------------------------
// Sub: KpiHeroCard
// ---------------------------------------------------------------------------

/** Extrai número de string formatada tipo "R$ 4.280" ou "90". Retorna null se não houver. */
function extractNumber(value: string): number | null {
  const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : Math.round(n)
}

/** Extrai prefixo textual antes do número. Ex: "R$ 4.280" → "R$ " */
function extractPrefix(value: string): string {
  const match = value.match(/^([^\d]*)[\d]/)
  return match ? match[1] : ''
}

interface KpiHeroCardProps {
  kpi: ModuleShellHeroKpi
}

function KpiHeroCard({ kpi }: KpiHeroCardProps) {
  const numericTarget = extractNumber(kpi.value)
  const prefix        = extractPrefix(kpi.value)
  const animated      = useCountUp(numericTarget ?? 0, 800)

  // Formata número animado com separador de milhar BR
  const animatedFormatted = (numericTarget !== null)
    ? animated.toLocaleString('pt-BR')
    : null

  return (
    <article
      className="kpi-card hero-petrol fade-in delay-1"
      aria-label={`${kpi.label}: ${kpi.value}${kpi.unit ?? ''}`}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Glow interno via GlowPetrol (mais suave que o blob landing) */}
      <GlowPetrol
        tone="petrol"
        size="md"
        opacity={0.18}
        className="absolute -top-12 -right-12"
      />

      <span className="kpi-eyebrow">{kpi.label}</span>

      <div className="kpi-value num" style={{ fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)' }}>
        {animatedFormatted !== null ? (
          <>
            {prefix}{animatedFormatted}
          </>
        ) : (
          kpi.value
        )}
        {kpi.unit && (
          <span className="decimal">{kpi.unit}</span>
        )}
      </div>

      {kpi.delta && (
        <span className="kpi-delta up" aria-label={`Variacao: ${kpi.delta}`}>
          {kpi.delta}
        </span>
      )}

      {kpi.description && (
        <p className="kpi-sub" style={{ marginTop: 8 }}>
          {kpi.description}
        </p>
      )}

      {/* Raizes decorativas canto inferior direito */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -10,
          right: -10,
          opacity: 0.28,
          pointerEvents: 'none',
        }}
      >
        <RootSvg tone="neutral" size="sm" static />
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// Sub: KpiSatelliteCard
// ---------------------------------------------------------------------------

const satAlertColor: Record<KpiTone, string> = {
  neutral: 'var(--petrol-300, hsl(173 35% 60%))',
  petrol:  'var(--petrol-300, hsl(173 35% 60%))',
  ember:   'var(--ember-300, hsl(28 67% 70%))',
  red:     'var(--signal-red, hsl(14 66% 66%))',
}

const satValueColor: Record<KpiTone, string> = {
  neutral: 'var(--fog-50, #F2EFEA)',
  petrol:  'var(--petrol-200, #A6D4CC)',
  ember:   'var(--ember-300, hsl(28 67% 70%))',
  red:     'var(--signal-red, hsl(14 66% 66%))',
}

function KpiSatelliteCard({ kpi }: { kpi: ModuleShellSatelliteKpi }) {
  const tone = kpi.tone ?? 'neutral'
  const valueColor = satValueColor[tone]
  const alertColor = satAlertColor[tone]

  return (
    <article
      className="kpi-card fade-in delay-2"
      aria-label={`${kpi.label}: ${kpi.value}`}
    >
      <span className="kpi-eyebrow">{kpi.label}</span>

      <div
        className="kpi-value num"
        style={{
          color: valueColor,
          fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
        }}
      >
        {kpi.value}
      </div>

      {kpi.description && (
        <p className="kpi-sub">{kpi.description}</p>
      )}

      {kpi.alertText && (
        <p
          className="kpi-sub"
          style={{
            marginTop: 6,
            color: alertColor,
            fontSize: 12,
            fontFamily: 'var(--font-geist-mono, "Geist Mono", monospace)',
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
          }}
          aria-label={`Alerta: ${kpi.alertText}`}
        >
          {kpi.alertText}
        </p>
      )}
    </article>
  )
}

// ---------------------------------------------------------------------------
// Sub: FilterBar
// ---------------------------------------------------------------------------

interface FilterBarProps {
  tabs:               ModuleShellTab[]
  activeTabId:        string
  onTabChange:        (id: string) => void
  searchPlaceholder?: string
  searchValue:        string
  onSearchChange:     (v: string) => void
  searchInputId:      string
}

function FilterBar({
  tabs,
  activeTabId,
  onTabChange,
  searchPlaceholder = 'Buscar...',
  searchValue,
  onSearchChange,
  searchInputId,
}: FilterBarProps) {
  return (
    <div className="filter-bar fade-in delay-3" role="toolbar" aria-label="Filtros e busca">
      {/* Tabs */}
      <div
        className="filter-tabs"
        role="tablist"
        aria-label="Filtrar por status"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={`filter-tab${isActive ? ' active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
              <span className="count" aria-label={`${tab.count} itens`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="filter-right">
        <label htmlFor={searchInputId} className="sr-only">
          {searchPlaceholder}
        </label>
        <div className="search-input">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            id={searchInputId}
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            /* iOS: font-size >=16px previne zoom automatico */
            style={{ fontSize: 16 }}
            aria-label={searchPlaceholder}
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function ModuleShell({
  eyebrow,
  title,
  titleItalicSuffix,
  livePhrase,
  primaryAction,
  secondaryAction,
  heroKpi,
  satelliteKpis,
  tabs,
  onTabChange,
  searchPlaceholder,
  onSearch,
  children,
  className,
}: ModuleShellProps) {
  // Tab ativa: usa prop `active` como estado inicial (controlado externamente)
  const initialActive = tabs.find((t) => t.active)?.id ?? tabs[0]?.id ?? ''
  const [activeTabId, setActiveTabId] = useState<string>(initialActive)

  const handleTabChange = useCallback(
    (id: string) => {
      setActiveTabId(id)
      onTabChange(id)
    },
    [onTabChange],
  )

  const [searchValue, setSearchValue] = useState('')
  const handleSearch = useCallback(
    (v: string) => {
      setSearchValue(v)
      onSearch(v)
    },
    [onSearch],
  )

  // ID unico para acessibilidade do input de busca (hook estavel entre renders)
  const searchInputId = useId()

  return (
    <div className={className}>
      {/* ------------------------------------------------------------------ */}
      {/* 1. PAGE HEADER                                                      */}
      {/* ------------------------------------------------------------------ */}
      <header className="page-header fade-in" aria-label={`Modulo ${title}`}>
        <div className="page-header-left">
          {/* Eyebrow mono uppercase */}
          <p className="page-eyebrow" aria-label={eyebrow}>
            {eyebrow}
          </p>

          {/* Titulo Fraunces */}
          <h1 className="page-title">
            {title}
            {titleItalicSuffix && (
              <>
                {' '}
                <span
                  className="accent-italic"
                  style={{ fontStyle: 'italic', fontWeight: 400, fontSize: '0.6em' }}
                >
                  <UnderlineMarker tone="ember" markerStyle="solid">
                    {titleItalicSuffix}
                  </UnderlineMarker>
                </span>
              </>
            )}
          </h1>

          {/* Frase viva */}
          {livePhrase && (
            <p className="page-sub" aria-live="polite">
              {livePhrase}
            </p>
          )}
        </div>

        {/* Acoes (botoes direita do header) */}
        {(primaryAction ?? secondaryAction) && (
          <div className="page-header-right" role="group" aria-label="Acoes do modulo">
            {secondaryAction && (
              <button
                type="button"
                className="btn-ghost"
                onClick={secondaryAction.onClick}
                aria-label={secondaryAction.label}
              >
                {secondaryAction.icon && (
                  <span aria-hidden="true">{secondaryAction.icon}</span>
                )}
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && (
              <button
                type="button"
                className="btn-primary"
                onClick={primaryAction.onClick}
                aria-label={primaryAction.label}
              >
                {primaryAction.icon && (
                  <span aria-hidden="true">{primaryAction.icon}</span>
                )}
                {primaryAction.label}
              </button>
            )}
          </div>
        )}
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* 2. KPI ROW                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section
        // className modifier por quantidade de satellites; CSS controla
        // grid-template-columns + breakpoints mobile/tablet.
        // Antes era inline style que sobrescrevia media queries → quebrava mobile.
        className={`kpi-row kpi-row-sat-${satelliteKpis.length}`}
        aria-label="Indicadores principais"
        data-satellite-count={satelliteKpis.length}
      >
        <KpiHeroCard kpi={heroKpi} />
        {satelliteKpis.map((sat, i) => (
          <KpiSatelliteCard key={`${sat.label}-${i}`} kpi={sat} />
        ))}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. FILTER BAR                                                       */}
      {/* ------------------------------------------------------------------ */}
      <FilterBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={handleTabChange}
        searchPlaceholder={searchPlaceholder}
        searchValue={searchValue}
        onSearchChange={handleSearch}
        searchInputId={searchInputId}
      />

      {/* ------------------------------------------------------------------ */}
      {/* 4. CONTEUDO (tabela, grid, cards — cada modulo decide)              */}
      {/* ------------------------------------------------------------------ */}
      <section
        role="tabpanel"
        id={`tabpanel-${activeTabId}`}
        aria-labelledby={`tab-${activeTabId}`}
        tabIndex={0}
        style={{ outline: 'none' }}
      >
        {children}
      </section>
    </div>
  )
}
