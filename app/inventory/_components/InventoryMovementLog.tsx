'use client'

/**
 * InventoryMovementLog — histórico collapsível de movimentações de estoque.
 * Responsivo: cards no mobile, tabela no desktop.
 * Extraído de app/inventory/page.tsx em 2026-05-19 (refactor Felipe).
 */

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { StockMovement } from '@/lib/types'
import { MOVEMENT_REASON_LABELS } from '@/lib/types'
import { parseDate } from './helpers'

interface InventoryMovementLogProps {
  movements:   StockMovement[]
  itemName:    (id: string) => string
  projectName: (id: string) => string
}

export function InventoryMovementLog({
  movements,
  itemName,
  projectName,
}: InventoryMovementLogProps) {
  const [showLog, setShowLog] = useState(false)

  if (movements.length === 0) return null

  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
      <button
        onClick={() => setShowLog(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors"
        aria-expanded={showLog}
        aria-controls="movement-log-content"
      >
        <p className="text-[#ebebeb] text-sm font-medium">
          Histórico de Movimentações{' '}
          <span className="text-[#555555] font-normal">({movements.length})</span>
        </p>
        <ChevronDown
          size={15}
          className={`text-[#555555] transition-transform ${showLog ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {showLog && (
        <div id="movement-log-content">
          {/* Cards mobile */}
          <div className="sm:hidden divide-y divide-[#1c1c1c]">
            {movements.slice(0, 30).map(m => (
              <div key={m.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[#ebebeb] text-sm truncate">{itemName(m.itemId)}</p>
                    <p className="text-[#555555] text-xs mt-0.5">
                      {parseDate(m.date).toLocaleDateString('pt-BR')} ·{' '}
                      {MOVEMENT_REASON_LABELS[m.reason]}
                    </p>
                    {m.notes && <p className="text-[#3a3a3a] text-xs mt-0.5">{m.notes}</p>}
                  </div>
                  <span
                    className={`text-sm font-bold tabular-nums shrink-0 ${
                      m.type === 'in' ? 'text-[#10b981]' : 'text-[#ef4444]'
                    }`}
                  >
                    {m.type === 'in' ? '+' : '−'}{m.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Tabela desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  {['Data', 'Item', 'Motivo', 'Projeto', 'Qtd', 'Notas'].map(h => (
                    <th
                      key={h}
                      scope="col"
                      className="text-left px-4 py-2.5 text-[#555555] text-xs font-medium uppercase tracking-wide first:pl-5 last:pr-5"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movements.slice(0, 50).map(m => (
                  <tr
                    key={m.id}
                    className="border-b border-[#1c1c1c] last:border-0 hover:bg-[#1a1a1a] transition-colors"
                  >
                    <td className="px-5 py-3 text-[#888888] text-xs whitespace-nowrap">
                      {parseDate(m.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-[#ebebeb] text-sm max-w-[160px] truncate">
                      {itemName(m.itemId)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[#555555] text-xs">
                        {MOVEMENT_REASON_LABELS[m.reason]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#555555] text-xs">
                      {projectName(m.projectId)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          m.type === 'in' ? 'text-[#10b981]' : 'text-[#ef4444]'
                        }`}
                      >
                        {m.type === 'in' ? '+' : '−'}{m.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 pr-5 text-[#555555] text-xs max-w-[200px] truncate">
                      {m.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {movements.length > 50 && (
            <div className="px-5 py-3 border-t border-[#1c1c1c]">
              <p className="text-[#555555] text-xs">
                {movements.length - 50} movimentações anteriores não exibidas.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
