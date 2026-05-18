# Calculadora Pro — Integração Stripe Payment Link

> **Paulo** · 2026-05-18
> Decisão **Helena** em `strategy/decisoes-resolvidas-2026-05-18.md` (Decisão 1).
> Produto: Calculadora Pro · Preço único R$ 37,00 BRL · Lifetime.
> Copy de referência: `marketing/calculadora-pro/copy-paywall.md` (Carla).
>
> **Por que Payment Link (e não Checkout Session custom)**: economiza 6-8h de dev no
> primeiro release, valida willingness-to-pay sem código complexo. Migrar pra
> Checkout Session custom se conversão >5% por 2 semanas (decidir pós-launch).
>
> ⚠️ **Aviso de segurança**: este spec usa o pattern de webhook atômico já
> implementado em `app/api/webhooks/payment/route.ts` (fix de 2026-05-18).
> NÃO criar handler novo sem reusar a tabela `webhook_events` — duplicate
> charge é o tipo de bug que mata 30% do MRR.

---

## Checklist 5 passos (executar em ordem)

- [ ] **1. CEO** cria Payment Link no dashboard Stripe seguindo seção 1 deste doc (~3 min)
- [ ] **2. CEO** registra webhook endpoint Stripe apontando pra `/api/webhooks/stripe-calc-pro` (~2 min)
- [ ] **3. CEO** adiciona 2 env vars no Vercel (Production + Preview) e roda redeploy (~3 min)
- [ ] **4. Bruna** aplica migration `20260519_calculadora_pro_purchases.sql` via Supabase MCP (~1 min)
- [ ] **5. Felipe** implementa handler + integra paywall na `/calculadora` lendo seção 4 deste doc (~4 h)

---

## 1. Spec do Stripe Payment Link

**URL**: https://dashboard.stripe.com/payment-links → botão **"+ New"**.

### Campos a preencher

| Campo | Valor |
|---|---|
| **Tipo** | Products and prices · Sell a product or subscription |
| **Product name** | `Calculadora Pro - Hayzer` |
| **Product description** | `PDF de orçamento, histórico salvo e perfil de impressora. Pagamento único, acesso pra sempre.` |
| **Image** | (opcional) logo Hayzer · `public/logo-hayzer.png` (subir manualmente) |
| **Price** | `37.00 BRL` |
| **Type** | One-time |
| **Tax behavior** | Inclusive (cliente vê R$ 37 fechado) |

### Configurações avançadas

| Setting | Valor | Por quê |
|---|---|---|
| **Quantity** | Fixed at 1 (não deixar cliente escolher) | Produto digital lifetime — não faz sentido comprar 2 |
| **Collect customer's email** | **Required** | Email é a chave de liberação de acesso (não há login por enquanto) |
| **Collect customer's name** | Optional | Reduz fricção; nome vem no email se quiser personalizar |
| **Collect billing address** | **Off** | Produto digital, não precisa de endereço — reduz fricção mobile |
| **Collect shipping address** | Off | Igual acima |
| **Collect phone number** | Off | Já temos email; phone na waitlist é em campo separado |
| **Payment methods** | Card, **PIX**, **Boleto**, Apple Pay, Google Pay | PIX é 40%+ do e-commerce BR (Stripe BCB 2026). Boleto opcional pra maker sem cartão — 3 dias pra pagar |
| **Adjustable quantity** | Off | Idem fixed at 1 |
| **Promotion codes** | **On** | Pra Marcos criar cupons depois (`MAKER10` etc.) sem novo Payment Link |
| **Confirmation page** | Don't show confirmation page · **redirect customers to your website** | Levo o cliente pro nosso success próprio (URL abaixo) |
| **Success URL** | `https://hayzer.com.br/calculadora/pro/sucesso?session_id={CHECKOUT_SESSION_ID}` | Stripe substitui `{CHECKOUT_SESSION_ID}` pelo ID real |
| **After payment** | Send a receipt email | Stripe envia receipt PDF próprio (independente do nosso transacional) |
| **Limit number of payments** | Off | Acesso lifetime, sem limite de compras |
| **Metadata (chave/valor)** | `bvaz_product=calculadora_pro`, `bvaz_origin=payment_link_v1` | Necessário pro webhook handler identificar o produto |

