'use client'

import { motion } from 'framer-motion'

const today = [
  { label: 'Bling pro estoque',         price: 'R$ 119' },
  { label: 'Conta Azul pro financeiro', price: 'R$ 199' },
  { label: 'Nuvemshop pro checkout',    price: 'R$ 89' },
  { label: 'Mais 2 planilhas que ninguém atualiza', price: 'tempo' },
]

const withBvaz = [
  { strong: 'Estoque integrado', sub: 'sem assinar separado' },
  { strong: 'Financeiro que vê o dinheiro real do mês', sub: 'não o bruto' },
  { strong: 'Checkout que conversa com estoque', sub: 'pedido baixa peça' },
  { strong: 'Tudo num lugar só', sub: 'ninguém precisa lembrar' },
]

export function WhyDifferent() {
  return (
    <section id="por-que" className="grain-soft grain relative scroll-mt-20">
      <div className="container-warm relative mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-28">

        {/* Cabeçalho 2 colunas — heading esquerda, copy explicativa direita */}
        <div className="mb-14 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="tag mb-3">por quê</div>
            <h2 className="display-h2 text-[2.5rem] text-foreground md:text-[3.5rem]">
              Hoje você paga
              <br />
              por <span className="italic-soft">quatro coisas</span>.
            </h2>
          </div>
          <div className="lg:col-span-7 lg:pt-4">
            <p className="text-[17px] leading-[1.55] text-muted-foreground">
              Bling, Conta Azul, Nuvemshop, mais duas planilhas. R$ 407 por mês só de assinatura.
              Nenhuma conversa com a outra. Você cola tudo no susto.
            </p>
          </div>
        </div>

        {/* Tabela comparativa — split com borda divisória */}
        <div
          className="grid overflow-hidden rounded-[12px] border lg:grid-cols-2"
          style={{
            borderColor: 'hsl(var(--fog-50) / 0.08)',
            background: 'hsl(var(--night-900) / 0.6)',
          }}
        >
          {/* HOJE (esquerda) — bg neutro escuro */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grain-soft grain relative border-b p-7 lg:border-b-0 lg:border-r md:p-10"
            style={{ borderColor: 'hsl(var(--fog-50) / 0.08)' }}
          >
            <div
              className="mb-6 flex items-baseline justify-between border-b pb-4"
              style={{ borderColor: 'hsl(var(--fog-50) / 0.10)' }}
            >
              <h3 className="display-h2 text-[20px] text-muted-foreground">Hoje você tem</h3>
              <span className="tag" style={{ color: 'hsl(var(--ember-400))' }}>R$ 407/mês</span>
            </div>
            <ul className="space-y-4">
              {today.map((row, i) => (
                <li
                  key={row.label}
                  className={i < today.length - 1 ? 'compare-row pb-4' : 'pb-1'}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[15px] text-foreground/90">{row.label}</span>
                    <span
                      className="text-[13px]"
                      style={{
                        fontFamily: 'ui-monospace, "Geist Mono", monospace',
                        color: 'hsl(var(--fog-300))',
                      }}
                    >
                      {row.price}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* COM BVAZ (direita) — bg gradient verde-petróleo sutil */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative p-7 md:p-10"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--petrol-500) / 0.14) 0%, hsl(var(--petrol-500) / 0.04) 100%)',
            }}
          >
            <div
              className="mb-6 flex items-baseline justify-between border-b pb-4"
              style={{ borderColor: 'hsl(var(--petrol-300) / 0.20)' }}
            >
              <h3 className="display-h2 text-[20px]" style={{ color: 'hsl(var(--petrol-300))' }}>
                Com BVaz Hub
              </h3>
              <span className="tag">um lugar só</span>
            </div>
            <ul className="space-y-4">
              {withBvaz.map((row, i) => (
                <li
                  key={row.strong}
                  className={i < withBvaz.length - 1 ? 'border-b pb-4' : 'pb-1'}
                  style={{ borderColor: i < withBvaz.length - 1 ? 'hsl(var(--petrol-300) / 0.15)' : 'transparent' }}
                >
                  <div className="text-[15px] font-medium text-foreground">{row.strong}</div>
                  <div
                    className="mt-0.5 text-[13px]"
                    style={{ color: 'hsl(var(--fog-300))' }}
                  >
                    {row.sub}
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
