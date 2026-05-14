'use client'

import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'

const comparisons = [
  {
    them: 'Bling pro estoque · 119 reais por mês',
    us:   'Estoque integrado, sem assinar separado',
  },
  {
    them: 'Conta Azul pro financeiro · 199 reais por mês',
    us:   'Financeiro que vê o dinheiro real do mês',
  },
  {
    them: 'Nuvemshop pro checkout · 89 reais por mês',
    us:   'Checkout que conversa com estoque',
  },
  {
    them: 'Mais 2 planilhas que ninguém atualiza',
    us:   'Tudo num lugar. Ninguém precisa lembrar.',
  },
]

export function WhyDifferent() {
  return (
    <section id="por-que" className="py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Por que diferente
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Outros sistemas parecem feitos pra contador.
            <br />
            <span className="text-muted-foreground">Este é pra quem toca o negócio.</span>
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Hoje */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-border/40 bg-card/30 p-7"
          >
            <p className="mb-5 text-sm font-medium text-muted-foreground">
              Hoje você tem
            </p>
            <ul className="space-y-3.5">
              {comparisons.map(c => (
                <li key={c.them} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-destructive/30 text-destructive">
                    <X className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  <span className="text-muted-foreground">{c.them}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* BVaz Hub */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-7 shadow-[0_0_40px_-12px_hsl(var(--primary)/0.4)]"
          >
            <p className="mb-5 text-sm font-medium text-primary">Com BVaz Hub</p>
            <ul className="space-y-3.5">
              {comparisons.map(c => (
                <li key={c.us} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  <span>{c.us}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
