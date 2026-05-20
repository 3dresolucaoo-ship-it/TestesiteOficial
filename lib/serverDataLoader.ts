import type { AppState, Project } from './types'
import type { AdminConfig } from '@/core/admin/config'
import { DEFAULT_ADMIN_CONFIG } from '@/core/admin/config'
import { createServerClient } from './supabaseServer'
import { cache } from 'react'

type DbClient = Awaited<ReturnType<typeof createServerClient>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safe<T>(data: T[] | null | undefined): T[] { return data ?? [] }

/**
 * Shape minimo carregado no boot SSR do RootLayout.
 *
 * Contagem de queries: 2 (projects + config) — era 13.
 * Motivo: as outras 11 tabelas (orders, transactions, production,
 * inventory, leads, affiliates, content, decisions, movements,
 * products, catalogs) sao carregadas client-side pelo store.tsx
 * via loadFromSupabase() apos o hydrate inicial, ou server-side
 * pelas pages que precisam via serverDataLoaderLazy.ts.
 *
 * Critico para o paint inicial:
 *   - projects  -> sidebar mostra lista de projetos
 *   - config    -> feature flags, nome do negocio, tema
 *
 * Performance: cache() do React deduplica chamadas no mesmo
 * request lifecycle (ex: layout + page server component).
 */
export const loadInitialState = cache(async (
  supabase: DbClient,
  userId: string,
): Promise<AppState> => {
  const [p, cfg] = await Promise.all([
    supabase.from('projects').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('config').select('data').eq('user_id', userId).maybeSingle(),
  ])

  const projects: Project[] = safe(p.data).map((r) => ({
    id:          r.id,
    name:        r.name,
    status:      r.status,
    description: r.description ?? '',
    type:        r.type        ?? undefined,
    modules:     r.modules     ?? [],
    color:       r.color       ?? undefined,
  }))

  const config: AdminConfig = cfg.data?.data
    ? { ...DEFAULT_ADMIN_CONFIG, ...(cfg.data.data as object) }
    : DEFAULT_ADMIN_CONFIG

  return {
    projects,
    config,
    // Campos lazy — preenchidos pelo store cliente via loadFromSupabase()
    // ou pelas pages SSR especificas via serverDataLoaderLazy.ts.
    orders:       [],
    production:   [],
    content:      [],
    decisions:    [],
    transactions: [],
    leads:        [],
    affiliates:   [],
    inventory:    [],
    movements:    [],
    products:     [],
    catalogs:     [],
  }
})
