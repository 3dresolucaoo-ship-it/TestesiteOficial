'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useStore, uid } from '@/lib/store'
import type { Transaction, TransactionType, TransactionCategory, IncomeCategory, ExpenseCategory } from '@/lib/types'
import { INCOME_CATEGORY_LABELS, EXPENSE_CATEGORY_LABELS } from '@/lib/types'
import {
  calcRevenue, calcExpenses, calcProfit, monthlyBreakdown,
  exportCsv, downloadCsv, categoryBreakdown, profitMargin,
} from '@/core/finance/engine'
import { MonthlyChart, CategoryBars } from '@/components/FinanceCharts'
import {
  Plus, Download, TrendingUp, TrendingDown, DollarSign, Percent,
  Trash2, MoreHorizontal, Pencil, Search,
} from 'lucide-react'
import { Modal, FormField, Input, Select, SubmitButton } from '@/components/Modal'

const ALL_LABELS = { ...INCOME_CATEGORY_LABELS, ...EXPENSE_CATEGORY_LABELS }

function fmt(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Parse a YYYY-MM-DD string as a local date (avoids UTC→timezone shift). */
function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// ─── Transaction form ─────────────────────────────────────────────────────────
type FormData = {
  type: TransactionType; category: TransactionCategory
  description: string; value: string; date: string; source: string
}

function TxForm({ initial, onSave, onClose }: {
  initial?: FormData; onSave: (d: FormData) => void; onClose: () => void
}) {
  const [data, setData] = useState<FormData>(initial ?? {
    type: 'income', category: 'product_sale',
    description: '', value: '', date: new Date().toISOString().slice(0, 10), source: '',
  })
  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setData(p => ({ ...p, [k]: e.target.value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.description.trim() || !data.value) return
    onSave(data)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {(['income', 'expense'] as const).map(t => (
          <button key={t} type="button"
            onClick={() => setData(p => ({ ...p, type: t, category: t === 'income' ? 'product_sale' : 'filament' }))}
            className={`py-2 rounded-lg text-sm font-medium transition-colors border ${
              data.type === t
                ? t === 'income'
                  ? 'bg-[#10b9811a] text-[#10b981] border-[#10b98133]'
                  : 'bg-[#ef44441a] text-[#ef4444] border-[#ef444433]'
                : 'bg-transparent text-[#888888] border-[#2a2a2a]'
            }`}
          >
            {t === 'income' ? 'Receita' : 'Despesa'}
          </button>
        ))}
      </div>
      <FormField label="Categoria">
        <Select value={data.category} onChange={set('category')}>
          {Object.entries(data.type === 'income' ? INCOME_CATEGORY_LABELS : EXPENSE_CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      </FormField>
      <FormField label="Descrição">
        <Input value={data.description} onChange={set('description')} placeholder="Ex: Venda produto X" required />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Valor (R$)">
          <Input type="number" value={data.value} onChange={set('value')} placeholder="0.00" min="0" step="0.01" required />
        </FormField>
        <FormField label="Data">
          <Input type="date" value={data.date} onChange={set('date')} />
        </FormField>
      </div>
      <FormField label="Fonte / Origem">
        <Input value={data.source} onChange={set('source')} placeholder="Ex: WhatsApp, Hotmart..." />
      </FormField>
      <SubmitButton>{initial ? 'Salvar' : 'Registrar'}</SubmitButton>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProjectFinancePage() {
  const { projectId } = useParams() as { projectId: string }
  const { state, dispatch } = useStore()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  // Filters
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<TransactionCategory | 'all'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')

  // KPIs — full project scope
  const revenue  = calcRevenue(state.transactions, projectId)
  const expenses = calcExpenses(state.transactions, projectId)
  const profit   = calcProfit(state.transactions, projectId)
  const margin   = profitMargin(state.transactions, projectId)

  // Charts
  const monthly = monthlyBreakdown(state.transactions, projectId).slice(-6)

  // Category breakdowns
  const incomeBreakdown = categoryBreakdown(state.transactions, 'income', projectId).map(r => ({
    ...r, label: INCOME_CATEGORY_LABELS[r.category as IncomeCategory] ?? r.category,
  }))
  const expenseBreakdown = categoryBreakdown(state.transactions, 'expense', projectId).map(r => ({
    ...r, label: EXPENSE_CATEGORY_LABELS[r.category as ExpenseCategory] ?? r.category,
  }))

  // Transaction list — all filters applied
  const filtered = useMemo(() => {
    let txs = state.transactions.filter(t => t.projectId === projectId)
    if (filterType !== 'all') txs = txs.filter(t => t.type === filterType)
    if (filterCategory !== 'all') txs = txs.filter(t => t.category === filterCategory)
    if (dateFrom) txs = txs.filter(t => t.date >= dateFrom)
    if (dateTo)   txs = txs.filter(t => t.date <= dateTo)
    if (search) {
      const q = search.toLowerCase()
      txs = txs.filter(t =>
        t.description.toLowerCase().includes(q) || t.source.toLowerCase().includes(q),
      )
    }
    return [...txs].sort((a, b) => b.date.localeCompare(a.date))
  }, [state.transactions, projectId, filterType, filterCategory, dateFrom, dateTo, search])

  const project = state.projects.find(p => p.id === projectId)
  const totalCount = state.transactions.filter(t => t.projectId === projectId).length

  function handleCreate(data: FormData) {
    dispatch({ type: 'ADD_TRANSACTION', payload: { id: uid(), projectId, ...data, value: parseFloat(data.value) || 0 } })
  }
  function handleEdit(data: FormData) {
    if (!editing) return
    dispatch({ type: 'UPDATE_TRANSACTION', payload: { ...editing, ...data, value: parseFloat(data.value) || 0 } })
    setEditing(null)
  }
  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id })
    setMenuOpen(null)
  }
  function handleExport() {
    const csv = exportCsv(state.transactions, projectId)
    downloadCsv(csv, `financas-${project?.name ?? projectId}-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  const categoryOptions = filterType === 'income'
    ? Object.entries(INCOME_CATEGORY_LABELS)
    : filterType === 'expense'
    ? Object.entries(EXPENSE_CATEGORY_LABELS)
    : Object.entries(ALL_LABELS)

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[#ebebeb] font-semibold text-lg">Finanças</h2>
          <p className="text-[#555555] text-sm">{totalCount} transações</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 text-[#888888] hover:text-[#ebebeb] border border-[#2a2a2a] hover:border-[#3a3a3a] text-sm px-3 py-2 rounded-lg transition-colors"
          >
            <Download size={14} /> CSV
          </button>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} /> Transação
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Receita',  value: fmt(revenue),            icon: TrendingUp,   color: 'text-[#10b981]', bg: 'bg-[#10b9811a]' },
          { label: 'Despesas', value: fmt(expenses),           icon: TrendingDown, color: 'text-[#ef4444]', bg: 'bg-[#ef44441a]' },
          { label: 'Lucro',    value: fmt(profit),             icon: DollarSign,   color: profit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]', bg: profit >= 0 ? 'bg-[#10b9811a]' : 'bg-[#ef44441a]' },
          { label: 'Margem',   value: `${margin.toFixed(1)}%`, icon: Percent,      color: margin >= 20 ? 'text-[#10b981]' : margin >= 0 ? 'text-[#a78bfa]' : 'text-[#ef4444]', bg: 'bg-[#7c3aed1a]' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${bg}`}><Icon size={13} className={color} /></div>
              <span className="text-[#555555] text-xs uppercase tracking-wide font-medium">{label}</span>
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
          <p className="text-[#ebebeb] text-sm font-medium mb-4">Evolução Mensal</p>
          <MonthlyChart rows={monthly} />
        </div>
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 space-y-5">
          <div>
            <p className="text-[#10b981] text-xs font-semibold uppercase tracking-wide mb-3">Receita</p>
            <CategoryBars rows={incomeBreakdown} color="bg-[#10b981]" />
          </div>
          <div className="border-t border-[#1c1c1c] pt-4">
            <p className="text-[#ef4444] text-xs font-semibold uppercase tracking-wide mb-3">Despesas</p>
            <CategoryBars rows={expenseBreakdown} color="bg-[#ef4444]" />
          </div>
        </div>
      </div>

      {/* Monthly summary table */}
      {monthly.length > 0 && (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[#2a2a2a]">
            <p className="text-[#ebebeb] text-sm font-medium">Resumo Mensal</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  {['Mês', 'Receita', 'Despesas', 'Lucro', 'Margem'].map(h => (
                    <th key={h} className="text-left py-2.5 px-4 text-[#555555] text-xs font-medium uppercase tracking-wide first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...monthly].reverse().map(row => {
                  const m = row.income > 0 ? (row.profit / row.income) * 100 : 0
                  return (
                    <tr key={row.month} className="border-b border-[#1c1c1c] last:border-0 hover:bg-[#1a1a1a] transition-colors">
                      <td className="py-3 px-4 text-[#888888] text-xs first:pl-5">
                        {parseDate(row.month + '-15').toLocaleDateString('pt-BR', { month: 'long', year: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 text-[#10b981] text-xs font-medium">{fmt(row.income)}</td>
                      <td className="py-3 px-4 text-[#ef4444] text-xs font-medium">{fmt(row.expense)}</td>
                      <td className={`py-3 px-4 text-xs font-semibold ${row.profit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>{fmt(row.profit)}</td>
                      <td className={`py-3 px-4 text-xs font-medium last:pr-5 ${m >= 20 ? 'text-[#10b981]' : m >= 0 ? 'text-[#888888]' : 'text-[#ef4444]'}`}>{m.toFixed(1)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'income', 'expense'] as const).map(t => (
            <button key={t}
              onClick={() => { setFilterType(t); setFilterCategory('all') }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                filterType === t
                  ? 'bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]'
                  : 'text-[#888888] border-transparent hover:text-[#ebebeb]'
              }`}
            >
              {t === 'all' ? 'Todas' : t === 'income' ? 'Receitas' : 'Despesas'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as TransactionCategory | 'all')}
            className="bg-[#141414] border border-[#2a2a2a] text-[#888888] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#7c3aed] cursor-pointer"
          >
            <option value="all">Todas as categorias</option>
            {categoryOptions.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="bg-[#141414] border border-[#2a2a2a] text-[#888888] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#7c3aed]"
          />
          <span className="text-[#3a3a3a] text-xs">→</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="bg-[#141414] border border-[#2a2a2a] text-[#888888] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#7c3aed]"
          />
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555] pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar descrição..."
              className="bg-[#141414] border border-[#2a2a2a] text-[#888888] text-xs rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-[#7c3aed] placeholder:text-[#3a3a3a] w-44"
            />
          </div>
          {(filterCategory !== 'all' || dateFrom || dateTo || search) && (
            <button
              onClick={() => { setFilterCategory('all'); setDateFrom(''); setDateTo(''); setSearch('') }}
              className="text-xs text-[#555555] hover:text-[#ebebeb] transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Transaction list */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a2a]">
          <p className="text-[#555555] text-xs">
            {filtered.length} transaç{filtered.length !== 1 ? 'ões' : 'ão'}
            {filtered.length !== totalCount && ` (de ${totalCount})`}
          </p>
          <div className="flex items-center gap-2 text-xs text-[#555555]">
            <span className="text-[#10b981] font-medium">
              +{fmt(filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.value, 0))}
            </span>
            <span>·</span>
            <span className="text-[#ef4444] font-medium">
              −{fmt(filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.value, 0))}
            </span>
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[#555555] text-sm">Nenhuma transação encontrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left px-5 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">Data</th>
                  <th className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">Descrição</th>
                  <th className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide hidden md:table-cell">Categoria</th>
                  <th className="text-right px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">Valor</th>
                  <th className="w-10 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="border-b border-[#1c1c1c] last:border-0 hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-5 py-3 text-[#888888] text-xs whitespace-nowrap">
                      {parseDate(t.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[#ebebeb] text-sm">{t.description}</p>
                      {t.source && <p className="text-[#555555] text-xs">{t.source}</p>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-[#555555] text-xs">
                        {ALL_LABELS[t.category as keyof typeof ALL_LABELS] ?? t.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-semibold tabular-nums ${t.type === 'income' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                        {t.type === 'income' ? '+' : '−'}{fmt(t.value)}
                      </span>
                    </td>
                    <td className="px-2 py-3 relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === t.id ? null : t.id)}
                        className="p-1 text-[#555555] hover:text-[#ebebeb] transition-colors"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                      {menuOpen === t.id && (
                        <div className="absolute right-2 top-10 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg shadow-xl z-10 w-36 overflow-hidden">
                          <button
                            onClick={() => { setEditing(t); setMenuOpen(null) }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#888888] hover:text-[#ebebeb] hover:bg-[#2a2a2a] transition-colors"
                          >
                            <Pencil size={13} /> Editar
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef44441a] transition-colors"
                          >
                            <Trash2 size={13} /> Excluir
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {creating && (
        <Modal title="Nova Transação" onClose={() => setCreating(false)}>
          <TxForm onSave={handleCreate} onClose={() => setCreating(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Editar Transação" onClose={() => setEditing(null)}>
          <TxForm
            initial={{
              type: editing.type, category: editing.category,
              description: editing.description, value: String(editing.value),
              date: editing.date, source: editing.source,
            }}
            onSave={handleEdit}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  )
}
