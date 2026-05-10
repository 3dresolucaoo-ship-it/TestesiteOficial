-- Wave 0 — Fundação (1/3) — taxonomia de receita em products
-- ADR 006 — Mapa de Inteligência do Negócio
--
-- Adiciona coluna revenue_kind para classificar o tipo de receita gerada pelo
-- produto. Sem isso, qualquer analytics de margem/segmento fica enviesada
-- porque o schema atual assume "produto físico impresso" implicitamente.
--
-- Aditivo: dados existentes recebem 'physical_print' por DEFAULT (cobre o
-- caso dominante hoje). Nada quebra.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS revenue_kind text NOT NULL DEFAULT 'physical_print';

ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_revenue_kind_check;

ALTER TABLE products
  ADD CONSTRAINT products_revenue_kind_check
  CHECK (revenue_kind IN (
    'physical_print',   -- objeto impresso pela própria impressora
    'filament_resale',  -- revenda de filamento (g ou rolo)
    'service',          -- serviço (modelagem, consultoria, manutenção)
    'accessory',        -- acessórios revendidos (bicos, peças, etc)
    'digital',          -- arquivo .stl, curso, ebook
    'rental'            -- aluguel de impressora ou equipamento
  ));

CREATE INDEX IF NOT EXISTS products_revenue_kind_idx ON products(revenue_kind);
