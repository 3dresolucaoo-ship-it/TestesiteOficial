# services/ — Camada de Acesso a Dados

> Lógica de DB SEMPRE aqui, nunca direto em pages/components.
> Cada arquivo = 1 tabela do Supabase.

## Convenções

- Service exporta **objeto com métodos** (`export const ordersService = { getAll, create, update, delete }`)
- Conversão DB ↔ TS: `fromDB(row)` / `toDB(item, userId)` no topo do arquivo
- **Sempre filtrar por `user_id`** (RLS depende disso)
- Erros via `serviceError(context, error)` de `@/lib/serviceError`
- Validação via `validateRequired(context, fields)` antes de insert
- **Padrão**:
  ```ts
  async getAll(): Promise<Item[]> {
    const userId = await requireUserId()
    const { data, error } = await supabase.from('table').select('*').eq('user_id', userId)
    if (error) serviceError('xxxService.getAll', error)
    return (data ?? []).map(fromDB)
  }
  ```

## Status atual

| Service | Linhas | Tabela | Status |
|---|---|---|---|
| catalogs.ts | 107 | catalogs | ✅ |
| config.ts | 37 | config | ✅ |
| content.ts | 114 | content | ✅ |
| decisions.ts | 72 | decisions | ✅ |
| finance.ts | 76 | transactions | ✅ |
| inventory.ts | 280 | inventory + movements | ✅ (`image_url` adicionado em migration 20260504) |
| leads.ts | — | leads + affiliates | ✅ |
| mpTokenRefresh.ts | 92 | payment_configs | ✅ refresh OAuth MP |
| orders.ts | 96 | orders | ✅ (colunas e-commerce adicionadas em migration 20260504) |
| paymentConfig.ts | 316 | payment_configs | ✅ robusto, com cache + auto-refresh |
| payments.ts | 198 | (abstração) | ✅ resolve provider via DB ou env |
| portfolios.ts | 172 | portfolios + portfolio_items | ✅ (tabelas criadas em migration 20260504) |
| production.ts | — | production | ✅ |
| products.ts | 126 | products | ⚠️ console.log linha 75 |
| profiles.ts | 46 | profiles | ✅ |
| projects.ts | 72 | projects | ✅ |

## Issues conhecidos

- ✅ ~~`orders.ts` colunas e-commerce~~ — migration aplicada 2026-05-04
- ✅ ~~`portfolios.ts` tabelas inexistentes~~ — migration aplicada 2026-05-04
- ✅ ~~`inventory.ts` image_url ausente~~ — migration aplicada 2026-05-04
- ⚠️ `products.ts:75,83` tem console.log/error que deveriam usar `serviceError`
- ⚠️ `paymentConfig.ts:78` cache in-memory pode vazar entre requests no Fluid Compute
- ⚠️ Todos os services dependem de `requireUserId` (lib/getUser.ts) que faz 2 chamadas auth

## Padrão de cliente

- **API routes / pages SSR**: `createServerClient()` (cookie-based, RLS)
- **Webhooks / admin**: `getSupabaseAdmin()` (service role key, bypass RLS)
- **Client-side via store**: usa `lib/supabaseClient.ts` (browser client)

## Related

- `lib/supabase/schema.sql` — schema base
- `supabase/migrations/` — alterações
- `lib/types.ts` — tipos compartilhados
- `core/flows/processOrder.ts` — orquestração de side-effects
