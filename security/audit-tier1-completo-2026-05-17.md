# Auditoria Tier 1 Completa + Plano Tier 2

> **Autor**: Otávio (Security Officer G7)
> **Data**: 2026-05-17
> **Trigger**: pós-configuração API_RATE_LIMIT_SALT + 3 Routines

## Tier 1 — Status: 95% fechado, 2 gaps menores

### 1. Rate-limit (services/apiRateLimit.ts) — VERDE com ressalva

**OK**:
- SHA-256(IP + salt) — LGPD-friendly, IP cru nunca toca DB
- Hash trunca em 32 chars
- Fail-OPEN bem documentado: se Supabase cair, request passa
- `recordApiHit` separado do `checkApiRateLimit`: payload inválido NÃO infla contador
- Aplicado em 3 rotas públicas: `/api/checkout` 20/min, `/api/encomenda` 20/min, `/api/catalog/quote` 10/min
- Header `Retry-After` correto nas respostas 429

**Gap 1 (Amarelo, não-bloqueante)**: chain de fallback do salt:
```
process.env.API_RATE_LIMIT_SALT ||
process.env.WAITLIST_IP_SALT ||
'hayzer-api-fallback-salt-troca-em-prod'
```
Em prod hoje OK (var setada). Risco em preview: existe se compartilharem env vars. **Recomendação pós-launch**: trocar fallback hardcoded por `throw` em `NODE_ENV === 'production'` se var ausente.

**Gap 2 (Amarelo)**: 4 rotas autenticadas (`/api/finance/*`, `/api/payment-configs`, `/api/admin/reconcile-transactions`) NÃO têm rate-limit. Tier 2 — adicionar rate-limit por **user_id** (não IP) com limite generoso (60/min) nas rotas autenticadas que escrevem.

### 2. Headers de segurança (next.config.ts) — VERDE com 1 ressalva

**OK**: HSTS 2 anos + includeSubDomains, X-Frame-Options DENY, nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy, CSP Report-Only com 12 directives.

**Gap 3 (Verde, observação)**: HSTS sem `preload`. Decisão correta — adicionar SÓ após validar todos subdomínios futuros.

**Gap 4 (Amarelo)**: CSP report-only **sem endpoint `report-uri`/`report-to`**. Sem isso, promover pra enforcing daqui 2-4 semanas é decisão sem dado.

### 3. Honeypot + time-check waitlist — VERDE

- Honeypot `name="website"` fora-da-tela, `aria-hidden=true`, `tabIndex={-1}`
- Bot detectado → retorna **success fake** (padrão correto)
- Time-check `MIN_FORM_FILL_MS = 2500` (2.5s entre render e submit)
- Edge case tratado: `renderTime === 0` deixa passar

**Nenhum gap aqui**.

### 4. CSP report-only — VERDE com Gap 4 acima

Score atual: ativo, observação adequada. `script-src` tem `'unsafe-inline'` aceitável temporariamente. Felipe deve abrir issue dedicada pra migração nonces no início de Onda 4.

### 5. Webhook signature MP — VERDE

- `webhookSecret` obrigatório, HMAC SHA-256 sobre manifest correto
- Header `x-signature` parseado em `ts` + `v1`
- Mismatch → return null (silent reject, ack 200)
- Stripe equivalente: SDK oficial `constructEvent` — gold standard
- Validação Zod no payment-configs: `webhookSecret >= 16` no salvar

### 6. Idempotência webhook — VERDE

- Tabela `webhook_events` com `UNIQUE (provider, event_id)` — lock atômico
- RPC `process_webhook_atomic` (SECURITY DEFINER + `search_path = ''`)
- `ON CONFLICT DO NOTHING` + `ROW_COUNT` → duplicate retorna sem efeito colateral
- Cross-merchant check: previne captura+troca de query string

**Padrão excelente, replay-safe, multi-process safe, multi-region safe.**

### 7. Middleware — VERDE

