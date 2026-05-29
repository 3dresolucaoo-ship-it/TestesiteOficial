-- Migration: user_settings para onboarding wizard
-- Criada em 2026-05-29 (retroativa ao label 20260520 para manter ordem)
-- Responsável: Felipe (frontend) + Bruna (revisar RLS antes de aplicar em prod)

-- ─── Tabela ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_settings (
  user_id               uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_completed  boolean     NOT NULL DEFAULT false,
  onboarding_step       smallint    NOT NULL DEFAULT 0,
  onboarding_skipped_at timestamptz,
  settings              jsonb       NOT NULL DEFAULT '{}',
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ─── Trigger: atualiza updated_at automaticamente ─────────────────────────────

CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_settings_updated_at ON user_settings;

CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_user_settings_updated_at();

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Usuário lê e escreve apenas a própria linha
DROP POLICY IF EXISTS user_settings_own ON user_settings;

CREATE POLICY user_settings_own ON user_settings
  USING       (user_id = auth.uid())
  WITH CHECK  (user_id = auth.uid());
