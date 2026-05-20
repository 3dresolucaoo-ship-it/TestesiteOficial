'use client'

/**
 * ProductionForm.tsx — Formulario de criacao e edicao de item de producao.
 *
 * Extraido de app/production/page.tsx (2026-05-20).
 * Sem Zod: estado simples via useState (mesmo padrao do original).
 * Valida apenas campo obrigatorio "item" antes de submeter.
 *
 * Convencoes: zero any, TypeScript estrito.
 */

import { useState }                                     from 'react'
import { FormField, Input, Select, SubmitButton }       from '@/components/Modal'
import type { ProductionFormData } from './types'

interface ProductionFormProps {
  orders:   { id: string; clientName: string; item: string }[]
  initial?: ProductionFormData
  onSave:   (d: ProductionFormData) => void
  onClose:  () => void
}

const DEFAULT_DATA: ProductionFormData = {
  clientName:     '',
  item:           '',
  printer:        'bambu',
  status:         'waiting',
  estimatedHours: '4',
  priority:       '1',
  orderId:        '',
}

export function ProductionForm({
  orders,
  initial,
  onSave,
  onClose,
}: ProductionFormProps) {
  const [data, setData] = useState<ProductionFormData>(initial ?? DEFAULT_DATA)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.item.trim()) return
    onSave(data)
    onClose()
  }

  const set =
    (k: keyof ProductionFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setData((prev) => ({ ...prev, [k]: e.target.value }))

  function handleOrderChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const orderId = e.target.value
    const order   = orders.find((o) => o.id === orderId)
    setData((prev) => ({
      ...prev,
      orderId,
      clientName: order?.clientName ?? prev.clientName,
      item:       order?.item       ?? prev.item,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {orders.length > 0 && (
        <FormField label="Vincular a Pedido (opcional)">
          <Select value={data.orderId} onChange={handleOrderChange}>
            <option value="">Sem pedido vinculado</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.clientName} -- {o.item}
              </option>
            ))}
          </Select>
        </FormField>
      )}

      <FormField label="Cliente">
        <Input
          value={data.clientName}
          onChange={set('clientName')}
          placeholder="Nome do cliente"
          aria-label="Nome do cliente"
        />
      </FormField>

      <FormField label="Item a imprimir">
        <Input
          value={data.item}
          onChange={set('item')}
          placeholder="O que sera impresso"
          required
          aria-label="Item a imprimir"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Impressora">
          <Select
            value={data.printer}
            onChange={set('printer') as React.ChangeEventHandler<HTMLSelectElement>}
            aria-label="Impressora"
          >
            <option value="bambu">Bambu Lab</option>
            <option value="flashforge">Flashforge</option>
          </Select>
        </FormField>
        <FormField label="Status">
          <Select
            value={data.status}
            onChange={set('status') as React.ChangeEventHandler<HTMLSelectElement>}
            aria-label="Status inicial"
          >
            <option value="waiting">Aguardando</option>
            <option value="printing">Imprimindo</option>
            <option value="done">Finalizado</option>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Tempo estimado (h)">
          <Input
            type="number"
            value={data.estimatedHours}
            onChange={set('estimatedHours')}
            min="0.5"
            step="0.5"
            aria-label="Tempo estimado em horas"
          />
        </FormField>
        <FormField label="Prioridade">
          <Input
            type="number"
            value={data.priority}
            onChange={set('priority')}
            min="1"
            aria-label="Prioridade (1 = mais urgente)"
          />
        </FormField>
      </div>

      <SubmitButton>{initial ? 'Salvar' : 'Adicionar a Fila'}</SubmitButton>
    </form>
  )
}
