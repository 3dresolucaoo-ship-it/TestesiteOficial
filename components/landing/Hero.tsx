'use client'

import { motion } from 'framer-motion'
import { WaitlistForm } from './WaitlistForm'

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-16 pb-20 md:pt-20 md:pb-24"
    >
      {/* Glow ambiente — sutil, sem cara de IA */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          aria-hidden
          className="absolute left-1/2 top-1/3 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.12]"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 60%)',
            filter:     'blur(80px)',
          }}
        />
      </div>

      <div className="mx-auto max-w-5xl px-6 text-center">
        {/* Pre-tag */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur-sm"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          Lançamento em 04 de julho · vagas limitadas
        </motion.div>

        {/* Headline — Carla: direto, sem cara de IA */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-[2.5rem] font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-[5.5rem]"
        >
          Seu negócio,
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--muted-foreground)) 100%)',
            }}
          >
            sem caos.
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
        >
          Substitui gambiarra, planilha perdida e WhatsApp confuso por controle real.
          Estoque, vendas, clientes, financeiro. Num lugar só.
        </motion.p>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          id="waitlist"
          className="mt-8 scroll-mt-20"
        >
          <WaitlistForm />
        </motion.div>

        {/* Social proof inicial — honesto */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-xs text-muted-foreground/70"
        >
          Sem cobrança agora. Você recebe um email quando abrir.
        </motion.p>
      </div>
    </section>
  )
}
