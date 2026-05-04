# ADR 001 — Mercado Pago: Marketplace ao invés de CheckoutPro

> **Data**: 2026-04-28
> **Status**: 🟡 Pendente (app atual está como CheckoutPro — precisa criar Marketplace)
> **Custo de reversão**: Alto (mudaria toda arquitetura de OAuth)

---

## Contexto

BVaz Hub é um SaaS onde **cada usuário** conecta **sua própria conta** do Mercado Pago para receber pagamentos dos seus clientes. Quando um cliente compra no catálogo público de um usuário, o dinheiro vai direto pra conta MP do **dono do catálogo** — não pra conta da BVaz.

Isso é tecnicamente o modelo **Marketplace** do Mercado Pago, onde a plataforma intermedia mas não recebe.

---

## Alternativas consideradas

### A) CheckoutPro com credenciais estáticas (atual)
- Plataforma usa **suas próprias** credenciais MP
- Todos pagamentos caem na conta da plataforma
- Plataforma teria que repassar pros usuários manualmente
- ❌ Não escala, problema fiscal, atrito

### B) Marketplace + OAuth2 (escolhido)
- Cada usuário autoriza BVaz a operar **em nome dele** via OAuth2
- BVaz recebe `access_token` + `refresh_token` do usuário
- Pagamentos caem direto na conta MP do usuário
- BVaz pode pegar **comissão** via `marketplace_fee` na preference
- ✅ Escalável, padrão do mercado, modelo Shopify/Hotmart

### C) Pagamentos por cartão direto (Stripe Connect-style)
- Mais complexo no MP brasileiro
- Stripe Connect funcionaria, mas BR tem MP como dominante
- ❌ Excluído por viabilidade

---

## Decisão

Usar **OAuth2 Marketplace** do Mercado Pago.

Implementado:
- `services/paymentConfig.ts` armazena tokens por usuário em `payment_configs`
- `services/mpTokenRefresh.ts` faz refresh automático ~5 min antes de expirar
- `app/api/integrations/mercadopago/{connect,callback}/route.ts` faz fluxo OAuth
- `payments/mercadopago.ts` cria preference usando `accessToken` do merchant

Pendente:
- Criar app **Marketplace** no MP Developer Portal (atual `1122266758341703` é CheckoutPro)
- Configurar redirect URI no novo app
- Atualizar `MP_CLIENT_ID` e `MP_CLIENT_SECRET` no Vercel

---

## Consequências

✅ **Positivas**
- Cada usuário gerencia sua própria conta MP
- BVaz Hub não toca dinheiro de ninguém (compliance fácil)
- Refresh token automático = usuário conecta uma vez e funciona ~6 meses
- Padrão escalável pra outras integrações OAuth (Bling, Google, Instagram seguem mesmo template)

❌ **Negativas / Trade-offs**
- Onboarding extra: usuário precisa autorizar antes de vender (mais 1 click)
- Dependência da disponibilidade do MP OAuth endpoint
- Refresh failure = pagamento bloqueado até reconnect manual

🔧 **Mitigações**
- UI mostra status conexão (✅ Conectado / ⚠️ Token expira em N dias / ❌ Reconectar)
- Fallback manual: usuário pode colar `access_token` direto (sem OAuth) — mantém backdoor
- Avisar usuário 7 dias antes do refresh token expirar (pra recapturar consentimento)

---

## Referências

- [Docs MP Marketplace](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integration-configuration/integration-via-marketplace)
- Implementação: `services/paymentConfig.ts`, `payments/mercadopago.ts`
- Próximas integrações OAuth seguem este padrão: ver `services/mpTokenRefresh.ts` como template
