/**
 * POST /api/webhooks/payment?merchant=<merchantId>
 *
 * Generic payment webhook — delegates signature verification and payload parsing
 * to the active PaymentProvider for the given merchant (resolved from DB config).
 *
 * URL pattern:
 *   For Mercado Pago: set `notification_url` in the preference to include
 *     ?merchant=<user_id> so each merchant's webhook is routed here correctly.
 *   For Stripe: register the webhook URL in the Stripe dashboard with the same
 *     ?merchant=<user_id> query param.
 *
 * Security:
 *   - merchantId read from URL ?merchant= param (not from body — prevents spoofing)
 *   - Provider verifies the gateway signature before reading any payload
 *   - metadata.merchantId is verified to match the URL param (cross-merchant check)
 *
 * Side effects on approved payment:
 *   - Order created (source='catalog', status='paid', paymentStatus='paid')
 *   - Production task created (if productId set)
 *   - Finance transaction created
 *   - Inventory NOT decremented (happens when production → done)
 *
 * Always returns 200 { received: true } to prevent gateway retries on logic errors.
 * Only returns non-200 on invalid signature (which the gateway should retry).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPaymentProvider }        from '@/services/payments'
import { processNewOrderAdmin }      from '@/core/flows/processOrderAdmin'
import { getSupabaseAdmin }          from '@/lib/supabaseAdmin'
import type { Order }                from '@/lib/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return `order-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Supabase user IDs are UUIDs — validate format to reject obviously invalid values
// (typos, injection attempts, mis-configured webhook URLs).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isValidUUID(value: string): boolean {
  return UUID_RE.test(value)
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. Validate merchantId from URL ───────────────────────────────────────
  // merchantId identifies which merchant's payment config to load.
  // Must be a valid UUID — rejects mis-configured or tampered webhook URLs.
  const merchantId = req.nextUrl.searchParams.get('merchant')

  if (!merchantId) {
    console.warn('[webhook/payment] Missing ?merchant= query param')
    return NextResponse.json({ received: true })
  }

  if (!isValidUUID(merchantId)) {
    console.warn(`[webhook/payment] Invalid merchantId format (not a UUID): ${merchantId}`)
    return NextResponse.json({ received: true })
  }

  // ── 2. Read raw body (required for signature verification) ─────────────────
  const rawBody = Buffer.from(await req.arrayBuffer())

  // ── 3. Resolve provider and parse webhook ──────────────────────────────────
  // bypassCache: true — always read fresh credentials in webhook context
  let payload
  try {
    const provider = await getPaymentProvider(merchantId, { bypassCache: true })
    payload = await provider.parseWebhook(rawBody, req.headers)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[webhook/payment] Provider error | merchantId=${merchantId} | ${msg}`)
    // Return 500 so the gateway retries (provider may be temporarily unavailable)
    return NextResponse.json({ error: 'Provider error' }, { status: 500 })
  }

  // ── 4. Ignore non-approved or non-payment events ───────────────────────────
  if (!payload) {
    // Event type we don't handle (e.g. pending, refund, test ping) — ack silently
    return NextResponse.json({ received: true })
  }

  if (payload.status !== 'approved') {
    console.info(
      `[webhook/payment] Non-approved status ignored | status=${payload.status} | paymentId=${payload.paymentId} | merchantId=${merchantId}`,
    )
    return NextResponse.json({ received: true })
  }

  // ── 5. Cross-merchant security check ──────────────────────────────────────
  // Ensures a payment from merchant A cannot be processed under merchant B's config.
  if (payload.metadata.merchantId && payload.metadata.merchantId !== merchantId) {
    console.warn(
      `[webhook/payment] merchantId mismatch — possible spoofing attempt. ` +
      `URL merchantId=${merchantId} | metadata merchantId=${payload.metadata.merchantId} | paymentId=${payload.paymentId}`,
    )
    return NextResponse.json({ received: true })
  }

  const { metadata } = payload

  // ── 6. Look up product for name and sale_price ─────────────────────────────
  // Needed to populate order.item and order.value correctly.
  const admin = getSupabaseAdmin()
  const { data: product } = await admin
    .from('products')
    .select('name, sale_price')
    .eq('id', metadata.productId)
    .maybeSingle()

  const productName = product?.name ?? metadata.productId
  // Use stored sale_price × quantity as canonical value (not payment amount)
  // so the order value is always consistent with the product configuration.
  const orderValue = product
    ? Number(product.sale_price) * metadata.quantity
    : 0

  // ── 7. Build Order ─────────────────────────────────────────────────────────
  // All required metadata fields from the WebhookPayload are mapped here.
  const order: Order = {
    id:               uid(),
    projectId:        metadata.projectId,
    clientName:       metadata.customerName,
    origin:           'other',          // catalog sales have no social-media origin
    item:             metadata.quantity > 1
                        ? `${productName} × ${metadata.quantity}`
                        : productName,
    value:            orderValue,
    status:           'paid',           // order is created only after payment approved
    date:             todayISO(),
    // product link
    productId:        metadata.productId  || undefined,
    qtyUsed:          Math.max(1, metadata.quantity || 1),  // safe default — point 4
    // e-commerce fields (points 2 & 3)
    source:           'catalog',
    catalogSlug:      metadata.catalogSlug  || undefined,
    paymentId:        payload.paymentId,
    paymentStatus:    'paid',
    customerWhatsapp: metadata.whatsapp    || undefined,
  }

  // ── 8. Persist order + side effects ───────────────────────────────────────
  // processNewOrderAdmin handles idempotency internally — safe to call even if
  // the gateway retries the same event.
  try {
    await processNewOrderAdmin(order, merchantId)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(
      `[webhook/payment] processNewOrderAdmin failed | paymentId=${payload.paymentId} | merchantId=${merchantId} | ${msg}`,
    )
    // Return 500 so the gateway retries — processNewOrderAdmin is idempotent
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
