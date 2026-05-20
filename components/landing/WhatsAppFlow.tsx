/**
 * WhatsAppFlow — section "Pedido do WhatsApp vira pedido no sistema"
 *
 * Section 4 do Brief Diego (2026-05-20).
 * Posição: ENTRE Features e WhyDifferent.
 *
 * Visual: whatsapp-chat-mock.svg (720x420) centralizado, max-w-[720px].
 * Headline Fraunces 500 48-56px conforme tipografia hierárquica do Brief.
 * Zero em-dash. PT-BR formal.
 *
 * Server Component: sem state, sem eventos de browser, sem hooks.
 * SVG carregado via <Image> Next (otimização automática).
 */

import Image from 'next/image'

export function WhatsAppFlow() {
  return (
    <section
      id="whatsapp-flow"
      className="grain-soft grain relative scroll-mt-20 border-t border-border/40"
      style={{ background: 'hsl(var(--night-950))' }}
    >
      <div className="container-warm relative mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-28">

        {/* Cabeçalho centralizado */}
        <div className="mx-auto mb-12 max-w-[720px] text-center">
          <div className="tag mb-4 inline-block">diferencial</div>

          {/* Fraunces 500 — Seção H2 conforme tabela tipográfica do Brief Diego */}
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

          <p
            className="mt-5 text-[17px] leading-[1.55] text-muted-foreground md:text-[18px]"
          >
            Cola o WhatsApp do cliente. Salva o pedido. Calcula o filamento.
            Mostra o lucro. Em 30 segundos.
          </p>
        </div>

        {/* Visual central — whatsapp-chat-mock.svg */}
        <div className="mx-auto max-w-[720px]">
          <div
            className="overflow-hidden rounded-[14px] border"
            style={{
              borderColor: 'hsl(var(--petrol-600) / 0.35)',
              boxShadow:
                '0 0 0 1px hsl(var(--petrol-600) / 0.18), 0 20px 56px hsl(var(--night-950) / 0.55)',
            }}
          >
            <Image
              src="/landing/v2/whatsapp-chat-mock.svg"
              alt="Conversa do WhatsApp à esquerda e ficha do pedido no Hayzer à direita: pedido #0847 Suporte Bambu X1 PLA preto, 2 unidades 200g, R$ 94 com 73% de margem"
              width={720}
              height={420}
              className="w-full"
              priority={false}
            />
          </div>

          {/* Caption em Geist Mono — mesmo padrão de ProductPreview */}
          <p
            className="mt-4 text-center text-[12.5px]"
            style={{
              color: 'hsl(var(--fog-300))',
              fontFamily: 'ui-monospace, "Geist Mono", monospace',
            }}
          >
            conversa WhatsApp real · ficha Hayzer gerada automaticamente · 73% margem calculada na hora
          </p>
        </div>

        {/* Detalhe: 3 micro-bullets abaixo do visual reforçam o fluxo */}
        <div
          className="mx-auto mt-10 grid max-w-[680px] gap-4 text-center sm:grid-cols-3"
        >
          {[
            { step: '01', label: 'Cola o número do cliente do WhatsApp' },
            { step: '02', label: 'Preenche o pedido. Hayzer calcula filamento e margem' },
            { step: '03', label: 'Cliente recebe confirmação. Estoque já baixou' },
          ].map(({ step, label }) => (
            <div
              key={step}
              className="flex flex-col items-center gap-2 rounded-[10px] border px-4 py-5"
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
    </section>
  )
}
