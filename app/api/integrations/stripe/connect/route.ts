/**
 * GET /api/integrations/stripe/connect
 *
 * Initiates the Stripe Connect OAuth2 flow (Standard accounts).
 * Sets a short-lived state cookie (CSRF) and redirects to Stripe authorization.
 *
 * Required env vars:
 *   STRIPE_CONNECT_CLIENT_ID — from Stripe Dashboard → Connect → Settings (ca_xxx)
 *   NEXT_PUBLIC_APP_URL     — e.g. https://bvaz-hub.vercel.app
 */

import { NextResponse } from 'next/server'
import { getUser }      from '@/lib/auth'

const STRIPE_AUTH_URL = 'https://connect.stripe.com/oauth/authorize'

export async function GET() {
  const user = await getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'))
  }

  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'

  if (!clientId) {
    const url = new URL('/settings', appUrl)
    url.searchParams.set('tab',    'vitrine')
    url.searchParams.set('stripe', 'error')
    url.searchParams.set('detail', 'connect_not_configured')
    return NextResponse.redirect(url.toString())
  }

  const state       = crypto.randomUUID()
  const redirectUri = `${appUrl}/api/integrations/stripe/callback`

  const authUrl = new URL(STRIPE_AUTH_URL)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id',     clientId)
  authUrl.searchParams.set('scope',         'read_write')
  authUrl.searchParams.set('redirect_uri',  redirectUri)
  authUrl.searchParams.set('state',         state)

  const response = NextResponse.redirect(authUrl.toString())

  // CSRF state cookie — validated in callback
  response.cookies.set('stripe_oauth_state', state, {
    httpOnly: true,
    path:     '/api/integrations/stripe/callback',
    maxAge:   600, // 10 minutes
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
  })

  return response
}
