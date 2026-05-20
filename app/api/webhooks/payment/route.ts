/**
 * POST /api/webhooks/payment?merchant=<merchantId>
 *
 * Generic payment webhook — delegates signature verification and payload parsing
 * to the active PaymentProvider for the given merchant (resolved from DB config).
 *
 * Special route: ?merchant=calc-pro
 *   Roteado para o handler de Calculadora Pro Subscription (Paulo 2026-05-20,
 *   ADR-023). Eventos suportados: customer.subscription.{created,updated,
 *   deleted}, invoice.{paid,payment_failed}. NAO usa paymentConfig — usa
 *   platform-account STRIPE_SECRET_KEY + STRIPE_CALC_PRO_WEBHOOK_SECRET.
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
import Stripe                        from 'stripe'
import { getPaymentProvider }        from '@/services/payments'
import { getSupabaseAdmin }          from '@/lib/supabaseAdmin'
import { upsertSubscription }        from '@/services/calcProSubscription'
import type { CalcProSubscriptionStatus } from '@/services/calcProSubscription'

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
  //
  // Excecao: merchant=calc-pro vai pro handler de Calculadora Pro subscription
  // (Paulo 2026-05-20, ADR-023). Esse handler nao usa paymentConfig por
  // merchant — Calc Pro eh produto da platform account Hayzer.
  const merchantId = req.nextUrl.searchParams.get('merchant')

  if (!merchantId) {
    console.warn('[webhook/payment] Missing ?merchant= query param')
    return NextResponse.json({ received: true })
  }

  if (merchantId === 'calc-pro') {
    return handleCalcProSubscriptionWebhook(req)
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

// ─── Calc Pro Subscription Handler (Paulo 2026-05-20, ADR-023) ───────────────
//
// Eventos suportados:
//   customer.subscription.created  — assinatura iniciada (trial ou paid imediato)
//   customer.subscription.updated  — mudanca de status (trial→active, cancel_at_period_end, past_due)
//   customer.subscription.deleted  — assinatura terminou (cancelada ou expirada)
//   invoice.paid                   — pagamento recorrente OK (re-confirma active)
//   invoice.payment_failed         — pagamento falhou (status vira past_due, dunning Stripe rodando)
//
// Idempotencia: usa a mesma tabela webhook_events do handler principal. Lock
// atomico via UNIQUE (provider, event_id). Retry duplicado retorna 200 silent.
//
// Atomicidade: nao usa RPC dedicada porque o conjunto de writes eh menor (1 row
// em calc_pro_subscriptions). Usamos 2 inserts/updates separados — risco de
// crash entre eles eh mitigado por UNIQUE em stripe_subscription_id +
// idempotencia do proximo retry. Risco aceito + documentado em ADR-023.

const SUPPORTED_CALC_PRO_EVENTS = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
])

const STRIPE_API_VERSION: Stripe.StripeConfig['apiVersion'] = '2026-03-25.dahlia'

interface CalcProEventData {
  event:            Stripe.Event
  subscriptionId:   string
  customerId:       string
  status:           Stripe.Subscription.Status
  currentPeriodStart: number | null
  currentPeriodEnd:   number | null
  trialEnd:         number | null
  cancelAtPeriodEnd: boolean
  canceledAt:       number | null
  priceId:          string | null
  email:            string | null
  userId:           string | null
}

/**
 * Extrai dados padronizados de qualquer um dos 5 eventos suportados.
 * Retorna null se o evento nao tiver informacao de subscription utilizavel.
 *
 * IMPORTANTE: invoice.paid e invoice.payment_failed vem com subscription como
 * campo direto da invoice (string id ou objeto). Customer.subscription.* vem
 * como object direto.
 */
