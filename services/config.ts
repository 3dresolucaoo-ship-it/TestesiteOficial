import { supabase } from '@/lib/supabaseClient'
import { serviceError } from '@/lib/serviceError'
import { requireUserId } from '@/lib/getUser'
import type { AdminConfig } from '@/lib/types'

export const configService = {
  /**
   * Load config for the current authenticated user.
   * Always filters by user_id — no anonymous fallback.
   */
  async get(): Promise<AdminConfig | null> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('config')
      .select('data')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) serviceError('configService.get', error)
    return data ? (data.data as AdminConfig) : null
  },

  /**
   * Save config for the current authenticated user.
   * Upserts by user_id — one config row per user.
   */
  async set(config: AdminConfig): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('config')
      .upsert(
        { user_id: userId, data: config, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      )
    if (error) serviceError('configService.set', error)
  },
}
