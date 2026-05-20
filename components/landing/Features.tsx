'use client'

/**
 * Features — section #features da landing.
 *
 * Shell SSR: cabeçalho + container. Grid de cards carregado via dynamic import
 * (FeaturesAnimated) para isolar o bundle do framer-motion do first paint.
 *
 * Estratégia 2026-05-19 (lazy load Framer Motion):
 * - Hero mantém motion síncrono (above-the-fold, crítico pro LCP/FCP)
 * - Features, WhyDifferent, FinalCTA: dynamic ssr:false → chunk separado
 * - Alvo: TBT de 2.6s → <1.0s; LCP de 4.0s → <2.5s
 *
 * FeaturesAnimated inclui a lista de dados internamente (não via props)
 * pois ReactNode não pode ser serializado através de dynamic boundary.
 */

import dynamic from 'next/dynamic'

// Fallback estático: cards sem animação visíveis imediatamente (SSR/JS desabilitado)
// Não exibe skeleton pois o cabeçalho já ancora visualmente a seção
const FeaturesAnimated = dynamic(
  () => import('./FeaturesAnimated').then((m) => m.FeaturesAnimated),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]"
        style={{ minHeight: 320 }}
      />
    ),
  }
)

export function Features() {
  return (
    <section
      id="features"
      className="grain-soft grain relative border-y border-border/40"
      style={{ background: 'hsl(var(--night-900))' }}
    >
      <div className="container-warm relative mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-28">

        {/* Cabeçalho de seção alinhado à esquerda (não centralizado padrão) */}
        <div className="mb-14 max-w-[680px] md:mb-16">
          <div className="tag mb-3">o que ele faz</div>
          <h2 className="display-h2 text-[2.5rem] text-foreground md:text-[3.5rem]">
            Quatro coisas. <br />Bem feitas
          </h2>
          <p className="mt-5 max-w-[520px] text-[16px] leading-[1.55] text-muted-foreground">
            Você toca impressão 3D, não departamento de TI. Aqui é só o que muda
            seu dia: estoque, venda, cliente, dinheiro.
          </p>
        </div>

        {/* Asymmetric grid: wrapper SSR + cards animados via dynamic import */}
        <div className="grid gap-5">
          <FeaturesAnimated />
        </div>
      </div>
    </section>
  )
}
