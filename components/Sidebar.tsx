'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  LayoutDashboard, FolderKanban, ShoppingCart, Printer, Video,
  Lightbulb, TrendingUp, X, Menu, ArrowLeft, ChevronRight, Settings,
  Package, Boxes, Users, BarChart3, Store, Layers, LogOut, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { useAuth } from '@/context/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import { MODULE_CONFIG, getProjectColor } from '@/lib/moduleConfig'

// ─── Global navigation items ─────────────────────────────────────────────────
const GLOBAL_NAV = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/metrics',    label: 'Métricas',   icon: BarChart3 },
  { href: '/projects',   label: 'Projetos',   icon: FolderKanban },
]

const GLOBAL_MODULES: Array<{ href: string; label: string; icon: React.ElementType; key: keyof import('@/core/admin/config').ModulesConfig }> = [
  { href: '/finance',    label: 'Finanças',       icon: TrendingUp,   key: 'finance' },
  { href: '/orders',     label: 'Vendas',         icon: ShoppingCart, key: 'orders' },
  { href: '/crm',        label: 'CRM',            icon: Users,        key: 'crm' },
  { href: '/products',   label: 'Produtos',       icon: Boxes,        key: 'products' },
  { href: '/inventory',  label: 'Estoque',        icon: Package,      key: 'inventory' },
  { href: '/production', label: 'Produção',       icon: Printer,      key: 'production' },
  { href: '/content',    label: 'Conteúdo',       icon: Video,        key: 'content' },
  { href: '/decisions',  label: 'Decisões',       icon: Lightbulb,    key: 'decisions' },
]

const VITRINE_NAV = [
  { href: '/catalogs',   label: 'Catálogos',  icon: Store },
  { href: '/portfolios', label: 'Portfólios', icon: Layers },
]

const GLOBAL_SYSTEM = [
  { href: '/settings',   label: 'Configurações',  icon: Settings },
]

