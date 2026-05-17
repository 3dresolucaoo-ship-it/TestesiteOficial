import type { OrderStatus, OrderOrigin } from '@/lib/types'

/**
 * Configs compartilhadas do módulo Orders.
 *
 * Extraído de app/orders/page.tsx em 2026-05-16 (refactor orders).
 * Mesma estratégia que reduziu inventory -32% e products -45%.
 *
 * Quando trocar paleta legada (roxo #7c3aed → petrol-500), atualizar aqui.
 */

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  lead:        { label: 'Lead',       color: 'text-[#888888] bg-[#88888818] border-[#88888833]' },
  quote_sent:  { label: 'Orçamento',  color: 'text-[#f59e0b] bg-[#f59e0b1a] border-[#f59e0b33]' },
  paid:        { label: 'Pago',       color: 'text-[#10b981] bg-[#10b9811a] border-[#10b98133]' },
  delivered:   { label: 'Entregue',   color: 'text-[#a78bfa] bg-[#7c3aed1a] border-[#7c3aed33]' },
}

export const ORDER_ORIGIN_LABELS: Record<OrderOrigin, string> = {
  whatsapp:  'WhatsApp',
  instagram: 'Instagram',
  facebook:  'Facebook',
  other:     'Outro',
}

export const ORDER_ORIGIN_COLORS: Record<OrderOrigin, string> = {
  whatsapp:  'text-[#10b981]',
  instagram: 'text-[#f59e0b]',
  facebook:  'text-[#3b82f6]',
  other:     'text-[#888888]',
}

// Tipo do form compartilhado entre OrderForm e page.tsx (handlers de save).
export type OrderFormData = {
  projectId:       string
  clientName:      string
  origin:          OrderOrigin
  item:            string
  value:           string
  status:          OrderStatus
  date:            string
  inventoryItemId: string
  qtyUsed:         string
  productId:       string  // product template (optional)
}
