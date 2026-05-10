-- Wave 0 — Fundação (2/3) — estender tabela movements existente
-- ADR 006 — Mapa de Inteligência do Negócio
--
-- A tabela `movements` já existe no schema mas estava sem CHECKs e sem
-- preço unitário (necessário pra custo médio ponderado real na Wave 2).
--
-- Aditivo:
-- - unit_cost numeric(12,2) NULL — custo unitário no momento do movimento
--   (snapshot histórico; permite custo médio ponderado quando preencher
--   em entradas)
-- - organization_id uuid NULL — preparação multi-tenant (ADR de escala)
-- - CHECK em type alinhado com TS (`'in' | 'out'`)
-- - CHECK em reason alinhado com TS MovementReason
--   (purchase | sale | printing | damage | adjustment)
--
-- Não mexe em RLS (policy `movements_own` já existe e é correta).
-- Não popula nada (Wave 3 cuida disso).

ALTER TABLE movements
  ADD COLUMN IF NOT EXISTS unit_cost       numeric(12,2);

ALTER TABLE movements
  ADD COLUMN IF NOT EXISTS organization_id uuid;

ALTER TABLE movements
  DROP CONSTRAINT IF EXISTS movements_type_check;

ALTER TABLE movements
  ADD CONSTRAINT movements_type_check
  CHECK (type IN ('in', 'out'));

ALTER TABLE movements
  DROP CONSTRAINT IF EXISTS movements_reason_check;

ALTER TABLE movements
  ADD CONSTRAINT movements_reason_check
  CHECK (reason IN ('purchase', 'sale', 'printing', 'damage', 'adjustment'));

CREATE INDEX IF NOT EXISTS movements_organization_id_idx ON movements(organization_id);
CREATE INDEX IF NOT EXISTS movements_item_id_idx         ON movements(item_id);
