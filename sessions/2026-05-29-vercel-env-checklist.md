# Checklist Vercel Env Vars — Bloco 1.3
> Settar via Vercel Dashboard -> Project -> Settings -> Environment Variables
> Data: 2026-05-29 | Responsavel: Ricardo (DevOps G7)
> Referencia: `.env.example` completo (153 linhas, 21 vars ativas)

---

## CRITICAS (9 vars)

> Prod quebra ou fica inseguro sem estas. Settar antes de qualquer deploy publico.

| Var | Scope | Sensitive | Source | Status |
|-----|-------|-----------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production + Preview + Development | No | Supabase Dashboard -> Settings -> API -> Project URL | ⬜ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production + Preview + Development | No | Supabase Dashboard -> Settings -> API Keys -> "anon public" | ⬜ |
| `SUPABASE_SERVICE_ROLE_KEY` | Production + Preview | Yes | Supabase Dashboard -> Settings -> API Keys -> "service_role" (Legacy) | ⬜ |
| `NEXT_PUBLIC_APP_URL` | Production | No | Valor: `https://hayzer.com.br` (prod) / `https://bvaz-hub.vercel.app` (preview fallback) | ⬜ |
| `WAITLIST_IP_SALT` | Production + Preview | Yes | Gerar: `openssl rand -hex 32` (ja setado em 14/05, confirmar se ainda esta la) | ⬜ |
| `STRIPE_SECRET_KEY` | Production | Yes | Stripe Dashboard -> Developers -> API Keys -> "Secret key" (sk_live_...) | ⬜ |
| `STRIPE_WEBHOOK_SECRET` | Production | Yes | Stripe Dashboard -> Developers -> Webhooks -> endpoint hayzer.com.br -> "Signing secret" (whsec_...) | ⬜ |
| `STRIPE_CONNECT_CLIENT_ID` | Production | Yes | Stripe Dashboard -> Settings -> Connect -> "Client ID" (ca_...) | ⬜ |
| `ADMIN_EMAILS` | Production + Preview | No | Valor: `3dresolucaoo@gmail.com` (adicionar outros admins separados por virgula quando necessario) | ⬜ |

---

## IMPORTANTES (8 vars)

> Produto funciona sem elas, mas observabilidade, email transacional ou pagamento MP ficam desligados.

| Var | Scope | Sensitive | Source | Status |
|-----|-------|-----------|--------|--------|
| `RESEND_API_KEY` | Production | Yes | Resend Dashboard (resend.com) -> API Keys -> Create Token. **Pre-requisito: dominio hayzer.com.br verificado no Resend antes de gerar a key.** | ⬜ |
| `RESEND_FROM_EMAIL` | Production + Preview | No | Valor: `ola@hayzer.com.br` (so funciona apos SPF/DKIM/DMARC configurados no Registro.br) | ⬜ |
| `DISCORD_WEBHOOK_CRITICO` | Production | Yes | Discord -> Servidor "Hayzer Ops" -> canal #critico -> Configuracoes do Canal -> Integrações -> Webhooks -> Copiar URL | ⬜ |
| `DISCORD_WEBHOOK_DIGEST` | Production | Yes | Discord -> Servidor "Hayzer Ops" -> canal #digest -> Configuracoes do Canal -> Integrações -> Webhooks -> Copiar URL | ⬜ |
| `MP_CLIENT_ID` | Production | No | Mercado Pago Developers -> Suas aplicacoes -> app Marketplace -> Credenciais -> Client ID | ⬜ |
| `MP_CLIENT_SECRET` | Production | Yes | Mercado Pago Developers -> Suas aplicacoes -> app Marketplace -> Credenciais -> Client Secret | ⬜ |
| `MP_ACCESS_TOKEN` | Production | Yes | Mercado Pago Developers -> Suas aplicacoes -> app Marketplace -> Credenciais -> Access Token (APP_USR-...) | ⬜ |
| `MP_WEBHOOK_SECRET` | Production | Yes | Mercado Pago Developers -> Suas aplicacoes -> Notificacoes -> Webhook Secret (gerado ao configurar endpoint) | ⬜ |

---

## OPCIONAIS / FALLBACK (4 vars)

