# BVaz Hub — ROADMAP

> Itens de trabalho organizados por prioridade. Marque `[x]` quando concluído.
> Itens **🔴 Críticos** quebram a aplicação; **🟧 Importantes** comprometem qualidade; **🟡 Menores** são polish; **🚀 Vision** são fases futuras.

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
- [ ] Validação de input via Zod em `/api/checkout`, `/api/encomenda` (XSS possível em `clientName`)
- [ ] Rate limiting em rotas públicas (`@upstash/ratelimit` ou Vercel BotID)

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

## 🎯 ESCALA — quando o produto crescer

- [ ] **Multi-tenant via `organization_id`** (hoje só `user_id` — não suporta times)
- [ ] **Soft-deletes** (`deleted_at` em vez de DELETE)
- [ ] **Audit log** (tabela `audit_log`: user, action, table, before/after)
- [ ] **Background jobs** com Vercel Queues (email pós-pagamento, sync periódico, retry de webhook)
- [ ] **Webhooks duráveis** — Vercel Queue ao invés de processar inline
- [ ] **Read replicas** (Supabase + region-pinned reads)

---

## 📜 HISTÓRICO DE CONCLUSÕES

> Quando terminar item, mover daqui pra cima como `[x]`.
> Lista compacta de marcos atingidos:

- 2026-05-09 · **Onda 3 — finanças no DB** — `fixed_costs` (lista granular: DAS, aluguel, software…) + `profit_goals` (meta mensal) por projeto, com RLS, FK em `projects`, e migração one-shot do localStorage legacy. UI: project selector + lista editável + total automático. Refator de `BreakEvenSection` em `components/FinanceView.tsx`. Tipos novos em `core/finance/financeConfigTypes.ts`. Service `services/financeConfig.ts`.
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
