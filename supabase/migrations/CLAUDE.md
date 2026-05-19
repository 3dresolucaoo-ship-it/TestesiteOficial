# supabase/migrations/ — Database Migrations

> SQL versionado. Aplicado via Supabase Dashboard → SQL Editor OU `supabase db push`.

## Convenções

- Nome: `YYYYMMDD_descricao_curta.sql`
- **Idempotente**: usar `IF NOT EXISTS`, `CREATE OR REPLACE`, `ADD COLUMN IF NOT EXISTS`
- **Reversível** quando possível: comentar o `DOWN` no fim do arquivo
- **RLS sempre**: toda tabela nova precisa `ALTER TABLE x ENABLE ROW LEVEL SECURITY` + policy
- **`user_id` sempre**: toda tabela do schema precisa coluna `user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE`
- **Index em `user_id`**: `CREATE INDEX IF NOT EXISTS x_user_id_idx ON x(user_id)`

## Migrations existentes

| Arquivo | Descrição |
|---|---|
| `20260425_catalog_template.sql` | Adiciona `catalogs.template` (grid/list/minimal) |
| `20260425_inventory_filament_uso.sql` | Adiciona `inventory.filament_uso` |
| `20260428_payment_configs.sql` | Cria `payment_configs` + RPC `set_active_payment_config` |
| `20260428_payment_configs_oauth.sql` | Adiciona `refresh_token`, `token_expires_at`, `mp_user_id` |
| `20260504_orders_ecommerce_columns.sql` | Adiciona `source`, `catalog_slug`, `payment_id`, `payment_status`, `customer_whatsapp` + UNIQUE(payment_id) |
| `20260504_portfolios.sql` | Cria `portfolios` + `portfolio_items` com RLS |
| `20260504_inventory_image_url.sql` | Adiciona `inventory.image_url` |
| `20260509_finance_config.sql` | Cria `fixed_costs` + `profit_goals` (RLS, FK projects) |
| `20260509_product_checkout_modes.sql` | Adiciona `products.checkout_mode` + `variants` (jsonb) + `allows_custom` (Fase B / ADR 005) |
| `20260509_catalog_quote_lead_rpc.sql` | RPC `create_catalog_lead` (SECURITY DEFINER) — endpoint público de orçamento bypassa RLS sem expor service_role |
| `20260510_catalog_quote_lead_rpc_fix.sql` | Fix da RPC: `products.id` é uuid, comparação com `p_product_id` (text) falhava com `operator does not exist: uuid = text`. Adicionado cast explícito + validação prévia de formato uuid pra dar erro PT-BR amigável. |
| `20260510_products_revenue_kind.sql` | **Wave 0 (1/3)** — Adiciona `products.revenue_kind` (CHECK 6 valores: physical_print, filament_resale, service, accessory, digital, rental). Default `'physical_print'` cobre dados existentes. Base do Pilar 1 do ADR 006. |
| `20260510_movements_extend.sql` | **Wave 0 (2/3)** — Estende `movements` (tabela já existia, só agora vai ser usada pra valer): `unit_cost numeric(12,2) NULL`, `organization_id uuid NULL`, CHECK em `type` (`'in','out'`) e `reason` (`purchase|sale|printing|damage|adjustment`, alinhado com TS `MovementReason`). Não popula nada — Wave 3 cuida. |
| `20260510_customers_table.sql` | **Wave 0 (3/3)** — Cria `customers` (id, user_id, organization_id, project_id, name, whatsapp, email, notes, created_at, updated_at) com RLS, partial UNIQUE em (user_id, whatsapp), trigger updated_at com search_path imutável. Adiciona `orders.customer_id text NULL REFERENCES customers(id) ON DELETE SET NULL`. Tabela vazia — migração de dados (dedup de orders.client_*) fica pra Wave 1. |
| `20260513_waitlist_leads.sql` | **Fase 1 — landing pré-launch.** Cria `waitlist_leads` (~30 colunas: etapa 1, etapa 2, UTM/geo, `ip_hash` SHA-256 pra rate-limit LGPD-friendly, status CRM, double opt-in). 5 índices, trigger updated_at, 4 policies RLS (insert público, select/update/delete admin via `raw_app_meta_data->>'is_admin'`). Extensions `pgcrypto` + `citext` (email case-insensitive). |
| `20260513_waitlist_updated_at_search_path_fix` (inline) | Fix `update_waitlist_leads_updated_at` com `set search_path = ''` + `pg_catalog.now()`. Mesma defesa aplicada em `customers_function_search_path_fix`. Resolve advisor `function_search_path_mutable`. |
| `20260518_webhook_events.sql` | **Fix bug crítico: duplicate charge (Paulo/Stripe Press 17/05).** Cria `webhook_events` (provider, event_id, event_type, payload, processed_at) com UNIQUE(provider, event_id) + RLS deny-all (só service_role). Cria RPC `process_webhook_atomic` (SECURITY DEFINER, search_path imutável): lock atômico de evento + INSERT order/production/transaction em UMA única transação Postgres. Handler `/api/webhooks/payment` refatorado pra chamar a RPC — elimina race condition entre SELECT idempotency-check e INSERTs separados que causava duplicate charge em retry simultâneo do gateway. |
| `20260518_api_rate_limits.sql` | **Tier 1 rate-limit DB-based (Otávio 17/05).** Cria `api_rate_limits` (endpoint, ip_hash, meta jsonb, created_at) + 2 índices (lookup composto + cleanup created_at) + RLS deny-all (só service_role). Suporta rate-limit por endpoint usado em `/api/checkout` (20/min), `/api/encomenda` (20/min), `/api/catalog/quote` (10/min). Fail-OPEN no service. NÃO usa Upstash Redis ainda (custo + setup) — versão Upstash fica pra pós-launch quando passar de 5k req/dia. |
| `20260518_enable_pg_cron_cleanup.sql` | **Cleanup automático api_rate_limits (Ricardo 18/05 00h).** Habilita pg_cron extension + cria job `cleanup-api-rate-limits` (diário 3h UTC = 00h BRT) que deleta rows com mais de 7 dias. Fecha gap P1 do audit Ricardo — tabela não cresce indefinidamente. DOWN: `SELECT cron.unschedule('cleanup-api-rate-limits'); DROP EXTENSION pg_cron;` |
| `20260518_production_project_id.sql` | **Multi-tenant fix Bruna (18/05 tarde).** ALTER TABLE production ADD COLUMN project_id text REFERENCES projects(id) ON DELETE SET NULL. Backfill pelo primeiro projeto do user (created_at ASC). 2 índices (composto project_id+priority, isolado project_id). RLS recreated mantendo logic user_id (filtro project_id enforced no service layer). `projects.id` é text — schema.sql stale dizia uuid. Aplicada em prod via Supabase MCP. `productionService.getAll(projectId?)` agora filtra condicionalmente. |
| `20260518_notifications_and_search.sql` | **Sino + lupa do dashboard V4 (Bruna 18/05 noite).** Tabela `notifications` (uuid PK, user_id, project_id text, type CHECK 7 eventos, title/body/link, read/read_at). RLS: SELECT/UPDATE/DELETE own user, INSERT bloqueado pra authenticated (service_role bypassa). 2 indices (parcial WHERE read=false + composto user+project). View materializada `search_index` (orders + customers + products com searchable_text em portugues). Indice GIN tsvector + UNIQUE (type,id,project_id) para REFRESH CONCURRENTLY. Funcao `refresh_search_index()` SECURITY DEFINER. Ajustes vs spec: orders usa id como titulo (nao code), customers usa whatsapp (nao phone), CAST(products.id AS text) por possivel uuid no DB. **NAO APLICADA** — aguardando aprovacao CEO. Services: `services/notifications.ts` e `services/search.ts`. |

