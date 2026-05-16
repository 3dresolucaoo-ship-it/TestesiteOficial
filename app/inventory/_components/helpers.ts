/**
 * Helpers compartilhados pelos componentes de inventory.
 * Extraído de app/inventory/page.tsx em 2026-05-16.
 *
 * Diego (2026-05-16): CAT_COLORS remapeado pra paleta marca v2.
 *   filament (era roxo BANIDO) → petrol-500
 *   product → green (mantido - cor de "vendável")
 *   equipment (era azul corporate) → ember (autoridade dourada)
 *   other → fog/neutro
 */

import type { InventoryCategory } from '@/lib/types'

export function fmt(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function fmtShort(v: number) {
  if (Math.abs(v) >= 1000)
    return `R$ ${(v / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}k`
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

/** Profit potential for a single item: (salePrice - costPrice) × quantity. */
export function itemProfit(i: { salePrice: number; costPrice: number; quantity: number }): number {
  return (i.salePrice - i.costPrice) * i.quantity
}

/** Parse YYYY-MM-DD as local date — avoids UTC→timezone shift. */
export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// CAT_COLORS migrado pra paleta marca v2 (Diego audit 2026-05-16)
export const CAT_COLORS: Record<InventoryCategory, { badge: string; bar: string }> = {
  filament:  { badge: 'text-[hsl(173_30%_57%)] bg-[hsl(173_58%_28%/0.15)] border-[hsl(173_58%_28%/0.35)]', bar: 'bg-[hsl(173_58%_28%)]' },
  product:   { badge: 'text-[#10b981] bg-[#10b9811a] border-[#10b98133]', bar: 'bg-[#10b981]' },
  equipment: { badge: 'text-[hsl(28_60%_55%)] bg-[hsl(28_60%_55%/0.15)] border-[hsl(28_60%_55%/0.35)]', bar: 'bg-[hsl(28_60%_55%)]' },
  other:     { badge: 'text-[#888888] bg-[#88888818] border-[#88888833]', bar: 'bg-[#888888]' },
}
