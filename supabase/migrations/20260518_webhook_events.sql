-- supabase/migrations/20260518_webhook_events.sql
-- Descrição: Tabela webhook_events + RPC process_webhook_atomic
--
-- Problema resolvido:
--   O handler /api/webhooks/payment fazia SELECT (idempotency check) + múltiplos INSERTs
--   em roundtrips separados. Race condition: gateway envia 2 retries simultâneos, ambos
--   passam pelo check antes de qualquer INSERT ocorrer → duplicate charge.
--
-- Solução:
--   1. Tabela webhook_events com UNIQUE (provider, event_id) — lock atômico de evento
--   2. RPC process_webhook_atomic — INSERT no evento + INSERT order/production/transaction
--      tudo dentro da mesma transação Postgres. Se crashar no meio, Postgres rollbacka tudo.
--
-- Nota: webhook_events NÃO tem user_id — evento de gateway não pertence a um usuário.
-- RLS permite somente service_role (admin client usado em webhooks).

-- ─── 1. Tabela webhook_events ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS webhook_events (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider      text        NOT NULL CHECK (provider IN ('stripe', 'mercadopago')),
  event_id      text        NOT NULL,
  event_type    text        NOT NULL,
  payload       jsonb       NOT NULL DEFAULT '{}',
  processed_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT webhook_events_provider_event_id_uniq UNIQUE (provider, event_id)
);

CREATE INDEX IF NOT EXISTS webhook_events_provider_idx
  ON webhook_events (provider);

CREATE INDEX IF NOT EXISTS webhook_events_created_at_idx
  ON webhook_events (created_at DESC);

-- RLS: somente service_role escreve (admin client em webhooks)
-- anon e authenticated não têm acesso de forma alguma
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Sem policies explícitas = deny-all para anon/authenticated.
-- service_role bypassa RLS por definição do Supabase.

-- ─── 2. RPC process_webhook_atomic ───────────────────────────────────────────
--
-- Executa dentro de UMA ÚNICA TRANSAÇÃO:
--   a) INSERT webhook_events (idempotency lock via UNIQUE)
--   b) SELECT product (nome + print_time_hours) — se productId fornecido
--   c) INSERT orders
--   d) INSERT production (se productId preenchido e produto encontrado)
--   e) INSERT transactions (finance)
--   f) UPDATE webhook_events.processed_at
--
-- Retornos possíveis:
--   { "status": "duplicate" }  → evento já processado, caller faz ack 200 silencioso
--   { "status": "ok", "order_id": "..." } → sucesso
--   Throw em qualquer outro erro → Postgres rollbacka TUDO, caller retorna 500
--
-- SECURITY DEFINER + search_path imutável: defesa contra search_path injection
-- (mesmo padrão do create_catalog_lead em 20260509_catalog_quote_lead_rpc.sql)

