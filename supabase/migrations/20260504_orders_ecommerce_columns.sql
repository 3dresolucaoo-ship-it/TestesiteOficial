-- supabase/migrations/20260504_orders_ecommerce_columns.sql
-- Descrição: Adiciona colunas e-commerce em orders (source, catalog_slug, payment_id, payment_status, customer_whatsapp)

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS source            text,
  ADD COLUMN IF NOT EXISTS catalog_slug      text,
  ADD COLUMN IF NOT EXISTS payment_id        text,
  ADD COLUMN IF NOT EXISTS payment_status    text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS customer_whatsapp text;

CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_id_uniq
  ON orders(payment_id) WHERE payment_id IS NOT NULL;
