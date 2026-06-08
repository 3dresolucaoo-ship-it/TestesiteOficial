# Hayzer — Sistema de Pontuação por Pilar

> **Filosofia (CEO 17/05/2026)**: cada pilar do produto tem nota 0-10. Nunca se acomodar com a nota atual.
> Sempre buscar melhoria contínua. Pilar **não cai** (manutenção) **+ cresce** (expansão).
>
> **Revisão**: toda segunda 9h (CEO + Helena consolidam). Score muda só com evidência concreta — não vanity metric.
> **Documentação**: `pillars/history.md` (a criar) registra cada mudança com data + razão + ação.

---

## 📊 Status atual — 2026-06-08

| # | Pilar | Hoje | Meta 30d | Meta 90d | Owner G7 | Próx. revisão |
|---|---|---|---|---|---|---|
| 1 | **Design (UI/UX)** | 9.1 ⬆️ | 9.5 | 9.7 | Diego | 15/06 |
| 2 | **Anti-IA (autenticidade)** | 9.3 | 9.5 | 9.5 | Carla + Diego | 15/06 |
| 3 | **Segurança (OWASP 2025)** | 9.5 ⬆️ | 9.7 | 9.7 | Otávio | 24/06 |
| 4 | **Performance (Web Vitals)** | 8.0 ⬆️ | 8.5 | 8.5 | Felipe + Ricardo | 15/06 |
| 5 | **Acessibilidade (WCAG AA)** | 7.0 | 8.0 | 9.0 | Felipe (Júlia ⌀) | 16/06 ⚠️ |
| 6 | **Mobile (320-768px)** | 7.7 ⬆️ | 8.5 | 9.0 | Diego + Felipe | 15/06 |
| 7 | **Conversão (funil)** | 7.0 ⬆️ | 7.5 | 8.5 | Marcos + Sofia + Ana | 15/06 |
| 8 | **Retenção (habit-forming)** | 6.0 ⬆️ | 6.5 | 8.0 | Sofia + Marcos | 15/06 |
| 9 | **Pagamento (robustez)** | 8.5 | 9.0 | 9.5 | Paulo + Bruna | 15/06 |
| 10 | **Documentação (Diátaxis)** | 8.5 | 9.0 | 9.5 | Lia | 15/06 |
| 11 | **Backend (DB + APIs)** | 8.3 ⬆️ | 8.5 | 9.0 | Bruna | 15/06 |
| 12 | **Estratégia (posicionamento)** | 8.5 ⬆️ | 9.0 | 9.0 | Helena | 15/06 |
| | **MÉDIA GERAL** | **8.1 ⬆️** | **8.5** | **8.8** | Helena | semanal |

### Mudanças semana 01–08/06 (revisão semanal — 38 commits, foco qualidade pré-launch)

- **+0.1 Design (9.0→9.1)**: `8a8abc3` + `72387b4` — /content e /decisions migrados para ModuleShell V4. **100% dos 14 módulos em V4** agora (último módulo legacy removido). `da28881`: skeleton V4 em 6 rotas. `02a0087`: ProductEmptyState 3 variantes em /products.
- **+0.2 Segurança (9.3→9.5)**: `78bac11` — SEC-0 price-shopping/cross-merchant fechado em checkout + encomenda + webhook (produto amarrado ao merchant). Catálogo público: admin client + scrub custo/margem/tempo (dados internos não vazam mais no payload RSC). SEC-4 CRON fail-closed. Migration `20260606_security_hardening_owasp` aplicada em prod. `17c3632`: Sentry withSentryConfig + source maps — stacktraces em prod legíveis (antes minificados). Auditoria de 4 camadas (3 auditores + red team) validada ao vivo impersonando anon.
- **+0.5 Performance (7.5→8.0)**: `89d2f71` + `cbefed7` — auth boot non-blocking: splash de 20s → ~100ms (getSession local first, getUser revalida em background; remove safetyTimer 12s). `c0959ec`: timeout hydration 15s → 3s (elimina skeleton eternal em 6+ rotas). `31a1439`: SW CACHE_VERSION bump + network-first em assets estáticos (SW de 16/05 servia JS antigo → landing em branco em prod; bug de 3 semanas corrigido).
- **+0.2 Mobile (7.5→7.7)**: `ec9f7ea` — KPI grid fix: inline style sobrescrevia media queries de ResponsiveGrid no ModuleShell. KPIs em 4 colunas em iPhone 390px (ilegíveis) → 1 coluna empilhada. Aplica em CRM/finance/orders/production/customers imediato. Bug confirmado pelo CEO em iPhone 01/06.
- **+0.2 Conversão (6.8→7.0)**: `31a1439`: landing voltando a renderizar completa pra usuários recorrentes (bug SW — eram ~100% das visitas a partir de 16/05). `b7ed1f7`: OG image dinâmica `/catalogo/[slug]` — share WhatsApp/Instagram com imagem real do produto.
- **+0.5 Retenção (5.5→6.0)**: `acf4cb1` — sequência email D+1/D+3/D+7 pós-waitlist implementada: 3 emails maker BR sem sinais de IA, cron Vercel diário 10h BRT, idempotência via `email_sequence_log` + UNIQUE(lead_id, step), migration aplicada em prod. Fecha item #1 do plano de ação deste pilar. **Score sujeito a confirmação CEO** (cron em prod não validado ao vivo ainda).
- **+0.3 Backend (8.0→8.3)**: `871c70f`+`0e81da4`+`2bc8f9e`+`7a21b82` — 4 services migrados pra Server Actions cookie-based (products/production/finance/inventory), 13 Server Actions novas, CRUD completo. `4a74a74`: SSR puxa 5 core no initialState (resolve "F5 some dados" — orders/production/inventory/transactions/leads). `78bac11`: checkout amarrado ao merchant.
- **+0.2 Estratégia (8.3→8.5)**: `9a06284` — ADR-034 plano mestre de launch: pesquisa competitiva 10+ players BR (3D Control, Smart3D, Vultrix, Cordeiro Flow etc.), 5 verdades estratégicas, posicionamento "ponta-a-ponta de verdade", Círculo de Fundadores (3-5 makers, não 10), roadmap Ondas 0-2.
- **+0.1 Média geral (8.0→8.1)** avança em direção à meta 30d 8.5. Meta 30d Performance atingida (7.5→8.0 era meta).

