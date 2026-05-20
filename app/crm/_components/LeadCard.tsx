'use client'

/**
 * app/crm/_components/LeadCard.tsx
 * Card individual dentro de uma coluna do Kanban de leads.
 * Mobile-first: largura fixa 256px dentro do overflow-x-auto do Kanban.
 *
 * Etapa 3 Golden Path #1: botao "Converter em pedido" + badge de convertido.
 */

import { Pencil, Trash2, ShoppingCart, CheckCircle } from 'lucide-react'
import type { Lead } from '@/lib/types'
import { CONTACT_SOURCE_LABELS } from '@/lib/types'
import { fmtBRL } from './helpers'

interface LeadCardProps {
  lead:             Lead
  projectName:      string
  onEdit:           (l: Lead) => void
  onDelete:         (id: string) => void
  onAdvance:        (l: Lead) => void
  onConvert:        (l: Lead) => void
  canAdvance:       boolean
  orderNumber?:     string  // ex: "HZR-0012" — passado pela page quando lead ja convertido
}

export function LeadCard({
  lead, projectName, onEdit, onDelete, onAdvance, onConvert, canAdvance, orderNumber,
}: LeadCardProps) {
  const isConverted = Boolean(lead.convertedOrderId)

  return (
    <article
      className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3 hover:border-[#3a3a3a] transition-colors"
      aria-label={`Lead ${lead.name}`}
    >
      <p className="text-[#ebebeb] text-sm font-medium mb-0.5">{lead.name}</p>
      <p className="text-[#3a3a3a] text-[10px] mb-1">{projectName}</p>

      {lead.contact && (
        <p className="text-[#555555] text-xs mb-1">{lead.contact}</p>
      )}

      <p className="text-[#555555] text-[10px] mb-1">
        {CONTACT_SOURCE_LABELS[lead.source]}
      </p>

      {lead.notes && (
        <p className="text-[#888888] text-xs mb-2 line-clamp-2">{lead.notes}</p>
      )}

      {/* Badge de convertido */}
      {isConverted && (
        <div className="flex items-center gap-1 mb-2">
          <CheckCircle size={10} className="text-[#10b981] shrink-0" aria-hidden="true" />
          <span className="text-[#10b981] text-[10px] font-medium">
            {orderNumber ? `Pedido ${orderNumber}` : 'Pedido criado'}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        {lead.value > 0
          ? <span className="text-[#10b981] text-xs font-medium">{fmtBRL(lead.value)}</span>
          : <span />
        }
        <div className="flex items-center gap-1">
          {/* Botao converter — so aparece quando nao convertido ainda */}
          {!isConverted && (
            <button
              type="button"
              onClick={() => onConvert(lead)}
              className="flex items-center gap-0.5 text-[10px] text-[hsl(173_58%_45%)] hover:text-[hsl(173_58%_60%)] px-1.5 py-0.5 rounded hover:bg-[hsl(173_58%_28%_/_0.12)] transition-colors"
              aria-label={`Converter lead ${lead.name} em pedido`}
              title="Converter em pedido"
            >
              <ShoppingCart size={9} aria-hidden="true" />
              <span>Pedido</span>
            </button>
          )}
          {canAdvance && (
            <button
              type="button"
              onClick={() => onAdvance(lead)}
              className="text-[10px] text-[#7c3aed] hover:text-[#a78bfa] px-1.5 py-0.5 rounded hover:bg-[#7c3aed1a] transition-colors"
              aria-label={`Avancar lead ${lead.name}`}
            >
              →
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(lead)}
            className="p-0.5 text-[#3a3a3a] hover:text-[#888888] transition-colors"
            aria-label={`Editar lead ${lead.name}`}
          >
            <Pencil size={11} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(lead.id)}
            className="p-0.5 text-[#3a3a3a] hover:text-[#ef4444] transition-colors"
            aria-label={`Excluir lead ${lead.name}`}
          >
            <Trash2 size={11} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}
