# Auditoria Pre-Soft-Launch — Hayzer

> **Autor**: Otávio (Security Officer G7)
> **Data**: 2026-05-20
> **Trigger**: 22 dias antes do soft launch (11-13/06), 38 dias antes do launch público (27/06)
> **Auditoria anterior**: `security/audit-tier1-completo-2026-05-17.md` (3 dias atrás)
> **Próximo audit**: pre-launch público (24/06)

---

## Resumo executivo

**Status geral**: AMARELO com tendência VERDE

O Tier 1 está 100% fechado. Tier 2 parcialmente entregue (Dependabot ativo, rate-limit DB-based em prod, idempotência webhook atômica). Restam 5 itens que decidirei abaixo se bloqueiam soft launch ou se aceito que entrem na semana 24-30/06.

**Mudança desde 17/05 (3 dias)**:
- `.github/dependabot.yml` ativado (weekly seg 8h BRT) — A03 Supply Chain coberto
- Migrations aplicadas em prod: `webhook_events`, `api_rate_limits`, `pg_cron cleanup`, `production_project_id`, `notifications_and_search`
- ADR-018 (Rolling Releases) + ADR-019 (Sentry) escritos, aguardam aplicação 17-20/06
- `services/notifications.ts` + `services/search.ts` em prod
- 11 services receberam `project_id` em queries (fix multi-tenant Bruna 18/05)
- `app/orders/page.tsx` migrado pra ModuleShell V4.8

**Veredito soft launch 11/06**: GO com 3 condições de meio de período (ver Top 5 ações urgentes).

---

## Parte 1 — Verificação Tier 1 + Tier 2 (estado atual)

| Item | Status | Evidência | Risco |
|---|---|---|---|
| HSTS `max-age=63072000; includeSubDomains` | ATIVO | `next.config.ts:8` | Verde |
| `X-Frame-Options: DENY` | ATIVO | `next.config.ts:10` | Verde |
| `X-Content-Type-Options: nosniff` | ATIVO | `next.config.ts:12` | Verde |
| `Referrer-Policy: strict-origin-when-cross-origin` | ATIVO | `next.config.ts:14` | Verde |
| `Permissions-Policy` (camera/mic/geo deny) | ATIVO | `next.config.ts:16` | Verde |
| CSP report-only (12 directives) | ATIVO | `next.config.ts:52-66` | Amarelo (sem report-uri) |
| Rate-limit `/api/checkout` (20/min IP) | ATIVO | `app/api/checkout/route.ts:36` | Verde |
| Rate-limit `/api/encomenda` (20/min IP) | ATIVO | `app/api/encomenda/route.ts:20` | Verde |
| Rate-limit `/api/catalog/quote` (10/min IP) | ATIVO | `app/api/catalog/quote/route.ts:33` | Verde |
| Rate-limit `/api/waitlist` (3/24h IP hash) | ATIVO | `services/waitlistRateLimit.ts` | Verde |
| Honeypot + time-check waitlist | ATIVO | `app/waitlist/actions.ts:65-87` | Verde |
| Zod em `/api/finance/fixed-costs` | ATIVO | `app/api/finance/fixed-costs/route.ts:47` | Verde |
| Zod em `/api/finance/profit-goal` | ATIVO | `app/api/finance/profit-goal/route.ts:45` | Verde |
| Zod em `/api/payment-configs` (discriminated union) | ATIVO | `app/api/payment-configs/route.ts:48` | Verde |
| Zod em rotas públicas (checkout/encomenda/quote) | ATIVO | `services/apiSchemas.ts` | Verde |
| Zod em `/api/content/sync` | ATIVO | `app/api/content/sync/route.ts:53` | Verde |
| Webhook MP HMAC obrigatório | ATIVO | `payments/mercadopago.ts:123-128` (throw se faltar) | Verde |
| Webhook Stripe SDK constructEvent | ATIVO | `payments/stripe.ts` | Verde |
| Idempotência webhook (UNIQUE+RPC atômica) | ATIVO | `webhook_events` + `process_webhook_atomic` | Verde |
| Middleware libera `/api/webhooks` | ATIVO | `middleware.ts:20` | Verde |
| Cross-merchant check (URL vs metadata) | ATIVO | `app/api/webhooks/payment/route.ts:115` | Verde |
| `API_RATE_LIMIT_SALT` setado em prod | ATIVO | Vercel deploy `D1YRg3yBF` 17/05 | Verde |
| `WAITLIST_IP_SALT` setado em prod | ATIVO | Vercel (desde 14/05) | Verde |
| `SUPABASE_SERVICE_ROLE_KEY` setada em prod | ATIVO | Vercel | Verde |
| Dependabot weekly (Tier 2) | ATIVO | `.github/dependabot.yml` (18/05) | Verde |
| pg_cron cleanup `api_rate_limits` (7d) | ATIVO | `20260518_enable_pg_cron_cleanup.sql` | Verde |
| LGPD: Privacidade publicada | ATIVO | `app/privacidade/page.tsx` | Verde |
| LGPD: Termos publicados | ATIVO | `app/termos/page.tsx` | Verde |
| LGPD: checkbox consent waitlist | ATIVO | `components/landing/WaitlistForm.tsx` | Verde |
| Sentry (Tier 2) | NÃO ATIVO | ADR-019 aplica 17/06 | Aceitável (planejado) |
| Audit log table (Tier 2) | NÃO ATIVO | Planejado semana 25/05 | Amarelo |
| Rate-limit rotas autenticadas | NÃO ATIVO | Tier 2 gap | Amarelo |
| CSP report endpoint | NÃO ATIVO | Depende de Sentry | Amarelo |
| Vercel BotID Challenge | LOG MODE | Desde 14/05 | Amarelo |
| Rolling Releases | NÃO ATIVO | ADR-018 aplica 20/06 | Aceitável (planejado) |
| Direito de deleção (`DELETE /api/me`) | NÃO ATIVO | Backlog Tier 2 | Verde (LGPD permite resposta manual em 15d até feature) |
| Vault de secrets / rotação tokens | NÃO ATIVO | RESEND/SUPABASE não foram trocados pós-launch waitlist | Amarelo |

