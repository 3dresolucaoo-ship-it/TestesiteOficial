-- supabase/migrations/20260518_production_project_id.sql
-- Descrição: Adiciona project_id na tabela production (text, alinhado com projects.id),
--             backfill pelo primeiro projeto do user, índices, RLS recreated.
-- Aplicada em prod 2026-05-18 via Supabase MCP apply_migration.

-- 1. Adiciona coluna (text porque projects.id é text — schema.sql stale dizia uuid)
ALTER TABLE production
  ADD COLUMN IF NOT EXISTS project_id text REFERENCES projects(id) ON DELETE SET NULL;

-- 2. Backfill: seta project_id como o primeiro projeto do user (order by created_at)
--    Rows cujo user_id não tem projeto ficam NULL — aceito, evita violação de FK.
UPDATE production p
SET    project_id = (
  SELECT id
  FROM   projects pr
  WHERE  pr.user_id = p.user_id
  ORDER  BY pr.created_at
  LIMIT  1
)
WHERE  p.project_id IS NULL;

-- 3. Índice composto: queries filtradas por projeto + ordenadas por priority
CREATE INDEX IF NOT EXISTS production_project_id_priority_idx
  ON production(project_id, priority);

-- 4. Índice em project_id isolado (útil pra JOINs futuros)
CREATE INDEX IF NOT EXISTS production_project_id_idx
  ON production(project_id);

-- 5. Atualiza RLS: drop policy atual e recria (sem mudar logic — project_id fica enforced no service layer)
DROP POLICY IF EXISTS "production_own" ON production;

CREATE POLICY "production_own"
  ON production
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Nota: project_id não entra no USING/WITH CHECK da policy global porque
-- (a) rows legadas podem ter project_id NULL após backfill parcial e
-- (b) o filtro de project_id é enforced no service layer (.eq('project_id', projectId)).
-- Quando V4 tornar project_id obrigatório (NOT NULL), a policy pode ser endurecida.

-- DOWN:
-- ALTER TABLE production DROP COLUMN IF EXISTS project_id;
-- DROP POLICY IF EXISTS "production_own" ON production;
-- CREATE POLICY "production_own" ON production FOR ALL USING (auth.uid() = user_id);
