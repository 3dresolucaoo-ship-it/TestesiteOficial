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
