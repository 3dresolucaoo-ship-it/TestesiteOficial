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

## Status

- ❌ `app/inventory/page.tsx` (1472 linhas) — refatorar pra componente
- ❌ `app/products/page.tsx` (1028 linhas) — refatorar
- ❌ `app/orders/page.tsx` (668 linhas) — refatorar
- ❌ `app/showcase/page.tsx` — provavelmente legado, avaliar
- ⏳ Falta `loading.tsx` e `error.tsx` em todas rotas
- ⏳ `app/projects/[projectId]/{...}` páginas duplicam módulos globais — decidir se ficam

## Performance

- ⚠️ `loadInitialState` chamado em layout.tsx + várias pages = 26 queries por navegação. Otimizar com `cache()` do React.

## Related

- `app/api/CLAUDE.md` — convenções de API
- `lib/serverDataLoader.ts` — fonte do bulk fetch
- `lib/store.tsx` — state global client
