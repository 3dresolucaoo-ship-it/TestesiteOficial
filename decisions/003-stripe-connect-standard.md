# ADR 003 — Stripe Connect Standard ao invés de Express/Custom

> **Data**: 2026-05-07
> **Status**: ✅ Implementado (rotas + UI prontas; falta config env vars no Vercel)
> **Custo de reversão**: Médio — mudar pra Express requer adicionar account_link flow + onboarding tracking

---

## Contexto

BVaz Hub agora aceita **Stripe** como provider de pagamento alternativo ao Mercado Pago. Mesma lógica multi-tenant do MP: cada usuário conecta sua própria conta Stripe e recebe pagamentos direto, sem passar pela conta da plataforma.

Stripe Connect oferece 3 tipos de conta:
- **Standard** — usuário gerencia 100% no painel Stripe próprio
- **Express** — Stripe hospeda onboarding, BVaz controla parcialmente
- **Custom** — BVaz constrói toda UI de onboarding/dashboard

---

## Alternativas consideradas

### A) Standard (escolhido)
- Usuário usa **conta Stripe própria** já existente (ou cria fácil)
- OAuth2 igualzinho ao MP — `connect.stripe.com/oauth/authorize`
- Tokens de acesso **não expiram** (sem refresh flow)
- Onboarding 100% no painel Stripe (zero código nosso)
- ✅ Implementação **idêntica ao padrão MP** já existente
- ❌ Menos branded — usuário sai pro painel Stripe pra ver detalhes

### B) Express
- Stripe hospeda onboarding, mas redireciona pra BVaz depois
- Requer `account_link` API + tracking de status (`details_submitted`)
- BVaz precisa polling/webhook pra saber quando conta está pronta
- ✅ Mais branded
- ❌ Código adicional, mais state pra gerenciar
- ❌ Requer `Stripe-Account` header em toda chamada API

### C) Custom
- BVaz constrói onboarding inteiro
- Requer compliance KYC, validação de documentos
- ✅ Controle total
- ❌ MUITO trabalho, requer responsabilidade legal extra

---

## Decisão

**Standard** porque:

1. **Simetria com MP**: arquitetura idêntica ao OAuth do Mercado Pago já implementado (`/api/integrations/mercadopago/{connect,callback}`). Mesmo `paymentConfigService.upsertOAuthConfig`. Mesmo padrão CSRF state cookie. Mesma UI ("Conectar com X" botão).
2. **Tokens não expiram**: zero código de refresh — o `mpTokenRefresh.ts` não tem equivalente Stripe e não precisa.
3. **Foco no produto**: BVaz não é dashboard de pagamentos — usuário pode usar o painel Stripe pra ver suas vendas em detalhe.
4. **Reversibilidade**: se quisermos Express depois, basta trocar URL de `oauth/authorize` por `account_links/create` + ajustar callback.

---

## Implicações

### ✅ Ganhos
- 1 rota `/api/integrations/stripe/connect` + 1 `/callback` = paridade total com MP
- Botão "Conectar com Stripe" funciona igual o do MP
- Form manual fallback para casos onde Connect não está configurado
- Mesmo `payment_configs` table — sem migration nova
- Mesmo `services/payments.ts:loadStripe` factory já existente
- `provider: 'stripe'` já no CHECK constraint do DB

### ⚠️ Limitações
- Toda chamada Stripe API precisa usar o `access_token` do connected account (já implementado no `payments/stripe.ts`)
- Webhook secret é por-conta (cada usuário precisa configurar manualmente um endpoint no painel Stripe próprio dele e colar o `whsec_...` no form manual da BVaz)
- Não há UI de onboarding integrada — usuário sai do BVaz pro Stripe pra criar conta se não tiver

### 🔧 Reuso de coluna no DB
- `payment_configs.mp_user_id` está sendo reaproveitada pra guardar `stripe_user_id` (formato `acct_...`). Funciona mas é ambíguo no schema.
- **TODO**: renomear `mp_user_id` → `provider_account_id` em migration futura quando adicionarmos terceiro provider OAuth.

---

## Configuração necessária

### Stripe Dashboard
1. https://dashboard.stripe.com/settings/connect/onboarding-options → ativar Connect (Standard)
2. Pegar **Client ID** (`ca_...`)
3. Cadastrar redirect URI: `${NEXT_PUBLIC_APP_URL}/api/integrations/stripe/callback`

### Vercel env vars
- `STRIPE_CONNECT_CLIENT_ID=ca_...`
- `STRIPE_SECRET_KEY=sk_test_...` ou `sk_live_...` (já era usada como fallback de provider)

---

## Related

- ADR 001 — MP Marketplace (mesmo padrão multi-tenant OAuth)
- `app/api/integrations/stripe/{connect,callback}/route.ts`
- `payments/stripe.ts` — provider implementation (já existia desde 2026-04)
- `services/paymentConfig.ts` — `upsertOAuthConfig` reutilizado
- `components/settings/StorefrontTab.tsx` — UI do botão + fallback manual
- ROADMAP.md § "Catálogo → Checkout"
