'use client'

/**
 * app/crm/_components/LeadKanbanBoard.tsx
 *
 * Kanban de leads agrupados por status, com DRAG-AND-DROP estilo Trello.
 * Arrastar card entre colunas chama onStatusChange(lead, novoStatus).
 *
 * Tech: @dnd-kit/core (Pointer + Touch sensors, acessivel por teclado).
 * Mobile: long-press 200ms ativa drag (TouchSensor com delay).
 * Desktop: click + drag direto.
 *
 * Visual feedback durante drag:
 * - Card de origem fica com opacity 0.4 (placeholder)
 * - DragOverlay mostra card flutuando seguindo o ponteiro
 * - Coluna destino fica destacada (ring petrol) quando hover
 */

import { useState }              from 'react'
import {
  DndContext, DragOverlay, PointerSensor, TouchSensor, KeyboardSensor,
  useSensor, useSensors, useDroppable, useDraggable, closestCenter,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core'
import { CSS }                   from '@dnd-kit/utilities'
import type { Lead, LeadStatus } from '@/lib/types'
import { LEAD_STATUS_LABELS }    from '@/lib/types'
import { LeadCard }              from './LeadCard'
import { STAGE_DOT_COLOR, fmtBRL } from './helpers'

const ADVANCE_ORDER: LeadStatus[] = ['new', 'contacted', 'negotiating', 'won']

interface LeadKanbanBoardProps {
  leads:          Lead[]
  projectName:    (id: string) => string
  onEdit:         (l: Lead) => void
  onDelete:       (id: string) => void
  onAdvance:      (l: Lead) => void
  onConvert:      (l: Lead) => void
  /** Chamado quando usuario arrasta card pra outra coluna. */
  onStatusChange: (lead: Lead, newStatus: LeadStatus) => void
}

// ─── Coluna droppable (target do drop) ────────────────────────────────────────

interface DroppableColumnProps {
  status:      LeadStatus
  label:       string
  count:       number
  totalValue:  number
  dotColor:    string
  children:    React.ReactNode
}

function DroppableColumn({ status, label, count, totalValue, dotColor, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `column:${status}` })

  return (
    <section
      ref={setNodeRef}
      className={`w-64 shrink-0 rounded-xl transition-all ${
        isOver
          ? 'bg-[hsl(173_58%_28%_/_0.08)] ring-2 ring-[hsl(173_58%_45%_/_0.6)] ring-inset'
          : ''
      }`}
      aria-label={`Coluna ${label} (${count} leads)`}
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
          <span className="text-[#555555] text-xs" aria-label={`${count} leads`}>
            {count}
          </span>
        </div>
        {totalValue > 0 && (
          <span className="text-[#555555] text-xs">{fmtBRL(totalValue)}</span>
        )}
      </div>

      {/* Cards droppable area */}
      <div className="space-y-2 min-h-[80px] px-1 pb-2">
        {children}
      </div>
    </section>
  )
}

// ─── Card draggable (origem do drag) ──────────────────────────────────────────

interface DraggableLeadCardProps {
  lead:        Lead
  projectName: string
  onEdit:      (l: Lead) => void
  onDelete:    (id: string) => void
  onAdvance:   (l: Lead) => void
  onConvert:   (l: Lead) => void
  canAdvance:  boolean
  isDragging?: boolean
}

function DraggableLeadCard({
  lead, projectName, onEdit, onDelete, onAdvance, onConvert, canAdvance, isDragging,
}: DraggableLeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging: thisIsDragging } = useDraggable({
    id:   `lead:${lead.id}`,
    data: { lead },
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity:   thisIsDragging || isDragging ? 0.4 : 1,
    cursor:    'grab',
    touchAction: 'none', // requerido pra TouchSensor funcionar bem em mobile
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <LeadCard
        lead={lead}
        projectName={projectName}
        onEdit={onEdit}
        onDelete={onDelete}
        onAdvance={onAdvance}
        onConvert={onConvert}
        canAdvance={canAdvance}
      />
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function LeadKanbanBoard({
  leads, projectName, onEdit, onDelete, onAdvance, onConvert, onStatusChange,
}: LeadKanbanBoardProps) {
  // ID do lead atualmente sendo arrastado (pra mostrar no DragOverlay)
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null)
  const activeLead = activeLeadId ? leads.find(l => l.id === activeLeadId) : null

  // Sensors: Pointer pra desktop, Touch com delay pra mobile (evita conflito com scroll), Keyboard pra a11y
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // movimentos < 5px nao iniciam drag (permite clicks)
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 }, // long-press 200ms ativa drag em mobile
    }),
    useSensor(KeyboardSensor),
  )

  function handleDragStart(e: DragStartEvent) {
    const id = String(e.active.id).replace('lead:', '')
    setActiveLeadId(id)
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveLeadId(null)
    if (!e.over) return // soltou fora de qualquer coluna

    const leadId    = String(e.active.id).replace('lead:', '')
    const newStatus = String(e.over.id).replace('column:', '') as LeadStatus

    const lead = leads.find(l => l.id === leadId)
    if (!lead || lead.status === newStatus) return // sem mudanca

    onStatusChange(lead, newStatus)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto pb-2" role="region" aria-label="Kanban de leads (arrasta-e-solta)">
        <div className="flex gap-3 min-w-max">
          {(Object.entries(LEAD_STATUS_LABELS) as [LeadStatus, string][]).map(([status, label]) => {
            const stage      = leads.filter((l) => l.status === status)
            const stageValue = stage.reduce((s, l) => s + l.value, 0)
            const dotColor   = STAGE_DOT_COLOR[status]
            const canAdvance = ADVANCE_ORDER.includes(status) && status !== 'won'

            return (
              <DroppableColumn
                key={status}
                status={status}
                label={label}
                count={stage.length}
                totalValue={stageValue}
                dotColor={dotColor}
              >
                {stage.map((l) => (
                  <DraggableLeadCard
                    key={l.id}
                    lead={l}
                    projectName={projectName(l.projectId)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAdvance={onAdvance}
                    onConvert={onConvert}
                    canAdvance={canAdvance}
                  />
                ))}

                {stage.length === 0 && (
                  <div className="border border-dashed border-[#2a2a2a] rounded-xl p-4 text-center">
                    <p className="text-[#3a3a3a] text-xs">Solta aqui</p>
                  </div>
                )}
              </DroppableColumn>
            )
          })}
        </div>
      </div>

      {/* DragOverlay: card flutuante seguindo o ponteiro durante drag */}
      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeLead ? (
          <div className="cursor-grabbing rotate-2 shadow-2xl">
            <LeadCard
              lead={activeLead}
              projectName={projectName(activeLead.projectId)}
              onEdit={() => {}}
              onDelete={() => {}}
              onAdvance={() => {}}
              onConvert={() => {}}
              canAdvance={false}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
