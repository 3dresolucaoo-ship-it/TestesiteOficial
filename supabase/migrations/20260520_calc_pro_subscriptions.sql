-- supabase/migrations/20260520_calc_pro_subscriptions.sql
-- Descricao: Tabela calc_pro_subscriptions para Hayzer Calc Pro SaaS (subscription mensal).
--
-- ADR: decisions/023-calc-pro-freemium-subscription.md
-- Autor: Paulo (Financial Officer) 2026-05-20
--
-- Modelo: Stripe subscription R$ 19/mes com trial 7 dias.
-- Substitui o modelo lifetime R$ 37 (calculadora_pro_purchases) que fica
-- grandfathered para compras pre-20/05/2026. Tabelas paralelas, sem conflito.
--
-- IMPORTANTE: NAO aplicar agora. CEO precisa criar Product/Price/Webhook no
-- Stripe Dashboard primeiro (ver payments/setup-stripe-calc-pro.md). Apos isso
-- e setar as envs no Vercel, Bruna aplica via Supabase MCP apply_migration.
--
-- RLS: usuario logado le apenas a propria row (auth.uid() = user_id). Insert
-- e update so via service_role (webhook handler). Ninguem deleta diretamente
-- (cancel via Stripe propaga status, nao deleta).

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ─── Tabela calc_pro_subscriptions ──────────────────────────────────────────

create table if not exists public.calc_pro_subscriptions (
  id                       uuid          primary key default gen_random_uuid(),

  -- Identidade do cliente
  user_id                  uuid          not null references auth.users(id) on delete cascade,
  email                    citext        not null,

  -- Stripe identifiers
  stripe_customer_id       text          not null,
  stripe_subscription_id   text          not null,
  stripe_price_id          text,                                              -- pra futuro multi-plan

  -- Estado da subscription
  -- Valores Stripe: trialing | active | past_due | canceled | unpaid | incomplete | incomplete_expired | paused
  status                   text          not null check (
    status in (
      'trialing', 'active', 'past_due', 'canceled',
      'unpaid', 'incomplete', 'incomplete_expired', 'paused'
    )
  ),

  -- Datas vitais do ciclo
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  trial_end                timestamptz,
  cancel_at_period_end     boolean       not null default false,
  canceled_at              timestamptz,

  -- Auditoria
  last_event_id            text,                                              -- ultimo Stripe event que tocou esta row
  last_event_at            timestamptz,
  created_at               timestamptz   not null default now(),
  updated_at               timestamptz   not null default now(),

  -- Constraints
  constraint calc_pro_sub_subscription_id_uniq unique (stripe_subscription_id),
  constraint calc_pro_sub_user_id_uniq         unique (user_id)               -- 1 user = 1 subscription ativa por vez
);

-- ─── Indexes ────────────────────────────────────────────────────────────────

create index if not exists calc_pro_sub_user_id_idx
  on public.calc_pro_subscriptions (user_id);

create index if not exists calc_pro_sub_status_idx
  on public.calc_pro_subscriptions (status)
  where status in ('active', 'trialing');                                     -- parcial: queries de access check filtram active+trialing

create index if not exists calc_pro_sub_email_idx
  on public.calc_pro_subscriptions (email);

create index if not exists calc_pro_sub_customer_id_idx
  on public.calc_pro_subscriptions (stripe_customer_id);

-- ─── Trigger updated_at (search_path imutavel — defesa contra injection) ────

create or replace function public.update_calc_pro_subscriptions_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

drop trigger if exists trg_update_calc_pro_subscriptions_updated_at on public.calc_pro_subscriptions;
create trigger trg_update_calc_pro_subscriptions_updated_at
  before update on public.calc_pro_subscriptions
  for each row
  execute function public.update_calc_pro_subscriptions_updated_at();

-- ─── RLS ────────────────────────────────────────────────────────────────────

alter table public.calc_pro_subscriptions enable row level security;

-- Policy SELECT: usuario le apenas sua propria subscription
create policy "calc_pro_sub_select_own"
  on public.calc_pro_subscriptions
  for select
  using (auth.uid() = user_id);

-- Sem policy INSERT/UPDATE/DELETE explicita = deny-all pra anon/authenticated.
-- service_role bypassa por design do Supabase (usado pelo webhook handler).

-- ─── RPC: upsert_calc_pro_subscription ──────────────────────────────────────
--
-- Idempotencia: insere ou atualiza por (stripe_subscription_id). Multiplos
-- eventos do mesmo subscription (created → updated → updated → deleted) sempre
-- caem na mesma row.
--
-- SECURITY DEFINER + search_path imutavel: mesmo padrao defensivo do
-- process_webhook_atomic em 20260518_webhook_events.sql.

create or replace function public.upsert_calc_pro_subscription(
  p_user_id                  uuid,
  p_email                    citext,
  p_stripe_customer_id       text,
  p_stripe_subscription_id   text,
  p_stripe_price_id          text,
  p_status                   text,
  p_current_period_start     timestamptz,
  p_current_period_end       timestamptz,
  p_trial_end                timestamptz,
  p_cancel_at_period_end     boolean,
  p_canceled_at              timestamptz,
  p_last_event_id            text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row_id uuid;
begin
  insert into public.calc_pro_subscriptions (
    user_id, email,
    stripe_customer_id, stripe_subscription_id, stripe_price_id,
    status,
    current_period_start, current_period_end,
    trial_end, cancel_at_period_end, canceled_at,
    last_event_id, last_event_at
  ) values (
    p_user_id, p_email,
    p_stripe_customer_id, p_stripe_subscription_id, p_stripe_price_id,
    p_status,
    p_current_period_start, p_current_period_end,
    p_trial_end, p_cancel_at_period_end, p_canceled_at,
    p_last_event_id, pg_catalog.now()
  )
  on conflict (stripe_subscription_id) do update
    set
      status                  = excluded.status,
      current_period_start    = excluded.current_period_start,
      current_period_end      = excluded.current_period_end,
      trial_end               = excluded.trial_end,
      cancel_at_period_end    = excluded.cancel_at_period_end,
      canceled_at             = excluded.canceled_at,
      stripe_price_id         = excluded.stripe_price_id,
      last_event_id           = excluded.last_event_id,
      last_event_at           = pg_catalog.now()
  returning id into v_row_id;

  return jsonb_build_object(
    'status', 'ok',
    'id',     v_row_id
  );
end;
$$;

-- ─── Verificacao pos-aplicacao (Bruna roda no Supabase MCP execute_sql) ─────
--
-- -- Confere tabela + colunas
-- select column_name, data_type, is_nullable
-- from information_schema.columns
-- where table_name = 'calc_pro_subscriptions'
-- order by ordinal_position;
--
-- -- Confere RLS habilitado
-- select relname, relrowsecurity
-- from pg_class
-- where relname = 'calc_pro_subscriptions';
--
-- -- Confere policies
-- select polname, polcmd
-- from pg_policy
-- where polrelid = 'public.calc_pro_subscriptions'::regclass;
--
-- -- Confere RPC
-- select proname, prosecdef
-- from pg_proc
-- where proname = 'upsert_calc_pro_subscription';

-- ─── DOWN (reverter se necessario) ──────────────────────────────────────────
-- drop function if exists public.upsert_calc_pro_subscription(
--   uuid, citext, text, text, text, text,
--   timestamptz, timestamptz, timestamptz, boolean, timestamptz, text
-- );
-- drop function if exists public.update_calc_pro_subscriptions_updated_at();
-- drop table if exists public.calc_pro_subscriptions;
