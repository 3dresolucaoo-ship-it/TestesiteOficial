'use client'

import { usePathname } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { AppShell } from '@/components/AppShell'
import { AuthProvider } from '@/context/AuthContext'
import type { AppState } from '@/lib/types'
import type { LazyModuleKey } from '@/lib/store'

const MARKETING_PATHS = ['/', '/waitlist', '/privacidade', '/termos', '/calculadora', '/mockups']

// V4_PATHS = rotas que já trazem shell próprio (sidebar + topbar) e NÃO devem
// ser envolvidas pelo AppShell legado. Adicionar aqui ao migrar mais módulos V4.
// /library: design system interno com shell proprio (sem sidebar legada).
const V4_PATHS = ['/dashboard', '/library']

function isMarketingPath(pathname: string) {
  return MARKETING_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

function isV4Path(pathname: string) {
  return V4_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

export function LayoutSwitch({
  children,
  initialState,
  preloadedKeys,
}: {
  children: ReactNode
  initialState: AppState | null
  preloadedKeys: LazyModuleKey[]
}) {
  const pathname    = usePathname()
  const isMarketing = isMarketingPath(pathname)
  const isV4        = isV4Path(pathname)

  // Marca <html data-layout="marketing"> no client. O bg/color em si fica no
  // CSS (html[data-layout="marketing"] body) — inline style sobrescrevia o
  // gradient ambiente. Especificidade do seletor já vence o CSS legado.
  useEffect(() => {
    const html = document.documentElement
    if (isMarketing) {
      html.setAttribute('data-layout', 'marketing')
    } else {
      html.removeAttribute('data-layout')
    }
  }, [isMarketing])

  if (isMarketing) {
    return <main className="min-h-screen bg-background text-foreground">{children}</main>
  }

  // V4: rotas com shell próprio (sidebar+topbar). Renderiza children direto.
  if (isV4) {
    return (
      <AuthProvider>
        {children}
      </AuthProvider>
    )
  }

  return (
    <AuthProvider>
      <AppShell initialState={initialState} preloadedKeys={preloadedKeys}>
        {children}
      </AppShell>
    </AuthProvider>
  )
}