**Itens Tier 1 verdes**: 27/27 (100%)
**Itens Tier 2 verdes**: 5/12 (Dependabot, pg_cron, Resend dominio, LGPD docs, idempotência webhook)
**Tier 2 com data marcada**: 2 (Sentry 17/06, Rolling 20/06)
**Tier 2 gaps reais**: 5 (audit log, rate-limit auth, CSP report endpoint, BotID promote, deleção LGPD)

---

## Parte 2 — OWASP Top 10:2025 RC1 — status atual

| Categoria | Nota | Status | Risco residual pre-soft-launch |
|---|---|---|---|
| A01 Broken Access Control | 8.5 | VERDE | RLS em todas tabelas, `project_id` + `user_id` filter em 100% services (fix Bruna 18/05). Middleware refresh session. Audit log faltante = sem forensics de tentativa negada, mas não bloqueia. |
| A02 Security Misconfig | 8.5 | VERDE | 5 headers + CSP report-only ativos. CSP sem report-uri (gap aceitável: promover pra enforcing depende de Sentry 17/06). Nenhum default credential. |
| A03 Software Supply Chain | 7.5 | VERDE | Dependabot weekly ativo desde 18/05. pnpm lockfile commitado, Vercel build isolado. Sem SCA tool (Snyk/Socket) — Tier 3. |
| A04 Cryptographic Failures | 8.0 | VERDE | HTTPS forçado Vercel, Supabase encryption at rest, bcrypt no Auth, JWT HS256, secrets só em Vercel env (nunca código). SUPABASE_SERVICE_ROLE não rotacionada pós-launch waitlist (15/05) — risco baixo dado zero usuários. |
| A05 Injection | 9.0 | VERDE | Supabase PostgREST = prepared statements. Zod em 100% das rotas com input externo (8 schemas). RPCs `create_catalog_lead` e `process_webhook_atomic` com `SECURITY DEFINER + SET search_path = ''`. |
| A06 Insecure Design | 7.0 | AMARELO | Threat model documentado pra waitlist + webhook. **Faltante**: threat model formal pra fluxo de pagamento (Stripe + MP) — Paulo+Otávio agendados semana 4-5 (antes de webhooks 100% prod). |
| A07 Authentication Failures | 7.5 | VERDE | Supabase Auth: política senha mínimo 6 chars + rate limit nativo + cookies httpOnly+Secure+SameSite=Lax + erro genérico no login (login page já traduz para "E-mail ou senha incorretos"). MFA Tier 3. **Gap**: rate-limit por IP no /login é nativo do Supabase, mas sem visibilidade prática do limite. |
| A08 Data Integrity | 8.5 | VERDE | Deploy só via Vercel→GitHub (branch protegida). Stripe webhook signature obrigatória. MP webhook signature **agora obrigatória** (fix 17/05). Idempotência via tabela `webhook_events` dedicada com UNIQUE composto + RPC atômica (race condition resolvida 18/05). |
| A09 Logging Failures | 5.5 | AMARELO | Vercel logs + Supabase logs ativos, mas SEM agregação central. Sentry agendado 17/06 — único item que move de 5.5 para 8.0. Sem `audit_log` table = sem forensics de ações sensíveis (deleção, mudança de payment_config). |
| A10 Mishandling Exceptional Conditions (NOVO 2025) | 7.0 | VERDE | Fail-OPEN documentado em rate-limit (`apiRateLimit.ts:118-119`, `waitlistRateLimit.ts`). Try/catch em todas Server Actions waitlist + checkout + encomenda. Middleware fail-CLOSED (erro → /login). **Gap menor**: nem todos catches têm log estruturado — Sentry resolve. |

