/**
 * Product — a 3D print template that defines the physical properties of a
 * printable item. Used by the cost engine to calculate exact production cost
 * per order.
 */
export interface Product {
  id: string
  projectId: string
  name: string
  /** Filament consumed per successful print in grams. */
  materialGrams: number
  /** Machine time in hours per print. */
  printTimeHours: number
  /** Fraction of prints that fail (0–1). Default 0.10 = 10%. */
  failureRate: number
  /** Electricity cost per printer-hour in R$. Default R$0.50/h. */
  energyCostPerHour: number
  /**
   * Fixed support / overhead cost per unit in R$ (packaging, post-processing,
   * labour, etc.). Default R$0.
   */
  supportCost: number
  /**
   * Target profit margin as a decimal (e.g. 0.30 = 30%).
   * salePrice = totalCost × (1 + marginPercentage). Default 0.30.
   */
  marginPercentage: number
  /** Recommended sale price in R$. Auto-calculated or overridden manually. */
  salePrice: number
  /** Inventory item (filament spool) consumed by this product. */
  inventoryItemId?: string
  notes: string
  /** Public URL of the product image (Supabase Storage). */
  imageUrl?: string
}
