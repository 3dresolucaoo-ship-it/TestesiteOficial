# CONTEXTO MÍNIMO DO PROJETO

## Stack
- Next.js 16 App Router · React 19 · TypeScript · Tailwind 4
- Supabase (DB + Auth + RLS) · Stripe · Vercel

## Estrutura de pastas
```
app/          → rotas (App Router)
components/   → UI components
services/     → lógica de negócio + acesso ao DB
lib/          → supabase client, types, store, utils
core/         → módulos domain (catalog, inventory, finance…)
skills/       → este diretório
```

## Módulos ativos
| Módulo     | Rota               | Service             |
|------------|--------------------|---------------------|
| vendas     | /orders            | services/orders.ts  |
| estoque    | /inventory         | services/inventory.ts |
| produção   | /production        | services/production.ts |
| financeiro | /finance           | services/finance.ts |
| catálogo   | /catalogo/[slug]   | services/catalogs.ts |
| produtos   | /products          | services/products.ts |

## Regras invariantes
- **project_id** obrigatório em toda query ao DB
- Nunca misturar dados entre projetos
- RLS ativo em todas as tabelas (user_id isolation)
- Não recriar sistema — corrigir fluxos existentes

## Clients Supabase
- `lib/supabaseClient.ts` → client-side
- `lib/supabaseAdmin.ts` → server-side (bypassa RLS)

## State global
- `lib/store.tsx` → Zustand store

## Tipos
- `lib/types.ts` → todos os tipos do domínio

## Checklist project_id
1. Service recebe project_id como parâmetro?
2. Query filtra `.eq('project_id', project_id)`?
3. Frontend passa project_id via context/prop?
