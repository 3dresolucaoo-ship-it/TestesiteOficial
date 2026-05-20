'use client'

import { useState } from 'react'
import { INCOME_CATEGORY_LABELS, EXPENSE_CATEGORY_LABELS } from '@/lib/types'
import { Modal, FormField, Input, Select, SubmitButton } from '@/components/Modal'
import { type FormData, parseDate } from './types'

export type { FormData }

// ─── Transaction form ─────────────────────────────────────────────────────────

export function TransactionForm({
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

      <FormField label="Descricao">
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
          placeholder="Ex: WhatsApp, Hotmart..."
        />
      </FormField>

      <SubmitButton>{initial ? 'Salvar' : 'Registrar'}</SubmitButton>
    </form>
  )
}

// ─── Transaction modals (create + edit) ───────────────────────────────────────

export function CreateTransactionModal({
  projects,
  onSave,
  onClose,
}: {
  projects: { id: string; name: string }[]
  onSave:   (d: FormData) => void
  onClose:  () => void
}) {
  return (
    <Modal title="Nova Transacao" onClose={onClose}>
      <TransactionForm projects={projects} onSave={onSave} onClose={onClose} />
    </Modal>
  )
}

import type { Transaction } from '@/lib/types'

export function EditTransactionModal({
  transaction,
  projects,
  onSave,
  onClose,
}: {
  transaction: Transaction
  projects:    { id: string; name: string }[]
  onSave:      (d: FormData) => void
  onClose:     () => void
}) {
  return (
    <Modal title="Editar Transacao" onClose={onClose}>
      <TransactionForm
        projects={projects}
        initial={{
          projectId:   transaction.projectId,
          type:        transaction.type,
          category:    transaction.category,
          description: transaction.description,
          value:       String(transaction.value),
          date:        transaction.date,
          source:      transaction.source,
        }}
        onSave={onSave}
        onClose={onClose}
      />
    </Modal>
  )
}

// Re-export parseDate para uso interno dos modais
export { parseDate }
