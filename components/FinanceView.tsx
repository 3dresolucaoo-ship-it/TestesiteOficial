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
import { Plus, Download, BarChart3, RefreshCw, Target, AlertCircle, CheckCircle2 } from 'lucide-react'

import {
  type FormData, type FinanceTab,
  ALL_LABELS, LEGACY_STORAGE_FIXED_COST, LEGACY_STORAGE_PROFIT_GOAL,
} from './finance/types'
import { FinanceKpis } from './finance/FinanceKpis'
import { BreakEvenSection } from './finance/FinanceBreakEven'
import { CreateTransactionModal, EditTransactionModal } from './finance/FinanceTransactionForm'
import {
  FinanceFilterBar, FinanceTransactionList,
  FinanceChartsPanel, FinanceMonthlySummary,
  type ChartMode,
} from './finance/FinanceTransactions'

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
    ? state.transactions : initialTransactions
  const projects = state.projects.length > 0 || initialProjects.length === 0
    ? state.projects : initialProjects

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
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')
  const [search,   setSearch]   = useState('')

  // ── Reconciliation ──────────────────────────────────────────────────────────
  const [reconciling,  setReconciling]  = useState(false)
  const [reconcileMsg, setReconcileMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  // ── Break-even (persisted in DB per project) ─────────────────────────────────
  const [breakEvenProjectId, setBreakEvenProjectId] = useState('')
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([])
  const [profitGoal, setProfitGoal] = useState(0)
  const [beLoading,  setBeLoading]  = useState(false)

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
      if (!costsRes.ok || !goalRes.ok)
        throw new Error(`fetch failed: costs=${costsRes.status} goal=${goalRes.status}`)

      const costs: FixedCost[] = (await costsRes.json()).items
      const goalData: { goal: { monthlyTarget: number } | null } = await goalRes.json()
      let migratedCosts = costs
      let migratedGoal  = goalData.goal?.monthlyTarget ?? 0

      if (typeof window !== 'undefined') {
        const legacyFC = Number(localStorage.getItem(LEGACY_STORAGE_FIXED_COST) ?? '0')
        const legacyPG = Number(localStorage.getItem(LEGACY_STORAGE_PROFIT_GOAL) ?? '0')
        if (costs.length === 0 && isFinite(legacyFC) && legacyFC > 0) {
          const migrated: FixedCost = { id: uid(), projectId: pid, label: 'Custo fixo (importado)', amount: legacyFC }
          await fetch('/api/finance/fixed-costs', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(migrated) })
          migratedCosts = [migrated]
          localStorage.removeItem(LEGACY_STORAGE_FIXED_COST)
        }
        if (!goalData.goal && isFinite(legacyPG) && legacyPG > 0) {
          await fetch('/api/finance/profit-goal', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ projectId: pid, monthlyTarget: legacyPG }) })
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

  const totalFixedCost = useMemo(() => fixedCosts.reduce((s, c) => s + c.amount, 0), [fixedCosts])

  // ── Fixed cost handlers ──────────────────────────────────────────────────────
  async function handleAddFixedCost(label: string, amount: number) {
    const cost: FixedCost = { id: uid(), projectId: breakEvenProjectId, label, amount }
    const res = await fetch('/api/finance/fixed-costs', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cost) })
    if (!res.ok) throw new Error('Falha ao criar custo fixo')
    setFixedCosts(prev => [...prev, cost])
  }
  async function handleUpdateFixedCost(cost: FixedCost) {
    const res = await fetch(`/api/finance/fixed-costs/${encodeURIComponent(cost.id)}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ label: cost.label, amount: cost.amount }) })
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
    fetch('/api/finance/profit-goal', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ projectId: breakEvenProjectId, monthlyTarget: v }) })
      .catch(err => console.error('profit-goal save failed:', err))
  }

  // ── Break-even derived ───────────────────────────────────────────────────────
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

  // ── Overview derived ─────────────────────────────────────────────────────────
  const projectId    = filterProject === 'all' ? undefined : filterProject
  const revenue      = calcRevenue(transactions, projectId)
  const expenses     = calcExpenses(transactions, projectId)
  const profit       = calcProfit(transactions, projectId)
  const margin       = profitMargin(transactions, projectId)
  const monthly      = useMemo(() => monthlyBreakdown(transactions, projectId).slice(-6), [transactions, projectId])
  const incomeBreakdown  = useMemo(() => categoryBreakdown(transactions, 'income', projectId).map(r => ({ ...r, label: INCOME_CATEGORY_LABELS[r.category as IncomeCategory] ?? r.category })), [transactions, projectId])
  const expenseBreakdown = useMemo(() => categoryBreakdown(transactions, 'expense', projectId).map(r => ({ ...r, label: EXPENSE_CATEGORY_LABELS[r.category as ExpenseCategory] ?? r.category })), [transactions, projectId])

  const filtered = useMemo(() => {
    let txs = transactions
    if (projectId)                txs = txs.filter(t => t.projectId === projectId)
    if (filterType !== 'all')     txs = txs.filter(t => t.type === filterType)
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
          <button onClick={handleReconcile} disabled={reconciling} title="Cria transacoes faltantes para pedidos pagos legacy"
            className="flex items-center gap-2 text-[#888888] hover:text-[#a78bfa] border border-[rgba(255,255,255,0.07)] hover:border-[#7c3aed55] text-sm px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
            <RefreshCw size={14} className={reconciling ? 'animate-spin' : ''} aria-hidden="true" />
            {reconciling ? 'Reconciliando...' : 'Reconciliar'}
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-2 text-[#888888] hover:text-[#f0f0f5] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.12)] text-sm px-3 py-2 rounded-lg transition-colors">
            <Download size={14} aria-hidden="true" /> CSV
          </button>
          <button onClick={() => setCreating(true)} disabled={projects.length === 0}
            title={projects.length === 0 ? 'Crie um projeto antes de registrar transacoes' : ''}
            className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-3 py-2 rounded-lg transition-all shadow-[0_0_16px_rgba(124,58,237,0.3)] hover:shadow-[0_0_24px_rgba(124,58,237,0.4)]">
            <Plus size={15} aria-hidden="true" /> Transacao
          </button>
        </div>
      </div>

      {reconcileMsg && (
        <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${
          reconcileMsg.kind === 'success' ? 'bg-[#10b9811a] border-[#10b98133] text-[#10b981]' : 'bg-[#ef44441a] border-[#ef444433] text-[#ef4444]'
        }`}>
          {reconcileMsg.kind === 'success' ? <CheckCircle2 size={14} aria-hidden="true" /> : <AlertCircle size={14} aria-hidden="true" />}
          {reconcileMsg.text}
        </div>
      )}

      {/* Tab strip */}
      <div className="flex items-center gap-1 border-b border-[rgba(255,255,255,0.06)]" role="tablist">
        {([
          { id: 'overview'  as const, label: 'Visao Geral',         icon: BarChart3 },
          { id: 'breakeven' as const, label: 'Ponto de Equilibrio', icon: Target    },
        ]).map(tab => (
          <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id ? 'text-[#a78bfa] border-[#7c3aed]' : 'text-[#555555] border-transparent hover:text-[#f0f0f5]'
            }`}>
            <tab.icon size={14} aria-hidden="true" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <>
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
            aria-label="Filtrar por projeto"
            className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#888888] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7c3aed] cursor-pointer">
            <option value="all">Todos os projetos</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <FinanceKpis revenue={revenue} expenses={expenses} profit={profit} margin={margin} />

          <FinanceChartsPanel
            monthly={monthly}
            chartMode={chartMode}
            onChartModeChange={setChartMode}
            incomeBreakdown={incomeBreakdown}
            expenseBreakdown={expenseBreakdown}
          />

          <FinanceMonthlySummary monthly={monthly} />

          <FinanceFilterBar
            filterType={filterType}
            filterCategory={filterCategory}
            dateFrom={dateFrom}
            dateTo={dateTo}
            search={search}
            hasFilters={Boolean(hasFilters)}
            categoryOptions={categoryOptions}
            onTypeChange={t => { setFilterType(t); setFilterCategory('all') }}
            onCategoryChange={setFilterCategory}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onSearchChange={setSearch}
            onClearFilters={() => { setFilterCategory('all'); setDateFrom(''); setDateTo(''); setSearch('') }}
          />

          <FinanceTransactionList
            transactions={transactions}
            filtered={filtered}
            filteredRevenue={filteredRevenue}
            filteredExpenses={filteredExpenses}
            menuOpen={menuOpen}
            projectName={projectName}
            onMenuToggle={setMenuOpen}
            onEdit={setEditing}
            onDelete={handleDelete}
          />
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
        <CreateTransactionModal projects={projects} onSave={handleCreate} onClose={() => setCreating(false)} />
      )}
      {editing && (
        <EditTransactionModal transaction={editing} projects={projects} onSave={handleEdit} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
