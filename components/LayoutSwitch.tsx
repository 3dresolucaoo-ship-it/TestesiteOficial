'use client'

import { usePathname } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { AppShell } from '@/components/AppShell'
import type { AppState } from '@/lib/types'

const MARKETING_PATHS = ['/', '/waitlist', '/privacidade', '/termos', '/calculadora']

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

  return <AppShell initialState={initialState}>{children}</AppShell>
}
