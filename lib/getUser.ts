import { supabase } from './supabaseClient'

/**
 * Returns the current authenticated user ID.
 * Reads from the local session first (no network call) — fast and works offline.
 * RLS on Supabase enforces server-side security regardless.
 * Falls back to getUser() (server verify) if session is missing.
 * Throws a clear error if the user is not authenticated.
 */
export async function requireUserId(): Promise<string> {
  // Fast path: read from local session cache. Em condições normais responde
  // em < 50ms, mas em alguns casos getSession() trava (race em refresh token,
  // service worker, etc.). Damos timeout de 2s e caímos pro getUser() — que
  // faz network mas é mais confiável.
  const sessionTimeout = new Promise<null>(resolve => setTimeout(() => resolve(null), 2000))
  const sessionResult = await Promise.race([
    supabase.auth.getSession().then(r => r.data.session).catch(() => null),
    sessionTimeout,
  ])
  if (sessionResult?.user?.id) return sessionResult.user.id

  // Slow path: server-verify token (handles edge cases like session refresh)
  const { data, error } = await supabase.auth.getUser()
  const userId = data?.user?.id
  if (error || !userId) {
    throw new Error('requireUserId: user is not authenticated')
  }
  return userId
}

/**
 * Soft variant — returns null instead of throwing.
 * Use only in contexts where unauthenticated access is acceptable (e.g. local dev).
 */
export async function getSessionUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser()
    return data?.user?.id ?? null
  } catch {
    return null
  }
}
