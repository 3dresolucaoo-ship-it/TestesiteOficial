/**
 * app/crm/_components/helpers.ts
 * Constantes de cor e helpers de formatacao compartilhados entre os sub-componentes de CRM.
 * Zero importacoes React — puro TS.
 */

import type { LeadStatus } from '@/lib/types'

// ---------------------------------------------------------------------------
// Cores de status por LeadStatus
// ---------------------------------------------------------------------------

export const STATUS_BADGE_CLASS: Record<LeadStatus, string> = {
  new:         'text-[#888888] bg-[#88888818] border-[#88888833]',
  contacted:   'text-[#3b82f6] bg-[#3b82f61a] border-[#3b82f633]',
  negotiating: 'text-[#f59e0b] bg-[#f59e0b1a] border-[#f59e0b33]',
  won:         'text-[#10b981] bg-[#10b9811a] border-[#10b98133]',
  lost:        'text-[#ef4444] bg-[#ef44441a] border-[#ef444433]',
}

export const STAGE_DOT_COLOR: Record<LeadStatus, string> = {
  new:         '#888888',
  contacted:   '#3b82f6',
  negotiating: '#f59e0b',
  won:         '#10b981',
  lost:        '#ef4444',
}

// ---------------------------------------------------------------------------
// Helpers de formatacao
// ---------------------------------------------------------------------------

/** Formata valor em R$ sem centavos. Ex: 1200 → "R$ 1.200" */
export function fmtBRL(n: number): string {
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

/** Formata data ISO como dd/mm/aaaa. */
export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR')
}

// ---------------------------------------------------------------------------
// Tipo do formulario de lead (usado em LeadForm)
// ---------------------------------------------------------------------------

export type LeadFormData = {
  projectId: string
  name:      string
  contact:   string
  source:    import('@/lib/types').ContactSource
  status:    LeadStatus
  value:     string
  notes:     string
  date:      string
}
