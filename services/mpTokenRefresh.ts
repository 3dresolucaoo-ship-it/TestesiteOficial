/**
 * Mercado Pago token refresh — server-side only.
 *
 * Called automatically by paymentConfigService.getActiveConfig() when the
 * access_token is within REFRESH_BUFFER_MS of expiry.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

const MP_TOKEN_URL       = 'https://api.mercadopago.com/oauth/token'
const REFRESH_BUFFER_MS  = 5 * 60 * 1000 // refresh 5 min before expiry

export interface MpTokenResponse {
  access_token:  string
  refresh_token: string
  expires_in:    number   // seconds
  public_key?:   string
  user_id?:      number
  live_mode?:    boolean
}

export function needsRefresh(tokenExpiresAt: string | undefined): boolean {
  if (!tokenExpiresAt) return false
  return Date.now() + REFRESH_BUFFER_MS >= new Date(tokenExpiresAt).getTime()
}

/**
 * Exchange a refresh_token for a new access_token + refresh_token.
 * Returns null if env vars are missing or MP returns an error.
 */
export async function refreshMpToken(refreshToken: string): Promise<MpTokenResponse | null> {
  const clientId     = process.env.MP_CLIENT_ID
  const clientSecret = process.env.MP_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error('[mpRefresh] Missing MP_CLIENT_ID or MP_CLIENT_SECRET')
    return null
  }

  try {
    const res = await fetch(MP_TOKEN_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'refresh_token',
        client_id:     clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[mpRefresh] MP refresh failed:', res.status, err)
      return null
    }

    return (await res.json()) as MpTokenResponse
  } catch (err) {
    console.error('[mpRefresh] fetch error:', err)
    return null
  }
}

/**
 * Persist refreshed tokens back to payment_configs.
 * Uses the provided client (RLS) or falls back to admin if omitted.
 */
export async function persistRefreshedTokens(
  configId:     string,
  userId:       string,
  tokens:       MpTokenResponse,
  client:       SupabaseClient,
): Promise<void> {
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  const { error } = await client
    .from('payment_configs')
    .update({
      access_token:    tokens.access_token,
      refresh_token:   tokens.refresh_token,
      token_expires_at: expiresAt,
      ...(tokens.public_key ? { public_key: tokens.public_key } : {}),
    })
    .eq('id', configId)
    .eq('user_id', userId)

  if (error) {
    console.error('[mpRefresh] Failed to persist refreshed tokens:', error.message)
  }
}