> Deixar slot criado no Vercel com valor vazio. Produto funciona sem elas agora — preencher na data indicada.

| Var | Scope | Sensitive | Source | Quando preencher |
|-----|-------|-----------|--------|-----------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Production + Preview | No | Sentry.io -> Project hayzer-prod -> Settings -> Client Keys -> DSN | ADR-017: aplicar 17/06/2026 |
| `SENTRY_AUTH_TOKEN` | Production | Yes | Sentry.io -> Settings -> Auth Tokens -> Create Token (escopos: project:write, org:read) | ADR-017: aplicar 17/06/2026 |
| `NEXT_PUBLIC_WHATSAPP_GROUP_URL` | Production + Preview | No | CEO cria grupo "Hayzer Beta" no WhatsApp e copia link chat.whatsapp.com/... | Antes do soft launch 11/06 |
| `API_RATE_LIMIT_SALT` | Production | Yes | Gerar: `openssl rand -hex 32` (se vazio, cai pro WAITLIST_IP_SALT — OK pra inicio, recomendado separar) | Antes do launch publico 27/06 |

---

## JA SETADAS (verificadas no .env.local local)

Estas provavelmente ja existem no Vercel (setadas em 14/05/2026 ou depois). Confirmar na aba Environment Variables do dashboard — se nao aparecerem, recriar.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `ADMIN_EMAILS`
- `WAITLIST_IP_SALT` (comentario no .env.example confirma: "valor random 32 bytes hex ja setado em 14/05/2026")
- `NEXT_PUBLIC_POSTHOG_KEY` (ATIVO desde 2026-05-19 — confirmar se esta no Vercel)
- `NEXT_PUBLIC_POSTHOG_HOST` (idem)
- `MP_SANDBOX` (valor: `false` em prod)
- `PAYMENT_PROVIDER` (valor: `mercadopago`)

---

## Vars comentadas no .env.example (ignorar agora)

Estas estao comentadas e sao para integracoes futuras. NAO criar slots ainda — evitar poluicao.

- `BLING_CLIENT_ID` / `BLING_CLIENT_SECRET` — NFS-e, futuro
- `IG_ACCESS_TOKEN` / `IG_BUSINESS_ACCOUNT_ID` — Instagram, futuro
- `YT_API_KEY` — YouTube, futuro
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — rate limit Redis, Fase 1 semana 2
- `SENTRY_ORG` / `SENTRY_PROJECT` — settar junto com Sentry em 17/06 (valores: `hayzer` / `hayzer-prod`)

---

## Alertas para o CEO

**ALERTA 1 — MP_WEBHOOK_SECRET pode nao existir ainda:**
O `.env.example` tem `MP_WEBHOOK_SECRET=` (valor vazio). Mas o painel MP esta com OAuth bloqueado desde 07/05 (bug reportado no CLAUDE.md). Antes de setar esta var em prod, alinhar com Paulo (Financial) se o endpoint de webhook MP ja esta configurado em `https://hayzer.com.br/api/webhooks/mercadopago`. Se nao estiver, setar a var agora nao resolve nada — o webhook vai chegar sem validacao de assinatura. Prioridade: Stripe cobre isso por enquanto.

**ALERTA 2 — Dois salts precisam de openssl, nao e so copiar:**
`WAITLIST_IP_SALT` e `API_RATE_LIMIT_SALT` precisam ser gerados com `openssl rand -hex 32` — valores aleatorios de 32 bytes hex. NAO reusar o mesmo valor pros dois (defense in depth). Se precisar gerar sem openssl instalado, alternativa: https://generate.plus/en/base64 -> 32 bytes -> hex encode. Confirmar que o WAITLIST_IP_SALT setado em 14/05 ainda esta la antes de sobrescrever.

**ALERTA 3 — SENTRY_DSN tem duas vars distintas (public + server):**
`NEXT_PUBLIC_SENTRY_DSN` vai pro client (scope: Production + Preview, nao sensitive). `SENTRY_AUTH_TOKEN` e server-only (sensitive: yes, nunca NEXT_PUBLIC_). Nao confundir os dois ao setar — DSN vazar e OK (e publico por design do Sentry), token vazar e problema grave.
