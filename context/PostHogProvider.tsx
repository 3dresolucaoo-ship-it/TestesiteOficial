'use client'

/**
 * PostHogProvider — inicializa PostHog no browser uma única vez.
 *
 * Client Component porque PostHog é browser-only.
 * Envolvido pelo layout.tsx logo abaixo de ThemeProvider.
 * Sem children prop alterada — só inicializa e renderiza children direto.
 *
 * LGPD: inicialização não cria profile (person_profiles: 'identified_only').
 * Identificação só ocorre via identify() após consent_lgpd=true no WaitlistForm.
 *
 * Performance (TBT fix 2026-05-20):
 *   - initPostHog() usa dynamic import internamente (posthog-js lazy).
 *   - Aqui: defer via requestIdleCallback (ou setTimeout 0 fallback).
 *     O SDK só começa a carregar quando o browser está ocioso após first paint.
 *     Evita competir com hidratação de React no main thread.
 */

import { useEffect } from 'react'
import { initPostHog } from '@/lib/posthog'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Defer pra quando o browser estiver ocioso — não compete com hidratação
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => initPostHog(), { timeout: 3000 })
    } else {
      // Fallback Safari (não tem requestIdleCallback até iOS 16)
      setTimeout(initPostHog, 200)
    }
  }, [])

  return <>{children}</>
}