- Webhooks `/api/webhooks` no `PUBLIC_PATHS`
- Refresh session em todo request
- Try/catch envolvente: erro → redirect /login (fail-CLOSED)

### Sumário Tier 1
- 4 gaps identificados, **nenhum bloqueante**
- 3 gaps são Tier 2 (rate-limit em rotas auth, CSP report endpoint, fallback salt hardcoded)
- 1 gap é Tier 3 (HSTS preload)
- **Aprovado pra deploy importante**.

---

## Tier 2 — Plano semana 3 (a partir de 2026-05-25)

### Ordem de prioridade

| # | Item | Esforço | Quando | Por quê primeiro |
|---|---|---|---|---|
| 1 | Dependabot | 15 min | Seg 25/05 manhã | A03:2025 Supply Chain (NOVA top 10) |
| 2 | Sentry | 2h | Seg 25/05 tarde | Dependência pra item 3 + report-uri CSP |
| 3 | Audit log | 4h | Ter 26/05 | Compliance LGPD + forensics |
| 4 | Rate-limit rotas auth + CSP report endpoint | 2h | Qua 27/05 manhã | Fecha gap 2 e 4 |

**Reserva**: Qua tarde + qui = buffer. Total: 8h efetivo em ~3 dias.

### Item 1 — Dependabot (15 min)

**Arquivo**: `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "08:00"
      timezone: "America/Sao_Paulo"
    open-pull-requests-limit: 5
    reviewers:
      - "3dresolucaoo-ship-it"
    labels:
      - "dependencies"
      - "auto"
    groups:
      patches:
        update-types:
          - "patch"
      dev-dependencies:
        dependency-type: "development"
        update-types:
          - "minor"
          - "patch"
    ignore:
      - dependency-name: "next"
        update-types: ["version-update:semver-major"]
      - dependency-name: "react"
        update-types: ["version-update:semver-major"]
      - dependency-name: "react-dom"
        update-types: ["version-update:semver-major"]
      - dependency-name: "@supabase/*"
        update-types: ["version-update:semver-major"]
      - dependency-name: "stripe"
        update-types: ["version-update:semver-major"]
      - dependency-name: "zod"
        update-types: ["version-update:semver-major"]
      - dependency-name: "tailwindcss"
        update-types: ["version-update:semver-major"]

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "08:00"
      timezone: "America/Sao_Paulo"
    labels:
      - "github-actions"
      - "auto"
```

**Por que weekly**: 2-3 PRs/sem CEO revisa. Daily vira ruído.

### Item 2 — Sentry Next.js (2h)

**SDK**: `@sentry/nextjs` 8.x+ (App Router support estável).
**Custo plano gratuito**: 5.000 errors/mês — suficiente pra Fase 1 inteira.

**Setup approach**:
1. `npm install @sentry/nextjs` (15 min)
2. `npx @sentry/wizard@latest -i nextjs` (30 min review)
3. Env vars Vercel: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` (10 min)
4. Configurar `tracesSampleRate: 0.1` + `beforeSend` (30 min)
5. Wire-up `report-uri` do CSP apontando pra Sentry (15 min) — fecha Gap 4
6. Teste manual erro forçado (15 min)
7. Configurar alerta Slack/email pra P0 (15 min)

**Gotcha**: ~30KB ao bundle. Aceitável, monitorar via Speed Insights.

### Item 3 — Audit Log (4h)

**Tabela**:

```sql
-- supabase/migrations/20260525_audit_log.sql

