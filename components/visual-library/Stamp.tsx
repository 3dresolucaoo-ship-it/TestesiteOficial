'use client'

/** Carimbo circular rotacionado, estilo aprovado/beta/status. Tipografia monospace. */

import { cn } from '@/lib/utils'

type Tone = 'petrol' | 'ember' | 'neutral'
type Size = 'sm' | 'md' | 'lg'

interface StampProps {
  children: React.ReactNode
  tone?: Tone
  size?: Size
  className?: string
  /** Graus de rotacao (padrao: -8) */
  rotate?: number
  /** aria-label para leitores de tela */
  'aria-label'?: string
}

const toneStyles: Record<Tone, { border: string; text: string }> = {
  ember: {
    border: 'hsl(27 67% 65%)',   // ember-400
    text:   'hsl(28 67% 70%)',   // ember-300
  },
  petrol: {
    border: 'hsl(173 45% 42%)',  // petrol-400
    text:   'hsl(173 35% 60%)',  // petrol-300
  },
  neutral: {
    border: 'hsl(40 12% 71%)',   // fog-200
    text:   'hsl(40 21% 86%)',   // fog-100
  },
}

const sizeStyles: Record<Size, { container: string; font: string }> = {
  sm: { container: 'w-14 h-14 p-2',   font: 'text-[8px]' },
  md: { container: 'w-20 h-20 p-3',   font: 'text-[10px]' },
  lg: { container: 'w-28 h-28 p-4',   font: 'text-[12px]' },
}

/**
 * Stamp — carimbo circular com texto uppercase monospace. Use em cards de status,
 * badges de aprovacao ou detalhes artesanais (ex: "BETA", "APROVADO", "WIP").
 */
export function Stamp({
  children,
  tone = 'ember',
  size = 'md',
  className,
  rotate = -8,
  'aria-label': ariaLabel,
}: StampProps) {
  const styles = toneStyles[tone]
  const sizing = sizeStyles[size]

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? (typeof children === 'string' ? children : 'selo')}
      style={{
        transform: `rotate(${rotate}deg)`,
        borderColor: styles.border,
        color: styles.text,
        opacity: 0.7,
      }}
      className={cn(
        'inline-flex items-center justify-center rounded-full border-2 font-mono uppercase tracking-widest leading-tight text-center select-none',
        sizing.container,
        sizing.font,
        className,
      )}
    >
      {children}
    </div>
  )
}
