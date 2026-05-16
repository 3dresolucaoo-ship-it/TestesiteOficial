'use client'

/**
 * CatalogCard — card visual portfolio-style do produto.
 *
 * Extraído de app/products/page.tsx em 2026-05-16 (Felipe + Diego).
 */

import { Pencil, Trash2, Package, FileText } from 'lucide-react'
import type { Product, InventoryItem } from '@/lib/types'
import { calcUnitCost } from '@/core/analytics/productionEngine'
import { CHECKOUT_MODE_META } from './ProductForm'

function fmt(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function fmtPct(v: number) {
  return `${v.toFixed(1)}%`
}

interface CatalogCardProps {
  product:      Product
  projectName:  string
  filamentItem: InventoryItem | undefined
  onEdit:       () => void
  onDelete:     () => void
  onQuote:      () => void
}

export function CatalogCard({
  product,
  projectName,
  filamentItem,
  onEdit,
  onDelete,
  onQuote,
}: CatalogCardProps) {
  const breakdown = calcUnitCost(product, filamentItem ? [filamentItem] : [])
  const price = product.salePrice > 0
    ? product.salePrice
    : breakdown.totalCost * (1 + (product.marginPercentage ?? 0.3))
  const unitMargin = price > 0
    ? ((price - breakdown.totalCost) / price) * 100
    : 0

  return (
    <div
      className="group relative rounded-2xl overflow-hidden border transition-all"
      style={{
        background: 'var(--t-card-from)',
        borderColor: 'var(--t-card-border)',
        boxShadow: 'var(--t-card-shadow)',
      }}
    >
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{ background: 'var(--t-hover)' }}
      >
        {product.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--t-text-muted)' }}>
            <Package size={44} />
          </div>
        )}

        <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide"
            style={{ background: 'var(--t-accent-soft)', color: 'var(--t-accent)' }}
          >
            {projectName}
          </span>
          {product.checkoutMode && product.checkoutMode !== 'direct' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 text-white/90 border border-white/10">
              {CHECKOUT_MODE_META[product.checkoutMode].label}
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/75 to-transparent">
          <button
            onClick={onQuote}
            className="flex-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-[#10b9811a] text-[#10b981] border border-[#10b98133] hover:bg-[#10b98133]"
          >
            <FileText size={11} className="inline mr-1" /> Orçar
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg bg-black/60 text-white/80 hover:text-white"
            title="Editar"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg bg-black/60 text-white/80 hover:text-[#ef4444]"
            title="Excluir"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-1.5">
        <p
          className="text-sm font-semibold truncate"
          style={{ color: 'var(--t-text-primary)' }}
          title={product.name}
        >
          {product.name}
        </p>
        {product.notes && (
          <p className="text-[11px] truncate" style={{ color: 'var(--t-text-muted)' }}>
            {product.notes}
          </p>
        )}
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-base font-bold" style={{ color: 'var(--t-accent)' }}>
              {fmt(price)}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--t-text-muted)' }}>
              custo {fmt(breakdown.totalCost)}
            </p>
          </div>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
            style={{
              background: 'var(--t-accent-soft)',
              color: unitMargin >= 40 ? '#10b981' : unitMargin >= 20 ? 'var(--t-accent)' : '#f59e0b',
            }}
          >
            {fmtPct(unitMargin)}
          </span>
        </div>
      </div>
    </div>
  )
}
