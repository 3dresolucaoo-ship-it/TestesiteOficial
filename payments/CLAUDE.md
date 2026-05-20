# payments/ — Provider Implementations

> Server-only. Implementações concretas de `PaymentProviderClient`.
> NUNCA importar de client component.

## Convenções

- Cada provider exporta uma factory: `export function xxxProvider(creds: ProviderCredentials): PaymentProviderClient`
- Recebe credenciais como parâmetro (nunca lê `process.env` direto) — multi-tenant
- Implementa interface de `services/payments.ts`:
  - `createPayment(input) → { paymentUrl, paymentId }`
  - `parseWebhook(rawBody, headers) → WebhookPayload | null`
- **`null` em parseWebhook** = evento que não devemos processar (ack silent)
- **Throw em parseWebhook** = erro real (gateway vai retentar)

## Arquivos

| File | Provider | Status |
|---|---|---|
| mercadopago.ts | Mercado Pago | ✅ OK — preference API + HMAC verification |
| stripe.ts | Stripe | ✅ OK — Checkout Sessions API + Calc Pro subscription helpers (Paulo 2026-05-20) |
| setup-stripe-calc-pro.md | Doc CEO | ⚠️ ARQUIVADO 2026-05-21 — redirect para `_archived/setup-stripe-calc-pro.md` (ADR-024 revogou) |
| calc-pro-integration-spec.md | Histórico | ⚠️ Spec antigo lifetime — superseded por ADR-023 |

## Metadata padronizada

Todo provider envia metadata com prefixo `bvaz_*`:
- `bvaz_product_id`
- `bvaz_quantity`
- `bvaz_customer_name`
- `bvaz_whatsapp`
- `bvaz_catalog_slug`
- `bvaz_merchant_id` ⚠️ crítico — usado pra cross-merchant security check
- `bvaz_project_id`

## Issues conhecidos

- ⚠️ Stripe API version `2026-03-25.dahlia` hard-coded em `stripe.ts:25` — DRY com `core/integrations/stripe.ts:24`
- ⚠️ `core/integrations/stripe.ts` legado — deletar quando consolidar (B5/B7)

## Adicionar novo provider

1. Criar `payments/<nome>.ts` com factory
2. Adicionar dynamic import em `services/payments.ts:loadXxx`
3. Adicionar provider name em `PaymentProviderName` (`services/paymentConfig.ts:19`)
4. Adicionar no CHECK constraint do DB (`payment_configs.provider`)
5. Implementar `createPayment` + `parseWebhook`

## Calc Pro Subscription (Paulo 2026-05-20, ADR-023)

Funcoes exportadas em `stripe.ts` alem do factory:

- `getCheckoutUrlSubscription(input)` — cria Checkout Session mode='subscription' usando platform-account STRIPE_SECRET_KEY (nao um merchant). Pra fluxos custom; o Payment Link estatico do Dashboard nao precisa dela.
- `cancelSubscription({ subscriptionId, when })` — `period_end` (default, recomendado LGPD) ou `immediately`.
- `createPortalSession({ customerId, returnUrl })` — URL do Customer Portal pra cliente cancelar/atualizar cartao.

Webhook handler dedicado em `app/api/webhooks/payment/route.ts` via `?merchant=calc-pro`. Eventos: `customer.subscription.{created,updated,deleted}` + `invoice.{paid,payment_failed}`.

Service layer em `services/calcProSubscription.ts`. Migration em `supabase/migrations/20260520_calc_pro_subscriptions.sql`.

## Related

- `services/payments.ts` — abstração + factory
- `services/paymentConfig.ts` — credenciais por usuário
- `services/calcProSubscription.ts` — service da Calc Pro subscription
- `app/api/webhooks/payment/route.ts` — handler genérico + handler calc-pro
- `decisions/001-mp-marketplace-vs-checkoutpro.md`
- `decisions/023-calc-pro-freemium-subscription.md` — ADR Calc Pro Subscription
