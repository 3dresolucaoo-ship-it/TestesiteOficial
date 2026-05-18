-- supabase/migrations/20260518_enable_pg_cron_cleanup.sql
-- Descrição: Habilita pg_cron + cleanup diário de api_rate_limits (>7 dias)
-- Aplicada em prod via Supabase MCP em 2026-05-17 (jobid 1, active=true)
-- Ricardo (DevOps G7) levantou como P1 no audit pós API_RATE_LIMIT_SALT setup.

-- Habilita extensão pg_cron (nativa do Postgres, agendador de jobs)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agenda cleanup diário às 3h UTC (00h BRT — fora do pico de tráfego)
-- Deleta rows de api_rate_limits com mais de 7 dias.
-- 7 dias é suficiente pra debugging retroativo + evita crescimento descontrolado.
-- Estimativa: ~1k hits/dia × 7 dias = ~7k rows steady-state em prod.
SELECT cron.schedule(
  'cleanup-api-rate-limits',
  '0 3 * * *',
  $$DELETE FROM api_rate_limits WHERE created_at < now() - interval '7 days'$$
);

-- DOWN (para reverter):
-- SELECT cron.unschedule('cleanup-api-rate-limits');
-- DROP EXTENSION IF EXISTS pg_cron;
