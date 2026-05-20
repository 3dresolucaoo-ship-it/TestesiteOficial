'use client'

/**
 * FeaturesAnimated — grid de cards com framer-motion.
 *
 * Importado via dynamic() em Features.tsx (ssr: false) para separar o
 * bundle do framer-motion do first paint da landing.
 *
 * A lista de features está duplicada aqui intencionalmente: não é possível
 * passar ReactNode como prop através de um dynamic import boundary sem
 * serialização. A fonte da verdade dos dados é este arquivo; Features.tsx
 * serve apenas como shell SSR + ponto de dynamic import.
 *
 * Performance 2026-05-19: TBT alvo <1.0s (era 2.6s). Features, WhyDifferent
 * e FinalCTA movidos para dynamic ssr:false.
 */

import { motion } from 'framer-motion'
import Image from 'next/image'

const features = [
  {
    num: '01 — estoque',
    title: 'Estoque que conta certo.',
    body: 'Cada rolo de filamento, cada peça impressa, cada peça que falhou na hora, tudo entra no sistema sem você anotar. Acabou descobrir no dia 30 que sumiu meio kg de PLA preto.',
    size: 'lg' as const,
    glow: false,
    icon: (
      <Image
        src="/landing/v2/filament-spool.svg"
        alt="Spool de filamento PLA 1KG"
        width={64}
        height={64}
        aria-hidden="true"
      />
    ),
  },
  {
    num: '02 — vendas',
    title: 'Venda no mesmo lugar.',
    body: 'Pedido do WhatsApp vira link de pagamento em dois toques. Cliente paga, o estoque baixa, a peça entra na fila de impressão. Você só confirma o envio.',
    size: 'sm' as const,
    glow: false,
    icon: (
      <Image
        src="/landing/v2/whatsapp-pix.svg"
        alt="WhatsApp e Pix integrados"
        width={64}
        height={40}
        aria-hidden="true"
      />
    ),
  },
  {
    num: '03 — clientes',
    title: 'Sabe quem sumiu.',
    body: 'Cliente que pedia personalizado todo mês e parou aparece na sua tela antes de você esquecer dele. Recompra de maker é ouro, e quase ninguém cuida.',
    size: 'sm' as const,
    glow: false,
    icon: (
      <svg width="42" height="42" viewBox="0 0 48 48" className="icon-warm" fill="none" aria-hidden="true">
        <circle className="icon-bg" cx="18" cy="18" r="8" />
        <circle className="icon-stroke" cx="18" cy="18" r="8" />
        <circle className="icon-stroke" cx="34" cy="16" r="6" />
        <path className="icon-stroke" d="M4 42 C 4 32, 32 32, 32 42" />
        <path className="icon-stroke" d="M30 30 C 38 30, 44 34, 44 42" />
      </svg>
    ),
  },
  {
    num: '04 — impressão',
    title: 'O dinheiro real do mês.',
    body: 'Tira filamento, luz, comissão do marketplace, taxa de cartão. O que sobra é o que aparece. Sem precisar abrir Excel para descobrir se foi um mês bom.',
    size: 'lg' as const,
    glow: true,
    icon: (
      <Image
        src="/landing/v2/printer-3d.svg"
        alt="Impressora 3D estilizada"
        width={64}
        height={64}
        aria-hidden="true"
      />
    ),
  },
]

export function FeaturesAnimated() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      {features.map((f, i) => (
        <motion.article
          key={f.num}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 0.61, 0.36, 1] }}
          className={`feature-card p-7 md:p-10 ${f.glow ? 'feature-card-glow' : ''}`}
        >
          <div className="mb-6 flex items-start justify-between">
            <div className="tag">{f.num}</div>
            {f.icon}
          </div>
          <h3
            className={`display-h2 text-foreground ${
              f.size === 'lg' ? 'text-[1.625rem] md:text-[1.875rem]' : 'text-[1.5rem] md:text-[1.75rem]'
            }`}
          >
            {f.title}
          </h3>
          <p
            className={`mt-4 leading-[1.6] text-muted-foreground ${
              f.size === 'lg' ? 'text-[15.5px] max-w-[440px]' : 'text-[15px]'
            }`}
          >
            {f.body}
          </p>
        </motion.article>
      ))}
    </div>
  )
}
