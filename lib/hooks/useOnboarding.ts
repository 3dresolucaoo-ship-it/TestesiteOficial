'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { onboardingService } from '@/services/onboarding'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type OnboardingStatus =
  | 'loading'    // buscando settings no Supabase
  | 'show'       // wizard deve ser exibido
  | 'done'       // ja completado ou skipped — nao exibir
  | 'unavailable' // Supabase nao configurado / tabela nao existe

export interface UseOnboardingReturn {
  status:    OnboardingStatus
  step:      number
  goTo:      (step: number) => void
  next:      () => void
  back:      () => void
  complete:  () => void
  skip:      () => void
}

const TOTAL_STEPS = 4

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useOnboarding(): UseOnboardingReturn {
  const [status, setStatus] = useState<OnboardingStatus>('loading')
  const [step,   setStep]   = useState(0)

  // Ref para evitar re-renders desnecessarios em closures de callbacks
  const stepRef = useRef(step)
  useEffect(() => { stepRef.current = step }, [step])

  // ── Carrega estado inicial do Supabase ────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus('unavailable')
      return
    }

    let cancelled = false

    onboardingService.get().then(settings => {
      if (cancelled) return

      if (settings === null) {
        // Primeira vez — linha ainda nao existe, wizard deve aparecer
        setStep(0)
        setStatus('show')
        return
      }

      if (settings.onboardingCompleted) {
        setStatus('done')
        return
      }

      // Retomada: step salvo anteriormente
      setStep(settings.onboardingStep)
      setStatus('show')
    }).catch(() => {
      if (cancelled) return
      // Erro ao buscar: nao bloqueia — nao exibe o wizard
      setStatus('unavailable')
    })

    return () => { cancelled = true }
  }, [])

  // ── Callbacks ─────────────────────────────────────────────────────────────

  const goTo = useCallback((target: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_STEPS - 1, target))
    setStep(clamped)
    void onboardingService.saveStep(clamped)
  }, [])

  const next = useCallback(() => {
    const nextStep = stepRef.current + 1
    if (nextStep >= TOTAL_STEPS) return
    goTo(nextStep)
  }, [goTo])

  const back = useCallback(() => {
    const prevStep = stepRef.current - 1
    if (prevStep < 0) return
    goTo(prevStep)
  }, [goTo])

  const complete = useCallback(() => {
    setStatus('done')
    void onboardingService.complete()
  }, [])

  const skip = useCallback(() => {
    setStatus('done')
    void onboardingService.skip()
  }, [])

  return { status, step, goTo, next, back, complete, skip }
}
