/**
 * helpers.ts — Constantes e formatters do modulo Production.
 *
 * Extraido de app/production/page.tsx (2026-05-20).
 * Zero dependencias React — puro TS, testavel isoladamente.
 *
 * Convencoes: zero any, zero em-dash em strings de UI.
 */

import type { PrinterName, ProductionStatus } from './types'

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

export const STATUS_CONFIG: Record<
  ProductionStatus,
  { label: string; color: string; dot: string }
> = {
  waiting:  {
    label: 'Aguardando',
    color: 'text-[#f59e0b] bg-[#f59e0b1a] border-[#f59e0b33]',
    dot:   'bg-[#f59e0b]',
  },
  printing: {
    label: 'Imprimindo',
    color: 'text-[#3b82f6] bg-[#3b82f61a] border-[#3b82f633]',
    dot:   'bg-[#3b82f6] animate-pulse',
  },
  done: {
    label: 'Finalizado',
    color: 'text-[#10b981] bg-[#10b9811a] border-[#10b98133]',
    dot:   'bg-[#10b981]',
  },
}

// ---------------------------------------------------------------------------
// Printer config
// ---------------------------------------------------------------------------

export const PRINTER_CONFIG: Record<
  PrinterName,
  { label: string; accent: string }
> = {
  bambu:      { label: 'Bambu Lab',  accent: '#10b981' },
  flashforge: { label: 'Flashforge', accent: '#3b82f6' },
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

/** Formata segundos como "1h 04:32" ou "04:32". */
export function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}h ${mm}:${ss}` : `${mm}:${ss}`
}

/** Formata horas decimais como "2h 30min". */
export function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

/** Formata valor monetario BRL sem casas decimais. */
export function fmtBRL(n: number): string {
  return `R$ ${Math.round(n)}`
}
