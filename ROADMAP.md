# BVaz Hub — ROADMAP

> Itens de trabalho organizados por prioridade. Marque `[x]` quando concluído.
> Itens **🔴 Críticos** quebram a aplicação; **🟧 Importantes** comprometem qualidade; **🟡 Menores** são polish; **🚀 Vision** são fases futuras.

---

## 🚀 FASE 1 — LANÇAMENTO PÚBLICO (13/05 → 04/07/2026)

> **8 semanas** · Decisão fechada em ADR 008 (Time G7) + sessão de planejamento 13/05/2026.

### Semana 1 (13-19/05) — Foundation Marketing
- [x] Landing page (hero + features + why-different + CTA + footer) ✅ 2026-05-13
- [x] Waitlist form etapa 1 (email + nome + WhatsApp + LGPD checkbox) ✅ 2026-05-13
- [x] Tela "obrigado" + form etapa 2 (qualificação opcional) ✅ 2026-05-13
- [x] Tabela `waitlist_leads` no Supabase + RLS (migration `20260513_waitlist_leads.sql`) ✅ 2026-05-13
- [x] Captura UTM/referrer/IP/device automática (via Server Actions) ✅ 2026-05-13
- [x] Páginas LGPD: `/privacidade` + `/termos` ✅ 2026-05-13
- [x] Design system shadcn instalado + tokens Paleta B aplicada ✅ 2026-05-13
- [ ] Lead magnet definido + criado (decidido: nenhum agora, adiciona semana 2-3)
- [x] Aplicar migration `20260513_waitlist_leads.sql` no Supabase prod ✅ 2026-05-13
- [ ] Marketing diário: primeiro post LinkedIn anunciando "em breve"
- [x] Logo Hayzer (H+raízes) implementado ✅ 2026-05-15
- [x] Foco vertical maker 3D (ADR-010, copy reescrito Hero/Features/WhyDifferent/CTA) ✅ 2026-05-15
- [x] Bug RLS waitlist fixed (commit `fccd49f`, ADR-011, service_role no insert) ✅ 2026-05-15
- [x] WhatsApp CTA na tela /obrigado (componente + env var) ✅ 2026-05-15
- [x] **Resend us-east-1 verified** (recriado, RESEND_API_KEY rotacionada v2) ✅ 2026-05-15
- [x] **Calculadora 3D Fase 1** em prod (`/calculadora`): 5 inputs + 3 outputs + tabela 5 canais marketplace + slider margem + dropdown impressora + Phosphor icons + copy Carla + visual Diego ✅ 2026-05-15
- [x] **Fix UI /obrigado**: dropdown selects dark + emoji 🥳/🎉 + WhatsApp glow + grain + surface-strong utility ✅ 2026-05-15
- [x] **PT-BR formal** em textos instrucionais (decisão CEO) ✅ 2026-05-15
- [x] **Slash command /rcs** (renomeado de /rc, reforçado pra entregar bloco copiável) ✅ 2026-05-15

### Semana 2 (20-26/05) — Dashboard Real + Segurança Tier 1 + Bug Paulo
> **Gantt detalhado (plano consolidado 17/05 — CEO aprovou)**:

**SEG 20/05** — Conversão V4.3 → React começa
- [ ] Felipe: Fase 1 conversão V4.3 React — componentes (DashboardLayout + Greeting + CoverHero + KpiSatellites + NextActionCard + BentoGrid + StreakPill + RootHover)
- [ ] Bruna: Fase 1 bug Paulo — migration `webhook_events` + RPC `process_webhook_atomic` (transaction atômica insert+process+update)

**TER 21/05** — Continua React + segurança
- [ ] Felipe: Fase 1 continua (componentes complexos: charts, donut, gauge)
- [x] Bruna: Fase 2 bug Paulo — handler `app/api/webhooks/payment/route.ts` já chama RPC `process_webhook_atomic` ✅ (feito no commit `38b517e` em 17/05, mesma janela da migration. Audit Bruna 18/05 confirmou: 5 race conditions eliminadas, 5→2 roundtrips Supabase. Dead code `core/flows/processOrderAdmin.ts` identificado pra deleção)
- [x] Otávio: CSP report-only header em `next.config.ts` ✅ 2026-05-17

**QUA 22/05** — Termina React + Tier 1 restante
- [ ] Felipe: Fase 1 últimos detalhes (mobile drawer, root-hover animações)
- [ ] Otávio: Dependabot/Renovate ativo (OWASP A03 Supply Chain)
- [ ] Otávio: Zod nas APIs autenticadas (`/api/finance/*` + `/api/payment-configs`)

**QUI 23/05** — Conecta services + a11y
- [ ] Felipe: Fase 2 conecta com `services/finance.ts`, `services/financeConfig.ts`, `services/orders.ts`, etc
- [ ] Júlia: a11y audit V4 React (Axe + screen reader)
- [ ] Diego: paleta HSL 8-10 shades em `globals.css` (Refactoring UI)

**SEX 24/05** — Deploy preview + revisão semanal Pillars
- [ ] Felipe: deploy preview V4 React, CEO valida com dados REAIS
- [ ] **Revisão semanal `pillars/SCORES.md` #1** (CEO + Helena 9h)
- [ ] Otávio: rate-limit Upstash em rotas públicas

**SAB 25/05** — Marketing atrasado da Semana 1
- [ ] Marcos: 1º post LinkedIn "Hayzer em breve" (estava atrasado da Sem.1)

**DOM 26/05** — Estudo G7 #2
- [ ] Cada agente lê próximo livro da lista: Helena=7 Powers, Marcos=Influence, Sofia=Customer Success (Nick Mehta), etc

