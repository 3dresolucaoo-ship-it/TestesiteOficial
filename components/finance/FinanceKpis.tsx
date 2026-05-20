'use client'

import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react'
import { fmt } from './types'

// ─── KPI cards (receita / despesas / lucro / margem) ─────────────────────────

interface FinanceKpisProps {
  revenue:  number
  expenses: number
  profit:   number
  margin:   number
}

export function FinanceKpis({ revenue, expenses, profit, margin }: FinanceKpisProps) {
  const cards = [
    {
      label: 'Receita',
      value: fmt(revenue),
      icon:  TrendingUp,
      color: 'text-[#10b981]',
      bg:    'bg-[#10b9811a]',
      glow:  'shadow-[0_0_20px_rgba(16,185,129,0.08)]',
    },
    {
      label: 'Despesas',
      value: fmt(expenses),
      icon:  TrendingDown,
      color: 'text-[#ef4444]',
      bg:    'bg-[#ef44441a]',
      glow:  'shadow-[0_0_20px_rgba(239,68,68,0.08)]',
    },
    {
      label: 'Lucro',
      value: fmt(profit),
      icon:  DollarSign,
      color: profit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]',
      bg:    profit >= 0 ? 'bg-[#10b9811a]' : 'bg-[#ef44441a]',
      glow:  profit >= 0
        ? 'shadow-[0_0_20px_rgba(16,185,129,0.08)]'
        : 'shadow-[0_0_20px_rgba(239,68,68,0.08)]',
    },
    {
      label: 'Margem',
      value: `${margin.toFixed(1)}%`,
      icon:  Percent,
      color: margin >= 20 ? 'text-[#a78bfa]' : margin >= 0 ? 'text-[#f59e0b]' : 'text-[#ef4444]',
      bg:    'bg-[#7c3aed1a]',
      glow:  'shadow-[0_0_20px_rgba(124,58,237,0.08)]',
    },
  ] as const

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(({ label, value, icon: Icon, color, bg, glow }) => (
        <div
          key={label}
          className={`bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 hover:border-[rgba(255,255,255,0.12)] transition-all ${glow}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${bg}`}>
              <Icon size={13} className={color} aria-hidden="true" />
            </div>
            <span className="text-[#555555] text-xs uppercase tracking-wide font-medium">
              {label}
            </span>
          </div>
          <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}
