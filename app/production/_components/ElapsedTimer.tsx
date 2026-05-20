'use client'

/**
 * ElapsedTimer.tsx — Timer de tempo decorrido para impressoes ativas.
 *
 * Extraido de app/production/page.tsx (2026-05-20).
 * Simulacao client-side: nao persiste no DB — reseta na navegacao.
 * O setInterval e o mesmo do original: 1000ms, limpo no cleanup.
 *
 * RESTRICAO: nao alterar o timing (1000ms) — critico para UX de producao.
 */

import { useState, useEffect } from 'react'
import { formatElapsed }       from './helpers'

interface ElapsedTimerProps {
  /** Timestamp Unix (ms) de quando a impressao foi iniciada. */
  startedAt: number
}

export function ElapsedTimer({ startedAt }: ElapsedTimerProps) {
  // Lazy initializer evita chamar Date.now() no corpo do render.
  const [elapsed, setElapsed] = useState<number>(
    () => Math.floor((Date.now() - startedAt) / 1000),
  )

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [startedAt])

  return (
    <span
      className="text-[#3b82f6] text-xs font-mono tabular-nums"
      aria-label={`Tempo decorrido: ${formatElapsed(elapsed)}`}
      aria-live="off"
    >
      {formatElapsed(elapsed)}
    </span>
  )
}