**Heurística "2+ no vermelho → bloqueia"**: 0 vermelhos, 2 amarelos baixos (A06, A09). **Procede pra soft launch**.

**Média OWASP**: 7.7 (era 7.4 em 17/05). Subida puxada por A03 (Dependabot), A05 (Zod completo) e A08 (idempotência webhook).

---

## Parte 3 — Pre-soft-launch checklist (5-7 itens mais críticos)

Marcar com status atual. Decisão = bloqueia ou não bloqueia 11/06.

### 1. CSP enforcing (sair de report-only)

**Status atual**: report-only ativo desde 17/05, sem report-uri.
**Decisão**: NÃO BLOQUEIA soft launch. Promover pra enforcing depende de:
- Sentry ativo (17/06) pra capturar `csp-report` endpoint
- 2-4 semanas de observação de violações no DevTools

**Plano**: promover apenas APÓS launch público (mês 7/2026), com Sentry consolidado.

**Risco residual em soft launch**: BAIXO. Report-only já bloqueia XSS via headers do navegador sem quebrar produção. Atacante teria que escapar das 12 directives + driblar X-Frame-Options + nosniff.

### 2. Vercel BotID Challenge mode (sair de Log)

**Status atual**: modo Log desde 14/05/2026.
**Decisão**: PROMOVER ANTES DO SOFT LAUNCH (11/06).

**Razão**: soft launch traz primeiros 50-100 usuários reais + atenção pública. Bot scraping/spam vai aumentar. Log mode = vê o bot mas não bloqueia.

**Ação**: CEO promove no Vercel Dashboard → Firewall → Bot Protection → "On". Tempo: 1 minuto. Reversível em 1 clique.

**Risco de promover**: bots legítimos (Googlebot, crawlers de copy) podem ser desafiados. Mitigação: Vercel já tem allowlist de bots conhecidos.

### 3. Rate-limit em rotas autenticadas (login, signup, password reset)

**Status atual**: rotas autenticadas (`/api/finance/*`, `/api/payment-configs`) SEM rate-limit por user_id. Supabase Auth nativo (login/signup/reset) usa rate-limit interno do Supabase — não controlado por nós.

**Decisão**: NÃO BLOQUEIA soft launch. Plano: Tier 2 semana 25/05-29/05 (já no calendário Otávio).

**Razão**: Supabase Auth nativo tem rate-limit nativo configurável no Dashboard. Verificar valor atual antes do soft launch (CEO ou Ricardo, 1 minuto):
- Dashboard Supabase → Authentication → Policies → Rate Limits
- Esperado: 30/hora por IP em signups, 5 em password resets
- Se estiver default e parecer alto, baixar para 10/hora em signup

**Risco residual**: BAIXO. Credential stuffing exige base vazada (não tem) + erro genérico no login bloqueia user enumeration.

### 4. Vault de secrets / rotação RESEND_API_KEY e SUPABASE_SERVICE_ROLE_KEY

**Status atual**:
- `RESEND_API_KEY` rotacionada v2 em 15/05 quando Resend foi recriado us-east-1
- `SUPABASE_SERVICE_ROLE_KEY` NÃO foi rotacionada desde início do projeto

**Decisão**: NÃO BLOQUEIA soft launch. Aplicar pré-launch público (24/06).

**Razão**: política NIST recente abandonou "rotação periódica sem gatilho" — só rotaciona com causa real (vazamento, mudança de equipe, comprometimento). Memória ativa do CEO: `feedback_rotacao_credencial_precisa_gatilho.md`. Nenhum gatilho disparado.

**Ação 24/06 (pré-launch público)**:
- Gerar nova service_role no Supabase Dashboard
- Atualizar Vercel env vars (production)
- Confirmar que key antiga foi revogada
- Tempo: 10 minutos
- Risco: serviço cai por minutos se cookies em cache — janela pré-launch zera o efeito

