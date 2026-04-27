import type { AppState, Project, Transaction, Order, ProductionItem, InventoryItem, Lead, Affiliate, ContentItem, Decision, StockMovement, Catalog } from './types'
import type { Product } from '@/core/products/types'
import { DEFAULT_ADMIN_CONFIG } from '@/core/admin/config'
import { createServerClient } from './supabaseServer'

type DbClient = Awaited<ReturnType<typeof createServerClient>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safe<T>(data: T[] | null | undefined): T[] { return data ?? [] }

export async function loadInitialState(
  supabase: DbClient,
  userId:   string,
): Promise<AppState> {
  const [p, tx, ord, prod, inv, lds, aff, cnt, dec, mvs, prods, cats, cfg] = await Promise.all([
    supabase.from('projects').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
    supabase.from('orders').select('*').eq('user_id', userId).order('date', { ascending: false }),
    supabase.from('production').select('*').eq('user_id', userId),
    supabase.from('inventory').select('*').eq('user_id', userId).order('name'),
    supabase.from('leads').select('*').eq('user_id', userId),
    supabase.from('affiliates').select('*').eq('user_id', userId),
    supabase.from('content').select('*').eq('user_id', userId),
    supabase.from('decisions').select('*').eq('user_id', userId).order('date', { ascending: false }),
    supabase.from('movements').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('products').select('*').eq('user_id', userId).order('name'),
    supabase.from('catalogs').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('config').select('data').eq('user_id', userId).maybeSingle(),
  ])

  return {
    projects: safe(p.data).map((r): Project => ({
      id:          r.id,
      name:        r.name,
      status:      r.status,
      description: r.description ?? '',
      type:        r.type        ?? undefined,
      modules:     r.modules     ?? [],
      color:       r.color       ?? undefined,
    })),

    transactions: safe(tx.data).map((r): Transaction => ({
      id:          r.id,
      projectId:   r.project_id,
      type:        r.type,
      category:    r.category,
      description: r.description ?? '',
      value:       Number(r.value),
      date:        r.date,
      source:      r.source ?? '',
    })),

    orders: safe(ord.data).map((r): Order => ({
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
    })),

    production: safe(prod.data).map((r): ProductionItem => ({
      id:             r.id,
      orderId:        r.order_id ?? '',
      clientName:     r.client_name,
      item:           r.item,
      printer:        r.printer,
      status:         r.status,
      estimatedHours: Number(r.estimated_hours),
      priority:       Number(r.priority),
    })),

    inventory: safe(inv.data).map((r): InventoryItem => ({
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
    })),

    leads: safe(lds.data).map((r): Lead => ({
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
    })),

    content: safe(cnt.data).map((r): ContentItem => ({
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
    })),

    products: safe(prods.data).map((r): Product => ({
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
    })),

    catalogs: safe(cats.data).map((r): Catalog => ({
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
    })),

    decisions: safe(dec.data).map((r): Decision => ({
      id:        r.id,
      projectId: r.project_id,
      decision:  r.decision,
      impact:    r.impact ?? '',
      date:      r.date,
      status:    r.status,
    })),

    affiliates: safe(aff.data).map((r): Affiliate => ({
      id:         r.id,
      projectId:  r.project_id,
      name:       r.name,
      platform:   r.platform   ?? '',
      code:       r.code       ?? '',
      totalSales: Number(r.total_sales ?? 0),
      commission: Number(r.commission  ?? 15),
      status:     r.status,
      date:       r.date,
    })),

    movements: safe(mvs.data).map((r): StockMovement => ({
      id:        r.id,
      projectId: r.project_id,
      itemId:    r.item_id,
      type:      r.type,
      quantity:  Number(r.quantity),
      reason:    r.reason,
      orderId:   r.order_id ?? undefined,
      date:      r.date,
      notes:     r.notes ?? '',
    })),

    config: cfg.data?.data
      ? { ...DEFAULT_ADMIN_CONFIG, ...(cfg.data.data as object) }
      : DEFAULT_ADMIN_CONFIG,
  }
}
