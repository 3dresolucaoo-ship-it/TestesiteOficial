-- Wave 0 — Fundação (3/3) — tabela customers consolidada + FK em orders
-- ADR 006 — Mapa de Inteligência do Negócio (Pilar 3)
--
-- Hoje cliente é só campo livre em orders (`client_name`, `client_whatsapp`,
-- `client_email`). Sem entidade consolidada, é impossível calcular LTV,
-- detectar quem sumiu, ver top clientes — base de Pilar 3.
--
-- Esta migration cria a tabela e o FK opcional em orders. NÃO migra dados:
-- a Wave 1 introduz uma tela "Importar de pedidos existentes" que faz dedup
-- com preview e confirmação do usuário (UX > migration silenciosa).
--
-- Aditivo total:
-- - Orders antigos: customer_id = NULL (continuam funcionando lendo
--   client_name/whatsapp/email como sempre)
-- - Orders novos: ganharão customer_id quando Wave 1 estiver pronta
-- - Campos client_* em orders permanecem fonte de verdade até Wave 1

CREATE TABLE IF NOT EXISTS customers (
  id              text          PRIMARY KEY,
  user_id         uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid,
  project_id      text          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name            text          NOT NULL,
  whatsapp        text,
  email           text,
  notes           text          NOT NULL DEFAULT '',
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customers_user_id_idx         ON customers(user_id);
CREATE INDEX IF NOT EXISTS customers_project_id_idx      ON customers(project_id);
CREATE INDEX IF NOT EXISTS customers_organization_id_idx ON customers(organization_id);

-- Evita duplicar mesmo cliente quando há whatsapp informado.
-- Partial index: permite múltiplos NULL (clientes sem whatsapp cadastrado).
CREATE UNIQUE INDEX IF NOT EXISTS customers_user_whatsapp_unique
  ON customers(user_id, whatsapp)
  WHERE whatsapp IS NOT NULL;

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers_own" ON customers;
CREATE POLICY "customers_own" ON customers
  FOR ALL USING (auth.uid() = user_id);

-- Trigger pra updated_at automático
CREATE OR REPLACE FUNCTION customers_set_updated_at()
RETURNS trigger LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS customers_updated_at_trigger ON customers;
CREATE TRIGGER customers_updated_at_trigger
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION customers_set_updated_at();

-- FK opcional em orders. ON DELETE SET NULL: se cliente é apagado, pedido
-- não some — fica como histórico anônimo (mantém valor financeiro).
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_id text
    REFERENCES customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders(customer_id);
