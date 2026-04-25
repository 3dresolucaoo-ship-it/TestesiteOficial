'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, FolderKanban, ShoppingCart, Printer, Video,
  Lightbulb, TrendingUp, X, Menu, ArrowLeft, ChevronRight, Settings, Package, Boxes, Users, BarChart3,
  Store, Layers,
} from 'lucide-react'
import { useStore } from '@/lib/store'
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
function NavLink({ href, label, icon: Icon, onClick, exact = false }: {
  href: string; label: string; icon: React.ElementType; onClick?: () => void; exact?: boolean
}) {
  const pathname = usePathname()
  const active = exact ? pathname === href : (pathname === href || pathname.startsWith(href + '/'))

  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 overflow-hidden"
      style={{
        background: active ? 'var(--t-nav-active-bg)' : 'transparent',
        color:      active ? 'var(--t-nav-active-text)' : 'var(--t-nav-inactive)',
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--t-text-primary)'
          ;(e.currentTarget as HTMLAnchorElement).style.background = 'var(--t-hover)'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--t-nav-inactive)'
          ;(e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
        }
      }}
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

// ─── Global sidebar content ───────────────────────────────────────────────────
function GlobalNav({ onNav }: { onNav?: () => void }) {
  const { state } = useStore()
  const accent = state.config?.brand?.accentColor
  useEffect(() => {
    if (accent) document.documentElement.style.setProperty('--t-accent', accent)
  }, [accent])
  const modCfg = state.config?.modules
  const metricsEnabled = modCfg?.metrics ?? true
  const visibleModules = GLOBAL_MODULES.filter(m => modCfg ? modCfg[m.key] !== false : true)
  const visibleGlobalNav = GLOBAL_NAV.filter(n => n.href !== '/metrics' || metricsEnabled)

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <Logo />
      <nav className="flex flex-col gap-0.5 mt-5 px-2">
        {visibleGlobalNav.map(item => (
          <NavLink key={item.href} {...item} onClick={onNav} exact />
        ))}
      </nav>
      <div className="mt-4 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-1"
           style={{ color: 'var(--t-sidebar-section)' }}>Global</p>
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

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  const { state } = useStore()
  const name    = state.config?.companyName || 'BVaz Hub'
  const logoUrl = state.config?.brand?.logoUrl
  const accent  = state.config?.brand?.accentColor || 'var(--t-accent)'
  return (
    <div className="px-5 pt-5 pb-1">
      <Link href="/dashboard" className="flex items-center gap-2 group">
        {logoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={logoUrl} alt={name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
        ) : (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 transition-colors"
            style={{ background: accent }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="font-semibold text-sm truncate" style={{ color: 'var(--t-text-primary)' }}>{name}</span>
      </Link>
    </div>
  )
}

// ─── Root sidebar footer ──────────────────────────────────────────────────────
function SidebarFooter() {
  const { loading, dbError } = useStore()
  return (
    <div className="mt-auto pt-3 px-5 pb-4"
         style={{ borderTop: '1px solid var(--t-footer-border)' }}>
      <p className="text-[11px]" style={{ color: 'var(--t-footer-text)' }}>
        Sistema Operacional v0.3
      </p>
      {isSupabaseConfigured ? (
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            loading ? 'bg-[#f59e0b] animate-pulse' : dbError ? 'bg-[#ef4444]' : 'bg-[#10b981]'
          }`} />
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
  { href: '/dashboard',  label: 'Início',    icon: LayoutDashboard },
  { href: '/orders',     label: 'Vendas',    icon: ShoppingCart },
  { href: '/inventory',  label: 'Estoque',   icon: Package },
  { href: '/products',   label: 'Produtos',  icon: Boxes },
  { href: '/catalogs',   label: 'Catálogos', icon: Store },
]

export function BottomNav() {
  const pathname  = usePathname()
  const projectId = useProjectContext()

  if (projectId) return null

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
    </nav>
  )
}

// ─── Desktop Sidebar ─────────────────────────────────────────────────────────
export function Sidebar() {
  const projectId = useProjectContext()

  return (
    <aside
      className="hidden lg:flex flex-col w-56 min-h-screen fixed top-0 left-0 z-30"
      style={{
        background:  'linear-gradient(180deg, var(--t-accent-soft) 0%, transparent 30%), var(--t-sidebar-bg)',
        borderRight: '1px solid var(--t-sidebar-border)',
        boxShadow:   '1px 0 0 var(--t-sidebar-border)',
      }}
    >
      {projectId ? (
        <ProjectNav projectId={projectId} />
      ) : (
        <GlobalNav />
      )}
      <SidebarFooter />
    </aside>
  )
}

// ─── Mobile Nav ───────────────────────────────────────────────────────────────
export function MobileNav() {
  const [open,    setOpen]    = useState(false)
  const [mounted, setMounted] = useState(false)
  const projectId = useProjectContext()

  function openDrawer() {
    setMounted(true)
    // One rAF so the DOM is present before the transition starts
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)))
  }

  function closeDrawer() {
    setOpen(false)
    setTimeout(() => setMounted(false), 320)
  }

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

      {mounted && (
        <div className="fixed inset-0 z-50 lg:hidden">
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
                <GlobalNav onNav={closeDrawer} />
              )}
            </div>
            <SidebarFooter />
          </div>
        </div>
      )}
    </>
  )
}
