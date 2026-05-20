'use client'

/**
 * useCountUp — anima um número de 0 até `target` em `duration` ms.
 *
 * Implementado via requestAnimationFrame (sem dependência externa).
 * Respeita prefers-reduced-motion: pula diretamente pro valor final.
 * Roda apenas no mount inicial — não reexecuta em re-renders.
 *
 * Uso:
 *   const displayed = useCountUp(4280, 800)
 *   // retorna número atual (0 → 4280 em 800ms)
 */

import { useEffect, useRef, useState } from 'react'

const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3)

export function useCountUp(target: number, duration = 800): number {
  const [displayed, setDisplayed] = useState(0)
  const rafRef    = useRef<number | null>(null)
  const hasRun    = useRef(false)

  useEffect(() => {
    // Roda apenas uma vez no mount
    if (hasRun.current) return
    hasRun.current = true

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      const raf = requestAnimationFrame(() => setDisplayed(target))
      return () => cancelAnimationFrame(raf)
    }

    const start = performance.now()

    const step = (now: number) => {
      const elapsed  = Math.min(now - start, duration)
      const progress = easeOut(elapsed / duration)
      setDisplayed(Math.round(target * progress))
      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(step)
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // mount-only: target/duration são lidos uma vez intencionalmente

  return displayed
}
