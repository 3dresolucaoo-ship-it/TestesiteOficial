'use client'

/**
 * ProductBestWorst — bloco de ranking mais/menos rentavel.
 *
 * Exibe os dois extremos da lista de produtos com historico de pedidos.
 * Renderiza apenas quando ha 2 ou mais produtos com dados.
 * Extraído de app/products/page.tsx em 2026-05-19 (refactor Felipe).
 */

import { fmtPct } from './helpers'
import type { ProductStats } from '@/core/analytics/productionEngine'

interface ProductBestWorstProps {
  stats: ProductStats[]
}

export function ProductBestWorst({ stats }: ProductBestWorstProps) {
  if (stats.length < 2) return null

  const items = [
    { stat: stats[0],                label: 'Mais Rentavel',  borderColor: 'border-[#10b98133]' },
    { stat: stats[stats.length - 1], label: 'Menos Rentavel', borderColor: 'border-[#ef444433]' },
  ]

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {items.map(({ stat, label, borderColor }) => (
        <div
          key={stat.product.id}
          className={`bg-[#141414] border ${borderColor} rounded-xl px-4 py-3`}
        >
          <p className="text-[#555555] text-xs mb-1">{label}</p>
          <p className="text-[#ebebeb] text-sm font-semibold">{stat.product.name}</p>
          <p className="text-[#555555] text-xs mt-0.5">
            {stat.orderCount} pedido(s) · margem real {fmtPct(stat.avgMargin)}
          </p>
        </div>
      ))}
    </div>
  )
}
