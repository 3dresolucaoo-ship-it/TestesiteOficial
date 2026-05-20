/**
 * POST /api/webhooks/payment?merchant=<merchantId>
 *
 * Generic payment webhook — delegates signature verification and payload parsing
 * to the active PaymentProvider for the given merchant (resolved from DB config).
 *
 * URL pattern (catalog):
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
 * Idempotência (fix 2026-05-18 — bug Paulo/Stripe Press):
 *   - RPC process_webhook_atomic faz INSERT webhook_events + todos os writes de order
 *     em UMA ÚNICA TRANSAÇÃO Postgres.
 *   - UNIQUE (provider, event_id) em webhook_events é o lock atômico de evento:
 *     retries simultâneos do gateway nunca criam duplicate charge.
 *   - Antes, havia SELECT (idempotency check) + INSERTs em roundtrips separados;
 *     race condition entre eles gerava duplicate charge em retry simultâneo.
 *
 * Side effects on approved payment (dentro da RPC, atomicamente):
 *   - webhook_events registrado (idempotency lock)
 *   - Order created (source='catalog', status='paid', paymentStatus='paid')
 *   - Production task created (if productId set and product found)
 *   - Finance transaction created
 *   - Inventory NOT decremented (happens when production → done)
 *
 * Always returns 200 { received: true } to prevent gateway retries on logic errors.
 * Only returns non-200 on invalid signature (which the gateway should retry).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPaymentProvider }        from '@/services/payments'
import { getSupabaseAdmin }          from '@/lib/supabaseAdmin'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return `order-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

// Supabase user IDs are UUIDs — validate format to reject obviously invalid values
// (typos, injection attempts, mis-configured webhook URLs).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isValidUUID(value: string): boolean {
  return UUID_RE.test(value)
}

// ─── Tipos do retorno da RPC ──────────────────────────────────────────────────

interface WebhookAtomicResult {
  status:   'ok' | 'duplicate'
  order_id?: string
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

  // ── 6. Derivar providerName para o event_id composto ─────────────────────
  // O event_id do gateway (paymentId) é único dentro do provider, mas não
  // globalmente — usar (provider, event_id) como chave composta.
  // Detectamos o provider pelo header característico de cada gateway.
  const providerName: 'stripe' | 'mercadopago' =
    req.headers.get('stripe-signature') ? 'stripe' : 'mercadopago'

  // ── 7. Lookup product via admin (sem roundtrip extra no DB do lado TS) ────
  // Fazemos este SELECT aqui em vez de dentro da RPC porque a RPC precisa dos
  // valores de name e sale_price para calcular orderValue ANTES de inserir.
  // A RPC faz seu próprio SELECT de product para a production task (print_time_hours).
  // Este SELECT é o único que permanece fora da transação — é read-only e
  // idempotente: não muda o resultado mesmo que o produto seja editado
  // no instante do webhook (o preço "snapshot" no momento da compra é o correto).
  const admin = getSupabaseAdmin()
  const { data: product } = await admin
    .from('products')
    .select('name, sale_price')
    .eq('id', metadata.productId)
    .maybeSingle()

  const productName = product?.name ?? metadata.productId
  const orderValue  = product
    ? Number(product.sale_price) * metadata.quantity
    : 0

  // ── 8. Montar parâmetros da order ─────────────────────────────────────────
  const orderId = uid()
  const today   = todayISO()

  const orderItem = metadata.quantity > 1
    ? `${productName} × ${metadata.quantity}`
    : productName

  // product_id é UUID no DB — null se vazio ou inválido
  const productIdForRpc: string | null =
    metadata.productId && isValidUUID(metadata.productId)
      ? metadata.productId
      : null

  // ── 9. Chamar RPC atômica ─────────────────────────────────────────────────
  // Toda a escrita (webhook_events + order + production + transaction) ocorre
  // dentro de uma única transação Postgres. Se qualquer etapa falhar, Postgres
  // rollbacka tudo e o gateway receberá 500 para retry.
  let rpcResult: WebhookAtomicResult
  try {
    const { data, error } = await admin.rpc('process_webhook_atomic', {
      p_provider:          providerName,
      p_event_id:          payload.paymentId,
      p_event_type:        'payment.approved',
      p_payload:           { paymentId: payload.paymentId, status: payload.status, metadata },

      p_order_id:          orderId,
      p_project_id:        metadata.projectId,
      p_merchant_id:       merchantId,
      p_client_name:       metadata.customerName,
      p_origin:            'other',        // catalog sales have no social-media origin
      p_item:              orderItem,
      p_value:             orderValue,
      p_status:            'paid',
      p_date:              today,

      p_source:            'catalog',
      p_catalog_slug:      metadata.catalogSlug || null,
      p_payment_id:        payload.paymentId,
      p_payment_status:    'paid',
      p_customer_whatsapp: metadata.whatsapp || null,

      p_product_id:        productIdForRpc,
    })

    if (error) {
      throw new Error(error.message)
    }

    rpcResult = data as WebhookAtomicResult
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(
      `[webhook/payment] process_webhook_atomic failed | paymentId=${payload.paymentId} | merchantId=${merchantId} | ${msg}`,
    )
    // Return 500 so the gateway retries — a RPC é idempotente via webhook_events
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 })
  }

  if (rpcResult.status === 'duplicate') {
    console.info(
      `[webhook/payment] Duplicate event ignored (idempotent) | paymentId=${payload.paymentId} | merchantId=${merchantId}`,
    )
    return NextResponse.json({ received: true })
  }

  console.info(
    `[webhook/payment] Order created OK | orderId=${rpcResult.order_id} | paymentId=${payload.paymentId} | merchantId=${merchantId}`,
  )

  return NextResponse.json({ received: true })
}
