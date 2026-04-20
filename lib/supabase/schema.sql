-- ─── BVaz Hub — Supabase Schema ──────────────────────────────────────────────
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Safe to re-run (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).

-- ─── Profiles (role system) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text        NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-create a profile row on every new sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Projects ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          text        PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  status      text        NOT NULL DEFAULT 'active',
  description text        NOT NULL DEFAULT '',
  type        text,
  modules     text[]      NOT NULL DEFAULT '{}',
  color       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);

-- ─── Orders ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                 text          PRIMARY KEY,
  user_id            uuid          REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id         text          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  client_name        text          NOT NULL,
  origin             text          NOT NULL DEFAULT 'whatsapp',
  item               text          NOT NULL,
  value              numeric(12,2) NOT NULL DEFAULT 0,
  status             text          NOT NULL DEFAULT 'lead',
  date               text          NOT NULL,
  inventory_item_id  text,
  qty_used           numeric(10,3),
  product_id         text,
  production_cost    numeric(12,2),
  created_at         timestamptz   NOT NULL DEFAULT now()
);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_id      text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS production_cost numeric(12,2);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);

-- ─── Production ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS production (
  id               text          PRIMARY KEY,
  user_id          uuid          REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id         text,
  client_name      text          NOT NULL,
  item             text          NOT NULL,
  printer          text          NOT NULL,
  status           text          NOT NULL DEFAULT 'waiting',
  estimated_hours  numeric(6,2)  NOT NULL DEFAULT 0,
  priority         integer       NOT NULL DEFAULT 0
);
ALTER TABLE production ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS production_user_id_idx ON production(user_id);

-- ─── Content ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content (
  id              text         PRIMARY KEY,
  user_id         uuid         REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id      text         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  idea            text         NOT NULL,
  status          text         NOT NULL DEFAULT 'idea',
  platform        text         NOT NULL DEFAULT 'instagram',
  views           integer      NOT NULL DEFAULT 0,
  leads           integer      NOT NULL DEFAULT 0,
  sales_generated integer      NOT NULL DEFAULT 0,
  link            text         NOT NULL DEFAULT '',
  date            text         NOT NULL,
  likes           integer               DEFAULT 0,
  comments        integer               DEFAULT 0,
  shares          integer               DEFAULT 0,
  saves           integer               DEFAULT 0,
  created_at      timestamptz  NOT NULL DEFAULT now()
);
ALTER TABLE content ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS content_user_id_idx ON content(user_id);

-- ─── Decisions ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS decisions (
  id         text  PRIMARY KEY,
  user_id    uuid  REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id text  NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  decision   text  NOT NULL,
  impact     text  NOT NULL DEFAULT '',
  date       text  NOT NULL,
  status     text  NOT NULL DEFAULT 'active'
);
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS decisions_user_id_idx ON decisions(user_id);

-- ─── Transactions (Finance) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id          text          PRIMARY KEY,
  user_id     uuid          REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id  text          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type        text          NOT NULL,
  category    text          NOT NULL,
  description text          NOT NULL DEFAULT '',
  value       numeric(12,2) NOT NULL DEFAULT 0,
  date        text          NOT NULL,
  source      text          NOT NULL DEFAULT '',
  created_at  timestamptz   NOT NULL DEFAULT now()
);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);

-- ─── Leads ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id               text          PRIMARY KEY,
  user_id          uuid          REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id       text          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name             text          NOT NULL,
  contact          text          NOT NULL DEFAULT '',
  source           text          NOT NULL DEFAULT 'other',
  status           text          NOT NULL DEFAULT 'new',
  value            numeric(12,2) NOT NULL DEFAULT 0,
  notes            text          NOT NULL DEFAULT '',
  date             text          NOT NULL,
  last_contact_at  text,
  expected_value   numeric(12,2),
  assigned_to      text,
  created_at       timestamptz   NOT NULL DEFAULT now()
);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS leads_user_id_idx ON leads(user_id);

-- ─── Affiliates ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS affiliates (
  id           text         PRIMARY KEY,
  user_id      uuid         REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id   text         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name         text         NOT NULL,
  platform     text         NOT NULL DEFAULT '',
  code         text         NOT NULL DEFAULT '',
  total_sales  integer      NOT NULL DEFAULT 0,
  commission   numeric(5,2) NOT NULL DEFAULT 15,
  status       text         NOT NULL DEFAULT 'active',
  date         text         NOT NULL
);
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS affiliates_user_id_idx ON affiliates(user_id);

-- ─── Inventory ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory (
  id          text          PRIMARY KEY,
  user_id     uuid          REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id  text          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category    text          NOT NULL DEFAULT 'other',
  name        text          NOT NULL,
  sku         text          NOT NULL DEFAULT '',
  quantity    numeric(10,3) NOT NULL DEFAULT 0,
  unit        text          NOT NULL DEFAULT 'un',
  cost_price  numeric(12,2) NOT NULL DEFAULT 0,
  sale_price  numeric(12,2) NOT NULL DEFAULT 0,
  notes       text          NOT NULL DEFAULT '',
  min_stock   numeric(10,3)          DEFAULT 0
);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS inventory_user_id_idx ON inventory(user_id);

-- ─── Stock Movements ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS movements (
  id          text          PRIMARY KEY,
  user_id     uuid          REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id  text          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  item_id     text          NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  type        text          NOT NULL,
  quantity    numeric(10,3) NOT NULL,
  reason      text          NOT NULL,
  order_id    text,
  date        text          NOT NULL,
  notes       text          NOT NULL DEFAULT '',
  created_at  timestamptz   NOT NULL DEFAULT now()
);
ALTER TABLE movements ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS movements_user_id_idx ON movements(user_id);

