/**
 * serverDataLoaderLazy.ts — Loaders on-demand para pages SSR especificas.
 *
 * Contexto: loadInitialState (serverDataLoader.ts) foi reduzido para 2 queries
 * (projects + config). As 11 queries restantes foram movidas aqui.
 *
 * Cada funcao usa cache() do React para deduplicar chamadas no mesmo
 * request lifecycle — se /orders/page.tsx e um Server Component filho
 * chamarem loadOrdersForUser() com o mesmo userId, o Postgres recebe
 * apenas 1 query.
 *
 * Regras:
 *   - project_id obrigatorio em toda query (multi-tenant)
 *   - user_id obrigatorio (RLS)
 *   - Cada funcao retorna array vazio em caso de erro (gracioso)
 *   - Pages SSR especificas importam apenas o que precisam
 *
 * Uso em page.tsx SSR:
 *   import { loadOrdersForUser } from '@/lib/serverDataLoaderLazy'
 *   const orders = await loadOrdersForUser(user.id)
 *   // passa como initialOrders pro client component via props
 */

import { cache } from 'react'
import type {
  Order, Transaction, ProductionItem, InventoryItem,
  Lead, Affiliate, ContentItem, Decision, StockMovement,
} from './types'
import type { Product } from '@/core/products/types'
import type { Catalog } from '@/core/catalog/types'
import { createServerClient } from './supabaseServer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safe<T>(data: T[] | null | undefined): T[] { return data ?? [] }

// ---------------------------------------------------------------------------
// Loaders lazy (1 query cada, cacheados por request)
// ---------------------------------------------------------------------------

