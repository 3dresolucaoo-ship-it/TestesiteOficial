/**
 * GET /api/integrations/mercadopago/connect
 *
 * Initiates the Mercado Pago OAuth2 flow.
 * Sets a short-lived state cookie (CSRF protection) and redirects the user
 * to the MP authorization page.
 *
 * Required env vars:
 *   MP_CLIENT_ID       — from MP developer portal
 *   NEXT_PUBLIC_APP_URL — e.g. https://bvaz-hub.vercel.app
 */

import { NextResponse }    from 'next/server'
import { getUser }         from '@/lib/auth'

const MP_AUTH_URL = 'https://auth.mercadopago.com/authorization'

export async function GET() {
  const user = await getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'))
  }

  const clientId  = process.env.MP_CLIENT_ID
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'

  if (!clientId) {
    return NextResponse.json({ error: 'MP_CLIENT_ID not configured' }, { status: 500 })
  }

  const state       = crypto.randomUUID()
  const redirectUri = `${appUrl}/api/integrations/mercadopago/callback`

  const authUrl = new URL(MP_AUTH_URL)
  authUrl.searchParams.set('client_id',     clientId)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('platform_id',   'mp')
  authUrl.searchParams.set('redirect_uri',  redirectUri)
  authUrl.searchParams.set('state',         state)

  const response = NextResponse.redirect(authUrl.toString())

  // State cookie — validated in the callback to prevent CSRF
  response.cookies.set('mp_oauth_state', state, {
    httpOnly: true,
    path:     '/api/integrations/mercadopago/callback',
    maxAge:   600, // 10 minutes
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
  })

  return response
}