### Cancel URL (rejection / customer hits "back")

Stripe Payment Link não tem campo "Cancel URL" explícito como Checkout Session.
Cliente que abandonar vai voltar pra origem (referrer). Se quiser forçar volta
pra página de venda, colocar query param `?return_to=/calculadora/pro` no botão
"Quero a Pro" da página de venda e o JS guarda em `sessionStorage` antes de
redirecionar pro Payment Link. (Detalhe pro Felipe, não bloqueante.)

### Output do passo 1

Após clicar **"Create link"**, Stripe gera URL no formato:

```
https://buy.stripe.com/xxxxxxxxxxxxxxxxxx
```

**Copia essa URL** — vai pro env `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_CALC_PRO`.

---

## 2. Webhook endpoint no dashboard Stripe

**URL**: https://dashboard.stripe.com/webhooks → botão **"+ Add endpoint"**.

| Campo | Valor |
|---|---|
| **Endpoint URL** | `https://hayzer.com.br/api/webhooks/stripe-calc-pro` |
| **Description** | `Calculadora Pro — libera acesso pós-pagamento` |
| **Listen to** | Events on your account (não Connect — Payment Link é direto na platform account) |
| **Select events** | Apenas **`checkout.session.completed`** |
| **API version** | Latest (`2026-03-25.dahlia`) — bate com `payments/stripe.ts:25` |

Após criar, Stripe mostra **Signing secret** (`whsec_xxxxxxxxxxxx`).
**Copia esse secret** — vai pro env `STRIPE_WEBHOOK_SECRET_CALC_PRO`.

⚠️ **Não confundir com `STRIPE_WEBHOOK_SECRET` (sem `_CALC_PRO`)** — esse pertence
ao webhook genérico `/api/webhooks/payment` que processa orders de catálogo.
São webhooks separados, com secrets separados, pra que rotação de um não
quebre o outro.

---

## 3. Env vars Vercel

Adicionar em **Settings → Environment Variables** (Production + Preview):

| Nome | Valor | Tipo | Exposta no client? |
|---|---|---|---|
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_CALC_PRO` | `https://buy.stripe.com/xxxxxxxxxxxxxxxxxx` (do passo 1) | Plain text | **SIM** (prefixo `NEXT_PUBLIC_`) |
| `STRIPE_WEBHOOK_SECRET_CALC_PRO` | `whsec_xxxxxxxxxxxx` (do passo 2) | **Sensitive** | **NÃO** |

Após salvar, **redeploy** pra propagar (Deployments → menu `…` → Redeploy → marcar "Use existing Build Cache" pra ser mais rápido).

Atualizar `.env.example` adicionando essas 2 linhas (sem valor real):

```bash
# Calculadora Pro — Payment Link (Helena 2026-05-18)
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_CALC_PRO=
STRIPE_WEBHOOK_SECRET_CALC_PRO=
```

---

## 4. Spec do webhook handler

**Arquivo**: `app/api/webhooks/stripe-calc-pro/route.ts` (criar)

### Comportamento esperado

1. Lê raw body (necessário pra signature verification).
2. Verifica `Stripe-Signature` header com `STRIPE_WEBHOOK_SECRET_CALC_PRO`.
   - Signature inválida → **401**, sem tocar DB.
3. Filtra apenas `checkout.session.completed`. Outros eventos → **200** silent ack.
4. Extrai `email`, `session.id`, `amount_total`, `payment_status`, `metadata`.
5. **Idempotência**: chama a mesma RPC `process_webhook_atomic`? **NÃO** — essa RPC
   é específica de fluxo de catálogo (order + production + transaction).
   Calculadora Pro tem fluxo diferente (insert em `calculadora_pro_purchases` +
   envio de email). Solução: usar a **mesma tabela `webhook_events`** como lock
   atômico, mas com lógica de negócio inline no handler.
6. Insert em `calculadora_pro_purchases` com `stripe_session_id` UNIQUE (defesa em profundidade).
7. Triggera email transacional via Resend (template novo `sendCalculadoraProAcesso`).
8. Retorna **200** com `{ received: true }`.

### Pseudo-código (Felipe segue isso)

