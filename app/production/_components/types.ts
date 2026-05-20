/**
 * types.ts — Tipos locais do modulo Production.
 *
 * Importa os tipos canonicos de @/lib/types e reexporta o FormData
 * exclusivo do modulo (nao e um tipo global — fica aqui).
 *
 * Convencoes: TypeScript estrito, zero any.
 */

import type { PrinterName, ProductionStatus, ProductionItem } from '@/lib/types'

export type { PrinterName, ProductionStatus, ProductionItem }

/** Payload do formulario de criacao/edicao de item de producao. */
export type ProductionFormData = {
  clientName:     string
  item:           string
  printer:        PrinterName
  status:         ProductionStatus
  estimatedHours: string
  priority:       string
  orderId:        string
}
