'use client'

/**
 * ProductKpiRow — grid de 4 KPIs globais de produtos.
 *
 * Exibe receita, custo de producao, lucro e margem media
 * com base nos produtos que tem pedidos pagos.
 * Extraído de app/products/page.tsx em 2026-05-19 (refactor Felipe).
 */

import { TrendingUp, Zap, DollarSign } from 'lucide-react'
import { fmt, fmtPct } from './helpers'

interface ProductKpiRowProps {
  totalRevenue: number
  totalCost:    number
  totalProfit:  number
  avgMargin:    number
}

export function ProductKpiRow({
  totalRevenue,
  totalCost,
  totalProfit,
  avgMargin,
}: ProductKpiRowProps) {
  const kpis = [
    {
      label: 'Receita (produtos)',
      value: fmt(totalRevenue),
      icon:  TrendingUp,
      color: 'text-[#10b981]',
      bg:    'bg-[#10b9811a]',
    },
    {
      label: 'Custo de Producao',
      value: fmt(totalCost),
      icon:  Zap,
      color: 'text-[#f59e0b]',
      bg:    'bg-[#f59e0b1a]',
    },
    {
      label: 'Lucro (produtos)',
      value: fmt(totalProfit),
      icon:  DollarSign,
      color: totalProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]',
      bg:    totalProfit >= 0 ? 'bg-[#10b9811a]' : 'bg-[#ef44441a]',
    },
    {
      label: 'Margem Media',
      value: fmtPct(avgMargin),
      icon:  TrendingUp,
      color: avgMargin >= 40 ? 'text-[#a78bfa]' : avgMargin >= 20 ? 'text-[#f59e0b]' : 'text-[#ef4444]',
      bg:    'bg-[#7c3aed1a]',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {kpis.map(({ label, value, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4"
          aria-label={`${label}: ${value}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${bg}`} aria-hidden="true">
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
