'use client'

/**
 * FinalCTA — encerra a landing com pergunta-convite + link pro form do hero.
 *
 * Shell SSR: section com vignette + grain-heavy. Conteúdo carregado via dynamic
 * import (FinalCTAAnimated) para isolar o bundle do framer-motion.
 *
 * Estratégia 2026-05-19 (lazy load Framer Motion):
 * - Terceiro componente below-the-fold movido para dynamic ssr:false
 * - FinalCTA está no fundo da página, é o último elemento visto pelo usuário
 *   — candidato ideal: dynamic import não causa nenhum layout shift perceptível
 *
 * Diego: vignette + grain-heavy aqui pra fechar com peso visual.
 */

import dynamic from 'next/dynamic'

const FinalCTAAnimated = dynamic(
  () => import('./FinalCTAAnimated').then((m) => m.FinalCTAAnimated),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        style={{ minHeight: 200 }}
      />
    ),
  }
)

export function FinalCTA() {
  return (
    <section className="vignette grain grain-heavy relative overflow-hidden border-t border-border/40">
      <div className="container-warm relative mx-auto max-w-[1180px] px-6 py-24 md:px-10 md:py-32">
        <FinalCTAAnimated />
      </div>
    </section>
  )
}
