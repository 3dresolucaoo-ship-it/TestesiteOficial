'use client'

import { useEffect, useRef, useState } from 'react'

interface RevealOptions {
  /** Fracao da area visivel que dispara o reveal (0-1). Default: 0.25 */
  threshold?: number
  /** Dispara apenas uma vez. Default: true */
  once?: boolean
}

/**
 * Hook IntersectionObserver ultra-leve (<1KB) para reveal on scroll.
 *
 * Uso:
 *   const { ref, isVisible } = useRevealOnScroll({ threshold: 0.35 })
 *   <div ref={ref} className={`reveal-zoom-fade ${isVisible ? 'is-visible' : ''}`} />
 *
 * prefers-reduced-motion: globais.css forca opacity:1/transform:none em
 * .reveal-zoom-fade e .reveal-img — o hook pode ainda adicionar is-visible
 * mas a imagem ja esta visivel antes do IO disparar.
 */
export function useRevealOnScroll<T extends Element = HTMLDivElement>(
  options: RevealOptions = {}
) {
  const { threshold = 0.25, once = true } = options
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once])

  return { ref, isVisible }
}