```ts
// app/api/webhooks/stripe-calc-pro/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { sendCalculadoraProAcesso } from '@/services/email'

// Stripe client lê da env raiz STRIPE_SECRET_KEY (já existe pra outros usos).
// NÃO usar paymentConfig do merchant — Payment Link Calc Pro é da platform account.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET_CALC_PRO

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    console.error('[webhook/stripe-calc-pro] STRIPE_WEBHOOK_SECRET_CALC_PRO ausente')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  // 1. Signature antes de qualquer coisa
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 401 })

  const rawBody = Buffer.from(await req.arrayBuffer())
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`[webhook/stripe-calc-pro] Invalid signature: ${msg}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 2. Filtrar evento
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })   // silent ack
  }

  const session = event.data.object as Stripe.Checkout.Session

  // 3. Validar payment_status (Stripe pode mandar session.completed com payment_status='unpaid'
  //    quando é boleto que ainda não foi pago — não liberar acesso ainda)
  if (session.payment_status !== 'paid') {
    console.info(
      `[webhook/stripe-calc-pro] session.completed but not paid yet (${session.payment_status}) — ignoring`,
    )
    return NextResponse.json({ received: true })
  }

  // 4. Extrair dados
  const email = session.customer_details?.email || session.customer_email
  if (!email) {
    console.error(`[webhook/stripe-calc-pro] No email in session ${session.id}`)
    return NextResponse.json({ received: true })   // não retry — erro permanente
  }

  const amountCents = session.amount_total ?? 3700

  // 5. Idempotency lock via webhook_events (mesma tabela do webhook genérico)
  const admin = getSupabaseAdmin()
  const { error: lockError } = await admin
    .from('webhook_events')
    .insert({
      provider:   'stripe',
      event_id:   event.id,
      event_type: event.type,
      payload:    { sessionId: session.id, email, amountCents },
    })

  if (lockError) {
    // 23505 = unique_violation em (provider, event_id) → já processado
    if (lockError.code === '23505') {
      console.info(`[webhook/stripe-calc-pro] Duplicate event ${event.id} — ack silent`)
      return NextResponse.json({ received: true })
    }
    console.error(`[webhook/stripe-calc-pro] webhook_events insert failed: ${lockError.message}`)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })   // retry
  }

  // 6. Insert na tabela calculadora_pro_purchases
  const { error: insertError } = await admin
    .from('calculadora_pro_purchases')
    .insert({
      email,
      stripe_session_id: session.id,
      amount_cents:      amountCents,
    })

  if (insertError) {
    // 23505 em stripe_session_id = defense in depth, evento já gravado antes
    if (insertError.code !== '23505') {
      console.error(`[webhook/stripe-calc-pro] purchase insert failed: ${insertError.message}`)
      // não retornar 500 — webhook_events JÁ foi marcado como processado.
      // Retry vai bater no UNIQUE de event_id e cair em duplicate.
      // Logar pra investigação manual. CEO reprocessa via admin.
    }
  }

  // 7. Marca evento como processado
  await admin
    .from('webhook_events')
    .update({ processed_at: new Date().toISOString() })
    .eq('provider', 'stripe')
    .eq('event_id', event.id)

  // 8. Email transacional (graceful — se Resend cair, compra já tá salva)
  await sendCalculadoraProAcesso(email)
    .catch(err => console.error(`[webhook/stripe-calc-pro] Email failed: ${err}`))

  console.info(`[webhook/stripe-calc-pro] OK | email=${email} | session=${session.id}`)
  return NextResponse.json({ received: true })
}
```

### O que esse handler **não faz** (limites declarados)

- **Não atomic-iza** insert do `webhook_events` + insert do `calculadora_pro_purchases` na mesma transação. Diferente do `/api/webhooks/payment` (que usa RPC) — aqui são 2 inserts separados. **Risco aceito**: se crashar entre os dois, evento fica como "processado" mas compra não registrada. Mitigação: UNIQUE em `stripe_session_id` evita duplicate na pior das hipóteses; o que pode acontecer é compra "perdida" no DB com email já enviado. CEO consegue reconstruir do dashboard Stripe (event log fica 30 dias). Aceitável pra v1, refatorar pra RPC se acontecer ≥1×.
- **Não cria conta de usuário** no Hayzer. Por enquanto acesso é via email (cliente entra na `/calculadora` com email magic-link ou similar — Felipe decide UX). Conta proper vem na Onda 2.
- **Não trata refund** (`charge.refunded`). Pra v1, refund é manual (CEO estorna no Stripe, deleta row da tabela manualmente). Versão 1.1 escuta `charge.refunded` e marca `refunded_at`.

---

## 5. Migration SQL — `calculadora_pro_purchases`

**Arquivo a criar**: `supabase/migrations/20260519_calculadora_pro_purchases.sql`
**Não aplicar agora.** Bruna aplica via Supabase MCP `apply_migration` após CEO aprovar.

```sql
-- supabase/migrations/20260519_calculadora_pro_purchases.sql
-- Descrição: Tabela calculadora_pro_purchases — registro de compras da Calc Pro.
--
-- Decisão Helena 2026-05-18: Calculadora Pro entra Semana 3 (25-31/05).
-- Modelo: Stripe Payment Link único, R$ 37, lifetime, sem login (acesso via email).
--
-- RLS: deny-all (somente service_role escreve via webhook). Leitura no app
-- futuramente vai via RPC SECURITY DEFINER ou service_role no server.

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS calculadora_pro_purchases (
  id                 uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email              citext      NOT NULL,
  stripe_session_id  text        NOT NULL,
  amount_cents       integer     NOT NULL CHECK (amount_cents > 0),
  refunded_at        timestamptz,           -- preenchido por handler de refund (v1.1)
  created_at         timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT calc_pro_session_uniq UNIQUE (stripe_session_id)
);

