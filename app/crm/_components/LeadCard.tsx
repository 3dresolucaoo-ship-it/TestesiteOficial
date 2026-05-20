'use client'

/**
 * app/crm/_components/LeadCard.tsx
 * Card individual dentro de uma coluna do Kanban de leads.
 * Mobile-first: largura fixa 256px dentro do overflow-x-auto do Kanban.
 */

import { Pencil, Trash2 } from 'lucide-react'
import type { Lead } from '@/lib/types'
import { CONTACT_SOURCE_LABELS } from '@/lib/types'
import { fmtBRL } from './helpers'

interface LeadCardProps {
  lead:        Lead
  projectName: string
  onEdit:      (l: Lead) => void
  onDelete:    (id: string) => void
  onAdvance:   (l: Lead) => void
  canAdvance:  boolean
}

export function LeadCard({ lead, projectName, onEdit, onDelete, onAdvance, canAdvance }: LeadCardProps) {
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

      <div className="flex items-center justify-between">
        {lead.value > 0
          ? <span className="text-[#10b981] text-xs font-medium">{fmtBRL(lead.value)}</span>
          : <span />
        }
        <div className="flex items-center gap-1">
          {canAdvance && (
            <button
              type="button"
              onClick={() => onAdvance(lead)}
              className="text-[10px] text-[#7c3aed] hover:text-[#a78bfa] px-1.5 py-0.5 rounded hover:bg-[#7c3aed1a] transition-colors"
              aria-label={`Avançar lead ${lead.name}`}
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