-- ─── Products (3D printing templates) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                   text          PRIMARY KEY,
  user_id              uuid          REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id           text          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name                 text          NOT NULL,
  material_grams       numeric(10,2) NOT NULL DEFAULT 0,
  print_time_hours     numeric(8,2)  NOT NULL DEFAULT 0,
  failure_rate         numeric(5,3)  NOT NULL DEFAULT 0.10,
  energy_cost_per_hour numeric(8,2)  NOT NULL DEFAULT 0.50,
  support_cost         numeric(12,2) NOT NULL DEFAULT 0,
  margin_percentage    numeric(6,4)  NOT NULL DEFAULT 0.30,
  sale_price           numeric(12,2) NOT NULL DEFAULT 0,
  inventory_item_id    text          REFERENCES inventory(id) ON DELETE SET NULL,
  notes                text          NOT NULL DEFAULT '',
  image_url            text,
  created_at           timestamptz   NOT NULL DEFAULT now()
);
ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id           uuid          REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS support_cost      numeric(12,2) NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS margin_percentage numeric(6,4)  NOT NULL DEFAULT 0.30;
CREATE INDEX IF NOT EXISTS products_user_id_idx ON products(user_id);

-- ─── Config (per-user) ────────────────────────────────────────────────────────
-- Supports auth mode (user_id key) and local-dev mode (legacy id=1 row).
CREATE TABLE IF NOT EXISTS config (
  id          integer     PRIMARY KEY DEFAULT 1,
  user_id     uuid        UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  data        jsonb       NOT NULL DEFAULT '{}'::jsonb,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE config ADD COLUMN IF NOT EXISTS user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

-- ─── Row Level Security (per-user isolation) ──────────────────────────────────

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE production   ENABLE ROW LEVEL SECURITY;
ALTER TABLE content      ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads        ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory    ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE config       ENABLE ROW LEVEL SECURITY;

-- Remove stale permissive policies if present
DO $$ BEGIN
  DROP POLICY IF EXISTS "allow_authenticated" ON profiles;
  DROP POLICY IF EXISTS "allow_authenticated" ON projects;
  DROP POLICY IF EXISTS "allow_authenticated" ON orders;
  DROP POLICY IF EXISTS "allow_authenticated" ON production;
  DROP POLICY IF EXISTS "allow_authenticated" ON content;
  DROP POLICY IF EXISTS "allow_authenticated" ON decisions;
  DROP POLICY IF EXISTS "allow_authenticated" ON transactions;
  DROP POLICY IF EXISTS "allow_authenticated" ON leads;
  DROP POLICY IF EXISTS "allow_authenticated" ON affiliates;
  DROP POLICY IF EXISTS "allow_authenticated" ON inventory;
  DROP POLICY IF EXISTS "allow_authenticated" ON movements;
  DROP POLICY IF EXISTS "allow_authenticated" ON products;
  DROP POLICY IF EXISTS "allow_authenticated" ON config;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Profiles: each user accesses only their own row
DROP POLICY IF EXISTS "profiles_own"      ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Admin users can also manage other profiles (e.g. to change roles)
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Data tables: each user can only see/modify their own rows
DROP POLICY IF EXISTS "projects_own"     ON projects;
DROP POLICY IF EXISTS "orders_own"       ON orders;
DROP POLICY IF EXISTS "production_own"   ON production;
DROP POLICY IF EXISTS "content_own"      ON content;
DROP POLICY IF EXISTS "decisions_own"    ON decisions;
DROP POLICY IF EXISTS "transactions_own" ON transactions;
DROP POLICY IF EXISTS "leads_own"        ON leads;
DROP POLICY IF EXISTS "affiliates_own"   ON affiliates;
DROP POLICY IF EXISTS "inventory_own"    ON inventory;
DROP POLICY IF EXISTS "movements_own"    ON movements;
DROP POLICY IF EXISTS "products_own"     ON products;
DROP POLICY IF EXISTS "config_own"       ON config;

CREATE POLICY "projects_own"     ON projects     FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "orders_own"       ON orders       FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "production_own"   ON production   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "content_own"      ON content      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "decisions_own"    ON decisions    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "transactions_own" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "leads_own"        ON leads        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "affiliates_own"   ON affiliates   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "inventory_own"    ON inventory    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "movements_own"    ON movements    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "products_own"     ON products     FOR ALL USING (auth.uid() = user_id);

-- Config: user sees their own row, OR the shared legacy row (id=1, user_id NULL)
CREATE POLICY "config_own" ON config
  FOR ALL USING (
    (user_id IS NOT NULL AND auth.uid() = user_id)
    OR
    (user_id IS NULL AND id = 1)
  );

-- ─── Supabase Storage: product images ────────────────────────────────────────
-- In Supabase dashboard → Storage → New bucket:
--   Name: products-images   Public: YES

-- ─── Realtime (optional) ─────────────────────────────────────────────────────
-- ALTER PUBLICATION supabase_realtime ADD TABLE projects;
-- ALTER PUBLICATION supabase_realtime ADD TABLE orders;
-- ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
-- ALTER PUBLICATION supabase_realtime ADD TABLE inventory;
-- ALTER PUBLICATION supabase_realtime ADD TABLE movements;