CREATE INDEX IF NOT EXISTS calc_pro_email_idx
  ON calculadora_pro_purchases (email);

CREATE INDEX IF NOT EXISTS calc_pro_created_at_idx
  ON calculadora_pro_purchases (created_at DESC);

ALTER TABLE calculadora_pro_purchases ENABLE ROW LEVEL SECURITY;

-- Sem policies = deny-all pra anon/authenticated. service_role bypassa por design.

-- ─── DOWN ────────────────────────────────────────────────────────────────────
-- DROP TABLE IF EXISTS calculadora_pro_purchases;
```

### Notas sobre o schema

- **`email citext`**: case-insensitive — `Gabriel@x.com` e `gabriel@x.com` viram a mesma compra. Mesma extensão usada em `waitlist_leads`.
- **`stripe_session_id` UNIQUE**: defense in depth. O lock primário é `webhook_events.UNIQUE(provider, event_id)`, mas se algum dia for processado por outro caminho (script manual, reconciliação), o UNIQUE aqui evita duplicidade.
- **Sem `user_id`**: produto não exige conta Hayzer pra comprar. Lifetime de acesso é vinculado a `email`, não a `auth.users.id`. Quando Hayzer tiver login proper (Onda 2), criar coluna `user_id uuid REFERENCES auth.users(id)` opcional + RPC pra "claim" compra existente pelo email.
- **`amount_cents` em vez de `amount_brl`**: bate com unidade Stripe nativa (cents). Conversão pra real é cosmética no frontend.
- **`refunded_at` nullable**: pré-criado pro v1.1 não precisar de outra migration. Default NULL = não refundado.

### Verificação pós-aplicação (Bruna roda no Supabase MCP `execute_sql`)

```sql
-- Confirma tabela + RLS + UNIQUE
SELECT
  c.column_name, c.data_type, c.is_nullable,
  tc.constraint_type
FROM information_schema.columns c
LEFT JOIN information_schema.constraint_column_usage ccu
  ON ccu.column_name = c.column_name AND ccu.table_name = c.table_name
LEFT JOIN information_schema.table_constraints tc
  ON tc.constraint_name = ccu.constraint_name
WHERE c.table_name = 'calculadora_pro_purchases'
ORDER BY c.ordinal_position;

