import { supabase } from '@/lib/supabaseClient'
import { requireUserId } from '@/lib/getUser'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface UserSettings {
  userId:              string
  onboardingCompleted: boolean
  onboardingStep:      number
  onboardingSkippedAt: string | null
  settings:            Record<string, unknown>
  updatedAt:           string
}

// ─── DB mappers ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDB(row: Record<string, any>): UserSettings {
  return {
    userId:              row.user_id,
    onboardingCompleted: row.onboarding_completed ?? false,
    onboardingStep:      row.onboarding_step ?? 0,
    onboardingSkippedAt: row.onboarding_skipped_at ?? null,
    settings:            (row.settings as Record<string, unknown>) ?? {},
    updatedAt:           row.updated_at,
  }
}

// ─── Service ────────────────────────────────────────────────────────────────────

export const onboardingService = {
  /**
   * Busca settings do usuario atual. Retorna null se a linha ainda nao existe
   * (primeiro acesso antes de qualquer persistencia de onboarding).
   */
  async get(): Promise<UserSettings | null> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.warn('[onboardingService.get] erro ao buscar settings:', error.message)
      return null
    }
    if (!data) return null
    return fromDB(data)
  },

  /**
   * Persiste o step atual do wizard. Fire-and-forget — falhas sao silenciosas
   * para nao bloquear a UX do onboarding.
   */
  async saveStep(step: number): Promise<void> {
    try {
      const userId = await requireUserId()
      await supabase
        .from('user_settings')
        .upsert(
          { user_id: userId, onboarding_step: step },
          { onConflict: 'user_id' },
        )
    } catch (err) {
      console.warn('[onboardingService.saveStep] falha silenciosa:', err)
    }
  },

  /**
   * Marca o onboarding como concluido (ultimo step finalizado).
   */
  async complete(): Promise<void> {
    try {
      const userId = await requireUserId()
      await supabase
        .from('user_settings')
        .upsert(
          {
            user_id:              userId,
            onboarding_completed: true,
            onboarding_step:      3,
          },
          { onConflict: 'user_id' },
        )
    } catch (err) {
      console.warn('[onboardingService.complete] falha silenciosa:', err)
    }
  },

  /**
   * Marca como skipped. onboarding_completed = true para nao re-exibir.
   */
  async skip(): Promise<void> {
    try {
      const userId = await requireUserId()
      await supabase
        .from('user_settings')
        .upsert(
          {
            user_id:               userId,
            onboarding_completed:  true,
            onboarding_skipped_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        )
    } catch (err) {
      console.warn('[onboardingService.skip] falha silenciosa:', err)
    }
  },

  /**
   * Reset do onboarding — util para dev/debug.
   */
  async reset(): Promise<void> {
    try {
      const userId = await requireUserId()
      await supabase
        .from('user_settings')
        .upsert(
          {
            user_id:               userId,
            onboarding_completed:  false,
            onboarding_step:       0,
            onboarding_skipped_at: null,
          },
          { onConflict: 'user_id' },
        )
    } catch (err) {
      console.warn('[onboardingService.reset] falha silenciosa:', err)
    }
  },
}
