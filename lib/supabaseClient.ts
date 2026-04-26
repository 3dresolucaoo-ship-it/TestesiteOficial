import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/** True when both env vars are present — gates all Supabase calls. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

/**
 * Supabase browser client (uses @supabase/ssr so auth is stored in cookies,
 * not localStorage — this lets the middleware read the session server-side).
 */
export const supabase = createBrowserClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseKey  || 'placeholder-anon-key',
)
