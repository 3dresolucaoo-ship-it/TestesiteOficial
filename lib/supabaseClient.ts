import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/** True when both env vars are present — gates all Supabase calls. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

/**
 * Supabase browser client.
 *
 * The client is always instantiated so it can be imported at module level,
 * but all actual query calls must be guarded by `isSupabaseConfigured`.
 * When env vars are missing we pass a placeholder URL so the constructor
 * does not throw during static build/SSR.
 */
export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseKey  || 'placeholder-anon-key',
)
