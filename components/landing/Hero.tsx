'use client'

import { motion } from 'framer-motion'
import { Clock, Calculator } from 'lucide-react'
import Link from 'next/link'
import { Logo } from './Logo'
import { WaitlistForm } from './WaitlistForm'
import { track } from '@/lib/posthog'

interface HeroProps {
  /**
   * Total de makers já na fila — lido server-side em app/page.tsx via
   * getWaitlistCount() e passado como prop (sem fetch client-side).
   * Fallback: null = não exibe o indicador (erro de leitura, DB vazio).
   */
  waitlistCount: number | null
}

/**
 * Hero v2 (option-c-hybrid): split layout — logo gigante + headline esquerda,
 * form em "carta" com sticker direita. Paleta night/petrol/ember. Grain + vignette.
 *
 * Diego (designer): estrutura do mockup A + paleta do mockup B.
 * Carla (copy): mantém literal "Seu negócio, sem caos." com marker no "caos".
 *
 * Quick wins 2026-05-19:
 *   - #4 CTA secundário pra /calculadora
 *   - #5 Social proof "X makers na fila"
 */
export function Hero({ waitlistCount }: HeroProps) {
  return (
    <section
      id="hero"
      className="vignette grain relative overflow-hidden"
    >
      <div className="container-warm relative mx-auto max-w-[1180px] px-6 pt-16 pb-20 md:px-10 md:pt-24 md:pb-28">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-8">

          {/* COLUNA ESQUERDA — identidade + headline + prova social */}
          <div className="relative lg:col-span-7">

            {/* Logo gigante — vira identidade visual da landing */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
              className="mb-10"
            >
              <Logo size="lg" pulse />
            </motion.div>

            {/* Badge sticker âmbar */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
              className="sticker-amber mb-8 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11.5px] font-medium tracking-wide"
            >
              <Clock className="h-3 w-3" strokeWidth={2.5} />
              Lançamento em 27 de junho · vagas limitadas
            </motion.div>

            {/* Headline editorial Fraunces com marker handmade no "caos" */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
              className="display-h1 max-w-[680px] text-[3.5rem] text-foreground sm:text-[4.5rem] md:text-[5.5rem] lg:text-[6rem]"
            >
              Seu negócio,
              <br />
              <span className="italic-soft">sem </span>
              <span className="marker">caos</span>.
            </motion.h1>

            {/* Subtítulo */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
              className="mt-7 max-w-[540px] text-[17px] leading-[1.55] text-muted-foreground md:text-[18px]"
            >
              Você imprime, posta, vende, envia, cobra, anota. E ainda perde peça,
              esquece cliente, não sabe o que sobrou. Hayzer junta tudo num lugar só.
            </motion.p>

            {/* Lista "construído para" — sub-públicos maker 3D (ADR-010) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px]"
            >
              <span className="tag tag-fog">construído para</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'hsl(var(--petrol-400))' }} />
                lojas de impressão 3D
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'hsl(var(--petrol-400))' }} />
                estúdios maker
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'hsl(var(--petrol-400))' }} />
                vendedores de marketplace
              </span>
            </motion.div>

            {/* #4 — CTA secundário pra calculadora (quick win 2026-05-19) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
              className="mt-8"
            >
              <Link
                href="/calculadora"
                onClick={() => track('calculadora_cta_click', { source: 'hero' })}
                className="group inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-[13.5px] font-medium transition-colors"
                style={{
                  borderColor: 'hsl(var(--petrol-500) / 0.45)',
                  color: 'hsl(var(--petrol-300))',
                  background: 'hsl(var(--petrol-700) / 0.18)',
                }}
              >
                <Calculator className="h-3.5 w-3.5" strokeWidth={2} />
                Testa a calculadora grátis
              </Link>
              <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
                Calcula o custo da tua próxima impressão. De graça. Sem cadastro.
              </p>
            </motion.div>
          </div>

          {/* COLUNA DIREITA — form em "carta" com sticker rotacionado */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            id="waitlist"
            className="scroll-mt-20 lg:col-span-5"
          >
            {/*
              * Bug fix 2026-05-19: border-radius + overflow implícito do card-letter
              * clipava o sticker absolute -top-3 -right-3 em mobile (375px).
              * Wrapper overflow-visible + pt-3 abre espaço pro sticker aparecer acima.
              */}
            <div className="relative overflow-visible pt-3">
            <div className="card-letter relative rounded-[14px] p-7 md:p-8">
              {/* Carimbo rotacionado no canto */}
              <div className="sticker-amber absolute -top-3 -right-3 z-10 rotate-6 rounded-sm px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest">
                acesso antecipado
              </div>

              <div className="mb-1 flex items-baseline justify-between">
                <h2 className="display-h2 text-[22px] text-foreground">Lista de espera</h2>
                <span className="tag">grátis</span>
              </div>
              <p className="mb-3 text-[13.5px] leading-[1.5] text-muted-foreground">
                Receba o convite quando abrir. Sem cobrança agora.
              </p>

              {/* #5 — Social proof "X makers na fila" (quick win 2026-05-19) */}
              {/* TODO: dinamizar com query waitlist count — atualmente vem via prop server-side */}
              {waitlistCount !== null && waitlistCount > 0 && (
                <div
                  className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11.5px]"
                  style={{
                    background: 'hsl(var(--petrol-700) / 0.35)',
                    border: '1px solid hsl(var(--petrol-500) / 0.30)',
                    color: 'hsl(var(--petrol-200))',
                  }}
                >
                  <span
                    className="flex-shrink-0 rounded-full"
                    style={{
                      width: 6,
                      height: 6,
                      background: 'hsl(var(--petrol-300))',
                    }}
                  />
                  <span>
                    <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {waitlistCount.toLocaleString('pt-BR')}
                    </strong>
                    {' '}makers já na fila
                  </span>
                </div>
              )}

              <WaitlistForm />
            </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