-- Confirma RLS habilitado
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'calculadora_pro_purchases';
```

---

## 6. Email transacional — template a criar

**Arquivo**: `services/email.ts` (adicionar função, **NÃO** substituir a existente).

```ts
export async function sendCalculadoraProAcesso(to: string): Promise<SendEmailResult> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY ausente — calc pro acesso não enviado pra', to)
    return { ok: false, error: 'not_configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from:     `Gabriel <${RESEND_FROM_EMAIL}>`,
      replyTo:  'suporte@hayzer.com.br',
      to,
      subject:  'Sua Calculadora Pro tá liberada — Hayzer',
      html:     renderCalcProHtml(to),
      text:     renderCalcProText(to),
    })

    if (error) {
      console.error('[email.sendCalculadoraProAcesso] resend error:', error)
      return { ok: false, error: error.message || 'send_failed' }
    }
    return { ok: true, id: data?.id || '' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    return { ok: false, error: msg }
  }
}
```

**Conteúdo do HTML/texto**: usar **Parte 3 do `marketing/calculadora-pro/copy-paywall.md`**
(linhas 200-273). Versão completa do email + P.S. de reembolso.

Variáveis no template:
- `{{first_name}}` → derivar do email se nome não veio (`email.split('@')[0]` como fallback)
- `{{access_link}}` → por enquanto `https://hayzer.com.br/calculadora?pro=1&email={URL_ENCODED}` (Felipe decide UX final do magic-link)

---

## 7. Plano de teste E2E (antes de divulgar publicamente)

| # | Cenário | Como testar | Esperado |
|---|---|---|---|
| 1 | Compra cartão sandbox | Stripe modo Test, cartão `4242 4242 4242 4242` | Webhook → row em `calculadora_pro_purchases` + email em inbox Resend |
| 2 | Compra PIX sandbox | Stripe modo Test, escolher PIX → "Pay" simulado | Webhook → row + email |
| 3 | Compra Boleto sandbox | Stripe modo Test, escolher Boleto → simular "pago" no dashboard | Webhook `checkout.session.completed` com `payment_status='paid'` — handler libera. Boleto não pago: handler **ignora** |
| 4 | Duplicate webhook | Stripe dashboard → "Resend" no mesmo evento | Segundo POST retorna 200, mas **não** cria 2ª row (UNIQUE event_id) |
| 5 | Signature inválida | `curl -X POST https://hayzer.com.br/api/webhooks/stripe-calc-pro -d '{"fake":true}'` | **401** Invalid signature, zero impact no DB |
| 6 | Stripe Test → Prod | Trocar `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET_CALC_PRO` pros valores live, refazer compra real R$ 0,50 (depois CEO estorna) | Funciona em prod |

**Bloqueador de launch**: cenário 4 (duplicate) tem que passar. Sem isso, qualquer
retry da Stripe = 2 emails de acesso pro cliente = ruído.

---

## 8. Reconciliação diária (operação pós-launch)

Aprendizado da memória ativa Paulo (princípio Scaling People + Stripe Press): *"reconciliação prod = gateway".*

**Script SQL** (Supabase MCP, rodar manual semanal nas primeiras 4 semanas):

```sql
-- Total de compras Calc Pro nos últimos 7 dias
SELECT
  DATE(created_at) AS dia,
  COUNT(*) AS qtd,
  SUM(amount_cents) / 100.0 AS faturamento_brl
FROM calculadora_pro_purchases
WHERE created_at >= now() - interval '7 days'
  AND refunded_at IS NULL
GROUP BY DATE(created_at)
ORDER BY dia DESC;
```

Cruzar com Stripe Dashboard → Payments → filtrar últimos 7 dias.
Divergência ≥1 row = investigar (provavelmente webhook não chegou).

---

## 9. O que **não está coberto** neste spec (gaps assumidos)

| Gap | Impacto | Quando resolver |
|---|---|---|
| Refund automático via webhook `charge.refunded` | Manual por enquanto | v1.1 (Semana 5+) |
| Magic-link de acesso (cliente sem senha) | Felipe decide UX | Antes do divulgação Semana 3 sáb 30/05 |
| Dashboard admin "ver compras Calc Pro" | Sem visibilidade no app — CEO usa Stripe dashboard | Wave 1 Customers (Semana 4) |
| Cupom de desconto (`MAKER10` etc.) | Marcos cria diretamente no Stripe, vai funcionar sem código | Quando Marcos pedir |
| Internacional (USD/EUR) | Payment Link Brasil só BRL | Não cabe agora — produto é BR-first |

---

## 10. Risco financeiro (paranoia mode Paulo)