✅ **Resultado esperado**: V4 dashboard em produção com dados reais; segurança Tier 1 90% concluída; bug Paulo (transaction atômica) corrigido.

### Semana 3 (25-31/05) — Polish V4 + Analytics + Calculadora Pro + Tier 2 Segurança
> **Plano reajustado pela Helena 18/05** baseado em pilares mais fracos (Conversão 5.0, Retenção 5.0) e runway CEO. Doc completo: `strategy/decisoes-resolvidas-2026-05-18.md`.

**BLOCO A — Polish V4 React em prod com dados reais** (Felipe + Bruna)
- [ ] Polish bugs descobertos no preview 24/05
- [ ] Onboarding empty states (Sofia FP-01/02/03 — reusar `components/EmptyState.tsx`)
- [ ] Conectar últimos services se ainda faltarem

**BLOCO B — Analytics de funil instalado** (Marcos + Felipe)
- [ ] Vercel Analytics ativo
- [ ] PostHog free configurado
- [ ] Eventos instrumentados: page_view + click_cta_waitlist + waitlist_step1_done + waitlist_step2_done + calculadora_used + viu_paywall_calc_pro + clicou_comprar_calc_pro
- [ ] 3 variantes A/B de hero copy (Marcos define, Carla refina, Felipe implementa)

**BLOCO C — Lighthouse + Axe audit + fix top 3** (Júlia + Felipe)
- [ ] Lighthouse score em todas rotas públicas
- [ ] Axe issues fixados (top 3 críticos)
- [ ] Pilar Performance 6.5 → 7.5, Acessibilidade 6.5 → 7.5

**BLOCO D — Email transacional sequência D+1, D+3, D+7** (Sofia + Carla)
- [ ] Template D+1: "Bem-vindo, conta um pouco do teu maker"
- [ ] Template D+3: "Calculadora 3D — preço por canal"
- [ ] Template D+7: "Hayzer em breve — o que vem"
- [ ] Wire-up em `services/email.ts` com triggers Supabase scheduled functions OU pg_cron

**BLOCO E — Calculadora 3D Pro paga R$ 37** (Carla + Paulo + Felipe — DECISÃO HELENA 18/05)
- [ ] Carla escreve copy paywall + página venda (até qua 27/05)
- [ ] Paulo cria Stripe Payment Link R$ 37 (preço-âncora) (até qua 27/05)
- [ ] Felipe implementa lógica check + UI paywall + histórico localStorage + PDF export + multi-impressora (qui-sex 28-29/05, max 6h)
- [ ] Deploy preview sex 29/05 noite
- [ ] Sofia+Marcos divulgam no grupo Beta WhatsApp sáb 30/05

**BLOCO F — LGPD + Tier 2 Segurança** (Otávio + Bruna)
- [ ] Direito de deleção (endpoint `DELETE /api/me`)
- [ ] Vercel BotID Challenge mode no form waitlist
- [ ] Dependabot ativo (`.github/dependabot.yml` — feito 18/05 madrugada ✅)
- [ ] Sentry instalado + DSN configurado
- [ ] Audit log table + helper `services/auditLog.ts` (auth/payment/webhooks)
- [ ] Rate-limit em rotas autenticadas (`/api/finance/*`, `/api/payment-configs`)
- [ ] CSP report endpoint `/api/csp-report` apontando pro Sentry

**BLOCO G — MP OAuth (se destravar até 25/05)** (Paulo)
- [ ] MP OAuth Marketplace E2E (se ainda travado em 25/05 → adia pra Semana 5+)
- [ ] Stripe Connect cobre se MP atrasar

**Decisões CEO da Helena (resolvidas 18/05, aguardando CEO confirmar)**
- ✋ Calculadora Pro Semana 3 R$ 37
- ✋ Ritmo PR 30min/semana com gatilho redução automática
- ✋ Ordem features 1-2-3 + Calc Pro como upsell
- ✋ Deadline PR 48h com `/extend` (+48h)

### Backup pendências antigas (movidas pra Semanas 4+)
- [x] Política de Privacidade publicada ✅ 2026-05-13
- [x] Termos de Uso publicados ✅ 2026-05-13
- [x] Checkbox de consentimento no form de captura ✅ 2026-05-13
- [x] **Resend configurado (domínio + SPF/DKIM/DMARC)** ✅ 2026-05-15 — verified us-east-1
- [x] **Email de boas-vindas** ✅ 2026-05-15 — testado fim-a-fim em prod

### Semana 4 (03-09/06) — Wave 1 — Customers
- [ ] Tela `/customers` (lista + busca + filtros)
- [ ] Perfil individual `/customers/[id]`
- [ ] Métricas: top clientes, LTV, "sumiu há X dias"
- [ ] Service `services/customers.ts` completo
- [ ] Dashboard inicial com widgets de customers

### Semana 5 (10-16/06) — Admin Completo
- [ ] Rota `/admin` protegida (flag is_admin)
- [ ] Lista de usuários (filtros: waitlist/ativos/pagantes/inadimplentes)
- [ ] Perfil individual de user + ações (pausar, reativar, banir)
- [ ] Lista de waitlist com export CSV
- [ ] Métricas: signups, conversão, MRR, churn
- [ ] Tabela `audit_log` + log de ações sensíveis
- [ ] Email em massa por segmento

### Semana 6 (17-23/06) — PWA + Mobile + Polish
- [ ] manifest.json configurado
- [ ] Service Worker registrado
- [ ] Ícones (192, 512 maskable, apple-touch-icon)
- [ ] Offline fallback page
- [ ] Mobile audit em TODAS as telas (320-768px)
- [ ] Catálogo + Orçamento polidos (bugs reais reportados)

