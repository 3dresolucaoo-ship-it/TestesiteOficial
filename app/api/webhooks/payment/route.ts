/**
 * POST /api/webhooks/payment
 *
 * Generic payment webhook — handles both Stripe and Mercado Pago notifications.
 * The provider is detected automatically from request headers / body shape.
 *
 * Supported providers:
 *   • Stripe   — "stripe-signature" header present
 *   • Mercado Pago — "x-signature" + "x-request-id" headers present
 *
 * Both providers ultimately call processNewOrder() so all side effects
 * (transaction creation, inventory decrement, production task) are identical.
 *
 * Environment variables:
 *   STRIPE_WEBHOOK_SECRET        — Stripe signing secret
 *   MP_WEBHOOK_SECRET            — Mercado Pago webhook secret (HMAC-SHA256)
 *   MP_ACCESS_TOKEN              — Mercado Pago access token (to look up payment)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHmac }              from 'crypto'
import { constructWebhookEvent }   from '@/core/integrations/stripe'
import { processNewOrder }         from '@/core/flows/processOrder'
import { productsService }         from '@/services/products'
import type { Order, OrderOrigin } from '@/lib/types'
import type Stripe                 from 'stripe'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

// ─── Mercado Pago signature verification ──────────────────────────────────────
// Docs: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks

function verifyMercadoPagoSignature(
  rawBody:    Buffer,
  xSignature: string,
  xRequestId: string,
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return false

  // The signature template: id:{ts}.{requestId}
  const parts     = xSignature.split(',').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split('=')
    if (k && v) acc[k.trim()] = v.trim()
    return acc
  }, {})
  const ts  = parts['ts']
  const v1  = parts['v1']
  if (!ts || !v1) return false

  const message  = `id:${ts};request-id:${xRequestId};`
  const expected = createHmac('sha256', secret).update(message).digest('hex')

  return expected === v1
}

// ─── Mercado Pago — fetch payment data ────────────────────────────────────────

interface MPPayment {
  id:              number
  status:          string
  transaction_amount: number
  payer?:          { email?: string; first_name?: string; last_name?: string }
  metadata?:       Record<string, string>
  date_approved?:  string
}

async function fetchMPPayment(paymentId: string): Promise<MPPayment | null> {
  const token = process.env.MP_ACCESS_TOKEN
  if (!token) return null

  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) {
    console.error('[PaymentWebhook] MP fetch payment failed', res.status, await res.text())
    return null
  }
  return res.json() as Promise<MPPayment>
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody    = Buffer.from(await req.arrayBuffer())
  const stripeHdr  = req.headers.get('stripe-signature')
  const mpSig      = req.headers.get('x-signature')
  const mpReqId    = req.headers.get('x-request-id')

  // ── Stripe ────────────────────────────────────────────────────────────────
  if (stripeHdr) {
    let event: Stripe.Event
    try {
      event = constructWebhookEvent(rawBody, stripeHdr)
    } catch (err) {
      console.error('[PaymentWebhook/Stripe] Signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session    = event.data.object as Stripe.Checkout.Session
      const productId  = session.metadata?.bvaz_product_id
      const quantity   = parseInt(session.metadata?.bvaz_quantity ?? '1', 10)
      const clientName = session.metadata?.bvaz_client || 'Cliente Stripe'

      if (!productId) {
        console.warn('[PaymentWebhook/Stripe] Missing bvaz_product_id', session.id)
        return NextResponse.json({ received: true })
      }

      const product = await productsService.getById(productId)
      if (!product) {
        console.error('[PaymentWebhook/Stripe] Product not found:', productId)
        return NextResponse.json({ received: true })
      }

      const totalBRL = (session.amount_total ?? 0) / 100
      const order: Order = {
        id:         uid(),
        projectId:  product.projectId,
        clientName,
        origin:     'other' as OrderOrigin,
        item:       quantity > 1 ? `${product.name} × ${quantity}` : product.name,
        value:      totalBRL,
        status:     'paid',
        date:       todayISO(),
        productId:  product.id,
      }

      try {
        await processNewOrder(order)
        console.info('[PaymentWebhook/Stripe] Order created:', order.id)
      } catch (err) {
        console.error('[PaymentWebhook/Stripe] processNewOrder failed:', err)
        return NextResponse.json({ error: 'Failed to process order' }, { status: 500 })
      }
    }

    return NextResponse.json({ received: true })
  }

  // ── Mercado Pago ──────────────────────────────────────────────────────────
  if (mpSig && mpReqId) {
    if (process.env.MP_WEBHOOK_SECRET) {
      const valid = verifyMercadoPagoSignature(rawBody, mpSig, mpReqId)
      if (!valid) {
        console.error('[PaymentWebhook/MP] Signature verification failed')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any
    try {
      body = JSON.parse(rawBody.toString())
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // MP sends type=payment, action=payment.created/updated
    if (body.type === 'payment' && body.data?.id) {
      const payment = await fetchMPPayment(String(body.data.id))

      if (!payment || payment.status !== 'approved') {
        console.info('[PaymentWebhook/MP] Payment not approved or not found:', body.data.id)
        return NextResponse.json({ received: true })
      }

      const productId  = payment.metadata?.bvaz_product_id
      const clientName = payment.payer?.first_name
        ? `${payment.payer.first_name} ${payment.payer.last_name ?? ''}`.trim()
        : payment.payer?.email ?? 'Cliente Mercado Pago'

      if (!productId) {
        console.warn('[PaymentWebhook/MP] Missing bvaz_product_id in payment.metadata', payment.id)
        return NextResponse.json({ received: true })
      }

      const product = await productsService.getById(productId)
      if (!product) {
        console.error('[PaymentWebhook/MP] Product not found:', productId)
        return NextResponse.json({ received: true })
      }

      const order: Order = {
        id:         uid(),
        projectId:  product.projectId,
        clientName,
        origin:     'other' as OrderOrigin,
        item:       product.name,
        value:      payment.transaction_amount,
        status:     'paid',
        date:       todayISO(),
        productId:  product.id,
      }

      try {
        await processNewOrder(order)
        console.info('[PaymentWebhook/MP] Order created:', order.id)
      } catch (err) {
        console.error('[PaymentWebhook/MP] processNewOrder failed:', err)
        return NextResponse.json({ error: 'Failed to process order' }, { status: 500 })
      }
    }

    return NextResponse.json({ received: true })
  }

  // Unknown provider
  console.warn('[PaymentWebhook] Unknown provider — no recognized headers')
  return NextResponse.json({ error: 'Unknown payment provider' }, { status: 400 })
}
