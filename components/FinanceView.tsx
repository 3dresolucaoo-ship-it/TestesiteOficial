'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useStore, uid } from '@/lib/store'
import type { Transaction, TransactionType, TransactionCategory, Project, FixedCost, IncomeCategory, ExpenseCategory } from '@/lib/types'
import { INCOME_CATEGORY_LABELS, EXPENSE_CATEGORY_LABELS } from '@/lib/types'
import {
  calcRevenue, calcExpenses, calcProfit, monthlyBreakdown,
  exportCsv, downloadCsv, categoryBreakdown, profitMargin,
} from '@/core/finance/engine'
import { calcBreakEvenSummary } from '@/core/finance/breakEvenEngine'
import { MonthlyChart, CategoryBars, type ChartMode } from '@/components/FinanceCharts'
import {
  Plus, Download, BarChart3, RefreshCw, Target,
  AlertCircle, CheckCircle2, MoreHorizontal, Pencil, Trash2, Search,
} from 'lucide-react'

import { type FormData, ALL_LABELS, fmt, parseDate, LEGACY_STORAGE_FIXED_COST, LEGACY_STORAGE_PROFIT_GOAL, type FinanceTab } from './finance/types'
import { FinanceKpis } from './finance/FinanceKpis'
import { BreakEvenSection } from './finance/FinanceBreakEven'
import { CreateTransactionModal, EditTransactionModal } from './finance/FinanceTransactionForm'

// ─── Finance view (orchestrator) ──────────────────────────────────────────────

