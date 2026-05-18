'use client'

/** SVG animado das raizes do logo Hayzer. Stroke-dasharray crescendo via Framer Motion. */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Tone = 'petrol' | 'ember' | 'neutral'
type Size = 'sm' | 'md' | 'lg'

interface RootSvgProps {
  tone?: Tone
  size?: Size
  className?: string
  /** Duracao da animacao em segundos (padrao: 1.8) */
  duration?: number
  /** Desabilita animacao (modo estatico) */
  static?: boolean
  'aria-label'?: string
}

const toneColor: Record<Tone, string> = {
  petrol:  'hsl(173 58% 28%)',   // petrol-500
  ember:   'hsl(28 60% 55%)',    // ember-500
  neutral: 'hsl(40 12% 71%)',    // fog-200
}

const sizePx: Record<Size, number> = {
  sm: 48,
  md: 80,
  lg: 120,
}

/**
 * RootSvg — raizes organicas do simbolo Hayzer em SVG puro, com animacao de
 * crescimento (stroke-dasharray de 0 a total). Baseado nas raizes do logo-hayzer.png.
 */
export function RootSvg({
  tone = 'petrol',
  size = 'md',
  className,
  duration = 1.8,
  static: isStatic = false,
  'aria-label': ariaLabel,
}: RootSvgProps) {
  const color = toneColor[tone]
  const px = sizePx[size]

  // Paths derivados da silhueta das raizes do logo-hayzer.png
  const paths = [
    // Haste central vertical
    'M 40 10 L 40 70',
    // Raiz esquerda principal — curva descendente
    'M 40 50 C 32 58 22 62 14 72',
    // Raiz esquerda secundaria
    'M 40 60 C 34 66 26 68 20 76',
    // Raiz direita
    'M 40 50 C 48 58 54 64 58 74',
    // Raiz esquerda terciaria (fina)
    'M 30 65 C 24 70 18 72 12 80',
  ]

  const strokeProps = {
    stroke: color,
    strokeWidth: 2.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  }

  return (
    <svg
      viewBox="0 0 80 90"
      width={px}
      height={px * (90 / 80)}
      aria-label={ariaLabel ?? 'Raizes Hayzer'}
      role="img"
      className={cn(className)}
    >
      {paths.map((d, i) => (
        isStatic ? (
          <path key={i} d={d} {...strokeProps} />
        ) : (
          <motion.path
            key={i}
            d={d}
            {...strokeProps}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: {
                duration,
                delay: i * 0.15,
                ease: [0.22, 0.61, 0.36, 1],
              },
              opacity: { duration: 0.3, delay: i * 0.15 },
            }}
          />
        )
      ))}
    </svg>
  )
}
