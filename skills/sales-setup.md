# /sales:setup

Valida e configura fluxo de vendas completo.

## INPUT
```
/sales:setup [problema ou "full check"]
```

## FLUXO DE VENDA
```
Cliente vê catálogo
  → Seleciona produto
    → Checkout (Stripe ou manual)
      → Pedido criado em orders
        → Webhook confirma pagamento
          → Status atualizado
            → Estoque deduzido
              → Produção iniciada
                → Financeiro registrado
```

## ARQUIVOS RELEVANTES
```
app/catalogo/[slug]/page.tsx    → entrada do cliente
app/checkout/page.tsx           → checkout
app/api/checkout/route.ts       → criar sessão Stripe
app/api/webhooks/stripe/route.ts → confirmar pagamento
services/orders.ts              → criação de pedido
services/payments.ts            → integração Stripe
```

## PROTOCOLO

### 1. CATÁLOGO → CHECKOUT
- [ ] Produto tem `stripe_price_id` ou preço manual?
- [ ] Botão "comprar" envia `product_id` + `project_id`?
- [ ] `/api/checkout` cria sessão com metadata correto?

### 2. STRIPE WEBHOOK
- [ ] Rota `/api/webhooks/stripe` existe?
- [ ] Valida `stripe.webhooks.constructEvent`?
- [ ] Ao `payment_intent.succeeded`: atualiza order status?
- [ ] Ao `checkout.session.completed`: cria order se não existe?

### 3. ORDER → DOWNSTREAM
- [ ] `orders.ts` → `createOrder` deduz estoque?
- [ ] `orders.ts` → `createOrder` cria `production` item?
- [ ] `orders.ts` → `createOrder` cria `transaction`?

### 4. CONFIGURAÇÃO STRIPE
- [ ] `STRIPE_SECRET_KEY` no .env?
- [ ] `STRIPE_WEBHOOK_SECRET` no .env?
- [ ] Webhook endpoint registrado no Stripe dashboard?

## SAÍDA
```
CATÁLOGO: ✓/✗
CHECKOUT: ✓/✗
WEBHOOK: ✓/✗
DOWNSTREAM: ✓/✗
BLOQUEADORES: [lista]
```