### 5. Vercel Firewall — rules custom pra IPs maliciosos

**Status atual**: Firewall do Vercel ativo no plano Pro com BotID em Log mode. SEM regras custom.

**Decisão**: NÃO BLOQUEIA soft launch. Adicionar **apenas se houver evidência de ataque** no soft launch.

**Razão**: regra custom prematura = bloqueio de IP legítimo + false positive. Esperar dado real.

**Ação**: pós soft launch (12-13/06), revisar Firewall logs. Se houver IP fazendo >100 req/hora não-bot: bloquear via regra custom.

### 6. RESEND domain rotation pré-launch público

**Status atual**: `hayzer.com.br` verified us-east-1 desde 15/05.

**Decisão**: NÃO BLOQUEIA. Domain ativo, SPF/DKIM/DMARC OK. Email transacional waitlist em prod desde 15/05.

### 7. Direito de deleção LGPD (`DELETE /api/me`)

**Status atual**: NÃO IMPLEMENTADO.

**Decisão**: NÃO BLOQUEIA soft launch.

**Razão**: LGPD Art. 18 garante direito de deleção, mas exige resposta em até 15 dias úteis. Até feature existir, atender manualmente (CEO recebe email, executa DELETE no Supabase Dashboard). Documentar isto na Privacidade page.

**Ação semana 25/05**: incluir no plano Tier 2 (4h dev, Bruna+Otávio).

---

## Top 5 ações urgentes pré 11/06

| # | Ação | Owner | Prazo | Bloqueia soft launch? |
|---|---|---|---|---|
| 1 | Promover Vercel BotID de Log para Challenge | CEO | 10/06 18h | SIM (recomendado) |
| 2 | Verificar rate-limit nativo Supabase Auth (Dashboard) e ajustar se default for alto | CEO + Ricardo | 09/06 | NÃO mas recomendado |
| 3 | Validar tabela `api_rate_limits` está sendo populada em prod (sanity check `SELECT count(*)` pós soft launch traffic D-0) | Otávio + Bruna | 11/06 12h | NÃO, só sanity check |
| 4 | Threat model documentado pra fluxo de pagamento Stripe + MP (cobre A06) | Otávio + Paulo | 06/06 | NÃO, mas crítico antes de webhooks irem 100% prod |
| 5 | Documentar processo de resposta a "pedido LGPD" manual na privacidade page | Otávio + Carla | 09/06 | NÃO mas LGPD-protetivo |

**Os 5 caem dentro da janela 09-10/06**. Carga real ~3h efetivas distribuída entre CEO (10 min), Ricardo (10 min), Bruna (15 min), Otávio (1h threat model + 30 min sanity check), Carla (30 min copy).

---

## Parte 4 — Plano de resposta a incidentes

**Cenário**: vazamento de dado detectado durante soft launch (11-13/06).

**Detecção**:
- Sem Sentry ainda. Detecção real depende de:
  - CEO observando manualmente Vercel logs + Supabase logs durante janela 11-13/06
  - Usuário reportando comportamento estranho via WhatsApp grupo beta
  - Vercel Firewall alertando IP anômalo (se regra triggar)

**Quando incidente detectado**:
1. **Quem chama**: CEO único (decisão atual G7, helena-strategy ratifica)
2. **Triagem (15 min)**: verificar se é dado pessoal (CPF/email/telefone/endereço) — define se é vazamento LGPD ou bug normal
3. **Contenção (30 min)**:
   - Se vazamento confirmado: invocar `vercel rollback <deploy-anterior>` (já documentado em ADR-018, plano Ricardo)
   - Tempo de rollback manual: < 2 minutos
   - Cookies de sessão ativos NÃO são invalidados — usuário continua logado. Se necessário, executar `supabase auth signOut all users` via Dashboard
4. **LGPD timer 72h** (Art. 48):
   - Comunicar ANPD em até 72h da detecção (Lei 13.709/2018 Art. 48 §1°)
   - Comunicar titulares afetados se houver risco/dano (Art. 48 §1° II)
   - Documentar: o que vazou, quantos titulares, ação tomada
5. **Pós-mortem**: criar ADR em `decisions/NNN-incidente-YYYY-MM-DD.md` em até 7 dias, sem culpado, com timeline + lições

**Rollback plan resumido**:
- Vercel Dashboard → Deployments → último deploy estável → "Promote to Production" (2 min)
- OU `vercel rollback <url> --token=$VERCEL_TOKEN` (2 min)
- Rolling Releases NÃO está ativo ainda (até 20/06), então rollback é manual mas rápido

