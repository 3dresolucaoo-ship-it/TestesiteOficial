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
| catalogs.ts | 120 | catalogs | ✅ `project_id` em listCatalogs/updateCatalog/deleteCatalog (fix 2026-05-18) |
| config.ts | 37 | config | ✅ |
| content.ts | 127 | content | ✅ `project_id` em getAll/update/delete (fix 2026-05-18) |
| decisions.ts | 85 | decisions | ✅ `project_id` em getAll/update/delete (fix 2026-05-18) |
| finance.ts | 90 | transactions | ✅ `project_id` adicionado em todas as queries (fix 2026-05-18) |
| financeConfig.ts | 100 | fixed_costs + profit_goals | ✅ Onda 3 (custos fixos + meta por projeto) |
| inventory.ts | 305 | inventory + movements | ✅ `project_id` em getAll/update/delete de inventoryService e movementsService (fix 2026-05-18) |
| leads.ts | ~270 | leads + affiliates | ✅ `project_id` em getAll/update/delete. `leadsService.convertToOrder()` adicionado (Etapa 3 golden path #1, 2026-05-20). `leadFromDB` mapeia `convertedOrderId`. `leadToDB` persiste `converted_order_id`. |
| mpTokenRefresh.ts | 92 | payment_configs | ✅ refresh OAuth MP |
| orders.ts | ~115 | orders | ✅ `project_id` em getAll/update/delete (fix 2026-05-18). `fromDB`/`toDB` mapeiam `sourceLeadId` ↔ `source_lead_id` (Etapa 3 golden path #1, 2026-05-20). |
| paymentConfig.ts | 316 | payment_configs | ✅ robusto, com cache + auto-refresh |
| payments.ts | 198 | (abstração) | ✅ resolve provider via DB ou env |
| portfolios.ts | 172 | portfolios + portfolio_items | ✅ (tabelas criadas em migration 20260504) |
| production.ts | — | production | ✅ `project_id` ativo em getAll (migration `20260518_production_project_id` aplicada em prod 2026-05-18) |
| products.ts | 148 | products | ✅ `project_id` em getAll/update/delete (fix 2026-05-18) · ⚠️ console.log linha 75 |
| profiles.ts | 46 | profiles | ✅ |
| projects.ts | 72 | projects | ✅ |
| email.ts | 143 | (Resend SDK) | ✅ Fase 1 — wrapper Resend, template welcome HTML+texto, graceful sem key (15/05) |
| waitlist.ts | 174 | waitlist_leads | ✅ Fase 1 — usa service_role no insert/update (RLS+RETURNING fix 15/05, commit `fccd49f`) |
| waitlistRateLimit.ts | 85 | waitlist_leads | ✅ hash SHA-256(IP+salt) + count 24h via service_role (fail-open). Requer `SUPABASE_SERVICE_ROLE_KEY` no env |
| waitlistSchema.ts | — | (Zod) | ✅ schemas etapa 1, etapa 2, bot guards (honeypot/time), LeadCaptureMeta. SEGMENT_OPTIONS refeitas (3D-focused, ADR-010) |
| apiRateLimit.ts | 183 | api_rate_limits | ✅ Otávio 17/05 — genérico por endpoint, SHA-256(IP+`API_RATE_LIMIT_SALT`) + count janela via service_role (fail-OPEN). Helpers `checkApiRateLimit`, `recordApiHit`, `enforceApiRateLimit`, `getClientIp`. Aplicado em `/api/checkout` (20/min), `/api/encomenda` (20/min), `/api/catalog/quote` (10/min). Migration: `20260518_api_rate_limits.sql`. |
| apiSchemas.ts | 246 | (Zod) | ✅ Otávio 17/05 — schemas Zod compartilhados pras APIs públicas + finance + payment-configs. Inclui `checkoutSchema`, `encomendaSchema`, `quoteSchema`, `contentSyncSchema`, `fixedCostCreateSchema`, `fixedCostPatchSchema`, `profitGoalSchema`, `paymentConfigSchema` (discriminated union por provider). Helper `zodErrorToPtBr` retorna `{ message, fields }`. |
| ~~calcProSubscription.ts~~ | — | ~~calc_pro_subscriptions~~ | ❌ REMOVIDO 2026-05-21 — Calc Pro freemium descontinuado pelo CEO. ADR-023 revogado. Migration nunca foi aplicada em prod. |
| notifications.ts | ~110 | notifications | ✅ Bruna 18/05 — `listUnreadNotifications`, `markAsRead`, `markAllAsRead`, `getUnreadCount`, `createNotification` (service_role), helpers `getUnreadNotificationsForCurrentUser` e `getUnreadCountForCurrentUser`. Requer migration `20260518_notifications_and_search.sql` aplicada. |
| search.ts | ~130 | search_index (view mat.) | ✅ Bruna 18/05 — `globalSearch` (FTS postgres + fallback ILIKE), `searchForCurrentUser`, `refreshSearchIndex` (service_role). Multi-tenant via filtro user_id+project_id explicito (view mat. sem RLS propria). Requer migration `20260518_notifications_and_search.sql` aplicada. |

## Issues conhecidos

- ✅ ~~`finance.ts` sem `project_id` em queries~~ — corrigido 2026-05-18.
- ✅ ~~`ordersService`, `inventoryService`, `movementsService`, `contentService`, `decisionsService`, `leadsService`, `affiliatesService`, `productsService`, `catalogsService` sem `project_id`~~ — todos corrigidos 2026-05-18: `getAll(projectId?)` opcional, `update` + `delete` com `.eq('project_id', ...)`. Callers DELETE no store.tsx ajustados com lookup em `prevState`. `tsc --noEmit` passa zero erros.
- ✅ ~~`productionService` PENDENTE~~ — migration `20260518_production_project_id.sql` aplicada em prod 2026-05-18 via Supabase MCP. Backfill setou `project_id` como o primeiro projeto do user. RLS recreated (sem alterar logic). `productionService.getAll` ativado com `.eq('project_id', projectId)` condicional. `ProductionItem`/`toDB` opcionais — V4 dashboard pode passar projectId, store legado pode omitir.

- ✅ ~~`orders.ts` colunas e-commerce~~ — migration aplicada 2026-05-04
- ✅ ~~`portfolios.ts` tabelas inexistentes~~ — migration aplicada 2026-05-04
- ✅ ~~`inventory.ts` image_url ausente~~ — migration aplicada 2026-05-04
- ✅ ~~Webhook 2 roundtrips separados (race condition / duplicate charge)~~ — resolvido 2026-05-18: RPC `process_webhook_atomic` + tabela `webhook_events` (migration `20260518_webhook_events.sql`). Handler refatorado em `app/api/webhooks/payment/route.ts`.
- ⚠️ `products.ts:75,83` tem console.log/error que deveriam usar `serviceError`
- ⚠️ `paymentConfig.ts:78` cache in-memory pode vazar entre requests no Fluid Compute
- ⚠️ Todos os services dependem de `requireUserId` (lib/getUser.ts) que faz 2 chamadas auth
- 📌 **Pattern RLS+RETURNING**: tabelas com policy INSERT pra `anon` mas SEM policy SELECT geram erro 42501 ("violates row-level security") quando supabase-js faz `.insert().select()` (RETURNING precisa de SELECT). Solução: usar `getSupabaseAdmin()` no service. Server Action faz validação antes — seguro. Caso registrado em `decisions/011-rls-returning-anon.md` (a criar).

## Padrão de cliente

- **API routes / pages SSR**: `createServerClient()` (cookie-based, RLS)
- **Webhooks / admin**: `getSupabaseAdmin()` (service role key, bypass RLS)
- **Client-side via store**: usa `lib/supabaseClient.ts` (browser client)

## Related

- `lib/supabase/schema.sql` — schema base
- `supabase/migrations/` — alterações
- `lib/types.ts` — tipos compartilhados
- `core/flows/processOrder.ts` — orquestração de side-effects
