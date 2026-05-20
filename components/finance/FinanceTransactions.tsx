'use client'

import { MoreHorizontal, Pencil, Trash2, Search, BarChart3 } from 'lucide-react'
import type { Transaction, TransactionType, TransactionCategory } from '@/lib/types'
import { MonthlyChart, CategoryBars, type ChartMode } from '@/components/FinanceCharts'
import type { MonthlyRow } from '@/core/finance/engine'
import { ALL_LABELS, fmt, parseDate } from './types'

// ─── Transaction filter bar ───────────────────────────────────────────────────

interface FilterBarProps {
  filterType:        TransactionType | 'all'
  filterCategory:    TransactionCategory | 'all'
  dateFrom:          string
  dateTo:            string
  search:            string
  hasFilters:        boolean
  categoryOptions:   [string, string][]
  onTypeChange:      (t: TransactionType | 'all') => void
  onCategoryChange:  (c: TransactionCategory | 'all') => void
  onDateFromChange:  (v: string) => void
  onDateToChange:    (v: string) => void
  onSearchChange:    (v: string) => void
  onClearFilters:    () => void
}

export function FinanceFilterBar({
  filterType,
  filterCategory,
  dateFrom,
  dateTo,
  search,
  hasFilters,
  categoryOptions,
  onTypeChange,
  onCategoryChange,
  onDateFromChange,
  onDateToChange,
  onSearchChange,
  onClearFilters,
}: FilterBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'income', 'expense'] as const).map(t => (
          <button
            key={t}
            onClick={() => onTypeChange(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              filterType === t
                ? 'bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]'
                : 'text-[#888888] border-transparent hover:text-[#f0f0f5]'
            }`}
          >
            {t === 'all' ? 'Todas' : t === 'income' ? 'Receitas' : 'Despesas'}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={filterCategory}
          onChange={e => onCategoryChange(e.target.value as TransactionCategory | 'all')}
          aria-label="Filtrar por categoria"
          className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#888888] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#7c3aed] cursor-pointer"
        >
          <option value="all">Todas as categorias</option>
          {categoryOptions.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input
          type="date" value={dateFrom} onChange={e => onDateFromChange(e.target.value)}
          aria-label="Data de inicio"
          className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#888888] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#7c3aed]"
        />
        <span className="text-[#3a3a3a] text-xs" aria-hidden="true">ate</span>
        <input
          type="date" value={dateTo} onChange={e => onDateToChange(e.target.value)}
          aria-label="Data de fim"
          className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#888888] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#7c3aed]"
        />
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555] pointer-events-none" aria-hidden="true" />
          <input
            value={search} onChange={e => onSearchChange(e.target.value)}
            placeholder="Buscar..."
            aria-label="Buscar transacoes"
            className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#888888] text-xs rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-[#7c3aed] placeholder:text-[#3a3a3a] w-40"
          />
        </div>
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-[#555555] hover:text-[#f0f0f5] transition-colors"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Transaction list (mobile + desktop) ─────────────────────────────────────

interface TransactionListProps {
  transactions: Transaction[]
  filtered:     Transaction[]
  filteredRevenue:  number
  filteredExpenses: number
  menuOpen:     string | null
  projectName:  (id: string) => string
  onMenuToggle: (id: string | null) => void
  onEdit:       (t: Transaction) => void
  onDelete:     (id: string) => void
}

export function FinanceTransactionList({
  transactions,
  filtered,
  filteredRevenue,
  filteredExpenses,
  menuOpen,
  projectName,
  onMenuToggle,
  onEdit,
  onDelete,
}: TransactionListProps) {
  return (
    <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(255,255,255,0.05)]">
        <p className="text-[#555555] text-xs">
          {filtered.length} transac{filtered.length !== 1 ? 'oes' : 'ao'}
          {filtered.length !== transactions.length && ` (de ${transactions.length})`}
        </p>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#10b981] font-semibold tabular-nums">+{fmt(filteredRevenue)}</span>
          <span className="text-[#3a3a3a]" aria-hidden="true">·</span>
          <span className="text-[#ef4444] font-semibold tabular-nums">-{fmt(filteredExpenses)}</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-[#555555] text-sm">
          Nenhuma transacao encontrada.
        </div>
      ) : (
        <>
          {/* Mobile list */}
          <div className="sm:hidden divide-y divide-[rgba(255,255,255,0.03)]">
            {filtered.map(t => (
              <div key={t.id} className="px-4 py-3.5 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[#f0f0f5] text-sm font-medium truncate">{t.description}</p>
                    <p className="text-[#555555] text-xs mt-0.5">
                      {parseDate(t.date).toLocaleDateString('pt-BR')} · {projectName(t.projectId)}
                    </p>
                    <p className="text-[#444455] text-xs mt-0.5">
                      {ALL_LABELS[t.category as keyof typeof ALL_LABELS] ?? t.category}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    <span className={`text-sm font-semibold tabular-nums ${t.type === 'income' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {t.type === 'income' ? '+' : '-'}{fmt(Number(t.value))}
                    </span>
                    <button
                      onClick={() => onEdit(t)}
                      aria-label="Editar transacao"
                      className="p-1.5 text-[#3a3a3a] hover:text-[#888888] rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                    >
                      <Pencil size={12} aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => onDelete(t.id)}
                      aria-label="Excluir transacao"
                      className="p-1.5 text-[#3a3a3a] hover:text-[#ef4444] rounded-lg hover:bg-[#ef44441a] transition-colors"
                    >
                      <Trash2 size={12} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.05)]">
                  {['Data', 'Projeto', 'Descricao', 'Categoria', 'Valor', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide first:pl-5 last:w-10">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr
                    key={t.id}
                    className="border-b border-[rgba(255,255,255,0.03)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <td className="px-5 py-3 text-[#888888] text-xs whitespace-nowrap">
                      {parseDate(t.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-[#888888] text-xs whitespace-nowrap">
                      {projectName(t.projectId)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[#f0f0f5] text-sm">{t.description}</p>
                      {t.source && <p className="text-[#555555] text-xs">{t.source}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[#555555] text-xs">
                        {ALL_LABELS[t.category as keyof typeof ALL_LABELS] ?? t.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold tabular-nums ${t.type === 'income' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                        {t.type === 'income' ? '+' : '-'}{fmt(Number(t.value))}
                      </span>
                    </td>
                    <td className="px-2 py-3 relative">
                      <button
                        onClick={() => onMenuToggle(menuOpen === t.id ? null : t.id)}
                        aria-label="Mais opcoes"
                        className="p-1.5 text-[#555555] hover:text-[#f0f0f5] transition-colors rounded-lg hover:bg-[rgba(255,255,255,0.06)]"
                      >
                        <MoreHorizontal size={14} aria-hidden="true" />
                      </button>
                      {menuOpen === t.id && (
                        <div className="absolute right-2 top-10 bg-[#0d0d12] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl z-10 w-36 overflow-hidden">
                          <button
                            onClick={() => { onEdit(t); onMenuToggle(null) }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#888888] hover:text-[#f0f0f5] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                          >
                            <Pencil size={13} aria-hidden="true" /> Editar
                          </button>
                          <button
                            onClick={() => onDelete(t.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef44441a] transition-colors"
                          >
                            <Trash2 size={13} aria-hidden="true" /> Excluir
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Charts panel (monthly + category bars) ───────────────────────────────────

interface ChartsPanelProps {
  monthly:          MonthlyRow[]
  chartMode:        ChartMode
  onChartModeChange: (m: ChartMode) => void
  incomeBreakdown:  { category: string; label: string; value: number }[]
  expenseBreakdown: { category: string; label: string; value: number }[]
}

export function FinanceChartsPanel({
  monthly,
  chartMode,
  onChartModeChange,
  incomeBreakdown,
  expenseBreakdown,
}: ChartsPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="md:col-span-2 bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={14} className="text-[#555555]" aria-hidden="true" />
          <p className="text-[#f0f0f5] text-sm font-medium">Evolucao Mensal</p>
        </div>
        <MonthlyChart rows={monthly} mode={chartMode} onModeChange={onChartModeChange} />
      </div>
      <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl p-5 space-y-5">
        <div>
          <p className="text-[#10b981] text-xs font-semibold uppercase tracking-wide mb-3">
            Receita por Categoria
          </p>
          <CategoryBars rows={incomeBreakdown} color="bg-[#10b981]" />
        </div>
        {expenseBreakdown.length > 0 && (
          <div className="border-t border-[rgba(255,255,255,0.05)] pt-4">
            <p className="text-[#ef4444] text-xs font-semibold uppercase tracking-wide mb-3">
              Despesas por Categoria
            </p>
            <CategoryBars rows={expenseBreakdown} color="bg-[#ef4444]" />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Monthly summary table ────────────────────────────────────────────────────

export function FinanceMonthlySummary({ monthly }: { monthly: MonthlyRow[] }) {
  if (monthly.length === 0) return null

  return (
    <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.05)]">
        <p className="text-[#f0f0f5] text-sm font-medium">Resumo Mensal</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.05)]">
              {['Mes', 'Receita', 'Despesas', 'Lucro', 'Margem'].map(h => (
                <th key={h} className="text-left py-2.5 px-4 text-[#555555] text-xs font-medium uppercase tracking-wide first:pl-5 last:pr-5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...monthly].reverse().map(row => {
              const m = row.income > 0 ? (row.profit / row.income) * 100 : 0
              return (
                <tr key={row.month} className="border-b border-[rgba(255,255,255,0.03)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <td className="py-3 px-4 text-[#888888] text-xs first:pl-5 whitespace-nowrap">
                    {parseDate(row.month + '-15').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 text-[#10b981] text-xs font-medium tabular-nums">{fmt(row.income)}</td>
                  <td className="py-3 px-4 text-[#ef4444] text-xs font-medium tabular-nums">{fmt(row.expense)}</td>
                  <td className={`py-3 px-4 text-xs font-semibold tabular-nums ${row.profit >= 0 ? 'text-[#a78bfa]' : 'text-[#ef4444]'}`}>
                    {row.profit >= 0 ? '+' : ''}{fmt(row.profit)}
                  </td>
                  <td className={`py-3 px-4 text-xs font-medium last:pr-5 ${m >= 30 ? 'text-[#10b981]' : m >= 10 ? 'text-[#888888]' : 'text-[#ef4444]'}`}>
                    {m.toFixed(1)}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Re-export types needed by the orchestrator
export type { ChartMode }
