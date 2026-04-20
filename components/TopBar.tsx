'use client'

import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useAuth } from '@/context/AuthContext'
import { MobileNav } from './Sidebar'
import { MODULE_CONFIG } from '@/lib/moduleConfig'
import type { ProjectModule } from '@/lib/types'
import { LogOut } from 'lucide-react'

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
  const title     = useTitle()
  const { signOut, user, role } = useAuth()

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
      style={{
        background: 'rgba(5,5,8,0.80)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.03), 0 4px 20px rgba(0,0,0,0.3)',
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
        className="text-[#f0f0f5] font-semibold text-sm flex-1"
        style={{ letterSpacing: '0.01em' }}
      >
        {title}
      </h1>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Role badge */}
        {role === 'admin' && (
          <span className="hidden sm:flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium
            bg-[rgba(124,58,237,0.12)] text-[#a78bfa] border border-[rgba(124,58,237,0.2)]">
            Admin
          </span>
        )}

        {/* User email dot */}
        {user && (
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"
              style={{ boxShadow: '0 0 6px rgba(16,185,129,0.8)' }} />
            <span className="text-[#555566] text-[11px] max-w-[120px] truncate">{user.email}</span>
          </div>
        )}

        {/* Sign out */}
        {user && (
          <button
            onClick={() => signOut()}
            className="p-1.5 rounded-lg text-[#444455] hover:text-[#f0f0f5] hover:bg-[rgba(255,255,255,0.06)] transition-all"
            title="Sair"
          >
            <LogOut size={13} />
          </button>
        )}
      </div>
    </header>
  )
}
