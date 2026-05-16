'use client'

/**
 * CostPreview — quebra de custo por unidade do produto.
 *
 * Extraído de app/products/page.tsx em 2026-05-16 (Felipe + Diego)
 * Mudanças visuais (Diego audit):
 * - Background `#0f0f0f` → `hsl(var(--card))` (token semântico)
 * - Border `#2a2a2a` → `hsl(var(--border))`
 * - Paleta de breakdown remapeada pra marca v2:
 *   Material #3b82f6 (azul) → petrol-300
 *   Energia #f59e0b (amarelo) → ember-400 (mantido tom mas via token)
 *   Falhas #ef4444 (vermelho) → destructive (mantido)
 *   Suporte #a78bfa (lilás banido) → fog-300 (neutro)
 *   Margem média #a78bfa → petrol-300
 */

import type { InventoryItem } from '@/lib/types'
import { calcUnitCost, filamentCostPerKg } from '@/core/analytics/productionEngine'

function fmt(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function fmtPct(v: number) {
  return `${v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

interface CostPreviewProps {
  materialGrams:     number
  printTimeHours:    number
  failureRate:       number
  energyCostPerHour: number
  supportCost:       number
  marginPercentage:  number
  salePrice:         number
  filamentItem:      InventoryItem | undefined
}

export function CostPreview({
  materialGrams,
  printTimeHours,
  failureRate,
  energyCostPerHour,
  supportCost,
  marginPercentage,
  salePrice,
  filamentItem,
}: CostPreviewProps) {
  const costPerKg  = filamentCostPerKg(filamentItem)
  const breakdown  = calcUnitCost(
    {
      id: '', projectId: '', name: '', notes: '',
      materialGrams, printTimeHours, failureRate, energyCostPerHour,
      supportCost, marginPercentage, salePrice,
      checkoutMode: 'direct', allowsCustom: false,
    },
    filamentItem ? [filamentItem] : [],
  )
  // Auto price = cost × (1 + margin); manual price if set
  const autoPrice  = breakdown.totalCost * (1 + marginPercentage)
  const effectivePrice = salePrice > 0 ? salePrice : autoPrice
  const profit     = effectivePrice - breakdown.totalCost
  const margin     = effectivePrice > 0 ? (profit / effectivePrice) * 100 : 0

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <p className="text-[#555555] text-xs font-semibold uppercase tracking-wide">
        Previsão de Custo por Unidade
      </p>

      <div className="space-y-1.5">
        {[
          { label: 'Material',  value: breakdown.materialCost, color: 'text-[hsl(173_30%_57%)]' },
          { label: 'Energia',   value: breakdown.energyCost,   color: 'text-[hsl(27_67%_65%)]' },
          { label: 'Falhas',    value: breakdown.failureCost,  color: 'text-[#ef4444]' },
          ...(supportCost > 0 ? [{ label: 'Suporte / Overhead', value: supportCost, color: 'text-[#888888]' }] : []),
        ].map(({ label, value, color }) => (
          <div key={label} className="flex justify-between items-center">
            <span className="text-[#555555] text-xs">{label}</span>
            <span className={`text-xs font-medium ${color}`}>{fmt(value)}</span>
          </div>
        ))}
        <div className="border-t border-border pt-1.5 flex justify-between items-center">
          <span className="text-[#888888] text-xs font-semibold">Custo Total</span>
          <span className="text-[#ebebeb] text-sm font-bold">{fmt(breakdown.totalCost)}</span>
        </div>
      </div>

      <div className="border-t border-border pt-3 space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[#555555] text-xs">
            {salePrice > 0 ? 'Preço de Venda (manual)' : `Preço Sugerido (+${(marginPercentage * 100).toFixed(0)}%)`}
          </span>
          <span className="text-[#ebebeb] text-xs font-medium">{fmt(effectivePrice)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#555555] text-xs">Lucro por Unidade</span>
          <span className={`text-xs font-semibold ${profit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
            {fmt(profit)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#555555] text-xs">Margem Real</span>
          <span className={`text-sm font-bold ${margin >= 40 ? 'text-[#10b981]' : margin >= 20 ? 'text-[hsl(173_30%_57%)]' : 'text-[hsl(27_67%_65%)]'}`}>
            {fmtPct(margin)}
          </span>
        </div>
      </div>

      {filamentItem && (
        <p className="text-[#3a3a3a] text-[10px]">
          Filamento: {filamentItem.name} · {fmt(costPerKg)}/kg
        </p>
      )}
    </div>
  )
}
