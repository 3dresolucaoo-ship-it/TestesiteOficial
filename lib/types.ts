// ─── Core re-exports ──────────────────────────────────────────────────────────
export type { AdminConfig } from '@/core/admin/config'
export { DEFAULT_ADMIN_CONFIG } from '@/core/admin/config'

export type { Product } from '@/core/products/types'

export type { ProjectModule, ProjectType } from '@/core/shared/types'
export { PROJECT_MODULES_BY_TYPE } from '@/core/shared/types'

export type {
  TransactionType, TransactionCategory, IncomeCategory, ExpenseCategory, Transaction,
} from '@/core/finance/types'
export { INCOME_CATEGORY_LABELS, EXPENSE_CATEGORY_LABELS } from '@/core/finance/types'

export type { LeadStatus, ContactSource, Lead, Affiliate } from '@/core/crm/types'
export { LEAD_STATUS_LABELS, CONTACT_SOURCE_LABELS } from '@/core/crm/types'

export type {
  InventoryCategory, InventoryItem, StockMovement, MovementReason,
} from '@/core/inventory/types'
export {
  INVENTORY_CATEGORY_LABELS, MOVEMENT_REASON_LABELS, MOVEMENT_REASONS_BY_TYPE,
} from '@/core/inventory/types'

// ─── Projects ─────────────────────────────────────────────────────────────────
import type { ProjectModule, ProjectType } from '@/core/shared/types'

export type ProjectStatus = 'active' | 'paused' | 'done'

export interface Project {
  id: string
  name: string
  status: ProjectStatus
  description: string
  type?: ProjectType
  modules?: ProjectModule[]
  color?: string
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export type OrderStatus = 'lead' | 'quote_sent' | 'paid' | 'delivered'
export type OrderOrigin = 'whatsapp' | 'instagram' | 'facebook' | 'other'

export interface Order {
  id: string
  projectId: string
  clientName: string
  origin: OrderOrigin
  item: string
  value: number
  status: OrderStatus
  date: string
  inventoryItemId?: string
  qtyUsed?: number
  /** Links to a Product template — used by the cost engine. */
  productId?: string
  /** Production cost locked in at order creation time (R$). */
  productionCost?: number
}

// ─── Production ───────────────────────────────────────────────────────────────
export type PrinterName      = 'bambu' | 'flashforge'
export type ProductionStatus = 'waiting' | 'printing' | 'done'

export interface ProductionItem {
  id: string
  orderId: string
  clientName: string
  item: string
  printer: PrinterName
  status: ProductionStatus
  estimatedHours: number
  priority: number
}

// ─── Content ──────────────────────────────────────────────────────────────────
export type ContentStatus   = 'idea' | 'recorded' | 'posted'
export type ContentPlatform = 'instagram' | 'youtube' | 'tiktok'

export interface ContentItem {
  id: string
  projectId: string
  idea: string
  status: ContentStatus
  platform: ContentPlatform
  views: number
  leads: number
  salesGenerated: number
  link: string
  date: string
  // Engagement metrics (optional — filled when status === 'posted')
  likes?:    number
  comments?: number
  shares?:   number
  saves?:    number
}

// ─── Decisions ────────────────────────────────────────────────────────────────
export type DecisionStatus = 'active' | 'discarded'

export interface Decision {
  id: string
  projectId: string
  decision: string
  impact: string
  date: string
  status: DecisionStatus
}

// ─── App State ────────────────────────────────────────────────────────────────
import type { Transaction } from '@/core/finance/types'
import type { Lead, Affiliate } from '@/core/crm/types'
import type { InventoryItem, StockMovement } from '@/core/inventory/types'
import type { AdminConfig } from '@/core/admin/config'
import type { Product } from '@/core/products/types'

export interface AppState {
  projects:     Project[]
  orders:       Order[]
  production:   ProductionItem[]
  content:      ContentItem[]
  decisions:    Decision[]
  transactions: Transaction[]
  leads:        Lead[]
  affiliates:   Affiliate[]
  inventory:    InventoryItem[]
  movements:    StockMovement[]
  config:       AdminConfig
  products:     Product[]
}
