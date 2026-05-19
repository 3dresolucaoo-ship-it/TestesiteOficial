/**
 * ProductPreview — section #2 da landing.
 *
 * "Não precisa imaginar. Olha como fica."
 *
 * Server Component: sem state, sem eventos de browser.
 * Exibe screenshot do módulo /orders V4 com anotações maker reais.
 *
 * Screenshot: public/landing/orders-preview.png
 * (gerada manualmente a partir de /mockups/orders-v4-tom-novo.html — instrução em comentário abaixo)
 *
 * Como gerar o screenshot:
 *   1. Abrir hayzer.com.br/mockups/orders-v4-tom-novo.html no Chrome (1440x900)
 *   2. DevTools → Screenshot (ou extensão "Full Page Screen Capture")
 *   3. Salvar em public/landing/orders-preview.png (largura mínima 1280px)
 *   4. Comprimir em squoosh.app (webp, qualidade 82, max 400kb)
 *
 * Até o asset existir, o componente exibe um placeholder com as anotações
 * para que o layout seja validado visualmente sem bloquear o deploy.
 */

import Image from 'next/image'
import { existsSync } from 'fs'
import path from 'path'

// ─── Anotações que apontam pro screenshot ───────────────────────────────────

interface Annotation {
  label: string
  /** Posição relativa dentro do container da imagem (0–100%) */
  top: string
  left: string
  /** Lado em que o balão aparece: 'left' ancora à direita do ponto, 'right' ancora à esquerda */
  side: 'left' | 'right'
}

const ANNOTATIONS: Annotation[] = [
  {
    label: 'filamento calculado por grama',
    top: '28%',
    left: '18%',
    side: 'left',
  },
  {
    label: 'comissão Shopee descontada',
    top: '52%',
    left: '62%',
    side: 'right',
  },
  {
    label: 'WhatsApp do cliente vinculado',
    top: '74%',
    left: '38%',
    side: 'left',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hasScreenshot(): boolean {
  try {
    const p = path.join(process.cwd(), 'public', 'landing', 'orders-preview.png')
    return existsSync(p)
  } catch {
    return false
  }
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function ProductPreview() {
  const screenshotExists = hasScreenshot()

  return (
    <section
      id="produto"
      className="grain-soft grain relative scroll-mt-20 border-b border-border/40"
      style={{ background: 'hsl(var(--night-950))' }}
    >
      <div className="container-warm relative mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-28">

        {/* Cabeçalho */}
        <div className="mb-12 max-w-[680px]">
          <div className="tag mb-3">como fica</div>
          <h2
            className="display-h2 text-foreground"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', lineHeight: 1.2 }}
          >
            Não precisa imaginar.{' '}
            <span className="italic-soft">Olha como fica.</span>
          </h2>
          <p className="mt-5 max-w-[520px] text-[16px] leading-[1.55] text-muted-foreground">
            Pedido do WhatsApp, filamento contado, comissão descontada.
            Tudo numa tela só. Nada de planilha, nada de memória.
          </p>
        </div>

        {/* Container da imagem + anotações */}
        <div
          className="relative overflow-hidden rounded-[12px] border"
          style={{
            borderColor: 'hsl(var(--fog-50) / 0.10)',
            boxShadow: '0 0 0 1px hsl(var(--petrol-600) / 0.25), 0 24px 64px hsl(var(--night-950) / 0.6)',
          }}
        >
          {screenshotExists ? (
            <>
              <Image
                src="/landing/orders-preview.png"
                alt="Tela de pedidos do Hayzer mostrando pedido do WhatsApp com filamento calculado, comissão Shopee descontada e margem real"
                width={1280}
                height={760}
                className="w-full object-cover object-top"
                priority={false}
                quality={85}
              />

              {/* Anotações sobrepostas — visíveis apenas em md+ */}
              <div className="pointer-events-none absolute inset-0 hidden md:block">
                {ANNOTATIONS.map((ann) => (
                  <div
                    key={ann.label}
                    className="absolute flex items-center gap-2"
                    style={{ top: ann.top, left: ann.left, transform: 'translateY(-50%)' }}
                  >
                    {/* Ponto de referência */}
                    <span
                      className="relative z-10 flex-shrink-0"
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: 'hsl(var(--ember-400))',
                        boxShadow: '0 0 0 3px hsl(var(--ember-400) / 0.25)',
                      }}
                    />
                    {/* Balão de texto */}
                    <span
                      className="rounded px-2.5 py-1 text-[11.5px] font-medium leading-tight"
                      style={{
                        background: 'hsl(var(--night-900) / 0.92)',
                        border: '1px solid hsl(var(--ember-400) / 0.30)',
                        color: 'hsl(var(--ember-300))',
                        fontFamily: 'ui-monospace, "Geist Mono", monospace',
                        backdropFilter: 'blur(8px)',
                        whiteSpace: 'nowrap',
                        order: ann.side === 'right' ? -1 : undefined,
                      }}
                    >
                      {ann.label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Placeholder até screenshot existir */
            <div
              className="flex min-h-[340px] flex-col items-center justify-center gap-6 p-10 md:min-h-[480px]"
              style={{ background: 'hsl(var(--night-900))' }}
            >
              {/* Simulação visual das 3 anotações como "cards" de preview */}
              <div className="w-full max-w-[560px] space-y-4">
                {ANNOTATIONS.map((ann) => (
                  <div
                    key={ann.label}
                    className="flex items-center gap-3 rounded-md border px-4 py-3"
                    style={{
                      borderColor: 'hsl(var(--ember-400) / 0.25)',
                      background: 'hsl(var(--night-850) / 0.7)',
                    }}
                  >
                    <span
                      className="flex-shrink-0 rounded-full"
                      style={{
                        width: 8,
                        height: 8,
                        background: 'hsl(var(--ember-400))',
                      }}
                    />
                    <span
                      className="text-[13px]"
                      style={{
                        color: 'hsl(var(--ember-300))',
                        fontFamily: 'ui-monospace, "Geist Mono", monospace',
                      }}
                    >
                      {ann.label}
                    </span>
                  </div>
                ))}
              </div>

              <p
                className="text-center text-[12px]"
                style={{ color: 'hsl(var(--fog-400))' }}
              >
                screenshot em breve · mockup aprovado em 18/05
              </p>
            </div>
          )}
        </div>

        {/* Caption abaixo da imagem */}
        <p
          className="mt-5 text-center text-[13px]"
          style={{
            color: 'hsl(var(--fog-300))',
            fontFamily: 'ui-monospace, "Geist Mono", monospace',
          }}
        >
          Suporte Bambu X1C · PLA Preto 200g · custo R$ 12,40 · preço R$ 47 · margem 73%
        </p>
      </div>
    </section>
  )
}
