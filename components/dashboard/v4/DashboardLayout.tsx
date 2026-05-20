'use client'

/**
 * DashboardLayout.tsx — Layout específico do módulo /dashboard (V4.8)
 *
 * Responsabilidades (pós-onda 3c):
 * - Wrappa V4Shell (shell genérico: sidebar + topbar + ambient + tema + streak)
 * - Renderiza conteúdo exclusivo de /dashboard:
 *     Greeting · CoverHero + divisor SVG · NextActionCard · BentoGrid
 *     · projects-row (seção "Trocar de projeto")
 *
 * O que SAIU daqui (vive agora em V4Shell.tsx):
 * - AmbientLayers
 * - ThemeToggle + lógica de tema (localStorage 'hayzer-theme')
 * - Sidebar + drawer mobile (escape + overlay)
 * - Topbar (project switcher + status pill + NotificationBell + GlobalSearch)
 * - StreakPill fixed
 *
 * ADR referência: decisions/014-dashboard-v4-aprovado-mvp.md
 * V4Shell extraído em: 2026-05-20 (onda 3c)
 */

import { useState } from 'react'
import { V4Shell }        from './V4Shell'
import { Greeting }       from './Greeting'
import { CoverHero }      from './CoverHero'
import { NextActionCard } from './NextActionCard'
import { BentoGrid }      from './BentoGrid'
import type { DashboardData } from './types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DashboardLayoutProps {
  data: DashboardData
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function DashboardLayout({ data }: DashboardLayoutProps) {
  // Projeto ativo: controlado aqui pois o projects-row (específico /dashboard)
  // também usa setActiveProjectId. V4Shell recebe o ID inicial apenas.
  const [activeProjectId, setActiveProjectId] = useState(data.projectId)

  return (
    <V4Shell
      userName={data.userName}
      projectId={activeProjectId}
      projects={data.projects}
      streak={data.streak}
    >
      {/* ── Conteúdo exclusivo de /dashboard ──────────────────────────── */}

      {/* Greeting */}
      <Greeting userName={data.userName} />

      {/* Cover + satélites */}
      <CoverHero
        data={data.cover}
        satellites={data.satellites}
      />

      {/* Divisor SVG (branch) */}
      <svg
        className="branch-divisor fade-in delay-1"
        viewBox="0 0 1200 24"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line x1="0" y1="12" x2="1200" y2="12" stroke="var(--petrol-500)" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
        <path d="M150 12 Q156 6 165 3"   stroke="var(--petrol-500)" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M280 12 Q286 19 295 23"  stroke="var(--petrol-500)" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M420 12 Q426 5 434 2"   stroke="var(--petrol-500)" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M560 12 Q568 20 578 23"  stroke="var(--petrol-500)" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M720 12 Q727 6 736 3"   stroke="var(--petrol-500)" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M880 12 Q886 19 894 22"  stroke="var(--petrol-500)" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M1040 12 Q1047 5 1056 2" stroke="var(--petrol-500)" strokeWidth="1" strokeLinecap="round" fill="none" />
        <circle cx="280" cy="12" r="2" fill="var(--petrol-500)" opacity="0.55" />
        <circle cx="720" cy="12" r="2" fill="var(--petrol-500)" opacity="0.55" />
      </svg>

      {/* Próxima ação */}
      {data.nextAction && (
        <NextActionCard data={data.nextAction} />
      )}

      {/* Bento grid */}
      <BentoGrid
        donutSegments={data.donutSegments}
        monthBars={data.monthBars}
        queueDays={data.queueDays}
        goal={data.goal}
        topProducts={data.topProducts}
        activePrintJobs={data.activePrintJobs}
        stockAlerts={data.stockAlerts}
      />

      {/* Seção "Trocar de projeto" — específica de /dashboard */}
      <div className="section-header fade-in delay-3">
        <h2 className="section-title">Trocar de <em>projeto</em></h2>
        <span className="section-tag">{data.projects.length} projetos · esse é o atual</span>
      </div>

      <div className="projects-row fade-in delay-3">
        {data.projects.map((p) => (
          <button
            key={p.id}
            className={`project-chip${p.id === activeProjectId ? ' active' : ''}`}
            type="button"
            onClick={() => setActiveProjectId(p.id)}
            aria-pressed={p.id === activeProjectId}
          >
            <span className="chip-dot" />
            <span>{p.name}</span>
            {p.revenue > 0 && (
              <span className="chip-meta num">
                · R$ {p.revenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </span>
            )}
          </button>
        ))}
      </div>
    </V4Shell>
  )
}
