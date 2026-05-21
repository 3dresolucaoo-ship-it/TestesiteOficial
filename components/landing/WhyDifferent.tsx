'use client'

/**
 * WhyDifferent — section #por-que da landing.
 *
 * Shell SSR: cabeçalho de 2 colunas. Tabela + pull quote carregados via dynamic
 * import (WhyDifferentAnimated) para isolar o bundle do framer-motion.
 *
 * Estratégia 2026-05-19 (lazy load Framer Motion):
 * - Segundo componente below-the-fold movido para dynamic ssr:false
 * - Preços dos concorrentes vivem em WhyDifferentAnimated.tsx (manter em sync)
 *
 * Bug fix 2026-05-19 (mobile):
 * - gap-12 → gap-6 lg:gap-12 no cabeçalho (48px → 24px em single-column mobile)
 */

import dynamic from 'next/dynamic'

const WhyDifferentAnimated = dynamic(
  () => import('./WhyDifferentAnimated').then((m) => m.WhyDifferentAnimated),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        style={{ minHeight: 280 }}
      />
    ),
  }
)

export function WhyDifferent() {
  return (
    <section id="por-que" className="grain-soft grain relative scroll-mt-20">
      <div className="container-warm relative mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-28">

        {/* Cabeçalho 2 colunas — heading esquerda, copy explicativa direita */}
        {/* Bug fix 2026-05-19: gap-12 (48px) em mobile single-column era excessivo entre heading e parágrafo */}
        <div className="mb-14 grid gap-6 lg:gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="tag mb-3">por quê</div>
            <h2 className="display-h2 text-[2.5rem] text-foreground md:text-[3.5rem]">
              Quatro assinaturas
              <br />
              para rodar uma <span className="italic-soft">loja de 3D</span>.
            </h2>
          </div>
          <div className="lg:col-span-7 lg:pt-4">
            <p className="text-[17px] leading-[1.55] text-muted-foreground">
              Bling, Conta Azul, Nuvemshop e duas planilhas. R$ 407 todo mês, nenhum
              software fala com o outro, e tu termina colando tudo no susto entre
              uma fornada de peça e outra.
            </p>
          </div>
        </div>

        {/* Tabela + pull quote via dynamic import */}
        <WhyDifferentAnimated />
      </div>
    </section>
  )
}
