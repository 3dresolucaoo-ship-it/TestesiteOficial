'use client'

/**
 * ProductCard — card de vista técnica de produto.
 *
 * Exibe especificações de impressão, breakdown de custo e histórico de pedidos.
 * Extraído de app/products/page.tsx em 2026-05-19 (refactor Felipe).
 */

import { useState } from 'react'
import { Pencil, Trash2, MoreHorizontal, Package, Flame, Clock } from 'lucide-react'
import type { Product, InventoryItem } from '@/lib/types'
import { calcUnitCost } from '@/core/analytics/productionEngine'
import { fmt, fmtPct } from './helpers'

interface ProductCardProps {
  product:      Product
  projectName:  string
  filamentItem: InventoryItem | undefined
  orderCount:   number
  totalRevenue: number
  totalProfit:  number
  avgMargin:    number
  onEdit:       () => void
  onDelete:     () => void
}

export function ProductCard({
  product,
  projectName,
  filamentItem,
  orderCount,
  totalRevenue,
  totalProfit,
  avgMargin,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const breakdown = calcUnitCost(product, filamentItem ? [filamentItem] : [])
  const unitMargin = product.salePrice > 0
    ? ((product.salePrice - breakdown.totalCost) / product.salePrice) * 100
    : 0

  const marginColor =
    unitMargin >= 50 ? 'text-[#10b981]' :
    unitMargin >= 30 ? 'text-[#a78bfa]' :
    unitMargin >= 10 ? 'text-[#f59e0b]' : 'text-[#ef4444]'

  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden group hover:border-[#3a3a3a] transition-colors">
      {/* Imagem do produto */}
      {product.imageUrl && (
        <div className="h-32 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5">
        {/* Cabecalho */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#7c3aed1a] text-[#a78bfa] border border-[#7c3aed33]">
                {projectName}
              </span>
            </div>
            <h3 className="text-[#ebebeb] font-semibold text-sm leading-snug">{product.name}</h3>
            {product.notes && (
              <p className="text-[#3a3a3a] text-xs mt-0.5 truncate">{product.notes}</p>
            )}
          </div>

          <div className="relative shrink-0 ml-2">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="p-1 text-[#555555] hover:text-[#ebebeb] transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Opções do produto"
              aria-expanded={menuOpen}
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

        {/* Especificacoes de impressao */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: Package, label: `${product.materialGrams}g`,                          sub: 'material' },
            { icon: Clock,   label: `${product.printTimeHours}h`,                          sub: 'impressao' },
            { icon: Flame,   label: `${(product.failureRate * 100).toFixed(0)}%`,           sub: 'falha' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={sub} className="bg-[#0f0f0f] rounded-lg p-2.5 text-center">
              <Icon size={12} className="text-[#555555] mx-auto mb-1" aria-hidden="true" />
              <p className="text-[#ebebeb] text-sm font-semibold">{label}</p>
              <p className="text-[#3a3a3a] text-[10px]">{sub}</p>
            </div>
          ))}
        </div>

        {/* Breakdown de custo */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-[#555555] text-xs">Material + Energia + Falha</span>
            <span className="text-[#ebebeb] text-xs font-semibold">{fmt(breakdown.totalCost)}</span>
          </div>
          {product.salePrice > 0 && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-[#555555] text-xs">Preco de Venda</span>
                <span className="text-[#ebebeb] text-xs">{fmt(product.salePrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#888888] text-xs font-medium">Margem por Peca</span>
                <span className={`text-sm font-bold ${marginColor}`}>{fmtPct(unitMargin)}</span>
              </div>
            </>
          )}
          {filamentItem && (
            <p className="text-[#3a3a3a] text-[10px]">
              Filamento: {filamentItem.name}
            </p>
          )}
        </div>

        {/* Historico de pedidos */}
        {orderCount > 0 && (
          <div className="border-t border-[#1c1c1c] pt-3 grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-[#ebebeb] text-sm font-bold">{orderCount}</p>
              <p className="text-[#555555] text-[10px]">pedidos</p>
            </div>
            <div className="text-center">
              <p className="text-[#10b981] text-sm font-bold">{fmt(totalRevenue)}</p>
              <p className="text-[#555555] text-[10px]">receita</p>
            </div>
            <div className="text-center">
              <p className={`text-sm font-bold ${totalProfit >= 0 ? 'text-[#a78bfa]' : 'text-[#ef4444]'}`}>
                {fmtPct(avgMargin)}
              </p>
              <p className="text-[#555555] text-[10px]">margem real</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
