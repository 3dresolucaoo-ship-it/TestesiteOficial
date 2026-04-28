/**
 * GET /api/integrations/mercadopago/callback?code=...&state=...
 *
 * Handles the OAuth2 callback from Mercado Pago.
 *   1. Validates CSRF state cookie
 *   2. Identifies the logged-in user from session cookies
 *   3. Exchanges code → access_token + refresh_token via MP API
 *   4. Upserts payment_configs (RLS, no service role key)
 *   5. Redirects to /settings with success/error query param
 *
 * Required env vars:
 *   MP_CLIENT_ID, MP_CLIENT_SECRET, NEXT_PUBLIC_APP_URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUser }                   from '@/lib/auth'
import { createServerClient }        from '@/lib/supabaseServer'
import { paymentConfigService }      from '@/services/paymentConfig'
import type { MpTokenResponse }      from '@/services/mpTokenRefresh'

const MP_TOKEN_URL = 'https://api.mercadopago.com/oauth/token'

function settingsRedirect(appUrl: string, status: 'connected' | 'error', detail?: string) {
  const url = new URL('/settings', appUrl)
  url.searchParams.set('tab',    'vitrine')
  url.searchParams.set('mp',     status)
  if (detail) url.searchParams.set('detail', detail)
  return NextResponse.redirect(url.toString())
}

export async function GET(req: NextRequest) {
  const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'
  const clientId     = process.env.MP_CLIENT_ID
  const clientSecret = process.env.MP_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'MP OAuth not configured' }, { status: 500 })
  }

  // ── 1. CSRF state validation ──────────────────────────────────────────────
  const { searchParams } = req.nextUrl
  const code  = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) {
    return settingsRedirect(appUrl, 'error', 'missing_params')
  }

  const savedState = req.cookies.get('mp_oauth_state')?.value
  if (!savedState || savedState !== state) {
    return settingsRedirect(appUrl, 'error', 'invalid_state')
  }

  // ── 2. Identify user ──────────────────────────────────────────────────────
  const user = await getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', appUrl))
  }

  // ── 3. Exchange code for tokens ───────────────────────────────────────────
  const redirectUri = `${appUrl}/api/integrations/mercadopago/callback`

  let tokens: MpTokenResponse
  try {
    const res = await fetch(MP_TOKEN_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        client_id:     clientId,
        client_secret: clientSecret,
        code,
        redirect_uri:  redirectUri,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[mp/callback] token exchange failed:', res.status, err)
      return settingsRedirect(appUrl, 'error', 'token_exchange_failed')
    }

    tokens = (await res.json()) as MpTokenResponse
  } catch (err) {
    console.error('[mp/callback] fetch error:', err)
    return settingsRedirect(appUrl, 'error', 'network_error')
  }

  // ── 4. Persist to payment_configs ────────────────────────────────────────
  try {
    const client = await createServerClient()
    await paymentConfigService.upsertOAuthConfig(user.id, {
      provider:       'mercadopago',
      accessToken:    tokens.access_token,
      refreshToken:   tokens.refresh_token,
      tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      publicKey:      tokens.public_key,
      mpUserId:       tokens.user_id?.toString(),
      sandbox:        !tokens.live_mode,
    }, client)
  } catch (err) {
    console.error('[mp/callback] DB persist error:', err)
    return settingsRedirect(appUrl, 'error', 'db_error')
  }

  // ── 5. Clear state cookie + redirect ─────────────────────────────────────
  const response = settingsRedirect(appUrl, 'connected')
  response.cookies.delete('mp_oauth_state')
  return response
}
