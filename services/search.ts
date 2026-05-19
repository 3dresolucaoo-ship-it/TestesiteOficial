/**
 * services/search.ts
 *
 * Service de busca global (lupa no header do dashboard).
 * Consulta a view materializada search_index criada em
 * supabase/migrations/20260518_notifications_and_search.sql
 *
 * Estrategia de multi-tenant safety:
 *   A view materializada NAO tem RLS propria (views materializadas nao suportam
 *   RLS nativo no Postgres). O isolamento e garantido AQUI — toda query filtra
 *   obrigatoriamente user_id + project_id. Nao ha caminho de acesso sem esses
 *   filtros neste service.
 *
 * Full-text: usa to_tsquery('portuguese', ...) + ts_rank para rankear por
 * relevancia. Para termos parciais (ex: "HZR-26") usa ILIKE como fallback.
 *
 * Performance:
 *   - GIN idx_search_index_tsv: busca por tsvector (principal)
 *   - idx_search_index_tenant: filtro user_id + project_id
 *   - Limite padrao 10 resultados — dropdown rapido
 *
 * Refresh da view:
 *   Chamar refresh_search_index() via pg_cron ou manualmente via:
 *   await refreshSearchIndex() — disponivel neste service para uso em
 *   Server Actions apos bulk inserts criticos (ex: importacao de clientes).
 */

import { supabase }        from '@/lib/supabaseClient'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { serviceError, validateRequired } from '@/lib/serviceError'
import { requireUserId }   from '@/lib/getUser'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type SearchResultType = 'order' | 'customer' | 'product'

export interface SearchResult {
  type:      SearchResultType
  id:        string
  projectId: string
  title:     string
  subtitle:  string
  link?:     string   // URL relativa gerada pelo service, nao armazenada na view
}

// ─── Mapeamento de rota por tipo ──────────────────────────────────────────────

const RESULT_LINK: Record<SearchResultType, (id: string) => string> = {
  order:    (id) => `/orders?highlight=${id}`,
  customer: (id) => `/customers/${id}`,
  product:  (id) => `/products?highlight=${id}`,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDB(r: any): SearchResult {
  const type = r.type as SearchResultType
  return {
    type,
    id:        r.id,
    projectId: r.project_id,
    title:     r.title     ?? '',
    subtitle:  r.subtitle  ?? '',
    link:      RESULT_LINK[type]?.(r.id),
  }
}

// ─── Funcao principal ─────────────────────────────────────────────────────────

/**
 * Busca global no search_index.
 *
 * Estrategia de busca em duas etapas:
 *
 * 1. Full-text com to_tsquery + ts_rank (relevancia)
 *    - Funciona bem para palavras completas: "Joao Silva", "bambu", "filamento"
 *    - Usa indice GIN — rapido mesmo com milhares de registros
 *
 * 2. Se full-text retornar 0 resultados E o termo tiver >= 3 chars:
 *    - Fallback ILIKE para busca parcial (ex: codigo de pedido "HZR-26")
 *    - SEM indice — mas so aciona com query curta/parcial, volume baixo esperado
 *
 * Multi-tenant: AMBAS as etapas filtram user_id + project_id.
 *
 * @param query      - Termo de busca (sanitizado internamente)
 * @param userId     - ID do usuario autenticado
 * @param projectId  - ID do projeto ativo
 * @param limit      - Max resultados (default 10)
 */
export async function globalSearch(
  query: string,
  userId: string,
  projectId: string,
  limit = 10,
): Promise<SearchResult[]> {
  validateRequired('searchService.globalSearch', { userId, projectId })

  const term = query.trim()
  if (term.length < 2) return []

  // Sanitiza o termo para to_tsquery: remove caracteres especiais do postgres,
  // junta tokens com & (AND semantico entre palavras)
  const sanitized = term
    .replace(/[^\w\sáéíóúâêôãõàüçÁÉÍÓÚÂÊÔÃÕÀÜÇ-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join(' & ')

  if (!sanitized) return []

  // ── Etapa 1: full-text search ────────────────────────────────────────────────
  // Supabase nao tem helper nativo para to_tsquery — usamos textSearch
  // com type 'plain' que gera plainto_tsquery (mais tolerante que to_tsquery).
  const { data: ftsData, error: ftsError } = await supabase
    .from('search_index')
    .select('type, id, project_id, title, subtitle')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .textSearch('searchable_text', sanitized, {
      type:   'plain',
      config: 'portuguese',
    })
    .limit(limit)

  if (ftsError) serviceError('searchService.globalSearch (fts)', ftsError)

  if ((ftsData ?? []).length > 0) {
    return (ftsData ?? []).map(fromDB)
  }

  // ── Etapa 2: fallback ILIKE (termos parciais, codigos, etc.) ─────────────────
  if (term.length < 3) return []

  const { data: likeData, error: likeError } = await supabase
    .from('search_index')
    .select('type, id, project_id, title, subtitle')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .ilike('searchable_text', `%${term}%`)
    .limit(limit)

  if (likeError) serviceError('searchService.globalSearch (ilike)', likeError)

  return (likeData ?? []).map(fromDB)
}

/**
 * Helper: requireUserId() + globalSearch em uma chamada.
 * Uso em Server Actions / API routes onde o userId vem do contexto de auth.
 */
export async function searchForCurrentUser(
  query: string,
  projectId: string,
  limit = 10,
): Promise<SearchResult[]> {
  const userId = await requireUserId()
  return globalSearch(query, userId, projectId, limit)
}

// ─── Refresh da view materializada (service_role) ─────────────────────────────

/**
 * Dispara refresh da view materializada search_index.
 *
 * Quando usar:
 *   - Apos importacao bulk de clientes/produtos
 *   - Manualmente pelo admin via painel
 *   - Pelo job pg_cron (configurar separado via Supabase Dashboard SQL Editor):
 *     SELECT cron.schedule('refresh-search-index', '0 4 * * *',
 *       'SELECT refresh_search_index()');
 *
 * CONCURRENTLY: nao bloqueia leituras durante o refresh.
 * Tempo estimado: < 1s para volumes Hayzer MVP (< 10k rows).
 * Usa service_role porque refresh_search_index() e SECURITY DEFINER —
 * o RPC call exige autenticacao de nivel admin.
 */
export async function refreshSearchIndex(): Promise<void> {
  const admin = getSupabaseAdmin()
  const { error } = await admin.rpc('refresh_search_index')
  if (error) serviceError('searchService.refreshSearchIndex', error)
}
