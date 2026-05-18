# Curls de Teste — Webhook /api/webhooks/payment

> Ambiente: produção (`hayzer.com.br`) e local (`localhost:3000`).
> Todos os exemplos usam `MERCHANT_ID` como placeholder — substituir pelo UUID real do merchant.
>
> **Importante**: assinaturas Stripe e MP são verificadas pelo provider antes de qualquer lógica.
> Para testes de idempotência em local, use o Stripe CLI (event forwarding com assinatura real)
> ou o script MP abaixo com um `webhookSecret` de teste.

---

## 1. Stripe — Evento aprovado (primeiro envio)

```bash
# Pré-requisito: Stripe CLI instalado e autenticado
# stripe listen --forward-to localhost:3000/api/webhooks/payment?merchant=<MERCHANT_ID>

# Dispara checkout.session.completed via CLI:
stripe trigger checkout.session.completed \
  --add checkout_session:metadata.bvaz_merchant_id=<MERCHANT_ID> \
  --add checkout_session:metadata.bvaz_project_id=<PROJECT_ID> \
  --add checkout_session:metadata.bvaz_product_id=<PRODUCT_UUID> \
  --add checkout_session:metadata.bvaz_quantity=1 \
  --add checkout_session:metadata.bvaz_customer_name="Rafael Maker" \
  --add checkout_session:metadata.bvaz_whatsapp="11999990000" \
  --add checkout_session:metadata.bvaz_catalog_slug="catalogo-rafael"
```

Resposta esperada: `200 { "received": true }`
Log esperado: `[webhook/payment] Order created OK | orderId=order-... | paymentId=cs_... | merchantId=...`

---

## 2. Stripe — Mesmo evento reenviado (idempotência)

```bash
# Reenviar o mesmo evento com o mesmo paymentId (cs_test_...) que foi processado acima.
# Com Stripe CLI, usar o ID do evento anterior:
stripe events resend <evt_id>
```

Resposta esperada: `200 { "received": true }` (ack silencioso)
Log esperado: `[webhook/payment] Duplicate event ignored (idempotent) | paymentId=cs_... | merchantId=...`
Garantia: nenhum registro novo em `orders`, `production`, `transactions` ou `webhook_events`.

---

## 3. Stripe — Assinatura inválida (deve retornar 200 ack silencioso)

```bash
# parseWebhook retorna null quando assinatura é inválida.
# O handler interpreta null como evento não processável e retorna 200 silencioso.
# Nenhuma escrita no DB. Stripe não reprocessa.
curl -s -X POST \
  "https://hayzer.com.br/api/webhooks/payment?merchant=<MERCHANT_ID>" \
  -H "Content-Type: application/json" \
  -H "stripe-signature: t=1000,v1=invalida" \
  -d '{"type":"checkout.session.completed","data":{"object":{"id":"cs_fake"}}}' \
  | jq .
```

Resposta esperada: `200 { "received": true }`

---

## 4. Mercado Pago — Evento aprovado (primeiro envio)

```bash
# Variáveis de ambiente necessárias:
#   MP_WEBHOOK_SECRET — segredo configurado no dashboard MP
#   MP_ACCESS_TOKEN   — access token do merchant

# Montar a assinatura HMAC corretamente:
#   manifest = "id:<data_id>;request-id:<req_id>;ts:<epoch_ms>;"
#   v1 = HMAC-SHA256(manifest, MP_WEBHOOK_SECRET)

DATA_ID="123456789"
REQ_ID="test-req-$(date +%s)"
TS=$(date +%s000)
SECRET="<MP_WEBHOOK_SECRET>"

MANIFEST="id:${DATA_ID};request-id:${REQ_ID};ts:${TS};"
V1=$(echo -n "$MANIFEST" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')

curl -s -X POST \
  "https://hayzer.com.br/api/webhooks/payment?merchant=<MERCHANT_ID>" \
  -H "Content-Type: application/json" \
  -H "x-signature: ts=${TS},v1=${V1}" \
  -H "x-request-id: ${REQ_ID}" \
  -d "{\"type\":\"payment\",\"data\":{\"id\":\"${DATA_ID}\"}}" \
  | jq .
```

> **Nota**: o provider MP busca o pagamento em `GET /v1/payments/<data_id>` com o access token.
> Em ambiente de teste, usar um `data_id` real de um pagamento aprovado em sandbox.

Resposta esperada: `200 { "received": true }`
Log esperado: `[webhook/payment] Order created OK | orderId=order-... | paymentId=<data_id> | merchantId=...`

---

## 5. Mercado Pago — Evento duplicado (idempotência)

```bash
# Reenviar exatamente o mesmo DATA_ID com assinatura válida nova.
# A RPC process_webhook_atomic detecta (provider='mercadopago', event_id=DATA_ID)
# já existente em webhook_events e retorna { status: 'duplicate' }.

# Reutilizar as variáveis do curl anterior, apenas gerando novo TS e V1:
TS=$(date +%s000)
MANIFEST="id:${DATA_ID};request-id:${REQ_ID};ts:${TS};"
V1=$(echo -n "$MANIFEST" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')

curl -s -X POST \
  "https://hayzer.com.br/api/webhooks/payment?merchant=<MERCHANT_ID>" \
  -H "Content-Type: application/json" \
  -H "x-signature: ts=${TS},v1=${V1}" \
  -H "x-request-id: ${REQ_ID}" \
  -d "{\"type\":\"payment\",\"data\":{\"id\":\"${DATA_ID}\"}}" \
  | jq .
```

Resposta esperada: `200 { "received": true }` (ack silencioso)
Log esperado: `[webhook/payment] Duplicate event ignored (idempotent) | paymentId=<data_id> | merchantId=...`

---

## 6. Merchant ID ausente (deve retornar 200 ack silencioso)

```bash
curl -s -X POST \
  "https://hayzer.com.br/api/webhooks/payment" \
  -H "Content-Type: application/json" \
  -d '{}' \
  | jq .
```

Resposta esperada: `200 { "received": true }`
Log esperado: `[webhook/payment] Missing ?merchant= query param`

---

## 7. Verificar ausência de duplicata no banco

```sql
-- Rodar no SQL Editor do Supabase após testes de idempotência:

-- Checar que só existe 1 registro em webhook_events por evento:
SELECT provider, event_id, count(*)
FROM webhook_events
GROUP BY provider, event_id
HAVING count(*) > 1;
-- Deve retornar 0 linhas

-- Checar orders criadas nos últimos 5 min:
SELECT id, payment_id, client_name, value, created_at
FROM orders
WHERE created_at > now() - interval '5 minutes'
ORDER BY created_at DESC;

-- Checar que processed_at foi setado (evento processado com sucesso):
SELECT provider, event_id, processed_at
FROM webhook_events
WHERE created_at > now() - interval '5 minutes'
ORDER BY created_at DESC;
```
