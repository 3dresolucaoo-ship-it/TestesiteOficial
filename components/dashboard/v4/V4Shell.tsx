'use client'

/**
 * V4Shell.tsx — Shell genérico V4 para todos os módulos do app.
 *
 * Extraído de DashboardLayout.tsx em 2026-05-20 (onda 3c).
 * Responsabilidades:
 * - Tema dark/light (localStorage 'hayzer-theme', persiste entre sessões)
 * - Sidebar 248px fixed + drawer mobile (overlay + escape + click fora)
 * - Topbar (project switcher + status pill + theme toggle + NotificationBell + GlobalSearch)
 * - Ambient layers (grain, glow, root-canvas, decor-roots, watermark)
 * - Streak pill fixed (genérico — maker que usa qualquer módulo acumula streak)
 * - Renderiza children no container principal (conteúdo varia por módulo)
 *
 * NÃO inclui: CoverHero, Greeting, NextActionCard, BentoGrid, projects-row
 * (esses são específicos de /dashboard — vivem em DashboardLayout.tsx).
 *
 * Padrão de uso:
 *   <V4Shell
 *     userName="Gabriel Vaz"
 *     projects={projects}
 *     projectId={projectId}
 *     streak={{ days: 12 }}
 *   >
 *     <ModuleShell ... />
 *   </V4Shell>
 *
 * A11y:
 * - aria-expanded no mobile toggle
 * - aria-controls linking toggle → sidebar
 * - Escape fecha sidebar
 * - Click no overlay fecha sidebar
 * - Focus trap na sidebar: TODO Wave 4 (Júlia P2)
 *
 * ADR referência: decisions/014-dashboard-v4-aprovado-mvp.md
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { StreakPill } from './StreakPill'
import { NotificationBell } from './NotificationBell'
import { GlobalSearch } from './GlobalSearch'
import type { DashboardTheme, StreakData } from './types'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const THEME_KEY = 'hayzer-theme'
const SIDEBAR_WIDTH = 248

// ---------------------------------------------------------------------------
// Tipos do V4Shell
// ---------------------------------------------------------------------------

export interface V4ShellProject {
  id: string
  name: string
  revenue: number
  isActive: boolean
}

export interface V4ShellProps {
  children: ReactNode
  /** Nome do usuário para a sidebar (user-pill + initials). */
  userName: string
  /** ID do projeto ativo (multi-tenant — topbar project switcher). */
  projectId: string
  /** Lista de projetos para o switcher do topbar. */
  projects: V4ShellProject[]
  /** Dados de streak — StreakPill fixed canto inferior esquerdo. */
  streak: StreakData
}

// ---------------------------------------------------------------------------
// Sub-componente: AmbientLayers (puramente visual, aria-hidden)
// ---------------------------------------------------------------------------

