-- supabase/migrations/20260504_inventory_image_url.sql
-- Descrição: Adiciona image_url em inventory

ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS image_url text;
