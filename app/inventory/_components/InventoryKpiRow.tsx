'use client'

/**
 * InventoryKpiRow — 4 cards KPI do módulo de inventário.
 * Extraído de app/inventory/page.tsx em 2026-05-19 (refactor Felipe).
 */

import { Package, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'
import { fmt, fmtShort } from './helpers'

interface InventoryKpiRowProps {
  totalItems:          number
  stockValue:          number
  profitPotential:     number
  lowStockCount:       number
}

export function InventoryKpiRow({
  totalItems,
  stockValue,
  profitPotential,
  lowStockCount,
}: InventoryKpiRowProps) {
  const kpis = [
    {
      label: 'Total de Itens',
      value: `${totalItems}`,
      icon:  Package,
      color: 'text-[#a78bfa]',
      bg:    'bg-[#7c3aed1a]',
    },
    {
      label: 'Valor em Custo',
      value: fmt(stockValue),
      icon:  DollarSign,
      color: 'text-[#3b82f6]',
      bg:    'bg-[#3b82f61a]',
    },
    {
      label: 'Lucro Potencial',
      value: profitPotential > 0 ? fmtShort(profitPotential) : '—',
      icon:  TrendingUp,
      color: profitPotential > 0 ? 'text-[#10b981]' : 'text-[#555555]',
      bg:    profitPotential > 0 ? 'bg-[#10b9811a]' : 'bg-[#1c1c1c]',
    },
    {
      label: 'Em Alerta',
      value: `${lowStockCount}`,
      icon:  AlertTriangle,
      color: lowStockCount > 0 ? 'text-[#f59e0b]' : 'text-[#555555]',
      bg:    lowStockCount > 0 ? 'bg-[#f59e0b1a]' : 'bg-[#1c1c1c]',
    },
  ] as const

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {kpis.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${bg}`}>
              <Icon size={13} className={color} />
            </div>
            <span className="text-[#555555] text-xs font-medium uppercase tracking-wide">{label}</span>
          </div>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}
