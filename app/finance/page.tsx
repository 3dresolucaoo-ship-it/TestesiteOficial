'use client'

import { useState, useMemo } from 'react'
import { useStore, uid } from '@/lib/store'
import type { Transaction, TransactionType, TransactionCategory, IncomeCategory, ExpenseCategory } from '@/lib/types'
import { INCOME_CATEGORY_LABELS, EXPENSE_CATEGORY_LABELS } from '@/lib/types'
import {
  calcRevenue, calcExpenses, calcProfit, monthlyBreakdown,
  exportCsv, downloadCsv, categoryBreakdown, profitMargin,
} from '@/core/finance/engine'
import { MonthlyChart, CategoryBars, type ChartMode } from '@/components/FinanceCharts'
import {
  Plus, Download, TrendingUp, TrendingDown, DollarSign, Percent,
  Trash2, MoreHorizontal, Pencil, Search, BarChart3,
} from 'lucide-react'
import { Modal, FormField, Input, Select, SubmitButton } from '@/components/Modal'

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  projectId:   string
  type:        TransactionType
  category:    TransactionCategory
  description: string
  value:       string
  date:        string
  source:      string
}

function TransactionForm({
  projects,
  initial,
  onSave,
  onClose,
}: {
  projects: { id: string; name: string }[]
  initial?: FormData
  onSave:   (d: FormData) => void
  onClose:  () => void
}) {
  const [data, setData] = useState<FormData>(
    initial ?? {
      projectId:   projects[0]?.id ?? '',
      type:        'income',
      category:    'product_sale',
      description: '',
      value:       '',
      date:        new Date().toISOString().slice(0, 10),
      source:      '',
    },
  )

  const set =
    (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setData(p => ({ ...p, [k]: e.target.value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = parseFloat(data.value)
    if (!data.description.trim() || isNaN(parsed) || parsed <= 0) return
    onSave({ ...data, value: String(parsed) })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Income / Expense toggle */}
      <div className="grid grid-cols-2 gap-2">
        {(['income', 'expense'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() =>
              setData(p => ({
                ...p,
                type:     t,
                category: t === 'income' ? 'product_sale' : 'filament',
              }))
            }
            className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${
              data.type === t
                ? t === 'income'
                  ? 'bg-[#10b9811a] text-[#10b981] border-[#10b98133] shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : 'bg-[#ef44441a] text-[#ef4444] border-[#ef444433] shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                : 'bg-transparent text-[#888888] border-[rgba(255,255,255,0.07)] hover:text-[#ebebeb]'
            }`}
          >
            {t === 'income' ? '↑ Receita' : '↓ Despesa'}
          </button>
        ))}
      </div>

      <FormField label="Projeto">
        <Select value={data.projectId} onChange={set('projectId')}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </FormField>

      <FormField label="Categoria">
        <Select value={data.category} onChange={set('category')}>
          {Object.entries(
            data.type === 'income' ? INCOME_CATEGORY_LABELS : EXPENSE_CATEGORY_LABELS,
          ).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      </FormField>

      <FormField label="Descrição">
        <Input
          value={data.description}
          onChange={set('description')}
          placeholder="Ex: Venda produto X"
          required
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Valor (R$)">
          <Input
            type="number"
            value={data.value}
            onChange={set('value')}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
        </FormField>
        <FormField label="Data">
          <Input type="date" value={data.date} onChange={set('date')} />
        </FormField>
      </div>

      <FormField label="Fonte / Origem">
        <Input
          value={data.source}
          onChange={set('source')}
          placeholder="Ex: WhatsApp, Hotmart…"
        />
      </FormField>

      <SubmitButton>{initial ? 'Salvar' : 'Registrar'}</SubmitButton>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FinancePage() {
  const { state, dispatch } = useStore()
  const [creating,  setCreating]  = useState(false)
  const [editing,   setEditing]   = useState<Transaction | null>(null)
  const [menuOpen,  setMenuOpen]  = useState<string | null>(null)
  const [chartMode, setChartMode] = useState<ChartMode>('both')

  // ── Filters ────────────────────────────────────────────────────────────────
  const [filterProject,  setFilterProject]  = useState('all')
  const [filterType,     setFilterType]     = useState<TransactionType | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<TransactionCategory | 'all'>('all')
  const [dateFrom,       setDateFrom]       = useState('')
  const [dateTo,         setDateTo]         = useState('')
  const [search,         setSearch]         = useState('')

  const projectId = filterProject === 'all' ? undefined : filterProject

  // ── KPIs — scoped by project only ─────────────────────────────────────────
  const revenue  = calcRevenue(state.transactions, projectId)
  const expenses = calcExpenses(state.transactions, projectId)
  const profit   = calcProfit(state.transactions, projectId)
  const margin   = profitMargin(state.transactions, projectId)

  // ── Charts — project scope, last 6 months ─────────────────────────────────
  const monthly = useMemo(
    () => monthlyBreakdown(state.transactions, projectId).slice(-6),
    [state.transactions, projectId],
  )

  // ── Category breakdowns ────────────────────────────────────────────────────
  const incomeBreakdown = useMemo(
    () =>
      categoryBreakdown(state.transactions, 'income', projectId).map(r => ({
        ...r,
        label: INCOME_CATEGORY_LABELS[r.category as IncomeCategory] ?? r.category,
      })),
    [state.transactions, projectId],
  )
  const expenseBreakdown = useMemo(
    () =>
      categoryBreakdown(state.transactions, 'expense', projectId).map(r => ({
        ...r,
        label: EXPENSE_CATEGORY_LABELS[r.category as ExpenseCategory] ?? r.category,
      })),
    [state.transactions, projectId],
  )

  // ── Transaction list — all filters applied ─────────────────────────────────
  const filtered = useMemo(() => {
    let txs = state.transactions
    if (projectId)             txs = txs.filter(t => t.projectId === projectId)
    if (filterType !== 'all')  txs = txs.filter(t => t.type === filterType)
    if (filterCategory !== 'all') txs = txs.filter(t => t.category === filterCategory)
    if (dateFrom) txs = txs.filter(t => t.date >= dateFrom)
    if (dateTo)   txs = txs.filter(t => t.date <= dateTo)
    if (search) {
      const q = search.toLowerCase()
      txs = txs.filter(
        t => t.description.toLowerCase().includes(q) || t.source.toLowerCase().includes(q),
      )
    }
    return [...txs].sort((a, b) => b.date.localeCompare(a.date))
  }, [state.transactions, projectId, filterType, filterCategory, dateFrom, dateTo, search])

  const filteredRevenue  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.value), 0)
  const filteredExpenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.value), 0)
  const hasFilters       = filterCategory !== 'all' || dateFrom || dateTo || Boolean(search)

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleCreate(data: FormData) {
    dispatch({
      type:    'ADD_TRANSACTION',
      payload: { id: uid(), ...data, value: parseFloat(data.value) || 0 },
    })
  }
  function handleEdit(data: FormData) {
    if (!editing) return
    dispatch({
      type:    'UPDATE_TRANSACTION',
      payload: { ...editing, ...data, value: parseFloat(data.value) || 0 },
    })
    setEditing(null)
  }
  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id })
    setMenuOpen(null)
  }
  function handleExport() {
    const csv  = exportCsv(state.transactions, projectId)
    const name = projectId
      ? `financas-${state.projects.find(p => p.id === projectId)?.name ?? projectId}-${new Date().toISOString().slice(0, 10)}.csv`
      : `financas-global-${new Date().toISOString().slice(0, 10)}.csv`
    downloadCsv(csv, name)
  }

  const projectName = (id: string) => state.projects.find(p => p.id === id)?.name ?? '—'

  const categoryOptions =
    filterType === 'income'
      ? Object.entries(INCOME_CATEGORY_LABELS)
      : filterType === 'expense'
      ? Object.entries(EXPENSE_CATEGORY_LABELS)
      : Object.entries(ALL_LABELS)

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[#f0f0f5] font-semibold text-lg">Finanças</h2>
          <p className="text-[#555555] text-sm">{state.transactions.length} transações registradas</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 text-[#888888] hover:text-[#f0f0f5] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.12)] text-sm px-3 py-2 rounded-lg transition-colors"
          >
            <Download size={14} /> CSV
          </button>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-3 py-2 rounded-lg transition-all shadow-[0_0_16px_rgba(124,58,237,0.3)] hover:shadow-[0_0_24px_rgba(124,58,237,0.4)]"
          >
            <Plus size={15} /> Transação
          </button>
        </div>
      </div>

      {/* ── Project filter ────────────────────────────────────────────────── */}
      <select
        value={filterProject}
        onChange={e => setFilterProject(e.target.value)}
        className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#888888] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7c3aed] cursor-pointer"
      >
        <option value="all">Todos os projetos</option>
        {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      {/* ── KPI cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
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
            glow:  profit >= 0 ? 'shadow-[0_0_20px_rgba(16,185,129,0.08)]' : 'shadow-[0_0_20px_rgba(239,68,68,0.08)]',
          },
          {
            label: 'Margem',
            value: `${margin.toFixed(1)}%`,
            icon:  Percent,
            color: margin >= 20 ? 'text-[#a78bfa]' : margin >= 0 ? 'text-[#f59e0b]' : 'text-[#ef4444]',
            bg:    'bg-[#7c3aed1a]',
            glow:  'shadow-[0_0_20px_rgba(124,58,237,0.08)]',
          },
        ].map(({ label, value, icon: Icon, color, bg, glow }) => (
          <div
            key={label}
            className={`bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 hover:border-[rgba(255,255,255,0.12)] transition-all ${glow}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${bg}`}>
                <Icon size={13} className={color} />
              </div>
              <span className="text-[#555555] text-xs uppercase tracking-wide font-medium">{label}</span>
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Charts row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Monthly chart */}
        <div className="md:col-span-2 bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={14} className="text-[#555555]" />
            <p className="text-[#f0f0f5] text-sm font-medium">Evolução Mensal</p>
          </div>
          <MonthlyChart rows={monthly} mode={chartMode} onModeChange={setChartMode} />
        </div>

        {/* Category breakdowns */}
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

      {/* ── Monthly summary table ─────────────────────────────────────────── */}
      {monthly.length > 0 && (
        <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.05)]">
            <p className="text-[#f0f0f5] text-sm font-medium">Resumo Mensal</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.05)]">
                  {['Mês', 'Receita', 'Despesas', 'Lucro', 'Margem'].map(h => (
                    <th
                      key={h}
                      className="text-left py-2.5 px-4 text-[#555555] text-xs font-medium uppercase tracking-wide first:pl-5 last:pr-5"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...monthly].reverse().map(row => {
                  const m = row.income > 0 ? (row.profit / row.income) * 100 : 0
                  return (
                    <tr
                      key={row.month}
                      className="border-b border-[rgba(255,255,255,0.03)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                    >
                      <td className="py-3 px-4 text-[#888888] text-xs first:pl-5 whitespace-nowrap">
                        {parseDate(row.month + '-15').toLocaleDateString('pt-BR', {
                          month: 'long',
                          year:  'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-[#10b981] text-xs font-medium tabular-nums">
                        {fmt(row.income)}
                      </td>
                      <td className="py-3 px-4 text-[#ef4444] text-xs font-medium tabular-nums">
                        {fmt(row.expense)}
                      </td>
                      <td
                        className={`py-3 px-4 text-xs font-semibold tabular-nums ${
                          row.profit >= 0 ? 'text-[#a78bfa]' : 'text-[#ef4444]'
                        }`}
                      >
                        {row.profit >= 0 ? '+' : ''}{fmt(row.profit)}
                      </td>
                      <td
                        className={`py-3 px-4 text-xs font-medium last:pr-5 ${
                          m >= 30 ? 'text-[#10b981]' : m >= 10 ? 'text-[#888888]' : 'text-[#ef4444]'
                        }`}
                      >
                        {m.toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        {/* Row 1: type tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'income', 'expense'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setFilterType(t); setFilterCategory('all') }}
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

        {/* Row 2: category + date + search */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as TransactionCategory | 'all')}
            className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#888888] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#7c3aed] cursor-pointer"
          >
            <option value="all">Todas as categorias</option>
            {categoryOptions.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#888888] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#7c3aed]"
          />
          <span className="text-[#3a3a3a] text-xs">→</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#888888] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#7c3aed]"
          />
          <div className="relative">
            <Search
              size={12}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555] pointer-events-none"
            />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar…"
              className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#888888] text-xs rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-[#7c3aed] placeholder:text-[#3a3a3a] w-40"
            />
          </div>
          {hasFilters && (
            <button
              onClick={() => { setFilterCategory('all'); setDateFrom(''); setDateTo(''); setSearch('') }}
              className="text-xs text-[#555555] hover:text-[#f0f0f5] transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* ── Transaction list ──────────────────────────────────────────────── */}
      <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
        {/* List header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(255,255,255,0.05)]">
          <p className="text-[#555555] text-xs">
            {filtered.length} transaç{filtered.length !== 1 ? 'ões' : 'ão'}
            {filtered.length !== state.transactions.length && ` (de ${state.transactions.length})`}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#10b981] font-semibold tabular-nums">+{fmt(filteredRevenue)}</span>
            <span className="text-[#3a3a3a]">·</span>
            <span className="text-[#ef4444] font-semibold tabular-nums">−{fmt(filteredExpenses)}</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[#555555] text-sm">Nenhuma transação encontrada.</div>
        ) : (
          <>
            {/* ── Mobile cards ──────────────────────────────────────────── */}
            <div className="sm:hidden divide-y divide-[rgba(255,255,255,0.03)]">
              {filtered.map(t => (
                <div key={t.id} className="px-4 py-3.5 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[#f0f0f5] text-sm font-medium truncate">{t.description}</p>
                      <p className="text-[#555555] text-xs mt-0.5">
                        {parseDate(t.date).toLocaleDateString('pt-BR')}
                        {' · '}{projectName(t.projectId)}
                      </p>
                      <p className="text-[#444455] text-xs mt-0.5">
                        {ALL_LABELS[t.category as keyof typeof ALL_LABELS] ?? t.category}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5">
                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          t.type === 'income' ? 'text-[#10b981]' : 'text-[#ef4444]'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '−'}{fmt(Number(t.value))}
                      </span>
                      <button
                        onClick={() => setEditing(t)}
                        className="p-1.5 text-[#3a3a3a] hover:text-[#888888] rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 text-[#3a3a3a] hover:text-[#ef4444] rounded-lg hover:bg-[#ef44441a] transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Desktop table ─────────────────────────────────────────── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.05)]">
                    {['Data', 'Projeto', 'Descrição', 'Categoria', 'Valor', ''].map(h => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide first:pl-5 last:w-10"
                      >
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
                        <span
                          className={`text-sm font-semibold tabular-nums ${
                            t.type === 'income' ? 'text-[#10b981]' : 'text-[#ef4444]'
                          }`}
                        >
                          {t.type === 'income' ? '+' : '−'}{fmt(Number(t.value))}
                        </span>
                      </td>
                      <td className="px-2 py-3 relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === t.id ? null : t.id)}
                          className="p-1.5 text-[#555555] hover:text-[#f0f0f5] transition-colors rounded-lg hover:bg-[rgba(255,255,255,0.06)]"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                        {menuOpen === t.id && (
                          <div className="absolute right-2 top-10 bg-[#0d0d12] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl z-10 w-36 overflow-hidden">
                            <button
                              onClick={() => { setEditing(t); setMenuOpen(null) }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#888888] hover:text-[#f0f0f5] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
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
          </>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {creating && (
        <Modal title="Nova Transação" onClose={() => setCreating(false)}>
          <TransactionForm
            projects={state.projects}
            onSave={handleCreate}
            onClose={() => setCreating(false)}
          />
        </Modal>
      )}
      {editing && (
        <Modal title="Editar Transação" onClose={() => setEditing(null)}>
          <TransactionForm
            projects={state.projects}
            initial={{
              projectId:   editing.projectId,
              type:        editing.type,
              category:    editing.category,
              description: editing.description,
              value:       String(editing.value),
              date:        editing.date,
              source:      editing.source,
            }}
            onSave={handleEdit}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  )
}
