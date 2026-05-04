/**
 * Mercado Pago provider — server-side only.
 *
 * Implements PaymentProviderClient using the MP Preferences API.
 * All credentials are received via ProviderCredentials — no process.env access.
 *
 * Webhook verification: HMAC-SHA256 over "id:<dataId>;request-id:<reqId>;ts:<ts>;"
 * Payment fetch: GET /v1/payments/:id to read status + metadata.
 */

import crypto from 'crypto'
import type {
  ProviderCredentials,
  PaymentProviderClient,
  CreatePaymentInput,
  PaymentResult,
  WebhookPayload,
} from '@/services/payments'

const MP_BASE_URL = 'https://api.mercadopago.com'

// ─── Factory ──────────────────────────────────────────────────────────────────

export function mercadoPagoProvider(creds: ProviderCredentials): PaymentProviderClient {
  const { accessToken, webhookSecret, sandbox, marketplaceFee } = creds

  // ── createPayment ──────────────────────────────────────────────────────────

  async function createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const body = {
      items: [
        {
          id:         input.productId,
          title:      input.productName,
          quantity:   input.quantity,
          unit_price: input.amountCents / 100,   // MP usa reais, não centavos
          currency_id: 'BRL',
        },
      ],
      payer: {
        name:  input.customerName,
        phone: { area_code: '', number: input.whatsapp },
      },
      // All bvaz metadata travels through MP and comes back in the webhook
      metadata: {
        bvaz_product_id:    input.productId,
        bvaz_quantity:      input.quantity,
        bvaz_customer_name: input.customerName,
        bvaz_whatsapp:      input.whatsapp,
        bvaz_catalog_slug:  input.catalogSlug,
        bvaz_merchant_id:   input.merchantId,
        bvaz_project_id:    input.projectId,
      },
      back_urls: {
        success: input.successUrl,
        failure: input.cancelUrl,
        pending: input.cancelUrl,
      },
      auto_return: 'approved',
      notification_url: input.notificationUrl ?? undefined,
      ...(marketplaceFee ? { marketplace_fee: marketplaceFee / 100 } : {}),
    }

    const res = await fetch(`${MP_BASE_URL}/checkout/preferences`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`[MP] createPayment failed (${res.status}): ${text}`)
    }

    const data = await res.json()

    if (!data.id) {
      throw new Error('[MP] createPayment: response missing preference id')
    }

    const paymentUrl = sandbox
      ? (data.sandbox_init_point ?? data.init_point)
      : data.init_point

    if (!paymentUrl) {
      throw new Error('[MP] createPayment: response missing init_point URL')
    }

    return { paymentUrl, paymentId: String(data.id) }
  }

  // ── parseWebhook ───────────────────────────────────────────────────────────

  async function parseWebhook(
    rawBody: Buffer,
    headers: Headers,
  ): Promise<WebhookPayload | null> {
    // ── Parse body first (needed for signature and event type) ───────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let notification: any
    try {
      notification = JSON.parse(rawBody.toString())
    } catch {
      console.warn('[MP] parseWebhook: invalid JSON body')
      return null
    }

    // Only process payment events
    if (notification?.type !== 'payment' || !notification?.data?.id) {
      return null
    }

    const dataId    = String(notification.data.id)
    const xSig     = headers.get('x-signature')     ?? ''
    const xReqId   = headers.get('x-request-id')   ?? ''

    // ── Verify HMAC signature (if webhookSecret is configured) ───────────────
    if (webhookSecret) {
      // Header format: "ts=<epoch_ms>,v1=<hex_hmac>"
      const parts = Object.fromEntries(
        xSig.split(',').map(p => {
          const idx = p.indexOf('=')
          return [p.slice(0, idx), p.slice(idx + 1)]
        }),
      )
      const ts = parts['ts']
      const v1 = parts['v1']

      if (!ts || !v1) {
        console.warn('[MP] parseWebhook: malformed x-signature header:', xSig)
        return null
      }

      const manifest = `id:${dataId};request-id:${xReqId};ts:${ts};`
      const expected = crypto
        .createHmac('sha256', webhookSecret)
        .update(manifest)
        .digest('hex')

      if (expected !== v1) {
        console.warn('[MP] parseWebhook: signature mismatch — possible tampered request')
        return null
      }
    }

    // ── Fetch full payment from MP API ────────────────────────────────────────
    const res = await fetch(`${MP_BASE_URL}/v1/payments/${dataId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      console.error(`[MP] parseWebhook: failed to fetch payment ${dataId} (${res.status})`)
      return null
    }

    const payment = await res.json()
    const meta    = payment.metadata ?? {}

    // Map MP status → internal status
    const status: WebhookPayload['status'] =
      payment.status === 'approved' ? 'approved' :
      payment.status === 'rejected' ? 'failed'   :
      'pending'

    return {
      status,
      paymentId: String(payment.id),
      metadata: {
        productId:    String(meta.bvaz_product_id    ?? ''),
        quantity:     Number(meta.bvaz_quantity       ?? 1),
        customerName: String(meta.bvaz_customer_name ?? payment.payer?.first_name ?? ''),
        whatsapp:     String(meta.bvaz_whatsapp      ?? ''),
        catalogSlug:  String(meta.bvaz_catalog_slug  ?? ''),
        merchantId:   String(meta.bvaz_merchant_id   ?? ''),
        projectId:    String(meta.bvaz_project_id    ?? ''),
      },
    }
  }

  return { createPayment, parseWebhook }
}
