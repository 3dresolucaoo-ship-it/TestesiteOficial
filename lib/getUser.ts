import { supabase } from './supabaseClient'

/**
 * Returns the current authenticated user ID, validated against the Supabase server.
 * Uses getUser() — NOT getSession() — to avoid stale localStorage tokens.
 * Throws a clear error if the user is not authenticated.
 */
export async function requireUserId(): Promise<string> {
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
