/**
 * Payment Service — abstract provider layer.
 *
 * Defines the PaymentProvider interface and the getPaymentProvider() factory.
 * Concrete implementations live in:
 *   payments/mercadopago.ts
 *   payments/stripe.ts
 *
 * Resolution order in getPaymentProvider():
 *   1. Active config in payment_configs table for this merchant (cached 60 s)
 *   2. Env vars (PAYMENT_PROVIDER, MP_ACCESS_TOKEN, etc.) as fallback
 *
 * NEVER import this file from a client component.
 */

import { paymentConfigService } from '@/services/paymentConfig'

// ─── Shared credential shape ──────────────────────────────────────────────────

/**
 * Credentials passed to a provider factory function.
 * Sourced from DB config or env vars — never exposed to the browser.
 */
export interface ProviderCredentials {
  accessToken:    string
  webhookSecret?: string
  publicKey?:     string
  sandbox:        boolean
  /** Marketplace fee in BRL cents charged by BVaz per transaction (MP only). */
  marketplaceFee?: number
}

// ─── Provider interface ───────────────────────────────────────────────────────

export interface CreatePaymentInput {
  productId:    string
  productName:  string
  /** Price in BRL cents (e.g. R$50.00 → 5000). */
  amountCents:  number
  quantity:     number
  customerName: string
  whatsapp:     string
  catalogSlug:  string
  /** user_id of the catalog owner — stored in metadata for the webhook. */
  merchantId:   string
  projectId:    string
  successUrl:   string
  cancelUrl:    string
  /**
   * URL the provider should POST webhook events to.
   * For MP: set per-preference so each merchant's webhook includes ?merchant=<userId>.
   * For Stripe: ignored — webhook URL is registered once in the Stripe dashboard.
   */
  notificationUrl?: string
}

export interface PaymentResult {
  /** URL to redirect the customer to complete payment. */
  paymentUrl: string
  /** Unique payment ID from the gateway — used for idempotency. */
  paymentId:  string
}

export interface WebhookPayload {
  status:    'approved' | 'pending' | 'failed'
  paymentId: string
  metadata: {
    productId:    string
    quantity:     number
    customerName: string
    whatsapp:     string
    catalogSlug:  string
    /** user_id of the merchant — used to insert the order server-side. */
    merchantId:   string
    projectId:    string
  }
}

/**
 * Interface every payment provider must implement.
 * createPayment   → creates a hosted payment session, returns redirect URL.
 * parseWebhook    → verifies signature and parses the raw webhook body.
 *                   Returns null for events we don't care about (e.g. pending).
 */
export interface PaymentProviderClient {
  createPayment(input: CreatePaymentInput): Promise<PaymentResult>
  parseWebhook(rawBody: Buffer, headers: Headers): Promise<WebhookPayload | null>
}

// ─── Factory ──────────────────────────────────────────────────────────────────

// ─── Dynamic import helpers ───────────────────────────────────────────────────

async function loadMercadoPago(): Promise<(c: ProviderCredentials) => PaymentProviderClient> {
  try {
    const mod = await import('@/payments/mercadopago')
    return mod.mercadoPagoProvider
  } catch (err) {
    throw new Error(
      `[getPaymentProvider] Failed to load Mercado Pago provider module. ` +
      `Ensure payments/mercadopago.ts exists and has no import errors.\n` +
      `Original error: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}

async function loadStripe(): Promise<(c: ProviderCredentials) => PaymentProviderClient> {
  try {
    const mod = await import('@/payments/stripe')
    return mod.stripeProvider
  } catch (err) {
    throw new Error(
      `[getPaymentProvider] Failed to load Stripe provider module. ` +
      `Ensure payments/stripe.ts exists and has no import errors.\n` +
      `Original error: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export interface GetPaymentProviderOptions {
  /**
   * When true, skips the 60 s in-memory cache and queries the DB directly.
   * Always set to true in webhook handlers to avoid processing payments with
   * stale credentials after a config change.
   */
  bypassCache?: boolean
}

/**
 * Returns the active PaymentProviderClient for a given merchant.
 *
 * @param merchantId - user_id of the catalog owner (passed through checkout
 *                     metadata so the webhook can look up the right config).
 * @param options    - { bypassCache: true } for webhook handlers.
 */
export async function getPaymentProvider(
  merchantId: string,
  options?: GetPaymentProviderOptions,
): Promise<PaymentProviderClient> {
  // ── 1. Try DB config ────────────────────────────────────────────────────────
  const config = await paymentConfigService.getActiveConfig(merchantId, {
    bypassCache: options?.bypassCache,
  })

  if (config) {
    const creds: ProviderCredentials = {
      accessToken:   config.accessToken,
      webhookSecret: config.webhookSecret,
      publicKey:     config.publicKey,
      sandbox:       config.sandbox,
    }

    if (config.provider === 'mercadopago') {
      const factory = await loadMercadoPago()
      return factory(creds)
    }

    if (config.provider === 'stripe') {
      const factory = await loadStripe()
      return factory(creds)
    }

    throw new Error(`[getPaymentProvider] Unknown provider in DB config: "${config.provider}"`)
  }

  // ── 2. Fallback: env vars ───────────────────────────────────────────────────
  const providerName = process.env.PAYMENT_PROVIDER ?? 'mercadopago'
  console.warn(
    `[getPaymentProvider] No active DB config for merchant "${merchantId}" — using env fallback (${providerName})`,
  )

  if (providerName === 'mercadopago') {
    const token = process.env.MP_ACCESS_TOKEN
    if (!token) throw new Error('[getPaymentProvider] MP_ACCESS_TOKEN is not set in env')

    const factory = await loadMercadoPago()
    return factory({
      accessToken:   token,
      webhookSecret: process.env.MP_WEBHOOK_SECRET,
      sandbox:       process.env.MP_SANDBOX === 'true',
    })
  }

  if (providerName === 'stripe') {
    const token = process.env.STRIPE_SECRET_KEY
    if (!token) throw new Error('[getPaymentProvider] STRIPE_SECRET_KEY is not set in env')

    const factory = await loadStripe()
    return factory({
      accessToken:   token,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      sandbox:       false,  // Stripe uses test/live keys — no separate sandbox flag
    })
  }

  throw new Error(`[getPaymentProvider] Unknown PAYMENT_PROVIDER env value: "${providerName}"`)
}
