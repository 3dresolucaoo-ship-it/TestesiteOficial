-- supabase/migrations/20260504_portfolios.sql
-- Descrição: Cria tabelas portfolios + portfolio_items

CREATE TABLE IF NOT EXISTS portfolios (
  id           text          PRIMARY KEY,
  user_id      uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id   text          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name         text          NOT NULL,
  slug         text          NOT NULL,
  bio          text          NOT NULL DEFAULT '',
  avatar_url   text,
  whatsapp     text,
  catalog_slug text,
  is_public    boolean       NOT NULL DEFAULT true,
  created_at   timestamptz   NOT NULL DEFAULT now()
);

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portfolios_own" ON portfolios FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS portfolios_user_id_idx ON portfolios(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS portfolios_slug_uniq ON portfolios(user_id, slug);

-- ─── Portfolio Items ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS portfolio_items (
  id            text          PRIMARY KEY,
  user_id       uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id  text          NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  title         text          NOT NULL,
  description   text          NOT NULL DEFAULT '',
  image_url     text,
  sort_order    integer       NOT NULL DEFAULT 0,
  created_at    timestamptz   NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portfolio_items_own" ON portfolio_items FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS portfolio_items_user_id_idx ON portfolio_items(user_id);
CREATE INDEX IF NOT EXISTS portfolio_items_portfolio_id_idx ON portfolio_items(portfolio_id);
