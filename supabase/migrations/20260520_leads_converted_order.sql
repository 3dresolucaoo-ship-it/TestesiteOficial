-- ─── Migration: leads_converted_order ─────────────────────────────────────────
-- Etapa 3 golden path #1: lead → pedido manual
--
-- Por que:
--   Maker registrava lead no CRM e precisava recopiar todos os dados à mão em
--   /orders. Lead ficava órfão. Esta migration fecha o ciclo:
--     leads.converted_order_id  → UUID do pedido gerado pela conversão
--     orders.source_lead_id     → UUID do lead de origem (rastreabilidade)
--
-- Idempotente: ADD COLUMN IF NOT EXISTS garante re-run seguro.
-- ──────────────────────────────────────────────────────────────────────────────

-- 1. Campo na tabela leads: referência ao pedido criado
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS converted_order_id text REFERENCES orders(id) ON DELETE SET NULL;

-- Índice pra consultas de filtro "convertido / não convertido"
CREATE INDEX IF NOT EXISTS leads_converted_order_id_idx ON leads(converted_order_id);

-- 2. Campo na tabela orders: rastrear lead de origem
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS source_lead_id text REFERENCES leads(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS orders_source_lead_id_idx ON orders(source_lead_id);

-- 3. As políticas RLS existentes (leads_own / orders_own) já cobrem os novos
--    campos (policy FOR ALL não precisa ser recriada pra novos campos na mesma
--    tabela). Nenhuma policy nova necessária.

-- 4. Comentários de coluna (documentação inline no DB)
COMMENT ON COLUMN leads.converted_order_id IS
  'ID do pedido criado a partir deste lead via "Converter em pedido". NULL = não convertido ainda.';

COMMENT ON COLUMN orders.source_lead_id IS
  'ID do lead CRM que originou este pedido (quando criado via conversão). NULL = pedido avulso.';