### Semana 7 (24-30/06) — Onboarding + Observability + Soft Launch
- [ ] Empty states em todas as telas vazias
- [ ] First-time experience (setup mínimo 3 telas)
- [ ] Tooltips contextuais (≥10s parado)
- [ ] Sentry instalado + capturando
- [ ] Vercel Analytics ativo
- [ ] Rolling Releases configurado
- [ ] Sequência de email transacional pós-cadastro
- [ ] Soft launch para os primeiros 50-100 waitlist
- [ ] Atendimento pelos primeiros bugs reais

### Semana 8 (01-04/07) — QA + LAUNCH PÚBLICO
- [ ] Rodar `/launch:checklist` (todos os squads)
- [ ] Otávio: auditoria Tier 1 final
- [ ] Júlia: QA completa golden path + edge cases mobile
- [ ] Sofia: UX audit primeira experiência
- [ ] Ricardo: smoke test prod + rollback testado
- [ ] Paulo: pagamento E2E sandbox + prod
- [ ] Lia: docs atualizados, ADRs criados
- [ ] **🚀 LANÇAMENTO PÚBLICO — 04/07/2026 (quinta-feira)**

---

## 🎯 PRÓXIMAS FASES (resumo)

- **Fase 2 — Estabilização** (jul-set/2026, 10 sem): testes, Sentry, otimização funil, suporte estruturado
- **Fase 3 — Crescimento** (set-dez/2026, 12 sem): Wave 2 (Pilar Produtos), Wave 8 (Marketplace + Segunda Venda — inspiração CEO 17/05), tiers, integrações WhatsApp/Instagram
- **Fase 4 — Maturidade** (dez/2026-mar/2027, 12 sem): Wave 3 (Mapa Financeiro), automações marketing, talvez primeira contratação
- **Fase 5 — Expansão** (mar-mai/2027, 10 sem): Wave 4 (Mapa Operacional), Heshiley começa em paralelo

---

## 🔴 CRÍTICOS — fazer ASAP

### Schema do banco
- [x] **Migration `orders` e-commerce columns**: `20260504_orders_ecommerce_columns.sql` ✅ 2026-05-04
- [x] **Criar tabelas `portfolios` + `portfolio_items`**: `20260504_portfolios.sql` ✅ 2026-05-04
- [x] **Adicionar `inventory.image_url`**: `20260504_inventory_image_url.sql` ✅ 2026-05-04
- [x] **Aplicar as 3 migrations no Supabase** ✅ 2026-05-04

### Configuração / Deploy
- [x] Atualizar `NEXT_PUBLIC_APP_URL` no `.env.local` ✅ 2026-05-04
- [x] Atualizar `NEXT_PUBLIC_APP_URL` no Vercel Dashboard ✅ 2026-05-05
- [x] **Código Marketplace MP** — `marketplace_fee` em `payments/mercadopago.ts` + `ProviderCredentials` ✅ 2026-05-04
- [x] Criar app **BVaz Hub** no Mercado Pago Developer Portal (Checkout Pro + OAuth habilitado) ✅ 2026-05-05
- [x] Configurar redirect URI no app MP: `https://bvaz-hub.vercel.app/api/integrations/mercadopago/callback` ✅ 2026-05-05
- [x] Atualizar `MP_CLIENT_ID` + `MP_CLIENT_SECRET` no Vercel (credenciais teste) ✅ 2026-05-06
- [ ] Testar fluxo OAuth end-to-end (clicar "Conectar Mercado Pago" em Settings)
- [ ] Ativar credenciais produtivas no app BVaz Hub (MP Developer Portal → preencher dados do negócio)
  - ⛔ **BLOQUEADO** (2026-05-07): painel MP `dx-panel-front-applications` quebrado — React error #130 em `/credentials/production` e `/edit-app` (todos os apps). Bug global do MP, status oficial diz "operational". Reproduzido em `BVaz Hub` (6340640476424801) e `lojamercadopago` (5580732761651129). Aguardar correção do MP ou abrir ticket suporte (`/developers/report`).
- [ ] Atualizar Vercel com credenciais MP produtivas após ativação

### Segurança
- [x] Validação de input via Zod em `/api/checkout`, `/api/encomenda`, `/api/catalog/quote` ✅ 2026-05-16
- [x] **🔴 Middleware bloqueando webhooks** — `/api/webhooks` adicionado em `PUBLIC_PATHS` ✅ 2026-05-17
- [x] **🔴 MP webhookSecret obrigatório** — `payments/mercadopago.ts` throw se faltar, `payment-configs/route.ts` bloqueia salvar MP sem secret ≥16 chars ✅ 2026-05-17
- [x] **🟠 `/api/content/sync` hardening** — auth + Zod + RLS server client ✅ 2026-05-17
- [ ] Zod nas APIs autenticadas (`/api/finance/fixed-costs`, `/profit-goal`, `/payment-configs`) — atualmente validação manual `typeof`
- [ ] Rate limiting em rotas públicas (`@upstash/ratelimit` ou solução DB-based replicando `waitlistRateLimit.ts`)
- [ ] CSP report-only header (`next.config.ts`)
- [ ] HSTS com `preload` (`next.config.ts`)
- [ ] Promover Vercel BotID de Log → Challenge

---

## 🟧 IMPORTANTES — próximas semanas

