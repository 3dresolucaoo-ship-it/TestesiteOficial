'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, FolderKanban, ShoppingCart, Printer, Video,
  Lightbulb, TrendingUp, X, Menu, ArrowLeft, ChevronRight, Settings, Package, Boxes,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import { MODULE_CONFIG, getProjectColor } from '@/lib/moduleConfig'

// ─── Global navigation items ─────────────────────────────────────────────────
const GLOBAL_NAV = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/projects',   label: 'Projetos',   icon: FolderKanban },
]

const GLOBAL_MODULES = [
  { href: '/finance',    label: 'Finanças',       icon: TrendingUp },
  { href: '/orders',     label: 'Vendas',         icon: ShoppingCart },
  { href: '/products',   label: 'Produtos',       icon: Boxes },
  { href: '/inventory',  label: 'Estoque',        icon: Package },
  { href: '/production', label: 'Produção',       icon: Printer },
  { href: '/content',    label: 'Conteúdo',       icon: Video },
  { href: '/decisions',  label: 'Decisões',       icon: Lightbulb },
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
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-white/[0.08] text-white'
          : 'text-[#888888] hover:text-[#ebebeb] hover:bg-white/[0.04]'
      }`}
    >
      <Icon size={15} strokeWidth={1.5} />
      <span className="truncate">{label}</span>
      {active && <ChevronRight size={12} className="ml-auto opacity-40" />}
    </Link>
  )
}

// ─── Global sidebar content ───────────────────────────────────────────────────
function GlobalNav({ onNav }: { onNav?: () => void }) {
  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <Logo />
      <nav className="flex flex-col gap-0.5 mt-5 px-2">
        {GLOBAL_NAV.map(item => (
          <NavLink key={item.href} {...item} onClick={onNav} exact />
        ))}
      </nav>
      <div className="mt-4 px-2">
        <p className="text-[#3a3a3a] text-[10px] font-semibold uppercase tracking-widest px-3 mb-1">Global</p>
        <nav className="flex flex-col gap-0.5">
          {GLOBAL_MODULES.map(item => (
            <NavLink key={item.href} {...item} onClick={onNav} />
          ))}
        </nav>
      </div>
      <div className="mt-4 px-2">
        <p className="text-[#3a3a3a] text-[10px] font-semibold uppercase tracking-widest px-3 mb-1">Sistema</p>
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
          className="flex items-center gap-2 px-3 py-2 text-[#888888] hover:text-[#ebebeb] text-sm transition-colors rounded-lg hover:bg-white/[0.04]"
        >
          <ArrowLeft size={14} />
          <span>Voltar</span>
        </Link>
      </div>

      {/* Project header */}
      <div className="px-5 py-4 mt-1 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: color }}
          >
            {project?.name.charAt(0) ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-[#ebebeb] text-sm font-semibold truncate">{project?.name ?? '...'}</p>
            <p className="text-[#555555] text-[11px] truncate capitalize">{project?.type?.replace('_', ' ') ?? ''}</p>
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
  return (
    <div className="px-5 pt-5 pb-1">
      <Link href="/dashboard" className="flex items-center gap-2 group">
        <div className="w-7 h-7 rounded-lg bg-[#7c3aed] flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:bg-[#6d28d9] transition-colors">
          B
        </div>
        <span className="text-[#ebebeb] font-semibold text-sm">BVaz Hub</span>
      </Link>
    </div>
  )
}

// ─── Root sidebar footer ──────────────────────────────────────────────────────
function SidebarFooter() {
  const { loading, dbError } = useStore()
  return (
    <div className="mt-auto pt-3 px-5 pb-4 border-t border-[#2a2a2a]">
      <p className="text-[#3a3a3a] text-[11px]">Sistema Operacional v0.3</p>
      {isSupabaseConfigured ? (
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            loading ? 'bg-[#f59e0b] animate-pulse' : dbError ? 'bg-[#ef4444]' : 'bg-[#10b981]'
          }`} />
          <span className="text-[#3a3a3a] text-[10px] truncate">
            {loading ? 'Conectando…' : dbError ? 'Offline' : 'Supabase'}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#555555] shrink-0" />
          <span className="text-[#3a3a3a] text-[10px]">Local</span>
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
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/projects',   label: 'Projetos',   icon: FolderKanban },
  { href: '/finance',    label: 'Finanças',   icon: TrendingUp },
  { href: '/orders',     label: 'Vendas',     icon: ShoppingCart },
  { href: '/inventory',  label: 'Estoque',    icon: Package },
]

export function BottomNav() {
  const pathname  = usePathname()
  const projectId = useProjectContext()

  // Inside a project sub-page: use hamburger drawer instead
  if (projectId) return null

  return (
    <nav className="mobile-nav lg:hidden flex items-center justify-around px-1 py-1">
      {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 flex-1 py-2 rounded-xl transition-all"
            style={{
              color:      active ? '#a78bfa' : '#555566',
              background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
            }}
          >
            <Icon size={18} strokeWidth={active ? 2 : 1.5} />
            <span className="text-[9px] font-medium">{label}</span>
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
    <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-[#0a0a0a] border-r border-[#2a2a2a] fixed top-0 left-0 z-30">
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
  const [open, setOpen] = useState(false)
  const projectId = useProjectContext()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 text-[#888888] hover:text-[#ebebeb] transition-colors"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#0f0f0f] border-r border-[#2a2a2a] flex flex-col">
            <div className="flex items-center justify-end p-3 border-b border-[#2a2a2a]">
              <button onClick={() => setOpen(false)} className="p-1 text-[#888888] hover:text-[#ebebeb]">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col">
              {projectId ? (
                <ProjectNav projectId={projectId} onNav={() => setOpen(false)} />
              ) : (
                <GlobalNav onNav={() => setOpen(false)} />
              )}
            </div>
            <SidebarFooter />
          </div>
        </div>
      )}
    </>
  )
}
