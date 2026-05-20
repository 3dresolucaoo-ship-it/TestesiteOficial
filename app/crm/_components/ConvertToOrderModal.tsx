'use client'

/**
 * app/crm/_components/ConvertToOrderModal.tsx
 *
 * Modal de conversao lead → pedido.
 * Pre-preenche cliente, origem e contato do lead.
 * Maker so precisa preencher item + valor + confirmar.
 *
 * Etapa 3 Golden Path #1 — lead→pedido manual.
 */

import { useState } from 'react'
import type { Lead, OrderStatus, OrderOrigin } from '@/lib/types'
import { FormField, Input, Select } from '@/components/Modal'
import { fmtDate } from './helpers'

// ---------------------------------------------------------------------------
// Tipo do form (minimo necessario pra criar o pedido)
// ---------------------------------------------------------------------------

export type ConvertFormData = {
  item:   string
  value:  string
  status: OrderStatus
  date:   string
}

interface ConvertToOrderModalProps {
  lead:    Lead
  onSave:  (d: ConvertFormData) => void
  onClose: () => void
  loading: boolean
}

// Mapa legivel de source → origem do pedido (exibição)
const SOURCE_LABEL: Record<string, string> = {
  whatsapp:  'WhatsApp',
  instagram: 'Instagram',
  facebook:  'Facebook',
  shopee:    'Outro',
  referral:  'Outro',
  catalog:   'Outro',
  other:     'Outro',
}

export function ConvertToOrderModal({ lead, onSave, onClose, loading }: ConvertToOrderModalProps) {
  const [data, setData] = useState<ConvertFormData>({
    item:   '',
    value:  lead.value > 0 ? String(lead.value) : '',
    status: 'lead',
    date:   new Date().toISOString().slice(0, 10),
  })

  const set = (k: keyof ConvertFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setData((prev) => ({ ...prev, [k]: e.target.value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.item.trim()) return
    onSave(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Info do lead (readonly) */}
      <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl p-3 space-y-1">
        <p className="text-[#555555] text-[10px] font-medium uppercase tracking-wide">
          Lead de origem
        </p>
        <p className="text-[#ebebeb] text-sm font-medium">{lead.name}</p>
        {lead.contact && (
          <p className="text-[#555555] text-xs">{lead.contact}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#3a3a3a] text-xs">
            {SOURCE_LABEL[lead.source] ?? 'Outro'}
          </span>
          <span className="text-[#3a3a3a] text-xs">·</span>
          <span className="text-[#3a3a3a] text-xs">
            criado em {fmtDate(lead.date)}
          </span>
        </div>
      </div>

      {/* Nota de auto-fill */}
      <p className="text-[#555555] text-xs leading-relaxed">
        Cliente e canal preenchidos automaticamente. Defina o item e o valor para criar o pedido.
      </p>

      <FormField label="Item / Descricao do pedido">
        <Input
          value={data.item}
          onChange={set('item')}
          placeholder="Ex: Suporte Bambu A1 Mini, Porta Ferramentas..."
          required
          autoFocus
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Valor (R$)">
          <Input
            type="number"
            value={data.value}
            onChange={set('value')}
            placeholder="0"
            min="0"
          />
        </FormField>
        <FormField label="Status inicial">
          <Select value={data.status} onChange={set('status')}>
            <option value="lead">Lead</option>
            <option value="quote_sent">Orcamento Enviado</option>
            <option value="paid">Pago</option>
          </Select>
        </FormField>
      </div>

      <FormField label="Data">
        <Input type="date" value={data.date} onChange={set('date')} />
      </FormField>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          style={{
            background: loading ? 'hsl(173 58% 20%)' : 'hsl(173 58% 28%)',
            color: '#fff',
          }}
        >
          {loading ? 'Convertendo...' : 'Criar Pedido'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-[#555555] hover:text-[#888888] transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
