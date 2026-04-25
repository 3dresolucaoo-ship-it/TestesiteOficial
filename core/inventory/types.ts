export type InventoryCategory = 'filament' | 'product' | 'equipment' | 'other'

export const INVENTORY_CATEGORY_LABELS: Record<InventoryCategory, string> = {
  filament:  'Filamento',
  product:   'Produto',
  equipment: 'Equipamento',
  other:     'Outro',
}

/** For filament items: intended use. Non-filament items should leave this undefined. */
export type FilamentUso = 'impressao' | 'venda' | 'ambos'

export const FILAMENT_USO_LABELS: Record<FilamentUso, string> = {
  impressao: 'Uso em impressão',
  venda:     'Venda',
  ambos:     'Ambos',
}

export interface InventoryItem {
  id: string
  projectId: string
  category: InventoryCategory
  name: string
  sku: string
  quantity: number
  unit: string
  costPrice: number
  salePrice: number
  notes: string
  minStock?: number
  imageUrl?: string
  /** Only for filament category */
  filamentUso?: FilamentUso
}

// ─── Stock movements ──────────────────────────────────────────────────────────
export type MovementReason = 'purchase' | 'sale' | 'printing' | 'damage' | 'adjustment'

export const MOVEMENT_REASON_LABELS: Record<MovementReason, string> = {
  purchase:   'Compra',
  sale:       'Venda',
  printing:   'Uso em impressão',
  damage:     'Avaria',
  adjustment: 'Ajuste',
}

export const MOVEMENT_REASONS_BY_TYPE: Record<'in' | 'out', MovementReason[]> = {
  in:  ['purchase', 'adjustment'],
  out: ['sale', 'printing', 'damage', 'adjustment'],
}

export interface StockMovement {
  id: string
  projectId: string
  itemId: string
  type: 'in' | 'out'
  quantity: number
  reason: MovementReason
  orderId?: string
  date: string
  notes: string
}
