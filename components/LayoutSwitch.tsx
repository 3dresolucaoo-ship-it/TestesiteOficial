'use client'

import { usePathname } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { AppShell } from '@/components/AppShell'
import type { AppState } from '@/lib/types'

const MARKETING_PATHS = ['/', '/waitlist', '/privacidade', '/termos']

function isMarketingPath(pathname: string) {
  return MARKETING_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

export function LayoutSwitch({
  children,
  initialState,
}: {
  children: ReactNode
  initialState: AppState | null
}) {
  const pathname    = usePathname()
  const isMarketing = isMarketingPath(pathname)

  // Marca <html data-layout="marketing"> + força background body via JS
  // (CSS global ainda carrega gradient roxo legado do dashboard antes do hidrato)
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    if (isMarketing) {
      html.setAttribute('data-layout', 'marketing')
      // Pinta o body com tokens shadcn (Paleta B) — vence CSS legado
      body.style.background = 'hsl(var(--background))'
      body.style.color      = 'hsl(var(--foreground))'
    } else {
      html.removeAttribute('data-layout')
      body.style.background = ''
      body.style.color      = ''
    }
  }, [isMarketing])

  if (isMarketing) {
    return <main className="min-h-screen bg-background text-foreground">{children}</main>
  }

  return <AppShell initialState={initialState}>{children}</AppShell>
}
