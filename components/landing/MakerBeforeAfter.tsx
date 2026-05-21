'use client'

/**
 * MakerBeforeAfter — section "Mesma rotina. Cabeca diferente."
 *
 * Posicao DOM: entre PrinterShowcase e WalletTransform (spec Diego 3.3).
 * Asset: maker-antes-depois.webp (split A/B ja embutido no PNG: maker triste
 * com lista vermelha vs maker calmo HAYZER com lista verde, 6 dores espelhadas).
 *
 * Animacao: zoom-in + fade ao entrar no viewport (IO threshold 0.35, once).
 * CSS-first: usa .reveal-zoom-fade / .is-visible definidos em globals.css.
 * prefers-reduced-motion: globals.css forca opacity:1/transform:none — imagem
 * aparece estática sem depender do IO.
 *
 * Mobile (<600px): PNG inteiro em width:100% + caption "A (caos) / B (Hayzer)"
 * pra ancorar leitura do split horizontal apertado.
 *
 * Client Component: necessario pelo useRevealOnScroll (IntersectionObserver).
 */

import { useRevealOnScroll } from '@/lib/hooks/useRevealOnScroll'

export function MakerBeforeAfter() {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>({ threshold: 0.35, once: true })

  return (
    <section
      id="antes-depois"
      className="grain-soft grain relative scroll-mt-20 border-b border-border/40"
      style={{ background: 'hsl(var(--night-950))' }}
    >
      <div className="container-warm relative mx-auto max-w-[1180px] px-6 py-16 md:px-10 md:py-20 lg:py-24">

        {/* Cabecalho */}
        <div className="mb-10 max-w-[680px]">
          <div className="tag mb-3">transformacao</div>
          <h2
            className="display-h2 text-foreground"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.18 }}
          >
            Mesma rotina.{' '}
            <span className="italic-soft">Cabeca diferente.</span>
          </h2>
          <p
            className="mt-5 text-[16px] leading-[1.55] text-muted-foreground md:text-[17px]"
          >
            Nao muda a impressora. Muda o caos.
          </p>
        </div>

        {/* Imagem reveal — wrapper recebe ref do IO */}
        <div
          ref={ref}
          className={`reveal-zoom-fade reveal-img${isVisible ? ' is-visible' : ''}`}
        >
          <div
            className="overflow-hidden rounded-[14px] border"
            style={{
              borderColor: 'hsl(var(--petrol-600) / 0.30)',
              boxShadow:
                '0 0 0 1px hsl(var(--petrol-500) / 0.18), 0 24px 64px hsl(var(--night-950) / 0.55)',
            }}
          >
            <picture>
              <source
                media="(max-width: 640px)"
                srcSet="/landing/v3/optimized/maker-antes-depois-480w.webp"
                type="image/webp"
              />
              <source
                media="(max-width: 1280px)"
                srcSet="/landing/v3/optimized/maker-antes-depois-1080w.webp"
                type="image/webp"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/landing/v3/optimized/maker-antes-depois-1920w.webp"
                alt="Maker triste com lista de problemas vermelhos ao lado de maker sorridente Hayzer com lista de solucoes verdes — antes e depois da organizacao"
                loading="lazy"
                decoding="async"
                width={1920}
                height={1280}
                className="w-full object-cover"
              />
            </picture>
          </div>

          {/* Caption mobile: ancora leitura do split horizontal */}
          <p
            className="mt-3 text-center text-[11.5px] sm:hidden"
            style={{
              color: 'hsl(var(--fog-400))',
              fontFamily: 'ui-monospace, "Geist Mono", monospace',
              letterSpacing: '0.05em',
            }}
          >
            A (caos) / B (Hayzer)
          </p>

          {/* Caption desktop */}
          <p
            className="mt-3 hidden text-center text-[12.5px] sm:block"
            style={{
              color: 'hsl(var(--fog-300))',
              fontFamily: 'ui-monospace, "Geist Mono", monospace',
            }}
          >
            antes: lista vermelha, maker exausto · depois: Hayzer, lista verde, cabeca no lugar
          </p>
        </div>
      </div>
    </section>
  )
}
