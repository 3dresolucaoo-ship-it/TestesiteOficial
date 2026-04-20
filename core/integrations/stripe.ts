/**
 * Stripe integration — server-side only.
 *
 * NEVER import this module from a client component.
 * All keys are read from environment variables (never exposed to the browser).
 *
 * Required environment variables:
 *   STRIPE_SECRET_KEY       — your Stripe secret key (sk_live_… or sk_test_…)
 *   STRIPE_WEBHOOK_SECRET   — from `stripe listen` or dashboard webhook endpoint
 *   NEXT_PUBLIC_APP_URL     — full origin, e.g. https://yourdomain.com
 */

import Stripe from 'stripe'

// ─── Singleton client ─────────────────────────────────────────────────────────

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error(
      '[Stripe] STRIPE_SECRET_KEY is not set. Add it to .env.local.',
    )
  }
  return new Stripe(key, { apiVersion: '2026-03-25.dahlia' })
}

// ─── Checkout session ─────────────────────────────────────────────────────────

export interface CheckoutSessionInput {
  /** Internal product id (bvaz-hub products table). */
  productId:    string
  productName:  string
  /** Price in BRL cents (e.g. 5000 = R$50.00). */
  amountCents:  number
  /** Quantity to purchase. Defaults to 1. */
  quantity?:    number
  /** Client name — stored as metadata, shown in webhook. */
  clientName?:  string
  /** Where to redirect on success (absolute URL). */
  successUrl?:  string
  /** Where to redirect on cancel (absolute URL). */
  cancelUrl?:   string
}

export interface CheckoutSessionResult {
  sessionId:  string
  sessionUrl: string
}

/**
 * Creates a Stripe Checkout session for a single product.
 * Returns the session ID and the hosted checkout URL to redirect the user to.
 */
export async function createCheckoutSession(
  input: CheckoutSessionInput,
): Promise<CheckoutSessionResult> {
  const stripe     = getStripe()
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const quantity   = input.quantity ?? 1

  const session = await stripe.checkout.sessions.create({
    mode:    'payment',
    currency: 'brl',
    line_items: [
      {
        price_data: {
          currency:     'brl',
          unit_amount:  input.amountCents,
          product_data: {
            name: input.productName,
            metadata: { bvaz_product_id: input.productId },
          },
        },
        quantity,
      },
    ],
    metadata: {
      bvaz_product_id: input.productId,
      bvaz_quantity:   String(quantity),
      bvaz_client:     input.clientName ?? '',
    },
    payment_intent_data: {
      metadata: {
        bvaz_product_id: input.productId,
      },
    },
    success_url: input.successUrl ?? `${appUrl}/orders?checkout=success`,
    cancel_url:  input.cancelUrl  ?? `${appUrl}/products?checkout=cancelled`,
  })

  if (!session.url) {
    throw new Error('[Stripe] Checkout session created but URL is missing.')
  }

  return { sessionId: session.id, sessionUrl: session.url }
}

// ─── Webhook signature verification ──────────────────────────────────────────

/**
 * Verifies the Stripe-Signature header and constructs the event.
 * Throws if the signature is invalid — caller should respond with 400.
 */
export function constructWebhookEvent(
  rawBody:   Buffer | string,
  signature: string,
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    throw new Error(
      '[Stripe] STRIPE_WEBHOOK_SECRET is not set. Add it to .env.local.',
    )
  }
  return getStripe().webhooks.constructEvent(rawBody, signature, secret)
}
