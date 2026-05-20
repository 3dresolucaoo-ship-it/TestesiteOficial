'use client'

/**
 * CalcProHeroTracker — dispara evento PostHog `calc_pro_pitch_view` uma vez
 * quando o pitch Pro carrega no cliente.
 *
 * Server Component não pode usar hooks de lifecycle. Este é um Client Component
 * mínimo, sem render visual (retorna null), usado apenas pra tracking.
 */

import { useEffect, useRef } from 'react'
import { track } from '@/lib/posthog'

export function CalcProHeroTracker() {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    track('calc_pro_pitch_view')
  }, [])

  return null
}
