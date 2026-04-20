import { supabase } from '@/lib/supabaseClient'
import { serviceError } from '@/lib/serviceError'

// ─── Types ─────────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'user'

export interface UserProfile {
  id:   string
  role: UserRole
}

// ─── Service ───────────────────────────────────────────────────────────────────
export const profilesService = {
  /** Fetch the profile for a given user ID. Returns null if not found. */
  async get(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle()
    if (error) serviceError('profilesService.get', error)
    if (!data) return null
    return { id: data.id, role: data.role as UserRole }
  },

  /**
   * Create or update a profile.
   * Called automatically on first sign-in to ensure every user has a row.
   */
  async upsert(userId: string, role: UserRole = 'user'): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, role }, { onConflict: 'id' })
    if (error) serviceError('profilesService.upsert', error)
  },

  /** Admin-only: change a user's role. */
  async setRole(userId: string, role: UserRole): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
    if (error) serviceError('profilesService.setRole', error)
  },
}