/** Pedidos do usuario. Usada por /orders/page.tsx (SSR pre-fetch). */
export const loadOrdersForUser = cache(async (userId: string): Promise<Order[]> => {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (error) throw error
    return safe(data).map((r): Order => ({
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
  } catch {
    return []
  }
})

/** Transacoes financeiras. Usada por /finance/page.tsx (SSR pre-fetch). */
export const loadTransactionsForUser = cache(async (userId: string): Promise<Transaction[]> => {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (error) throw error
    return safe(data).map((r): Transaction => ({
      id:          r.id,
      projectId:   r.project_id,
      type:        r.type,
      category:    r.category,
      description: r.description ?? '',
      value:       Number(r.value),
      date:        r.date,
      source:      r.source ?? '',
    }))
  } catch {
    return []
  }
})

/** Itens de producao. Usada por /production/page.tsx. */
export const loadProductionForUser = cache(async (userId: string): Promise<ProductionItem[]> => {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('production')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return safe(data).map((r): ProductionItem => ({
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
  } catch {
    return []
  }
})

/** Itens de estoque. Usada por /inventory/page.tsx. */
export const loadInventoryForUser = cache(async (userId: string): Promise<InventoryItem[]> => {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId)
      .order('name')
    if (error) throw error
    return safe(data).map((r): InventoryItem => ({
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
  } catch {
    return []
  }
})

/** Leads e afiliados (CRM). Usada por /crm/page.tsx. */
export const loadLeadsForUser = cache(async (userId: string): Promise<Lead[]> => {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return safe(data).map((r): Lead => ({
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
  } catch {
    return []
  }
})

/** Afiliados. Usada por /crm/page.tsx junto com loadLeadsForUser. */
export const loadAffiliatesForUser = cache(async (userId: string): Promise<Affiliate[]> => {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return safe(data).map((r): Affiliate => ({
      id:         r.id,
      projectId:  r.project_id,
      name:       r.name,
      platform:   r.platform   ?? '',
      code:       r.code       ?? '',
      totalSales: Number(r.total_sales ?? 0),
      commission: Number(r.commission  ?? 15),
      status:     r.status,
      date:       r.date,
    }))
  } catch {
    return []
  }
})

/** Conteudos. Usada por /content/page.tsx. */
export const loadContentForUser = cache(async (userId: string): Promise<ContentItem[]> => {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return safe(data).map((r): ContentItem => ({
      id:             r.id,
      projectId:      r.project_id,
      idea:           r.idea,
      status:         r.status,
      platform:       r.platform,
      views:          Number(r.views           ?? 0),
      leads:          Number(r.leads           ?? 0),
      salesGenerated: Number(r.sales_generated ?? 0),
      link:           r.link    ?? '',
      date:           r.date,
      likes:          r.likes    != null ? Number(r.likes)    : undefined,
      comments:       r.comments != null ? Number(r.comments) : undefined,
      shares:         r.shares   != null ? Number(r.shares)   : undefined,
      saves:          r.saves    != null ? Number(r.saves)    : undefined,
    }))
  } catch {
    return []
  }
})

/** Decisoes estrategicas. Usada por /decisions/page.tsx. */
export const loadDecisionsForUser = cache(async (userId: string): Promise<Decision[]> => {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('decisions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (error) throw error
    return safe(data).map((r): Decision => ({
      id:        r.id,
      projectId: r.project_id,
      decision:  r.decision,
      impact:    r.impact ?? '',
      date:      r.date,
      status:    r.status,
    }))
  } catch {
    return []
  }
})

/** Movimentos de estoque. Usada por /inventory/page.tsx junto com loadInventoryForUser. */
export const loadMovementsForUser = cache(async (userId: string): Promise<StockMovement[]> => {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('movements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return safe(data).map((r): StockMovement => ({
      id:        r.id,
      projectId: r.project_id,
      itemId:    r.item_id,
      type:      r.type,
      quantity:  Number(r.quantity),
      reason:    r.reason,
      orderId:   r.order_id ?? undefined,
      date:      r.date,
      notes:     r.notes ?? '',
    }))
  } catch {
    return []
  }
})

/** Produtos (templates de impressao). Usada por /products/page.tsx. */
export const loadProductsForUser = cache(async (userId: string): Promise<Product[]> => {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('name')
    if (error) throw error
    return safe(data).map((r): Product => ({
      id:                r.id,
      projectId:         r.project_id,
      name:              r.name,
      materialGrams:     Number(r.material_grams       ?? 0),
      printTimeHours:    Number(r.print_time_hours      ?? 0),
      failureRate:       Number(r.failure_rate          ?? 0.10),
      energyCostPerHour: Number(r.energy_cost_per_hour  ?? 0.50),
      supportCost:       Number(r.support_cost          ?? 0),
      marginPercentage:  Number(r.margin_percentage     ?? 0.30),
      salePrice:         Number(r.sale_price            ?? 0),
      inventoryItemId:   r.inventory_item_id  ?? undefined,
      notes:             r.notes              ?? '',
      imageUrl:          r.image_url          ?? undefined,
      checkoutMode:      (r.checkout_mode ?? 'direct') as Product['checkoutMode'],
      variants:          Array.isArray(r.variants) ? r.variants : undefined,
      allowsCustom:      Boolean(r.allows_custom ?? false),
    }))
  } catch {
    return []
  }
})

/** Catalogos. Usada por /catalogs/page.tsx. */
export const loadCatalogsForUser = cache(async (userId: string): Promise<Catalog[]> => {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('catalogs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return safe(data).map((r): Catalog => ({
      id:            r.id,
      userId:        r.user_id,
      projectId:     r.project_id,
      name:          r.name,
      slug:          r.slug,
      mode:          r.mode,
      template:      r.template ?? 'grid',
      productIds:    r.product_ids ?? [],
      logoUrl:       r.logo_url       ?? undefined,
      whatsapp:      r.whatsapp       ?? undefined,
      portfolioSlug: r.portfolio_slug ?? undefined,
      isPublic:      r.is_public,
      createdAt:     r.created_at,
    }))
  } catch {
    return []
  }
})
