'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

interface Feature {
  num: string
  title: string
  body: string
  size: 'lg' | 'sm'
  glow?: boolean
  icon: React.ReactNode
}

// Ícones maker (SVG assets Diego 2026-05-20) aplicados nas features mais relevantes.
// 01 estoque/filamento → filament-spool.svg (128x128)
// 02 vendas/pedidos   → whatsapp-pix.svg    (128x80)
// 03 clientes         → SVG inline custom (sem asset maker equivalente)
// 04 financeiro/prod  → printer-3d.svg      (128x128)
// Tamanho render: 64x64 (escala visual do grid de features).
const features: Feature[] = [
  {
    num: '01 — estoque',
    title: 'Estoque que conta certo.',
    body: 'Cada rolo de filamento, cada peça impressa, cada peça que falhou na hora, tudo entra no sistema sem você anotar. Acabou descobrir no dia 30 que sumiu meio kg de PLA preto.',
    size: 'lg',
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
    size: 'sm',
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
    size: 'sm',
    icon: (
      <svg width="42" height="42" viewBox="0 0 48 48" className="icon-warm" fill="none" aria-hidden="true">
        <circle className="icon-bg" cx="18" cy="18" r="8"/>
        <circle className="icon-stroke" cx="18" cy="18" r="8"/>
        <circle className="icon-stroke" cx="34" cy="16" r="6"/>
        <path className="icon-stroke" d="M4 42 C 4 32, 32 32, 32 42"/>
        <path className="icon-stroke" d="M30 30 C 38 30, 44 34, 44 42"/>
      </svg>
    ),
  },
  {
    num: '04 — impressão',
    title: 'O dinheiro real do mês.',
    body: 'Tira filamento, luz, comissão do marketplace, taxa de cartão. O que sobra é o que aparece. Sem precisar abrir Excel para descobrir se foi um mês bom.',
    size: 'lg',
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
          <p className="mt-5 max-w-[520px] text-[16px] leading-[1.55] text-muted-foreground">
            Você toca impressão 3D, não departamento de TI. Aqui é só o que muda
            seu dia: estoque, venda, cliente, dinheiro.
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
