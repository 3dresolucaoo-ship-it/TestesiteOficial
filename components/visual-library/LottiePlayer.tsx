'use client'

/**
 * LottiePlayer — wrapper lottie-react com lazy loading do bundle.
 *
 * lottie-react (~150KB minified) e carregado via next/dynamic para
 * evitar que o bundle apareca no chunk inicial. Como LottiePlayer e
 * usado apenas em /library (admin) e em animacoes opcionais, o custo
 * de carregamento deve ser zero para usuarios comuns na rota principal.
 *
 * Carregue o JSON via import estatico:
 *   import anim from '@/public/assets/lottie/loader.json'
 *   <LottiePlayer animationData={anim} />
 */

import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'

// Lottie carregado lazy — split de bundle separado do chunk principal.
// ssr: false porque lottie-react usa APIs de browser (canvas, requestAnimationFrame).
const LottieImpl = dynamic(
  () => import('lottie-react').then((mod) => mod.default),
  { ssr: false, loading: () => null }
)

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

export function LottiePlayer({
  animationData,
  loop = true,
  autoplay = true,
  className,
  onComplete,
  'aria-label': ariaLabel,
}: LottiePlayerProps) {
  return (
    <div
      role="img"
      aria-label={ariaLabel ?? 'animacao'}
      className={cn('inline-block', className)}
    >
      <LottieImpl
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        onComplete={onComplete}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
