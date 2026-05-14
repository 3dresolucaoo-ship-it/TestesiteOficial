'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function FinalCTA() {
  return (
    <section className="border-t border-border/40 py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold tracking-tight md:text-5xl"
        >
          Bora tirar isso da cabeça?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mt-5 text-lg text-muted-foreground"
        >
          Sai quando quiser. Sem cartão agora, sem letra miúda.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-9"
        >
          <Link
            href="#waitlist"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-base font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.6)]"
          >
            Entrar na lista de espera
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
