'use client'

import type { InventoryCategory } from '@/lib/types'
import { INVENTORY_CATEGORY_LABELS } from '@/lib/types'
import { CAT_COLORS } from './helpers'

export function CatBadge({ cat }: { cat: InventoryCategory }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${CAT_COLORS[cat].badge}`}>
      {INVENTORY_CATEGORY_LABELS[cat]}
    </span>
  )
}
