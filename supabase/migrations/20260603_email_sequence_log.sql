-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: email_sequence_log
-- Data: 2026-06-03
-- Propósito: registrar envios da sequência D+1/D+3/D+7 pra leads de waitlist.
--
-- Anti-duplicação: UNIQUE (lead_id, step) garante que cada lead recebe cada
-- step uma única vez, mesmo se cron rodar 2x no mesmo dia.
--
-- Usado por: app/api/cron/email-sequence/route.ts (Vercel Cron diário 10h BRT).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.email_sequence_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     uuid NOT NULL REFERENCES public.waitlist_leads(id) ON DELETE CASCADE,
  step        text NOT NULL CHECK (step IN ('d1', 'd3', 'd7')),
  sent_at     timestamptz NOT NULL DEFAULT now(),
  resend_id   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Índice composto: usado pelo cron pra checar se já enviou
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_sequence_log_lead_step
  ON public.email_sequence_log (lead_id, step);

-- Índice por step + sent_at: pra dashboards de métrica futura
CREATE INDEX IF NOT EXISTS idx_email_sequence_log_step_sent_at
  ON public.email_sequence_log (step, sent_at DESC);

-- RLS: nenhuma policy pra anon/authenticated.
-- Tabela é manipulada apenas via service_role (cron route).
ALTER TABLE public.email_sequence_log ENABLE ROW LEVEL SECURITY;

-- Comentário pra DB inspector
COMMENT ON TABLE public.email_sequence_log IS
  'Log de envios da sequência email D+1/D+3/D+7 pra leads de waitlist. Mantido pelo cron /api/cron/email-sequence.';
