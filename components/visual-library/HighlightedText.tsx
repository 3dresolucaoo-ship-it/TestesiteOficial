'use client'

/** Texto com fundo highlight translucido (caneta marca-texto), acento ember ou petrol. */

import { cn } from '@/lib/utils'

type Tone = 'petrol' | 'ember' | 'neutral'
type Size = 'sm' | 'md' | 'lg'

interface HighlightedTextProps {
  children: React.ReactNode
  tone?: Tone
  size?: Size
  className?: string
}

const toneBg: Record<Tone, string> = {
  ember:   'rgba(208, 138, 74, 0.28)',
  petrol:  'rgba(31, 118, 105, 0.28)',
  neutral: 'rgba(242, 239, 234, 0.14)',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-1 py-0.5',
  md: 'px-1.5 py-0.5',
  lg: 'px-2 py-1',
}

/**
 * HighlightedText — fundo marca-texto translucido. Use em palavras ou frases
 * que precisam de destaque sutil sem quebrar o fluxo tipografico.
 */
export function HighlightedText({
  children,
  tone = 'ember',
  size = 'md',
  className,
}: HighlightedTextProps) {
  return (
    <span
      style={{ backgroundColor: toneBg[tone] }}
      className={cn(
        'inline rounded-sm font-semibold',
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
