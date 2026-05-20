'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X } from 'lucide-react'
import { track } from '@/lib/posthog'

interface CalcUpsellModalProps {
  open: boolean
  onClose: () => void
  /** Quantas tentativas após o cap (6, 7, 8...) — pra PostHog */
  attemptN: number
}

const proPrice =
  process.env.NEXT_PUBLIC_CALC_PRO_PRICE_MONTHLY ?? '19'

export function CalcUpsellModal({ open, onClose, attemptN }: CalcUpsellModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  // Foco no fechar ao abrir (a11y)
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => closeRef.current?.focus(), 60)
      return () => clearTimeout(t)
    }
  }, [open])

  // Fecha com Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Bloqueia scroll do body
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])

  // Rastreia abertura do modal (PostHog)
  useEffect(() => {
    if (open) {
      track('calc_free_limite_atingido', { tentativa_n: attemptN })
    }
  }, [open, attemptN])

  function handleProClick() {
    track('calc_pro_checkout_click', { origem: 'upsell_modal' })
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="upsell-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40"
            style={{ background: 'hsl(var(--night-950) / 0.78)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="upsell-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upsell-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div
              className="relative w-full max-w-[460px] rounded-2xl p-7 md:p-8"
              style={{
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--ember-400) / 0.35)',
                boxShadow:
                  '0 24px 64px -16px hsl(var(--night-950) / 0.85), inset 0 1px 0 hsl(var(--fog-50) / 0.06)',
              }}
            >
              {/* Fechar */}
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[hsl(var(--fog-50)/0.06)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--petrol-300))]"
                aria-label="Fechar modal"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>

              {/* Badge ember */}
              <div
                className="mb-5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em]"
                style={{
                  background: 'hsl(var(--ember-500) / 0.12)',
                  border: '1px solid hsl(var(--ember-400) / 0.3)',
                  color: 'hsl(var(--ember-300))',
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: 'hsl(var(--ember-300))' }}
                />
                5/5 hoje
              </div>

              {/* Headline */}
              <h2
                id="upsell-modal-title"
                className="text-[1.4rem] font-bold leading-[1.2] tracking-[-0.025em] text-foreground"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Fechou seus 5 cálculos do dia
              </h2>

              {/* Corpo */}
              <p className="mt-3 text-[14.5px] leading-[1.65] text-muted-foreground">
                Pro libera sem limite + PDF pro cliente + histórico do mês por R${proPrice}/mês.
                Cancela a qualquer hora.
              </p>

              {/* CTAs */}
              <div className="mt-7 flex flex-col gap-3">
                <Link
                  href="/calculadora/pro"
                  className="flex items-center justify-center rounded-xl py-3.5 text-center text-[14.5px] font-semibold transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--petrol-300))] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  style={{
                    background: 'linear-gradient(180deg, hsl(var(--petrol-400)) 0%, hsl(var(--petrol-500)) 100%)',
                    color: 'hsl(var(--fog-50))',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.12) inset, 0 6px 20px -8px hsl(var(--petrol-500) / 0.5)',
                  }}
                  onClick={handleProClick}
                  aria-label="Ver plano Pro da calculadora"
                >
                  Ver Pro
                </Link>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl py-2.5 text-center text-[13px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--petrol-300))]"
                  aria-label="Fechar e voltar amanhã"
                >
                  Volto amanhã
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
