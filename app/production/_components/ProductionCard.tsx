'use client'

/**
 * ProductionCard.tsx — Card de item de producao em andamento.
 *
 * Extraido de app/production/page.tsx (2026-05-20).
 * Renderiza tanto a versao mobile (stacked) quanto desktop (row).
 * Variant controlado via prop `variant`.
 *
 * Convencoes: zero any, TypeScript estrito, a11y aria-labels.
 */

import {
  Pencil, Trash2, MoreHorizontal, Clock, Activity, CheckCircle2, GripVertical,
} from 'lucide-react'
import type { ProductionItem, ProductionStatus }    from './types'
import { PRINTER_CONFIG }                           from './helpers'
import { StatusBadge }                              from './StatusBadge'

// ---------------------------------------------------------------------------
// Card mobile
// ---------------------------------------------------------------------------

interface ProductionCardMobileProps {
  item:           ProductionItem
  projectLabel?:  string
  onChangeStatus: (item: ProductionItem, status: ProductionStatus) => void
  onEdit:         (item: ProductionItem) => void
  onDelete:       (id: string) => void
}

export function ProductionCardMobile({
  item,
  projectLabel,
  onChangeStatus,
  onEdit,
  onDelete,
}: ProductionCardMobileProps) {
  const { accent, label: printerLabel } = PRINTER_CONFIG[item.printer]

  return (
    <div
      className="bg-[rgba(255,255,255,0.025)] border rounded-xl p-4"
      style={{
        borderColor:
          item.status === 'printing' ? `${accent}44` : 'rgba(255,255,255,0.07)',
      }}
      aria-label={`Item: ${item.item}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-[#f0f0f5] text-sm font-medium">{item.item}</p>
          {item.clientName && (
            <p className="text-[#555566] text-xs mt-0.5">{item.clientName}</p>
          )}
        </div>
        <StatusBadge status={item.status} />
      </div>

      <div className="flex items-center gap-3 text-xs text-[#555566]">
        <span style={{ color: accent }}>{printerLabel}</span>
        <span aria-hidden="true">·</span>
        <Clock size={10} aria-hidden="true" />
        <span>{item.estimatedHours}h</span>
        {projectLabel && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-[#444455]">{projectLabel}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)]">
        {item.status === 'waiting' && (
          <button
            type="button"
            onClick={() => onChangeStatus(item, 'printing')}
            className="flex-1 py-2 rounded-lg bg-[#3b82f61a] text-[#3b82f6] text-xs font-medium hover:bg-[#3b82f633] transition-colors"
            aria-label={`Iniciar impressao de ${item.item}`}
          >
            Iniciar
          </button>
        )}
        {item.status === 'printing' && (
          <button
            type="button"
            onClick={() => onChangeStatus(item, 'done')}
            className="flex-1 py-2 rounded-lg bg-[#10b9811a] text-[#10b981] text-xs font-medium hover:bg-[#10b98133] transition-colors"
            aria-label={`Finalizar impressao de ${item.item}`}
          >
            Finalizar
          </button>
        )}
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="p-2 text-[#555566] hover:text-[#f0f0f5] rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-colors"
          aria-label={`Editar item ${item.item}`}
        >
          <Pencil size={13} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="p-2 text-[#555566] hover:text-[#ef4444] rounded-lg hover:bg-[#ef44441a] transition-colors"
          aria-label={`Remover item ${item.item}`}
        >
          <Trash2 size={13} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Row desktop
// ---------------------------------------------------------------------------

interface ProductionCardDesktopProps {
  item:           ProductionItem
  projectLabel?:  string
  menuOpen:       string | null
  onMenuToggle:   (id: string) => void
  onChangeStatus: (item: ProductionItem, status: ProductionStatus) => void
  onEdit:         (item: ProductionItem) => void
  onDelete:       (id: string) => void
}

export function ProductionCardDesktop({
  item,
  projectLabel,
  menuOpen,
  onMenuToggle,
  onChangeStatus,
  onEdit,
  onDelete,
}: ProductionCardDesktopProps) {
  const { accent, label: printerLabel } = PRINTER_CONFIG[item.printer]
  const isMenuOpen = menuOpen === item.id

  return (
    <div
      className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 flex items-center gap-4 group hover:border-[rgba(255,255,255,0.12)] transition-all"
      style={{
        borderColor:
          item.status === 'printing' ? `${accent}44` : undefined,
      }}
      aria-label={`Item: ${item.item}`}
    >
      <div className="text-[#3a3a4a]" aria-hidden="true">
        <GripVertical size={16} />
      </div>

      {/* Badge de prioridade */}
      <div
        className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#555566] text-xs font-bold shrink-0"
        aria-label={`Prioridade ${item.priority}`}
      >
        {item.priority}
      </div>

      {/* Info principal */}
      <div className="flex-1 min-w-0">
        <p className="text-[#f0f0f5] text-sm font-medium">{item.item}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span style={{ color: accent }} className="text-xs">
            {printerLabel}
          </span>
          <span className="text-[#3a3a4a]" aria-hidden="true">·</span>
          <Clock size={10} className="text-[#555566]" aria-hidden="true" />
          <span className="text-[#555566] text-xs">{item.estimatedHours}h</span>
          {item.clientName && (
            <>
              <span className="text-[#3a3a4a]" aria-hidden="true">·</span>
              <span className="text-[#555566] text-xs">{item.clientName}</span>
            </>
          )}
          {projectLabel && (
            <>
              <span className="text-[#3a3a4a]" aria-hidden="true">·</span>
              <span className="text-[#555566] text-xs">{projectLabel}</span>
            </>
          )}
        </div>
      </div>

      <StatusBadge status={item.status} />

      {/* Menu de acoes */}
      <div className="relative">
        <button
          type="button"
          onClick={() => onMenuToggle(item.id)}
          className="p-1.5 text-[#555566] hover:text-[#f0f0f5] transition-colors rounded-lg hover:bg-[rgba(255,255,255,0.06)]"
          aria-label={`Abrir acoes de ${item.item}`}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
        >
          <MoreHorizontal size={15} aria-hidden="true" />
        </button>

        {isMenuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-8 bg-[#0d0d12] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl z-10 w-44 overflow-hidden"
          >
            {item.status !== 'printing' && (
              <button
                type="button"
                role="menuitem"
                onClick={() => onChangeStatus(item, 'printing')}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#3b82f6] hover:bg-[#3b82f61a] transition-colors"
                aria-label={`Iniciar impressao de ${item.item}`}
              >
                <Activity size={13} aria-hidden="true" /> Iniciar Impressao
              </button>
            )}
            {item.status !== 'done' && (
              <button
                type="button"
                role="menuitem"
                onClick={() => onChangeStatus(item, 'done')}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#10b981] hover:bg-[#10b9811a] transition-colors"
                aria-label={`Finalizar ${item.item}`}
              >
                <CheckCircle2 size={13} aria-hidden="true" /> Finalizado
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={() => onEdit(item)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#8888a0] hover:text-[#f0f0f5] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
              aria-label={`Editar ${item.item}`}
            >
              <Pencil size={13} aria-hidden="true" /> Editar
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => onDelete(item.id)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef44441a] transition-colors"
              aria-label={`Remover ${item.item}`}
            >
              <Trash2 size={13} aria-hidden="true" /> Remover
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
