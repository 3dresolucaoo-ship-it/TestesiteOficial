'use client'

import { useEffect } from 'react'
import {
  LayoutDashboard, ShoppingCart, Printer, Video,
  Lightbulb, TrendingUp, Package, Boxes, Users, BarChart3,
  Store, Layers, Settings, FolderKanban,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { SidebarNavLink } from './SidebarNavLink'
import { SidebarLogo } from './SidebarLogo'
import type { NavItem, ModuleNavItem } from './types'

// ─── Dados de navegacao ───────────────────────────────────────────────────────

const GLOBAL_NAV: NavItem[] = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/metrics',    label: 'Metricas',   icon: BarChart3 },
  { href: '/projects',   label: 'Projetos',   icon: FolderKanban },
]

const GLOBAL_MODULES: ModuleNavItem[] = [
  { href: '/finance',    label: 'Financas',       icon: TrendingUp,   key: 'finance' },
  { href: '/orders',     label: 'Vendas',         icon: ShoppingCart, key: 'orders' },
  { href: '/crm',        label: 'CRM',            icon: Users,        key: 'crm' },
  { href: '/products',   label: 'Produtos',       icon: Boxes,        key: 'products' },
  { href: '/inventory',  label: 'Estoque',        icon: Package,      key: 'inventory' },
  { href: '/production', label: 'Producao',       icon: Printer,      key: 'production' },
  { href: '/content',    label: 'Conteudo',       icon: Video,        key: 'content' },
  { href: '/decisions',  label: 'Decisoes',       icon: Lightbulb,    key: 'decisions' },
]

const VITRINE_NAV: NavItem[] = [
  { href: '/catalogs',   label: 'Catalogos',  icon: Store },
  { href: '/portfolios', label: 'Portfolios', icon: Layers },
]

const GLOBAL_SYSTEM: NavItem[] = [
  { href: '/settings',   label: 'Configuracoes', icon: Settings },
]

// ─── Componente ───────────────────────────────────────────────────────────────

interface SidebarGlobalNavProps {
  onNav?: () => void
  collapsed?: boolean
  onToggle?: () => void
}

export function SidebarGlobalNav({
  onNav,
  collapsed = false,
  onToggle,
}: SidebarGlobalNavProps) {
  const { state } = useStore()
  const accent = state.config?.brand?.accentColor

  useEffect(() => {
    if (accent) document.documentElement.style.setProperty('--t-accent', accent)
  }, [accent])

  const modCfg         = state.config?.modules
  const metricsEnabled = modCfg?.metrics ?? true
  const visibleModules = GLOBAL_MODULES.filter(m => modCfg ? modCfg[m.key] !== false : true)
  const visibleGlobalNav = GLOBAL_NAV.filter(n => n.href !== '/metrics' || metricsEnabled)

  // ── Modo colapsado (apenas icones) ────────────────────────────────────────
  if (collapsed) {
    return (
      <div className="sidebar-scroll flex flex-col flex-1 min-h-0 overflow-y-auto items-center pt-2 pb-2 gap-0.5">
        <SidebarLogo iconOnly />

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

        {visibleGlobalNav.map(item => (
          <SidebarNavLink key={item.href} {...item} onClick={onNav} exact iconOnly />
        ))}

        <div className="w-5 my-1.5" style={{ height: 1, background: 'var(--t-footer-border)' }} />

        {visibleModules.map(item => (
          <SidebarNavLink key={item.href} href={item.href} label={item.label} icon={item.icon} onClick={onNav} iconOnly />
        ))}

        <div className="w-5 my-1.5" style={{ height: 1, background: 'var(--t-footer-border)' }} />

        {VITRINE_NAV.map(item => (
          <SidebarNavLink key={item.href} {...item} onClick={onNav} iconOnly />
        ))}

        <div className="w-5 my-1.5" style={{ height: 1, background: 'var(--t-footer-border)' }} />

        {GLOBAL_SYSTEM.map(item => (
          <SidebarNavLink key={item.href} {...item} onClick={onNav} iconOnly />
        ))}
      </div>
    )
  }

  // ── Modo expandido ────────────────────────────────────────────────────────
  return (
    <div className="sidebar-scroll flex flex-col flex-1 min-h-0 overflow-y-auto pb-2">
      <SidebarLogo />

      <nav className="flex flex-col gap-0.5 mt-5 px-2">
        {visibleGlobalNav.map(item => (
          <SidebarNavLink key={item.href} {...item} onClick={onNav} exact />
        ))}
      </nav>

      <div className="mt-4 px-2">
        {onToggle ? (
          <button
            onClick={onToggle}
            className="flex items-center justify-between w-full px-3 mb-1 group"
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--t-sidebar-section)' }}
            >
              Global
            </p>
            <PanelLeftClose
              size={11}
              style={{ color: 'var(--t-sidebar-section)' }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </button>
        ) : (
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-1"
            style={{ color: 'var(--t-sidebar-section)' }}
          >
            Global
          </p>
        )}
        <nav className="flex flex-col gap-0.5">
          {visibleModules.map(item => (
            <SidebarNavLink key={item.href} href={item.href} label={item.label} icon={item.icon} onClick={onNav} />
          ))}
        </nav>
      </div>

      <div className="mt-4 px-2">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-1"
          style={{ color: 'var(--t-sidebar-section)' }}
        >
          Vitrine
        </p>
        <nav className="flex flex-col gap-0.5">
          {VITRINE_NAV.map(item => (
            <SidebarNavLink key={item.href} {...item} onClick={onNav} />
          ))}
        </nav>
      </div>

      <div className="mt-4 px-2">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-1"
          style={{ color: 'var(--t-sidebar-section)' }}
        >
          Sistema
        </p>
        <nav className="flex flex-col gap-0.5">
          {GLOBAL_SYSTEM.map(item => (
            <SidebarNavLink key={item.href} {...item} onClick={onNav} />
          ))}
        </nav>
      </div>
    </div>
  )
}
