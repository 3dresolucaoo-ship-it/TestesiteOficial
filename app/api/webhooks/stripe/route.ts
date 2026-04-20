/**
 * POST /api/webhooks/stripe
 *
 * Receives Stripe events and triggers the order-processing flow for completed
 * payments.  This is the entry point for headless / automated orders —
 * the same processNewOrder function used by the UI, ensuring zero logic duplication.
 *
 * Stripe dashboard setup:
 *   1. Go to Developers → Webhooks → Add endpoint
 *   2. URL: https://yourdomain.com/api/webhooks/stripe
 *   3. Select event: checkout.session.completed
 *   4. Copy the signing secret into STRIPE_WEBHOOK_SECRET (.env.local)
 *
 * Note: Next.js automatically disables body parsing for this route so we can
 *       read the raw body required for Stripe signature verification.
 */

import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { constructWebhookEvent }  from '@/core/integrations/stripe'
import { processNewOrder }        from '@/core/flows/processOrder'
import { productsService }        from '@/services/products'
import type { Order, OrderOrigin } from '@/lib/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Read raw body — required for Stripe signature verification
  const rawBody  = Buffer.from(await req.arrayBuffer())
  const signature = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = constructWebhookEvent(rawBody, signature)
  } catch (err) {
    console.error('[Stripe webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ── Handle checkout.session.completed ────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Extract metadata set in createCheckoutSession
    const productId  = session.metadata?.bvaz_product_id
    const quantity   = parseInt(session.metadata?.bvaz_quantity ?? '1', 10)
    const clientName = session.metadata?.bvaz_client || 'Cliente Stripe'

    if (!productId) {
      console.warn('[Stripe webhook] Missing bvaz_product_id in session metadata', session.id)
      return NextResponse.json({ received: true })
    }

    const product = await productsService.getById(productId)
    if (!product) {
      console.error('[Stripe webhook] Product not found:', productId)
      return NextResponse.json({ received: true })
    }

    // Amount is in cents — convert to R$
    const totalCents  = session.amount_total ?? 0
    const totalBRL    = totalCents / 100

    const order: Order = {
      id:          uid(),
      projectId:   product.projectId,
      clientName,
      origin:      'other' as OrderOrigin,
      item:        quantity > 1 ? `${product.name} × ${quantity}` : product.name,
      value:       totalBRL,
      status:      'paid',
      date:        todayISO(),
      productId:   product.id,
      // Production cost is calculated live inside processNewOrder via calcUnitCost
    }

    try {
      await processNewOrder(order)
      console.info('[Stripe webhook] Order created:', order.id, 'for', clientName, totalBRL)
    } catch (err) {
      console.error('[Stripe webhook] processNewOrder failed:', err)
      // Return 500 so Stripe retries the event
      return NextResponse.json(
        { error: 'Failed to process order' },
        { status: 500 },
      )
    }
  }

  return NextResponse.json({ received: true })
}