### Limpar código morto
- [x] Deletar pastas vazias: `Testesite3/`, `Testesite3dresolução/`, `desktop-tutorial/` ✅ 2026-05-04
- [x] Deletar `AGENTS.md` ✅ 2026-05-04
- [ ] Substituir `README.md` template por descrição real do projeto
- [x] Deletar `core/finance/invoice.ts` ✅ 2026-05-04
- [x] Deletar `core/integrations/{bling,instagram,youtube}Adapter.ts` (stubs) ✅ 2026-05-04
- [x] Deletar `core/integrations/stripe.ts` legacy + `app/api/webhooks/stripe/route.ts` ✅ 2026-05-04
- [ ] Avaliar `app/showcase/page.tsx` — remover se não usado
- [x] Remover `console.log` em `services/products.ts` ✅ 2026-05-04
- [ ] Avaliar `lib/mockData.ts` — remover ou enxugar pra dev-only

### Refatorar arquivos gigantes
- [x] Quebrar `SettingsView.tsx` (999→220 linhas) em `components/settings/` (8 sub-tabs) ✅ 2026-05-04
- [x] Quebrar `DashboardView.tsx` (804→483 linhas) — shared extraído em `components/dashboard/shared.tsx` ✅ 2026-05-04
- [ ] Mover `app/inventory/page.tsx` (1472 linhas) → componente
- [ ] Mover `app/products/page.tsx` (1028 linhas) → componente
- [ ] Mover `app/orders/page.tsx` (668 linhas) → componente

### Performance
- [ ] Otimizar `loadInitialState` (hoje: 26 queries/navegação) — usar `cache()` do React
- [ ] Remover cache in-memory de `paymentConfigService` ou substituir por **Vercel Runtime Cache**
- [ ] `requireUserId` faz 2 chamadas auth — simplificar

### Rotas API problemáticas
- [ ] `/api/content/sync` usa client browser no server — refatorar pra usar `createServerClient`
- [ ] Adicionar header `X-Robots-Tag: noindex` em `/api/*`

### Métricas inconsistentes
- [x] **Bug visível "Receita R$ 90, Lucro R$ 270"** — investigado 2026-05-08, cards medem fontes diferentes. Renomeados: "Receita Produtos" → "Receita de Pedidos", "Lucro Produtos" → "Lucro Operacional"; adicionados badges de fonte (📒 transações / ⚙️ pedidos × produção) ✅ 2026-05-08

### Finanças empresariais (ADR 004 + 005)
- [x] **Onda 1** — Renomear cards do dashboard pra evidenciar fonte ✅ 2026-05-08
- [x] **Onda 2** — MVP Break-even client-side (custos fixos, MC, ponto de equilíbrio, metas) ✅ 2026-05-08 — ver `decisions/004-financas-empresariais-mvp.md`
- [x] **Script de reconciliação** orders ↔ transactions — `POST /api/admin/reconcile-transactions` + botão "Reconciliar" no FinanceView ✅ 2026-05-08
- [x] **Onda 3** — Schema dedicado pra `fixed_costs` e `profit_goals` ✅ 2026-05-09 — migration `20260509_finance_config.sql`, rotas API server-side em `app/api/finance/{fixed-costs,profit-goal}/route.ts` (services client-side travavam por bug intermitente do supabase `getSession()`), lista granular de custos fixos por projeto + meta de lucro, com migração one-shot do localStorage legacy

### Catálogo evoluído (ADR 005 — Fase B)
- [x] **Etapa 1** — Schema `products.checkout_mode` + `variants` (jsonb) + `allows_custom` (migration `20260509_product_checkout_modes.sql`); UI admin com seletor de modo (4 cards) + editor de variantes ✅ 2026-05-09
- [x] **Etapa 2** — Catálogo público renderiza por modo via `CatalogActionButton` (4 modos: direct/variant/quote/contact_only); `QuoteModal` com form completo; `BuyButton` removido ✅ 2026-05-09
- [x] **Etapa 3** — `POST /api/catalog/quote` (público, sem auth) → cria Lead via admin client; `ContactSource` ganha `'catalog'` (label "Catálogo") ✅ 2026-05-09
- [x] **Etapa 4** — `FloatingWhatsApp` button (fixed bottom-right, pulse animation, deeplink com contexto do catálogo) ✅ 2026-05-09

---

## 🎨 DESIGN — peso visual & UX

> Feedback do usuário: "está sem peso, fontes genéricas, design genérico. Quero algo sexy, surpreendente, funcional, dinâmico, interativo, intuitivo, fácil, bom"

- [ ] **Identidade visual**: definir tipografia premium (sugestões: Inter Display, Geist Mono pra números, Cal Sans pra hero)
- [ ] **Hierarquia de peso**: títulos heavy (700-900), corpo medium (500), micro labels semibold (600 + tracking)
- [ ] **Gradientes e glow** mais ousados (já tem alguns mas tímidos)
- [ ] **Light mode**: hoje muito branco/sem alma — repensar paleta pastel + sombras
- [ ] **Micro-animações**: hover states, transições de página, skeleton loaders
- [ ] **Iconografia consistente**: padronizar tamanhos/strokes (lucide-react já é boa base)
- [ ] **Empty states ilustrados** (não só texto)
- [ ] **Toasts/notifications** com identidade (não default)
- [ ] **Settings**: reorganizar tabs — hoje confuso

---

## 🔌 INTEGRAÇÕES CROSS-MODULE

> Visão do usuário: cada módulo deve **conversar com os outros** automaticamente. Hoje estão isolados.

### Fluxo automático venda → financeiro → estoque
- [ ] Venda no catálogo → Order criada → **financeiro recebe transaction automaticamente** (já parcial em `processOrder.ts`)
- [ ] Order paga → **estoque decrementa** automaticamente (já parcial — verificar)
- [ ] Order paga → **categorizar transação** baseado no produto vendido

