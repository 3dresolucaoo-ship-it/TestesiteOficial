/**
 * /api/payment-configs
 *
 * Authenticated API for managing the current user's payment gateway configs.
 * Credentials are stored masked in DB; full values never leave the server
 * except when creating the gateway preference (server-side only).
 *
 *   GET    → list configs for current user (masked)
 *   POST   → upsert (create or update by id)
 *   PATCH  → { id } activate (atomically deactivates the others)
 *   DELETE → ?id=<configId>
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUser }                   from '@/lib/auth'
import {
  paymentConfigService,
  type PaymentProviderName,
  type UpsertPaymentConfigInput,
} from '@/services/paymentConfig'

const VALID_PROVIDERS: PaymentProviderName[] = ['mercadopago', 'stripe', 'infinitypay']

// ─── GET — list user's configs (masked) ─────────────────────────────────────

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const configs = await paymentConfigService.listForDisplay(user.id)
  return NextResponse.json({ configs })
}

// ─── POST — upsert config ──────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Partial<UpsertPaymentConfigInput> & { id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.provider || !VALID_PROVIDERS.includes(body.provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
  }

  if (!body.accessToken || typeof body.accessToken !== 'string' || body.accessToken.trim().length < 8) {
    return NextResponse.json({ error: 'accessToken is required (min 8 chars)' }, { status: 400 })
  }

  // Reject mask placeholders coming back from the client unchanged
  if (body.accessToken.startsWith('****')) {
    return NextResponse.json({ error: 'accessToken still masked — paste the real value' }, { status: 400 })
  }

  try {
    await paymentConfigService.upsertConfig(user.id, {
      id:            body.id,
      provider:      body.provider,
      accessToken:   body.accessToken.trim(),
      publicKey:     body.publicKey?.trim()     || undefined,
      webhookSecret: body.webhookSecret?.trim() || undefined,
      sandbox:       Boolean(body.sandbox),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Save failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// ─── PATCH — activate one config ───────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  try {
    await paymentConfigService.setActiveProvider(user.id, body.id)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Activate failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// ─── DELETE — remove config ────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id query param required' }, { status: 400 })

  try {
    await paymentConfigService.deleteConfig(user.id, id)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Delete failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
