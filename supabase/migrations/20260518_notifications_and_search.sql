-- supabase/migrations/20260518_notifications_and_search.sql
-- Descrição: Tabela notifications (sino do dashboard) + view materializada
--            search_index (lupa global). Suporte backend pra header V4.
--
-- Nao aplica ainda — CEO aplica via Supabase MCP quando aprovar.
--
-- Contexto:
--   Dashboard V4 tem sino e lupa decorativos no header. Esta migration
--   fornece o schema pra torna-los funcionais. Services em:
--   services/notifications.ts e services/search.ts
--
-- Ajustes feitos apos verificar schema real:
--   - orders.id eh text (nao uuid) — search_index usa text
--   - customers.id eh text
--   - customers NAO tem coluna phone — usa whatsapp
--   - orders NAO tem coluna code — usa id como titulo + client_name como subtitulo
--   - products.id: CLAUDE.md migration avisa possivel uuid no DB real.
--     search_index usa CAST(p.id AS text) para blindar contra 42804.
--   - notifications.project_id declarado text (alinhado com projects.id = text)
--
-- ATENCAO: search_index usa CONCURRENTLY no refresh — exige UNIQUE index
--          idx_search_index_unique. Criado abaixo.

-- ═══════════════════════════════════════════════════════════════════════════════
-- PARTE 1: TABELA notifications
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notifications (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id  text          NOT NULL REFERENCES projects(id)   ON DELETE CASCADE,
  type        text          NOT NULL CHECK (type IN (
                              'order_new',
                              'order_late',
                              'stock_low',
                              'invoice_due',
                              'lead_new',
                              'meta_hit',
                              'filament_critical'
                            )),
  title       text          NOT NULL,
  body        text,
  link        text,         -- URL relativa: /orders/HZR-2641 | /finance/inv-X
  read        boolean       NOT NULL DEFAULT false,
  created_at  timestamptz   NOT NULL DEFAULT now(),
  read_at     timestamptz
);

-- RLS: usuario ve e atualiza so as proprias notificacoes.
-- INSERT: service_role (backend dispara, nao o usuario).
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own"  ON notifications;
DROP POLICY IF EXISTS "notifications_update_own"  ON notifications;
DROP POLICY IF EXISTS "notifications_insert_svc"  ON notifications;
DROP POLICY IF EXISTS "notifications_delete_own"  ON notifications;

CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Permite marcar como lido (update read + read_at)
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- service_role bypassa RLS por definicao do Supabase.
-- Esta policy cobre o caso de um cliente authenticated que nao deve inserir.
-- Com check (true) + RLS ativa, service_role ainda passa (bypassa).
-- authenticated nao tem permissao de INSERT — policy e restritiva via USING.
CREATE POLICY "notifications_insert_svc"
  ON notifications FOR INSERT
  WITH CHECK (false);  -- bloqueia INSERT de authenticated/anon; service_role bypassa

-- Usuario pode limpar notificacoes proprias (ex: "limpar tudo")
CREATE POLICY "notifications_delete_own"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Indice hot-path: busca nao-lidas por usuario (query mais frequente do sino)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, created_at DESC)
  WHERE read = false;

-- Indice de suporte para queries por projeto (markAllAsRead, getUnreadCount)
CREATE INDEX IF NOT EXISTS idx_notifications_user_project
  ON notifications (user_id, project_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PARTE 2: VIEW MATERIALIZADA search_index
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Estrategia: view materializada com GIN tsvector.
-- Refresh: funcao refresh_search_index() — chamada via cron pg_cron diario
--          OU manualmente apos bulk inserts criticos.
--
-- Multi-tenant safety: a view inclui user_id + project_id em todas as linhas.
-- RLS nao se aplica a views materializadas — o services/search.ts filtra
-- .eq('user_id', userId).eq('project_id', projectId) na query ao search_index.
-- Isso e equivalente ao isolamento de RLS para este caso de leitura.
--
-- Nota sobre products.id: pode ser uuid no DB real (CLAUDE.md migration avisa
-- bug 2026-05-10). CAST(p.id AS text) previne erro 42804 na uniao de tipos.

DROP MATERIALIZED VIEW IF EXISTS search_index;

CREATE MATERIALIZED VIEW search_index AS

SELECT
  'order'::text                          AS type,
  o.id                                   AS id,           -- text
  o.project_id                           AS project_id,   -- text
  o.user_id                              AS user_id,      -- uuid
  o.id                                   AS title,        -- codigo do pedido eh o id
  coalesce(o.client_name, '')            AS subtitle,
  o.id
    || ' ' || coalesce(o.client_name, '')
    || ' ' || coalesce(o.item, '')
    || ' ' || coalesce(o.origin, '')
                                         AS searchable_text
FROM orders o

UNION ALL

SELECT
  'customer'::text                       AS type,
  c.id                                   AS id,           -- text
  c.project_id                           AS project_id,
  c.user_id                              AS user_id,
  c.name                                 AS title,
  coalesce(c.email, '')                  AS subtitle,
  c.name
    || ' ' || coalesce(c.email, '')
    || ' ' || coalesce(c.whatsapp, '')   -- customers tem whatsapp, nao phone
    || ' ' || coalesce(c.notes, '')
                                         AS searchable_text
FROM customers c

UNION ALL

SELECT
  'product'::text                        AS type,
  CAST(p.id AS text)                     AS id,           -- cast: id pode ser uuid no DB
  p.project_id                           AS project_id,
  p.user_id                              AS user_id,
  p.name                                 AS title,
  coalesce(p.notes, '')                  AS subtitle,
  p.name
    || ' ' || coalesce(p.notes, '')
                                         AS searchable_text
FROM products p;

-- Indice GIN para full-text search (lingua portuguesa)
CREATE INDEX IF NOT EXISTS idx_search_index_tsv
  ON search_index
  USING GIN (to_tsvector('portuguese', searchable_text));

-- Indice UNIQUE necessario para REFRESH MATERIALIZED VIEW CONCURRENTLY
-- (sem unique index o CONCURRENTLY falha com erro 42P07)
-- Usa (type, id, project_id) porque id = text e pode repetir entre tipos
CREATE UNIQUE INDEX IF NOT EXISTS idx_search_index_unique
  ON search_index (type, id, project_id);

-- Indice de suporte para filtro multi-tenant (user_id + project_id)
CREATE INDEX IF NOT EXISTS idx_search_index_tenant
  ON search_index (user_id, project_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PARTE 3: FUNCAO refresh_search_index
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Chamada via pg_cron (job a ser criado separado, nao aqui para nao depender
-- de pg_cron estar ativo) OU via RPC manual.
-- CONCURRENTLY: nao bloqueia leituras durante o refresh (exige unique index).
-- SECURITY DEFINER + search_path fixo: defesa padrao do projeto.

CREATE OR REPLACE FUNCTION refresh_search_index()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.search_index;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DOWN (reverter se necessario)
-- ═══════════════════════════════════════════════════════════════════════════════
-- DROP FUNCTION  IF EXISTS refresh_search_index();
-- DROP MATERIALIZED VIEW IF EXISTS search_index;
-- DROP TABLE IF EXISTS notifications;