### Catálogo → Checkout
- [x] Checkout via Mercado Pago (preference) — implementado
- [x] **Checkout Stripe** — UI completa em Settings → Vitrine (save/activate/disconnect/sandbox) ✅ 2026-05-07
- [x] **Stripe Connect OAuth** — botão "Conectar com Stripe" + rotas `/api/integrations/stripe/{connect,callback}` ✅ 2026-05-07 (requer `STRIPE_CONNECT_CLIENT_ID` no Vercel)
- [ ] Checkout via PIX direto (sem MP/Stripe)

### Portfólio
- [ ] Mais templates além de `grid/list/minimal` (sugestões: `magazine`, `gallery`, `card-stack`, `timeline`)
- [ ] Editor de templates inline

### Impressão (Produção)
- [ ] **Bambu Lab MQTT**: integração com impressora 3D — status em tempo real, fila de jobs
- [ ] FlashForge integration (similar)
- [ ] Tela "produção ao vivo" — câmera/sensor

### Bling (NF-e/NFS-e)
- [ ] OAuth Bling no padrão de `services/paymentConfig.ts` (mesmo `payment_configs` extension)
- [ ] Emissão automática de nota ao marcar Order como `paid`
- [ ] Tab `Notas Fiscais` no módulo Financeiro

### Redes sociais
- [ ] **Instagram Graph API**: sync de posts, métricas, leads de DM
- [ ] **YouTube Data API**: sync de vídeos, views, leads de comentários
- [ ] **TikTok API** (se houver)

### Marketplaces
- [ ] **Shopee API**: importar produtos, sync de estoque, dashboards de venda
- [ ] **Mercado Livre API**: idem
- [ ] **Amazon BR**: idem
- [ ] **Tela "Onde estou vendendo mais"** — comparativo cross-marketplace
- [ ] **Importar produto de marketplace → catálogo** (one-click)

---

## 🚀 SaaS BUSINESS MODEL

> Plataforma vai ser **vendida como SaaS** + cursos paralelos. Estrutura precisa suportar isso.

### Landing pública
- [ ] Página de **vendas/landing** explicando o produto (antes do login)
- [ ] Pricing page com tiers (free/pro/team)
- [ ] Casos de uso, depoimentos, demos

### Modelo de assinatura
- [ ] Implementar tier system (free / pro / team / enterprise)
- [ ] Billing: Stripe Subscriptions OU Mercado Pago Recorrência
- [ ] Gating de features por tier (ex: free = 1 projeto, pro = ilimitado)
- [ ] Trial automático (14 dias)

### Cursos (separado do SaaS)
- [ ] Página `/cursos` ou subdomain `cursos.bvaz-hub.com`
- [ ] Player de vídeo (sugestão: Mux ou Cloudflare Stream)
- [ ] Checkout independente (Stripe Connect ou Hotmart-style)
- [ ] Acesso por tier ou compra avulsa

### Auth
- [ ] **Google OAuth login** (substituir email/password como padrão)
- [ ] Reusar token Google pra integrações posteriores (YouTube, Drive)
- [ ] Microsoft/Apple OAuth (opcional)

---

## ✅ QUALIDADE / OBSERVABILIDADE

- [ ] `vercel.ts` config tipada (rewrites, headers, crons)
- [ ] Migrar para **Vercel AI Gateway** se adicionar IA
- [ ] **Sentry** ou **Vercel Agent** pra monitoring
- [ ] Logs estruturados (pino) ao invés de `console.*`
- [ ] **shadcn/ui** pra padronizar componentes
- [ ] Testes:
  - [ ] Vitest p/ services
  - [ ] Playwright p/ flow checkout end-to-end
  - [ ] Vitest p/ engines (`core/finance/engine.ts`, `core/analytics/*`)
- [ ] Pre-commit hooks (husky + lint-staged + prettier)
- [ ] TS strict + `noUncheckedIndexedAccess`
- [ ] `loading.tsx` + `error.tsx` boundaries em cada rota
- [ ] OG images dinâmicas em `/catalogo/[slug]` via `next/og`
- [ ] Sitemap + robots.txt

---

## 🚀 VISION — Mapa de Inteligência do Negócio (ADR 006)

> **6 pilares + 1 paralelo · ordem rígida · 1 wave por vez · ritual de uso real entre cada wave.**
> Especificação completa: `decisions/006-mapa-inteligencia-negocio.md`
> Padrão de UI: `decisions/007-padrao-manual-com-lembrete-forte.md`

### Wave 0 — Fundação (sem feature visível) ✅ 2026-05-10
- [x] Migration `revenue_kind` em `products` (physical_print/filament_resale/service/accessory/digital/rental) → `20260510_products_revenue_kind.sql`
- [x] ~~Migration `inventory_movements`~~ → reaproveitada `movements` que já existia. Estendida com `unit_cost`, `organization_id`, CHECK em type/reason → `20260510_movements_extend.sql`
- [x] Migration `customers` consolidada com partial UNIQUE em (user_id, whatsapp), trigger updated_at, FK `orders.customer_id` ON DELETE SET NULL → `20260510_customers_table.sql`
- [x] Todas as tabelas/colunas novas com `organization_id uuid NULL` (preparando multi-tenant)
- [x] Smoke test em prod: SQL CHECKs validados, /crm e /finance carregam sem erro
- [ ] **Ritual de uso real antes de Wave 1**: 3-5 dias usando o app normalmente; objetivo é sentir se algo quebrou silenciosamente. Nenhuma feature nova exposta — só observar.

