# Smoke Test — Webhook Stripe Sandbox (Bloco 1.6)

**Data**: 2026-05-29
**Endpoint**: `POST /api/webhooks/payment?merchant=<MERCHANT_UUID>`
**Handler**: `app/api/webhooks/payment/route.ts`
**Provider**: `payments/stripe.ts` (via factory `stripeProvider`)

---

## Pre-requisitos

| Item | Onde configurar |
|---|---|
| `STRIPE_WEBHOOK_SECRET` | `.env.local` — valor `whsec_...` do Stripe CLI ou do endpoint registrado no Dashboard |
| `merchant_id` (UUID) | Supabase: `payment_configs` — `user_id` de um registro ativo com `provider = 'stripe'` e `is_active = true` |
| `project_id` (UUID) | Supabase: `projects` — projeto associado ao merchant acima |
| `product_id` (UUID) | Supabase: `products` — produto real ou UUID ficticio valido (pode ser null-safe, handler aceita ausencia) |

---

## 1. Payload minimo valido (`checkout.session.completed`)

O handler so processa `event.type === 'checkout.session.completed'` com `payment_status === 'paid'`.

```json
{
  "id": "evt_smoke_test_001",
  "object": "event",
  "api_version": "2026-03-25.dahlia",
  "created": 1748476800,
  "livemode": false,
  "pending_webhooks": 1,
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_smoke_001",
      "object": "checkout.session",
      "payment_status": "paid",
      "status": "complete",
      "mode": "payment",
      "currency": "brl",
      "amount_total": 4900,
      "customer_details": {
        "name": "Cliente Smoke Test",
        "email": "smoke@hayzer.com.br"
      },
      "metadata": {
        "bvaz_product_id": "<PRODUCT_UUID_OR_EMPTY>",
        "bvaz_quantity": "1",
        "bvaz_customer_name": "Cliente Smoke Test",
        "bvaz_whatsapp": "11999999999",
        "bvaz_catalog_slug": "catalogo-teste",
        "bvaz_merchant_id": "<MERCHANT_UUID>",
        "bvaz_project_id": "<PROJECT_UUID>"
      }
    }
  }
}
```

Notas sobre o payload:
- `id` do evento (`evt_...`) e `id` da session (`cs_test_...`) devem ser **unicos a cada run** — a tabela `webhook_events` tem constraint `UNIQUE (provider, event_id)`. Para re-rodar o teste, mude o sufixo numerico (`evt_smoke_test_002`, etc).
- `bvaz_merchant_id` deve ser identico ao `?merchant=` da URL (cross-merchant check no handler, linha 115).
- `bvaz_product_id` pode ser um UUID inexistente — o handler faz `maybeSingle()` e usa `0` como `orderValue` se o produto nao for encontrado. Preencher com UUID real para testar production task.

---

## 2. Como gerar o header `Stripe-Signature`

O Stripe SDK verifica o header via HMAC-SHA256 do payload usando o formato:

```
t=<timestamp>,v1=<hmac>
```

Onde:
- `<timestamp>` = Unix timestamp em segundos (deve estar dentro de 300s do horario atual — tolerancia padrao do Stripe)
- O conteudo assinado e: `<timestamp>.<rawBody>`
- `<hmac>` = HMAC-SHA256 hex de `<timestamp>.<rawBody>` com a chave `STRIPE_WEBHOOK_SECRET`

### Gerando com Node.js (one-liner para copiar no terminal)

```bash
node -e "
const crypto = require('crypto');
const fs = require('fs');

const secret = process.env.STRIPE_WEBHOOK_SECRET; // ex: whsec_test_abc123
const payload = fs.readFileSync('./sessions/stripe-smoke-payload.json', 'utf8').trim();
const timestamp = Math.floor(Date.now() / 1000);
const signed = timestamp + '.' + payload;
const hmac = crypto.createHmac('sha256', secret.replace('whsec_', '')).update(signed).digest('hex');

console.log('Timestamp:', timestamp);
console.log('Signature header:', 't=' + timestamp + ',v1=' + hmac);
"
```

Salve o JSON do payload na secao 1 em `sessions/stripe-smoke-payload.json` (substituindo os placeholders), depois rode o comando acima com `STRIPE_WEBHOOK_SECRET` exportado no ambiente.

