'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useStore, uid } from '@/lib/store'
import type { Transaction, TransactionType, TransactionCategory, IncomeCategory, ExpenseCategory, Project, FixedCost } from '@/lib/types'
import { INCOME_CATEGORY_LABELS, EXPENSE_CATEGORY_LABELS } from '@/lib/types'
import {
  calcRevenue, calcExpenses, calcProfit, monthlyBreakdown,
  exportCsv, downloadCsv, categoryBreakdown, profitMargin,
} from '@/core/finance/engine'
import { calcBreakEvenSummary } from '@/core/finance/breakEvenEngine'
import { fixedCostsService, profitGoalsService } from '@/services/financeConfig'
import { MonthlyChart, CategoryBars, type ChartMode } from '@/components/FinanceCharts'
import {
  Plus, Download, TrendingUp, TrendingDown, DollarSign, Percent,
  Trash2, MoreHorizontal, Pencil, Search, BarChart3, RefreshCw,
  Target, Calculator, AlertCircle, CheckCircle2, Info, X,
} from 'lucide-react'
import { Modal, FormField, Input, Select, SubmitButton } from '@/components/Modal'

type FinanceTab = 'overview' | 'breakeven'

// Migração de localStorage legacy (Onda 2 → Onda 3)
const LEGACY_STORAGE_FIXED_COST  = 'bvaz.finance.fixedCost'
const LEGACY_STORAGE_PROFIT_GOAL = 'bvaz.finance.profitGoal'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ALL_LABELS = { ...INCOME_CATEGORY_LABELS, ...EXPENSE_CATEGORY_LABELS }

