'use client'

/**
 * InventoryLowStockBanner — banner de alerta de estoque baixo.
 * Extraído de app/inventory/page.tsx em 2026-05-19 (refactor Felipe).
 */

import { AlertTriangle } from 'lucide-react'
import type { InventoryItem } from '@/lib/types'

interface InventoryLowStockBannerProps {
  items: InventoryItem[]
}

export function InventoryLowStockBanner({ items }: InventoryLowStockBannerProps) {
  if (items.length === 0) return null

  return (
    <div className="flex items-start gap-3 bg-[#f59e0b0d] border border-[#f59e0b22] rounded-xl px-4 py-3">
      <AlertTriangle size={15} className="text-[#f59e0b] mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[#f59e0b] text-sm font-medium">
          Estoque Baixo — {items.length}{' '}
          {items.length === 1 ? 'item' : 'itens'}
        </p>
        <p className="text-[#f59e0b] text-xs opacity-70 mt-0.5 truncate">
          {items
            .map(i => `${i.name} (${i.quantity}${i.unit !== 'un' ? i.unit : ''})`)
            .join(' · ')}
        </p>
      </div>
    </div>
  )
}