### Wave 1 — Pilar 3: Mapa dos Clientes
- [ ] Tela `/customers` com LTV por cliente, top N, sumiram há X dias, frequência média
- [ ] Detalhe do cliente (histórico, ticket médio, valor total)
- [ ] **Ritual de uso real (3-5 dias) antes de Wave 2**

### Wave 2 — Suppliers + Pilar 1 Evoluído
- [ ] Schema `suppliers` (nome, contato, MOQ, prazo)
- [ ] Schema `supplier_prices` time-series
- [ ] FK `inventory.supplier_id` (nullable)
- [ ] Tela `/suppliers` (CRUD)
- [ ] Recalcular margem por produto com custo médio ponderado real
- [ ] FinanceView ganha cards "Mapa do Dinheiro" (lucro real, projeção, alertas)
- [ ] **Ritual de uso real antes de Wave 3**

### Wave 3 — Pilar 4: Mapa do Estoque/Produção
- [ ] Popular `inventory_movements` em vendas/produção/compras
- [ ] Alertas de estoque baixo com previsão ("acaba em N dias")
- [ ] Capital parado (filamento sem venda há X dias)
- [ ] Fila de produção
- [ ] **Ritual de uso real antes de Wave 4**

### Wave 4a — Pilar 2: Mapa do Tempo (input manual)
- [ ] Campo `production_hours` em orders (quick-input ao marcar produzido)
- [ ] Captura de turno (`working_session`)
- [ ] "Sua hora vale R$ X" + "hora paga por produto" + ociosidade da impressora
- [ ] Padrão "manual com lembrete forte" (ADR 007) aplicado
- [ ] **Ritual de uso real antes de Wave 4b ou 5**

### Wave 4b — Integração Bambu Lab MQTT (upgrade opcional)
- [ ] Conexão MQTT (host:port + access code)
- [ ] Webhooks job start/end → popula `production_hours` automático
- [ ] Status em tempo real
- [ ] Substitui input manual da Wave 4a quando ativo

### Wave 5 — Pilar 5: Mapa do Crescimento
- [ ] Comparativos period-on-period (mês, trimestre)
- [ ] Meta vs real (expandir `profit_goals` da ADR 004)
- [ ] Tendências de margem/receita
- [ ] "Oportunidades na mesa" (alta margem + baixo volume)
- [ ] **Ritual de uso real antes de Wave 6**

### Wave 6 — Pilar 6: Guia / Copiloto (a coroa)
- [ ] Engine de regras determinísticas que cruza todos os pilares
- [ ] Card "3 ações de maior alavancagem hoje"
- [ ] Alertas priorizados (estoque, cliente sumindo, meta atrasada)
- [ ] Sugestões com cálculo embutido (mostra a lógica)
- [ ] Dispensar com motivo (loop de feedback)

### Wave 7 — Market Intel (paralelo, low-priority)
- [ ] `competitors` + `competitor_observations` (URL, preço, snapshot date)
- [ ] `social_snapshots` (platform, followers, engagement, source manual|api)
- [ ] Banner forte se >90d sem atualização (concorrentes) / >45d (social)
- [ ] Migration path: manual → API quando integração IG/YT pronta

### Wave 8 — Marketplace Integrado + Segunda Venda (set/2026, 3-4 sem)

> **Inspiração**: app "Segunda Venda" mostrado pelo CEO 17/05 (vídeo Facebook). Captura WhatsApp+email do cliente do marketplace + automações condicionais. Ouro pra maker BR que vende em ML/Shopee/Amazon mas perde o relacionamento.
>
> **Diferencial Hayzer**: maker já tem catálogo/estoque/financeiro no mesmo Hayzer = automação cruza dados (não só captura). Sem assinar 4 ferramentas (Bling + ZapiAuto + Segunda Venda + etc) = tudo num só.

**Estrutura `/marketplace`**:
- [ ] Aba `/marketplace/anuncios` — sync com ML/Shopee/Amazon (anúncios ativos, pausados, problemas, ranking de busca)
- [ ] Aba `/marketplace/perguntas` — perguntas pendentes consolidadas (responde de 1 lugar só)
- [ ] **Aba `/marketplace/segunda-venda`** ⭐ feature âncora:
  - [ ] Captura automática: cliente novo após pagamento ML/Shopee
  - [ ] Enriquecimento: busca WhatsApp via tracking + email via NF-e Bling
  - [ ] Engine de automações condicionais (regras: produto X / cidade Y / valor Z → mensagem)
  - [ ] Disparo via WhatsApp Business API + Resend (email)
  - [ ] Templates editáveis com microcopy maker BR (Carla revisa)
- [ ] Aba `/marketplace/comissao` — gross-up real ML (12-19%), Shopee (14%), Amazon (15%), Magalu (var.)
- [ ] Aba `/marketplace/importar` — importar produto de marketplace → catálogo Hayzer one-click

**Schemas novos**:
- `marketplaces` (id, user_id, provider, credentials_oauth, status)
- `marketplace_listings` (id, marketplace_id, external_id, title, price, stock, status)
- `marketplace_orders` (id, marketplace_id, external_order_id, customer_data jsonb, captured_contact bool)
- `second_sale_automations` (id, user_id, name, conditions jsonb, action jsonb, enabled)
- `second_sale_dispatches` (id, automation_id, order_id, channel, status, sent_at)

**APIs externas necessárias**:
- Mercado Livre Developers API (OAuth + tokens)
- Shopee Open Platform (autorização lojista)
- Amazon Seller Central API (SP-API)
- Bling NF-e (extrair email da nota fiscal)
- WhatsApp Business API ou Meta Cloud API (envio mensagens)

