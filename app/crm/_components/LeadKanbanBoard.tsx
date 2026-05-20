'use client'

/**
 * app/crm/_components/LeadKanbanBoard.tsx
 * Kanban de leads agrupados por status.
 * Mobile: overflow-x-auto com colunas de 256px (scroll horizontal).
 * Desktop (md): cinco colunas em grid horizontal com overflow-x-auto.
 */

import type { Lead, LeadStatus } from '@/lib/types'
import { LEAD_STATUS_LABELS }    from '@/lib/types'
import { LeadCard }              from './LeadCard'
import { STAGE_DOT_COLOR, fmtBRL } from './helpers'

const ADVANCE_ORDER: LeadStatus[] = ['new', 'contacted', 'negotiating', 'won']

interface LeadKanbanBoardProps {
  leads:       Lead[]
  projectName: (id: string) => string
  onEdit:      (l: Lead) => void
  onDelete:    (id: string) => void
  onAdvance:   (l: Lead) => void
}

export function LeadKanbanBoard({ leads, projectName, onEdit, onDelete, onAdvance }: LeadKanbanBoardProps) {
  return (
    <div className="overflow-x-auto pb-2" role="region" aria-label="Kanban de leads">
      {/* min-w-max garante que as colunas nao colapsom em mobile */}
      <div className="flex gap-3 min-w-max">
        {(Object.entries(LEAD_STATUS_LABELS) as [LeadStatus, string][]).map(([status, label]) => {
          const stage      = leads.filter((l) => l.status === status)
          const stageValue = stage.reduce((s, l) => s + l.value, 0)
          const dotColor   = STAGE_DOT_COLOR[status]
          const canAdvance = ADVANCE_ORDER.includes(status) && status !== 'won'

          return (
            <section
              key={status}
              className="w-64 shrink-0"
              aria-label={`Coluna ${label} (${stage.length} leads)`}
            >
              {/* Cabecalho da coluna */}
              <div className="flex items-center justify-between px-3 py-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: dotColor }}
                    aria-hidden="true"
                  />
                  <span className="text-[#ebebeb] text-xs font-medium">{label}</span>
                  <span className="text-[#555555] text-xs" aria-label={`${stage.length} leads`}>
                    {stage.length}
                  </span>
                </div>
                {stageValue > 0 && (
                  <span className="text-[#555555] text-xs">{fmtBRL(stageValue)}</span>
                )}
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {stage.map((l) => (
                  <LeadCard
                    key={l.id}
                    lead={l}
                    projectName={projectName(l.projectId)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAdvance={onAdvance}
                    canAdvance={canAdvance}
                  />
                ))}

                {stage.length === 0 && (
                  <div className="border border-dashed border-[#2a2a2a] rounded-xl p-4 text-center">
                    <p className="text-[#3a3a3a] text-xs">Sem leads</p>
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
