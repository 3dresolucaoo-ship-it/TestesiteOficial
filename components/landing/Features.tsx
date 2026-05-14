'use client'

import { motion } from 'framer-motion'

interface Feature {
  num: string
  title: string
  body: string
  size: 'lg' | 'sm'
  glow?: boolean
  icon: React.ReactNode
}

// Ícones SVG duotone custom (não lucide default 24x24) — anti-IA.
// .icon-bg pega fill petrol/10%, .icon-stroke pega petrol-300 stroke 1.5.
const features: Feature[] = [
  {
    num: '01 — estoque',
    title: 'Estoque que conta certo.',
    body: 'Cada peça impressa, vendida ou perdida fica registrada sem você lembrar. Acabou a planilha que ninguém atualiza.',
    size: 'lg',
    icon: (
      <svg width="42" height="42" viewBox="0 0 48 48" className="icon-warm" fill="none">
        <rect className="icon-bg" x="6" y="14" width="36" height="28" rx="2"/>
        <path className="icon-stroke" d="M6 14 L24 6 L42 14 L42 42 L24 50 L6 42 Z"/>
        <path className="icon-stroke" d="M6 14 L24 22 L42 14"/>
        <line className="icon-stroke" x1="24" y1="22" x2="24" y2="50"/>
      </svg>
    ),
  },
  {
    num: '02 — vendas',
    title: 'Venda no mesmo lugar.',
    body: 'Pedido do WhatsApp vira link de pagamento. Cliente paga, sistema baixa estoque. Você só confirma envio.',
    size: 'sm',
    icon: (
      <svg width="42" height="42" viewBox="0 0 48 48" className="icon-warm" fill="none">
        <rect className="icon-bg" x="10" y="6" width="28" height="38" rx="2"/>
        <path className="icon-stroke" d="M10 6 L38 6 L38 44 L34 41 L30 44 L26 41 L22 44 L18 41 L14 44 L10 41 Z"/>
        <line className="icon-stroke" x1="16" y1="16" x2="32" y2="16"/>
        <line className="icon-stroke" x1="16" y1="22" x2="32" y2="22"/>
        <line className="icon-stroke" x1="16" y1="28" x2="26" y2="28"/>
      </svg>
    ),
  },
  {
    num: '03 — clientes',
    title: 'Sabe quem sumiu.',
    body: 'Cliente que comprava todo mês e parou aparece na sua tela. Antes do prejuízo virar perda real.',
    size: 'sm',
    icon: (
      <svg width="42" height="42" viewBox="0 0 48 48" className="icon-warm" fill="none">
        <circle className="icon-bg" cx="18" cy="18" r="8"/>
        <circle className="icon-stroke" cx="18" cy="18" r="8"/>
        <circle className="icon-stroke" cx="34" cy="16" r="6"/>
        <path className="icon-stroke" d="M4 42 C 4 32, 32 32, 32 42"/>
        <path className="icon-stroke" d="M30 30 C 38 30, 44 34, 44 42"/>
      </svg>
    ),
  },
  {
    num: '04 — financeiro',
    title: 'O dinheiro real do mês.',
    body: 'Não é "faturamento bruto". É o que sobrou depois de tudo. Direto, sem precisar abrir Excel.',
    size: 'lg',
    glow: true,
    icon: (
      <svg width="42" height="42" viewBox="0 0 48 48" className="icon-warm" fill="none">
        <rect className="icon-bg" x="4" y="14" width="40" height="26" rx="2"/>
        <polyline className="icon-stroke" points="6 34 16 24 22 30 32 18 42 26"/>
        <line className="icon-stroke" x1="6" y1="42" x2="42" y2="42"/>
        <circle className="icon-stroke" cx="16" cy="24" r="1.5" fill="currentColor"/>
        <circle className="icon-stroke" cx="32" cy="18" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
]

export function Features() {
  return (
    <section
      id="features"
      className="grain-soft grain relative border-y border-border/40"
      style={{ background: 'hsl(var(--night-900))' }}
    >
      <div className="container-warm relative mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-28">

        {/* Cabeçalho de seção alinhado à esquerda (não centralizado padrão) */}
        <div className="mb-14 max-w-[680px] md:mb-16">
          <div className="tag mb-3">o que ele faz</div>
          <h2 className="display-h2 text-[2.5rem] text-foreground md:text-[3.5rem]">
            Quatro coisas. <br />Bem feitas.
          </h2>
          <p className="mt-5 max-w-[480px] text-[16px] leading-[1.55] text-muted-foreground">
            Sem 200 botões pra você decifrar. Sem dashboard que ninguém entende. Direto no que muda o dia.
          </p>
        </div>

        {/* Asymmetric grid: lg:1.15fr 0.85fr → cards com proporções diferentes (anti 2x2 padrão) */}
        <div
          className="grid gap-5"
          style={{
            gridTemplateColumns: '1fr',
          }}
        >
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
                <h3 className={`display-h2 text-foreground ${f.size === 'lg' ? 'text-[1.625rem] md:text-[1.875rem]' : 'text-[1.5rem] md:text-[1.75rem]'}`}>
                  {f.title}
                </h3>
                <p className={`mt-4 ${f.size === 'lg' ? 'text-[15.5px] max-w-[440px]' : 'text-[15px]'} leading-[1.6] text-muted-foreground`}>
                  {f.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
