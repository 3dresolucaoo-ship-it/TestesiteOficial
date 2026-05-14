'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export function ThankYouHero({ email }: { email: string }) {
  return (
    <section className="relative overflow-hidden pt-24 pb-12 md:pt-32">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          aria-hidden
          className="absolute left-1/2 top-1/3 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.10]"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 60%)',
            filter:     'blur(80px)',
          }}
        />
      </div>

      <div className="mx-auto max-w-2xl px-6 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary shadow-[0_0_40px_-8px_hsl(var(--primary)/0.5)]"
        >
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-4xl font-bold tracking-tight md:text-5xl"
        >
          Você entrou.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-5 text-lg leading-relaxed text-muted-foreground"
        >
          Mandei a confirmação pra <span className="font-medium text-foreground">{email}</span>.
          <br />A gente avisa antes de todo mundo quando abrir.
        </motion.p>
      </div>
    </section>
  )
}