### Alternativa: Stripe CLI (recomendada para sandbox)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/payment?merchant=<MERCHANT_UUID>
stripe trigger checkout.session.completed
```

O CLI gera o header automaticamente e injeta um payload real de sandbox. Nao precisa do HMAC manual.

---

## 3. Comando `curl` completo

Substitua os placeholders antes de rodar:

```bash
# ── Variaveis (ajustar) ──────────────────────────────────────────────────────
MERCHANT_UUID="<MERCHANT_UUID>"          # user_id do registro em payment_configs
STRIPE_WEBHOOK_SECRET="<whsec_...>"      # sem prefixo "whsec_" no calculo HMAC
BASE_URL="http://localhost:3000"          # ou https://bvaz-hub.vercel.app pra testar em preview
EVENT_ID="evt_smoke_test_001"             # incrementar a cada run
SESSION_ID="cs_test_smoke_001"            # idem
PROJECT_UUID="<PROJECT_UUID>"
PRODUCT_UUID="<PRODUCT_UUID_OR_LEAVE_EMPTY>"

# ── Monta payload ────────────────────────────────────────────────────────────
PAYLOAD=$(cat <<EOF
{"id":"${EVENT_ID}","object":"event","api_version":"2026-03-25.dahlia","created":$(date +%s),"livemode":false,"pending_webhooks":1,"type":"checkout.session.completed","data":{"object":{"id":"${SESSION_ID}","object":"checkout.session","payment_status":"paid","status":"complete","mode":"payment","currency":"brl","amount_total":4900,"customer_details":{"name":"Cliente Smoke Test","email":"smoke@hayzer.com.br"},"metadata":{"bvaz_product_id":"${PRODUCT_UUID}","bvaz_quantity":"1","bvaz_customer_name":"Cliente Smoke Test","bvaz_whatsapp":"11999999999","bvaz_catalog_slug":"catalogo-teste","bvaz_merchant_id":"${MERCHANT_UUID}","bvaz_project_id":"${PROJECT_UUID}"}}}}
EOF
)

# ── Gera Stripe-Signature ────────────────────────────────────────────────────
TIMESTAMP=$(date +%s)
SIGNED_PAYLOAD="${TIMESTAMP}.${PAYLOAD}"
HMAC=$(echo -n "$SIGNED_PAYLOAD" | openssl dgst -sha256 -hmac "${STRIPE_WEBHOOK_SECRET#whsec_}" | awk '{print $2}')
SIG_HEADER="t=${TIMESTAMP},v1=${HMAC}"

# ── Dispara o request ────────────────────────────────────────────────────────
curl -v \
  -X POST \
  "${BASE_URL}/api/webhooks/payment?merchant=${MERCHANT_UUID}" \
  -H "Content-Type: application/json" \
  -H "stripe-signature: ${SIG_HEADER}" \
  -d "${PAYLOAD}"
```

Resposta esperada em sucesso: `HTTP 200` com body `{"received":true}`.

---

## 4. O que esperar (fluxo interno)

```
curl POST /api/webhooks/payment?merchant=<UUID>
  |
  ├── [1] Valida ?merchant= (UUID regex)
  ├── [2] Le rawBody (Buffer — necessario pra HMAC)
  ├── [3] getPaymentProvider(merchantId, { bypassCache: true })
  │       └── paymentConfigService.getActiveConfig()  →  payment_configs (admin client)
  ├── [4] stripeProvider.parseWebhook(rawBody, headers)
  │       └── stripe.webhooks.constructEvent()  →  valida Stripe-Signature
  ├── [5] Ignora eventos nao-approved (payment_status != 'paid' → null)
  ├── [6] Cross-merchant check: bvaz_merchant_id == ?merchant=
  ├── [7] SELECT products WHERE id = bvaz_product_id  (admin, maybeSingle)
  └── [8] admin.rpc('process_webhook_atomic', { ... })
            ├── INSERT webhook_events (provider='stripe', event_id='cs_test_...')
            │   └── UNIQUE(provider, event_id) — lock idempotente
            ├── INSERT orders (status='paid', source='catalog', payment_status='paid')
            ├── INSERT production  (se product_id != null e produto encontrado)
            └── INSERT transactions (finance record)
            └── RETURNS { status: 'ok', order_id: '...' }