export function FinanceView({
  initialTransactions,
  initialProjects,
}: {
  initialTransactions: Transaction[]
  initialProjects:     Project[]
}) {
  const { state, dispatch } = useStore()

  const transactions = state.transactions.length > 0 || initialTransactions.length === 0
    ? state.transactions
    : initialTransactions
  const projects = state.projects.length > 0 || initialProjects.length === 0
    ? state.projects
    : initialProjects

  // ── UI state ────────────────────────────────────────────────────────────────
  const [creating,  setCreating]  = useState(false)
  const [editing,   setEditing]   = useState<Transaction | null>(null)
  const [menuOpen,  setMenuOpen]  = useState<string | null>(null)
  const [chartMode, setChartMode] = useState<ChartMode>('both')
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview')

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [filterProject,  setFilterProject]  = useState('all')
  const [filterType,     setFilterType]     = useState<TransactionType | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<TransactionCategory | 'all'>('all')
  const [dateFrom,       setDateFrom]       = useState('')
  const [dateTo,         setDateTo]         = useState('')
  const [search,         setSearch]         = useState('')

  // ── Reconciliation ──────────────────────────────────────────────────────────
  const [reconciling,  setReconciling]  = useState(false)
  const [reconcileMsg, setReconcileMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  // ── Break-even (persisted in DB per project) ─────────────────────────────────
  const [breakEvenProjectId, setBreakEvenProjectId] = useState('')
  const [fixedCosts,   setFixedCosts]   = useState<FixedCost[]>([])
  const [profitGoal,   setProfitGoal]   = useState(0)
  const [beLoading,    setBeLoading]    = useState(false)

  useEffect(() => {
    if (!breakEvenProjectId && projects.length > 0) {
      setBreakEvenProjectId(projects[0].id)
    }
  }, [projects, breakEvenProjectId])

  const loadBreakEvenData = useCallback(async (pid: string) => {
    if (!pid) return
    setBeLoading(true)
    try {
      const [costsRes, goalRes] = await Promise.all([
        fetch(`/api/finance/fixed-costs?projectId=${encodeURIComponent(pid)}`),
        fetch(`/api/finance/profit-goal?projectId=${encodeURIComponent(pid)}`),
      ])
      if (!costsRes.ok || !goalRes.ok) {
        throw new Error(`fetch failed: costs=${costsRes.status} goal=${goalRes.status}`)
      }
      const costs: FixedCost[] = (await costsRes.json()).items
      const goalData: { goal: { monthlyTarget: number } | null } = await goalRes.json()

      let migratedCosts = costs
      let migratedGoal  = goalData.goal?.monthlyTarget ?? 0

      if (typeof window !== 'undefined') {
        const legacyFC = Number(localStorage.getItem(LEGACY_STORAGE_FIXED_COST) ?? '0')
        const legacyPG = Number(localStorage.getItem(LEGACY_STORAGE_PROFIT_GOAL) ?? '0')

        if (costs.length === 0 && isFinite(legacyFC) && legacyFC > 0) {
          const migrated: FixedCost = { id: uid(), projectId: pid, label: 'Custo fixo (importado)', amount: legacyFC }
          await fetch('/api/finance/fixed-costs', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(migrated),
          })
          migratedCosts = [migrated]
          localStorage.removeItem(LEGACY_STORAGE_FIXED_COST)
        }

        if (!goalData.goal && isFinite(legacyPG) && legacyPG > 0) {
          await fetch('/api/finance/profit-goal', {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ projectId: pid, monthlyTarget: legacyPG }),
          })
          migratedGoal = legacyPG
          localStorage.removeItem(LEGACY_STORAGE_PROFIT_GOAL)
        }
      }

      setFixedCosts(migratedCosts)
      setProfitGoal(migratedGoal)
    } catch (err) {
      console.error('[FinanceView] loadBreakEvenData failed:', err)
    } finally {
      setBeLoading(false)
    }
  }, [])

  useEffect(() => {
    if (breakEvenProjectId) loadBreakEvenData(breakEvenProjectId)
  }, [breakEvenProjectId, loadBreakEvenData])

  const totalFixedCost = useMemo(
    () => fixedCosts.reduce((s, c) => s + c.amount, 0),
    [fixedCosts],
  )

  // ── Fixed cost handlers ──────────────────────────────────────────────────────
  async function handleAddFixedCost(label: string, amount: number) {
    const cost: FixedCost = { id: uid(), projectId: breakEvenProjectId, label, amount }
    const res = await fetch('/api/finance/fixed-costs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(cost),
    })
    if (!res.ok) throw new Error('Falha ao criar custo fixo')
    setFixedCosts(prev => [...prev, cost])
  }

  async function handleUpdateFixedCost(cost: FixedCost) {
    const res = await fetch(`/api/finance/fixed-costs/${encodeURIComponent(cost.id)}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ label: cost.label, amount: cost.amount }),
    })
    if (!res.ok) throw new Error('Falha ao atualizar custo fixo')
    setFixedCosts(prev => prev.map(c => c.id === cost.id ? cost : c))
  }

  async function handleDeleteFixedCost(id: string) {
    const res = await fetch(`/api/finance/fixed-costs/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Falha ao remover custo fixo')
    setFixedCosts(prev => prev.filter(c => c.id !== id))
  }

  function handleProfitGoalChange(v: number) {
    setProfitGoal(v)
    if (!breakEvenProjectId) return
    fetch('/api/finance/profit-goal', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ projectId: breakEvenProjectId, monthlyTarget: v }),
    }).catch(err => console.error('profit-goal save failed:', err))
  }

  // ── Break-even derived data ──────────────────────────────────────────────────
  const beProducts = useMemo(
    () => breakEvenProjectId ? state.products.filter(p => p.projectId === breakEvenProjectId) : [],
    [state.products, breakEvenProjectId],
  )
  const beTransactions = useMemo(
    () => transactions.filter(t => t.projectId === breakEvenProjectId),
    [transactions, breakEvenProjectId],
  )
  const breakEven = useMemo(
    () => calcBreakEvenSummary(beProducts, state.inventory, beTransactions, totalFixedCost, profitGoal),
    [beProducts, state.inventory, beTransactions, totalFixedCost, profitGoal],
  )

  // ── Overview derived data ────────────────────────────────────────────────────
  const projectId = filterProject === 'all' ? undefined : filterProject

  const revenue  = calcRevenue(transactions, projectId)
  const expenses = calcExpenses(transactions, projectId)
  const profit   = calcProfit(transactions, projectId)
  const margin   = profitMargin(transactions, projectId)

  const monthly = useMemo(
    () => monthlyBreakdown(transactions, projectId).slice(-6),
    [transactions, projectId],
  )

  const incomeBreakdown = useMemo(
    () => categoryBreakdown(transactions, 'income', projectId).map(r => ({
      ...r,
      label: INCOME_CATEGORY_LABELS[r.category as IncomeCategory] ?? r.category,
    })),
    [transactions, projectId],
  )
  const expenseBreakdown = useMemo(
    () => categoryBreakdown(transactions, 'expense', projectId).map(r => ({
      ...r,
      label: EXPENSE_CATEGORY_LABELS[r.category as ExpenseCategory] ?? r.category,
    })),
    [transactions, projectId],
  )

  const filtered = useMemo(() => {
    let txs = transactions
    if (projectId)             txs = txs.filter(t => t.projectId === projectId)
    if (filterType !== 'all')  txs = txs.filter(t => t.type === filterType)
    if (filterCategory !== 'all') txs = txs.filter(t => t.category === filterCategory)
    if (dateFrom) txs = txs.filter(t => t.date >= dateFrom)
    if (dateTo)   txs = txs.filter(t => t.date <= dateTo)
    if (search) {
      const q = search.toLowerCase()
      txs = txs.filter(t => t.description.toLowerCase().includes(q) || t.source.toLowerCase().includes(q))
    }
    return [...txs].sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, projectId, filterType, filterCategory, dateFrom, dateTo, search])

  const filteredRevenue  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.value), 0)
  const filteredExpenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.value), 0)
  const hasFilters       = filterCategory !== 'all' || dateFrom || dateTo || Boolean(search)

  const categoryOptions =
    filterType === 'income'  ? Object.entries(INCOME_CATEGORY_LABELS)
    : filterType === 'expense' ? Object.entries(EXPENSE_CATEGORY_LABELS)
    : Object.entries(ALL_LABELS)

  const projectName = (id: string) => projects.find(p => p.id === id)?.name ?? '---'

  // ── Transaction handlers ─────────────────────────────────────────────────────
  function handleCreate(data: FormData) {
    dispatch({ type: 'ADD_TRANSACTION', payload: { id: uid(), ...data, value: parseFloat(data.value) || 0 } })
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
    const csv  = exportCsv(transactions, projectId)
    const name = projectId
      ? `financas-${projects.find(p => p.id === projectId)?.name ?? projectId}-${new Date().toISOString().slice(0, 10)}.csv`
      : `financas-global-${new Date().toISOString().slice(0, 10)}.csv`
    downloadCsv(csv, name)
  }

  async function handleReconcile() {
    if (reconciling) return
    setReconciling(true)
    setReconcileMsg(null)
    try {
      const res  = await fetch('/api/admin/reconcile-transactions', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Falha na reconciliacao')
      setReconcileMsg({ kind: 'success', text: json.message ?? 'Reconciliado' })
      if (json.result?.created > 0) setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      setReconcileMsg({ kind: 'error', text: err instanceof Error ? err.message : 'Erro desconhecido' })
    } finally {
      setReconciling(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[#f0f0f5] font-semibold text-lg">Financas</h2>
          <p className="text-[#555555] text-sm">{transactions.length} transacoes registradas</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleReconcile}
            disabled={reconciling}
            title="Cria transacoes faltantes para pedidos pagos legacy"
            className="flex items-center gap-2 text-[#888888] hover:text-[#a78bfa] border border-[rgba(255,255,255,0.07)] hover:border-[#7c3aed55] text-sm px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={reconciling ? 'animate-spin' : ''} aria-hidden="true" />
            {reconciling ? 'Reconciliando...' : 'Reconciliar'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 text-[#888888] hover:text-[#f0f0f5] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.12)] text-sm px-3 py-2 rounded-lg transition-colors"
          >
            <Download size={14} aria-hidden="true" /> CSV
          </button>
          <button
            onClick={() => setCreating(true)}
            disabled={projects.length === 0}
            title={projects.length === 0 ? 'Crie um projeto antes de registrar transacoes' : ''}
            className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-3 py-2 rounded-lg transition-all shadow-[0_0_16px_rgba(124,58,237,0.3)] hover:shadow-[0_0_24px_rgba(124,58,237,0.4)]"
          >
            <Plus size={15} aria-hidden="true" /> Transacao
          </button>
        </div>
      </div>

      {reconcileMsg && (
        <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${
          reconcileMsg.kind === 'success'
            ? 'bg-[#10b9811a] border-[#10b98133] text-[#10b981]'
            : 'bg-[#ef44441a] border-[#ef444433] text-[#ef4444]'
        }`}>
          {reconcileMsg.kind === 'success'
            ? <CheckCircle2 size={14} aria-hidden="true" />
            : <AlertCircle size={14} aria-hidden="true" />}
          {reconcileMsg.text}
        </div>
      )}

      {/* Tab strip */}
      <div className="flex items-center gap-1 border-b border-[rgba(255,255,255,0.06)]" role="tablist">
        {([
          { id: 'overview'  as const, label: 'Visao Geral',         icon: BarChart3 },
          { id: 'breakeven' as const, label: 'Ponto de Equilibrio', icon: Target    },
        ]).map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-[#a78bfa] border-[#7c3aed]'
                : 'text-[#555555] border-transparent hover:text-[#f0f0f5]'
            }`}
          >
            <tab.icon size={14} aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <>
          <select
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
            aria-label="Filtrar por projeto"
            className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#888888] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7c3aed] cursor-pointer"
          >
            <option value="all">Todos os projetos</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <FinanceKpis revenue={revenue} expenses={expenses} profit={profit} margin={margin} />

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={14} className="text-[#555555]" aria-hidden="true" />
                <p className="text-[#f0f0f5] text-sm font-medium">Evolucao Mensal</p>
              </div>
              <MonthlyChart rows={monthly} mode={chartMode} onModeChange={setChartMode} />
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

          {/* Monthly summary table */}
          {monthly.length > 0 && (
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
          )}

          {/* Transaction filters */}
          <div className="space-y-2">
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
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value as TransactionCategory | 'all')}
                aria-label="Filtrar por categoria"
                className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#888888] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#7c3aed] cursor-pointer"
              >
                <option value="all">Todas as categorias</option>
                {categoryOptions.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input
                type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                aria-label="Data de inicio"
                className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#888888] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#7c3aed]"
              />
              <span className="text-[#3a3a3a] text-xs" aria-hidden="true">ate</span>
              <input
                type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                aria-label="Data de fim"
                className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#888888] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#7c3aed]"
              />
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555] pointer-events-none" aria-hidden="true" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  aria-label="Buscar transacoes"
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

          {/* Transactions list */}
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
                          <button onClick={() => setEditing(t)} aria-label="Editar transacao" className="p-1.5 text-[#3a3a3a] hover:text-[#888888] rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                            <Pencil size={12} aria-hidden="true" />
                          </button>
                          <button onClick={() => handleDelete(t.id)} aria-label="Excluir transacao" className="p-1.5 text-[#3a3a3a] hover:text-[#ef4444] rounded-lg hover:bg-[#ef44441a] transition-colors">
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
                          <th key={h} className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide first:pl-5 last:w-10">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(t => (
                        <tr key={t.id} className="border-b border-[rgba(255,255,255,0.03)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                          <td className="px-5 py-3 text-[#888888] text-xs whitespace-nowrap">
                            {parseDate(t.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 text-[#888888] text-xs whitespace-nowrap">{projectName(t.projectId)}</td>
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
                              onClick={() => setMenuOpen(menuOpen === t.id ? null : t.id)}
                              aria-label="Mais opcoes"
                              className="p-1.5 text-[#555555] hover:text-[#f0f0f5] transition-colors rounded-lg hover:bg-[rgba(255,255,255,0.06)]"
                            >
                              <MoreHorizontal size={14} aria-hidden="true" />
                            </button>
                            {menuOpen === t.id && (
                              <div className="absolute right-2 top-10 bg-[#0d0d12] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl z-10 w-36 overflow-hidden">
                                <button
                                  onClick={() => { setEditing(t); setMenuOpen(null) }}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#888888] hover:text-[#f0f0f5] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                                >
                                  <Pencil size={13} aria-hidden="true" /> Editar
                                </button>
                                <button
                                  onClick={() => handleDelete(t.id)}
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
        </>
      )}

      {/* Break-even tab */}
      {activeTab === 'breakeven' && (
        <BreakEvenSection
          summary={breakEven}
          projects={projects}
          selectedProjectId={breakEvenProjectId}
          onSelectProject={setBreakEvenProjectId}
          fixedCosts={fixedCosts}
          profitGoal={profitGoal}
          totalFixedCost={totalFixedCost}
          onAddFixedCost={handleAddFixedCost}
          onUpdateFixedCost={handleUpdateFixedCost}
          onDeleteFixedCost={handleDeleteFixedCost}
          onProfitGoalChange={handleProfitGoalChange}
          hasProducts={beProducts.length > 0}
          loading={beLoading}
        />
      )}

      {/* Modals */}
      {creating && (
        <CreateTransactionModal
          projects={projects}
          onSave={handleCreate}
          onClose={() => setCreating(false)}
        />
      )}
      {editing && (
        <EditTransactionModal
          transaction={editing}
          projects={projects}
          onSave={handleEdit}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
