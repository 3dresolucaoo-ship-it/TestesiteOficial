# RLS Audit History — Hayzer

Historico de auditorias semanais de Row Level Security.
Formato: append-only. Cada semana uma entrada.

---

## 2026-06-08 (BASELINE — primeiro audit)

**Resumo:** 26 tabelas · 26 com RLS habilitado (100%) · 44 policies totais · 23 tabelas com policies · 3 sem policies

**Score geral:** 7/10 — RLS habilitado em todas tabelas (otimo), mas gaps de policies e design multi-projeto preocupam.

### GAPS CRITICOS

| Sev | Tabela | Problema |
|-----|--------|----------|
| 4 | email_sequence_log | RLS habilitado, ZERO policies — cron email D+1/D+3/D+7 provavelmente falhando silenciosamente |
| 4 | webhook_events | RLS habilitado, ZERO policies — insercao de eventos Stripe/MP pode estar falhando |
| 4 | config | Policy branch sem auth.uid() — row global (id=1, user_id NULL) acessivel possivelmente por anon |
| 3 | api_rate_limits | RLS habilitado, ZERO policies — tabela completamente bloqueada |

### ALERTAS AMARELOS

| Sev | Tipo | Detalhe |
|-----|------|---------|
| 3 | Design Gap | Nenhuma tabela filtra por project_id no RLS — isolamento multi-projeto 100% via app |
| 3 | profiles | Sem UPDATE policy — usuarios nao conseguem editar perfil |
| 2 | payment_configs | 4 policies duplicadas (_own vs admin-enabled) |
| 2 | portfolios / portfolio_items | Policies identicas duplicadas |
| 2 | Functions | 3 SECURITY DEFINER com search_path mutavel |
| 2 | create_catalog_lead | SECURITY DEFINER callable por anon (intencional, monitorar) |
| 2 | search_index | Materialized view exposta via API publica |
| 1 | Storage | 2 buckets com SELECT broad (inventory-images, products-images) |
| 1 | Auth | HaveIBeenPwned check desabilitado |

### Policies por tabela

| Tabela | Policies | Cobertura | Obs |
|--------|----------|-----------|-----|
| affiliates | 1 | ALL | ok |
| api_rate_limits | 0 | nenhuma | CRITICO — bloqueada |
| catalogs | 2 | ALL + SELECT public | ok |
| config | 1 | ALL | ALERTA — branch sem auth |
| content | 1 | ALL | ok |
| customers | 1 | ALL | ok |
| decisions | 1 | ALL | ok |
| email_sequence_log | 0 | nenhuma | CRITICO — bloqueada |
| fixed_costs | 1 | ALL | ok |
| inventory | 1 | ALL | ok |
| leads | 1 | ALL | ok |
| movements | 1 | ALL | ok |
| notifications | 4 | SELECT/INSERT/UPDATE/DELETE | ok — INSERT bloqueado diretamente (intencional) |
| orders | 1 | ALL | ok |
| payment_configs | 8 | ALL + admin bypass | ALERTA — 4 duplicadas |
| portfolio_items | 3 | ALL + ALL dup + public SELECT | ALERTA — 2 identicas |
| portfolios | 3 | ALL + ALL dup + public SELECT | ALERTA — 2 identicas |
| production | 1 | ALL (com WITH CHECK) | ok |
| products | 1 | ALL | ok |
| profiles | 2 | SELECT + INSERT | ALERTA — sem UPDATE |
| profit_goals | 1 | ALL | ok |
| projects | 1 | ALL | ok |
| transactions | 1 | ALL | ok |
| user_settings | 1 | ALL (com WITH CHECK) | ok |
| waitlist_leads | 4 | SELECT/INSERT/UPDATE/DELETE admin + public INSERT | ok — INSERT publico intencional |
| webhook_events | 0 | nenhuma | CRITICO — bloqueada |

### SECURITY DEFINER functions (7)

- `rls_auto_enable` — interno, baixo risco
- `create_catalog_lead` — **callable anon** (intencional, catalogo publico)
- `refresh_search_index` — interno
- `update_user_settings_updated_at` — trigger
- `handle_new_user` — trigger auth (search_path mutavel — corrigir)
- `process_webhook_atomic` — webhook handler
- `set_active_payment_config` — payment management

### anon grants

Todos os 20 tables publicas tem grants completos para anon (SELECT/INSERT/UPDATE/DELETE/etc).
Isso e padrao Supabase — RLS e a barreira. OK enquanto RLS estiver correto.

### DIFF vs semana anterior

Primeiro audit. Sem baseline para comparar. Proximo audit: ~2026-06-15.

### Fix SQL prioritario

```sql
-- PRIORIDADE 1: Desbloquear email_sequence_log para cron
CREATE POLICY email_sequence_log_service_insert
  ON public.email_sequence_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY email_sequence_log_admin_select
  ON public.email_sequence_log FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- PRIORIDADE 2: Corrigir config branch sem auth
DROP POLICY config_own ON public.config;
CREATE POLICY config_own ON public.config FOR ALL
  USING (
    (user_id IS NOT NULL AND auth.uid() = user_id)
    OR (user_id IS NULL AND id = 1 AND auth.uid() IS NOT NULL)
  )
  WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);

-- PRIORIDADE 3: webhook_events (verificar se usa service_role)
-- Se usa service_role, nao precisa de policy (bypassa RLS).
-- Se usa anon/authenticated key:
CREATE POLICY webhook_events_insert_service
  ON public.webhook_events FOR INSERT
  WITH CHECK (true);

-- PRIORIDADE 4: Corrigir search_path nas funcoes
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_payment_configs_updated_at() SET search_path = public;
ALTER FUNCTION public.touch_payment_configs_updated_at() SET search_path = public;

-- LIMPEZA: Remover policies duplicadas payment_configs
DROP POLICY payment_configs_delete_own ON public.payment_configs;
DROP POLICY payment_configs_insert_own ON public.payment_configs;
DROP POLICY payment_configs_select_own ON public.payment_configs;
DROP POLICY payment_configs_update_own ON public.payment_configs;

-- LIMPEZA: portfolios e portfolio_items
DROP POLICY portfolios_own ON public.portfolios;
DROP POLICY portfolio_items_own ON public.portfolio_items;
```

---
