'use client'

import type { MonthlyRow } from '@/core/finance/engine'

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtShort(v: number) {
  if (Math.abs(v) >= 1000)
    return `R$ ${(v / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}k`
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── Month label helper — avoids UTC→timezone shift ──────────────────────────
function monthLabel(m: string): string {
  const [y, mo] = m.split('-').map(Number)
  return new Date(y, mo - 1, 15).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
}

// ─── Chart mode type ──────────────────────────────────────────────────────────
export type ChartMode = 'both' | 'revenue' | 'expenses' | 'profit'

const MODE_LABELS: Record<ChartMode, string> = {
  both:     'Receita + Despesas',
  revenue:  'Só Receita',
  expenses: 'Só Despesas',
  profit:   'Lucro',
}

// ─── Monthly bar chart ────────────────────────────────────────────────────────
export function MonthlyChart({
  rows,
  mode = 'both',
  onModeChange,
}: {
  rows:          MonthlyRow[]
  mode?:         ChartMode
  onModeChange?: (m: ChartMode) => void
}) {
  if (rows.length === 0) {
    return <p className="text-[#555555] text-xs py-8 text-center">Sem dados para exibir.</p>
  }

  // Determine max for scale — always use positive absolute value
  const max = Math.max(
    ...rows.map(r => {
      if (mode === 'revenue')  return r.income
      if (mode === 'expenses') return r.expense
      if (mode === 'profit')   return Math.abs(r.profit)
      return Math.max(r.income, r.expense)
    }),
    1,
  )

  function barHeight(val: number): string {
    return `${Math.max((Math.abs(val) / max) * 100, 2)}%`
  }

  const modes: ChartMode[] = ['both', 'revenue', 'expenses', 'profit']

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      {onModeChange && (
        <div className="flex items-center gap-1 flex-wrap">
          {modes.map(m => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
                mode === m
                  ? 'bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]'
                  : 'text-[#555555] border-transparent hover:text-[#888888]'
              }`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>
      )}

      {/* Bars */}
      <div className="flex items-end gap-1.5 h-32">
        {rows.map(row => (
          <div key={row.month} className="flex-1 flex flex-col items-stretch gap-[2px]">
            <div className="flex items-end gap-[2px] flex-1">
              {(mode === 'both' || mode === 'revenue') && (
                <div
                  title={`Receita: ${fmtShort(row.income)}`}
                  style={{ height: barHeight(row.income) }}
                  className="flex-1 bg-[#10b981] rounded-t-sm min-h-[3px] transition-all duration-300 cursor-default"
                />
              )}
              {(mode === 'both' || mode === 'expenses') && (
                <div
                  title={`Despesas: ${fmtShort(row.expense)}`}
                  style={{ height: barHeight(row.expense) }}
                  className="flex-1 bg-[#ef4444] rounded-t-sm min-h-[3px] transition-all duration-300 cursor-default"
                />
              )}
              {mode === 'profit' && (
                <div
                  title={`Lucro: ${fmtShort(row.profit)}`}
                  style={{ height: barHeight(row.profit) }}
                  className={`flex-1 rounded-t-sm min-h-[3px] transition-all duration-300 cursor-default ${
                    row.profit >= 0 ? 'bg-[#a78bfa]' : 'bg-[#ef4444]'
                  }`}
                />
              )}
            </div>
            <p className="text-[#555555] text-[10px] text-center">{monthLabel(row.month)}</p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 pt-2 border-t border-[rgba(255,255,255,0.05)]">
        {(mode === 'both' || mode === 'revenue') && (
          <span className="flex items-center gap-1.5 text-[10px] text-[#555555]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981] shrink-0" /> Receita
          </span>
        )}
        {(mode === 'both' || mode === 'expenses') && (
          <span className="flex items-center gap-1.5 text-[10px] text-[#555555]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444] shrink-0" /> Despesas
          </span>
        )}
        {mode === 'profit' && (
          <span className="flex items-center gap-1.5 text-[10px] text-[#555555]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#a78bfa] shrink-0" /> Lucro
          </span>
        )}
        {rows.length > 0 && (
          <span className="ml-auto text-[10px] text-[#3a3a3a]">
            {rows.length} {rows.length === 1 ? 'mês' : 'meses'}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Category horizontal bars ─────────────────────────────────────────────────
export function CategoryBars({
  rows,
  color,
}: {
  rows:  Array<{ category: string; label: string; value: number }>
  color: string
}) {
  const max = Math.max(...rows.map(r => r.value), 1)
  if (rows.length === 0) {
    return <p className="text-[#555555] text-xs">Sem dados</p>
  }
  return (
    <div className="space-y-3">
      {rows.slice(0, 6).map(row => (
        <div key={row.category}>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[#888888] text-xs truncate pr-2">{row.label}</span>
            <span className="text-[#f0f0f5] text-xs font-medium whitespace-nowrap">{fmtShort(row.value)}</span>
          </div>
          <div className="h-1.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
            <div
              style={{ width: `${(row.value / max) * 100}%` }}
              className={`h-full rounded-full ${color} transition-all duration-500`}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Revenue + Profit dual area chart (for dashboard) ────────────────────────
export function RevenueLineChart({
  rows,
  height = 120,
}: {
  rows:    MonthlyRow[]
  height?: number
}) {
  if (rows.length < 2) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-[#444455] text-xs">Sem dados suficientes</p>
      </div>
    )
  }

  const W   = 400   // viewBox width (scales to container)
  const pad = 8

  const maxVal = Math.max(...rows.flatMap(r => [r.income, Math.abs(r.profit)]), 1)
  const step   = (W - pad * 2) / (rows.length - 1)

  function toY(v: number): number {
    return pad + (1 - Math.abs(v) / maxVal) * (height - pad * 2)
  }

  const revenuePoints = rows.map((r, i) => `${pad + i * step},${toY(r.income)}`).join(' ')
  const profitPoints  = rows.map((r, i) => `${pad + i * step},${toY(r.profit)}`).join(' ')

  const revLine   = rows.map((r, i) => `${i === 0 ? 'M' : 'L'}${pad + i * step},${toY(r.income)}`).join(' ')
  const profLine  = rows.map((r, i) => `${i === 0 ? 'M' : 'L'}${pad + i * step},${toY(r.profit)}`).join(' ')

  // Area fill closes back at the bottom
  const revArea   = `${revLine}  L${pad + (rows.length - 1) * step},${height - pad} L${pad},${height - pad} Z`
  const profArea  = `${profLine} L${pad + (rows.length - 1) * step},${height - pad} L${pad},${height - pad} Z`

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
      >
        <defs>
          <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#10b981" stopOpacity={0.30} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="prof-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#a78bfa" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Revenue area */}
        <path d={revArea}  fill="url(#rev-grad)" />
        {/* Profit area */}
        <path d={profArea} fill="url(#prof-grad)" />

        {/* Revenue line */}
        <path d={revLine}  fill="none" stroke="#10b981" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* Profit line */}
        <path d={profLine} fill="none" stroke="#a78bfa" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0" />

        {/* Month labels */}
        {rows.map((r, i) => (
          <text
            key={r.month}
            x={pad + i * step}
            y={height - 1}
            textAnchor="middle"
            fontSize="10"
            fill="rgba(136,136,160,0.7)"
            fontFamily="system-ui,sans-serif"
          >
            {monthLabel(r.month)}
          </text>
        ))}

        {/* Dots on last point */}
        <circle
          cx={pad + (rows.length - 1) * step}
          cy={toY(rows[rows.length - 1].income)}
          r="3" fill="#10b981"
          style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.8))' }}
        />
        <circle
          cx={pad + (rows.length - 1) * step}
          cy={toY(rows[rows.length - 1].profit)}
          r="3" fill="#a78bfa"
          style={{ filter: 'drop-shadow(0 0 4px rgba(167,139,250,0.8))' }}
        />
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-[10px] text-[#555566]">
          <span className="w-3 h-0.5 rounded-full bg-[#10b981] inline-block" /> Receita
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-[#555566]">
          <span className="w-3 h-0.5 rounded-full bg-[#a78bfa] inline-block" /> Lucro
        </span>
        <span className="ml-auto text-[10px] text-[#3a3a4a]">
          {fmtShort(rows[rows.length - 1].income)} último mês
        </span>
      </div>
    </div>
  )
}

// ─── Mini sparkline (area chart) for dashboard ────────────────────────────────
export function Sparkline({
  data,
  color = '#10b981',
  height = 40,
}: {
  data:    number[]
  color?:  string
  height?: number
}) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data, min + 0.001)
  const w = 100 / (data.length - 1)

  const points = data
    .map((v, i) => `${i * w},${height - ((v - min) / (max - min)) * height}`)
    .join(' ')

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
    >
      {/* Area fill */}
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} 100,${height}`}
        fill={`url(#sg-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
