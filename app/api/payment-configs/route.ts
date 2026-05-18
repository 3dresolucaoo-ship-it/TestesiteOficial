/**
 * /api/payment-configs
 *
 * Authenticated API for managing the current user's payment gateway configs.
 * Uses the session-based Supabase client (RLS) — no service role key needed.
 *
 *   GET    → list configs for current user (masked)
 *   POST   → upsert (create or update by id)
 *   PATCH  → { id } activate (atomically deactivates the others)
 *   DELETE → ?id=<configId>
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUser }                   from '@/lib/auth'
import { createServerClient }        from '@/lib/supabaseServer'
import {
  paymentConfigService,
} from '@/services/paymentConfig'
import { paymentConfigSchema, zodErrorToPtBr } from '@/services/apiSchemas'

// ─── GET — list user's configs (masked) ─────────────────────────────────────

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = await createServerClient()
  const configs = await paymentConfigService.listForDisplay(user.id, client)
  return NextResponse.json({ configs })
}

// ─── POST — upsert config ──────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Otávio (Security) 2026-05-17: substituiu validação manual por discriminated
  // union Zod. Garante provider enum, accessToken trim+min 8 + sem mascarado,
  // e MP exige webhookSecret >= 16 chars (regra do provider).
  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = paymentConfigSchema.safeParse(rawBody)
  if (!parsed.success) {
    const { message, fields } = zodErrorToPtBr(parsed.error)
    return NextResponse.json({ error: message, fields }, { status: 400 })
  }
  const data = parsed.data

  try {
    const client = await createServerClient()
    await paymentConfigService.upsertConfig(user.id, {
      id:            data.id,
      provider:      data.provider,
      accessToken:   data.accessToken,
      publicKey:     data.publicKey     || undefined,
      webhookSecret: data.webhookSecret || undefined,
      sandbox:       Boolean(data.sandbox),
    }, client)
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
    const client = await createServerClient()
    await paymentConfigService.setActiveProvider(user.id, body.id, client)
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
    const client = await createServerClient()
    await paymentConfigService.deleteConfig(user.id, id, client)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Delete failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
