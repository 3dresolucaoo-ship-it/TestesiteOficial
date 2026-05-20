'use client'

/**
 * FinanceView.tsx — Modulo Financeiro V4
 *
 * Migrado para ModuleShell em 2026-05-20 (pattern de /orders e /crm).
 * Funcionalidade 100% preservada: KPIs, graficos, transacoes, custos fixos,
 * ponto de equilibrio, reconciliacao, exportacao CSV.
 *
 * Estrutura:
 *   ModuleShell (PageHeader + KpiRow + FilterBar)
 *     children:
 *       - ProjectFilter   (select de projeto)
 *       - tab "lancamentos": FinanceChartsPanel + FinanceMonthlySummary
 *                            + FinanceFilterBar + FinanceTransactionList
 *       - tab "custos":      FinanceFixedCosts (via BreakEvenSection parcial)
 *       - tab "breakeven":   BreakEvenSection completo
 *   Modal Novo Lancamento
 *   Modal Editar Lancamento
 *
 * Convencoes: zero em-dash, PT-BR em UI, TypeScript estrito, zero any.
 */

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useStore, uid } from '@/lib/store'
import type { Transaction, TransactionType, TransactionCategory, Project, FixedCost, IncomeCategory, ExpenseCategory } from '@/lib/types'
import { INCOME_CATEGORY_LABELS, EXPENSE_CATEGORY_LABELS } from '@/lib/types'
import {
  calcRevenue, calcExpenses, calcProfit, monthlyBreakdown,
  exportCsv, downloadCsv, categoryBreakdown,
} from '@/core/finance/engine'
import { calcBreakEvenSummary } from '@/core/finance/breakEvenEngine'
import { Plus, Download, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { ModuleShell } from '@/components/dashboard/v4'

import {
  type FormData,
  ALL_LABELS, LEGACY_STORAGE_FIXED_COST, LEGACY_STORAGE_PROFIT_GOAL,
} from './finance/types'
import { BreakEvenSection } from './finance/FinanceBreakEven'
import { CreateTransactionModal, EditTransactionModal } from './finance/FinanceTransactionForm'
import {
  FinanceFilterBar, FinanceTransactionList,
  FinanceChartsPanel, FinanceMonthlySummary,
  type ChartMode,
} from './finance/FinanceTransactions'

// ─── Tab type V4 ──────────────────────────────────────────────────────────────

type FinanceTabV4 = 'lancamentos' | 'custos' | 'breakeven'

// ─── Helper: filtro de projeto ────────────────────────────────────────────────

interface ProjectFilterProps {
  projects: { id: string; name: string }[]
  value:    string
  onChange: (v: string) => void
}

function ProjectFilter({ projects, value, onChange }: ProjectFilterProps) {
  if (projects.length <= 1) return null
  return (
    <div className="mb-4">
      <label htmlFor="finance-project-filter" className="sr-only">
        Filtrar por projeto
      </label>
      <select
        id="finance-project-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#141414] border border-[#2a2a2a] text-[#ebebeb] text-sm rounded-lg px-3 py-2 outline-none focus:border-[hsl(173_58%_35%)] transition-colors"
        aria-label="Filtrar financas por projeto"
      >
        <option value="all">Todos os projetos</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  )
}

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
  const [creating,    setCreating]    = useState(false)
  const [editing,     setEditing]     = useState<Transaction | null>(null)
  const [menuOpen,    setMenuOpen]    = useState<string | null>(null)
  const [chartMode,   setChartMode]   = useState<ChartMode>('both')
  const [activeTab,   setActiveTab]   = useState<FinanceTabV4>('lancamentos')
  const [searchQuery, setSearchQuery] = useState('')

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [filterProject,  setFilterProject]  = useState('all')
  const [filterType,     setFilterType]     = useState<TransactionType | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<TransactionCategory | 'all'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')

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
  const projectId = filterProject === 'all' ? undefined : filterProject
  const revenue   = calcRevenue(transactions, projectId)
  const expenses  = calcExpenses(transactions, projectId)
  const profit    = calcProfit(transactions, projectId)
  const monthly   = useMemo(() => monthlyBreakdown(transactions, projectId).slice(-6), [transactions, projectId])
  const incomeBreakdown  = useMemo(() => categoryBreakdown(transactions, 'income', projectId).map(r => ({ ...r, label: INCOME_CATEGORY_LABELS[r.category as IncomeCategory] ?? r.category })), [transactions, projectId])
  const expenseBreakdown = useMemo(() => categoryBreakdown(transactions, 'expense', projectId).map(r => ({ ...r, label: EXPENSE_CATEGORY_LABELS[r.category as ExpenseCategory] ?? r.category })), [transactions, projectId])

  const filtered = useMemo(() => {
    let txs = transactions
    if (projectId)                txs = txs.filter(t => t.projectId === projectId)
    if (filterType !== 'all')     txs = txs.filter(t => t.type === filterType)
    if (filterCategory !== 'all') txs = txs.filter(t => t.category === filterCategory)
    if (dateFrom) txs = txs.filter(t => t.date >= dateFrom)
    if (dateTo)   txs = txs.filter(t => t.date <= dateTo)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      txs = txs.filter(t => t.description.toLowerCase().includes(q) || t.source.toLowerCase().includes(q))
    }
    return [...txs].sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, projectId, filterType, filterCategory, dateFrom, dateTo, searchQuery])

  const filteredRevenue  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.value), 0)
  const filteredExpenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.value), 0)
  const hasFilters       = filterCategory !== 'all' || dateFrom || dateTo || Boolean(searchQuery.trim())

  const categoryOptions =
    filterType === 'income'  ? Object.entries(INCOME_CATEGORY_LABELS)
    : filterType === 'expense' ? Object.entries(EXPENSE_CATEGORY_LABELS)
    : Object.entries(ALL_LABELS)

  const projectName = useCallback(
    (id: string) => projects.find(p => p.id === id)?.name ?? '---',
    [projects],
  )

  // ── Transaction handlers ─────────────────────────────────────────────────────
  const handleCreate = useCallback((data: FormData) => {
    dispatch({ type: 'ADD_TRANSACTION', payload: { id: uid(), ...data, value: parseFloat(data.value) || 0 } })
    setCreating(false)
  }, [dispatch])

  const handleEdit = useCallback((data: FormData) => {
    if (!editing) return
    dispatch({ type: 'UPDATE_TRANSACTION', payload: { ...editing, ...data, value: parseFloat(data.value) || 0 } })
    setEditing(null)
  }, [editing, dispatch])

  const handleDelete = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id })
    setMenuOpen(null)
  }, [dispatch])

  const handleExport = useCallback(() => {
    const csv  = exportCsv(transactions, projectId)
    const name = projectId
      ? `financas-${projects.find(p => p.id === projectId)?.name ?? projectId}-${new Date().toISOString().slice(0, 10)}.csv`
      : `financas-global-${new Date().toISOString().slice(0, 10)}.csv`
    downloadCsv(csv, name)
  }, [transactions, projectId, projects])

  const handleReconcile = useCallback(async () => {
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
  }, [reconciling])

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id as FinanceTabV4)
  }, [])

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q)
  }, [])

  // ── KPIs derivados para header ────────────────────────────────────────────────
  const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase()

  // Lucro formatado como R$ N (sem casas decimais pra caber no hero card)
  const fmtBRL = (n: number) => `R$ ${Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  // Hero: lucro liquido do mes atual
  const thisMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  const monthTransactions = useMemo(
    () => transactions.filter(t => t.date.startsWith(thisMonth)),
    [transactions, thisMonth],
  )
  const monthRevenue  = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.value), 0)
  const monthExpenses = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.value), 0)
  const monthProfit   = monthRevenue - monthExpenses
  const monthMargin   = monthRevenue > 0 ? (monthProfit / monthRevenue) * 100 : 0

  // Tone do hero: petrol se positivo, ember se negativo
  const heroTone = monthProfit >= 0 ? 'petrol' : 'ember'

  // ── Tabs para ModuleShell ─────────────────────────────────────────────────────
  const tabs = useMemo(
    () => [
      { id: 'lancamentos', label: 'Lancamentos',      count: transactions.length, active: activeTab === 'lancamentos' },
      { id: 'custos',      label: 'Custos Fixos',     count: fixedCosts.length,  active: activeTab === 'custos'      },
      { id: 'breakeven',   label: 'Break Even',       count: 0,                  active: activeTab === 'breakeven'   },
    ],
    [transactions.length, fixedCosts.length, activeTab],
  )

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <ModuleShell
        eyebrow={`${mesAtual} · ${transactions.filter(t => t.type === 'income').length} RECEITAS · ${transactions.filter(t => t.type === 'expense').length} DESPESAS`}
        title="Financas"
        titleItalicSuffix="esse mes"
        livePhrase={
          transactions.length === 0
            ? 'Nenhum lancamento ainda. Registre a primeira transacao.'
            : `${transactions.length} ${transactions.length === 1 ? 'lancamento registrado' : 'lancamentos registrados'}, ${projects.length} ${projects.length === 1 ? 'projeto' : 'projetos'}.`
        }
        primaryAction={{
          label:   'Lancamento',
          onClick: () => setCreating(true),
          icon:    <Plus size={15} aria-hidden="true" />,
          // TODO: desabilitar quando projects.length === 0 (ModuleShell nao suporta disabled ainda)
        }}
        secondaryAction={{
          label:   'Exportar CSV',
          onClick: handleExport,
          icon:    <Download size={15} aria-hidden="true" />,
        }}
        heroKpi={{
          label:       `LUCRO LIQUIDO (${mesAtual})`,
          value:       profit < 0 ? `-${fmtBRL(profit)}` : fmtBRL(profit),
          description: monthRevenue > 0
            ? `Receita ${fmtBRL(revenue)} menos despesas ${fmtBRL(expenses)}.`
            : 'Nenhuma transacao no periodo.',
          // delta nao disponivel (precisaria de mes anterior — escopo futuro)
        }}
        satelliteKpis={[
          {
            label:       `RECEITA (${mesAtual})`,
            value:       fmtBRL(monthRevenue),
            description: `${monthTransactions.filter(t => t.type === 'income').length} entradas no mes.`,
            tone:        heroTone === 'petrol' ? 'petrol' : 'neutral',
          },
          {
            label:       `DESPESAS (${mesAtual})`,
            value:       fmtBRL(monthExpenses),
            description: `${monthTransactions.filter(t => t.type === 'expense').length} saidas no mes.`,
            tone:        'neutral',
          },
          {
            label:     'MARGEM (%)',
            value:     monthRevenue > 0 ? `${monthMargin.toFixed(1)}%` : 'sem dados',
            alertText: monthRevenue > 0 && monthMargin < 15 ? 'margem abaixo de 15%' : undefined,
            tone:      monthRevenue > 0 && monthMargin < 15 ? 'ember' : 'neutral',
          },
        ]}
        tabs={tabs}
        onTabChange={handleTabChange}
        searchPlaceholder="Buscar transacao, descricao..."
        onSearch={handleSearch}
      >
        {/* Filtro de projeto (multi-projeto) */}
        <ProjectFilter
          projects={projects}
          value={filterProject}
          onChange={setFilterProject}
        />

        {/* Feedback de reconciliacao */}
        {reconcileMsg && (
          <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border mb-4 ${
            reconcileMsg.kind === 'success'
              ? 'bg-[#10b9811a] border-[#10b98133] text-[#10b981]'
              : 'bg-[#ef44441a] border-[#ef444433] text-[#ef4444]'
          }`}>
            {reconcileMsg.kind === 'success'
              ? <CheckCircle2 size={14} aria-hidden="true" />
              : <AlertCircle  size={14} aria-hidden="true" />
            }
            {reconcileMsg.text}
          </div>
        )}

        {/* Tab: Lancamentos */}
        {activeTab === 'lancamentos' && (
          <div className="space-y-5">
            <FinanceChartsPanel
              monthly={monthly}
              chartMode={chartMode}
              onChartModeChange={setChartMode}
              incomeBreakdown={incomeBreakdown}
              expenseBreakdown={expenseBreakdown}
            />

            <FinanceMonthlySummary monthly={monthly} />

            {/* Acao de reconciliacao (administrativa) */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleReconcile}
                disabled={reconciling}
                title="Cria transacoes faltantes para pedidos pagos legacy"
                className="flex items-center gap-2 text-[#888888] hover:text-[#a78bfa] border border-[rgba(255,255,255,0.07)] hover:border-[#7c3aed55] text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw size={12} className={reconciling ? 'animate-spin' : ''} aria-hidden="true" />
                {reconciling ? 'Reconciliando...' : 'Reconciliar'}
              </button>
            </div>

            <FinanceFilterBar
              filterType={filterType}
              filterCategory={filterCategory}
              dateFrom={dateFrom}
              dateTo={dateTo}
              search={searchQuery}
              hasFilters={Boolean(hasFilters)}
              categoryOptions={categoryOptions}
              onTypeChange={t => { setFilterType(t); setFilterCategory('all') }}
              onCategoryChange={setFilterCategory}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              onSearchChange={handleSearch}
              onClearFilters={() => { setFilterCategory('all'); setDateFrom(''); setDateTo(''); setSearchQuery('') }}
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
          </div>
        )}

        {/* Tab: Custos Fixos (BreakEvenSection sem a parte de produtos) */}
        {activeTab === 'custos' && (
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

        {/* Tab: Break Even (mesmo componente — exibe contexto completo) */}
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
      </ModuleShell>

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
    </>
  )
}
