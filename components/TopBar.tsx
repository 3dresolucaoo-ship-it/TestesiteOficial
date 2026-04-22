'use client'

import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { MobileNav } from './Sidebar'
import { MODULE_CONFIG } from '@/lib/moduleConfig'
import type { ProjectModule } from '@/lib/types'
import { LogOut, Sun, Moon } from 'lucide-react'

const GLOBAL_TITLES: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/projects':   'Projetos',
  '/finance':    'Finanças',
  '/orders':     'Vendas',
  '/production': 'Operação',
  '/content':    'Conteúdo',
  '/decisions':  'Decisões',
  '/settings':   'Configurações',
  '/inventory':  'Estoque',
  '/products':   'Produtos',
}

function useTitle(): string {
  const pathname = usePathname()
  const { state } = useStore()

  const global = Object.entries(GLOBAL_TITLES).find(
    ([key]) => pathname === key || pathname.startsWith(key + '/'),
  )
  if (global) return global[1]

  const parts = pathname.split('/')
  if (parts[1] === 'projects' && parts[2]) {
    const project    = state.projects.find(p => p.id === parts[2])
    const projectName = project?.name ?? 'Projeto'
    const module      = parts[3] as ProjectModule | undefined
    if (!module) return projectName
    const moduleCfg = MODULE_CONFIG[module]
    if (moduleCfg) return `${projectName} — ${moduleCfg.label}`
    return projectName
  }

  return 'BVaz Hub'
}

export function TopBar() {
  const title             = useTitle()
  const { signOut, user, role } = useAuth()
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
      style={{
        background:          'var(--t-topbar-bg)',
        backdropFilter:      'blur(24px)',
        WebkitBackdropFilter:'blur(24px)',
        borderBottom:        '1px solid var(--t-topbar-border)',
        boxShadow:           'var(--t-topbar-shadow)',
      }}
    >
      {/* Top accent gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5) 30%, rgba(59,130,246,0.4) 70%, transparent)',
        }}
      />

      <MobileNav />

      <h1
        className="font-semibold text-sm flex-1"
        style={{ color: 'var(--t-text-primary)', letterSpacing: '0.01em' }}
      >
        {title}
      </h1>

      {/* Right side */}
      <div className="flex items-center gap-2">

        {/* Role badge */}
        {role === 'admin' && (
          <span className="hidden sm:flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium"
            style={{
              background:  'var(--t-accent-soft)',
              color:       '#a78bfa',
              border:      '1px solid rgba(124,58,237,0.2)',
            }}>
            Admin
          </span>
        )}

        {/* User email */}
        {user && (
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"
              style={{ boxShadow: '0 0 6px rgba(16,185,129,0.8)' }} />
            <span className="text-[11px] max-w-[120px] truncate"
              style={{ color: 'var(--t-text-muted)' }}>
              {user.email}
            </span>
          </div>
        )}

        {/* Theme toggle */}
        <button
          id="theme-toggle-btn"
          onClick={toggle}
          title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          className="p-1.5 rounded-lg transition-all"
          style={{
            color:      'var(--t-text-secondary)',
            background: 'transparent',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--t-hover)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--t-text-primary)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--t-text-secondary)'
          }}
        >
          {isDark
            ? <Sun  size={14} strokeWidth={1.8} />
            : <Moon size={14} strokeWidth={1.8} />
          }
        </button>

        {/* Sign out */}
        {user && (
          <button
            onClick={() => signOut()}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--t-text-muted)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-text-primary)'
              ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--t-hover)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-text-muted)'
              ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            }}
            title="Sair"
          >
            <LogOut size={13} />
          </button>
        )}
      </div>
    </header>
  )
}
