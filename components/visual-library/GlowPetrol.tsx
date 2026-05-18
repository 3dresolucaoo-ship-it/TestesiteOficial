'use client'

/** Blob de luz petrol ou ember, absolute, blur-3xl. Elemento decorativo de fundo. */

import { cn } from '@/lib/utils'

type Tone = 'petrol' | 'ember' | 'neutral'
type Size = 'sm' | 'md' | 'lg'

interface GlowPetrolProps {
  tone?: Tone
  size?: Size
  className?: string
  /** Opacidade (0-1, padrao: 0.3) */
  opacity?: number
}

const toneColor: Record<Tone, string> = {
  petrol:  'hsl(173 58% 28%)',  // petrol-500
  ember:   'hsl(28 60% 55%)',   // ember-500
  neutral: 'hsl(43 17% 93%)',   // fog-50
}

const sizeStyles: Record<Size, string> = {
  sm: 'w-48 h-48',
  md: 'w-80 h-80',
  lg: 'w-[480px] h-[480px]',
}

/**
 * GlowPetrol — blob de brilho absoluto com blur extremo. Use como detalhe de fundo
 * em sections escuras. Posicione com className (ex: "-top-24 -left-24").
 */
export function GlowPetrol({
  tone = 'petrol',
  size = 'md',
  className,
  opacity = 0.3,
}: GlowPetrolProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        backgroundColor: toneColor[tone],
        opacity,
        filter: 'blur(80px)',
        borderRadius: '50%',
        position: 'absolute',
        pointerEvents: 'none',
      }}
      className={cn(sizeStyles[size], className)}
    />
  )
}
