'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X } from 'lucide-react'

interface PaywallModalProps {
  open: boolean
  onClose: () => void
  /**
   * 'pdf'     trigger: clicou "Exportar PDF"
   * 'other'   trigger: histórico / multi-impressora / trocar moeda
   */
  trigger?: 'pdf' | 'other'
}

export function PaywallModal({ open, onClose, trigger = 'pdf' }: PaywallModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  // Foca o botão de fechar ao abrir (a11y: foco trap mínimo)
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

  // Bloqueia scroll do body enquanto modal está aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  const isPdf = trigger === 'pdf'

  const body = isPdf
    ? 'O PDF sai com seu nome no topo, o item, o prazo e o preço final. Formato pra você mandar direto pro cliente no WhatsApp.'
    : 'Histórico, várias impressoras com perfil próprio e cobrança em dólar/euro. Tudo pelos mesmos R$ 37 que você paga uma vez. Cada cálculo fica salvo no seu navegador. Volta quando precisar.'

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40"
            style={{ background: 'hsl(var(--night-950) / 0.75)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="paywall-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div
              className="relative w-full max-w-[480px] rounded-2xl p-7 md:p-8"
              style={{
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--petrol-400) / 0.3)',
                boxShadow:
                  '0 24px 64px -16px hsl(var(--night-950) / 0.8), inset 0 1px 0 hsl(var(--fog-50) / 0.06)',
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

              {/* Badge */}
              <div
                className="mb-5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em]"
                style={{
                  background: 'hsl(var(--petrol-500) / 0.12)',
                  border: '1px solid hsl(var(--petrol-400) / 0.25)',
                  color: 'hsl(var(--petrol-300))',
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: 'hsl(var(--petrol-300))' }}
                />
                Calculadora Pro
              </div>

              {/* Headline */}
              <h2
                id="paywall-title"
                className="text-[1.4rem] font-bold leading-[1.2] tracking-[-0.025em] text-foreground"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Essa parte é só na Pro.
              </h2>

              {/* Corpo */}
              <p className="mt-3 text-[14.5px] leading-[1.65] text-muted-foreground">
                {body}
              </p>

              <p className="mt-3 text-[14px] font-medium text-foreground">
                R$ 37 uma vez, pra sempre. Sem mensalidade.
              </p>

              {/* CTAs */}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/calculadora/pro"
                  className="flex-1 rounded-xl py-3 text-center text-[14px] font-semibold transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--petrol-300))] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  style={{
                    background: 'linear-gradient(180deg, hsl(var(--petrol-400)) 0%, hsl(var(--petrol-500)) 100%)',
                    color: 'hsl(var(--fog-50))',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.12) inset, 0 6px 20px -8px hsl(var(--petrol-500) / 0.5)',
                  }}
                  onClick={onClose}
                  aria-label="Ver detalhes da Calculadora Pro"
                >
                  Ver detalhes da Pro
                </Link>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border py-3 text-center text-[14px] font-medium text-muted-foreground transition-colors hover:border-[hsl(var(--fog-50)/0.2)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--petrol-300))]"
                  style={{ borderColor: 'hsl(var(--fog-50) / 0.1)' }}
                >
                  Continuar usando Grátis
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