function AmbientLayers() {
  return (
    <>
      <div className="ambient-glow" aria-hidden="true" />
      <div className="grain-layer"  aria-hidden="true" />

      {/* Raiz decorativa lateral autoral (V4.9 17/05) */}
      <svg
        className="decor-roots"
        viewBox="0 0 280 380"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M 10 380 Q 38 340 58 290 Q 75 248 95 222 Q 122 192 158 178 Q 198 162 240 152" />
        <path d="M 58 290 Q 42 248 28 208 Q 18 178 12 142 Q 8 112 4 80" />
        <path d="M 95 222 Q 110 188 128 156 Q 145 128 168 102 Q 188 82 208 64" />
        <path d="M 28 208 Q 18 198 8 192" />
        <path d="M 158 178 Q 178 174 198 172" />
        <path d="M 128 156 Q 140 150 152 146" />
        <circle cx="58"  cy="290" r="2.8" />
        <circle cx="95"  cy="222" r="2.2" />
        <circle cx="158" cy="178" r="2.5" />
        <circle cx="28"  cy="208" r="1.8" />
        <circle cx="128" cy="156" r="1.8" />
        <circle cx="4"   cy="80"  r="1.5" />
        <circle cx="208" cy="64"  r="1.8" />
        <circle cx="240" cy="152" r="2.2" />
      </svg>

      {/* Raiz estrutural canvas fundo (V3 base) */}
      <div className="root-canvas" aria-hidden="true">
        <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
          <path className="root-trunk"
            d="M 60 1060 Q 180 980 240 880 Q 300 780 380 720 Q 480 650 560 580
               Q 680 480 820 440 Q 980 400 1140 360 Q 1300 320 1460 280
               Q 1620 240 1780 180 Q 1860 140 1900 80" />
          <path className="root-branch" d="M 380 720 Q 360 660 320 600 Q 290 540 250 480" />
          <path className="root-branch" d="M 560 580 Q 640 570 720 540 Q 800 510 880 460" />
          <path className="root-branch" d="M 820 440 Q 880 360 920 280 Q 950 220 980 180" />
          <path className="root-branch" d="M 1140 360 Q 1180 300 1240 260 Q 1300 220 1360 200" />
          <path className="root-branch" d="M 1460 280 Q 1520 240 1580 220 Q 1640 200 1700 200" />
          <path className="root-sub" d="M 320 600 Q 270 590 230 600" />
          <path className="root-sub" d="M 720 540 Q 700 510 680 480" />
          <path className="root-sub" d="M 920 280 Q 880 250 850 220" />
          <path className="root-sub" d="M 1240 260 Q 1220 220 1210 190" />
          <path className="root-sub" d="M 1580 220 Q 1560 180 1540 160" />
          <path className="root-sub" d="M 180 990 Q 140 1020 100 1050" />
          <path className="root-sub" d="M 240 880 Q 200 900 170 920" />
          <circle className="root-node" cx="380"  cy="720" r="3" />
          <circle className="root-node" cx="560"  cy="580" r="3" />
          <circle className="root-node" cx="820"  cy="440" r="3" />
          <circle className="root-node" cx="1140" cy="360" r="3" />
          <circle className="root-node" cx="1460" cy="280" r="3" />
        </svg>
      </div>

      {/* Watermark Fraunces italic gigante */}
      <div className="watermark-raiz" aria-hidden="true">hayzer</div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Sub-componente: ThemeToggle
// ---------------------------------------------------------------------------

interface ThemeToggleProps {
  theme: DashboardTheme
  onToggle: () => void
}

function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark'

  return (
    <button
      className="theme-toggle"
      id="themeToggle"
      type="button"
      aria-label={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
      aria-pressed={!isDark}
      onClick={onToggle}
    >
      {/* Lua — visível em dark */}
      <svg
        className="icon-moon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
      </svg>
      {/* Sol — visível em light */}
      <svg
        className="icon-sun"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2"  x2="12" y2="5"  />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2"  y1="12" x2="5"  y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        <line x1="4.93"  y1="4.93"  x2="7.05"  y2="7.05"  />
        <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
        <line x1="4.93"  y1="19.07" x2="7.05"  y2="16.95" />
        <line x1="16.95" y1="7.05"  x2="19.07" y2="4.93"  />
      </svg>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Sub-componente: Sidebar
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  {
    group: 'Núcleo',
    items: [
      { label: 'Início',       href: '/dashboard'   },
      { label: 'Pedidos',      href: '/orders',    badge: 3 as number | undefined },
      { label: 'Produção',     href: '/production'  },
      { label: 'Estoque',      href: '/inventory'   },
      { label: 'Financeiro',   href: '/finance'     },
    ],
  },
  {
    group: 'Crescimento',
    items: [
      { label: 'Clientes',  href: '/crm'               },
      { label: 'Leads',     href: '/crm',    badge: 7 as number | undefined },
      { label: 'Catálogo',  href: '/catalogs'           },
    ],
  },
  {
    group: 'Sistema',
    items: [
      { label: 'Configurações', href: '/settings' },
      { label: 'Ajuda',        href: '/help'     },
    ],
  },
] as const

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  /** Pathname ativo — marca nav-item como active via aria-current. */
  activeHref?: string
}

function Sidebar({ isOpen, onClose, userName, activeHref }: SidebarProps) {
  const { signOut } = useAuth()
  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <aside
      className={`sidebar${isOpen ? ' open' : ''}`}
      id="sidebar"
      aria-label="Navegação principal"
    >
      <a href="/dashboard" className="brand" aria-label="Hayzer · Início">
        <Image
          src="/logo-hayzer.png"
          alt="Hayzer"
          className="brand-logo"
          width={40}
          height={40}
          priority
        />
        <div className="brand-meta">
          <span className="brand-word">Hayzer</span>
          <span className="brand-tag">controle maker</span>
        </div>
      </a>

      {NAV_ITEMS.map(({ group, items }) => (
        <nav key={group} className="nav-group" aria-label={group}>
          <span className="nav-group-label">{group}</span>
          {items.map((item) => {
            const isActive = activeHref
              ? item.href === activeHref
              : item.href === '/dashboard'
            return (
              <a
                key={item.label}
                href={item.href}
                className={`nav-item${isActive ? ' active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={onClose}
              >
                {/* TODO: mapear ícones Lucide por label (Wave 3) */}
                <span>{item.label}</span>
                {'badge' in item && item.badge != null && (
                  <span className="badge" aria-label={`${item.badge} itens`}>
                    {item.badge}
                  </span>
                )}
              </a>
            )
          })}
        </nav>
      ))}

      <div className="sidebar-bottom">
        <div
          className="user-pill"
          role="button"
          tabIndex={0}
          aria-label={`Conta do usuário: ${userName}`}
        >
          <div className="user-avatar" aria-hidden="true">{initials}</div>
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-role">ADMIN</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { void signOut() }}
          aria-label="Sair da conta"
          className="logout-btn"
          style={{
            marginTop: 8,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 8,
            background: 'transparent',
            border: '1px solid hsl(var(--border-soft, 220 8% 25%) / 0.6)',
            color: 'hsl(var(--fog-400, 220 8% 70%))',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 160ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'hsl(var(--red-500, 0 65% 45%) / 0.08)'
            e.currentTarget.style.color = 'hsl(var(--red-300, 0 75% 70%))'
            e.currentTarget.style.borderColor = 'hsl(var(--red-500, 0 65% 45%) / 0.35)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'hsl(var(--fog-400, 220 8% 70%))'
            e.currentTarget.style.borderColor = 'hsl(var(--border-soft, 220 8% 25%) / 0.6)'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sair
        </button>
      </div>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// Componente principal: V4Shell
// ---------------------------------------------------------------------------

export function V4Shell({
  children,
  userName,
  projectId,
  projects,
  streak,
}: V4ShellProps) {
  // ── Tema ──────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState<DashboardTheme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as DashboardTheme | null
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.setAttribute('data-theme', saved)
      const raf = requestAnimationFrame(() => setTheme(saved))
      return () => cancelAnimationFrame(raf)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem(THEME_KEY, next)
      document.documentElement.setAttribute('data-theme', next)
      return next
    })
  }, [])

  // ── Sidebar mobile ────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const openSidebar  = useCallback(() => setSidebarOpen(true),  [])

  // Escape fecha sidebar
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) closeSidebar()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [sidebarOpen, closeSidebar])

  // ── Auth ──────────────────────────────────────────────────────────────────
  const { user } = useAuth()

  // ── Projeto ativo (switcher topbar) ───────────────────────────────────────
  // TODO (Wave 3): implementar dropdown completo do project switcher.
  // O setter não é exposto ainda — botão é placeholder (aria-haspopup="listbox"),
  // mesmo estado do DashboardLayout original antes da extração.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeProjectId, setActiveProjectId] = useState(projectId)
  const activeProject = projects.find((p) => p.id === activeProjectId)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <AmbientLayers />

      {/* Mobile toggle */}
      <button
        className="mobile-toggle"
        id="mobileToggle"
        type="button"
        aria-label="Abrir menu"
        aria-expanded={sidebarOpen}
        aria-controls="sidebar"
        onClick={openSidebar}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <line x1="3"  y1="6"  x2="21" y2="6"  />
          <line x1="3"  y1="12" x2="21" y2="12" />
          <line x1="3"  y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        userName={userName}
      />

      {/* Overlay mobile */}
      <div
        id="sidebar-overlay"
        className={`sidebar-overlay${sidebarOpen ? ' is-open' : ''}`}
        aria-hidden="true"
        ref={overlayRef}
        onClick={closeSidebar}
      />

      {/* Main content */}
      <main
        className="main"
        style={{ ['--sidebar-w' as string]: `${SIDEBAR_WIDTH}px`, marginLeft: `${SIDEBAR_WIDTH}px` }}
      >
        {/* Topbar */}
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="project-switcher"
              type="button"
              aria-label="Trocar projeto ativo"
              aria-haspopup="listbox"
            >
              <span className="project-dot" aria-hidden="true">
                {activeProject?.name.slice(0, 2).toUpperCase() ?? '??'}
              </span>
              <span>{activeProject?.name ?? 'Projeto'}</span>
              <span className="project-meta">PRINCIPAL</span>
              <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          <div className="topbar-right">
            <span
              className="status-pill"
              aria-label="Sincronizado ao vivo · atualiza a cada 30 segundos"
            >
              <span className="live-dot" aria-hidden="true" />
              AO VIVO · 30s
            </span>

            {user && (
              <NotificationBell
                userId={user.id}
                projectId={activeProjectId}
              />
            )}

            {user && (
              <GlobalSearch
                userId={user.id}
                projectId={activeProjectId}
              />
            )}

            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>

        {/* Conteúdo do módulo — cada page decide o que renderizar */}
        {children}
      </main>

      {/* Streak pill fixed — genérico (acumula em qualquer módulo) */}
      <StreakPill data={streak} />
    </>
  )
}