## Schema base

`lib/supabase/schema.sql` — schema "ground truth" rodado uma vez. Toda alteração subsequente vai como migration.

## Issues críticos

- ✅ ~~Migration faltando — colunas e-commerce em `orders`~~ → `20260504_orders_ecommerce_columns.sql`
- ✅ ~~Migration faltando — tabelas `portfolios` + `portfolio_items`~~ → `20260504_portfolios.sql`
- ✅ ~~Migration faltando — `inventory.image_url`~~ → `20260504_inventory_image_url.sql`
- ✅ Todas as migrations foram aplicadas no Supabase em 2026-05-04
- ✅ `20260509_finance_config.sql` aplicada em 2026-05-09
- ✅ `20260509_product_checkout_modes.sql` aplicada em 2026-05-09
- ✅ `20260510_*` (Wave 0 — fix RPC catálogo + 3 migrations Fundação ADR 006) aplicadas em 2026-05-10
- ✅ `20260513_waitlist_leads.sql` + fix search_path da trigger function aplicadas em 2026-05-13 (Fase 1 — landing pré-launch)
- ✅ `20260518_webhook_events.sql` (tabela + RPC `process_webhook_atomic`) aplicada em 2026-05-17 via Supabase MCP (`apply_migration`). Resolve race condition / duplicate charge nos webhooks Stripe/MP.
- ✅ `20260518_api_rate_limits.sql` (tabela `api_rate_limits` + 2 índices + RLS deny-all) **APLICADA em prod em 2026-05-17** (confirmado via Supabase MCP `execute_sql` em 2026-05-17 23h59 — tabela existe com 5 colunas, RLS ativo). Usada pelas rotas `/api/checkout` (20/min), `/api/encomenda` (20/min), `/api/catalog/quote` (10/min) através do `services/apiRateLimit.ts`. Combinada com `API_RATE_LIMIT_SALT` env var setada no Vercel (deploy `D1YRg3yBF` 2026-05-17), rate-limit Tier 1 está 100% funcional.
- ✅ `20260518_enable_pg_cron_cleanup.sql` **APLICADA em prod em 2026-05-18 00h** via Supabase MCP `apply_migration`. Habilita pg_cron + cria job `cleanup-api-rate-limits` (jobid 1, schedule `0 3 * * *` UTC = 00h BRT, active=true) que deleta rows de `api_rate_limits` com mais de 7 dias. Resolve gap P1 do audit Ricardo (DevOps) — tabela não cresce indefinidamente. Steady-state estimado: ~7k rows.
- ✅ `20260518_production_project_id.sql` **APLICADA em prod em 2026-05-18 tarde** via Supabase MCP `apply_migration`. Primeira tentativa falhou com `uuid REFERENCES projects(id)` (erro `42804: incompatible types: uuid and text` — confirmado via `execute_sql` que `projects.id` é text, schema.sql stale). Re-aplicada com `text REFERENCES projects(id)` — sucesso. Backfill setou project_id de rows existentes pelo primeiro projeto do user. `productionService.getAll(projectId?)` ativado com `.eq('project_id', projectId)` condicional. Fecha último gap multi-tenant detectado pela Bruna no fix de 11 services.
- 📌 `20260518_notifications_and_search.sql` **NAO APLICADA** — aguardando aprovacao CEO. Arquivo criado e revisado. Aplicar via Supabase MCP quando aprovado.