CREATE OR REPLACE FUNCTION process_webhook_atomic(
  p_provider      text,
  p_event_id      text,
  p_event_type    text,
  p_payload       jsonb,

  -- order fields
  p_order_id      text,
  p_project_id    uuid,
  p_merchant_id   uuid,
  p_client_name   text,
  p_origin        text,
  p_item          text,
  p_value         numeric,
  p_status        text,
  p_date          text,           -- ISO date string 'YYYY-MM-DD'

  -- e-commerce fields
  p_source        text,
  p_catalog_slug  text,
  p_payment_id    text,
  p_payment_status text,
  p_customer_whatsapp text,

  -- product link (nullable)
  p_product_id    uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rows_inserted int;
  v_product_name  text;
  v_print_hours   numeric;
  v_prod_id       text;
BEGIN
  -- ── a. Tenta registrar o evento (idempotency lock) ─────────────────────────
  -- ON CONFLICT DO NOTHING → se evento já existe, v_rows_inserted = 0
  INSERT INTO public.webhook_events (provider, event_id, event_type, payload)
  VALUES (p_provider, p_event_id, p_event_type, p_payload)
  ON CONFLICT (provider, event_id) DO NOTHING;

  GET DIAGNOSTICS v_rows_inserted = ROW_COUNT;

  IF v_rows_inserted = 0 THEN
    -- Evento duplicado — retornar sem fazer nada (gateway retry normal)
    RETURN jsonb_build_object('status', 'duplicate');
  END IF;

  -- ── b. Busca produto (nome + horas) se productId fornecido ─────────────────
  IF p_product_id IS NOT NULL THEN
    SELECT name, print_time_hours
    INTO v_product_name, v_print_hours
    FROM public.products
    WHERE id = p_product_id;
    -- Se produto não encontrado, v_product_name fica NULL — tratado abaixo
  END IF;

  -- ── c. Insert order ────────────────────────────────────────────────────────
  -- 23505 (unique_violation em payment_id) = race condition no mesmo instant.
  -- Neste caso o outro processo já registrou o evento e está inserindo —
  -- retornamos duplicate para não dobrar a escrita.
  BEGIN
    INSERT INTO public.orders (
      id, project_id, client_name, origin, item, value,
      status, date, product_id, source, catalog_slug,
      payment_id, payment_status, customer_whatsapp, user_id
    ) VALUES (
      p_order_id, p_project_id, p_client_name, p_origin, p_item, p_value,
      p_status, p_date::date, p_product_id, p_source, p_catalog_slug,
      p_payment_id, p_payment_status, p_customer_whatsapp, p_merchant_id
    );
  EXCEPTION WHEN unique_violation THEN
    -- payment_id já existe — outro processo ganhou a corrida
    RETURN jsonb_build_object('status', 'duplicate');
  END;

  -- ── d. Insert production task (somente se produto encontrado) ──────────────
  IF p_product_id IS NOT NULL AND v_product_name IS NOT NULL THEN
    v_prod_id := 'prod-' || substr(md5(random()::text), 1, 8);

    -- Non-fatal: se falhar, order já commitada, admin reprocessa manualmente
    BEGIN
      INSERT INTO public.production (
        id, order_id, client_name, item, printer,
        status, estimated_hours, priority, user_id
      ) VALUES (
        v_prod_id, p_order_id, p_client_name,
        v_product_name, 'bambu',
        'waiting', coalesce(v_print_hours, 0), 0, p_merchant_id
      );
    EXCEPTION WHEN OTHERS THEN
      -- Log via RAISE WARNING (visível no Supabase dashboard logs)
      RAISE WARNING '[process_webhook_atomic] Production task failed (non-fatal): % | order_id=%',
        SQLERRM, p_order_id;
    END;
  END IF;

  -- ── e. Insert finance transaction ──────────────────────────────────────────
  -- id = 'tx-{order_id}' garante idempotência independente
  BEGIN
    INSERT INTO public.transactions (
      id, project_id, type, category, description,
      value, date, source, user_id
    ) VALUES (
      'tx-' || p_order_id, p_project_id, 'income', 'product_sale',
      'Venda: ' || p_client_name || ' — ' || p_item,
      p_value, p_date::date, p_origin, p_merchant_id
    );
  EXCEPTION WHEN unique_violation THEN
    -- Transação duplicada — ignorar silenciosamente
    RAISE WARNING '[process_webhook_atomic] Transaction duplicate (non-fatal): tx-% already exists',
      p_order_id;
  END;

  -- ── f. Marca evento como processado ────────────────────────────────────────
  UPDATE public.webhook_events
  SET processed_at = pg_catalog.now()
  WHERE provider = p_provider AND event_id = p_event_id;

  RETURN jsonb_build_object(
    'status',   'ok',
    'order_id', p_order_id
  );
END;
$$;

-- ─── DOWN (reverter se necessário) ────────────────────────────────────────────
-- DROP FUNCTION IF EXISTS process_webhook_atomic(...);
-- DROP TABLE IF EXISTS webhook_events;
