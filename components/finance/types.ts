'use client'

import type { TransactionType, TransactionCategory } from '@/lib/types'
import { INCOME_CATEGORY_LABELS, EXPENSE_CATEGORY_LABELS } from '@/lib/types'

// ─── Tab type ─────────────────────────────────────────────────────────────────

export type FinanceTab = 'overview' | 'breakeven'

// ─── Transaction form data ────────────────────────────────────────────────────

export type FormData = {
  projectId:   string
  type:        TransactionType
  category:    TransactionCategory
  description: string
  value:       string
  date:        string
  source:      string
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export const ALL_LABELS = { ...INCOME_CATEGORY_LABELS, ...EXPENSE_CATEGORY_LABELS }

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function fmt(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// ─── Legacy localStorage keys (migração Onda 2 → Onda 3) ─────────────────────

export const LEGACY_STORAGE_FIXED_COST  = 'bvaz.finance.fixedCost'
export const LEGACY_STORAGE_PROFIT_GOAL = 'bvaz.finance.profitGoal'
