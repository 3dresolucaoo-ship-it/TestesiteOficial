-- ============================================================================
-- Security Hardening OWASP — 2026-06-06
-- Fecha brechas CONFIRMADAS por auditoria (4 camadas) + verificação ao vivo em
-- prod (impersonando role anon). Ver decisions/034 + sessão 2026-06-06.
--
--   SEC-1  Funções SECURITY DEFINER executáveis por anon/authenticated via RPC
--          (process_webhook_atomic → forjar pedido "pago" sem pagar).
--   SEC-?  inventory_public_read / products_public_read com USING(true): qualquer
--          anônimo lia TODO o estoque (custo/margem/qtd) e produtos de todos os
--          makers via /rest/v1. Catálogo público agora usa admin client (server),
--          então essas policies não são mais necessárias.
--   SEC-2  profiles.role editável pelo próprio user (privilege escalation).
--
-- Testar em BRANCH Supabase antes de aplicar em prod.
-- ============================================================================

-- ── SEC-1: revogar EXECUTE de funções SECURITY DEFINER de PUBLIC/anon/authenticated
-- Loop pega todas as sobrecargas por nome (REVOKE exige assinatura exata).
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT 'public.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'process_webhook_atomic','handle_new_user','refresh_search_index',
        'rls_auto_enable','update_user_settings_updated_at',
        'update_payment_configs_updated_at','touch_payment_configs_updated_at',
        'set_active_payment_config'
      )
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
  END LOOP;
END $$;

-- Backend (service_role, via admin client) ainda precisa chamar estas RPCs.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT 'public.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('process_webhook_atomic','set_active_payment_config','refresh_search_index')
  LOOP
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.sig);
  END LOOP;
END $$;

-- NOTA: create_catalog_lead NÃO está na lista de revoke acima — ela CONTINUA
-- executável por anon de propósito (form público de orçamento, valida tudo
-- internamente + amarra produto ao dono do catálogo).

-- ── Leitura pública ampla de estoque/produtos: REMOVER ──────────────────────
-- Catálogo público (app/catalogo/[slug]) e checkout migraram pro admin client
-- (server-side), então não dependem mais destas policies. Sem elas, anon não
-- lê inventory/products via /rest/v1 — fecha o vazamento de custo/margem.
DROP POLICY IF EXISTS inventory_public_read ON public.inventory;
DROP POLICY IF EXISTS products_public_read  ON public.products;

-- ── SEC-2: travar profiles.role (privilege escalation) ──────────────────────
-- Antes: profiles_own FOR ALL USING(auth.uid()=id) deixava o user fazer
-- UPDATE profiles SET role='admin'. Agora: user só LÊ o próprio profile e, no
-- máximo, cria a própria linha com role='user' (fallback). NENHUMA policy de
-- UPDATE pro user → role é intocável; só muda via service_role/admin.
DROP POLICY IF EXISTS profiles_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id AND role = 'user');
-- (profiles_admin_all permanece: admin real, setado via service_role, gerencia.)
