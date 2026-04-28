-- ─── payment_configs ────────────────────────────────────────────────────────
-- Stores per-merchant payment gateway credentials (Mercado Pago, Stripe, …).
-- Read by services/paymentConfig.ts and services/payments.ts.
--
-- A merchant may have multiple configs (one per provider), but only ONE may
-- be active at a time. Activation is performed atomically via the
-- set_active_payment_config() RPC.
--
-- RLS: every read/write is scoped to auth.uid(). The service role bypasses
-- RLS and is used by server-side code (admin client) for webhook processing.

CREATE TABLE IF NOT EXISTS payment_configs (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider        TEXT         NOT NULL CHECK (provider IN ('mercadopago', 'stripe', 'infinitypay')),
  access_token    TEXT         NOT NULL,
  public_key      TEXT,
  webhook_secret  TEXT,
  sandbox         BOOLEAN      NOT NULL DEFAULT false,
  is_active       BOOLEAN      NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),

  -- one config row per (merchant, provider)
  CONSTRAINT payment_configs_user_provider_uniq UNIQUE (user_id, provider)
);

-- only ONE active config per merchant
CREATE UNIQUE INDEX IF NOT EXISTS payment_configs_one_active_per_user
  ON payment_configs (user_id)
  WHERE is_active;

CREATE INDEX IF NOT EXISTS payment_configs_user_id_idx
  ON payment_configs (user_id);

-- updated_at auto-touch
CREATE OR REPLACE FUNCTION touch_payment_configs_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payment_configs_touch_updated_at ON payment_configs;
CREATE TRIGGER payment_configs_touch_updated_at
  BEFORE UPDATE ON payment_configs
  FOR EACH ROW EXECUTE FUNCTION touch_payment_configs_updated_at();

-- ─── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE payment_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payment_configs_select_own ON payment_configs;
CREATE POLICY payment_configs_select_own ON payment_configs
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS payment_configs_insert_own ON payment_configs;
CREATE POLICY payment_configs_insert_own ON payment_configs
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS payment_configs_update_own ON payment_configs;
CREATE POLICY payment_configs_update_own ON payment_configs
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS payment_configs_delete_own ON payment_configs;
CREATE POLICY payment_configs_delete_own ON payment_configs
  FOR DELETE USING (user_id = auth.uid());

-- ─── set_active_payment_config(p_user_id, p_config_id) ──────────────────────
-- Atomic activation: deactivates every other config for this user and
-- activates the target one in a single transaction. Avoids the race window
-- where two rows briefly share is_active=true (would violate the partial
-- unique index).
--
-- SECURITY DEFINER: needed so the function can bypass RLS for the cross-row
-- update. Internally validates that the target config belongs to p_user_id.
CREATE OR REPLACE FUNCTION set_active_payment_config(
  p_user_id    UUID,
  p_config_id  UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner UUID;
BEGIN
  -- ownership check (defends against a different user passing someone else's config_id)
  SELECT user_id INTO v_owner
    FROM payment_configs
   WHERE id = p_config_id;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Payment config % not found', p_config_id;
  END IF;

  IF v_owner <> p_user_id THEN
    RAISE EXCEPTION 'Payment config % does not belong to user %', p_config_id, p_user_id;
  END IF;

  -- deactivate all, then activate the chosen one — single transaction
  UPDATE payment_configs
     SET is_active = false
   WHERE user_id   = p_user_id
     AND is_active = true
     AND id       <> p_config_id;

  UPDATE payment_configs
     SET is_active = true
   WHERE id = p_config_id;
END;
$$;

REVOKE ALL ON FUNCTION set_active_payment_config(UUID, UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION set_active_payment_config(UUID, UUID) TO authenticated, service_role;
