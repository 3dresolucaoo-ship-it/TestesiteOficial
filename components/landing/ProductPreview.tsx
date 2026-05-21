/**
 * ProductPreview — section "Nao precisa imaginar. Olha como fica."
 *
 * v2 (2026-05-21): troca placeholder/orders-preview por produto-laptop.webp real.
 * Coordenadas das 3 anotacoes ember recalibradas pro novo asset (spec Diego 3.5).
 * Pulse infinito via .ember-dot + .ember-dot-delay-{1,2,3} de globals.css.
 * Remove logica screenshotExists + bloco placeholder (PNG sempre existe).
 *
 * Server Component: sem state, sem hooks de browser.
 * Dots ficam hidden md:block (nao poluem mobile).
 */

interface Annotation {
  label: string
  top: string
  left: string
  side: 'left' | 'right'
  delayClass: 'ember-dot-delay-1' | 'ember-dot-delay-2' | 'ember-dot-delay-3'
}

const ANNOTATIONS: Annotation[] = [
  {
    label: 'Resumo R$ 12.450,00',
    top: '22%',
    left: '38%',
    side: 'right',
    delayClass: 'ember-dot-delay-1',
  },
  {
    label: '23 pedidos · 8/12 producao',
    top: '38%',
    left: '30%',
    side: 'left',
    delayClass: 'ember-dot-delay-2',
  },
  {
    label: 'Resumo no celular tambem',
    top: '60%',
    left: '78%',
    side: 'right',
    delayClass: 'ember-dot-delay-3',
  },
]

export function ProductPreview() {
  return (
    <section
      id="produto"
      className="grain-soft grain relative scroll-mt-20 border-b border-border/40"
      style={{ background: 'hsl(var(--night-950))' }}
    >
      <div className="container-warm relative mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-28">

        {/* Cabecalho */}
        <div className="mb-12 max-w-[680px]">
          <div className="tag mb-3">como fica</div>
          <h2
            className="display-h2 text-foreground"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', lineHeight: 1.2 }}
          >
            Nao precisa imaginar.{' '}
            <span className="italic-soft">Olha como fica</span>
          </h2>
          <p className="mt-5 max-w-[520px] text-[16px] leading-[1.55] text-muted-foreground">
            Pedido do WhatsApp, filamento contado, comissao descontada.
            Tudo numa tela so. Nada de planilha, nada de memoria.
          </p>
        </div>

        {/* Container imagem + anotacoes */}
        <div
          className="relative overflow-hidden rounded-[12px] border"
          style={{
            borderColor: 'hsl(var(--fog-50) / 0.10)',
            boxShadow:
              '0 0 0 1px hsl(var(--petrol-600) / 0.25), 0 24px 64px hsl(var(--night-950) / 0.6)',
          }}
        >
          <picture>
            <source
              media="(max-width: 640px)"
              srcSet="/landing/v3/optimized/produto-laptop-480w.webp"
              type="image/webp"
            />
            <source
              media="(max-width: 1280px)"
              srcSet="/landing/v3/optimized/produto-laptop-1080w.webp"
              type="image/webp"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/v3/optimized/produto-laptop-1920w.webp"
              alt="Laptop e iPhone exibindo dashboard Hayzer com resumo R$ 12.450,00, 23 pedidos, 8/12 em producao, lateral esquerda com modulos de navegacao"
              loading="lazy"
              decoding="async"
              width={1920}
              height={1280}
              className="w-full object-cover object-top"
            />
          </picture>

          {/* Anotacoes ember — visiveis apenas em md+ */}
          <div className="pointer-events-none absolute inset-0 hidden md:block">
            {ANNOTATIONS.map((ann) => (
              <div
                key={ann.label}
                className="absolute flex items-center gap-2"
                style={{
                  top: ann.top,
                  left: ann.left,
                  transform: 'translateY(-50%)',
                  flexDirection: ann.side === 'right' ? 'row-reverse' : 'row',
                }}
              >
                {/* Ponto ember com pulse infinito (stagger via delay class) */}
                <span
                  className={`ember-dot ${ann.delayClass} relative z-10 flex-shrink-0`}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: 'hsl(var(--ember-400))',
                  }}
                />
                {/* Balao de texto */}
                <span
                  className="rounded px-2.5 py-1 text-[11.5px] font-medium leading-tight"
                  style={{
                    background: 'hsl(var(--night-900) / 0.92)',
                    border: '1px solid hsl(var(--ember-400) / 0.30)',
                    color: 'hsl(var(--ember-300))',
                    fontFamily: 'ui-monospace, "Geist Mono", monospace',
                    backdropFilter: 'blur(8px)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ann.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Caption */}
        <p
          className="mt-5 text-center text-[13px]"
          style={{
            color: 'hsl(var(--fog-300))',
            fontFamily: 'ui-monospace, "Geist Mono", monospace',
          }}
        >
          Resumo R$ 12.450 · 23 pedidos · 8/12 em producao · celular sincronizado
        </p>
      </div>
    </section>
  )
}