```

Segundo envio com mesmo `event_id` retorna `{ status: 'duplicate' }` — sem escrita.

---

## 5. Queries SQL de verificacao (Supabase)

Cole no SQL Editor do Supabase Dashboard ou via MCP `execute_sql`.

### 5.1 Verificar registro do evento (idempotency lock)

```sql
SELECT
  id,
  provider,
  event_id,
  event_type,
  created_at
FROM webhook_events
WHERE provider = 'stripe'
  AND event_id IN ('cs_test_smoke_001', 'cs_test_smoke_002')  -- ajustar pelos IDs usados
ORDER BY created_at DESC
LIMIT 10;
```

### 5.2 Verificar order criada

```sql
SELECT
  id,
  project_id,
  user_id,          -- deve ser igual ao merchant_id
  client_name,
  item,
  value,
  status,
  payment_status,
  source,
  catalog_slug,
  payment_id,
  customer_whatsapp,
  created_at
FROM orders
WHERE payment_id IN ('cs_test_smoke_001', 'cs_test_smoke_002')
ORDER BY created_at DESC;
```

### 5.3 Verificar production task criada (se product_id valido)

```sql
SELECT
  id,
  project_id,
  user_id,
  item,
  status,
  created_at
FROM production
WHERE project_id = '<PROJECT_UUID>'
ORDER BY created_at DESC
LIMIT 5;
```

### 5.4 Verificar finance transaction criada

```sql
SELECT
  id,
  project_id,
  user_id,
  type,
  category,
  description,
  value,
  date,
  created_at
FROM transactions
WHERE project_id = '<PROJECT_UUID>'
ORDER BY created_at DESC
LIMIT 5;
```

### 5.5 Teste de idempotencia (deve retornar apenas 1 linha em webhook_events)

```sql
-- Envie o mesmo payload 2x e confirme que so existe 1 linha:
SELECT COUNT(*) AS total_eventos
FROM webhook_events
WHERE provider = 'stripe'
  AND event_id = 'cs_test_smoke_001';
-- Esperado: 1
```

---

## 6. Casos de falha esperados (respostas corretas do handler)

| Cenario | Header `stripe-signature` | Resposta |
|---|---|---|
| Assinatura invalida / secret errado | presente mas HMAC invalido | `HTTP 200 {"received":true}` (Stripe nao retentar — parseWebhook retorna null) |
| `?merchant=` ausente | — | `HTTP 200 {"received":true}` (guard linha 74) |
| `?merchant=` nao UUID | — | `HTTP 200 {"received":true}` (guard linha 79) |
| `bvaz_merchant_id` diferente do `?merchant=` | valida | `HTTP 200 {"received":true}` (cross-merchant check linha 115) |
| `payment_status` != `paid` | valida | `HTTP 200 {"received":true}` (status != approved) |
| Evento repetido (mesmo `event_id`) | valida | `HTTP 200 {"received":true}` + log "Duplicate event ignored" |
| RPC falha (DB indisponivel) | valida | `HTTP 500` → Stripe retentar automaticamente |
| Provider sem config ativa no DB | valida | `HTTP 500` (erro no factory) → Stripe retentar |

---

## 7. Checklist de execucao

- [ ] `.env.local` tem `STRIPE_WEBHOOK_SECRET` preenchido
- [ ] Existe registro em `payment_configs` com `user_id = <MERCHANT_UUID>`, `provider = 'stripe'`, `is_active = true`, `webhook_secret` preenchido
- [ ] `dev` rodando (`npm run dev`)
- [ ] Substituiu todos os `<PLACEHOLDERS>` no curl
- [ ] Rodou o curl → recebeu `HTTP 200 {"received":true}`
- [ ] Query 5.1 retorna 1 linha em `webhook_events`
- [ ] Query 5.2 retorna 1 linha em `orders` com `payment_status = 'paid'`
- [ ] Query 5.4 retorna 1 linha em `transactions`
- [ ] (se product_id valido) Query 5.3 retorna 1 linha em `production`
- [ ] Segundo envio identico retorna `HTTP 200` e query 5.5 ainda conta 1 (idempotencia OK)

---

## Dependencias resumidas

- `STRIPE_WEBHOOK_SECRET` no `.env.local` (valor `whsec_...` do CLI ou Dashboard Stripe)
- `merchant_id` valido: UUID existente em `payment_configs` com `provider='stripe'`, `is_active=true`
- `project_id` valido: UUID existente em `projects` associado ao merchant
- RPC `process_webhook_atomic` aplicada em prod (migration `20260518_webhook_events.sql`)
