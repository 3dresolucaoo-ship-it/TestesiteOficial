# Calculadora Pro Subscription — Passo-a-passo CEO no Stripe + Vercel

> **Paulo** (Financial Officer) · 2026-05-20
> Baseado em ADR-023 (`decisions/023-calc-pro-freemium-subscription.md`).
> Tempo total estimado: ~15-20 minutos. Faça em ambiente Stripe **Test** primeiro, depois replique pra Live.

---

## Checklist pré-execução (3 minutos antes de começar)

- [ ] Acesso ao Stripe Dashboard com permissão de admin (https://dashboard.stripe.com)
- [ ] Acesso ao Vercel Dashboard do projeto hayzer (https://vercel.com/dashboard)
- [ ] Toggle **Test mode** ligado no Stripe (canto superior direito — botão amarelo "Test mode")
- [ ] Domínio `hayzer.com.br` ativo em produção (já está — confirmado 20/05)

---

## PARTE 1 — Stripe Dashboard (5 passos)

### Passo 1 — Criar o Product (1 min)

**URL**: https://dashboard.stripe.com/products → botão **"+ Add product"**

| Campo | Valor |
|---|---|
| **Name** | `Hayzer Calc Pro` |
| **Description** | `Calculadora 3D profissional. PDF de orçamento sem watermark, histórico salvo, multi-impressora, USD/EUR. Cancele quando quiser.` |
| **Image** | Subir `public/logo-hayzer.png` (opcional) |
| **Tax code** | `txcd_10000000` (General services — SaaS) ou deixar default |

Clica em **Save product** — Stripe gera `prod_xxx`.

### Passo 2 — Criar o Price recurring mensal (1 min)

Dentro do Product recém-criado, clica em **"+ Add another price"**:

| Campo | Valor | Justificativa |
|---|---|---|
| **Pricing model** | `Standard pricing` | Single price, sem tiered |
| **Price** | `19.00` | R$ 19,00 mensal (ver ADR-023 § Preço recomendado) |
| **Currency** | `BRL — Brazilian Real` | Mercado BR-first |
| **Billing period** | `Monthly` | Recorrente mensal |
| **Type** | `Recurring` | Subscription, não one-time |
| **Tax behavior** | `Inclusive` | Cliente vê R$ 19 fechado, sem surpresa |
| **Lookup key** | `calc_pro_monthly_19_brl` | Pra referenciar via API sem hard-code do price_id |

Clica em **Add price** — Stripe gera `price_xxx`.

**ANOTAR** o `price_xxx` — vai pro env `STRIPE_CALC_PRO_PRICE_ID`.

### Passo 3 — Criar Payment Link novo (subscription mode) (2 min)

**URL**: https://dashboard.stripe.com/payment-links → botão **"+ New"**

#### Tipo do link
- Selecione `Products and prices`
- Product: `Hayzer Calc Pro`
- Price: o `price_xxx` criado no passo 2

#### Configurações principais

| Setting | Valor | Por quê |
|---|---|---|
| **Quantity** | `Fixed at 1` | SaaS por usuário, não vende múltiplos |
| **Collect customer's email** | **Required** | Email é a chave de acesso. Sem email, não tem como atrelar ao auth.users |
| **Collect customer's name** | Optional | Reduz fricção mobile |
| **Collect billing address** | **Off** | SaaS digital, não precisa endereço |
| **Collect shipping address** | Off | Idem |
| **Payment methods** | Card, PIX (se disponível para subscription), Apple Pay, Google Pay | PIX recorrente está em rollout — habilita se aparecer. Cartão é obrigatório pro trial |
| **Promotion codes** | **On** | Pra Marcos criar cupons depois |
| **Tax collection** | Off (pra v1) | CEO desenquadra MEI→ME antes — emissão de NFS-e fora do Stripe |

#### Free trial (CRÍTICO)

Marca **Add a free trial** e configura:

| Campo | Valor |
|---|---|
| **Trial period** | `7 days` |
| **Subscription cancellation** | `Allow customers to cancel during the trial without payment` |
| **Behavior if no payment method** | N/A (estamos pedindo cartão upfront pra reduzir abuso) |

#### Página de sucesso

| Campo | Valor |
|---|---|
| **Confirmation page** | `Don't show confirmation page · redirect customers to your website` |
| **Success URL** | `https://hayzer.com.br/calculadora/pro/sucesso?session_id={CHECKOUT_SESSION_ID}` |

#### Metadata (obrigatório)

Adiciona 2 pares chave/valor:
- `bvaz_product` = `calc_pro_subscription`
- `bvaz_billing_model` = `subscription_monthly_v1`

Clica em **Create link** — Stripe gera URL no formato `https://buy.stripe.com/yyyyyy`.

**ANOTAR** essa URL — vai pro env `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_CALC_PRO`.

### Passo 4 — Habilitar Customer Portal (3 min, decisão LGPD obrigatória)

**URL**: https://dashboard.stripe.com/settings/billing/portal

Esta é a página que o cliente acessa pra cancelar, atualizar cartão, baixar fatura.

#### Settings recomendados

| Settings | Valor | Por quê |
|---|---|---|
| **Business information** | Hayzer + email `suporte@hayzer.com.br` + link `https://hayzer.com.br` | Aparece no header do Portal |
| **Cancellation** | `Customer can cancel subscriptions` | LGPD art. 18 — direito ao cancelamento self-service |
| **When to cancel** | `End of billing period` (não imediato) | Cliente já pagou o mês, tem direito de usar até fim do período |
| **Cancellation reason** | `Required` | Aprendizado pro produto — porque cancelou |
| **Subscription updates** | `Switch plans: Off` (v1 tem 1 plano só), `Update quantity: Off` | Não tem upsell ainda |
| **Payment method** | `Customer can update payment method` | LGPD — atualizar cartão sem mexer no atendimento |
| **Invoice history** | `On` | Cliente baixa próprias faturas (PCI-DSS-friendly) |
| **Customer information** | `Update email + tax ID` | Pra emissão de NFS-e futura |
| **Branding** | Logo Hayzer + cor `#1F7669` (petrol) | Casa com o site |

Clica em **Save** — Portal configurado. URL do Portal vai ser gerada por sessão no nosso backend (em `payments/stripe.ts:createPortalSession`).

### Passo 5 — Registrar Webhook endpoint novo (2 min)

**URL**: https://dashboard.stripe.com/webhooks → botão **"+ Add endpoint"**

| Campo | Valor |
|---|---|
| **Endpoint URL** | `https://hayzer.com.br/api/webhooks/payment?merchant=calc-pro` |
| **Description** | `Calc Pro Subscription — Hayzer SaaS recurring` |
| **Listen to** | `Events on your account` (não Connect — Calc Pro é da platform account) |
| **API version** | `Latest` (`2026-03-25.dahlia`) |

**Select events** (apenas estes 5):

- [x] `customer.subscription.created`
- [x] `customer.subscription.updated`
- [x] `customer.subscription.deleted`
- [x] `invoice.paid`
- [x] `invoice.payment_failed`

Clica em **Add endpoint** — Stripe gera **Signing secret** (`whsec_xxx`).

**ANOTAR** esse secret — vai pro env `STRIPE_CALC_PRO_WEBHOOK_SECRET`.

---

## PARTE 2 — Vercel Dashboard (5 passos)

### Passo 6 — Adicionar env vars novas (Production + Preview) (2 min)

**URL**: https://vercel.com/dashboard → projeto `hayzer` (ou `bvaz-hub`) → **Settings** → **Environment Variables**

Adicionar 2 envs novas:

| Nome | Valor | Tipo | Exposta no client? | Environments |
|---|---|---|---|---|
| `STRIPE_CALC_PRO_PRICE_ID` | `price_xxx` (do passo 2) | **Sensitive** | NÃO | Production + Preview |
| `STRIPE_CALC_PRO_WEBHOOK_SECRET` | `whsec_xxx` (do passo 5) | **Sensitive** | NÃO | Production + Preview |

### Passo 7 — Atualizar env existente

Trocar valor de `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_CALC_PRO`:

| Antes (lifetime) | Depois (subscription) |
|---|---|
| `https://buy.stripe.com/xxxxxxxxxxxx` (Payment Link lifetime de R$ 37) | `https://buy.stripe.com/yyyyyyyyyyyy` (Payment Link subscription R$ 19/mês — do passo 3) |

### Passo 8 — Validar envs existentes (1 min)

Confirma que estas 2 envs **já existem** (não deletar, só verificar):

- [x] `STRIPE_SECRET_KEY` — `sk_test_...` (em test) ou `sk_live_...` (em live). Mesma key usada por outros fluxos Stripe.
- [x] `SUPABASE_SERVICE_ROLE_KEY` — necessária pro webhook handler bypassar RLS.

Se alguma faltar, **PARAR** e contatar Paulo antes de continuar (sem essas envs, o webhook handler crasha em produção).

### Passo 9 — Redeploy

**URL**: https://vercel.com/dashboard → projeto → **Deployments** → último deploy → menu `...` → **Redeploy** → marcar **Use existing Build Cache** (mais rápido).

Aguarda ~2 min. Se a aba **Deployments** mostrar **Ready** com checkmark verde, propagação OK.

### Passo 10 — Validação rápida pós-redeploy (1 min)

Abre 3 abas:

1. `https://hayzer.com.br/calculadora/pro` — confirma que botão "Quero a Pro" aponta pra novo Payment Link (inspect → href do `<a>` deve ser `https://buy.stripe.com/yyyyy`)
2. `https://hayzer.com.br/api/calc-pro/status` (com user logado) — deve responder `{ active: false }` se user nunca assinou
3. Stripe Dashboard → **Developers** → **Webhooks** → endpoint criado no passo 5 → aba **Recent attempts** — deve estar vazio (sem 4xx)

---

## PARTE 3 — Teste E2E em sandbox (depois das partes 1 e 2)

### Cenários obrigatórios (todos devem passar)

| # | Cenário | Como testar | Esperado |
|---|---|---|---|
| 1 | Assinatura cartão sandbox | Modo Test, cartão `4242 4242 4242 4242`, CVV qualquer, validade qualquer futuro | Webhook `customer.subscription.created` → row em `calc_pro_subscriptions` com `status='trialing'`, `trial_end` ~7 dias |
| 2 | Trial → paid automático | Stripe Dashboard → Subscription → menu → **"End trial now"** | Webhook `customer.subscription.updated` → row atualizada `status='active'` |
| 3 | Cancelamento via Customer Portal | Loga como cliente teste → vai pro Portal → **Cancel** | Webhook `customer.subscription.updated` (`cancel_at_period_end=true`), depois `customer.subscription.deleted` no fim do período → row `status='canceled'` |
| 4 | Webhook duplicado | Stripe Dashboard → Webhooks → endpoint → último evento → **"Resend"** | Segundo POST retorna 200, mas **não** dobra row (UNIQUE event_id) |
| 5 | Signature inválida | `curl -X POST https://hayzer.com.br/api/webhooks/payment?merchant=calc-pro -d '{"fake":true}'` | **401** ou **400**, zero impact no DB |
| 6 | Payment failed | Stripe Dashboard → Subscription → menu → **"Create invoice with payment failure"** | Webhook `invoice.payment_failed` → row `status='past_due'`, notificação Sentry/Discord |

**Bloqueador de launch**: cenários 1, 3 e 4 OBRIGATÓRIOS. Cenário 4 (duplicate) é o que evita cobrar 2x o cliente — sem ele, 1% de retry da Stripe vira 1% de churn por raiva.

---

## PARTE 4 — Migração Test → Live (quando aprovar)

Quando os 6 cenários passarem em sandbox, repete as partes 1-3 **mas em Live mode**:

1. Toggle **Test mode** OFF no Stripe Dashboard
2. Refazer passos 1-5 em ambiente Live (Product/Price/Payment Link/Portal/Webhook ficam ISOLADOS — não compartilham com Test)
3. Atualizar envs no Vercel com valores Live: `STRIPE_SECRET_KEY` → `sk_live_...`, `STRIPE_CALC_PRO_WEBHOOK_SECRET` → novo `whsec_` Live, `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_CALC_PRO` → novo Payment Link Live, `STRIPE_CALC_PRO_PRICE_ID` → `price_xxx` Live
4. Redeploy
5. Compra real CEO: R$ 19 (compra → confirma webhook → estorna manualmente via Stripe Dashboard)

**Recomendação Paulo**: pré-compra de teste em ambiente Live é OBRIGATÓRIA antes de divulgar publicamente. Se algum env não estiver correto, falha silenciosa custa MRR. Esta compra-teste é o filtro final.

---

## Reconciliação pós-launch (rotina semanal Paulo + CEO)

Toda segunda 9h, rodar no Supabase MCP:

```sql
-- Subscriptions ativas no DB
SELECT
  status,
  COUNT(*) as qtd,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as ativas,
  SUM(CASE WHEN status = 'trialing' THEN 1 ELSE 0 END) as trials,
  SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) as canceladas
FROM calc_pro_subscriptions
WHERE created_at >= now() - interval '30 days';
```

Cruzar com Stripe Dashboard → **Billing** → **Subscriptions** → filtrar últimos 30 dias.

**Regra**: divergência ≥ 2 rows entre DB e Stripe = investigar antes de chegar em 5. Causa provável: webhook perdido ou erro no handler.

---

## Plano de incidente (paranoia mode Paulo)

| Incidente | Quem responde | Tempo de resposta | Comando de remediação |
|---|---|---|---|
| Cliente cobrado mas sem acesso | Paulo + Bruna | 30 min | Verificar `calc_pro_subscriptions` por email → se ausente, reprocessar evento via Stripe Dashboard "Resend" |
| Cliente cobrado 2x no mesmo mês | Paulo | 1 hora | Estornar 1 charge no Stripe Dashboard → email pro cliente com pedido de desculpas (template Carla) |
| Webhook 500 em cascata | Ricardo + Bruna | 15 min | Verificar Vercel Function logs → se Supabase OK, problema no código → revert do último deploy |
| Subscription `past_due` virou churn | CEO + Sofia (CS) | 24 horas | Email manual oferecendo desconto de 50% no próximo mês → se ignorar, accept como churn |
| Gateway down (Stripe) | Aguardar | <1 hora (SLA Stripe) | Stripe historicamente nunca caiu >30min globalmente. Nada a fazer do nosso lado. |

---

## Bloco copiável (CEO segue isso na ordem)

```
PASSO 1 (1min) — Product:
  Stripe → Products → New → Name: Hayzer Calc Pro → Save

PASSO 2 (1min) — Price:
  No product → Add price → 19.00 BRL → Recurring monthly → Lookup key: calc_pro_monthly_19_brl
  ANOTAR: price_xxx

PASSO 3 (2min) — Payment Link:
  Payment Links → New
  Product: Hayzer Calc Pro / Price: price_xxx
  Collect email: Required
  Trial: 7 dias
  Success URL: https://hayzer.com.br/calculadora/pro/sucesso?session_id={CHECKOUT_SESSION_ID}
  Metadata: bvaz_product=calc_pro_subscription, bvaz_billing_model=subscription_monthly_v1
  Create link → ANOTAR: https://buy.stripe.com/yyyy

PASSO 4 (3min) — Customer Portal:
  Settings → Billing → Customer Portal
  Cancellation: On (end of billing period, reason required)
  Update payment method: On
  Invoice history: On
  Save

PASSO 5 (2min) — Webhook:
  Developers → Webhooks → Add endpoint
  URL: https://hayzer.com.br/api/webhooks/payment?merchant=calc-pro
  Events: customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.paid, invoice.payment_failed
  Add → ANOTAR: whsec_xxx

PASSO 6 (2min) — Vercel envs:
  STRIPE_CALC_PRO_PRICE_ID = price_xxx (passo 2)
  STRIPE_CALC_PRO_WEBHOOK_SECRET = whsec_xxx (passo 5)
  NEXT_PUBLIC_STRIPE_PAYMENT_LINK_CALC_PRO = https://buy.stripe.com/yyyy (passo 3) — substitui o lifetime
  Redeploy

PASSO 7 — Testes E2E sandbox (todos os 6 cenários da Parte 3)

PASSO 8 — Quando passar, repete em Live mode + compra-teste R$ 19 real (depois CEO estorna)
```

---

## Related

- `decisions/023-calc-pro-freemium-subscription.md` — ADR completo
- `supabase/migrations/20260520_calc_pro_subscriptions.sql` — schema da tabela
- `app/api/webhooks/payment/route.ts` — handler que processa os 5 eventos
- `services/calcProSubscription.ts` — service layer (consulta/upsert)
- `payments/stripe.ts` — `getCheckoutUrlSubscription` + `cancelSubscription` + `createPortalSession`