// ─── Shared NavLink ───────────────────────────────────────────────────────────
function NavLink({ href, label, icon: Icon, onClick, exact = false, iconOnly = false }: {
  href: string; label: string; icon: React.ElementType; onClick?: () => void; exact?: boolean; iconOnly?: boolean
}) {
  const pathname = usePathname()
  const active = exact ? pathname === href : (pathname === href || pathname.startsWith(href + '/'))

  const styleBase = {
    background: active ? 'var(--t-nav-active-bg)' : 'transparent',
    color:      active ? 'var(--t-nav-active-text)' : 'var(--t-nav-inactive)',
  }
  const onEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!active) {
      e.currentTarget.style.color = 'var(--t-text-primary)'
      e.currentTarget.style.background = 'var(--t-hover)'
    }
  }
  const onLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!active) {
      e.currentTarget.style.color = 'var(--t-nav-inactive)'
      e.currentTarget.style.background = 'transparent'
    }
  }

  if (iconOnly) {
    return (
      <Link
        href={href} onClick={onClick} title={label}
        className="relative flex items-center justify-center w-9 h-9 mx-auto rounded-xl transition-all duration-150"
        style={styleBase}
        onMouseEnter={onEnter} onMouseLeave={onLeave}
      >
        {active && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
            style={{ background: 'var(--t-accent)' }}
          />
        )}
        <Icon size={16} strokeWidth={active ? 2 : 1.5} />
      </Link>
    )
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 overflow-hidden"
      style={styleBase}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
          style={{ background: 'var(--t-accent)' }}
        />
      )}
      <Icon size={15} strokeWidth={active ? 2 : 1.5} />
      <span className="truncate">{label}</span>
      {active && <ChevronRight size={12} className="ml-auto opacity-50" />}
    </Link>
  )
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ iconOnly = false }: { iconOnly?: boolean }) {
  const { state } = useStore()
  const name    = state.config?.companyName || 'BVaz Hub'
  const logoUrl = state.config?.brand?.logoUrl
  const accent  = state.config?.brand?.accentColor || 'var(--t-accent)'

  const avatar = logoUrl ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={logoUrl} alt={name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
  ) : (
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 transition-colors"
      style={{ background: accent }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )

  if (iconOnly) {
    return (
      <Link href="/dashboard" title={name} className="flex items-center justify-center py-4">
        {avatar}
      </Link>
    )
  }

  return (
    <div className="px-5 pt-5 pb-1">
      <Link href="/dashboard" className="flex items-center gap-2 group">
        {avatar}
        <span className="font-semibold text-sm truncate" style={{ color: 'var(--t-text-primary)' }}>{name}</span>
      </Link>
    </div>
  )
}

// ─── Sidebar footer ───────────────────────────────────────────────────────────
function SidebarFooter({ iconOnly = false }: { iconOnly?: boolean }) {
  const { loading, dbError } = useStore()

  const dot = (
    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
      loading ? 'bg-[#f59e0b] animate-pulse' : dbError ? 'bg-[#ef4444]' : 'bg-[#10b981]'
    }`} />
  )

  if (iconOnly) {
    return (
      <div className="mt-auto pb-3 flex flex-col items-center gap-2"
           style={{ borderTop: '1px solid var(--t-footer-border)', paddingTop: '0.75rem' }}>
        {isSupabaseConfigured ? dot : (
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--t-text-muted)' }} />
        )}
      </div>
    )
  }

  return (
    <div className="mt-auto pt-3 px-5 pb-4"
         style={{ borderTop: '1px solid var(--t-footer-border)' }}>
      <p className="text-[11px]" style={{ color: 'var(--t-footer-text)' }}>
        Sistema Operacional v0.3
      </p>
      {isSupabaseConfigured ? (
        <div className="flex items-center gap-1.5 mt-1.5">
          {dot}
          <span className="text-[10px] truncate" style={{ color: 'var(--t-footer-text)' }}>
            {loading ? 'Conectando…' : dbError ? 'Offline' : 'Supabase'}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--t-text-muted)' }} />
          <span className="text-[10px]" style={{ color: 'var(--t-footer-text)' }}>Local</span>
        </div>
      )}
    </div>
  )
}

// ─── Global sidebar content ───────────────────────────────────────────────────
function GlobalNav({
  onNav,
  collapsed = false,
  onToggle,
}: {
  onNav?: () => void
  collapsed?: boolean
  onToggle?: () => void
}) {
  const { state } = useStore()
  const accent = state.config?.brand?.accentColor
  useEffect(() => {
    if (accent) document.documentElement.style.setProperty('--t-accent', accent)
  }, [accent])

  const modCfg        = state.config?.modules
  const metricsEnabled = modCfg?.metrics ?? true
  const visibleModules = GLOBAL_MODULES.filter(m => modCfg ? modCfg[m.key] !== false : true)
  const visibleGlobalNav = GLOBAL_NAV.filter(n => n.href !== '/metrics' || metricsEnabled)

  // ── Icon-only (collapsed) view ─────────────────────────────────────────────
  if (collapsed) {
    return (
      <div className="flex flex-col flex-1 overflow-y-auto items-center pt-2 pb-2 gap-0.5">
        <Logo iconOnly />

        {/* Expand button */}
        <button
          onClick={onToggle}
          title="Expandir menu"
          className="flex items-center justify-center w-9 h-9 rounded-xl mb-1 transition-colors"
          style={{ color: 'var(--t-sidebar-section)' }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-text-primary)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-sidebar-section)'}
        >
          <PanelLeftOpen size={15} />
        </button>

        {/* Dashboard / Métricas / Projetos */}
        {visibleGlobalNav.map(item => (
          <NavLink key={item.href} {...item} onClick={onNav} exact iconOnly />
        ))}

        <div className="w-5 my-1.5" style={{ height: 1, background: 'var(--t-footer-border)' }} />

        {/* Modules */}
        {visibleModules.map(({ key: _k, ...item }) => (
          <NavLink key={item.href} {...item} onClick={onNav} iconOnly />
        ))}

        <div className="w-5 my-1.5" style={{ height: 1, background: 'var(--t-footer-border)' }} />

        {/* Vitrine */}
        {VITRINE_NAV.map(item => (
          <NavLink key={item.href} {...item} onClick={onNav} iconOnly />
        ))}

        <div className="w-5 my-1.5" style={{ height: 1, background: 'var(--t-footer-border)' }} />

        {/* Sistema */}
        {GLOBAL_SYSTEM.map(item => (
          <NavLink key={item.href} {...item} onClick={onNav} iconOnly />
        ))}
      </div>
    )
  }

  // ── Full expanded view ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <Logo />
      <nav className="flex flex-col gap-0.5 mt-5 px-2">
        {visibleGlobalNav.map(item => (
          <NavLink key={item.href} {...item} onClick={onNav} exact />
        ))}
      </nav>

      <div className="mt-4 px-2">
        {/* GLOBAL section header — clicking collapses the whole sidebar */}
        {onToggle ? (
          <button
            onClick={onToggle}
            className="flex items-center justify-between w-full px-3 mb-1 group"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest"
               style={{ color: 'var(--t-sidebar-section)' }}>Global</p>
            <PanelLeftClose
              size={11}
              style={{ color: 'var(--t-sidebar-section)' }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </button>
        ) : (
          <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-1"
             style={{ color: 'var(--t-sidebar-section)' }}>Global</p>
        )}
        <nav className="flex flex-col gap-0.5">
          {visibleModules.map(({ key: _k, ...item }) => (
            <NavLink key={item.href} {...item} onClick={onNav} />
          ))}
        </nav>
      </div>

      <div className="mt-4 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-1"
           style={{ color: 'var(--t-sidebar-section)' }}>Vitrine</p>
        <nav className="flex flex-col gap-0.5">
          {VITRINE_NAV.map(item => (
            <NavLink key={item.href} {...item} onClick={onNav} />
          ))}
        </nav>
      </div>

      <div className="mt-4 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-1"
           style={{ color: 'var(--t-sidebar-section)' }}>Sistema</p>
        <nav className="flex flex-col gap-0.5">
          {GLOBAL_SYSTEM.map(item => (
            <NavLink key={item.href} {...item} onClick={onNav} />
          ))}
        </nav>
      </div>
    </div>
  )
}

// ─── Project sidebar content ──────────────────────────────────────────────────
function ProjectNav({ projectId, onNav }: { projectId: string; onNav?: () => void }) {
  const { state } = useStore()
  const project = state.projects.find(p => p.id === projectId)
  const color = project ? getProjectColor(project) : '#7c3aed'
  const modules = project?.modules ?? []

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Back to global */}
      <div className="px-2 pt-3">
        <Link
          href="/projects"
          onClick={onNav}
          className="flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-lg"
          style={{ color: 'var(--t-nav-inactive)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--t-text-primary)'
            ;(e.currentTarget as HTMLAnchorElement).style.background = 'var(--t-hover)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--t-nav-inactive)'
            ;(e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
          }}
        >
          <ArrowLeft size={14} />
          <span>Voltar</span>
        </Link>
      </div>

      {/* Project header */}
      <div className="px-5 py-4 mt-1"
           style={{ borderBottom: '1px solid var(--t-footer-border)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: color }}
          >
            {project?.name.charAt(0) ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate"
               style={{ color: 'var(--t-text-primary)' }}>{project?.name ?? '...'}</p>
            <p className="text-[11px] truncate capitalize"
               style={{ color: 'var(--t-text-muted)' }}>{project?.type?.replace('_', ' ') ?? ''}</p>
          </div>
        </div>
      </div>

      {/* Module nav */}
      <nav className="flex flex-col gap-0.5 mt-3 px-2 flex-1">
        <NavLink
          href={`/projects/${projectId}`}
          label="Visão Geral"
          icon={LayoutDashboard}
          onClick={onNav}
          exact
        />
        {modules.map(mod => {
          const cfg = MODULE_CONFIG[mod]
          if (!cfg) return null
          return (
            <NavLink
              key={mod}
              href={cfg.href(projectId)}
              label={cfg.label}
              icon={cfg.icon}
              onClick={onNav}
            />
          )
        })}
      </nav>
    </div>
  )
}

// ─── Detect project context ───────────────────────────────────────────────────
function useProjectContext() {
  const pathname = usePathname()
  const parts = pathname.split('/')
  if (parts[1] === 'projects' && parts[2] && parts[2] !== 'new') {
    return parts[2]
  }
  return null
}

// ─── Mobile bottom navigation bar ────────────────────────────────────────────
const BOTTOM_NAV = [
  { href: '/dashboard', label: 'Início',   icon: LayoutDashboard },
  { href: '/finance',   label: 'Finanças', icon: TrendingUp },
  { href: '/orders',    label: 'Vendas',   icon: ShoppingCart },
  { href: '/inventory', label: 'Estoque',  icon: Package },
]

export function BottomNav() {
  const pathname  = usePathname()
  const projectId = useProjectContext()

  if (projectId) return null

  function openMore() {
    window.dispatchEvent(new Event('open-mobile-nav'))
  }

  return (
    <nav className="mobile-nav lg:hidden flex items-center justify-around px-2 py-1">
      {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 flex-1 py-2 px-1 rounded-xl transition-all duration-200"
            style={{
              color:      active ? 'var(--t-accent)' : 'var(--t-nav-inactive)',
              background: active ? 'var(--t-accent-soft)' : 'transparent',
            }}
          >
            <Icon size={19} strokeWidth={active ? 2.2 : 1.5} />
            <span className="text-[9.5px] font-medium leading-none">{label}</span>
          </Link>
        )
      })}
      {/* Mais — opens full mobile nav drawer */}
      <button
        onClick={openMore}
        className="flex flex-col items-center gap-1 flex-1 py-2 px-1 rounded-xl transition-all duration-200"
        style={{ color: 'var(--t-nav-inactive)' }}
      >
        <Menu size={19} strokeWidth={1.5} />
        <span className="text-[9.5px] font-medium leading-none">Mais</span>
      </button>
    </nav>
  )
}

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────
export function Sidebar() {
  const projectId = useProjectContext()

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('sidebar-global-collapsed') === 'true'
  })

  // Keep CSS variable in sync (drives AppShell content margin)
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', collapsed ? '3.5rem' : '14rem')
  }, [collapsed])

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('sidebar-global-collapsed', String(next))
  }

  return (
    <aside
      className="hidden lg:flex flex-col min-h-screen fixed top-0 left-0 z-30 overflow-hidden"
      style={{
        width:       collapsed ? '3.5rem' : '14rem',
        transition:  'width 200ms ease',
        background:  'linear-gradient(180deg, var(--t-accent-soft) 0%, transparent 30%), var(--t-sidebar-bg)',
        borderRight: '1px solid var(--t-sidebar-border)',
        boxShadow:   '1px 0 0 var(--t-sidebar-border)',
      }}
    >
      {projectId ? (
        <ProjectNav projectId={projectId} />
      ) : (
        <GlobalNav collapsed={collapsed} onToggle={toggle} />
      )}
      <SidebarFooter iconOnly={collapsed} />
    </aside>
  )
}

// ─── Mobile Nav ───────────────────────────────────────────────────────────────
export function MobileNav() {
  const [open,    setOpen]    = useState(false)
  const [mounted, setMounted] = useState(false)
  const projectId = useProjectContext()
  const { signOut, user } = useAuth()

  function openDrawer() {
    setMounted(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)))
  }

  function closeDrawer() {
    setOpen(false)
    setTimeout(() => setMounted(false), 320)
  }

  // Listen for 'open-mobile-nav' event from BottomNav's "Mais" button
  useEffect(() => {
    window.addEventListener('open-mobile-nav', openDrawer)
    return () => window.removeEventListener('open-mobile-nav', openDrawer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <button
        onClick={openDrawer}
        className="lg:hidden p-2 rounded-lg transition-colors"
        style={{ color: 'var(--t-nav-inactive)' }}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-text-primary)'}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-nav-inactive)'}
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {mounted && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(2px)',
              opacity: open ? 1 : 0,
            }}
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <div
            className="absolute left-0 top-0 bottom-0 w-72 flex flex-col transition-transform duration-300 ease-out"
            style={{
              background:  'var(--t-sidebar-bg)',
              borderRight: '1px solid var(--t-sidebar-border)',
              transform:   open ? 'translateX(0)' : 'translateX(-100%)',
              boxShadow:   '4px 0 40px rgba(0,0,0,0.4)',
            }}
          >
            {/* Close button row */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--t-footer-border)' }}
            >
              <Logo />
              <button
                onClick={closeDrawer}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--t-nav-inactive)' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-text-primary)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-nav-inactive)'}
                aria-label="Fechar menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col">
              {projectId ? (
                <ProjectNav projectId={projectId} onNav={closeDrawer} />
              ) : (
                /* Mobile drawer: never collapsed, no toggle */
                <GlobalNav onNav={closeDrawer} collapsed={false} />
              )}
            </div>

            <SidebarFooter />

            {user && (
              <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid var(--t-footer-border)' }}>
                <button
                  onClick={() => { closeDrawer(); signOut() }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
                  style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}
                >
                  <LogOut size={15} />
                  Sair da conta
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
