// ─── 3D Print Cost Calculator ─────────────────────────────────────────────────

export interface PrintCostInput {
  filamentUsedGrams:  number
  filamentCostPerKg:  number
  printTimeHours:     number
  energyCostPerHour?: number   // R$/h, default R$0.50
  failureRate?:       number   // 0–1, default 0.10 (10%)
  supportCost?:       number   // fixed overhead per unit in R$, default R$0
  marginPercentage?:  number   // profit margin as decimal, default 0.30 (30%)
  /** @deprecated Use marginPercentage instead. Legacy field — ignored when marginPercentage is set. */
  markupPercent?:     number
}

export interface PrintCostResult {
  materialCost:   number
  energyCost:     number
  failureCost:    number
  supportCost:    number
  totalCost:      number
  suggestedPrice: number
  breakdown: {
    filamentKgUsed:   number
    totalHours:       number
    marginPercentage: number   // decimal
  }
}

export function calculatePrintCost(input: PrintCostInput): PrintCostResult {
  const {
    filamentUsedGrams,
    filamentCostPerKg,
    printTimeHours,
    energyCostPerHour = 0.5,
    failureRate       = 0.1,
    supportCost       = 0,
  } = input

  // Prefer marginPercentage; fall back to legacy markupPercent / 100; default 0.30
  const marginPercentage =
    input.marginPercentage != null
      ? input.marginPercentage
      : input.markupPercent != null
        ? input.markupPercent / 100
        : 0.30

  const filamentKgUsed = filamentUsedGrams / 1000
  const materialCost   = filamentKgUsed * filamentCostPerKg
  const energyCost     = printTimeHours * energyCostPerHour
  const subtotal       = materialCost + energyCost
  const failureCost    = subtotal * failureRate
  const totalCost      = subtotal + failureCost + supportCost
  const suggestedPrice = totalCost * (1 + marginPercentage)

  const r = (n: number) => Math.round(n * 100) / 100

  return {
    materialCost:   r(materialCost),
    energyCost:     r(energyCost),
    failureCost:    r(failureCost),
    supportCost:    r(supportCost),
    totalCost:      r(totalCost),
    suggestedPrice: r(suggestedPrice),
    breakdown: { filamentKgUsed, totalHours: printTimeHours, marginPercentage },
  }
}

// ─── Calculate from Product type directly ────────────────────────────────────

import type { Product } from '@/core/products/types'

/**
 * Calculate costs straight from a Product record.
 * filamentCostPerKg: pass from AdminConfig (e.g. config.filamentCostPerKg ?? 80)
 */
export function calculateProductCost(
  product: Product,
  filamentCostPerKg: number,
): PrintCostResult {
  return calculatePrintCost({
    filamentUsedGrams:  product.materialGrams,
    filamentCostPerKg,
    printTimeHours:     product.printTimeHours,
    energyCostPerHour:  product.energyCostPerHour,
    failureRate:        product.failureRate,
    supportCost:        product.supportCost,
    marginPercentage:   product.marginPercentage,
  })
}

// ─── Batch estimate ───────────────────────────────────────────────────────────

export interface BatchItem {
  name?:     string
  grams:     number
  hours:     number
  quantity?: number
}

export interface BatchResult {
  totalCost:     number
  totalRevenue:  number
  totalProfit:   number
  items:         Array<PrintCostResult & { name?: string; quantity: number }>
}

export function batchCostEstimate(
  items:              BatchItem[],
  filamentCostPerKg:  number,
  energyCostPerHour = 0.5,
  marginPercentage  = 0.30,
): BatchResult {
  const results = items.map(item => {
    const qty = item.quantity ?? 1
    const single = calculatePrintCost({
      filamentUsedGrams: item.grams,
      filamentCostPerKg,
      printTimeHours: item.hours,
      energyCostPerHour,
      marginPercentage,
    })
    return { ...single, name: item.name, quantity: qty }
  })

  const totalCost    = results.reduce((s, r) => s + r.totalCost     * r.quantity, 0)
  const totalRevenue = results.reduce((s, r) => s + r.suggestedPrice * r.quantity, 0)

  return {
    totalCost:    Math.round(totalCost    * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalProfit:  Math.round((totalRevenue - totalCost) * 100) / 100,
    items: results,
  }
}
