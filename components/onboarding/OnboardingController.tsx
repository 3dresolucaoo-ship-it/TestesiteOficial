'use client'

import { useOnboarding } from '@/lib/hooks/useOnboarding'
import { OnboardingWizard } from './OnboardingWizard'

/**
 * OnboardingController — orquestrador do wizard de onboarding.
 *
 * Montado no AppShell (dentro de StoreProvider). Decide quando exibir o wizard
 * baseado em user_settings.onboarding_completed no Supabase.
 *
 * Fluxo:
 *   loading      → nao renderiza nada (nao bloqueia UI)
 *   show         → renderiza OnboardingWizard (portal via createPortal)
 *   done         → nao renderiza nada
 *   unavailable  → nao renderiza nada (Supabase sem config ou tabela ausente)
 *
 * Persistencia fire-and-forget: falhas nao crasham o app. Se a tabela
 * user_settings nao existir, status fica 'unavailable' e o wizard simplesmente
 * nao aparece — sem erro visivel pro usuario.
 *
 * Implementado em 2026-05-29 (Onda 5 pre-launch 11/06).
 * Migration necessaria: supabase/migrations/20260520_user_settings_onboarding.sql
 * Confirmar com Bruna se ja foi aplicada em prod antes de testar.
 */
export function OnboardingController() {
  const { status, step, next, back, skip, complete } = useOnboarding()

  if (status !== 'show') return null

  return (
    <OnboardingWizard
      step={step}
      onNext={next}
      onBack={back}
      onSkip={skip}
      onComplete={complete}
    />
  )
}
