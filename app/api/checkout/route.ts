/**
 * POST /api/checkout
 *
 * Creates a hosted payment session for a catalog product and returns the
 * redirect URL. The client should send the user to that URL to complete payment.
 *
 * Provider is resolved per-merchant via the payment_configs table (DB-driven),
 * falling back to env vars if no active DB config exists.
 *
 * Request body (JSON):
 *   productId    — products.id
 *   catalogSlug  — catalog slug (used to look up merchantId and projectId)
 *   quantity     — number of units (default 1)
 *   customerName — buyer's full name
 *   whatsapp     — buyer's WhatsApp number (digits only)
 *
 * Response (JSON):
 *   { url: string }   — redirect the browser to this URL to complete payment
 *
 * Errors:
 *   400 — missing fields / catalog or product not found / no price
 *   500 — payment provider error
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin }          from '@/lib/supabaseAdmin'
import { getPaymentProvider }        from '@/services/payments'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      productId?:    string
      catalogSlug?:  string
      quantity?:     number
      customerName?: string
      whatsapp?:     string
    }

    const {
      productId,
      catalogSlug,
      customerName,
      whatsapp,
    } = body

    // ── quantity: safe default, clamped 1–999 ────────────────────────────────
    const quantity = Math.max(1, Math.min(Number(body.quantity) || 1, 999))

    // ── Validate required fields ─────────────────────────────────────────────
    if (!productId || !catalogSlug || !customerName || !whatsapp) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, catalogSlug, customerName, whatsapp' },
        { status: 400 },
      )
    }

    const admin  = getSupabaseAdmin()

    // NEXT_PUBLIC_APP_URL must be a public HTTPS URL in production.
    // notificationUrl with localhost will not be reachable by MP/Stripe — warn early.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    if (!appUrl || appUrl.includes('localhost') || appUrl.includes('127.0.0.1')) {
      console.warn(
        '[/api/checkout] NEXT_PUBLIC_APP_URL is not set or resolves to localhost. ' +
        'Payment gateway webhooks will not reach this server. Set NEXT_PUBLIC_APP_URL to your public domain.',
      )
    }

    // ── Look up catalog → merchantId + projectId ──────────────────────────────
    // Uses admin client so no auth cookie is required (public checkout page).
    const { data: catalog } = await admin
      .from('catalogs')
      .select('id, user_id, project_id')
      .eq('slug', catalogSlug)
      .eq('is_public', true)
      .maybeSingle()

    if (!catalog) {
      return NextResponse.json(
        { error: `Catalog not found or not public: ${catalogSlug}` },
        { status: 400 },
      )
    }

    const merchantId = catalog.user_id  as string
    const projectId  = catalog.project_id as string

    // ── Look up product → name + price ────────────────────────────────────────
    const { data: product } = await admin
      .from('products')
      .select('id, name, sale_price')
      .eq('id', productId)
      .maybeSingle()

    if (!product) {
      return NextResponse.json(
        { error: `Product not found: ${productId}` },
        { status: 400 },
      )
    }

    const salePrice = Number(product.sale_price ?? 0)
    if (salePrice <= 0) {
      return NextResponse.json(
        { error: 'Product has no sale price configured' },
        { status: 400 },
      )
    }

    // ── Resolve payment provider for this merchant ────────────────────────────
    const provider = await getPaymentProvider(merchantId)

    // notificationUrl: only set when appUrl is a public domain — prevents MP from
    // storing a localhost URL that it can never reach.
    const isPublicUrl = appUrl && !appUrl.includes('localhost') && !appUrl.includes('127.0.0.1')
    const notificationUrl = isPublicUrl
      ? `${appUrl}/api/webhooks/payment?merchant=${merchantId}`
      : undefined

    // price always comes from the DB (salePrice) — never from client request body.
    const amountCents = Math.round(salePrice * 100)

    const { paymentUrl } = await provider.createPayment({
      productId,
      productName:     product.name,
      amountCents,                        // DB price — point 3
      quantity,                           // clamped 1–999 — point 4
      customerName,
      whatsapp,
      catalogSlug,
      merchantId,
      projectId,
      successUrl:      `${appUrl}/checkout/success?catalog=${catalogSlug}`,
      cancelUrl:       `${appUrl}/catalogo/${catalogSlug}`,
      notificationUrl,                    // undefined when localhost — point 1
    })

    return NextResponse.json({ url: paymentUrl })

  } catch (err) {
    console.error('[/api/checkout]', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    )
  }
}
