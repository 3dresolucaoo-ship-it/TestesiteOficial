/**
 * Supabase Admin Client (service role key).
 *
 * Bypasses Row Level Security — use ONLY in server-side code:
 *   - API routes (app/api/**)
 *   - Webhook handlers
 *   - Server Actions
 *
 * NEVER import this file from a client component or expose it to the browser.
 * The service role key grants full DB access with no restrictions.
 */
import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      '[supabaseAdmin] Missing env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY',
    )
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  })
}
