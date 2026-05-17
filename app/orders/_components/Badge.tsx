import type { OrderStatus } from '@/lib/types'
import { ORDER_STATUS_CONFIG } from './helpers'

/**
 * Pill com status do pedido (Lead / Orçamento / Pago / Entregue).
 * Extraído de app/orders/page.tsx em 2026-05-16.
 */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, color } = ORDER_STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${color}`}>
      {label}
    </span>
  )
}
