'use client'

/**
 * InventoryCatBreakdown — gráfico de barras horizontal de valor por categoria.
 * Extraído de app/inventory/page.tsx em 2026-05-19 (refactor Felipe).
 */

import { Layers } from 'lucide-react'
import type { InventoryCategory } from '@/lib/types'
import { CatBadge } from './CatBadge'
import { fmt, CAT_COLORS } from './helpers'

interface CatValueItem {
  cat:   InventoryCategory
  value: number
  count: number
}

interface InventoryCatBreakdownProps {
  catValues: CatValueItem[]
}

export function InventoryCatBreakdown({ catValues }: InventoryCatBreakdownProps) {
  if (catValues.length === 0) return null

  const maxCatValue = Math.max(...catValues.map(c => c.value), 1)

  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Layers size={14} className="text-[#555555]" />
        <p className="text-[#ebebeb] text-sm font-medium">Valor por Categoria</p>
      </div>
      <div className="space-y-3">
        {catValues.map(({ cat, value, count }) => (
          <div key={cat}>
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="flex items-center gap-2">
                <CatBadge cat={cat} />
                <span className="text-[#555555] text-xs">
                  {count} {count === 1 ? 'item' : 'itens'}
                </span>
              </span>
              <span className="text-[#ebebeb] text-xs font-semibold">{fmt(value)}</span>
            </div>
            <div className="h-1.5 bg-[#1c1c1c] rounded-full overflow-hidden">
              <div
                style={{ width: `${(value / maxCatValue) * 100}%` }}
                className={`h-full rounded-full transition-all ${CAT_COLORS[cat].bar}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
