-- supabase/migrations/20260509_finance_config.sql
-- Descrição: Cria fixed_costs (lista granular de custos fixos) e profit_goals
-- (meta mensal por projeto) — antes ficava só em localStorage do FinanceView.

-- ─── Fixed Costs ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fixed_costs (
  id          text          PRIMARY KEY,
  user_id     uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id  text          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label       text          NOT NULL,
  amount      numeric(12,2) NOT NULL DEFAULT 0,
  created_at  timestamptz   NOT NULL DEFAULT now()
);

ALTER TABLE fixed_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fixed_costs_own" ON fixed_costs FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS fixed_costs_user_id_idx    ON fixed_costs(user_id);
CREATE INDEX IF NOT EXISTS fixed_costs_project_id_idx ON fixed_costs(project_id);

-- ─── Profit Goals ─────────────────────────────────────────────────────────────
-- 1 linha por (user_id, project_id) — UPSERT pela PK composta.
CREATE TABLE IF NOT EXISTS profit_goals (
  user_id         uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id      text          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  monthly_target  numeric(12,2) NOT NULL DEFAULT 0,
  updated_at      timestamptz   NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

ALTER TABLE profit_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profit_goals_own" ON profit_goals FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS profit_goals_user_id_idx ON profit_goals(user_id);
