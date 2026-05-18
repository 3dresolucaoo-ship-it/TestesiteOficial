'use client'

/** Texto com sublinhado estilo marcador de texto (wavy ou solid), em ember ou petrol. */

import { cn } from '@/lib/utils'

type Tone = 'petrol' | 'ember' | 'neutral'
type Style = 'wavy' | 'solid' | 'dashed'

interface UnderlineMarkerProps {
  children: React.ReactNode
  tone?: Tone
  markerStyle?: Style
  className?: string
  /** Offset do sublinhado em pixels (padrao: 4) */
  offset?: number
}

const toneColor: Record<Tone, string> = {
  ember:   'hsl(27 67% 65%)',   // ember-400
  petrol:  'hsl(173 45% 42%)',  // petrol-400
  neutral: 'hsl(40 12% 71%)',   // fog-200
}

/**
 * UnderlineMarker — sublinhado estilo marcador artesanal em ember ou petrol.
 * Uso tipico: destacar palavras-chave em headlines e subtitulos.
 */
export function UnderlineMarker({
  children,
  tone = 'ember',
  markerStyle = 'wavy',
  className,
  offset = 4,
}: UnderlineMarkerProps) {
  const color = toneColor[tone]

  return (
    <span
      style={{
        textDecorationLine: 'underline',
        textDecorationStyle: markerStyle,
        textDecorationColor: color,
        textUnderlineOffset: `${offset}px`,
        textDecorationThickness: '2px',
      }}
      className={cn('inline', className)}
    >
      {children}
    </span>
  )
}
