'use client'

/**
 * useCalcRateLimit — contador diário de cálculos na Calc Grátis.
 *
 * Armazenamento: localStorage (chave `hayzer_calc_count_YYYYMMDD`).
 * Reset automático: chave nova a cada dia (data faz parte da key).
 * Cap padrão: 5 cálculos/dia.
 *
 * Uso:
 *   const { count, cap, remaining, limitReached, increment } = useCalcRateLimit()
 */

import { useCallback, useEffect, useState } from 'react'

const CAP = 5

function todayKey(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `hayzer_calc_count_${yyyy}${mm}${dd}`
}

function readCount(): number {
  if (typeof window === 'undefined') return 0
  const raw = localStorage.getItem(todayKey())
  const n = parseInt(raw ?? '0', 10)
  return isNaN(n) ? 0 : n
}

function writeCount(n: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(todayKey(), String(n))
}

interface UseCalcRateLimitReturn {
  /** Quantos cálculos o user já fez hoje */
  count: number
  /** Limite diário (5) */
  cap: number
  /** Quantos restam (0 se esgotado) */
  remaining: number
  /** true quando count >= cap */
  limitReached: boolean
  /**
   * Incrementa o contador após um cálculo bem-sucedido.
   * Retorna o novo count.
   */
  increment: () => number
}

export function useCalcRateLimit(): UseCalcRateLimitReturn {
  const [count, setCount] = useState<number>(0)

  // Lê do localStorage no mount (client-only)
  useEffect(() => {
    setCount(readCount())
  }, [])

  const increment = useCallback((): number => {
    const current = readCount()
    const next = current + 1
    writeCount(next)
    setCount(next)
    return next
  }, [])

  const remaining = Math.max(0, CAP - count)
  const limitReached = count >= CAP

  return { count, cap: CAP, remaining, limitReached, increment }
}
