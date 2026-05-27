'use client'

/**
 * WalletTransform — section "Carteira reformulada"
 *
 * Posicao DOM: entre MakerBeforeAfter e ProductPreview (spec Diego 3.4).
 * Assets: carteira-rasgada.webp (antes, 4:3) + carteira-organizada.webp (depois, 1:1).
 * Bruna nota: dark mode usa carteira-rasgada-dark via <source media="prefers-color-scheme:dark">.
 *
 * Layout desktop: grid 2 cols alternando imagem/copy.
 * Layout mobile: stack vertical PNG → headline → PNG → headline.
 *
 * Animacao: cada bloco tem IO independente, threshold 0.4, once.
 * CSS-first: .reveal-zoom-fade / .is-visible de globals.css.
 *
 * Seta visual: SVG 24px em petrol-400/40 entre os 2 blocos.
 *
 * Client Component: necessario pelo useRevealOnScroll (IO).
 */

import { useRevealOnScroll } from '@/lib/hooks/useRevealOnScroll'

function ArrowDown() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ color: 'hsl(var(--petrol-400) / 0.4)' }}
    >
      <path
        d="M12 4v16m0 0-6-6m6 6 6-6"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function WalletTransform() {
  const { ref: refBefore, isVisible: visibleBefore } = useRevealOnScroll<HTMLDivElement>({
    threshold: 0.4,
    once: true,
  })
  const { ref: refAfter, isVisible: visibleAfter } = useRevealOnScroll<HTMLDivElement>({
    threshold: 0.4,
    once: true,
  })

  return (
    <section
      id="carteira"
      className="grain-soft grain relative scroll-mt-20 border-b border-border/40"
      style={{ background: 'hsl(var(--night-950))' }}
    >
      <div className="container-warm relative mx-auto max-w-[1180px] px-6 py-16 md:px-10 md:py-20 lg:py-24">

        {/* Cabecalho */}
        <div className="mb-12 max-w-[680px]">
          <div className="tag mb-3">financeiro</div>
          <h2
            className="display-h2 text-foreground"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.18 }}
          >
            Sua carteira hoje.{' '}
            <span className="italic-soft">Depois do Hayzer</span>
          </h2>
        </div>

        {/* BLOCO 1 — Antes (carteira rasgada) */}
        <div
          ref={refBefore}
          className={`reveal-zoom-fade reveal-img mb-4${visibleBefore ? ' is-visible' : ''}`}
        >
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">

            {/* Imagem — esquerda em md+ */}
            <div
              className="overflow-hidden rounded-[14px] border"
              style={{
                borderColor: 'hsl(var(--fog-50) / 0.08)',
                boxShadow:
                  '0 0 0 1px hsl(var(--petrol-500) / 0.12), 0 16px 48px hsl(var(--night-950) / 0.45)',
              }}
            >
              <picture>
                {/* Dark mode: variante escura da carteira rasgada */}
                <source
                  media="(prefers-color-scheme: dark) and (max-width: 640px)"
                  srcSet="/landing/v3/optimized/carteira-rasgada-dark-480w.webp"
                  type="image/webp"
                />
                <source
                  media="(prefers-color-scheme: dark)"
                  srcSet="/landing/v3/optimized/carteira-rasgada-dark-1080w.webp 1x, /landing/v3/optimized/carteira-rasgada-dark-1920w.webp 2x"
                  type="image/webp"
                />
                {/* Light mode / fallback */}
                <source
                  media="(max-width: 640px)"
                  srcSet="/landing/v3/optimized/carteira-rasgada-480w.webp"
                  type="image/webp"
                />
                <source
                  srcSet="/landing/v3/optimized/carteira-rasgada-1080w.webp 1x, /landing/v3/optimized/carteira-rasgada-1920w.webp 2x"
                  type="image/webp"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/landing/v3/optimized/carteira-rasgada-1080w.webp"
                  alt="Carteira financeira rasgada e desorganizada de um maker 3D, notas e papeis espalhados"
                  loading="lazy"
                  decoding="async"
                  width={1080}
                  height={810}
                  className="aspect-[4/3] w-full object-cover"
                />
              </picture>
            </div>

            {/* Copy direita */}
            <div>
              <span
                className="mb-3 inline-block text-[10px] uppercase tracking-[0.12em]"
                style={{
                  color: 'hsl(var(--fog-400))',
                  fontFamily: 'ui-monospace, "Geist Mono", monospace',
                }}
              >
                antes
              </span>
              <h3
                className="display-h2 text-foreground"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.2 }}
              >
                Sua carteira hoje
              </h3>
              <p className="mt-4 text-[15px] leading-[1.6] text-muted-foreground">
                Papel, divida, esquecimento. Nao e organizacao, e sobrevivencia.
              </p>
            </div>
          </div>
        </div>

        {/* Seta visual entre os 2 blocos */}
        <div className="flex justify-center py-6" aria-hidden>
          <ArrowDown />
        </div>

        {/* BLOCO 2 — Depois (carteira organizada) */}
        <div
          ref={refAfter}
          className={`reveal-zoom-fade reveal-img${visibleAfter ? ' is-visible' : ''}`}
        >
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">

            {/* Copy esquerda (inverte posicao vs bloco 1) */}
            <div className="order-2 md:order-1">
              <span
                className="mb-3 inline-block text-[10px] uppercase tracking-[0.12em]"
                style={{
                  color: 'hsl(var(--petrol-300))',
                  fontFamily: 'ui-monospace, "Geist Mono", monospace',
                }}
              >
                depois do hayzer
              </span>
              <h3
                className="display-h2 text-foreground"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.2 }}
              >
                Sua carteira com Hayzer
              </h3>
              <p className="mt-4 text-[15px] leading-[1.6] text-muted-foreground">
                R$ 18.730 visiveis. Controle, foco, liberdade no bolso.
              </p>
            </div>

            {/* Imagem — direita em md+ */}
            <div
              className="order-1 overflow-hidden rounded-[14px] border md:order-2"
              style={{
                borderColor: 'hsl(var(--petrol-600) / 0.30)',
                boxShadow:
                  '0 0 0 1px hsl(var(--petrol-500) / 0.20), 0 16px 48px hsl(var(--night-950) / 0.45)',
              }}
            >
              <picture>
                <source
                  media="(max-width: 640px)"
                  srcSet="/landing/v3/optimized/carteira-organizada-480w.webp"
                  type="image/webp"
                />
                <source
                  srcSet="/landing/v3/optimized/carteira-organizada-1080w.webp 1x, /landing/v3/optimized/carteira-organizada-1920w.webp 2x"
                  type="image/webp"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/landing/v3/optimized/carteira-organizada-1080w.webp"
                  alt="Carteira organizada com notas dobradas e dinheiro visivelmente arrumado, representando controle financeiro com Hayzer"
                  loading="lazy"
                  decoding="async"
                  width={1080}
                  height={1080}
                  className="aspect-square w-full object-cover"
                />
              </picture>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
