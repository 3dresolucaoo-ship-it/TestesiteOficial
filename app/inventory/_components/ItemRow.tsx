'use client'

/**
 * ItemRow — linha de listagem do inventário.
 *
 * Extraído de app/inventory/page.tsx em 2026-05-16 (Felipe + Diego).
 * Paleta corrigida: margem "boa-mas-não-ótima" #a78bfa (lilás banido) → petrol-300.
 */

import { useState } from 'react'
import { Pencil, Trash2, MoreHorizontal, AlertTriangle } from 'lucide-react'
import type { InventoryItem } from '@/lib/types'
import { CatBadge } from './CatBadge'
import { fmt, fmtShort, itemProfit } from './helpers'

interface ItemRowProps {
  item: InventoryItem
  projectName: string
  onEdit: () => void
  onDelete: () => void
  onMovement: (type: 'in' | 'out') => void
  onQuickAdjust: (delta: number) => void
}

export function ItemRow({
  item,
  projectName,
  onEdit,
  onDelete,
  onMovement,
  onQuickAdjust,
}: ItemRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isLow = item.quantity <= (item.minStock ?? 2)
  const margin =
    item.salePrice > 0 && item.costPrice > 0
      ? ((item.salePrice - item.costPrice) / item.salePrice) * 100
      : null
  const profitPotential = item.salePrice > 0 && item.costPrice > 0
    ? itemProfit(item)
    : null

  return (
    <div
      className={`bg-[#141414] border rounded-xl p-4 group hover:border-[#3a3a3a] transition-colors ${
        isLow ? 'border-[#f59e0b33]' : 'border-[#2a2a2a]'
      }`}
    >
      {/* Mobile layout */}
      <div className="flex items-start gap-3 sm:hidden">
        {item.imageUrl && (
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#2a2a2a] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <CatBadge cat={item.category} />
            {isLow && (
              <span className="text-[#f59e0b] text-xs flex items-center gap-1">
                <AlertTriangle size={10} /> Baixo
              </span>
            )}
          </div>
          <p className="text-[#ebebeb] text-sm font-medium">{item.name}</p>
          <p className="text-[#555555] text-xs mt-0.5">{projectName}</p>
          {item.costPrice > 0 && (
            <p className="text-[#555555] text-xs mt-0.5">Custo {fmt(item.costPrice)}</p>
          )}
          {profitPotential !== null && (
            <p className={`text-xs font-medium mt-0.5 ${
              profitPotential >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
            }`}>
              Lucro: {fmtShort(profitPotential)}
              {margin !== null && (
                <span className="text-[#555555] font-normal ml-1">({margin.toFixed(0)}%)</span>
              )}
            </p>
          )}
        </div>
        {/* Quantity + controls */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`text-lg font-bold tabular-nums ${isLow ? 'text-[#f59e0b]' : 'text-[#ebebeb]'}`}>
            {item.quantity}
            <span className="text-[#555555] text-xs font-normal ml-0.5">{item.unit}</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onQuickAdjust(-1)}
              className="w-7 h-7 rounded-lg bg-[#1c1c1c] hover:bg-[#2a2a2a] text-[#888888] hover:text-[#ebebeb] text-sm transition-colors flex items-center justify-center"
            >−</button>
            <button
              onClick={() => onQuickAdjust(1)}
              className="w-7 h-7 rounded-lg bg-[#1c1c1c] hover:bg-[#2a2a2a] text-[#888888] hover:text-[#ebebeb] text-sm transition-colors flex items-center justify-center"
            >+</button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1 text-[#555555] hover:text-[#888888] transition-colors"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-[#555555] hover:text-[#ef4444] transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:flex items-center gap-4">
        {item.imageUrl && (
          <div className="w-11 h-11 rounded-lg overflow-hidden border border-[#2a2a2a] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <CatBadge cat={item.category} />
            {isLow && (
              <span className="text-[#f59e0b] text-xs flex items-center gap-1">
                <AlertTriangle size={10} /> Baixo
              </span>
            )}
            {item.sku && <span className="text-[#3a3a3a] text-xs">{item.sku}</span>}
          </div>
          <p className="text-[#ebebeb] text-sm font-medium">{item.name}</p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-[#3a3a3a] text-xs">{projectName}</span>
            {item.costPrice > 0 && (
              <span className="text-[#555555] text-xs">Custo {fmt(item.costPrice)}</span>
            )}
            {item.salePrice > 0 && (
              <span className="text-[#555555] text-xs">Venda {fmt(item.salePrice)}</span>
            )}
            {margin !== null && (
              <span
                className={`text-xs font-medium ${
                  margin >= 40 ? 'text-[#10b981]' : margin >= 20 ? 'text-[hsl(173_30%_57%)]' : 'text-[#f59e0b]'
                }`}
              >
                {margin.toFixed(0)}% margem
              </span>
            )}
            {profitPotential !== null && (
              <span className={`text-xs ${profitPotential >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                lucro: {fmtShort(profitPotential)}
              </span>
            )}
            {item.notes && (
              <span className="text-[#3a3a3a] text-xs truncate max-w-[180px]">{item.notes}</span>
            )}
          </div>
        </div>

        {/* Entrada / Saída quick buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onMovement('in')}
            className="px-2 py-1 rounded-lg text-xs text-[#10b981] hover:bg-[#10b9811a] border border-transparent hover:border-[#10b98122] transition-colors"
          >
            + Entrada
          </button>
          <button
            onClick={() => onMovement('out')}
            className="px-2 py-1 rounded-lg text-xs text-[#ef4444] hover:bg-[#ef44441a] border border-transparent hover:border-[#ef444422] transition-colors"
          >
            − Saída
          </button>
        </div>

        {/* ± quick adjust */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onQuickAdjust(-1)}
            className="w-7 h-7 rounded-lg bg-[#1c1c1c] hover:bg-[#2a2a2a] text-[#888888] hover:text-[#ebebeb] text-sm transition-colors flex items-center justify-center"
          >−</button>
          <span
            className={`text-sm font-bold w-12 text-center tabular-nums ${isLow ? 'text-[#f59e0b]' : 'text-[#ebebeb]'}`}
          >
            {item.quantity}
            {item.unit !== 'un' && (
              <span className="text-[#555555] text-xs font-normal ml-0.5">{item.unit}</span>
            )}
          </span>
          <button
            onClick={() => onQuickAdjust(1)}
            className="w-7 h-7 rounded-lg bg-[#1c1c1c] hover:bg-[#2a2a2a] text-[#888888] hover:text-[#ebebeb] text-sm transition-colors flex items-center justify-center"
          >+</button>
        </div>

        {/* Context menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="p-1 text-[#555555] hover:text-[#ebebeb] transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg shadow-xl z-10 w-36 overflow-hidden">
              <button
                onClick={() => { onEdit(); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#888888] hover:text-[#ebebeb] hover:bg-[#2a2a2a] transition-colors"
              >
                <Pencil size={13} /> Editar
              </button>
              <button
                onClick={() => { onDelete(); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef44441a] transition-colors"
              >
                <Trash2 size={13} /> Excluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