async function extractCalcProEventData(
  event: Stripe.Event,
  stripe: Stripe,
): Promise<CalcProEventData | null> {
  let subscription: Stripe.Subscription | null = null

  if (event.type.startsWith('customer.subscription.')) {
    subscription = event.data.object as Stripe.Subscription
  } else if (event.type === 'invoice.paid' || event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    // Stripe Basil moveu invoice.subscription pra invoice.parent.subscription_details.subscription.
    // Cobrimos os 2 layouts (cast defensivo pra layouts mais antigos).
    const subRef =
      invoice.parent?.subscription_details?.subscription
      ?? (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null })
        .subscription
      ?? null
    if (!subRef) {
      console.info(`[webhook/payment/calc-pro] invoice sem subscription_id — ignorando (event=${event.id})`)
      return null
    }
    if (typeof subRef === 'string') {
      // Retrieve subscription pra ter periodos atualizados
      subscription = await stripe.subscriptions.retrieve(subRef)
    } else {
      subscription = subRef
    }
  }

  if (!subscription) {
    return null
  }

  // Email e user_id vem da metadata da subscription (setada no Checkout Session
  // ou no Payment Link). Fallback pra customer.email se metadata ausente
  // (caso Payment Link sem metadata configurada).
  const metadata = subscription.metadata ?? {}
  const userId = metadata.hayzer_user_id ?? null

  let email: string | null = null
  const customerRef = subscription.customer
  if (typeof customerRef === 'string') {
    const customer = await stripe.customers.retrieve(customerRef)
    if (!('deleted' in customer) || !customer.deleted) {
      email = (customer as Stripe.Customer).email ?? null
    }
  } else if (customerRef && !('deleted' in customerRef && customerRef.deleted)) {
    email = (customerRef as Stripe.Customer).email ?? null
  }

  // ATENCAO: Stripe Basil (2025-03-31+) removeu current_period_start/end do
  // Subscription e moveu pra subscription.items.data[0]. Aplicavel a nossa
  // API version 2026-03-25.dahlia. Cast defensivo cobre os 2 casos —
  // Subscription "legado" ou Subscription Basil.
  // Fonte: https://docs.stripe.com/changelog/basil/2025-03-31/deprecate-subscription-current-period-start-and-end
  const firstItem = subscription.items?.data?.[0] as
    | (Stripe.SubscriptionItem & {
        current_period_start?: number | null
        current_period_end?:   number | null
      })
    | undefined

  const priceId = firstItem?.price?.id ?? null

  const subLegacy = subscription as Stripe.Subscription & {
    current_period_start?: number | null
    current_period_end?:   number | null
  }

  const currentPeriodStart =
    firstItem?.current_period_start ?? subLegacy.current_period_start ?? null
  const currentPeriodEnd =
    firstItem?.current_period_end   ?? subLegacy.current_period_end   ?? null

  return {
    event,
    subscriptionId:     subscription.id,
    customerId:         typeof customerRef === 'string'
      ? customerRef
      : (customerRef as Stripe.Customer | null)?.id ?? '',
    status:             subscription.status,
    currentPeriodStart,
    currentPeriodEnd,
    trialEnd:           subscription.trial_end ?? null,
    cancelAtPeriodEnd:  Boolean(subscription.cancel_at_period_end),
    canceledAt:         subscription.canceled_at ?? null,
    priceId,
    email,
    userId,
  }
}

/**
 * Resolve user_id Hayzer a partir do email Stripe.
 * Caso metadata.hayzer_user_id esteja presente, usamos direto. Senao busca em
 * auth.users por email via service_role.
 *
 * Retorna null se nao conseguir resolver — webhook handler loga warning e
 * registra evento mesmo assim (admin reprocessa manualmente).
 *
 * TODO Paulo: trocar listUsers O(n) por RPC SECURITY DEFINER `find_user_by_email`
 * quando volume superar ~200 users (pra evitar paginar). Por enquanto perPage=200
 * cobre todos os users beta do Hayzer pre-launch (ver memory hayzer-sem-usuarios).
 */
async function resolveUserId(
  email: string | null,
  metadataUserId: string | null,
): Promise<string | null> {
  if (metadataUserId && isValidUUID(metadataUserId)) {
    return metadataUserId
  }
  if (!email) return null

  const admin = getSupabaseAdmin()
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 })
  if (error) {
    console.error(`[webhook/payment/calc-pro] auth.admin.listUsers error: ${error.message}`)
    return null
  }
  const normalizedEmail = email.toLowerCase()
  const match = data.users.find(u => u.email?.toLowerCase() === normalizedEmail)
  return match?.id ?? null
}

function unixToIso(seconds: number | null): string | null {
  if (seconds === null || seconds === undefined) return null
  return new Date(seconds * 1000).toISOString()
}

/**
 * Handler principal dedicado a Calc Pro subscription.
 * Sempre retorna 200 quando processamento OK ou duplicate. Retorna 4xx/5xx
 * apenas em casos onde queremos que Stripe retry (config invalida, DB down,
 * signature invalida).
 */
