/**
 * Product — a 3D print template that defines the physical properties of a
 * printable item. Used by the cost engine to calculate exact production cost
 * per order.
 */
export type CheckoutMode = 'direct' | 'variant' | 'quote' | 'contact_only'

export interface ProductVariantGroup {
  name: string
  options: string[]
}

export interface Product {
  id: string
  projectId: string
  name: string
  materialGrams: number
  printTimeHours: number
  failureRate: number
  energyCostPerHour: number
  supportCost: number
  marginPercentage: number
  salePrice: number
  inventoryItemId?: string
  notes: string
  imageUrl?: string
  checkoutMode: CheckoutMode
  variants?: ProductVariantGroup[]
  allowsCustom: boolean
}
