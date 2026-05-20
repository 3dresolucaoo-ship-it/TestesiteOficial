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
- ✅ `app/orders/page.tsx` — migrado para ModuleShell V4.8 (2026-05-19). KpiRow + FilterBar + search integrados. Validacao visual em prod pendente (CEO).
- ✅ `app/crm/page.tsx` — migrado para ModuleShell V4 (2026-05-20). KpiRow hero (leads ativos) + 3 satellites + tabs Pipeline/Clientes.
- ✅ `app/finance/page.tsx` — migrado para ModuleShell V4 (2026-05-20). KpiRow hero (lucro liquido mes) + 3 satellites (receita/despesas/margem com alerta amber <15%) + tabs Lancamentos/Custos Fixos/Break Even. globals-v4.css importado na page. Validacao visual em prod pendente (CEO).
- ❌ `app/showcase/page.tsx` — provavelmente legado, avaliar
- ⏳ Falta `loading.tsx` e `error.tsx` em todas rotas
- ⏳ `app/projects/[projectId]/{...}` páginas duplicam módulos globais — decidir se ficam

## Performance

- ⚠️ `loadInitialState` chamado em layout.tsx + várias pages = 26 queries por navegação. Otimizar com `cache()` do React.

## Related

- `app/api/CLAUDE.md` — convenções de API
- `lib/serverDataLoader.ts` — fonte do bulk fetch
- `lib/store.tsx` — state global client
