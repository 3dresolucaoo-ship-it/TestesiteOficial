# app/ — Next.js App Router

> Páginas + rotas API. Cada pasta vira rota.

## Convenções

- Páginas SSR (Server Component) buscam dados via `services/*` ou `lib/serverDataLoader.ts`
- Páginas client-side têm `'use client'` no topo e usam `useStore()` pra ler estado
- Rotas dinâmicas usam `[slug]` ou `[projectId]`
- API routes em `app/api/` (ver `app/api/CLAUDE.md`)
- Páginas públicas (sem auth): `/login`, `/showcase`, `/catalogo/*`, `/portfolio/*`, `/checkout/*` (ver `middleware.ts`)

## Estrutura

| Rota | Tipo | Service principal |
|---|---|---|
| `/dashboard` | SSR | `lib/serverDataLoader` |
| `/metrics` | client | `useStore` |
| `/projects` | SSR | `loadInitialState` |
| `/projects/[projectId]` | client | `useStore` |
| `/projects/[projectId]/{content,crm,decisions,finance,inventory,operations}` | client | `useStore` |
| `/finance`, `/orders`, `/inventory`, `/products`, `/production`, `/content`, `/crm`, `/decisions` | client | `useStore` |
| `/catalogs`, `/portfolios` | SSR | services |
| `/catalogo/[slug]`, `/portfolio/[slug]` | público | services |
| `/checkout` | público | `/api/checkout` |
| `/settings` | SSR | `loadInitialState` |
| `/login` | público | `useAuth` |
| `/library` | SSR guard admin | `getUser` + `isAdminEmail` |

## Status

- ✅ `app/inventory/page.tsx` — refatorado 2026-05-19 (1001→372 linhas). 11 sub-componentes em `app/inventory/_components/` (types.ts, ItemForm, MovementForm, InventoryKpiRow, InventoryCatBreakdown, InventoryTopProfit, InventoryLowStockBanner, InventoryFilters, InventoryEmptyState, InventoryMovementLog + pré-existentes: CatBadge, ItemCard, ItemRow, ImageUploader, helpers.ts). TSC 0 erros, ESLint 0 warnings.
- ✅ `app/products/page.tsx` — refatorado (604 → 285 linhas). Sub-componentes em `app/products/_components/`: ProductCard, ProductKpiRow, ProductBestWorst, ProductFilters, useProductActions, helpers. (2026-05-19)
- ✅ `app/orders/page.tsx` — migrado para ModuleShell V4.8 (2026-05-19). KpiRow + FilterBar + search integrados. Validacao visual em prod pendente (CEO). **01/06**: handleCreate/Edit/Delete migrados pra Server Actions em `app/orders/actions.ts` (createOrder/updateOrder/deleteOrder) + optimistic update via rawDispatch + rollback em falha. Side effects ADD_ORDER (auto production task + transaction) NAO replicados — ficam pra Bloco 5.
- ✅ `app/orders/actions.ts` — NOVO 01/06. Server Actions cookie-based pro CRUD pedidos. Resolve bug auth-js 2.106.0 que travava browser client writes. Multi-tenant guard user_id+project_id. Zod schemas.
- ✅ `app/production/page.tsx` — migrado para ModuleShell V4 (2026-05-20). 680 linhas -> 280 linhas. 7 sub-componentes em `app/production/_components/`. KpiRow hero (Impressoes Ativas) + 2 satellites (Tempo Restante, Lucro Previsto). Tabs Em andamento/Finalizadas/Todas. FilterBar com search + filtro impressora. PrinterBoard com startTimes via useState no handler (sem useEffect). TSC 0 erros, ESLint 0 warnings.
- ✅ `app/crm/page.tsx` — migrado para ModuleShell V4 (2026-05-20). KpiRow hero (leads ativos) + 3 satellites + tabs Pipeline/Clientes. **01/06**: handleCreate/Edit/Delete + handleConvertSubmit + handleStatusChange usam Server Actions de `app/crm/actions.ts`. Drag-and-drop estilo Trello no kanban (@dnd-kit + PointerSensor/TouchSensor/KeyboardSensor). rawDispatch (NAO dispatch) atualiza store local apos persist no DB.
- ✅ `app/crm/actions.ts` — NOVO 01/06. Server Actions cookie-based: createLead + updateLead + deleteLead + updateLeadStatus + convertLeadToOrder. Validado em prod via SQL JOIN bidirecional lead.converted_order_id ↔ order.source_lead_id.
- ✅ `app/crm/_components/LeadKanbanBoard.tsx` — refeito 01/06 com DndContext + DroppableColumn (useDroppable) + DraggableLeadCard (useDraggable wrapper). DragOverlay visual rotate 2deg + shadow-2xl. Colunas vazias mostram "Solta aqui". Mobile long-press 200ms ativa drag.
- ✅ `app/finance/page.tsx` — migrado para ModuleShell V4 (2026-05-20). KpiRow hero (lucro liquido mes) + 3 satellites (receita/despesas/margem com alerta amber <15%) + tabs Lancamentos/Custos Fixos/Break Even. globals-v4.css importado na page. Validacao visual em prod pendente (CEO).
- ❌ `app/showcase/page.tsx` — provavelmente legado, avaliar
- ✅ `app/orders/loading.tsx` — skeleton screen V4 (Onda Perf 2026-05-20)
- ✅ `app/dashboard/loading.tsx` — skeleton screen V4 (Onda Perf 2026-05-20)
- ✅ `app/crm/loading.tsx` — skeleton screen V4 (Onda Perf 2026-05-20)
- ✅ `app/customers/page.tsx` — modulo Clientes V4 (feature/customers-v4 2026-05-20). ModuleShell + KpiRow hero LTV + satellites (ticket medio + sumidos/VIPs) + tabs (todos/vip/recorrente/sumido) + tabela desktop + cards mobile + modal perfil cliente + frase viva humanizada. Zero any, TSC 0 erros. Clientes derivados de state.orders (sem tabela propria).
- ✅ `app/customers/loading.tsx` — skeleton screen V4 (feature/customers-v4 2026-05-20)
- ✅ `app/finance/loading.tsx` — skeleton screen V4 (Onda Perf 2026-05-20)
- ⏳ Falta `loading.tsx` e `error.tsx` nas rotas restantes (/inventory, /products, /production, /decisions, /content, /settings)
- ⏳ `app/projects/[projectId]/{...}` páginas duplicam módulos globais — decidir se ficam

## Performance

- ✅ `loadInitialState` refatorado (Onda Perf 2026-05-20): 13 queries → 2 queries (projects + config). React `cache()` ativo. Outros dados carregados lazy via `lib/serverDataLoaderLazy.ts` ou store cliente `loadFromSupabase()`.
- ✅ Skeleton screens implementados em 4 rotas pesadas (orders/dashboard/crm/finance).
- ✅ `lottie-react` lazy via `next/dynamic` — elimina ~150KB do chunk inicial.
- ⚠️ TODO CEO: validar em Network tab prod que Fraunces weight 600 tem `Highest` priority. Next.js 16 + `preload: true` deve gerar automaticamente, mas confirmar.
- ✅ Lazy loading por modulo no store (Onda Perf 2 — branch `feature/v4-onda-perf2-store`): useStoreModule('orders') + useStoreModule('leads'). Mount client: 2 queries SSR + queries on-demand. /orders e /crm exibem skeleton V4 durante fetch, nunca mais retornam null.

## Related

- `app/api/CLAUDE.md` — convenções de API
- `lib/serverDataLoader.ts` — fonte do bulk fetch
- `lib/store.tsx` — state global client
