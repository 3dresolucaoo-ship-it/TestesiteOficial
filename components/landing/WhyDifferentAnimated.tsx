'use client'

/**
 * WhyDifferentAnimated — tabela comparativa + pull quote com framer-motion.
 *
 * Importado via dynamic() em WhyDifferent.tsx (ssr: false).
 * Separa o bundle do framer-motion do first paint da landing.
 *
 * Performance 2026-05-19: parte da estratégia lazy load que visa TBT <1.0s.
 * Dados espelhados de WhyDifferent.tsx — manter em sync se copy mudar.
 */

import { motion } from 'framer-motion'

const today = [
  { label: 'Bling para o estoque',               price: 'R$ 119' },
  { label: 'Conta Azul para o financeiro',        price: 'R$ 199' },
  { label: 'Nuvemshop para o checkout',           price: 'R$ 89'  },
  { label: 'Mais 2 planilhas que ninguém atualiza', price: 'tempo'  },
]

const withHayzer = [
  { strong: 'Estoque integrado',                      sub: 'sem assinar separado'       },
  { strong: 'Financeiro que vê o dinheiro real do mês', sub: 'não o bruto'               },
  { strong: 'Checkout que conversa com estoque',      sub: 'pedido baixa peça'          },
  { strong: 'Tudo num lugar só',                      sub: 'ninguém precisa lembrar'    },
]

// Preço provisório — CEO define na Sem 3 com lançamento da Calc Pro
const HAYZER_PRICE = 'a partir de R$ 49/mês'

export function WhyDifferentAnimated() {
  return (
    <>
      {/* Tabela comparativa — split com borda divisória */}
      <div
        className="grid overflow-hidden rounded-[12px] border lg:grid-cols-2"
        style={{
          borderColor: 'hsl(var(--fog-50) / 0.08)',
          background: 'hsl(var(--night-900) / 0.6)',
        }}
      >
        {/* HOJE (esquerda) */}
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
            <h3 className="display-h2 text-[20px] text-muted-foreground">Hoje tu tem</h3>
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

        {/* COM HAYZER (direita) */}
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
            className="mb-6 border-b pb-4"
            style={{ borderColor: 'hsl(var(--petrol-300) / 0.20)' }}
          >
            <div className="flex items-baseline justify-between">
              <h3 className="display-h2 text-[20px]" style={{ color: 'hsl(var(--petrol-300))' }}>
                Com Hayzer
              </h3>
              <span className="tag">um lugar só</span>
            </div>
            <div
              className="mt-2 text-[13px] font-medium"
              style={{ color: 'hsl(var(--ember-400))' }}
            >
              {HAYZER_PRICE}
            </div>
          </div>
          <ul className="space-y-4">
            {withHayzer.map((row, i) => (
              <li
                key={row.strong}
                className={i < withHayzer.length - 1 ? 'border-b pb-4' : 'pb-1'}
                style={{
                  borderColor:
                    i < withHayzer.length - 1 ? 'hsl(var(--petrol-300) / 0.15)' : 'transparent',
                }}
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

      {/* Frase âncora destaque — pull quote pós-tabela (ADR-010) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-12 md:mt-16"
      >
        <p className="display-h2 max-w-[820px] text-[1.75rem] leading-[1.3] text-foreground md:text-[2.25rem]">
          Quatro sistemas, nenhum conversa.
          <br />
          <span className="italic-soft">Aqui é um, e fala </span>
          <span className="marker">português</span>
        </p>
      </motion.div>
    </>
  )
}