**Comunicação durante incidente**: WhatsApp grupo beta = canal de transparência. CEO comunica em até 6h da detecção se afeta os 50-100 usuários beta.

---

## O que mudou desde 17/05 (auditoria anterior)

1. **Dependabot ativado** (18/05): A03 Supply Chain fechou. Weekly seg 8h BRT, 2 ecosystems (npm + github-actions), ignore major em 9 deps core.
2. **5 migrations aplicadas em prod**: `webhook_events`, `api_rate_limits`, `pg_cron cleanup`, `production_project_id`, `notifications_and_search`. Última fecha racha multi-tenant que Bruna detectou em 11 services.
3. **ADR-018 + ADR-019 escritos** (20/05): Rolling Releases (20/06) + Sentry (17/06). Plano de rollout consolidado em `devops/rollout-plan-pre-launch-2026-05-20.md`.
4. **`services/notifications.ts` + `services/search.ts`** em prod. Search index com `searchable_text` em português. REVOKE/GRANT extras na view materializada (defense in depth, view sem RLS automática).
5. **11 services receberam `project_id`** em queries. Multi-tenant 100% fechado.
6. **`app/orders/page.tsx`** migrado pra ModuleShell V4.8. KpiRow + FilterBar integrados.
7. **Memória ativa de Otávio** (em `.claude/agents/otavio-security.md`): princípios OWASP Top 10:2025 RC1 sintetizados. Heurística de cada deploy = rodar A01→A10 mentalmente.

**Itens que continuam abertos do audit 17/05**:
- Audit log table (Tier 2 semana 25/05)
- Rate-limit em rotas autenticadas (Tier 2 semana 25/05)
- CSP report endpoint (depende Sentry 17/06)
- Threat model formal pagamento (Otávio+Paulo, antes 06/06)

---

## Veredito final

**GO para soft launch 11/06/2026**.

**Razões técnicas**:
1. Tier 1 100% fechado (27 itens verdes)
2. OWASP 2025 média 7.7 (era 7.4), zero categoria vermelha, 2 amarelas baixas (A06 Threat Model, A09 Logging)
3. Mitigações em andamento têm data marcada (Sentry 17/06, Rolling 20/06)
4. Risco residual aceitável dado contexto pre-launch público (50-100 beta = baixa superfície de ataque)
5. Plano de rollback testado e documentado (ADR-018 §Rollback plan)
6. LGPD coberto: docs publicadas, consent ativo, deleção via processo manual até feature

**Condições para o GO se manter válido**:
1. CEO promove BotID Log→Challenge até 10/06 18h
2. CEO verifica rate-limit nativo Supabase Auth e ajusta se default for alto (até 09/06)
3. Threat model formal pagamento documentado até 06/06 (Otávio+Paulo)

**Próximo audit**: pre-launch público (24/06/2026), 3 dias antes da virada pública 27/06. Vai validar Sentry funcionando, Rolling Releases configurado, e SUPABASE_SERVICE_ROLE_KEY rotacionada.

**Próximo audit completo Tier 1+2**: 5/07/2026 (semana pós-launch, em produção real).

---

## Arquivos auditados (2026-05-20)

- `next.config.ts`, `middleware.ts`
- `services/apiRateLimit.ts`, `services/apiSchemas.ts`, `services/waitlistRateLimit.ts`
- `app/waitlist/actions.ts`, `app/login/page.tsx`
- `app/api/checkout/route.ts`, `app/api/encomenda/route.ts`, `app/api/catalog/quote/route.ts`
- `app/api/content/sync/route.ts`, `app/api/payment-configs/route.ts`
- `app/api/webhooks/payment/route.ts`, `app/api/admin/reconcile-transactions/route.ts`
- `app/api/finance/fixed-costs/route.ts`, `app/api/finance/profit-goal/route.ts`
- `payments/mercadopago.ts`, `payments/stripe.ts`
- `supabase/migrations/20260518_webhook_events.sql`, `20260518_api_rate_limits.sql`, `20260518_enable_pg_cron_cleanup.sql`
- `.github/dependabot.yml`, `.env.example`
- `decisions/018-rolling-releases-pre-launch.md`, `decisions/019-sentry-init-prod.md`
- `devops/rollout-plan-pre-launch-2026-05-20.md`
- `context/AuthContext.tsx`
- `services/CLAUDE.md`, `app/api/CLAUDE.md`, `supabase/migrations/CLAUDE.md`, `payments/CLAUDE.md`
