import { supabase } from './supabaseClient'

/**
 * Returns the current authenticated user ID.
 *
 * Reads from local session cache first (no network). If that doesn't resolve,
 * falls back to server-verify via getUser(). Both paths have HARD TIMEOUTS
 * so writes never hang forever in prod when @supabase/auth-js 2.106.x has
 * its known slow-cold-start behavior.
 *
 * RLS on Supabase enforces server-side security regardless.
 *
 * Cold-start in Vercel Fluid Compute observed empirically pre-soft-launch
 * 13/06 — supabase.auth.getUser() taking 12s+ on first call after Lambda
 * sleep. Without timeout, syncDispatch hangs, writes silently fail (lead
 * never persists), and the user sees an optimistic update that vanishes
 * on F5 reload.
 *
 * Throws a clear error if user is unauthenticated OR if auth times out
 * entirely — callers must handle the throw (toast/retry/rollback).
 */
export async function requireUserId(): Promise<string> {
  // Fast path: read from local session cache (cookie via @supabase/ssr).
  // Em condições normais responde em < 50ms. Timeout 5s pra cobrir
  // cold-start do supabase-js client (regression conhecida auth-js 2.106.x).
  const sessionTimeout = new Promise<null>(resolve => setTimeout(() => resolve(null), 5000))
  const sessionResult = await Promise.race([
    supabase.auth.getSession().then(r => r.data.session).catch(() => null),
    sessionTimeout,
  ])
  if (sessionResult?.user?.id) return sessionResult.user.id

  // Slow path: server-verify token (handles edge cases like session refresh).
  // Timeout 8s pra evitar travar pra sempre em prod quando auth-js cold-starts.
  // Throw com mensagem PT-BR amigável pra service catch + toast.
  const userTimeout = new Promise<null>(resolve => setTimeout(() => resolve(null), 8000))
  const verifiedUser = await Promise.race([
    supabase.auth.getUser().then(r => r.data?.user).catch(() => null),
    userTimeout,
  ])
  const userId = verifiedUser?.id
  if (!userId) {
    throw new Error('requireUserId: user is not authenticated (auth timeout — tente recarregar a pagina)')
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
