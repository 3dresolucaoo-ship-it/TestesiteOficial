'use client'

import { motion } from 'framer-motion'
import { Boxes, Receipt, Users, TrendingUp } from 'lucide-react'

const features = [
  {
    icon: Boxes,
    title: 'Estoque que conta certo',
    body:  'Cada peça impressa, vendida ou perdida — registrada sem você lembrar. Acabou a planilha que ninguém atualiza.',
  },
  {
    icon: Receipt,
    title: 'Venda + checkout no mesmo lugar',
    body:  'Pedido do WhatsApp vira link de pagamento. Cliente paga, sistema baixa estoque. Você só confirma envio.',
  },
  {
    icon: Users,
    title: 'Sabe quem sumiu — e por quê',
    body:  'Cliente que comprava todo mês e parou aparece na sua tela. Antes do prejuízo virar perda real.',
  },
  {
    icon: TrendingUp,
    title: 'O dinheiro real do mês',
    body:  'Não é "faturamento bruto" — é o que sobrou depois de tudo. Direto, sem precisar abrir Excel.',
  },
]

export function Features() {
  return (
    <section id="features" className="border-y border-border/40 bg-card/30 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Quatro coisas no lugar do caos.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Sem assinar 5 apps separados pra cada coisa não conversar.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-border/40 bg-border/40 md:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group relative bg-background p-8 transition-colors hover:bg-card/60 md:p-10"
            >
              <div
                aria-hidden
                className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-card text-primary transition-all group-hover:border-primary/40 group-hover:shadow-[0_0_24px_-6px_hsl(var(--primary)/0.4)]"
              >
                <f.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