**Comparativos BR (vencer)**: Anymarket (R$ 297/mês), Plugg.to (R$ 197/mês), ECOMMENU (R$ 160/mês). Hayzer entrega o que eles + Segunda Venda + integração com calculadora/estoque/financeiro. Diferencial duro.

**Tempo estimado**: 3-4 semanas (1 dev full-time). Início sugerido: set/2026 (Fase 3 Crescimento, pós-launch público + 8 sem de estabilização).

---

## 🎯 ESCALA — quando o produto crescer

- [ ] **Multi-tenant via `organization_id`** (hoje só `user_id` — não suporta times)
- [ ] **Soft-deletes** (`deleted_at` em vez de DELETE)
- [ ] **Audit log** (tabela `audit_log`: user, action, table, before/after)
- [ ] **Background jobs** com Vercel Queues (email pós-pagamento, sync periódico, retry de webhook)
- [ ] **Webhooks duráveis** — Vercel Queue ao invés de processar inline
- [ ] **Read replicas** (Supabase + region-pinned reads)

---

## 🎯 BACKLOG CONVERSÃO REACT V4 → FELIPE

> Itens identificados na auditoria G7 do V4.1/V4.2 (17/05) que **Felipe decide** quando converter o mockup HTML pra React. Tudo aqui está fora do escopo do HTML estático (precisa state management, libs, ou decisão arquitetural maior).

### Funcionais (precisam lib React)
- [ ] **Tooltips charts** ao hover (donut, bars 6 meses, gauge) — usar Recharts ou Visx, não JS vanilla
- [ ] **Search Cmd+K** global na topbar — usar `cmdk` lib (Vercel/Linear pattern)
- [ ] **Filtros de período pill toggle** ("Hoje · 7d · Mês · Trimestre · Custom") — precisa state + recalcular dataviz
- [ ] **Drag widgets reorder** do bento — `@dnd-kit/sortable`, persistir em user_preferences DB
- [ ] **Variable reward animations contínuas** (números "dançam" quando novo pedido) — Framer Motion + Supabase realtime subscription

### UX / onboarding (Sofia 17/05)
- [ ] **Banner "Modo demonstração"** no topo quando user ainda não cadastrou nada real — pill discreta com link "conectar primeiras fontes"
- [ ] **Card de onboarding 3 passos** (cadastrar primeiro pedido → produto → impressora) — visível só até completar 3, depois some
- [ ] **Empty states maker-específicos** em cada bento card (não Lorem genérico):
  - Fila impressão: "Nenhum job agendado. Cadastra a primeira impressão?"
  - Em produção AGORA: "Nenhuma impressora ativa no momento."
  - Top produtos: "Aparece após o primeiro pedido."
  - Bars 6 meses: "Histórico aparece a partir do segundo mês."
  - Donut canais: "Conecte pelo menos 2 canais para comparar margem."
- [ ] **Streak pill aparece só D3+** (não no D1 com dados falsos "12 dias") — lógica baseada em primeiro_login
- [ ] **Alerta filamento crítico no TOPO do bento** quando ativo (não em span-4 abaixo do fold)

### A11y / QA (Júlia 17/05)
- [ ] **`kpi-mini-delta` sr-only "aumento de"/"queda de"** antes do valor (color-only fix)
- [ ] **Donut segmentos com `<title>` SVG individual** (screen reader lê valores por fatia)
- [ ] **Edge case `data-target="0"`** — fallback "R$ 0" sem decimal estranho
- [ ] **Mini-list item nome com `overflow:hidden text-overflow:ellipsis`** (produto nome 80 chars não quebra layout)
- [ ] **Donut hover stroke-width 24** (era 26, colide com segmentos adjacentes)
- [ ] **Tooltip de busca** ("Buscar pedidos, produtos, clientes") na lupa da topbar
- [ ] **now-print-led glow estático** em prefers-reduced-motion (atual mantém box-shadow)

### Realtime / observabilidade
- [ ] **Card "última atualização"** por bento card individual ("atualizou há 30s")
- [ ] **Status connection** explícito quando perde conexão Supabase realtime
- [ ] **Otimistic updates** ao marcar pedido como entregue / dispensar próxima ação

### Métrica + lógica
- [ ] Próxima ação sugerida **conectada com engine real** (Wave 6 ROADMAP — Pilar 6 Copiloto)
- [ ] Cover progress **calculado real**: % atual / meta do mês via `profit_goals`
- [ ] Streak real baseado em `analytics.last_active_dates`

---

## 📜 HISTÓRICO DE CONCLUSÕES

> Quando terminar item, mover daqui pra cima como `[x]`.
> Lista compacta de marcos atingidos:

- 2026-05-17 · **Segurança Tier 1 — 3 fixes críticos aplicados** (auditoria Otávio detectou bugs CRÍTICOS além do ROADMAP):
  - 🔴 **Middleware bloqueava webhooks** — `/api/webhooks/*` fazia 307 → /login (gateway nunca alcançava handler, pagamento aprovado não virava Order). Fix: `/api/webhooks` adicionado em `PUBLIC_PATHS` (`middleware.ts`). Comentário explicando que auth é via signature do payload, não cookie.
  - 🔴 **MP webhook aceitava qualquer payload** — `payments/mercadopago.ts:121` só verificava signature SE `webhookSecret` configurado. Sem secret = fraude trivial (atacante forja payment approved). Fix: agora throw obrigatório (mesmo padrão do Stripe). Plus: `app/api/payment-configs/route.ts` bloqueia salvar config MP sem webhookSecret válido (mínimo 16 chars).
  - 🟠 **`/api/content/sync` totalmente exposto** — sem auth, sem Zod, usando client browser no server, escrevia sem filtrar `user_id`. Cross-tenant write trivial. Fix: refatoração completa — `getUser()` obrigatório + `createServerClient()` (RLS) + Zod schema novo (`contentSyncSchema` em `services/apiSchemas.ts`).
  - **TypeScript 0 erros** após os 5 edits. Pendentes Tier 1 (não-críticos pra launch, agendados Semana 2): rate-limit APIs públicas, Zod nas APIs autenticadas (finance + payment-configs), CSP report-only, HSTS preload, Vercel BotID Challenge.