async function handleCalcProSubscriptionWebhook(req: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.STRIPE_CALC_PRO_WEBHOOK_SECRET
  const stripeSecret  = process.env.STRIPE_SECRET_KEY

  if (!webhookSecret) {
    console.error('[webhook/payment/calc-pro] STRIPE_CALC_PRO_WEBHOOK_SECRET ausente')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }
  if (!stripeSecret) {
    console.error('[webhook/payment/calc-pro] STRIPE_SECRET_KEY ausente')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  // 1. Signature ANTES de qualquer coisa
  const sig = req.headers.get('stripe-signature')
  if (!sig) {
    console.warn('[webhook/payment/calc-pro] stripe-signature ausente')
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }

  const rawBody = Buffer.from(await req.arrayBuffer())
  const stripe  = new Stripe(stripeSecret, { apiVersion: STRIPE_API_VERSION })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`[webhook/payment/calc-pro] Invalid signature: ${msg}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 2. Filtrar eventos suportados
  if (!SUPPORTED_CALC_PRO_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true })   // silent ack
  }

  // 3. Lock atomico via webhook_events (mesma tabela do handler de catalogo)
  const admin = getSupabaseAdmin()
  const { error: lockError } = await admin
    .from('webhook_events')
    .insert({
      provider:   'stripe',
      event_id:   event.id,
      event_type: event.type,
      payload:    { source: 'calc_pro_subscription', event_type: event.type },
    })

  if (lockError) {
    // 23505 = unique_violation em (provider, event_id) — duplicate ack silent
    if (lockError.code === '23505') {
      console.info(
        `[webhook/payment/calc-pro] Duplicate event ${event.id} (${event.type}) — ack silent`,
      )
      return NextResponse.json({ received: true })
    }
    console.error(`[webhook/payment/calc-pro] webhook_events insert failed: ${lockError.message}`)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  // 4. Extrair dados da subscription a partir do evento
  let extracted: CalcProEventData | null
  try {
    extracted = await extractCalcProEventData(event, stripe)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[webhook/payment/calc-pro] extract failed (event=${event.id}): ${msg}`)
    // Evento ja registrado em webhook_events. Retry vai cair em duplicate.
    // Retornamos 500 pra Stripe re-tentar — talvez seja erro transient.
    return NextResponse.json({ error: 'Extract failed' }, { status: 500 })
  }

  if (!extracted) {
    console.info(`[webhook/payment/calc-pro] Sem subscription data no evento (event=${event.id}) — ack`)
    await markEventProcessed(event.id)
    return NextResponse.json({ received: true })
  }

  // 5. Resolver user_id Hayzer
  const userId = await resolveUserId(extracted.email, extracted.userId)
  if (!userId) {
    console.warn(
      `[webhook/payment/calc-pro] Nao consegui resolver user_id | email=${extracted.email} | subscriptionId=${extracted.subscriptionId}`,
    )
    // Evento ja gravado — admin reprocessa manualmente. Retorna 200 (nao queremos
    // retry infinito de evento que nunca vai resolver).
    await markEventProcessed(event.id)
    return NextResponse.json({ received: true })
  }

  // 6. Validar email — sem email nao da pra atrelar
  if (!extracted.email) {
    console.warn(
      `[webhook/payment/calc-pro] Email ausente | subscriptionId=${extracted.subscriptionId}`,
    )
    await markEventProcessed(event.id)
    return NextResponse.json({ received: true })
  }

  // 7. Upsert na tabela calc_pro_subscriptions
  try {
    await upsertSubscription({
      userId,
      email:                extracted.email,
      stripeCustomerId:     extracted.customerId,
      stripeSubscriptionId: extracted.subscriptionId,
      stripePriceId:        extracted.priceId,
      status:               extracted.status as CalcProSubscriptionStatus,
      currentPeriodStart:   unixToIso(extracted.currentPeriodStart),
      currentPeriodEnd:     unixToIso(extracted.currentPeriodEnd),
      trialEnd:             unixToIso(extracted.trialEnd),
      cancelAtPeriodEnd:    extracted.cancelAtPeriodEnd,
      canceledAt:           unixToIso(extracted.canceledAt),
      lastEventId:          event.id,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(
      `[webhook/payment/calc-pro] upsertSubscription failed (event=${event.id}, sub=${extracted.subscriptionId}): ${msg}`,
    )
    // Evento ja gravado em webhook_events. Retornamos 500 pra Stripe re-tentar
    // — pode ser DB transient. Retry vai cair em duplicate em webhook_events
    // se ja processado, ou refazer o upsert se foi falha real.
    return NextResponse.json({ error: 'Upsert failed' }, { status: 500 })
  }

  // 8. Marca evento como processado
  await markEventProcessed(event.id)

  console.info(
    `[webhook/payment/calc-pro] OK | event=${event.type} | sub=${extracted.subscriptionId} | status=${extracted.status} | user=${userId}`,
  )
  return NextResponse.json({ received: true })
}

async function markEventProcessed(eventId: string): Promise<void> {
  const admin = getSupabaseAdmin()
  await admin
    .from('webhook_events')
    .update({ processed_at: new Date().toISOString() })
    .eq('provider', 'stripe')
    .eq('event_id', eventId)
}
