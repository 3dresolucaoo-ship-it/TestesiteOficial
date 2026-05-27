'use client'

/**
 * WhatsAppFlow — section "Pedido do WhatsApp vira pedido no sistema"
 *
 * v2 (2026-05-21): substitui whatsapp-chat-mock.svg por whats-bagunca.webp real.
 * Layout: split 2 colunas desktop (PNG esquerda col-5, copy+steps direita col-7).
 * Mobile: PNG topo max-w-[280px] mx-auto, copy+steps abaixo.
 *
 * PNG entra com .reveal-zoom-fade via useRevealOnScroll (IO threshold 0.3).
 * Step-cards usam .stagger-children existente (0/50/100ms delay).
 *
 * Headline original mantida ("Pedido do WhatsApp vira pedido no sistema").
 * Tag mono extra acima da imagem: "e assim que o seu zap parece HOJE".
 *
 * Client Component: necessario pelo useRevealOnScroll (IO).
 */

import { useRevealOnScroll } from '@/lib/hooks/useRevealOnScroll'

export function WhatsAppFlow() {
  const { ref: imgRef, isVisible: imgVisible } = useRevealOnScroll<HTMLDivElement>({
    threshold: 0.3,
    once: true,
  })

  return (
    <section
      id="whatsapp-flow"
      className="grain-soft grain relative scroll-mt-20 border-t border-border/40"
      style={{ background: 'hsl(var(--night-950))' }}
    >
      <div className="container-warm relative mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-28">

        {/* Cabecalho */}
        <div className="mb-12 max-w-[720px]">
          <div className="tag mb-4 inline-block">diferencial</div>

          <h2
            className="display-h2 text-foreground"
            style={{
              fontSize: 'clamp(2.4rem, 4.5vw, 3.5rem)',
              lineHeight: 1.18,
              fontWeight: 500,
            }}
          >
            Pedido do WhatsApp vira pedido no sistema
          </h2>

          <p className="mt-5 text-[17px] leading-[1.55] text-muted-foreground md:text-[18px]">
            Cola o WhatsApp do cliente. Salva o pedido. Calcula o filamento.
            Mostra o lucro. Em 30 segundos.
          </p>
        </div>

        {/* Layout split: PNG esquerda + steps direita */}
        <div className="grid items-start gap-10 md:grid-cols-12 md:gap-14">

          {/* PNG — col-5 em md+, max-w-[280px] centralizado mobile */}
          <div className="md:col-span-5">
            {/* Tag mono acima */}
            <p
              className="mb-3 text-[11px] uppercase tracking-[0.10em]"
              style={{
                color: 'hsl(var(--fog-400))',
                fontFamily: 'ui-monospace, "Geist Mono", monospace',
              }}
            >
              e assim que o seu zap parece HOJE
            </p>

            {/* Imagem com reveal on scroll */}
            <div
              ref={imgRef}
              className={`reveal-zoom-fade reveal-img mx-auto max-w-[280px] md:mx-0 md:max-w-none${imgVisible ? ' is-visible' : ''}`}
            >
              <div
                className="overflow-hidden rounded-[14px] border"
                style={{
                  borderColor: 'hsl(var(--petrol-600) / 0.35)',
                  boxShadow:
                    '0 0 0 1px hsl(var(--petrol-600) / 0.18), 0 20px 56px hsl(var(--night-950) / 0.55)',
                }}
              >
                <picture>
                  <source
                    media="(max-width: 640px)"
                    srcSet="/landing/v3/optimized/whats-bagunca-480w.webp"
                    type="image/webp"
                  />
                  <source
                    media="(max-width: 1280px)"
                    srcSet="/landing/v3/optimized/whats-bagunca-1080w.webp"
                    type="image/webp"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/landing/v3/optimized/whats-bagunca-1920w.webp"
                    alt="Maker exausto segurando celular com conversa do WhatsApp Pedidos 3D URGENTE, varias mensagens nao respondidas, papeis e impressora 3D ao fundo"
                    loading="lazy"
                    decoding="async"
                    width={450}
                    height={800}
                    className="aspect-[9/16] w-full object-cover"
                  />
                </picture>
              </div>

              <p
                className="mt-3 text-center text-[11.5px] md:text-left"
                style={{
                  color: 'hsl(var(--fog-300))',
                  fontFamily: 'ui-monospace, "Geist Mono", monospace',
                }}
              >
                conversa WhatsApp real · zap bagunca do maker
              </p>
            </div>
          </div>

          {/* Copy + 3 step-cards — col-7 em md+ */}
          <div className="md:col-span-7">
            <div className="stagger-children grid gap-4">
              {[
                { step: '01', label: 'Cola o número do cliente do WhatsApp' },
                { step: '02', label: 'Preenche o pedido. Hayzer calcula filamento e margem' },
                { step: '03', label: 'Cliente recebe confirmação. Estoque já baixou' },
              ].map(({ step, label }) => (
                <div
                  key={step}
                  className="flex flex-col gap-2 rounded-[10px] border px-4 py-5"
                  style={{
                    borderColor: 'hsl(var(--petrol-600) / 0.22)',
                    background: 'hsl(var(--petrol-700) / 0.10)',
                  }}
                >
                  <span
                    className="text-[11px] font-medium tracking-widest"
                    style={{
                      fontFamily: 'ui-monospace, "Geist Mono", monospace',
                      color: 'hsl(var(--petrol-300))',
                    }}
                  >
                    {step}
                  </span>
                  <p
                    className="text-[14px] leading-[1.5]"
                    style={{ color: 'hsl(var(--fog-200))' }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
