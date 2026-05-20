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
 */

import { useEffect } from 'react'
import { initPostHog } from '@/lib/posthog'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog()
  }, [])

  return <>{children}</>
}
