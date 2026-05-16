'use client'

/**
 * ItemCard — card grid ecommerce-style do inventário.
 *
 * Extraído de app/inventory/page.tsx em 2026-05-16 (Felipe + Diego).
 */

import { Pencil, Trash2, Package, AlertTriangle } from 'lucide-react'
import type { InventoryItem } from '@/lib/types'
import { CatBadge } from './CatBadge'
import { fmt } from './helpers'

interface ItemCardProps {
  item: InventoryItem
  projectName: string
  onEdit: () => void
  onDelete: () => void
  onMovement: (type: 'in' | 'out') => void
  onQuickAdjust: (delta: number) => void
}

export function ItemCard({
  item,
  projectName,
  onEdit,
  onDelete,
  onMovement,
  onQuickAdjust,
}: ItemCardProps) {
  const isLow = item.quantity <= (item.minStock ?? 2)
  const isOut = item.quantity <= 0
  const margin =
    item.salePrice > 0 && item.costPrice > 0
      ? ((item.salePrice - item.costPrice) / item.salePrice) * 100
      : null

  return (
    <div
      className="group relative rounded-2xl overflow-hidden border transition-all"
      style={{
        background: 'var(--t-card-from)',
        borderColor: isLow ? 'rgba(245,158,11,0.35)' : 'var(--t-card-border)',
        boxShadow: 'var(--t-card-shadow)',
      }}
    >
      {/* Image area */}
      <div
        className="relative aspect-square overflow-hidden"
        style={{ background: 'var(--t-hover)' }}
      >
        {item.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ color: 'var(--t-text-muted)' }}
          >
            <Package size={40} />
          </div>
        )}

        {/* Top-left: category */}
        <div className="absolute top-2 left-2">
          <CatBadge cat={item.category} />
        </div>

        {/* Top-right: status */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {isOut ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#ef4444] text-white">
              ESGOTADO
            </span>
          ) : isLow ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#f59e0b] text-white flex items-center gap-1">
              <AlertTriangle size={10} /> BAIXO
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#10b981] text-white">
              OK
            </span>
          )}
        </div>

        {/* Hover quick actions */}
        <div className="absolute inset-x-0 bottom-0 p-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/70 to-transparent">
          <button
            onClick={() => onMovement('in')}
            className="flex-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-[#10b9811a] text-[#10b981] border border-[#10b98133] hover:bg-[#10b98133]"
          >
            + Entrada
          </button>
          <button
            onClick={() => onMovement('out')}
            className="flex-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-[#ef44441a] text-[#ef4444] border border-[#ef444433] hover:bg-[#ef444433]"
          >
            − Saída
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <p
          className="text-sm font-medium truncate"
          style={{ color: 'var(--t-text-primary)' }}
          title={item.name}
        >
          {item.name}
        </p>
        <p className="text-[11px] truncate" style={{ color: 'var(--t-text-muted)' }}>
          {projectName}
        </p>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onQuickAdjust(-1)}
              className="w-6 h-6 rounded-md text-xs flex items-center justify-center border transition-colors"
              style={{ borderColor: 'var(--t-border)', color: 'var(--t-text-secondary)' }}
            >−</button>
            <span
              className="text-sm font-bold tabular-nums min-w-[2.5rem] text-center"
              style={{ color: isLow ? '#f59e0b' : 'var(--t-text-primary)' }}
            >
              {item.quantity}
              <span className="text-[10px] font-normal ml-0.5" style={{ color: 'var(--t-text-muted)' }}>
                {item.unit}
              </span>
            </span>
            <button
              onClick={() => onQuickAdjust(1)}
              className="w-6 h-6 rounded-md text-xs flex items-center justify-center border transition-colors"
              style={{ borderColor: 'var(--t-border)', color: 'var(--t-text-secondary)' }}
            >+</button>
          </div>

          {item.salePrice > 0 && (
            <div className="text-right">
              <p className="text-xs font-semibold" style={{ color: 'var(--t-accent)' }}>
                {fmt(item.salePrice)}
              </p>
              {margin !== null && (
                <p
                  className="text-[10px]"
                  style={{ color: margin >= 40 ? '#10b981' : margin >= 20 ? 'var(--t-accent)' : '#f59e0b' }}
                >
                  {margin.toFixed(0)}% margem
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit/delete — bottom-right of info section */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={onEdit}
          className="p-1 rounded-md bg-black/50 text-white/80 hover:text-white"
          title="Editar"
        >
          <Pencil size={11} />
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded-md bg-black/50 text-white/80 hover:text-[#ef4444]"
          title="Excluir"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  )
}
