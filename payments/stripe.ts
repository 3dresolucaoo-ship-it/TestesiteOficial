/**
 * Stripe provider — server-side only.
 *
 * Implements PaymentProviderClient using the Stripe Checkout Sessions API.
 * All credentials are received via ProviderCredentials — no process.env access.
 *
 * NOTE: This is intentionally separate from core/integrations/stripe.ts which
 * reads credentials from env vars. This implementation receives credentials
 * as parameters, enabling multi-tenant / DB-driven configuration.
 */

import Stripe from 'stripe'
import type {
  ProviderCredentials,
  PaymentProviderClient,
  CreatePaymentInput,
  PaymentResult,
  WebhookPayload,
} from '@/services/payments'

// ─── Factory ──────────────────────────────────────────────────────────────────

export function stripeProvider(creds: ProviderCredentials): PaymentProviderClient {
  // Stripe client is created with the passed accessToken (not process.env)
  const stripe = new Stripe(creds.accessToken, { apiVersion: '2026-03-25.dahlia' })

  // ── createPayment ──────────────────────────────────────────────────────────

  async function createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const session = await stripe.checkout.sessions.create({
      mode:     'payment',
      currency: 'brl',
      line_items: [
        {
          price_data: {
            currency:     'brl',
            unit_amount:  input.amountCents,   // Stripe uses cents
            product_data: { name: input.productName },
          },
          quantity: input.quantity,
        },
      ],
      // All bvaz metadata travels through Stripe and comes back in the webhook
      metadata: {
        bvaz_product_id:    input.productId,
        bvaz_quantity:      String(input.quantity),
        bvaz_customer_name: input.customerName,
        bvaz_whatsapp:      input.whatsapp,
        bvaz_catalog_slug:  input.catalogSlug,
        bvaz_merchant_id:   input.merchantId,
        bvaz_project_id:    input.projectId,
      },
      success_url: input.successUrl,
      cancel_url:  input.cancelUrl,
    })

    if (!session.url) {
      throw new Error('[Stripe] createPayment: checkout session URL is missing')
    }

    return {
      paymentUrl: session.url,
      paymentId:  session.id,
    }
  }

  // ── parseWebhook ───────────────────────────────────────────────────────────

  async function parseWebhook(
    rawBody: Buffer,
    headers: Headers,
  ): Promise<WebhookPayload | null> {
    const sig = headers.get('stripe-signature')
    if (!sig) {
      console.warn('[Stripe] parseWebhook: missing stripe-signature header')
      return null
    }

    if (!creds.webhookSecret) {
      throw new Error(
        '[Stripe] parseWebhook: webhookSecret is required for signature verification. ' +
        'Set it in the payment config or via STRIPE_WEBHOOK_SECRET env var.',
      )
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, creds.webhookSecret)
    } catch (err) {
      console.warn(
        '[Stripe] parseWebhook: invalid signature —',
        err instanceof Error ? err.message : String(err),
      )
      return null
    }

    // Only handle completed checkout sessions
    if (event.type !== 'checkout.session.completed') {
      return null
    }

    const session = event.data.object as Stripe.Checkout.Session
    const meta    = session.metadata ?? {}

    // Map Stripe payment_status → internal status
    const status: WebhookPayload['status'] =
      session.payment_status === 'paid' ? 'approved' : 'pending'

    return {
      status,
      paymentId: session.id,
      metadata: {
        productId:    String(meta.bvaz_product_id    ?? ''),
        quantity:     Number(meta.bvaz_quantity       ?? 1),
        customerName: String(meta.bvaz_customer_name ?? ''),
        whatsapp:     String(meta.bvaz_whatsapp      ?? ''),
        catalogSlug:  String(meta.bvaz_catalog_slug  ?? ''),
        merchantId:   String(meta.bvaz_merchant_id   ?? ''),
        projectId:    String(meta.bvaz_project_id    ?? ''),
      },
    }
  }

  return { createPayment, parseWebhook }
}
