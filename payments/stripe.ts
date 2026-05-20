/**
 * Stripe provider — server-side only.
 *
 * Implements PaymentProviderClient using the Stripe Checkout Sessions API.
 * All credentials are received via ProviderCredentials — no process.env access.
 *
 * NOTE: This is intentionally separate from core/integrations/stripe.ts which
 * reads credentials from env vars. This implementation receives credentials
 * as parameters, enabling multi-tenant / DB-driven configuration.
 *
 * ─── Hayzer Calc Pro (subscription) ────────────────────────────────────────
 * Alem do factory stripeProvider() usado pelo checkout de catalogo de cada
 * merchant, este modulo exporta funcoes "platform-account" para o produto
 * Hayzer Calc Pro:
 *   - getCheckoutUrlSubscription() — cria Checkout Session mode='subscription'
 *   - cancelSubscription()         — cancela imediatamente ou ao fim do ciclo
 *   - createPortalSession()        — gera URL do Customer Portal (LGPD self-service)
 *
 * Essas funcoes usam STRIPE_SECRET_KEY (platform account) direto via env, pois
 * Calc Pro NAO eh um produto de merchant — eh o Hayzer cobrando o usuario final.
 * Padrao confirmado por Paulo (Financial) em ADR-023.
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

// ─── Hayzer Calc Pro — subscription (platform account) ────────────────────────

const STRIPE_API_VERSION: Stripe.StripeConfig['apiVersion'] = '2026-03-25.dahlia'

/**
 * Cliente Stripe da platform account.
 * Lazy init pra nao quebrar build quando env var ausente em dev.
 * STRIPE_SECRET_KEY ja eh usado em outros pontos (services/payments fallback,
 * app/api/integrations/stripe/callback). Aqui apenas reusamos.
 */
function getPlatformStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error(
      '[stripe] STRIPE_SECRET_KEY ausente — necessario para subscription da Calc Pro',
    )
  }
  return new Stripe(key, { apiVersion: STRIPE_API_VERSION })
}

export interface CreateSubscriptionCheckoutInput {
  /** Email obrigatorio — Stripe cria/reusa Customer baseado nele. */
  email:       string
  /** Stripe price_id da subscription (R$ 19/mes). Vem do env STRIPE_CALC_PRO_PRICE_ID. */
  priceId:     string
  /** Numero de dias do trial (default 7 — alinhado com Payment Link no Dashboard). */
  trialDays?:  number
  /** URL pra qual Stripe redireciona apos checkout completo. */
  successUrl:  string
  /** URL pra qual Stripe redireciona se o cliente cancelar no Checkout. */
  cancelUrl:   string
  /** user_id Hayzer — vai em metadata pra webhook handler atrelar a auth.users. */
  userId:      string
  /** Idempotency-Key opcional. Recomendado em retry de rede do nosso lado. */
  idempotencyKey?: string
}

/**
 * Cria Checkout Session em mode='subscription' e retorna URL de redirect.
 *
 * Idempotency-Key (recomendacao Stripe): se o caller fornecer idempotencyKey,
 * passa pra Stripe. Retry do nosso lado nao gera 2 subscriptions.
 *
 * IMPORTANTE: para Payment Link (criado no Dashboard), esta funcao NAO eh
 * necessaria — o link ja eh estatico. Esta funcao serve para fluxos custom
 * onde queremos chamar Checkout Session via API (ex: futuras campanhas com
 * cupom dinamico baseado em UTM).
 */
export async function getCheckoutUrlSubscription(
  input: CreateSubscriptionCheckoutInput,
): Promise<{ url: string; sessionId: string }> {
  const stripe = getPlatformStripeClient()

  const session = await stripe.checkout.sessions.create(
    {
      mode:                  'subscription',
      customer_email:        input.email,
      line_items: [
        {
          price:    input.priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: input.trialDays ?? 7,
        metadata: {
          hayzer_user_id: input.userId,
          hayzer_product: 'calc_pro_subscription',
        },
      },
      success_url: input.successUrl,
      cancel_url:  input.cancelUrl,
      metadata: {
        hayzer_user_id: input.userId,
        hayzer_product: 'calc_pro_subscription',
      },
      // 7 dias e o default. allow_promotion_codes liberado pra cupons via UTM.
      allow_promotion_codes: true,
    },
    input.idempotencyKey
      ? { idempotencyKey: input.idempotencyKey }
      : undefined,
  )

  if (!session.url) {
    throw new Error('[stripe.getCheckoutUrlSubscription] session sem URL — investigar')
  }

  return { url: session.url, sessionId: session.id }
}

export interface CancelSubscriptionInput {
  /** stripe_subscription_id (sub_xxx). */
  subscriptionId: string
  /**
   * Quando cancelar:
   *   'period_end' — mantem ate fim do ciclo (padrao Customer Portal, recomendado LGPD)
   *   'immediately' — cancela na hora (refund manual)
   */
  when?: 'period_end' | 'immediately'
}

/**
 * Cancela uma subscription.
 *
 * Por padrao usa 'period_end' (cancel_at_period_end=true) — cliente paga ate
 * o fim do mes ja cobrado, depois nao renova. E o comportamento recomendado
 * pra produto SaaS pago (cliente ja pagou aquele mes, tem direito de usar).
 *
 * Para 'immediately', cancela na hora. Usar apenas em casos de refund total
 * — o estorno do dinheiro eh feito separadamente via stripe.refunds.create.
 *
 * IMPORTANTE: o webhook customer.subscription.updated/deleted que sera
 * disparado pelo Stripe e quem atualiza o status no DB. Esta funcao NAO
 * mexe no DB diretamente — confia na propagacao do webhook.
 */
export async function cancelSubscription(
  input: CancelSubscriptionInput,
): Promise<{ status: Stripe.Subscription.Status; cancelAtPeriodEnd: boolean }> {
  const stripe = getPlatformStripeClient()
  const when = input.when ?? 'period_end'

  let updated: Stripe.Subscription
  if (when === 'immediately') {
    updated = await stripe.subscriptions.cancel(input.subscriptionId)
  } else {
    updated = await stripe.subscriptions.update(input.subscriptionId, {
      cancel_at_period_end: true,
    })
  }

  return {
    status:             updated.status,
    cancelAtPeriodEnd:  Boolean(updated.cancel_at_period_end),
  }
}

export interface CreatePortalSessionInput {
  /** stripe_customer_id (cus_xxx). */
  customerId: string
  /** URL pra qual Stripe redireciona ao fechar o Portal. */
  returnUrl:  string
}

/**
 * Cria sessao do Customer Portal e retorna URL.
 *
 * Esta URL e o link self-service onde cliente cancela, troca cartao, baixa
 * faturas. Cumpre requisito LGPD art. 18 (direito ao cancelamento self-service).
 *
 * URL gerada e valida por ~24h e single-use por sessao do cliente.
 * IMPORTANTE: redirecionar o cliente IMEDIATAMENTE — nao guardar URL em DB.
 */
export async function createPortalSession(
  input: CreatePortalSessionInput,
): Promise<{ url: string }> {
  const stripe = getPlatformStripeClient()

  const session = await stripe.billingPortal.sessions.create({
    customer:   input.customerId,
    return_url: input.returnUrl,
  })

  return { url: session.url }
}