function fmt(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

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

// ─── Break-even section ───────────────────────────────────────────────────────

import type { BreakEvenSummary } from '@/core/finance/breakEvenEngine'

function BreakEvenSection({
  summary,
  projects,
  selectedProjectId,
  onSelectProject,
  fixedCosts,
  profitGoal,
  totalFixedCost,
  onAddFixedCost,
  onUpdateFixedCost,
  onDeleteFixedCost,
  onProfitGoalChange,
  hasProducts,
  loading,
}: {
  summary:             BreakEvenSummary
  projects:            { id: string; name: string }[]
  selectedProjectId:   string
  onSelectProject:     (id: string) => void
  fixedCosts:          FixedCost[]
  profitGoal:          number
  totalFixedCost:      number
  onAddFixedCost:      (label: string, amount: number) => Promise<void>
  onUpdateFixedCost:   (cost: FixedCost) => Promise<void>
  onDeleteFixedCost:   (id: string) => Promise<void>
  onProfitGoalChange:  (v: number) => void
  hasProducts:         boolean
  loading:             boolean
}) {
  const noFixedCost   = totalFixedCost <= 0
  const noProducts    = !hasProducts || summary.products.length === 0
  const noProject     = !selectedProjectId

  // Form pra novo custo fixo
  const [newLabel, setNewLabel]   = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [adding, setAdding]       = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(newAmount)
    if (!newLabel.trim() || !isFinite(amount) || amount <= 0) return
    setAdding(true)
    try {
      await onAddFixedCost(newLabel.trim(), amount)
      setNewLabel('')
      setNewAmount('')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="space-y-5">

      {/* Educational header */}
      <div className="bg-[rgba(124,58,237,0.05)] border border-[#7c3aed33] rounded-xl p-4 flex gap-3">
        <Info size={16} className="text-[#a78bfa] shrink-0 mt-0.5" />
        <div className="text-xs text-[#888888] leading-relaxed">
          <p className="text-[#f0f0f5] font-medium mb-1">O que é Ponto de Equilíbrio?</p>
          <p>
            É quanto você precisa <strong className="text-[#a78bfa]">vender por mês</strong> pra <strong>não ter prejuízo</strong>.
            Calculado a partir dos seus <strong>custos fixos</strong> (aluguel, DAS-MEI, internet…) divididos pela
            <strong> margem de contribuição</strong> (preço − custo variável) de cada produto.
          </p>
        </div>
      </div>

      {/* Project selector */}
      <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 flex items-center gap-3 flex-wrap">
        <label className="text-[#555555] text-xs uppercase tracking-wide font-medium">
          Projeto
        </label>
        <select
          value={selectedProjectId}
          onChange={e => onSelectProject(e.target.value)}
          className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#f0f0f5] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7c3aed] cursor-pointer flex-1 min-w-[200px]"
        >
          {projects.length === 0 && <option value="">Sem projetos</option>}
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <span className="text-[#444455] text-[11px]">
          Custos e meta são por projeto.
        </span>
      </div>

      {noProject && (
        <div className="bg-[#f59e0b1a] border border-[#f59e0b33] rounded-xl p-4 flex gap-3">
          <AlertCircle size={16} className="text-[#f59e0b] shrink-0 mt-0.5" />
          <p className="text-xs text-[#f59e0b]">
            Crie um projeto em <a href="/projects" className="underline">/projects</a> pra cadastrar custos fixos.
          </p>
        </div>
      )}

      {!noProject && (
      <>
      {/* Lista de custos fixos */}
      <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Calculator size={14} className="text-[#a78bfa]" />
            <p className="text-[#f0f0f5] text-sm font-medium">Custos Fixos Mensais</p>
          </div>
          <p className="text-[#a78bfa] text-sm font-bold tabular-nums">
            Total: {fmt(totalFixedCost)}
          </p>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-center text-[#555555] text-xs">Carregando…</div>
        ) : fixedCosts.length === 0 ? (
          <div className="px-5 py-6 text-center text-[#555555] text-xs">
            Nenhum custo fixo cadastrado. Adicione abaixo (DAS-MEI, aluguel, software…).
          </div>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.04)]">
            {fixedCosts.map(c => (
              <FixedCostRow
                key={c.id}
                cost={c}
                onUpdate={onUpdateFixedCost}
                onDelete={onDeleteFixedCost}
              />
            ))}
          </div>
        )}

        {/* Add form */}
        <form onSubmit={handleAdd} className="px-5 py-3 border-t border-[rgba(255,255,255,0.05)] flex items-center gap-2 flex-wrap bg-[rgba(255,255,255,0.015)]">
          <input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="Ex: DAS-MEI"
            disabled={adding}
            className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#f0f0f5] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7c3aed] flex-1 min-w-[140px]"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={newAmount}
            onChange={e => setNewAmount(e.target.value)}
            placeholder="R$"
            disabled={adding}
            className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#f0f0f5] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7c3aed] w-32 tabular-nums"
          />
          <button
            type="submit"
            disabled={adding || !newLabel.trim() || !newAmount}
            className="flex items-center gap-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-3 py-2 rounded-lg transition-all"
          >
            <Plus size={14} /> Adicionar
          </button>
        </form>
      </div>

      {/* Profit goal */}
      <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
        <label className="text-[#555555] text-xs uppercase tracking-wide font-medium mb-2 flex items-center gap-1.5">
          <Target size={12} />
          Meta de lucro mensal (R$)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={profitGoal || ''}
          onChange={e => onProfitGoalChange(parseFloat(e.target.value) || 0)}
          placeholder="Ex: 3000"
          className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#f0f0f5] text-lg font-semibold rounded-lg px-3 py-2 outline-none focus:border-[#7c3aed] tabular-nums"
        />
        <p className="text-[#444455] text-[11px] mt-2">
          Quanto você quer levar pra casa por mês depois de pagar tudo. Salva automaticamente.
        </p>
      </div>

      {noFixedCost && (
        <div className="bg-[#f59e0b1a] border border-[#f59e0b33] rounded-xl p-4 flex gap-3">
          <AlertCircle size={16} className="text-[#f59e0b] shrink-0 mt-0.5" />
          <p className="text-xs text-[#f59e0b]">
            Informe seu <strong>custo fixo mensal</strong> acima pra calcular o ponto de equilíbrio.
          </p>
        </div>
      )}

      {noProducts && !noFixedCost && (
        <div className="bg-[#f59e0b1a] border border-[#f59e0b33] rounded-xl p-4 flex gap-3">
          <AlertCircle size={16} className="text-[#f59e0b] shrink-0 mt-0.5" />
          <p className="text-xs text-[#f59e0b]">
            Você precisa cadastrar <strong>produtos</strong> com preço de venda em <a href="/products" className="underline">/products</a> pra calcular margem por unidade.
          </p>
        </div>
      )}

      {!noFixedCost && !noProducts && (
        <>
          {/* Big result cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-[#7c3aed1a] to-[#7c3aed05] border border-[#7c3aed33] rounded-xl p-5">
              <p className="text-[#a78bfa] text-[11px] uppercase tracking-wide font-semibold mb-2">Ponto de Equilíbrio</p>
              <p className="text-[#f0f0f5] text-3xl font-bold tabular-nums mb-1">{fmt(summary.breakEvenRevenue)}</p>
              <p className="text-[#888888] text-xs mb-4">precisa vender esse mês pra não ter prejuízo</p>
              <ProgressBar value={summary.breakEvenProgress} colorActive="#a78bfa" colorBg="#7c3aed22" />
              <p className="text-[#555555] text-[11px] mt-2">
                Hoje: <span className="text-[#a78bfa] font-medium tabular-nums">{fmt(summary.currentMonthRevenue)}</span>
                {' '}({summary.breakEvenProgress.toFixed(0)}%)
              </p>
            </div>

            {profitGoal > 0 && (
              <div className="bg-gradient-to-br from-[#10b9811a] to-[#10b98105] border border-[#10b98133] rounded-xl p-5">
                <p className="text-[#10b981] text-[11px] uppercase tracking-wide font-semibold mb-2">Meta de Lucro {fmt(profitGoal)}</p>
                <p className="text-[#f0f0f5] text-3xl font-bold tabular-nums mb-1">{fmt(summary.goalRevenue)}</p>
                <p className="text-[#888888] text-xs mb-4">precisa vender pra atingir a meta</p>
                <ProgressBar value={summary.goalProgress} colorActive="#10b981" colorBg="#10b98122" />
                <p className="text-[#555555] text-[11px] mt-2">
                  Hoje: <span className="text-[#10b981] font-medium tabular-nums">{fmt(summary.currentMonthRevenue)}</span>
                  {' '}({summary.goalProgress.toFixed(0)}%)
                </p>
              </div>
            )}
          </div>

          {/* Average MC% */}
          <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[#555555] text-[11px] uppercase tracking-wide font-medium">Margem de Contribuição Média</p>
              <p className="text-[#f0f0f5] text-2xl font-bold tabular-nums">{summary.avgContributionPct.toFixed(1)}%</p>
            </div>
            <div className="text-[#888888] text-xs max-w-md">
              Ponderada pelo preço dos seus {summary.products.length} produto(s). Quanto maior, menos unidades você precisa vender pra cobrir o custo fixo.
            </div>
          </div>

          {/* Per-product breakdown */}
          <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
              <p className="text-[#f0f0f5] text-sm font-medium">Por Produto</p>
              <p className="text-[#444455] text-[11px]">unidades necessárias pra break-even / meta</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.05)]">
                    {['Produto', 'Preço', 'Custo Var.', 'MC un.', 'MC %', 'Break-even', profitGoal > 0 ? 'Meta' : ''].filter(Boolean).map(h => (
                      <th key={h} className="text-left py-2.5 px-4 text-[#555555] text-xs font-medium uppercase tracking-wide first:pl-5 last:pr-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {summary.products.map(p => {
                    const isLoss = p.contributionMargin <= 0
                    return (
                      <tr key={p.productId} className="border-b border-[rgba(255,255,255,0.03)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <td className="py-3 px-4 first:pl-5 text-[#f0f0f5] text-xs">{p.productName}</td>
                        <td className="py-3 px-4 text-[#10b981] text-xs tabular-nums">{fmt(p.salePrice)}</td>
                        <td className="py-3 px-4 text-[#ef4444] text-xs tabular-nums">{fmt(p.variableCost)}</td>
                        <td className={`py-3 px-4 text-xs font-semibold tabular-nums ${isLoss ? 'text-[#ef4444]' : 'text-[#a78bfa]'}`}>
                          {fmt(p.contributionMargin)}
                        </td>
                        <td className={`py-3 px-4 text-xs font-medium ${p.contributionPct >= 30 ? 'text-[#10b981]' : p.contributionPct >= 15 ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>
                          {p.contributionPct.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-[#f0f0f5] text-xs font-semibold tabular-nums">
                          {isFinite(p.unitsToBreakEven) ? `${p.unitsToBreakEven} un` : '— prejuízo'}
                        </td>
                        {profitGoal > 0 && (
                          <td className="py-3 px-4 last:pr-5 text-[#10b981] text-xs font-semibold tabular-nums">
                            {isFinite(p.unitsToReachGoal) ? `${p.unitsToReachGoal} un` : '—'}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Educational footer */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl p-4 text-xs text-[#666666] space-y-2">
            <p><strong className="text-[#888888]">📐 Fórmulas usadas:</strong></p>
            <p><span className="text-[#a78bfa]">Margem de Contribuição</span> = Preço de Venda − Custo Variável (filamento + energia + falha)</p>
            <p><span className="text-[#a78bfa]">Ponto de Equilíbrio (un.)</span> = Custo Fixo ÷ MC Unitária</p>
            <p><span className="text-[#a78bfa]">Meta (un.)</span> = (Custo Fixo + Lucro Desejado) ÷ MC Unitária</p>
            <p className="pt-1 text-[#555555]">
              💾 Custos fixos e meta agora ficam salvos no banco por projeto. Trocar de browser/dispositivo não perde os dados.
            </p>
          </div>
        </>
      )}
      </>
      )}
    </div>
  )
}

function FixedCostRow({
  cost,
  onUpdate,
  onDelete,
}: {
  cost:     FixedCost
  onUpdate: (cost: FixedCost) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [label, setLabel]   = useState(cost.label)
  const [amount, setAmount] = useState(String(cost.amount))
  const [busy, setBusy]     = useState(false)

  const dirty = label !== cost.label || parseFloat(amount) !== cost.amount

  async function save() {
    if (!dirty || busy) return
    const parsed = parseFloat(amount)
    if (!label.trim() || !isFinite(parsed) || parsed < 0) return
    setBusy(true)
    try {
      await onUpdate({ ...cost, label: label.trim(), amount: parsed })
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (busy) return
    setBusy(true)
    try { await onDelete(cost.id) } finally { setBusy(false) }
  }

  return (
    <div className="px-5 py-2.5 flex items-center gap-2 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
      <input
        value={label}
        onChange={e => setLabel(e.target.value)}
        onBlur={save}
        disabled={busy}
        className="bg-transparent text-[#f0f0f5] text-sm rounded-lg px-2 py-1.5 outline-none focus:bg-[rgba(255,255,255,0.04)] flex-1 min-w-[140px]"
      />
      <input
        type="number"
        min="0"
        step="0.01"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        onBlur={save}
        disabled={busy}
        className="bg-transparent text-[#a78bfa] text-sm font-semibold rounded-lg px-2 py-1.5 outline-none focus:bg-[rgba(255,255,255,0.04)] w-32 text-right tabular-nums"
      />
      <button
        onClick={remove}
        disabled={busy}
        title="Remover"
        className="p-1.5 text-[#3a3a3a] hover:text-[#ef4444] rounded-lg hover:bg-[#ef44441a] transition-colors disabled:opacity-40"
      >
        <X size={14} />
      </button>
    </div>
  )
}

function ProgressBar({ value, colorActive, colorBg }: { value: number; colorActive: string; colorBg: string }) {
  const clamped = Math.min(Math.max(value, 0), 100)
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: colorBg }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${clamped}%`,
          background: `linear-gradient(90deg, ${colorActive}cc, ${colorActive})`,
          boxShadow: `0 0 12px ${colorActive}66`,
        }}
      />
    </div>
  )
}

// ─── Finance view ─────────────────────────────────────────────────────────────

export function FinanceView({
  initialTransactions,
  initialProjects,
}: {
  initialTransactions: Transaction[]
  initialProjects:     Project[]
}) {
  const { state, dispatch } = useStore()

  // Read from the shared store so adds/edits/deletes survive navigation. Fall
  // back to SSR-supplied initial data only when the store hasn't hydrated yet
  // (e.g. very first render before useEffect populates it).
  const transactions = state.transactions.length > 0 || initialTransactions.length === 0
    ? state.transactions
    : initialTransactions
  const projects     = state.projects.length > 0 || initialProjects.length === 0
    ? state.projects
    : initialProjects

  const [creating,  setCreating]  = useState(false)
  const [editing,   setEditing]   = useState<Transaction | null>(null)
  const [menuOpen,  setMenuOpen]  = useState<string | null>(null)
  const [chartMode, setChartMode] = useState<ChartMode>('both')

  const [filterProject,  setFilterProject]  = useState('all')
  const [filterType,     setFilterType]     = useState<TransactionType | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<TransactionCategory | 'all'>('all')
  const [dateFrom,       setDateFrom]       = useState('')
  const [dateTo,         setDateTo]         = useState('')
  const [search,         setSearch]         = useState('')

  // ── Tabs ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview')

  // ── Reconciliação ───────────────────────────────────────────────────────────
  const [reconciling, setReconciling] = useState(false)
  const [reconcileMsg, setReconcileMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  // ── Break-even (persistido no DB por projeto) ──────────────────────────────
  const [breakEvenProjectId, setBreakEvenProjectId] = useState<string>('')
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([])
  const [profitGoal, setProfitGoal] = useState<number>(0)
  const [beLoading, setBeLoading]   = useState<boolean>(false)

  // Default: primeiro projeto disponível
  useEffect(() => {
    if (!breakEvenProjectId && projects.length > 0) {
      setBreakEvenProjectId(projects[0].id)
    }
  }, [projects, breakEvenProjectId])

  // Load (e migra localStorage legacy → DB no primeiro carregamento por projeto)
  const loadBreakEvenData = useCallback(async (pid: string) => {
    if (!pid) return
    setBeLoading(true)
    try {
      const [costs, goal] = await Promise.all([
        fixedCostsService.listByProject(pid),
        profitGoalsService.getByProject(pid),
      ])

      // Migração one-shot: se DB vazio mas localStorage tem valor, importa
      let migratedCosts = costs
      let migratedGoal  = goal?.monthlyTarget ?? 0
      if (typeof window !== 'undefined') {
        const legacyFC = Number(localStorage.getItem(LEGACY_STORAGE_FIXED_COST) ?? '0')
        const legacyPG = Number(localStorage.getItem(LEGACY_STORAGE_PROFIT_GOAL) ?? '0')

        if (costs.length === 0 && isFinite(legacyFC) && legacyFC > 0) {
          const migrated: FixedCost = {
            id: uid(),
            projectId: pid,
            label: 'Custo fixo (importado)',
            amount: legacyFC,
          }
          await fixedCostsService.create(migrated)
          migratedCosts = [migrated]
          localStorage.removeItem(LEGACY_STORAGE_FIXED_COST)
        }

        if (!goal && isFinite(legacyPG) && legacyPG > 0) {
          await profitGoalsService.upsert({ projectId: pid, monthlyTarget: legacyPG })
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

  async function handleAddFixedCost(label: string, amount: number) {
    const cost: FixedCost = { id: uid(), projectId: breakEvenProjectId, label, amount }
    await fixedCostsService.create(cost)
    setFixedCosts(prev => [...prev, cost])
  }
  async function handleUpdateFixedCost(cost: FixedCost) {
    await fixedCostsService.update(cost)
    setFixedCosts(prev => prev.map(c => c.id === cost.id ? cost : c))
  }
  async function handleDeleteFixedCost(id: string) {
    await fixedCostsService.delete(id)
    setFixedCosts(prev => prev.filter(c => c.id !== id))
  }

  // Salva meta com debounce simples (após pausa do usuário)
  function handleProfitGoalChange(v: number) {
    setProfitGoal(v)
    if (!breakEvenProjectId) return
    profitGoalsService.upsert({ projectId: breakEvenProjectId, monthlyTarget: v }).catch(err => {
      console.error('profitGoalsService.upsert failed', err)
    })
  }

  // Filtra produtos/transactions pelo projeto selecionado pra break-even
  const beProducts     = useMemo(
    () => breakEvenProjectId
      ? state.products.filter(p => p.projectId === breakEvenProjectId)
      : [],
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
    () =>
      categoryBreakdown(transactions, 'income', projectId).map(r => ({
        ...r,
        label: INCOME_CATEGORY_LABELS[r.category as IncomeCategory] ?? r.category,
      })),
    [transactions, projectId],
  )
  const expenseBreakdown = useMemo(
    () =>
      categoryBreakdown(transactions, 'expense', projectId).map(r => ({
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
      txs = txs.filter(
        t => t.description.toLowerCase().includes(q) || t.source.toLowerCase().includes(q),
      )
    }
    return [...txs].sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, projectId, filterType, filterCategory, dateFrom, dateTo, search])

  const filteredRevenue  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.value), 0)
  const filteredExpenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.value), 0)
  const hasFilters       = filterCategory !== 'all' || dateFrom || dateTo || Boolean(search)

  function handleCreate(data: FormData) {
    const newTx = { id: uid(), ...data, value: parseFloat(data.value) || 0 }
    dispatch({ type: 'ADD_TRANSACTION', payload: newTx })
  }
  function handleEdit(data: FormData) {
    if (!editing) return
    const updated = { ...editing, ...data, value: parseFloat(data.value) || 0 }
    dispatch({ type: 'UPDATE_TRANSACTION', payload: updated })
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
      const res = await fetch('/api/admin/reconcile-transactions', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Falha na reconciliação')
      setReconcileMsg({ kind: 'success', text: json.message ?? 'Reconciliado' })
      // Recarrega a página depois de 1.5s pra puxar transactions novas via SSR
      if (json.result?.created > 0) {
        setTimeout(() => window.location.reload(), 1500)
      }
    } catch (err) {
      setReconcileMsg({ kind: 'error', text: err instanceof Error ? err.message : 'Erro desconhecido' })
    } finally {
      setReconciling(false)
    }
  }

  const projectName = (id: string) => projects.find(p => p.id === id)?.name ?? '—'

  const categoryOptions =
    filterType === 'income'
      ? Object.entries(INCOME_CATEGORY_LABELS)
      : filterType === 'expense'
      ? Object.entries(EXPENSE_CATEGORY_LABELS)
      : Object.entries(ALL_LABELS)

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[#f0f0f5] font-semibold text-lg">Finanças</h2>
          <p className="text-[#555555] text-sm">{transactions.length} transações registradas</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleReconcile}
            disabled={reconciling}
            title="Cria transações faltantes para pedidos pagos legacy"
            className="flex items-center gap-2 text-[#888888] hover:text-[#a78bfa] border border-[rgba(255,255,255,0.07)] hover:border-[#7c3aed55] text-sm px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={reconciling ? 'animate-spin' : ''} />
            {reconciling ? 'Reconciliando…' : 'Reconciliar'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 text-[#888888] hover:text-[#f0f0f5] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.12)] text-sm px-3 py-2 rounded-lg transition-colors"
          >
            <Download size={14} /> CSV
          </button>
          <button
            onClick={() => setCreating(true)}
            disabled={projects.length === 0}
            title={projects.length === 0 ? 'Crie um projeto antes de registrar transações' : ''}
            className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-3 py-2 rounded-lg transition-all shadow-[0_0_16px_rgba(124,58,237,0.3)] hover:shadow-[0_0_24px_rgba(124,58,237,0.4)]"
          >
            <Plus size={15} /> Transação
          </button>
        </div>
      </div>

      {reconcileMsg && (
        <div
          className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${
            reconcileMsg.kind === 'success'
              ? 'bg-[#10b9811a] border-[#10b98133] text-[#10b981]'
              : 'bg-[#ef44441a] border-[#ef444433] text-[#ef4444]'
          }`}
        >
          {reconcileMsg.kind === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {reconcileMsg.text}
        </div>
      )}

      {/* ── Tab strip ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-[rgba(255,255,255,0.06)]">
        {([
          { id: 'overview' as const,  label: 'Visão Geral',         icon: BarChart3 },
          { id: 'breakeven' as const, label: 'Ponto de Equilíbrio', icon: Target },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-[#a78bfa] border-[#7c3aed]'
                : 'text-[#555555] border-transparent hover:text-[#f0f0f5]'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
      <>
      <select
        value={filterProject}
        onChange={e => setFilterProject(e.target.value)}
        className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#888888] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7c3aed] cursor-pointer"
      >
        <option value="all">Todos os projetos</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Receita',  value: fmt(revenue),  icon: TrendingUp,  color: 'text-[#10b981]', bg: 'bg-[#10b9811a]', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.08)]' },
          { label: 'Despesas', value: fmt(expenses), icon: TrendingDown, color: 'text-[#ef4444]', bg: 'bg-[#ef44441a]', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.08)]' },
          {
            label: 'Lucro', value: fmt(profit), icon: DollarSign,
            color: profit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]',
            bg:    profit >= 0 ? 'bg-[#10b9811a]' : 'bg-[#ef44441a]',
            glow:  profit >= 0 ? 'shadow-[0_0_20px_rgba(16,185,129,0.08)]' : 'shadow-[0_0_20px_rgba(239,68,68,0.08)]',
          },
          {
            label: 'Margem', value: `${margin.toFixed(1)}%`, icon: Percent,
            color: margin >= 20 ? 'text-[#a78bfa]' : margin >= 0 ? 'text-[#f59e0b]' : 'text-[#ef4444]',
            bg: 'bg-[#7c3aed1a]', glow: 'shadow-[0_0_20px_rgba(124,58,237,0.08)]',
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={14} className="text-[#555555]" />
            <p className="text-[#f0f0f5] text-sm font-medium">Evolução Mensal</p>
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
            className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#888888] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#7c3aed] cursor-pointer"
          >
            <option value="all">Todas as categorias</option>
            {categoryOptions.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input
            type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#888888] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#7c3aed]"
          />
          <span className="text-[#3a3a3a] text-xs">→</span>
          <input
            type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#888888] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#7c3aed]"
          />
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555] pointer-events-none" />
            <input
              value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar…"
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

      <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(255,255,255,0.05)]">
          <p className="text-[#555555] text-xs">
            {filtered.length} transaç{filtered.length !== 1 ? 'ões' : 'ão'}
            {filtered.length !== transactions.length && ` (de ${transactions.length})`}
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
                        {t.type === 'income' ? '+' : '−'}{fmt(Number(t.value))}
                      </span>
                      <button onClick={() => setEditing(t)} className="p-1.5 text-[#3a3a3a] hover:text-[#888888] rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 text-[#3a3a3a] hover:text-[#ef4444] rounded-lg hover:bg-[#ef44441a] transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.05)]">
                    {['Data', 'Projeto', 'Descrição', 'Categoria', 'Valor', ''].map(h => (
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
      </>
      )}

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

      {creating && (
        <Modal title="Nova Transação" onClose={() => setCreating(false)}>
          <TransactionForm projects={projects} onSave={handleCreate} onClose={() => setCreating(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Editar Transação" onClose={() => setEditing(null)}>
          <TransactionForm
            projects={projects}
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
