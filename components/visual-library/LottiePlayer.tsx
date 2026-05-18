'use client'

/** Wrapper lottie-react com interface tipada. Carrega JSON de public/assets/lottie/. */

import { useRef } from 'react'
import Lottie, { type LottieRefCurrentProps } from 'lottie-react'
import { cn } from '@/lib/utils'

interface LottiePlayerProps {
  /** Dados JSON da animacao Lottie (import direto ou fetch) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animationData: Record<string, any>
  /** Loop continuo (padrao: true) */
  loop?: boolean
  /** Inicia automaticamente (padrao: true) */
  autoplay?: boolean
  className?: string
  /** Funcao chamada quando a animacao termina (util com loop: false) */
  onComplete?: () => void
  /** aria-label para acessibilidade */
  'aria-label'?: string
}

/**
 * LottiePlayer — wrapper sobre lottie-react com props tipadas e aria-label.
 * Carregue o JSON via import estatico: import anim from '@/public/assets/lottie/loader.json'.
 * Nao use fetch dinamico aqui — deixe o Server Component pai decidir o carregamento.
 */
export function LottiePlayer({
  animationData,
  loop = true,
  autoplay = true,
  className,
  onComplete,
  'aria-label': ariaLabel,
}: LottiePlayerProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? 'animacao'}
      className={cn('inline-block', className)}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        onComplete={onComplete}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
