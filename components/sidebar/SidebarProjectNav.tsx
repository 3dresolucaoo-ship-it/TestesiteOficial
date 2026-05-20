'use client'

import Link from 'next/link'
import { ArrowLeft, LayoutDashboard } from 'lucide-react'
import { useStore } from '@/lib/store'
import { MODULE_CONFIG, getProjectColor } from '@/lib/moduleConfig'
import { SidebarNavLink } from './SidebarNavLink'

interface SidebarProjectNavProps {
  projectId: string
  onNav?: () => void
}

export function SidebarProjectNav({ projectId, onNav }: SidebarProjectNavProps) {
  const { state } = useStore()
  const project = state.projects.find(p => p.id === projectId)
  const color   = project ? getProjectColor(project) : '#7c3aed'
  const modules = project?.modules ?? []

  return (
    <div className="sidebar-scroll flex flex-col flex-1 min-h-0 overflow-y-auto">
      {/* Voltar para global */}
      <div className="px-2 pt-3">
        <Link
          href="/projects"
          onClick={onNav}
          className="flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-lg"
          style={{ color: 'var(--t-nav-inactive)' }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--t-text-primary)'
            ;(e.currentTarget as HTMLAnchorElement).style.background = 'var(--t-hover)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--t-nav-inactive)'
            ;(e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
          }}
        >
          <ArrowLeft size={14} />
          <span>Voltar</span>
        </Link>
      </div>

      {/* Cabecalho do projeto */}
      <div
        className="px-5 py-4 mt-1"
        style={{ borderBottom: '1px solid var(--t-footer-border)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: color }}
          >
            {project?.name.charAt(0) ?? '?'}
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--t-text-primary)' }}
            >
              {project?.name ?? '...'}
            </p>
            <p
              className="text-[11px] truncate capitalize"
              style={{ color: 'var(--t-text-muted)' }}
            >
              {project?.type?.replace('_', ' ') ?? ''}
            </p>
          </div>
        </div>
      </div>

      {/* Navegacao do projeto */}
      <nav className="flex flex-col gap-0.5 mt-3 px-2 flex-1">
        <SidebarNavLink
          href={`/projects/${projectId}`}
          label="Visao Geral"
          icon={LayoutDashboard}
          onClick={onNav}
          exact
        />
        {modules.map(mod => {
          const cfg = MODULE_CONFIG[mod]
          if (!cfg) return null
          return (
            <SidebarNavLink
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
