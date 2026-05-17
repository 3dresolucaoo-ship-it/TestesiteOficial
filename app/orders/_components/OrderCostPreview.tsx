import { Cpu } from 'lucide-react'
import type { Product, InventoryItem } from '@/lib/types'
import { calcUnitCost } from '@/core/analytics/productionEngine'

/**
 * Preview compacto de custo de produção dentro do form de pedido.
 * Aparece quando o usuário seleciona um template de produto.
 *
 * Extraído de app/orders/page.tsx em 2026-05-16.
 */
export function OrderCostPreview({ product, inventory, salePrice }: {
  product:   Product
  inventory: InventoryItem[]
  salePrice: number
}) {
  const breakdown = calcUnitCost(product, inventory)
  const profit    = salePrice - breakdown.totalCost
  const margin    = salePrice > 0 ? (profit / salePrice) * 100 : 0
  const fmt       = (v: number) => `R$ ${v.toFixed(2)}`

  return (
    <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3 space-y-2">
      <div className="flex items-center gap-1.5 mb-1">
        <Cpu size={11} className="text-[#555555]" />
        <p className="text-[#555555] text-[10px] font-semibold uppercase tracking-wide">
          Custo de Produção
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Material', value: breakdown.materialCost, color: 'text-[#3b82f6]' },
          { label: 'Energia',  value: breakdown.energyCost,   color: 'text-[#f59e0b]' },
          { label: 'Falha',    value: breakdown.failureCost,  color: 'text-[#ef4444]' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p className={`text-xs font-semibold ${color}`}>{fmt(value)}</p>
            <p className="text-[#3a3a3a] text-[10px]">{label}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-[#2a2a2a] pt-2 flex items-center justify-between">
        <div>
          <span className="text-[#888888] text-xs">Custo total: </span>
          <span className="text-[#ebebeb] text-xs font-bold">{fmt(breakdown.totalCost)}</span>
        </div>
        {salePrice > 0 && (
          <div className="text-right">
            <span className="text-[#888888] text-xs">Margem: </span>
            <span className={`text-xs font-bold ${
              margin >= 40 ? 'text-[#10b981]' : margin >= 20 ? 'text-[#a78bfa]' : 'text-[#f59e0b]'
            }`}>
              {margin.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
