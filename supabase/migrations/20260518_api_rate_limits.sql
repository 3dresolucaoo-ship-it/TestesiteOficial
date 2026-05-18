-- supabase/migrations/20260518_api_rate_limits.sql
-- Descrição: Tabela api_rate_limits + funções pra rate-limit DB-based em rotas públicas.
--
-- Owner: Otávio (Security) + Bruna (Backend)
-- Data:  2026-05-17 (aplicar prod: 2026-05-18)
--
-- Problema resolvido:
--   /api/checkout, /api/encomenda, /api/catalog/quote são rotas públicas (sem auth).
--   Atacante pode floodar: criar 10k orders fake / espamar leads / abrir milhares
--   de payment sessions (custo MP/Stripe por sessão criada).
--
-- Solução:
--   Mesmo padrão usado em waitlistRateLimit.ts (SHA-256 IP + salt, count janela),
--   mas genérico por endpoint. Tabela registra cada tentativa; service consulta
--   count dentro de uma janela e decide allow/deny.
--
-- Trade-off vs Upstash Redis:
--   - DB-based: 1 query extra por request (~5-20ms), mas zero setup/custo, RLS
--     mesma stack. Suficiente até 10k req/dia.
--   - Upstash: ~1ms latência, mas tem custo, env var nova, fail-mode diferente.
--   - Decisão: DB agora, Upstash quando escalar (pós-launch, métrica > 5k req/dia).
--
-- Fail-mode: fail-OPEN (se DB cair, request passa). Segurança vs disponibilidade —
-- prefere atender user real do que bloquear todo mundo por bug nosso. Mesmo
-- princípio do waitlistRateLimit.ts.

-- ─── 1. Tabela api_rate_limits ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS api_rate_limits (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint    text        NOT NULL,
  -- SHA-256(ip + API_RATE_LIMIT_SALT) — 32 chars hex (igual padrão waitlist)
  ip_hash     text        NOT NULL,
  -- Metadata opcional: status_code, user_agent (truncado), etc. Usado pra debug.
  meta        jsonb       NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),

  -- Constraint: nada de strings vazias (defesa contra service bug)
  CONSTRAINT api_rate_limits_endpoint_not_empty CHECK (length(endpoint) > 0),
  CONSTRAINT api_rate_limits_ip_hash_not_empty  CHECK (length(ip_hash)  > 0)
);

-- Índice composto: query é sempre "WHERE endpoint = X AND ip_hash = Y AND created_at >= Z"
-- A ordem importa: endpoint primeiro (alta cardinalidade), ip_hash segundo, created_at DESC
-- pra cobrir o range scan na janela recente.
CREATE INDEX IF NOT EXISTS api_rate_limits_lookup_idx
  ON api_rate_limits (endpoint, ip_hash, created_at DESC);

-- Índice secundário pra cleanup periódico (DELETE WHERE created_at < now() - interval '7 days')
CREATE INDEX IF NOT EXISTS api_rate_limits_created_at_idx
  ON api_rate_limits (created_at);

-- ─── 2. RLS deny-all (só service_role escreve/lê) ────────────────────────────
-- Mesmo padrão de webhook_events: tabela puramente operacional, nunca acessada
-- por anon/authenticated direto. As Server-only routes usam getSupabaseAdmin().

ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Sem CREATE POLICY = deny-all pra anon/authenticated por padrão.
-- service_role bypassa RLS por definição do Supabase.

-- ─── 3. Comentário documentação ──────────────────────────────────────────────
COMMENT ON TABLE api_rate_limits IS
  'Rate-limit DB-based pra rotas API públicas. Otávio 2026-05-17.
   Chave (endpoint, ip_hash). Janela e limite definidos no service apiRateLimit.ts.
   Cleanup: rodar DELETE WHERE created_at < now() - interval ''7 days'' via pg_cron.';

-- ─── DOWN (reverter se necessário) ───────────────────────────────────────────
-- DROP INDEX IF EXISTS api_rate_limits_created_at_idx;
-- DROP INDEX IF EXISTS api_rate_limits_lookup_idx;
-- DROP TABLE IF EXISTS api_rate_limits;
