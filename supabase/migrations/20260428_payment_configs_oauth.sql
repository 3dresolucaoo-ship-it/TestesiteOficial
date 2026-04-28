-- Add OAuth columns to payment_configs
-- refresh_token: MP token for getting new access_token without user interaction
-- token_expires_at: when access_token expires (MP tokens last ~6 months)
-- mp_user_id: MP's numeric user id for the connected account

ALTER TABLE payment_configs
  ADD COLUMN IF NOT EXISTS refresh_token   TEXT,
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS mp_user_id      TEXT;
