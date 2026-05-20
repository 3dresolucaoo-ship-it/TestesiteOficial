'use client'

/**
 * MovementForm — formulário de registro de entrada/saída de estoque.
 * Extraído de app/inventory/page.tsx em 2026-05-19 (refactor Felipe).
 */

import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import type { InventoryItem, MovementReason } from '@/lib/types'
import { MOVEMENT_REASON_LABELS, MOVEMENT_REASONS_BY_TYPE } from '@/lib/types'
import { FormField, Input, Select, SubmitButton } from '@/components/Modal'
import type { MovementFormData } from './types'

interface MovementFormProps {
  items:          InventoryItem[]
  defaultItemId?: string
  defaultType?:   'in' | 'out'
  onSave:         (d: MovementFormData) => void
  onClose:        () => void
}

export function MovementForm({
  items,
  defaultItemId,
  defaultType,
  onSave,
  onClose,
}: MovementFormProps) {
  const [data, setData] = useState<MovementFormData>({
    itemId:   defaultItemId ?? items[0]?.id ?? '',
    type:     defaultType ?? 'in',
    quantity: '1',
    reason:   defaultType === 'out' ? 'sale' : 'purchase',
    date:     new Date().toISOString().slice(0, 10),
    notes:    '',
  })

  const set =
    (k: keyof MovementFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setData(p => ({ ...p, [k]: e.target.value }))

  function handleTypeChange(t: 'in' | 'out') {
    setData(p => ({ ...p, type: t, reason: MOVEMENT_REASONS_BY_TYPE[t][0] as MovementReason }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const qty = parseFloat(data.quantity) || 0
    if (qty <= 0 || !data.itemId) return
    onSave(data)
    onClose()
  }

  const selectedItem  = items.find(i => i.id === data.itemId)
  const reasonOptions = MOVEMENT_REASONS_BY_TYPE[data.type]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Toggle entrada/saída */}
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Tipo de movimentação">
        {(['in', 'out'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => handleTypeChange(t)}
            aria-pressed={data.type === t}
            className={`py-2 rounded-lg text-sm font-medium transition-colors border flex items-center justify-center gap-2 ${
              data.type === t
                ? t === 'in'
                  ? 'bg-[#10b9811a] text-[#10b981] border-[#10b98133]'
                  : 'bg-[#ef44441a] text-[#ef4444] border-[#ef444433]'
                : 'bg-transparent text-[#888888] border-[#2a2a2a]'
            }`}
          >
            {t === 'in' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
            {t === 'in' ? 'Entrada' : 'Saída'}
          </button>
        ))}
      </div>

      {/* Seletor de item — oculto quando aberto a partir de card específico */}
      {!defaultItemId ? (
        <FormField label="Item">
          <Select value={data.itemId} onChange={set('itemId')}>
            {items.map(i => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </Select>
        </FormField>
      ) : selectedItem ? (
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg px-3 py-2">
          <p className="text-[#555555] text-xs">Item</p>
          <p className="text-[#ebebeb] text-sm font-medium">{selectedItem.name}</p>
          <p className="text-[#555555] text-xs">
            Estoque atual: {selectedItem.quantity} {selectedItem.unit}
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Quantidade">
          <Input
            type="number"
            value={data.quantity}
            onChange={set('quantity')}
            min="0.01"
            step="0.01"
            required
          />
        </FormField>
        <FormField label="Motivo">
          <Select value={data.reason} onChange={set('reason')}>
            {reasonOptions.map(r => (
              <option key={r} value={r}>{MOVEMENT_REASON_LABELS[r as MovementReason]}</option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Data">
        <Input type="date" value={data.date} onChange={set('date')} />
      </FormField>

      <FormField label="Observações (opcional)">
        <Input value={data.notes} onChange={set('notes')} placeholder="Opcional..." />
      </FormField>

      <SubmitButton>
        {data.type === 'in' ? 'Registrar Entrada' : 'Registrar Saída'}
      </SubmitButton>
    </form>
  )
}
