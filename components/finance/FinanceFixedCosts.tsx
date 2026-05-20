'use client'

import { useState } from 'react'
import { Plus, Calculator, X } from 'lucide-react'
import type { FixedCost } from '@/lib/types'
import { fmt } from './types'

// ─── Progress bar ─────────────────────────────────────────────────────────────

export function ProgressBar({
  value,
  colorActive,
  colorBg,
}: {
  value:       number
  colorActive: string
  colorBg:     string
}) {
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

// ─── Fixed cost row (inline edit) ─────────────────────────────────────────────

export function FixedCostRow({
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
        aria-label="Nome do custo fixo"
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
        aria-label="Valor do custo fixo"
        className="bg-transparent text-[#a78bfa] text-sm font-semibold rounded-lg px-2 py-1.5 outline-none focus:bg-[rgba(255,255,255,0.04)] w-32 text-right tabular-nums"
      />
      <button
        onClick={remove}
        disabled={busy}
        title="Remover"
        aria-label="Remover custo fixo"
        className="p-1.5 text-[#3a3a3a] hover:text-[#ef4444] rounded-lg hover:bg-[#ef44441a] transition-colors disabled:opacity-40"
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ─── Fixed costs list + add form ──────────────────────────────────────────────

export function FinanceFixedCosts({
  fixedCosts,
  totalFixedCost,
  loading,
  onAdd,
  onUpdate,
  onDelete,
}: {
  fixedCosts:    FixedCost[]
  totalFixedCost: number
  loading:       boolean
  onAdd:         (label: string, amount: number) => Promise<void>
  onUpdate:      (cost: FixedCost) => Promise<void>
  onDelete:      (id: string) => Promise<void>
}) {
  const [newLabel, setNewLabel]   = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [adding, setAdding]       = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(newAmount)
    if (!newLabel.trim() || !isFinite(amount) || amount <= 0) return
    setAdding(true)
    try {
      await onAdd(newLabel.trim(), amount)
      setNewLabel('')
      setNewAmount('')
    } finally {
      setAdding(false)
    }
  }

  return (
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
        <div className="px-5 py-8 text-center text-[#555555] text-xs">Carregando...</div>
      ) : fixedCosts.length === 0 ? (
        <div className="px-5 py-6 text-center text-[#555555] text-xs">
          Nenhum custo fixo cadastrado. Adicione abaixo (DAS-MEI, aluguel, software...).
        </div>
      ) : (
        <div className="divide-y divide-[rgba(255,255,255,0.04)]">
          {fixedCosts.map(c => (
            <FixedCostRow
              key={c.id}
              cost={c}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="px-5 py-3 border-t border-[rgba(255,255,255,0.05)] flex items-center gap-2 flex-wrap bg-[rgba(255,255,255,0.015)]"
      >
        <input
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          placeholder="Ex: DAS-MEI"
          disabled={adding}
          aria-label="Nome do novo custo fixo"
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
          aria-label="Valor do novo custo fixo"
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
  )
}
