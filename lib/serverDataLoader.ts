import type {
  AppState, Project, Order, Transaction,
  ProductionItem, InventoryItem, Lead,
} from './types'
import type { AdminConfig } from '@/core/admin/config'
import type { LazyModuleKey } from './store'
import { DEFAULT_ADMIN_CONFIG } from '@/core/admin/config'
import { createServerClient } from './supabaseServer'
import { cache } from 'react'

type DbClient = Awaited<ReturnType<typeof createServerClient>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safe<T>(data: T[] | null | undefined): T[] { return data ?? [] }

/**
 * Bundle retornado pelo loader SSR.
 *
 * `preloadedKeys` indica quais módulos lazy foram puxados pelo SSR.
 * StoreProvider usa essa lista pra marcar SÓ esses como 'loaded' —
 * módulos fora dessa lista ficam 'idle' e disparam fetch on-demand
 * quando a page que precisa deles é montada (useStoreModule).
 *
 * Sem essa distinção, todos os módulos virariam 'loaded' com array
 * vazia, e useStoreModule não dispararia fetch — usuário veria empty
 * state após F5 mesmo com dados persistidos (bug ADR 031).
 */
export type InitialStateBundle = {
  state: AppState
  preloadedKeys: LazyModuleKey[]
}

/**
 * Núcleo do path crítico do maker — lead → pedido → produção → finance.
 * Estes 5 são puxados sempre no SSR pra eliminar empty state após F5.
 * Demais (content, decisions, affiliates, movements, products, catalogs)
 * continuam lazy via useStoreModule quando a page específica monta.
 */
const SSR_CORE_KEYS: readonly LazyModuleKey[] = [
  'orders', 'production', 'inventory', 'transactions', 'leads',
] as const

/**
 * Shape carregado no boot SSR do RootLayout.
 *
 * Contagem de queries: 7 (projects + config + 5 núcleo) — era 2.
 * Subiu pra cobrir o golden path do soft launch 13/06 (ADR 030 Onda A
 * minimal). Demais 6 tabelas (content, decisions, affiliates, movements,
 * products, catalogs) ficam lazy.
 *
 * Por que não passar projectId nas queries: padrão atual filtra por
 * user_id (RLS garante isolamento entre users). Multi-tenant entre
 * projetos do MESMO user resolve via UI filtrando por projectId.
 * Débito conhecido — ataque planejado fora do timebox soft launch.
 *
 * Performance: cache() do React deduplica chamadas no mesmo
 * request lifecycle (ex: layout + page server component).
 */
export const loadInitialState = cache(async (
  supabase: DbClient,
  userId: string,
): Promise<InitialStateBundle> => {
  const [p, cfg, ord, prod, inv, tx, lds] = await Promise.all([
    supabase.from('projects').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('config').select('data').eq('user_id', userId).maybeSingle(),
    supabase.from('orders').select('*').eq('user_id', userId).order('date', { ascending: false }),
    supabase.from('production').select('*').eq('user_id', userId),
    supabase.from('inventory').select('*').eq('user_id', userId).order('name'),
    supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
    supabase.from('leads').select('*').eq('user_id', userId),
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

  // Transforms mantidos consistentes com serverDataLoaderLazy.ts.
  // Trade-off aceito: pouca duplicação vs. arquivo extra de helpers.
  const orders: Order[] = safe(ord.data).map((r): Order => ({
    id:               r.id,
    projectId:        r.project_id,
    clientName:       r.client_name,
    origin:           r.origin,
    item:             r.item,
    value:            Number(r.value),
    status:           r.status,
    date:             r.date,
    inventoryItemId:  r.inventory_item_id  ?? undefined,
    qtyUsed:          r.qty_used      != null ? Number(r.qty_used)          : undefined,
    productId:        r.product_id         ?? undefined,
    productionCost:   r.production_cost != null ? Number(r.production_cost) : undefined,
    source:           r.source             ?? undefined,
    catalogSlug:      r.catalog_slug       ?? undefined,
    paymentId:        r.payment_id         ?? undefined,
    paymentStatus:    r.payment_status     ?? undefined,
    customerWhatsapp: r.customer_whatsapp  ?? undefined,
  }))

  const production: ProductionItem[] = safe(prod.data).map((r): ProductionItem => ({
    id:             r.id,
    orderId:        r.order_id ?? '',
    projectId:      r.project_id ?? '',
    clientName:     r.client_name,
    item:           r.item,
    printer:        r.printer,
    status:         r.status,
    estimatedHours: Number(r.estimated_hours),
    priority:       Number(r.priority),
  }))

  const inventory: InventoryItem[] = safe(inv.data).map((r): InventoryItem => ({
    id:          r.id,
    projectId:   r.project_id,
    category:    r.category,
    name:        r.name,
    sku:         r.sku         ?? '',
    quantity:    Number(r.quantity     ?? 0),
    unit:        r.unit        ?? 'un',
    costPrice:   Number(r.cost_price   ?? 0),
    salePrice:   Number(r.sale_price   ?? 0),
    notes:       r.notes       ?? '',
    minStock:    r.min_stock   != null ? Number(r.min_stock)   : undefined,
    imageUrl:    r.image_url   ?? undefined,
    filamentUso: r.filament_uso ?? undefined,
  }))

  const transactions: Transaction[] = safe(tx.data).map((r): Transaction => ({
    id:          r.id,
    projectId:   r.project_id,
    type:        r.type,
    category:    r.category,
    description: r.description ?? '',
    value:       Number(r.value),
    date:        r.date,
    source:      r.source ?? '',
  }))

  const leads: Lead[] = safe(lds.data).map((r): Lead => ({
    id:            r.id,
    projectId:     r.project_id,
    name:          r.name,
    contact:       r.contact         ?? '',
    source:        r.source,
    status:        r.status,
    value:         Number(r.value    ?? 0),
    notes:         r.notes           ?? '',
    date:          r.date,
    lastContactAt: r.last_contact_at ?? undefined,
    expectedValue: r.expected_value  != null ? Number(r.expected_value) : undefined,
    assignedTo:    r.assigned_to     ?? undefined,
  }))

  return {
    state: {
      projects,
      config,
      orders,
      production,
      inventory,
      transactions,
      leads,
      // Campos lazy — vazios até useStoreModule disparar fetch on-demand.
      content:    [],
      decisions:  [],
      affiliates: [],
      movements:  [],
      products:   [],
      catalogs:   [],
    },
    preloadedKeys: [...SSR_CORE_KEYS],
  }
})