CREATE TABLE IF NOT EXISTS audit_log (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  project_id    uuid        REFERENCES projects(id) ON DELETE SET NULL,
  action        text        NOT NULL,
  resource      text,
  before        jsonb,
  after         jsonb,
  ip_hash       text,
  user_agent    text,
  metadata      jsonb       DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_user_id_idx     ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS audit_log_project_id_idx  ON audit_log(project_id);
CREATE INDEX IF NOT EXISTS audit_log_action_idx      ON audit_log(action);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx  ON audit_log(created_at DESC);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select_own" ON audit_log
  FOR SELECT USING (auth.uid() = user_id);
```

**Ações a logar (ordem de criticidade)**:
1. **Auth (P0)**: login.success/failed, signup, password.reset, session.invalidated
2. **Payment (P0)**: config.upsert/delete/activate, webhook.received/duplicate/signature_invalid
3. **Order (P1)**: create, delete, status_change (paid → refunded)
4. **Admin (P1)**: reconcile_transactions, export_data
5. **Data deletion (P0 — LGPD)**: account.delete, lead.delete, inventory.bulk_delete

**NÃO logar**: reads, UI toggles, conteúdo de senhas, WhatsApp/email cru (só hash ou últimos 4 dígitos).

**Implementação (4h)**:
- 30min: migration aplicada
- 1h: helper `services/auditLog.ts`
- 2h: chamar em auth callbacks, webhook handler, payment-configs, orders
- 30min: doc em `services/CLAUDE.md`

**Bruna revisa antes do merge** (dona de RLS).

### Item 4 — Gaps Parte 1 (2h)

**4a. Rate-limit em rotas autenticadas** (1h):
- Helper `enforceUserRateLimit({ userId, endpoint, limit, windowMs })`
- Aplicar em `/api/payment-configs` 30/min/user
- Aplicar em `/api/finance/fixed-costs` 60/min/user

**4b. CSP report endpoint** (1h):
- Criar `/api/csp-report/route.ts` → loga no Sentry
- Atualizar `next.config.ts`: `report-uri /api/csp-report`
- Validar com Chrome CSP Evaluator

**Quando**: qua 27/05 manhã, depois Sentry funcionando.

### Não incluído nesta fase

- WAF Cloudflare (Tier 3, mês 3-6)
- MFA (Tier 3, pós-validação)
- Key rotation automatizada (Tier 3)
- Threat model pagamento (Paulo+Otávio, semana 4-5)
- Upstash Redis (esperar >5k req/dia, provavelmente semana 8+)

---

## Calendário sugerido semana 3 (25-29/05)

| Dia | Bloco | Tarefa | Owner |
|---|---|---|---|
| Seg 25/05 08:00 | 15 min | Dependabot config + PR | Otávio + CEO aprova |
| Seg 25/05 14:00 | 2h | Sentry setup + DSN | Otávio + Ricardo |
| Ter 26/05 09:00 | 2h | Audit log migration + helper | Otávio + Bruna revisa |
| Ter 26/05 14:00 | 2h | Wire-up audit log em auth/payment/webhooks | Otávio |
| Qua 27/05 09:00 | 1h | Rate-limit rotas auth | Otávio |
| Qua 27/05 10:00 | 1h | CSP report endpoint | Otávio + Felipe |
| Qua 27/05 14:00 | buffer | Refinamento + doc CLAUDE.md | Otávio + Lia |
| Qui 28/05 | revisão | Helena review + CEO approval | Helena |

**Status pós-semana 3 (projeção)**: Pilar Segurança 9.0 → mantém em "Manter". Tier 1 100% travado + Tier 2 fundamentos antes do launch 04/07.

---

## Arquivos auditados

- `middleware.ts`, `next.config.ts`
- `services/apiRateLimit.ts`, `services/apiSchemas.ts`, `services/waitlistRateLimit.ts`
- `app/waitlist/actions.ts`
- `app/api/checkout/route.ts`, `app/api/encomenda/route.ts`, `app/api/catalog/quote/route.ts`
- `app/api/content/sync/route.ts`, `app/api/payment-configs/route.ts`
- `app/api/webhooks/payment/route.ts`
- `payments/mercadopago.ts`, `payments/stripe.ts`
- `supabase/migrations/20260518_webhook_events.sql`
- `components/landing/WaitlistForm.tsx`
- `.env.example`, `package.json`

## Arquivos a criar na semana 3

- `.github/dependabot.yml`
- `supabase/migrations/20260525_audit_log.sql`
- `services/auditLog.ts`
- `app/api/csp-report/route.ts`
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
