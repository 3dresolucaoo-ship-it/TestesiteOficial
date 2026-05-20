'use client'

/**
 * InventoryTopProfit — top 5 itens por lucro potencial com barra de progresso.
 * Extraído de app/inventory/page.tsx em 2026-05-19 (refactor Felipe).
 */

import { Sparkles } from 'lucide-react'
import type { InventoryItem } from '@/lib/types'
import { fmtShort, itemProfit } from './helpers'

interface InventoryTopProfitProps {
  items:               InventoryItem[]
  profitPotentialTotal: number
}

export function InventoryTopProfit({ items, profitPotentialTotal }: InventoryTopProfitProps) {
  if (items.length === 0) return null

  const maxProfit = itemProfit(items[0])

  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={14} className="text-[#a78bfa]" />
        <p className="text-[#ebebeb] text-sm font-medium">Top Itens por Lucro Potencial</p>
        <span className="ml-auto text-[#3a3a3a] text-xs">estoque x margem</span>
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => {
          const profit = itemProfit(item)
          const margin = ((item.salePrice - item.costPrice) / item.salePrice) * 100
          return (
            <div key={item.id}>
              <div className="flex justify-between items-baseline mb-1">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-[#3a3a3a] text-[10px] font-bold tabular-nums w-4 shrink-0">
                    #{idx + 1}
                  </span>
                  <span className="text-[#888888] text-xs truncate">{item.name}</span>
                  <span className={`text-[10px] font-medium shrink-0 ${
                    margin >= 40 ? 'text-[#10b981]' : margin >= 20 ? 'text-[#a78bfa]' : 'text-[#f59e0b]'
                  }`}>
                    {margin.toFixed(0)}%
                  </span>
                </span>
                <span className="text-[#f0f0f5] text-xs font-semibold whitespace-nowrap ml-2">
                  {fmtShort(profit)}
                </span>
              </div>
              <div className="h-1.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                <div
                  style={{ width: `${(profit / maxProfit) * 100}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#10b981] transition-all duration-500"
                />
              </div>
            </div>
          )
        })}
      </div>
      {profitPotentialTotal > 0 && (
        <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.04)] flex justify-between items-baseline">
          <span className="text-[#555555] text-xs">Total em estoque</span>
          <span className="text-[#10b981] text-sm font-bold">{fmtShort(profitPotentialTotal)}</span>
        </div>
      )}
    </div>
  )
}
