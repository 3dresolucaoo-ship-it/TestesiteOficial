-- supabase/migrations/20260519_add_vertical_type.sql
-- Descricao: Adiciona suporte multi-vertical ao Hayzer (Maker + Beauty futuro 05/07)
--
-- Onda 1 (ate 04/07/2026): somente 'maker'. Toda row existente recebe DEFAULT 'maker'.
-- Onda 2 (a partir de 05/07/2026): 'beauty' habilitado. Service layer e CSS multi-tema
--   podem checar projects.vertical_type pra personalizar comportamento por vertical.
--
-- RLS: project_id + user_id continuam obrigatorios (regra global multi-tenant).
--   Nenhuma policy e alterada aqui, pois vertical_type e atributo do projeto,
--   nao um mecanismo de isolamento adicional. O isolamento entre usuarios ja e
--   garantido pelas policies existentes em projects.
--
-- Idempotente: seguro rodar N vezes (IF NOT EXISTS em todo comando critico).

-- ─── 1. ENUM vertical_type ─────────────────────────────────────────────────────
-- Cria o tipo apenas se ainda nao existe.
-- DO $$...END$$ e necessario porque CREATE TYPE nao suporta IF NOT EXISTS no Postgres 15.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'vertical_type'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.vertical_type AS ENUM ('maker', 'beauty');
  END IF;
END;
$$;

-- ─── 2. Coluna projects.vertical_type ─────────────────────────────────────────
-- ADD COLUMN IF NOT EXISTS e idempotente.
-- DEFAULT 'maker' garante que todas as rows existentes ficam corretas sem UPDATE manual.
-- NOT NULL enforced em novas insercoes a partir daqui.
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS vertical_type public.vertical_type
    NOT NULL DEFAULT 'maker';

-- ─── 3. Index para queries por vertical (dashboard, filtros futuros) ──────────
-- Seletividade baixa agora (so 'maker'), mas preparamos o indice antes de ter dados.
-- Quando 'beauty' entrar (Onda 2) o indice ja estara pronto sem custo de REINDEX.
CREATE INDEX IF NOT EXISTS projects_vertical_type_idx
  ON public.projects (vertical_type);

-- ─── 4. Comment explicativo na coluna ─────────────────────────────────────────
COMMENT ON COLUMN public.projects.vertical_type IS
  'Vertical de negocio do projeto. '
  'Onda 1 (ate 04/07/2026): somente maker. '
  'Onda 2 (05/07/2026+): beauty habilitado. '
  'Adicionar nova vertical = ALTER TYPE public.vertical_type ADD VALUE ''novo_valor''.';

-- ─── DOWN (reversao manual, se necessario) ────────────────────────────────────
-- ATENCAO: DROP TYPE so funciona apos remover coluna. Ordem importa.
--
-- ALTER TABLE public.projects DROP COLUMN IF EXISTS vertical_type;
-- DROP INDEX IF EXISTS projects_vertical_type_idx;
-- DROP TYPE IF EXISTS public.vertical_type;