| Risco | Probabilidade | Severidade | Mitigação |
|---|---|---|---|
| Webhook não chega (Stripe → Vercel falha) | Baixa (Stripe retry exp 3 dias) | Cliente paga e não recebe acesso | Alerta CEO se row criada > 24h sem `processed_at` |
| Cliente paga 2× por F5 no Payment Link | Médio (mas Stripe geralmente bloqueia) | Cobrança duplicada | Stripe gera 2 sessions distintos = 2 rows. UI tem que mostrar "já comprou" se email já existe |
| Refund pedido por reembolso 7 dias | Alta (1-3% das compras) | Estorno + ressentimento se demorar | CEO estorna no Stripe dashboard em <24h. Email "responde reembolso e eu estorno mesmo dia" cumpre |
| Chargeback (cliente disputa cartão) | Baixa (1-0.5% mercado BR) | Perda do valor + fee Stripe ~R$ 75 | Aceitar custo. Se >2% das compras = investigar fraude/UX |
| Bug crítico: cliente comprou e email não chegou | Médio (Resend pending/bounce) | Cliente bravo, churn imediato | Log em `webhook_events` + alerta Sentry se `email.send_failed` > 5/dia |

---

## 11. Bloco copiável (CEO segue isso na ordem)

```
PASSO 1 (3min) — Stripe Dashboard:
1. https://dashboard.stripe.com/payment-links → New
2. Product name: Calculadora Pro - Hayzer
3. Price: 37.00 BRL, One-time
4. Collect email: Required · Collect address: Off
5. Payment methods: Card, PIX, Boleto, Apple Pay, Google Pay
6. After payment: Don't show page · redirect: https://hayzer.com.br/calculadora/pro/sucesso?session_id={CHECKOUT_SESSION_ID}
7. Metadata: bvaz_product=calculadora_pro, bvaz_origin=payment_link_v1
8. Promotion codes: On
9. Create link → copia a URL https://buy.stripe.com/xxxxx

PASSO 2 (2min) — Stripe Webhooks:
1. https://dashboard.stripe.com/webhooks → Add endpoint
2. URL: https://hayzer.com.br/api/webhooks/stripe-calc-pro
3. Events: checkout.session.completed (só esse)
4. Add → copia o Signing secret whsec_xxxxx

PASSO 3 (3min) — Vercel env vars (Production + Preview):
1. NEXT_PUBLIC_STRIPE_PAYMENT_LINK_CALC_PRO = <URL do passo 1>
2. STRIPE_WEBHOOK_SECRET_CALC_PRO = <secret do passo 2>
3. Redeploy

PASSO 4 — Bruna aplica migration via Supabase MCP:
   supabase/migrations/20260519_calculadora_pro_purchases.sql

PASSO 5 — Felipe implementa:
- app/api/webhooks/stripe-calc-pro/route.ts (spec na seção 4)
- services/email.ts adicionar sendCalculadoraProAcesso (spec seção 6)
- app/calculadora/pro/page.tsx (página de venda com copy Carla)
- app/calculadora/pro/sucesso/page.tsx (success page após Stripe redirect)
- Modal paywall em app/calculadora/page.tsx quando user clica "Exportar PDF"
```

---

## Related

- `marketing/calculadora-pro/copy-paywall.md` — copy Carla (página venda + paywall + email)
- `strategy/decisoes-resolvidas-2026-05-18.md` — Decisão Helena
- `app/api/webhooks/payment/route.ts` — handler de catálogo (referência pattern)
- `supabase/migrations/20260518_webhook_events.sql` — tabela reutilizada pra idempotência
- `services/email.ts` — wrapper Resend existente
- `.env.example` — adicionar as 2 env vars

## Fontes externas consultadas (2026-05-18)

- [Stripe Pix Payments](https://docs.stripe.com/payments/pix) — confirmado: Payment Links suportam PIX
- [Stripe Boleto Payments](https://docs.stripe.com/payments/boleto/accept-a-payment) — boleto via Checkout/Payment Link, requires_action event
- [Stripe Metadata](https://docs.stripe.com/metadata) — metadata propaga em `checkout.session.completed`
- [Stripe Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices) — princípio "signature antes de tudo" (memória ativa Paulo)
