'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'
import { Menu, X, LogOut, LayoutDashboard, TrendingUp, ShoppingCart, Package } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { SidebarGlobalNav } from './SidebarGlobalNav'
import { SidebarProjectNav } from './SidebarProjectNav'
import { SidebarFooter } from './SidebarFooter'
import { SidebarLogo } from './SidebarLogo'
import { useProjectContext } from './useSidebarState'

// ─── BottomNav ────────────────────────────────────────────────────────────────

const BOTTOM_NAV = [
  { href: '/dashboard', label: 'Inicio',   icon: LayoutDashboard },
  { href: '/finance',   label: 'Financas', icon: TrendingUp },
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

// ─── MobileNav ────────────────────────────────────────────────────────────────

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

  // Escuta evento do botao "Mais" do BottomNav — deps vazia intencional:
  // openDrawer so usa setters do useState, que sao estaveis por definicao.
  useEffect(() => {
    window.addEventListener('open-mobile-nav', openDrawer)
    return () => window.removeEventListener('open-mobile-nav', openDrawer)
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
            {/* Linha de fechamento */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--t-footer-border)' }}
            >
              <SidebarLogo />
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
                <SidebarProjectNav projectId={projectId} onNav={closeDrawer} />
              ) : (
                <SidebarGlobalNav onNav={closeDrawer} collapsed={false} />
              )}
            </div>

            <SidebarFooter />

            {user && (
              <div
                className="px-4 pb-4 pt-2"
                style={{ borderTop: '1px solid var(--t-footer-border)' }}
              >
                <button
                  onClick={() => { closeDrawer(); void signOut() }}
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
        document.body,
      )}
    </>
  )
}
