/**
 * Tipos compartilhados pelos componentes do módulo Inventário.
 * Extraído de app/inventory/page.tsx em 2026-05-19 (refactor Felipe).
 */

import type { InventoryCategory } from '@/lib/types'
import type { FilamentUso } from '@/core/inventory/types'
import type { MovementReason } from '@/lib/types'

export type ItemFormData = {
  projectId:   string
  category:    InventoryCategory
  name:        string
  sku:         string
  quantity:    string
  unit:        string
  costPrice:   string
  salePrice:   string
  notes:       string
  minStock:    string
  imageUrl:    string
  filamentUso: FilamentUso | ''
}

export type MovementFormData = {
  itemId:   string
  type:     'in' | 'out'
  quantity: string
  reason:   MovementReason
  date:     string
  notes:    string
}
