'use client'

/** Etiqueta estilo fita adesiva rotacionada, usada pra marcar status interno (ex: "INTERNO", "RASCUNHO"). */

import { cn } from '@/lib/utils'

type Tone = 'petrol' | 'ember' | 'neutral'
type Size = 'sm' | 'md' | 'lg'

interface TapeBadgeProps {
  children: React.ReactNode
  tone?: Tone
  size?: Size
  className?: string
  /** Graus de rotacao (padrao: -4) */
  rotate?: number
  /** aria-label quando o badge for puramente decorativo */
  'aria-label'?: string
}

const toneStyles: Record<Tone, { bg: string; text: string; shadow: string }> = {
  ember: {
    bg: 'rgba(208, 138, 74, 0.18)',
    text: 'hsl(29 70% 80%)',          // ember-200
    shadow: 'rgba(208, 138, 74, 0.25)',
  },
  petrol: {
    bg: 'rgba(31, 118, 105, 0.18)',
    text: 'hsl(171 40% 80%)',          // petrol-200
    shadow: 'rgba(31, 118, 105, 0.25)',
  },
  neutral: {
    bg: 'rgba(242, 239, 234, 0.10)',
    text: 'hsl(40 21% 86%)',           // fog-100
    shadow: 'rgba(242, 239, 234, 0.12)',
  },
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-2.5 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm',
}

/**
 * TapeBadge — etiqueta rotacionada estilo fita. Use em cantos de cards ou
 * como label de status (INTERNO, BETA, WIP). Tone ember = padrão visual Hayzer.
 */
export function TapeBadge({
  children,
  tone = 'ember',
  size = 'md',
  className,
  rotate = -4,
  'aria-label': ariaLabel,
}: TapeBadgeProps) {
  const styles = toneStyles[tone]

  return (
    <span
      aria-label={ariaLabel}
      style={{
        display: 'inline-block',
        transform: `rotate(${rotate}deg)`,
        backgroundColor: styles.bg,
        color: styles.text,
        boxShadow: `0 2px 8px ${styles.shadow}`,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      className={cn(
        'rounded font-mono uppercase tracking-wider leading-none select-none',
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
