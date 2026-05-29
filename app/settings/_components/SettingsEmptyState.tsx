'use client'

/**
 * app/settings/_components/SettingsEmptyState.tsx
 *
 * First-time experience: usuario abriu o Hayzer pela primeira vez,
 * nenhum projeto criado ainda (projectsCount === 0).
 * Orienta a configurar nome e meta mensal como primeiro passo.
 * Padrao Shell V4 ES: icon container petrol + glow + CTA petrol.
 *
 * Criado: 2026-05-29 (empty states sprint — unico genuinamente novo)
 */

import { Settings, ChevronRight } from 'lucide-react'

interface SettingsEmptyStateProps {
  /** Callback para focar o primeiro campo do SettingsView (nome do negocio) */
  onConfigure: () => void
}

export function SettingsEmptyState({ onConfigure }: SettingsEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center text-center py-16 px-6 max-w-md mx-auto"
      role="status"
      aria-label="Configuracao inicial do Hayzer"
    >
      <div
        className="w-16 h-16 mb-5 rounded-2xl flex items-center justify-center"
        style={{
          background: 'hsl(173 58% 28% / 0.12)',
          border:     '1px solid hsl(173 58% 28% / 0.25)',
          boxShadow:  '0 0 32px hsl(173 58% 28% / 0.15)',
        }}
        aria-hidden="true"
      >
        <Settings size={28} className="text-[hsl(173_30%_57%)]" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
        Configura seu espaco primeiro
      </h3>

      <p className="text-sm text-foreground/65 leading-relaxed mb-2 max-w-xs">
        Antes de registrar pedidos, define o nome do seu negocio e a meta mensal.
        Leva menos de 2 minutos.
      </p>

      <p className="text-xs text-foreground/45 leading-relaxed mb-6 max-w-xs">
        O Hayzer usa essas informacoes pra calcular progresso de meta e personalizar os modulos.
      </p>

      <button
        type="button"
        onClick={onConfigure}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-colors"
        style={{
          background: 'hsl(173 58% 28%)',
          boxShadow:  '0 0 20px hsl(173 58% 28% / 0.28)',
        }}
        aria-label="Comecar configuracao do negocio"
      >
        Configurar agora
        <ChevronRight size={15} aria-hidden="true" />
      </button>
    </div>
  )
}
