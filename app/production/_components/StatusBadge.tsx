'use client'

/**
 * StatusBadge.tsx — Badge de status de producao.
 *
 * Extraido de app/production/page.tsx (2026-05-20).
 * Sem estado proprio, puramente presentacional.
 */

import { STATUS_CONFIG } from './helpers'
import type { ProductionStatus } from './types'

interface StatusBadgeProps {
  status: ProductionStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, color } = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${color}`}
      aria-label={`Status: ${label}`}
    >
      {label}
    </span>
  )
}
