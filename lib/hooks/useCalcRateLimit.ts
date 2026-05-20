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

import { useCallback, useSyncExternalStore } from 'react'

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

// useSyncExternalStore é a API oficial do React para sincronizar estado externo
// (localStorage, IndexedDB, window events) sem causar hydration mismatch.
// O terceiro argumento (getServerSnapshot) retorna 0, que é o valor usado no SSR.
// O cliente usa getClientSnapshot, que lê localStorage após a hydration.
// Resultado: SSR=0, primeiro render client=0, re-render após mount=valor real → zero mismatch.
const _listeners = new Set<() => void>()

function _notifyListeners(): void {
  _listeners.forEach(l => l())
}

function _subscribeCount(listener: () => void): () => void {
  _listeners.add(listener)
  return () => { _listeners.delete(listener) }
}

function _getClientSnapshot(): number {
  return readCount()
}

function _getServerSnapshot(): number {
  return 0
}

export function useCalcRateLimit(): UseCalcRateLimitReturn {
  // useSyncExternalStore: SSR snapshot=0, client snapshot=readCount().
  // O React compara SSR snapshot com o valor inicial do cliente durante hydration
  // e usa _getServerSnapshot() como âncora — hydration sempre limpa.
  const count = useSyncExternalStore(
    _subscribeCount,
    _getClientSnapshot,
    _getServerSnapshot,
  )

  const increment = useCallback((): number => {
    const current = readCount()
    // Não incrementa além do cap — evita count infinito no localStorage
    const next = Math.min(current + 1, CAP + 1)
    writeCount(next)
    // Força re-render de todos os consumidores do store externo
    _notifyListeners()
    return next
  }, [])

  const remaining = Math.max(0, CAP - count)
  const limitReached = count >= CAP

  return { count, cap: CAP, remaining, limitReached, increment }
}
