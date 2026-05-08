/**
 * GET /api/integrations/stripe/callback?code=...&state=...
 *
 * Handles the OAuth2 callback from Stripe Connect.
 *   1. Validates CSRF state cookie
 *   2. Identifies the logged-in user from session cookies
 *   3. Exchanges code → access_token via Stripe API
 *   4. Upserts payment_configs (the connected account access_token replaces
 *      the platform secret key — every API call against the connected account
 *      uses this token)
 *   5. Redirects to /settings with success/error query param
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY        — platform secret key (used to authenticate the
 *                              token exchange request to Stripe)
 *   STRIPE_CONNECT_CLIENT_ID — for completeness; not strictly needed at exchange
 *   NEXT_PUBLIC_APP_URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUser }                   from '@/lib/auth'
import { createServerClient }        from '@/lib/supabaseServer'
import { paymentConfigService }      from '@/services/paymentConfig'

const STRIPE_TOKEN_URL = 'https://connect.stripe.com/oauth/token'

interface StripeTokenResponse {
  access_token:           string
  refresh_token?:         string
  scope?:                 string
  livemode:               boolean
  token_type:             string
  stripe_user_id:         string
  stripe_publishable_key?: string
  error?:                 string
  error_description?:     string
}

function settingsRedirect(appUrl: string, status: 'connected' | 'error', detail?: string) {
  const url = new URL('/settings', appUrl)
  url.searchParams.set('tab',    'vitrine')
  url.searchParams.set('stripe', status)
  if (detail) url.searchParams.set('detail', detail)
  return NextResponse.redirect(url.toString())
}

export async function GET(req: NextRequest) {
  const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'
  const platformKey  = process.env.STRIPE_SECRET_KEY

  if (!platformKey) {
    return settingsRedirect(appUrl, 'error', 'platform_key_missing')
  }

  // ── 1. CSRF state validation ──────────────────────────────────────────────
  const { searchParams } = req.nextUrl
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const err   = searchParams.get('error')

  // User canceled / Stripe returned error
  if (err) {
    return settingsRedirect(appUrl, 'error', err)
  }

  if (!code || !state) {
    return settingsRedirect(appUrl, 'error', 'missing_params')
  }

  const savedState = req.cookies.get('stripe_oauth_state')?.value
  if (!savedState || savedState !== state) {
    return settingsRedirect(appUrl, 'error', 'invalid_state')
  }

  // ── 2. Identify user ──────────────────────────────────────────────────────
  const user = await getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', appUrl))
  }

  // ── 3. Exchange code for access_token ─────────────────────────────────────
  let tokens: StripeTokenResponse
  try {
    const res = await fetch(STRIPE_TOKEN_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        code,
        client_secret: platformKey,
      }),
    })

    tokens = (await res.json()) as StripeTokenResponse

    if (!res.ok || tokens.error) {
      console.error('[stripe/callback] token exchange failed:', res.status, tokens)
      return settingsRedirect(appUrl, 'error', tokens.error ?? 'token_exchange_failed')
    }
  } catch (e) {
    console.error('[stripe/callback] fetch error:', e)
    return settingsRedirect(appUrl, 'error', 'network_error')
  }

  // ── 4. Persist to payment_configs ────────────────────────────────────────
  // Stripe Connect tokens don't expire (no refresh flow needed for Standard
  // accounts) — we still use upsertOAuthConfig for is_active=true semantics
  // and so the UI knows it was connected via OAuth (hasRefreshToken=true if
  // Stripe returned one).
  try {
    const client = await createServerClient()
    await paymentConfigService.upsertOAuthConfig(user.id, {
      provider:       'stripe',
      accessToken:    tokens.access_token,
      refreshToken:   tokens.refresh_token ?? '',
      // Stripe access_tokens for Standard accounts don't expire — set far future
      tokenExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      publicKey:      tokens.stripe_publishable_key,
      mpUserId:       tokens.stripe_user_id, // reusing the column for the connected acct id
      sandbox:        !tokens.livemode,
    }, client)
  } catch (e) {
    console.error('[stripe/callback] DB persist error:', e)
    return settingsRedirect(appUrl, 'error', 'db_error')
  }

  // ── 5. Clear state cookie + redirect ─────────────────────────────────────
  const response = settingsRedirect(appUrl, 'connected')
  response.cookies.delete('stripe_oauth_state')
  return response
}
