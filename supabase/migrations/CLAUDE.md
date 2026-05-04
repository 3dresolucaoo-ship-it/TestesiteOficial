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

## Schema base

`lib/supabase/schema.sql` — schema "ground truth" rodado uma vez. Toda alteração subsequente vai como migration.

## Issues críticos

- ✅ ~~Migration faltando — colunas e-commerce em `orders`~~ → `20260504_orders_ecommerce_columns.sql`
- ✅ ~~Migration faltando — tabelas `portfolios` + `portfolio_items`~~ → `20260504_portfolios.sql`
- ✅ ~~Migration faltando — `inventory.image_url`~~ → `20260504_inventory_image_url.sql`
- ✅ Todas as migrations foram aplicadas no Supabase em 2026-05-04

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
