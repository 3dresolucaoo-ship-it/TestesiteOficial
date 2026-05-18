'use client'

/** Overlay de ruido grainy em tela cheia, pointer-events-none. Replica textura da landing. */

import { cn } from '@/lib/utils'

type Intensity = 'soft' | 'normal' | 'heavy'

interface GrainOverlayProps {
  intensity?: Intensity
  className?: string
  /** z-index CSS (padrao: 50) */
  zIndex?: number
}

const opacityMap: Record<Intensity, number> = {
  soft:   0.025,
  normal: 0.045,
  heavy:  0.08,
}

// SVG noise inline (mesmo padrao da landing globals.css .grain)
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`

/**
 * GrainOverlay — ruido fotografico sobre a pagina inteira (fixed). pointer-events-none,
 * portanto nao interfere em cliques. Adicione ao root do layout ou de uma section.
 */
export function GrainOverlay({
  intensity = 'normal',
  className,
  zIndex = 50,
}: GrainOverlayProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        pointerEvents: 'none',
        backgroundImage: NOISE_SVG,
        backgroundRepeat: 'repeat',
        backgroundSize: '300px 300px',
        opacity: opacityMap[intensity],
        mixBlendMode: 'overlay',
      }}
      className={cn(className)}
    />
  )
}
