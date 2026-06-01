# Rolling Summary — Últimos 90 dias

> Resumo dos últimos audits. Mantém os 3 mais recentes; arquiva o resto em `audits/<data>.md`.
> Atualizado automaticamente pelo `/audit-mensal`.

---

## 📅 Audits

| Data | Arquivo | Bugs críticos | Itens importantes | Score médio |
|---|---|---|---|---|
| 2026-06-01 | `audits/2026-06-01.md` | 3 (B1-B3) | 10 (P1-P10) | **8.0** |
| 2026-05-04 | `audits/2026-05-04.md` | 6 | 9 | ~7.3 (est.) |

---

## 📈 Tendência (2 audits)

- **Score médio**: 7.3 → **8.0** (+0.7 em 28 dias) — maior salto em Conversão (+1.8) e Performance (+1.0)
- **Bugs críticos**: 6 → 3 (−3) — resolvidos 6, abertos 3 novos (infra/observabilidade, não produto)
- **Cobertura de produto**: ~50% (mai) → ~65% (jun) — estimativa CEO em CLAUDE.md
- **Commits**: 124 em 28 dias = média de 4,4 commits/dia — alta velocidade
- **Migrations**: 4 → 24 (+20) — DB amadurecendo rapidamente

---

## 🎯 Itens recorrentes (aparecem em múltiplos audits)

> Sinaliza dívida técnica que não está sendo resolvida.

- **`app/showcase/page.tsx`** — presente desde mai/04 sem ser removido (era M4, agora P6)
- **`lib/mockData.ts`** — presente nos 2 audits, ainda referenciado em store.tsx
- **README.md template** — presente nos 2 audits sem atualização
- **QA mobile** — mencionado no primeiro audit indiretamente, explícito no segundo como P3 crítico pré-launch
- **Testes (vitest/playwright)** — ausentes em ambos os audits; ROADMAP projeta Fase 4

---

## ✅ Itens resolvidos entre audits (mai → jun)

- B1 orders e-commerce columns ausentes → ✅ migration 20260504
- B2 portfolios/portfolio_items ausentes → ✅ migration 20260504
- B3 inventory.image_url ausente → ✅ migration 20260504
- B6 NEXT_PUBLIC_APP_URL localhost em prod → ✅ Vercel atualizado
- P1 /api/content/sync sem auth → ✅ hardened (Zod + server client + getUser)
- P2 Stripe legado duplicado → ✅ removido
- P3 console.log em products.ts → ✅ removido
- SettingsView.tsx 999→238 linhas → ✅ quebrado em sub-tabs
- inventory/page.tsx 1472→514 linhas → ✅ refatorado
- products/page.tsx 1028→411 linhas → ✅ refatorado
- Sem Zod nas APIs → ✅ 8+ schemas (apiSchemas.ts)
- Sem rate limiting → ✅ DB-based aplicado (apiRateLimit.ts)
- Sem transaction atômica webhook → ✅ RPC process_webhook_atomic
- Métricas inconsistentes dashboard → ✅ labels clarificados

---

## 📋 Sessão 20/05 noite → 21/05 madrugada (~7h, 22 commits)

**Tema**: migração V4 dos módulos internos + morte da Calc Pro freemium + bug visual não resolvido.

- **Calc Pro freemium REVOGADA** (ADR-024): ADR-023 cancelado. Calc permanece grátis sem cap, sem modal de upsell. Cobrança = Hayzer completo (R$ 49-99/mês pós-launch). 9 arquivos front + backend service + migration deletados. ENV vars Calc Pro a remover do Vercel manualmente.
- **4 módulos migrados para shell V4**: /crm, /finance, /production (novos) + /orders (já estava). MAS classes CSS do ModuleShell (`.kpi-card`, `.filter-bar`, `.page-header`, etc) nunca foram extraídas do mockup `orders-v4-tom-novo.html` para `globals-v4.css` — resultado: KPIs em texto cru nos 4 módulos em prod. Bug diagnosticado por Felipe + Diego; causa raiz confirmada.
- **Bloqueador aberto**: CEO precisa decidir A.3 (reverter 4 módulos pro AppShell antigo, foca golden path) ou A.4 (Felipe extrai CSS do mockup em 45-60min, resultado híbrido). 7 módulos restantes (/inventory /products /content /decisions /catalogs /portfolios /settings) aguardam decisão.
- **Outros fixes entregues**: Stripe SDK `StripeConfig` → `API_VERSION` (desbloqueou 7 deploys ERROR), hydration #418, AppShell loop + trust middleware, V4ThemeProvider, globals-v4.css no root layout.
- **3 quick wins golden path**: /products → /orders pré-preenchido, `processNewOrder` com projectId (multi-tenant), empty states com CTA em /content /decisions /catalogs.
- **V4Shell genérico foi revertido** (quebrou /dashboard em prod — commit e63125e é rollback do f0a2700).
- Detalhe completo: `sessions/2026-05-21-madrugada-v4-3c-G7-diagnose.md`

---

## 📋 Historico de sessoes (pre-20/05/2026)

> Movido do CLAUDE.md raiz em 2026-05-20 por Lia (limpeza Status Rapido).
> Consulte os arquivos de sessao em `sessions/` para detalhe completo.

### Semana de 14-16/05

- Rebranding Hayzer (ADR-009): dominio `hayzer.com.br`, 11 arquivos atualizados
- Seguranca Tier 1 completa: HSTS, honeypot, rate-limit, WAITLIST_IP_SALT
- Logo H+raizes PNG implementado (ADR-013)
- Foco vertical maker 3D (ADR-010): landing fala so com Rafael
- Resend configurado us-east-1 verified, RESEND_API_KEY rotacionada v2
- Calculadora 3D Fase 1 em prod (`/calculadora`): gross-up correto 5 marketplaces
- Bug RLS waitlist corrigido (commit `fccd49f`, ADR-011, service_role no insert)
- PWA setup: manifest.ts + Service Worker + offline.html
- Refactor orders.tsx 695→420 linhas
- Sistema Aprendizado Continuo G7: `studies/_index.md`, piloto carla-copy
- Landing v2: paleta night+petrol+ember, Fraunces serif, grain SVG

### Semana de 17-19/05

- Dashboard V4.8 aprovado CEO (ADR-014): 8 iteracoes em 1 dia
- 3 mockups arquiteturais em prod (V1/V2/V3), Felipe converte React 20/05
- Visual Library: 9 componentes + showcase `/library` (ver `components/visual-library/CLAUDE.md`)
- ModuleShell V4 reutilizavel: `components/dashboard/v4/ModuleShell.tsx`
- Seguranca: API_RATE_LIMIT_SALT setado, 2 migrations prod (webhook_events + api_rate_limits)
- Sistema PRs Camadas 1+2+3 ativo (ADR-015)
- 7 Routines ativas em prod (ver `automation/CLAUDE.md`)
- Skill /council reforcada com 5 etapas
- Helena resolveu 4 decisoes CEO (doc: `strategy/decisoes-resolvidas-2026-05-18.md`)
- INPI: pesquisa pePI ao vivo, HAIZER classe 35 bloqueado, classe 42 livre (ADR-012)
- 2 agentes G7 novos: ana-analytics + joana-community (total: 17)
- Hardwork ativado: launch acelerado 27/06, 13 agents em 3 fases
- 3 Routines novas via Chrome MCP: concorrencia-diaria-light, concorrencia-semanal-deep, comunidades-maker-semanal
- Bugs corrigidos: kpi-hero CoverHero, /orders sem layout, CSV export
