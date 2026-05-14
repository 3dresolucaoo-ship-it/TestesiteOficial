-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: waitlist_leads
-- Wave: Fase 1 — Lançamento (04/07/2026)
-- Owner: Bruna (Backend) + Otávio (Security RLS)
-- Data: 2026-05-13
-- ─────────────────────────────────────────────────────────────────────────────
-- Tabela de captura de leads da landing pré-lançamento.
-- NÃO requer user_id (lead público — anônimo até converter).
-- RLS: público INSERT (com BotID/rate-limit), apenas admin SELECT.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ─── Tabela ──────────────────────────────────────────────────────────────────
create table if not exists public.waitlist_leads (
  id              uuid          primary key default gen_random_uuid(),

  -- Etapa 1 (form mínimo)
  email           citext        not null,
  name            text          not null,
  whatsapp        text,

  -- Etapa 2 (qualificação opcional)
  business_name   text,
  segment         text,          -- '3d-printing' | 'estetica' | 'moda' | etc
  size            text,          -- 'solo' | '2-5' | '6-20' | '20+'
  revenue_band    text,          -- '0-5k' | '5-25k' | '25-100k' | '100k+'
  pain            text,          -- 1 frase descrevendo dor principal
  source          text,          -- 'instagram' | 'linkedin' | 'indicacao' | etc

  -- Dados implícitos (captura automática)
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_content     text,
  utm_term        text,
  referrer        text,
  ip_country      text,
  ip_region       text,
  ip_city         text,
  user_agent      text,
  device          text,         -- 'mobile' | 'desktop' | 'tablet'

  -- LGPD
  consent_lgpd    boolean       not null default false,
  consent_at      timestamptz,

  -- Status interno (CRM)
  status          text          not null default 'new',
                                -- 'new' | 'warm' | 'hot' | 'converted' | 'unsubscribed'
  score           integer       not null default 0,    -- 0-100 calculado
  tags            text[]        default array[]::text[],

  -- Confirmação email (double opt-in)
  email_confirmed boolean       not null default false,
  email_confirmed_at timestamptz,
  confirmation_token text       unique,

  -- Conversão
  converted_at    timestamptz,
  converted_user_id uuid        references auth.users(id) on delete set null,

  -- Timestamps
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now(),
  last_contact_at timestamptz,

  -- Constraint: email único (evita duplicada)
  constraint waitlist_leads_email_unique unique (email)
);

-- ─── Habilita citext pra email case-insensitive ─────────────────────────────
create extension if not exists "citext";

-- ─── Trigger updated_at automático ──────────────────────────────────────────
create or replace function public.update_waitlist_leads_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_waitlist_leads_updated_at on public.waitlist_leads;
create trigger trg_waitlist_leads_updated_at
  before update on public.waitlist_leads
  for each row
  execute function public.update_waitlist_leads_updated_at();

-- ─── Índices ────────────────────────────────────────────────────────────────
create index if not exists idx_waitlist_leads_status     on public.waitlist_leads(status);
create index if not exists idx_waitlist_leads_segment    on public.waitlist_leads(segment) where segment is not null;
create index if not exists idx_waitlist_leads_created_at on public.waitlist_leads(created_at desc);
create index if not exists idx_waitlist_leads_email      on public.waitlist_leads(email);

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table public.waitlist_leads enable row level security;

-- INSERT público: qualquer um pode entrar na waitlist (anon role)
-- Otávio: proteção real vem via rate-limit + BotID no app, não no DB
drop policy if exists "waitlist_public_insert" on public.waitlist_leads;
create policy "waitlist_public_insert"
  on public.waitlist_leads
  for insert
  to anon, authenticated
  with check (true);

-- SELECT: apenas usuários autenticados com flag is_admin (via profiles)
-- (profiles.is_admin será adicionada em migration futura quando criar /admin)
-- Por enquanto, nenhum SELECT público — apenas via service_role (rotas API admin).
drop policy if exists "waitlist_admin_select" on public.waitlist_leads;
create policy "waitlist_admin_select"
  on public.waitlist_leads
  for select
  to authenticated
  using (
    exists (
      select 1 from auth.users u
      where u.id = auth.uid()
        and (u.raw_app_meta_data->>'is_admin')::boolean = true
    )
  );

-- UPDATE: apenas service_role (rotas internas) e admin
drop policy if exists "waitlist_admin_update" on public.waitlist_leads;
create policy "waitlist_admin_update"
  on public.waitlist_leads
  for update
  to authenticated
  using (
    exists (
      select 1 from auth.users u
      where u.id = auth.uid()
        and (u.raw_app_meta_data->>'is_admin')::boolean = true
    )
  )
  with check (
    exists (
      select 1 from auth.users u
      where u.id = auth.uid()
        and (u.raw_app_meta_data->>'is_admin')::boolean = true
    )
  );

-- DELETE: apenas admin (LGPD direito de deleção via service_role)
drop policy if exists "waitlist_admin_delete" on public.waitlist_leads;
create policy "waitlist_admin_delete"
  on public.waitlist_leads
  for delete
  to authenticated
  using (
    exists (
      select 1 from auth.users u
      where u.id = auth.uid()
        and (u.raw_app_meta_data->>'is_admin')::boolean = true
    )
  );

-- ─── Comentário documentação ────────────────────────────────────────────────
comment on table public.waitlist_leads is 'Captura de leads da landing pré-lançamento (Fase 1 — launch 04/07/2026). INSERT público com rate-limit no app. SELECT/UPDATE/DELETE só via admin.';
