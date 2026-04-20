/**
 * Production Intelligence Engine
 *
 * Calculates real production costs and profit for the 3D printing business.
 * Cost formula: material_cost + energy_cost + failure_loss = total_cost
 */
import type { Order, InventoryItem } from '@/lib/types'
import type { Product } from '@/core/products/types'
import { calculatePrintCost } from '@/core/operations/costCalculator'

// ─── Cost breakdown per order ─────────────────────────────────────────────────
export interface CostBreakdown {
  materialCost: number
  energyCost:   number
  failureCost:  number
  totalCost:    number
  /** Grams of filament used (including failure waste). */
  filamentUsedGrams: number
}

export interface OrderProfitData {
  orderId:         string
  productName:     string
  revenue:         number
  productionCost:  number
  profit:          number
  /** Margin as a percentage (0–100). */
  margin:          number
  breakdown?:      CostBreakdown
}

// ─── Per-product aggregated stats ─────────────────────────────────────────────
export interface ProductStats {
  product:      Product
  orderCount:   number
  totalRevenue: number
  totalCost:    number
  totalProfit:  number
  /** Weighted average margin across all paid/delivered orders. */
  avgMargin:    number
  /** Cost per single unit at current inventory prices. */
  unitCost:     CostBreakdown
}

// ─── Global production intelligence ──────────────────────────────────────────
export interface ProductionIntelligence {
  totalProductionCost: number
  totalRevenue:        number
  totalProfit:         number
  /** Overall profit margin % across all product orders. */
  overallMargin:       number
  ordersWithProduct:   number
  bestProduct:         ProductStats | null
  worstProduct:        ProductStats | null
  /** All products sorted by totalProfit desc. */
  productStats:        ProductStats[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Return filament cost per kg for a given inventory item.
 * Assumes inventory unit is "kg" (common for filament).
 * Falls back to R$80/kg (typical Brazilian market price) if unknown.
 */
export function filamentCostPerKg(item: InventoryItem | undefined): number {
  if (!item || item.costPrice <= 0) return 80
  if (item.unit === 'kg') return item.costPrice
  if (item.unit === 'g')  return item.costPrice * 1000
  return item.costPrice // assume kg
}

/**
 * Calculate full production cost for one unit of a product.
 * Uses `calculatePrintCost` from the cost calculator core.
 */
export function calcUnitCost(product: Product, inventoryItems: InventoryItem[]): CostBreakdown {
  const filamentItem = product.inventoryItemId
    ? inventoryItems.find(i => i.id === product.inventoryItemId)
    : undefined

  const r = (n: number) => Math.round(n * 100) / 100

  // Guard: no material defined → zero cost
  if (product.materialGrams <= 0 && product.printTimeHours <= 0) {
    return { materialCost: 0, energyCost: 0, failureCost: 0, totalCost: 0, filamentUsedGrams: 0 }
  }

  const costPerKg = filamentCostPerKg(filamentItem)

  const result = calculatePrintCost({
    filamentUsedGrams:  product.materialGrams,
    filamentCostPerKg:  costPerKg,
    printTimeHours:     product.printTimeHours,
    energyCostPerHour:  product.energyCostPerHour,
    failureRate:        product.failureRate,
    supportCost:        product.supportCost      ?? 0,
    marginPercentage:   0, // cost only — no margin applied
  })

  // Total filament consumed accounting for failed prints
  const filamentUsedGrams = r(product.materialGrams * (1 + product.failureRate))

  return {
    materialCost:      result.materialCost,
    energyCost:        result.energyCost,
    failureCost:       result.failureCost,
    totalCost:         result.totalCost,
    filamentUsedGrams,
  }
}

// ─── Per-order profit ─────────────────────────────────────────────────────────

/**
 * Calculate profit for a single order.
 *
 * Priority:
 * 1. Live recalculation from Product template + current inventory prices
 * 2. `order.productionCost` stored at creation time (if no template found)
 * 3. Zero cost (unknown)
 */
export function calcOrderProfit(
  order:          Order,
  products:       Product[],
  inventoryItems: InventoryItem[],
): OrderProfitData {
  const product = order.productId
    ? products.find(p => p.id === order.productId)
    : undefined

  let productionCost: number
  let breakdown: CostBreakdown | undefined

  if (product) {
    breakdown        = calcUnitCost(product, inventoryItems)
    productionCost   = breakdown.totalCost
  } else {
    productionCost   = order.productionCost ?? 0
  }

  const revenue = order.value
  const profit  = revenue - productionCost
  const margin  = revenue > 0 ? (profit / revenue) * 100 : 0

  return {
    orderId:        order.id,
    productName:    product?.name ?? order.item,
    revenue,
    productionCost,
    profit,
    margin,
    breakdown,
  }
}

// ─── Per-product aggregated stats ─────────────────────────────────────────────

/**
 * Get stats for every product, sorted by total profit (descending).
 * Only counts orders with status 'paid' or 'delivered'.
 */
export function getProductStats(
  products:       Product[],
  orders:         Order[],
  inventoryItems: InventoryItem[],
): ProductStats[] {
  return products
    .map(product => {
      const productOrders = orders.filter(
        o => o.productId === product.id &&
             (o.status === 'paid' || o.status === 'delivered'),
      )

      const unitCost     = calcUnitCost(product, inventoryItems)
      const totalRevenue = productOrders.reduce((s, o) => s + o.value, 0)
      const totalCost    = productOrders.length * unitCost.totalCost
      const totalProfit  = totalRevenue - totalCost
      const avgMargin    = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

      return {
        product,
        orderCount: productOrders.length,
        totalRevenue,
        totalCost,
        totalProfit,
        avgMargin,
        unitCost,
      }
    })
    .sort((a, b) => b.totalProfit - a.totalProfit)
}

// ─── Global intelligence ──────────────────────────────────────────────────────

/**
 * Compute overall production intelligence for the dashboard.
 * Only considers paid + delivered orders that have a linked Product.
 */
export function getProductionIntelligence(
  products:       Product[],
  orders:         Order[],
  inventoryItems: InventoryItem[],
): ProductionIntelligence {
  const paidOrDelivered = orders.filter(
    o => o.status === 'paid' || o.status === 'delivered',
  )
  const withProduct = paidOrDelivered.filter(o => o.productId)

  const allProfits = withProduct.map(o =>
    calcOrderProfit(o, products, inventoryItems),
  )

  const totalRevenue        = allProfits.reduce((s, p) => s + p.revenue, 0)
  const totalProductionCost = allProfits.reduce((s, p) => s + p.productionCost, 0)
  const totalProfit         = totalRevenue - totalProductionCost
  const overallMargin       = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  const productStats      = getProductStats(products, orders, inventoryItems)
  const statsWithOrders   = productStats.filter(s => s.orderCount > 0)

  return {
    totalProductionCost,
    totalRevenue,
    totalProfit,
    overallMargin,
    ordersWithProduct: withProduct.length,
    bestProduct:  statsWithOrders.length > 0 ? statsWithOrders[0]                          : null,
    worstProduct: statsWithOrders.length > 1 ? statsWithOrders[statsWithOrders.length - 1] : null,
    productStats,
  }
}
