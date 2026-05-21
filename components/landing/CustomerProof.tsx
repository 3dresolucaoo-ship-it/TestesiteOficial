'use client'

/**
 * CustomerProof — section "Quem usa, entrega melhor."
 *
 * Posicao DOM: DEPOIS de WhatsAppFlow e ANTES de WhyDifferent (spec Diego 3.7).
 * Assets: cliente-mulher-mestre.webp + cliente-mulher-clean.webp.
 * Diversifica persona (mulheres makers BR — nao so "homem barbudo na bancada").
 *
 * Layout:
 * - Mobile (<768px): scroll-snap horizontal CSS puro (zero JS), 2 dots indicadores.
 * - Desktop (md+): grid 2 colunas, ambas visiveis lado a lado (sem snap).
 *
 * Trigger: section inteira com .reveal-zoom-fade (IO threshold 0.25, once).
 * CSS-first: usa .reveal-zoom-fade / .is-visible de globals.css.
 *
 * Client Component: necessario pelo useRevealOnScroll (IO).
 */

import { useRevealOnScroll } from '@/lib/hooks/useRevealOnScroll'

export function CustomerProof() {
  const { ref, isVisible } = useRevealOnScroll<HTMLElement>({ threshold: 0.25, once: true })

  return (
    <section
      ref={ref}
      id="quem-confia"
      className={`grain-soft grain relative scroll-mt-20 border-t border-border/40 reveal-zoom-fade reveal-img${isVisible ? ' is-visible' : ''}`}
      style={{ background: 'hsl(var(--night-950))' }}
    >
      <div className="container-warm relative mx-auto max-w-[1180px] px-6 py-16 md:px-10 md:py-20 lg:py-24">

        {/* Cabecalho */}
        <div className="mb-10 max-w-[680px]">
          <div className="tag mb-3">quem confia</div>
          <h2
            className="display-h2 text-foreground"
            style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.5rem)', lineHeight: 1.18 }}
          >
            Quem usa, entrega melhor.
          </h2>
        </div>

        {/* MOBILE: scroll-snap horizontal */}
        <div
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:hidden"
          style={{ scrollbarWidth: 'none' }}
          aria-label="Galeria de clientes makers"
        >
          {/* Card 1 — cliente-mulher-mestre */}
          <figure className="w-[85vw] max-w-[420px] flex-shrink-0 snap-center">
            <div
              className="overflow-hidden rounded-[14px] border"
              style={{
                borderColor: 'hsl(var(--petrol-600) / 0.28)',
                boxShadow:
                  '0 0 0 1px hsl(var(--petrol-500) / 0.15), 0 16px 48px hsl(var(--night-950) / 0.45)',
              }}
            >
              <picture>
                <source
                  srcSet="/landing/v3/optimized/cliente-mulher-mestre-480w.webp"
                  type="image/webp"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/landing/v3/optimized/cliente-mulher-mestre-480w.webp"
                  alt="Maker mulher entregando peca preta impressa em 3D pra cliente sorridente, sacola HAYZER ao lado, laptop com mensagem Obrigado do Hayzer, neon verde crie. imprima. realize. ao fundo"
                  loading="lazy"
                  decoding="async"
                  width={480}
                  height={320}
                  className="aspect-[3/2] w-full object-cover"
                />
              </picture>
            </div>
            <figcaption
              className="mt-3 text-[12.5px]"
              style={{
                color: 'hsl(var(--fog-300))',
                fontFamily: 'ui-monospace, "Geist Mono", monospace',
              }}
            >
              loja maker · entrega presencial · pedido fechado pelo Hayzer
            </figcaption>
          </figure>

          {/* Card 2 — cliente-mulher-clean */}
          <figure className="w-[85vw] max-w-[420px] flex-shrink-0 snap-center">
            <div
              className="overflow-hidden rounded-[14px] border"
              style={{
                borderColor: 'hsl(var(--petrol-600) / 0.28)',
                boxShadow:
                  '0 0 0 1px hsl(var(--petrol-500) / 0.15), 0 16px 48px hsl(var(--night-950) / 0.45)',
              }}
            >
              <picture>
                <source
                  srcSet="/landing/v3/optimized/cliente-mulher-clean-480w.webp"
                  type="image/webp"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/landing/v3/optimized/cliente-mulher-clean-480w.webp"
                  alt="Maker mulher entregando peca impressa em 3D pra cliente, sacola HAYZER ao lado, confirmacao automatica no celular, neon crie imprima realize ao fundo"
                  loading="lazy"
                  decoding="async"
                  width={480}
                  height={320}
                  className="aspect-[3/2] w-full object-cover"
                />
              </picture>
            </div>
            <figcaption
              className="mt-3 text-[12.5px]"
              style={{
                color: 'hsl(var(--fog-300))',
                fontFamily: 'ui-monospace, "Geist Mono", monospace',
              }}
            >
              OBRIGADA, PECA PERFEITA · confirmacao automatica
            </figcaption>
          </figure>
        </div>

        {/* Dots indicadores mobile (CSS puro via ::after seria ideal mas Tailwind facilita) */}
        <div className="mt-3 flex justify-center gap-1.5 md:hidden" aria-hidden>
          <span
            className="h-1.5 w-4 rounded-full"
            style={{ background: 'hsl(var(--fog-400))' }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: 'hsl(var(--fog-400) / 0.35)' }}
          />
        </div>

        {/* DESKTOP: grid 2 colunas */}
        <div className="hidden grid-cols-2 gap-8 md:grid md:gap-10">

          {/* Card 1 */}
          <figure>
            <div
              className="overflow-hidden rounded-[14px] border"
              style={{
                borderColor: 'hsl(var(--petrol-600) / 0.28)',
                boxShadow:
                  '0 0 0 1px hsl(var(--petrol-500) / 0.15), 0 16px 48px hsl(var(--night-950) / 0.45)',
              }}
            >
              <picture>
                <source
                  media="(max-width: 1280px)"
                  srcSet="/landing/v3/optimized/cliente-mulher-mestre-1080w.webp"
                  type="image/webp"
                />
                <source
                  srcSet="/landing/v3/optimized/cliente-mulher-mestre-1920w.webp"
                  type="image/webp"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/landing/v3/optimized/cliente-mulher-mestre-1080w.webp"
                  alt="Maker mulher entregando peca preta impressa em 3D pra cliente sorridente, sacola HAYZER ao lado, laptop com mensagem Obrigado do Hayzer, neon verde crie. imprima. realize. ao fundo"
                  loading="lazy"
                  decoding="async"
                  width={1080}
                  height={720}
                  className="aspect-[3/2] w-full object-cover"
                />
              </picture>
            </div>
            <figcaption
              className="mt-3 text-[12.5px]"
              style={{
                color: 'hsl(var(--fog-300))',
                fontFamily: 'ui-monospace, "Geist Mono", monospace',
              }}
            >
              loja maker · entrega presencial · pedido fechado pelo Hayzer
            </figcaption>
          </figure>

          {/* Card 2 */}
          <figure>
            <div
              className="overflow-hidden rounded-[14px] border"
              style={{
                borderColor: 'hsl(var(--petrol-600) / 0.28)',
                boxShadow:
                  '0 0 0 1px hsl(var(--petrol-500) / 0.15), 0 16px 48px hsl(var(--night-950) / 0.45)',
              }}
            >
              <picture>
                <source
                  media="(max-width: 1280px)"
                  srcSet="/landing/v3/optimized/cliente-mulher-clean-1080w.webp"
                  type="image/webp"
                />
                <source
                  srcSet="/landing/v3/optimized/cliente-mulher-clean-1920w.webp"
                  type="image/webp"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/landing/v3/optimized/cliente-mulher-clean-1080w.webp"
                  alt="Maker mulher entregando peca impressa em 3D pra cliente, sacola HAYZER ao lado, confirmacao automatica no celular, neon crie imprima realize ao fundo"
                  loading="lazy"
                  decoding="async"
                  width={1080}
                  height={720}
                  className="aspect-[3/2] w-full object-cover"
                />
              </picture>
            </div>
            <figcaption
              className="mt-3 text-[12.5px]"
              style={{
                color: 'hsl(var(--fog-300))',
                fontFamily: 'ui-monospace, "Geist Mono", monospace',
              }}
            >
              OBRIGADA, PECA PERFEITA · confirmacao automatica
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
