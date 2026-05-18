# Hayzer — Sistema de Pontuação por Pilar

> **Filosofia (CEO 17/05/2026)**: cada pilar do produto tem nota 0-10. Nunca se acomodar com a nota atual.
> Sempre buscar melhoria contínua. Pilar **não cai** (manutenção) **+ cresce** (expansão).
>
> **Revisão**: toda segunda 9h (CEO + Helena consolidam). Score muda só com evidência concreta — não vanity metric.
> **Documentação**: `pillars/history.md` (a criar) registra cada mudança com data + razão + ação.

---

## 📊 Status atual — 2026-05-17

| # | Pilar | Hoje | Meta 30d | Meta 90d | Owner G7 | Próx. revisão |
|---|---|---|---|---|---|---|
| 1 | **Design (UI/UX)** | 9.0 ⬆️ | 9.5 | 9.7 | Diego | 24/05 |
| 2 | **Anti-IA (autenticidade)** | 8.5 ⬆️ | 9.0 | 9.5 | Carla + Diego | 24/05 |
| 3 | **Segurança (OWASP 2025)** | 9.0 ⬆️ | 9.5 | 9.7 | Otávio | 18/05 (Routine) |
| 4 | **Performance (Web Vitals)** | 6.5 | 7.5 | 8.5 | Felipe + Ricardo | 31/05 |
| 5 | **Acessibilidade (WCAG AA)** | 6.5 | 8.0 | 9.0 | Júlia + Felipe | 24/05 |
| 6 | **Mobile (320-768px)** | 7.0 | 8.5 | 9.0 | Diego + Júlia | 31/05 |
| 7 | **Conversão (funil)** | 5.0 | 6.5 | 8.0 | Marcos + Sofia | 07/06 |
| 8 | **Retenção (habit-forming)** | 5.0 | 6.5 | 8.0 | Sofia + Marcos | 07/06 |
| 9 | **Pagamento (robustez)** | 8.5 ⬆️ | 9.0 | 9.5 | Paulo + Bruna | 24/05 |
| 10 | **Documentação (Diátaxis)** | 8.0 | 8.5 | 9.0 | Lia | 31/05 |
| 11 | **Backend (DB + APIs)** | 7.5 | 8.5 | 9.0 | Bruna | 24/05 |
| 12 | **Estratégia (posicionamento)** | 7.5 | 8.5 | 9.0 | Helena | 31/05 |
| | **MÉDIA GERAL** | **7.4 ⬆️** | **8.0** | **8.8** | Helena | semanal |

---

## 🌱 Categoria por pilar (Filosofia CEO)

### 🔴 Não cair (score <6 = urgente)
- **Conversão** (5.0) — landing existe mas funil não medido. Não tem analytics behavior.
- **Retenção** (5.0) — sem dado real ainda (pré-launch). Hooked aplicado parcial (calculadora pega WhatsApp).

### 🟧 Fortalecer (score 6-7.9 = rotina)
- **Performance** (6.5) — Vercel build OK, mas falta Lighthouse audit + LCP otimizado.
- **Acessibilidade** (6.5) — aria-labels parciais, falta auditoria WCAG completa.
- **Mobile** (7.0) — V4.3 tem responsive, falta teste em devices reais.

### 🟢 Expandir (score 8+ = diferencial)
- **Segurança** (9.0 ⬆️) — Tier 1 100% fechado em 17/05 (HSTS + honeypot + time-check + rate-limit DB-based + `API_RATE_LIMIT_SALT` random 32 bytes hex em prod + CSP report-only + Zod completo). Falta Tier 2: Dependabot/Renovate, Sentry, audit log.
- **Documentação** (8.0) — CLAUDE.md por pasta + ADRs + ROADMAP + sistema G7 já é melhor que maioria SaaS.

---

## 🎯 Plano de ação por pilar (próximos 30 dias)

### 1. Design (UI/UX) · 8.5 → 9.0 ✅ (17/05 noite)
- ✅ V4.3 entregue (hierarquia hero+satélites, dark soft, raízes hover)
- ✅ trocar ícone lâmpada → raiz no Next Action (17/05 V4.4)
- ✅ **+0.5: paleta HSL 8-10 shades** (Refactoring UI · Diego · 17/05 noite)
  - 50 tokens petrol/fog/ember/night/sand (10 cada) implementados em `app/globals.css`
  - + 25 tokens matriz sand 5×5 (5 rows × 5 stops) — paleta marrom CEO 17/05
  - + classes Tailwind 4 auto-geradas: `bg-petrol-500`, `text-fog-200`, `bg-sand-warm-300/20`...
  - **Resolve bug latente Tailwind 4 `bg-X/Y`** — tokens HSL nomeados compõem opacity corretamente
  - Doc: anexo A em `design/dashboard-v4-spec.md` (a extrair pra `palette-sand-matrix.md`)