- 2026-05-17 · **Dashboard V4 híbrido HTML gerado** — `mockups/dashboard/v4-hibrido.html` (2742 linhas) consolidando winners V1 (donut + bars 6 meses + fila Bambu + gauge semicircular) + V3 (cover editorial 96px Fraunces + raízes SVG fundo + watermark + bento hover) + correções (dark soft `#161B1F`, body 17px, raízes ANIMADAS no hover via stroke-dashoffset CSS puro, light mode toggle + localStorage). 9 mecanismos dopamina aplicados (validação científica via external-researcher). Logo PNG preservada (ADR-013). Microcopy maker BR real. 10/10 checks ✅. Aguarda CEO abrir `hayzer.com.br/mockups/v4-hibrido` e validar pra Felipe converter React.
- 2026-05-17 · **ADR-013 + memória ativa diego-designer + brand BRIEF logo congelada** — logo Hayzer (`public/logo-hayzer.png` — H+raízes) virou regra fixa pra todos os agentes G7. Nunca mais redesenhar/recriar tipograficamente sem pedido explícito CEO. Sistema aprendizado G7: 2 agentes com memória ativa (carla-copy piloto 16/05 + diego-designer 17/05).
- 2026-05-09 · **Onda 3 — finanças no DB** — `fixed_costs` (lista granular: DAS, aluguel, software…) + `profit_goals` (meta mensal) por projeto, com RLS, FK em `projects`, e migração one-shot do localStorage legacy. UI: project selector + lista editável + total automático. Refator de `BreakEvenSection` em `components/FinanceView.tsx`. Tipos novos em `core/finance/financeConfigTypes.ts`. Service `services/financeConfig.ts`.
- 2026-05-10 · **Validação E2E Fase B + fix RPC** — submit de orçamento testado em produção (catálogo público → modal → submit). Bug encontrado: `operator does not exist: uuid = text` na RPC `create_catalog_lead` (linha 42, comparação `products.id` uuid com `p_product_id` text). Fix em `20260510_catalog_quote_lead_rpc_fix.sql` — cast explícito `p_product_id::uuid` + validação prévia de formato pra erro PT-BR amigável. Re-teste OK: Lead criado com `source='catalog'`, status='new', urgência+descrição em notes, aparece no CRM.
- 2026-05-09 · **Fase B Catálogo evoluído (ADR 005)** — 4 etapas em sequência: (1) schema `products.checkout_mode/variants/allows_custom` + UI admin; (2) `CatalogActionButton` dispatcher + `QuoteModal` no catálogo público (4 modos: direct/variant/quote/contact_only) + remoção do `BuyButton`; (3) `POST /api/catalog/quote` (público) cria Lead com `source='catalog'`; (4) `FloatingWhatsApp` fixo no canto da vitrine. `ContactSource` extendido com `'catalog'`.
  - **Bug encontrado e corrigido**: services client-side (`fixedCostsService.listByProject`) ficavam pendurados em "Carregando…" eterno porque `requireUserId()` chamava `supabase.auth.getSession()` que trava intermitentemente em produção (mesmo bug que causa `[Auth] getSession timed out` no AuthContext). **Fix definitivo**: migrar pra rotas API server-side (`/api/finance/fixed-costs/{,[id]}`, `/api/finance/profit-goal`) que resolvem auth via `getUser()` cookies-based. Mesmo padrão do `/api/admin/reconcile-transactions` que funciona.
- 2026-05-08 · **Finanças MVP completo** — Onda 1+2+3: rota `/api/admin/reconcile-transactions` (cria tx faltantes pra orders pagos legacy), tab "Ponto de Equilíbrio" no FinanceView com MC por produto + break-even + metas (localStorage), labels do dashboard separados por fonte (📒 transações / ⚙️ produção).
- 2026-05-07 · **Stripe Connect OAuth** — botão "Conectar com Stripe" um-clique implementado. Rotas `/api/integrations/stripe/connect` e `/callback` seguem mesmo padrão MP. Form manual mantido como fallback "avançado". Requer `STRIPE_CONNECT_CLIENT_ID` (ca_...) do Stripe Dashboard → Connect Settings.
- 2026-05-07 · **Stripe UI completa** — `StorefrontTab` agora salva/ativa/desconecta credenciais Stripe via `/api/payment-configs`. Inclui toggle test/live mode + webhook secret. Hedging contra bloqueador MP.
- 2026-05-06 · `MP_CLIENT_ID` + `MP_CLIENT_SECRET` configurados no Vercel (credenciais teste) + redeploy `7efdbf6`
- 2026-05-05 · Deploy `2c11391` em produção (https://bvaz-hub.vercel.app — refactor stubs)
- 2026-05-05 · App BVaz Hub criado no MP Developer (OAuth + redirect URI configurados)
- 2026-05-05 · `NEXT_PUBLIC_APP_URL` atualizado no Vercel
- 2026-04-28 · OAuth Mercado Pago implementado (callback + refresh + UI Settings)
- 2026-04-28 · `payment_configs` table + RPC atomic activation
- 2026-04-25 · Catálogos com 3 templates (grid/list/minimal)
- 2026-04-25 · Inventory `filament_uso` (impressão/venda/ambos)
