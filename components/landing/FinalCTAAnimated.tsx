'use client'

/**
 * FinalCTAAnimated — conteúdo do FinalCTA com framer-motion.
 *
 * Importado via dynamic() em FinalCTA.tsx (ssr: false).
 * Separa o bundle do framer-motion do first paint da landing.
 *
 * Performance 2026-05-19: terceiro componente da estratégia lazy load.
 * FinalCTA está no fim da página, é o último a ser visto — candidato
 * ideal para dynamic import sem impacto visual.
 */

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function FinalCTAAnimated() {
  return (
    <div className="max-w-[760px]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="tag mb-5"
      >
        o convite
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="display-h2 text-[2.75rem] text-foreground md:text-[4.25rem]"
      >
        Bora tirar isso
        <br />
        da <span className="italic-soft">cabeça</span>?
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6 max-w-[460px] text-[17px] leading-[1.55] text-muted-foreground"
      >
        Sai quando quiser. Sem cartão agora, sem letra miúda.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-10"
      >
        <Link
          href="#waitlist"
          className="btn-light inline-flex items-center gap-2 rounded-md px-6 py-3 text-[14.5px]"
        >
          Entrar na lista de espera
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-14 flex items-center gap-3 text-[12px]"
        style={{ color: 'hsl(var(--fog-400))' }}
      >
        <span style={{ fontFamily: 'ui-monospace, "Geist Mono", monospace' }}>em breve</span>
        <span className="h-px w-8" style={{ background: 'hsl(var(--fog-400) / 0.3)' }} />
        <span>lançamento público</span>
      </motion.div>
    </div>
  )
}