- [ ] +0.5: variar border-radius cards (não tudo 999px ou 14px uniforme) — próximo
- [ ] +0.5: migrar componentes existentes pra novos tokens (hex hardcode → sand-*/petrol-*)
- [ ] +0.5: animações Framer Motion na conversão React (Felipe)

### 2. Anti-IA · 7.5 → 8.5
- ✅ Fraunces ≤15%, microcopy maker BR real, vírgula brasileira, raízes vivas
- [ ] +0.5: trocar todos ícones "padrão Lucide" por motif Hayzer (raiz/folha/seiva)
- [ ] +0.5: introduzir 1-2 imperfeições deliberadas (rotação 0.4°, tracking variável)
- [ ] +0.5: imagery autoral (não Phosphor genérico) — ilustrações próprias

### 3. Segurança · 9.0 ⬆️ (Tier 1 fechado 17/05 noite — score final 9.0)
- ✅ 3 fixes críticos aplicados 17/05 manhã (middleware webhooks, MP secret, content/sync)
- ✅ **+0.5: Zod nas APIs finance + payment-configs** (17/05 noite) — `fixedCostCreateSchema`/`Patch`/`profitGoalSchema`/`paymentConfigSchema` (discriminated union por provider) em `services/apiSchemas.ts`. Bloqueia XSS, oversize, NaN/Infinity em amounts. Reaproveita helper `zodErrorToPtBr`.
- ✅ **+0.5: CSP report-only header** (17/05 noite) — `next.config.ts`. Cobre 'self' + Vercel scripts + fonts.googleapis + *.supabase.co + api.mercadopago.com + api.stripe.com + js.stripe.com. `unsafe-eval` só em dev. Modo report-only por 2-4 semanas pra observar violações no DevTools antes de promover pra enforcing.
- ✅ **+0.5: rate-limit DB-based em rotas públicas** (17/05 noite) — `services/apiRateLimit.ts` genérico + migration `20260518_api_rate_limits.sql`. Aplicado em `/api/checkout` (20/min), `/api/encomenda` (20/min), `/api/catalog/quote` (10/min). Mesmo padrão SHA-256(IP+salt) do waitlist. Fail-OPEN se DB cair. Pós-launch: trocar pra Upstash Redis quando passar de 5k req/dia.
- ✅ **API_RATE_LIMIT_SALT setado em prod + redeploy** (17/05 noite) — valor random 32 bytes hex via Vercel env vars. Deploy `D1YRg3yBF` Ready em 1m 8s. Tier 1 100% operacional em prod.
- **Nota**: Tier 1 fechado em 2026-05-17; Tier 2 (Dependabot/Sentry/audit log) começa pós-launch conforme ROADMAP.
- [ ] +0.3: Dependabot/Renovate ativos (Otávio · OWASP A03) — Tier 2
- [ ] +0.2: Sentry pra erro em prod (Tier 2)

### 4. Performance · 6.5 → 7.5
- [ ] +0.5: Lighthouse audit + fix top 3 issues
- [ ] +0.5: imagens otimizadas (next/image + AVIF)
- [ ] +0.5: bundle analysis + code splitting

### 5. Acessibilidade · 6.5 → 8.0
- ✅ aria-labels donut (V4.2), prefers-reduced-motion, focus rings, mobile drawer overlay
- [ ] +0.5: sr-only nos delta up/down (Júlia P1)
- [ ] +0.5: SVG charts com `<title>` individual (Júlia P1)
- [ ] +0.5: audit Axe completo (Júlia)
- [ ] +0.5: skip-to-content link no topo

### 6. Mobile · 7.0 → 8.5
- ✅ Sidebar drawer + overlay + escape key (V4.2)
- ✅ Mobile-break utility cover-meta (V4.2)
- [ ] +0.5: teste em devices reais (iPhone SE, iPad, Android mid-range)
- [ ] +0.5: tap targets ≥44px todos (alguns btns 38px atualmente)
- [ ] +0.5: PWA install prompt testado em iOS + Android

### 7. Conversão · 5.0 → 6.5
- [ ] +0.5: Vercel Analytics ativo (medir funil real)
- [ ] +0.5: instalar PostHog ou Plausible (event tracking)
- [ ] +0.5: hero copy A/B test (3 variantes)
- [ ] +0.5: CTA waitlist com sticky scroll
- [ ] +0.5: social proof real (X makers já cadastrados)

### 8. Retenção · 5.0 → 6.5
- [ ] +0.5: email transacional 7 dias pós-cadastro (sequência)
- [ ] +0.5: feature trigger interno (lembrete calcular preço)
- [ ] +0.5: streak real (Hooked · Marcos princípio P5)
- [ ] +0.5: insight semanal por email (variable reward)

