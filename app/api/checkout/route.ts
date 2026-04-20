/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout session for a product and returns the hosted URL.
 * The client should redirect the user to that URL to complete payment.
 *
 * Request body (JSON):
 *   productId  — bvaz-hub products.id
 *   quantity   — number of units (default 1)
 *   clientName — buyer name (stored as metadata, used in webhook)
 *
 * Response (JSON):
 *   { url: string }   — redirect the browser here
 *
 * Errors:
 *   400 — missing required fields or product not found
 *   500 — Stripe API error
 */

import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession }     from '@/core/integrations/stripe'
import { productsService }           from '@/services/products'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      productId?:  string
      quantity?:   number
      clientName?: string
    }

    const { productId, quantity = 1, clientName } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 },
      )
    }

    const product = await productsService.getById(productId)
    if (!product) {
      return NextResponse.json(
        { error: `Product not found: ${productId}` },
        { status: 400 },
      )
    }

    if (product.salePrice <= 0) {
      return NextResponse.json(
        { error: 'Product has no sale price configured.' },
        { status: 400 },
      )
    }

    // Convert R$ to cents (Stripe uses smallest currency unit)
    const amountCents = Math.round(product.salePrice * 100)

    const { sessionUrl } = await createCheckoutSession({
      productId,
      productName: product.name,
      amountCents,
      quantity,
      clientName,
    })

    return NextResponse.json({ url: sessionUrl })
  } catch (err) {
    console.error('[/api/checkout]', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session.' },
      { status: 500 },
    )
  }
}