## ⚠️ Schema.sql está stale (2026-05-10)

`lib/supabase/schema.sql` reflete o schema antigo em alguns pontos importantes:

- `products.id` → schema.sql diz `text`, DB real é `uuid` (gerado por `uuid_generate_v4()`)
- `orders.product_id` → schema.sql diz `text`, DB real é `uuid` (alinhado com products.id)

**Fonte de verdade = migrations + DB**, não o schema.sql. Antes de criar RPC ou query nova, rodar `\d <tabela>` no SQL Editor pra confirmar tipos reais. Bug 2026-05-10 da catalog quote (uuid=text) veio de confiar no schema.sql stale.

## Template pra nova migration

```sql
-- supabase/migrations/YYYYMMDD_<descricao>.sql
-- Descrição: <o que faz>

ALTER TABLE my_table
  ADD COLUMN IF NOT EXISTS new_col text;

-- Se for tabela nova:
-- CREATE TABLE IF NOT EXISTS my_new_table (...);
-- ALTER TABLE my_new_table ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "my_new_table_own" ON my_new_table FOR ALL USING (auth.uid() = user_id);
-- CREATE INDEX IF NOT EXISTS my_new_table_user_id_idx ON my_new_table(user_id);
```

## Related

- `lib/supabase/schema.sql` — schema base (deve refletir o estado consolidado)
- `services/*` — código que depende dessas tabelas
- `ROADMAP.md` § "🔴 Críticos / Schema do banco"