### 9. Pagamento · 8.5 ⬆️ → 9.0
- ✅ Stripe + MP integrados, signature obrigatória (17/05 fix Otávio)
- ✅ **+1.0 RESOLVIDO 17/05**: transaction atômica webhook — Bruna implementou RPC `process_webhook_atomic` (migration `20260518_webhook_events.sql`). Diagnóstico foi pior que esperado: 5 roundtrips separados (não 2). Agora tudo numa TX Postgres com `ON CONFLICT DO NOTHING` como lock atômico.
- ✅ **+0.5 RESOLVIDO 17/05**: tabela `webhook_events` criada com UNIQUE (provider, event_id)
- [ ] +0.3: aplicar migration no Supabase prod (CEO via MCP)
- [ ] +0.3: runbook incidente pagamento documentado
- [ ] +0.3: reconciliação diária via pg_cron
- [ ] +0.3: mover SELECT products pra dentro da RPC (eliminar último roundtrip externo — risco residual identificado por Bruna)

### 10. Documentação · 8.0 → 8.5
- ✅ CLAUDE.md por pasta, ADRs 001-013, ROADMAP detalhado
- [ ] +0.5: aplicar Diátaxis em `studies/` (tutorial vs how-to vs reference)
- [ ] +0.5: runbooks operacionais (incidente, rollback, deploy)

### 11. Backend (DB + APIs) · 7.5 → 8.5
- ✅ RLS em todas tabelas, multi-tenant via project_id, services-first
- [ ] +0.5: aplicar princípio Kleppmann — toda escrita crítica com idempotency_key
- [ ] +0.5: índices em queries lentas (audit ANALYZE)
- [ ] +0.5: timeouts + retries em fetch externos (Stripe/MP/Resend)

### 12. Estratégia · 7.5 → 8.5
- ✅ ADR-009 (naming), ADR-010 (foco vertical maker 3D), ADR-011-013 (segurança/branding)
- [ ] +0.5: diagnose explícito de cada nova feature (Rumelt princípio)
- [ ] +0.5: chain-link analysis pré-launch (qual elo mais fraco hoje?)
- [ ] +0.5: definir proximate objective do mês (Helena · estudo Rumelt)

---

## ⚙️ Como funciona o sistema

### 1. Quem atualiza o score
- Owner G7 propõe mudança via `/rcs` com **evidência** (audit, dado, feedback)
- CEO + Helena validam toda segunda 9h
- Nenhum score sobe sem ação concreta documentada

### 2. Histórico
- `pillars/history.md` registra: data → score antigo → score novo → razão → ação
- Permite ver tendência de cada pilar ao longo do tempo
- Vira métrica do progresso geral do produto

### 3. Alerta automático
- Pilar com 2 semanas sem revisão = aviso pra owner G7
- Pilar com score caindo 2 semanas seguidas = council automático (`/council`)
- Pilar com score <6 = entra em "🔴 Não cair" e bloqueia features novas até subir

### 4. Métrica composta
- **Média geral** = média ponderada dos 12 pilares
- **Hoje**: 7.4/10 · **Meta 30d**: 8.0 · **Meta 90d**: 8.8
- Pós-launch a média deve estar ≥8.0 (todos pilares no "Fortalecer" ou "Expandir")

---

## 🗓️ Cadência de revisão

| Frequência | O que | Quem |
|---|---|---|
| Diária | CEO sente alguma área "fraca" → reporta no /rcs | CEO |
| Semanal (segunda 9h) | Reunião 15min: cada pilar — manteve? subiu? caiu? por quê? | CEO + Helena + owner |
| Mensal | Audit completo (auto-mensal já existente) atualiza scores | Helena + owners G7 |
| Trimestral | Revisar metas + adicionar/remover pilares se evolução do produto exigir | CEO + Helena |

---

## 🌟 Filosofia (palavras do CEO)

> "Pode estar 7.5 hoje mas tem que deixar anotado pra um dia virar 10 ou próximo disso.
> Todos os dias ou com data pra melhoria, sempre nunca se acomodar.
> Com 7.5 sempre busca melhora em todas as áreas — design, segurança, tudo.
>
> 1 pilar pra que ele NÃO CAIA, e 2 pra FORTALECER e CRESCER/EXPANDIR ele."

Esse documento operacionaliza essa filosofia.

---

## 📈 Próximos marcos esperados

| Data | Marco | Pilares impactados |
|---|---|---|
| 24/05 | Auditoria semanal #1 | todos |
| 31/05 | Lighthouse + Axe audit | 4, 5 |
| 07/06 | Launch soft → primeiros 50 makers | 7, 8 |
| 14/06 | Primeira leitura de dado real conversão | 7 |
| **04/07** | **🚀 LAUNCH PÚBLICO** | todos ≥8.0 ideal |
| 31/07 | Audit pós-launch — pivot ou continuar | todos |

---

**Mantenedor primário**: Helena (estratégia consolida)
**Atualização**: toda segunda + via `/rcs` quando evidência aparecer
**Última atualização**: 2026-05-17 (Segurança 8.5 → 9.0 · API_RATE_LIMIT_SALT em prod · média 7.3 → 7.4)
