'use client'

// Sofia (CS) — 2026-05-16:
// Estado de boas-vindas do dashboard quando user nunca criou projeto.
// Resolve FP-01 (dashboard vazio sem instrução) + FP-02 (dependência oculta projeto→inventário→produto).
// Aparece SOMENTE se state.projects.length === 0.

import Link from 'next/link'
import { Cube, Disc, Package, ArrowRight } from '@phosphor-icons/react/dist/ssr'

interface WelcomeDashboardProps {
  userName?: string | null
}

const STEPS = [
  {
    n: 1,
    icon: Cube,
    title: 'Crie seu primeiro projeto',
    description: 'Um projeto agrupa tudo de um negócio — pode ser "Minha Ender 3", "Loja 3D" ou seu nome mesmo.',
  },
  {
    n: 2,
    icon: Disc,
    title: 'Adicione um filamento ao estoque',
    description: 'Com o filamento registrado, o Hayzer calcula sozinho o custo de cada peça que você imprime.',
  },
  {
    n: 3,
    icon: Package,
    title: 'Cadastre o primeiro produto',
    description: 'Aqui o sistema mostra preço sugerido, margem real e quanto cobrar em cada marketplace.',
  },
]

export function WelcomeDashboard({ userName }: WelcomeDashboardProps) {
  const greeting = userName ? `Bem-vindo ao Hayzer, ${userName.split(' ')[0]}` : 'Bem-vindo ao Hayzer'

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {/* Hero */}
      <div className="text-center mb-12">
        <div
          className="inline-flex w-16 h-16 mb-6 rounded-2xl items-center justify-center"
          style={{
            background: 'hsl(173 58% 28% / 0.15)',
            border: '1px solid hsl(173 58% 28% / 0.30)',
            boxShadow: '0 0 40px hsl(173 58% 28% / 0.25)',
          }}
        >
          <span className="text-3xl font-bold text-[hsl(173_30%_57%)]">H</span>
        </div>

        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-3">
          {greeting}
        </h1>
        <p className="text-base text-foreground/70 leading-relaxed max-w-xl mx-auto">
          Vamos configurar seu negócio de impressão 3D em 3 passos. Leva uns 2 minutos.
        </p>
      </div>

      {/* Passos */}
      <div className="space-y-3 mb-10">
        {STEPS.map(step => {
          const Icon = step.icon
          return (
            <div
              key={step.n}
              className="flex items-start gap-4 p-5 rounded-xl transition-colors"
              style={{
                background: 'hsl(200 11% 9%)',
                border: '1px solid hsl(200 11% 14%)',
              }}
            >
              <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm"
                style={{
                  background: 'hsl(173 58% 28% / 0.18)',
                  color: 'hsl(173 30% 57%)',
                }}
              >
                {step.n}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={18} weight="duotone" className="text-[hsl(173_30%_57%)]" />
                  <h3 className="text-sm font-semibold text-foreground">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm text-foreground/65 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA primário */}
      <div className="flex flex-col items-center gap-3">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[hsl(173_58%_28%)] hover:bg-[hsl(173_58%_32%)] text-white font-medium transition-colors"
          style={{ boxShadow: '0 0 30px hsl(173 58% 28% / 0.35)' }}
        >
          Criar meu primeiro projeto
          <ArrowRight size={16} weight="bold" />
        </Link>

        <p className="text-xs text-foreground/50">
          Você pode ajustar tudo depois — nada aqui é definitivo.
        </p>
      </div>
    </div>
  )
}