### Mudanças sessão 29/05 (plano focar-qualidade + ADR-029 + Bloco 2)

- **+0.5 Acessibilidade (6.5→7.0)**: Bloco 2 entregue commit `1b7702f` — wizard 4 steps com `aria-modal` + focus trap implementado (tab loop + escape close + initial focus em primeiro input) + 7 empty states P1 com `role="status"` (leitor de tela anuncia ao trocar contexto). Auditoria Axe completa ainda pendente (Bloco 3) — score conservador.
- **+0.3 Conversão (6.5→6.8)** (Helena nota: era 7.0 na tabela 21/05, refazendo cálculo coerente — wizard adiciona +0.3 sobre baseline pré-21/05 de 6.5): wizard 4 steps reduz fricção primeira ação (CEO→meta→primeiro projeto criado). PostHog continua ativo. Funil real (% que termina wizard) ainda não medido em prod — Bloco 4 valida pós soft launch.
- **+0.1 Média geral (7.9→8.0)** atinge meta 30d original. Nova meta 30d sobe pra 8.5.

> **Helena ressalva**: Conversão estava 7.0 na tabela 21/05, mas voltei pra 6.8 porque o "7.0" de 21/05 contava credit por features em branch (wizard Felipe não merged, email Marcos planejado, empty states em branch). Realinhando: 6.5 (estado real 21/05 sem merge) + 0.3 wizard mergeado em ember = 6.8. Se CEO discordar e quiser manter 7.0, ajustar.

### Mudanças noturna 20-21/05 (operação paralela G7 — 10 agentes)

- **+0.5 Anti-IA (9.0→9.3)**: Carla search-replace "voce"→"tu" em 17 arquivos (voz unificada). Doc copy V4 dos 11 módulos. ZERO regressao de ponto final em headlines. Consistencia de voz = autenticidade real, nao so estetica.
- **+0.1 Segurança (9.2→9.3)**: ADRs 025 (Sentry) + 026 (/admin protegida) criados como specs. Nao implementados ainda — score sobe leve por visibilidade/planejamento documentado, nao por execucao.
- **+0.5 Performance (7.0→7.5)**: Bruna fix TBT — Hero LazyMotion + posthog lazy + requestIdleCallback (estimativa -2.0 a -2.7s TBT). 36 PNGs landing viraram WebP -96% (23.3MB→2.75MB). ATENCAO: TBT ainda nao medido em prod — score conservador. Confirmar Lighthouse pós-deploy antes de subir mais.
- **+0.5 Conversão (6.5→7.0)**: Felipe onboarding wizard 788 linhas (branch feature/onboarding-wizard). Marcos sequência email D+1/D+3/D+7 planejada. Sofia 10 empty states mapeados. Diego spec landing v2 com PNGs reais (cliente mulher + maker antes/depois). Varios desbloqueadores — nenhum em prod ainda.
- **+0.5 Retenção (5.0→5.5)**: Felipe tela /customers V4 (lista + LTV visual). Bruna customersService com calculo LTV. Primeiro modulo de retencao real do produto. Ainda em branch, nao merged.
- **+0.3 Estratégia (8.0→8.3)**: INPI "Hayzer" classe 42 LIVRE confirmado pePI ao vivo (desbloqueio decisao INPI). Paulo confirmou MP OAuth root cause (app tipo errado — nao e bug, e configuracao). ADR-027 documentado. ADR-028 proposto (corte Helena).

### Mudanças desde 17/05 (sessao maratona 20/05)

### Bug crítico resolvido (era 0.5 risco)

- **`_sentry-prepared` quebrava ALL deploys desde 18/05** (8 deploys ERROR). Site servia versão antiga de cache. Bug encontrado via Vercel MCP get_deployment_build_logs + Chrome MCP. Fix em 1 linha tsconfig exclude. Custo de NÃO ter pego: zero novas features chegavam em prod até soft launch.

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
**Última atualização**: 2026-06-08 (Revisão semanal 01–08/06: 38 commits analisados. Design 9.0→9.1 · Segurança 9.3→9.5 · Performance 7.5→8.0 · Mobile 7.5→7.7 · Conversão 6.8→7.0 · Retenção 5.5→6.0 · Backend 8.0→8.3 · Estratégia 8.3→8.5 · média 8.0→8.1). Pillars próximos a revisar: **Acessibilidade (auditoria Axe, hard deadline 16/06)** e **Performance (Lighthouse rotas internas)**.
