/**
 * PrinterShowcase — section entre Hero e ProductPreview.
 *
 * Anti-IA: foto real de Bambu A1 imprimindo 28 peças amarelas (do CEO).
 * Ancora nicho em 0.3s, prova social visual. Persona Rafael ve "isso e
 * uma Bambu de verdade, esse cara conhece" antes da copy entrar na cabeca.
 *
 * Layout split:
 * - lg+ : foto coluna esquerda 5/12, copy coluna direita 7/12
 * - mobile: stack natural (foto em cima)
 *
 * Tratamento da imagem:
 * - Borda 1px petrol/ember sutil
 * - Vinheta interna (radial-gradient na propria image via box-shadow inset)
 * - Grain herda do parent (.grain class)
 *
 * Server Component: sem state, sem motion (animacoes pesadas ja no Hero e ProductPreview).
 */

import Image from 'next/image'

export function PrinterShowcase() {
  return (
    <section
      id="autentico"
      className="grain-soft grain relative scroll-mt-20 border-b border-border/40"
      style={{ background: 'hsl(var(--night-950))' }}
    >
      <div className="container-warm relative mx-auto max-w-[1180px] px-6 py-16 md:px-10 md:py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">

          {/* Foto — coluna esquerda (5/12 em desktop, full em mobile) */}
          <div className="lg:col-span-5">
            {/*
              * Bug fix 2026-05-19: ratio 9/16 portrait em mobile 375px gerava imagem
              * ~667px de altura, enterrando a copy abaixo do fold imediatamente.
              * Solução: aspect-[4/3] mobile → aspect-[9/16] lg+ via classes Tailwind.
              */}
            <div
              className="relative mx-auto aspect-[4/3] max-w-[420px] overflow-hidden rounded-[14px] lg:aspect-[9/16] lg:max-w-none"
              style={{
                borderColor: 'hsl(var(--petrol-600) / 0.30)',
                boxShadow:
                  '0 0 0 1px hsl(var(--petrol-500) / 0.25), 0 32px 80px hsl(var(--night-950) / 0.7), inset 0 0 120px hsl(var(--night-950) / 0.4)',
              }}
            >
              <Image
                src="/landing/v2/printer-hero.jpg"
                alt="Bambu Lab A1 imprimindo 28 peças cônicas em PLA amarelo com listras verdes, build plate 256 por 256 milímetros"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 420px"
                className="object-cover"
                style={{
                  // Leve dessaturação + warmth shift pra harmonizar com paleta night/ember
                  filter: 'saturate(0.92) contrast(1.04) brightness(0.96)',
                }}
                quality={88}
              />

              {/* Overlay vinheta nas bordas */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(120% 80% at 50% 50%, transparent 55%, hsl(var(--night-950) / 0.35) 100%)',
                }}
              />
            </div>

            {/* Caption mono abaixo da foto */}
            <p
              className="mt-4 text-center text-[11.5px] tracking-wide"
              style={{
                color: 'hsl(var(--fog-400))',
                fontFamily: 'ui-monospace, "Geist Mono", monospace',
                letterSpacing: '0.05em',
              }}
            >
              Bambu Lab A1 · 28 peças · PLA amarelo + verde · build plate 256×256
            </p>
          </div>

          {/* Copy — coluna direita (7/12 em desktop) */}
          <div className="lg:col-span-7">
            <div className="tag mb-4">de quem imprime</div>

            <h2
              className="display-h2 text-foreground"
              style={{
                fontSize: 'clamp(2.2rem, 4.2vw, 3.5rem)',
                lineHeight: 1.18,
              }}
            >
              Construído pra quem{' '}
              <span className="italic-soft">imprime de verdade</span>
            </h2>

            <p
              className="mt-6 max-w-[560px] text-[16px] leading-[1.6] text-muted-foreground md:text-[17px]"
            >
              Bambu, Ender, Creality. PLA, PETG, ABS. Filamento amarelo,
              encomenda de 28 peças, prazo na sexta. Tudo isso entra
              na conta. Sem stock photo, sem render bonitinho.
              É o teu galpão, é a tua peça.
            </p>

            {/* 3 micro-bullets editoriais */}
            <ul className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-6">
              <li>
                <div
                  className="mb-1.5 text-[11px] uppercase tracking-[0.14em]"
                  style={{
                    color: 'hsl(var(--petrol-300))',
                    fontFamily: 'ui-monospace, "Geist Mono", monospace',
                  }}
                >
                  máquinas
                </div>
                <p className="text-[14px] leading-[1.45] text-foreground/85">
                  Bambu A1, X1C, P1S, Ender 3, Creality K1
                </p>
              </li>
              <li>
                <div
                  className="mb-1.5 text-[11px] uppercase tracking-[0.14em]"
                  style={{
                    color: 'hsl(var(--petrol-300))',
                    fontFamily: 'ui-monospace, "Geist Mono", monospace',
                  }}
                >
                  filamentos
                </div>
                <p className="text-[14px] leading-[1.45] text-foreground/85">
                  PLA, PETG, ABS, TPU, fibra de carbono
                </p>
              </li>
              <li>
                <div
                  className="mb-1.5 text-[11px] uppercase tracking-[0.14em]"
                  style={{
                    color: 'hsl(var(--petrol-300))',
                    fontFamily: 'ui-monospace, "Geist Mono", monospace',
                  }}
                >
                  canais
                </div>
                <p className="text-[14px] leading-[1.45] text-foreground/85">
                  WhatsApp, Shopee, Mercado Livre, Instagram
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
