'use client'

/**
 * CatalogsEmptyState.tsx — Estado vazio da listagem de catalogos.
 *
 * ES-11 Variante A (2026-05-21, Felipe).
 * Tela em branco substituida por empty state educativo.
 * Icon: Store (Lucide). CTA primario: Criar primeiro catalogo.
 * Shell V4: icon wrapper petrol + headline + subtitle + helper text.
 *
 * Diferencia catalogo de portfolio em menos de 7 palavras no headline.
 */

import { Store, Plus } from 'lucide-react'

interface CatalogsEmptyStateProps {
  /** Callback para abrir modal de criacao */
  onCreateClick: () => void
}

export function CatalogsEmptyState({ onCreateClick }: CatalogsEmptyStateProps) {
  return (
    <div
      className="rounded-2xl border flex flex-col items-center justify-center py-20 gap-0 text-center px-6"
      style={{ background: 'var(--t-surface)', borderColor: 'var(--t-border)' }}
      role="status"
      aria-label="Nenhum catalogo criado ainda"
    >
      <div
        className="w-16 h-16 mb-5 rounded-2xl flex items-center justify-center"
        style={{
          background: 'hsl(173 58% 28% / 0.12)',
          border: '1px solid hsl(173 58% 28% / 0.25)',
          boxShadow: '0 0 32px hsl(173 58% 28% / 0.15)',
        }}
        aria-hidden="true"
      >
        <Store size={28} className="text-[hsl(173_30%_57%)]" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
        Teu catalogo publico fica aqui.
      </h3>

      <p className="text-sm text-foreground/65 leading-relaxed mb-6 max-w-xs">
        Cria um catalogo, adiciona os produtos que tu vende e compartilha o link com o
        cliente. Ele ve preco, foto e ja manda mensagem direto.
      </p>

      <button
        type="button"
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-colors"
        style={{
          background: 'hsl(173 58% 28%)',
          boxShadow: '0 0 20px hsl(173 58% 28% / 0.28)',
        }}
        aria-label="Criar primeiro catalogo"
      >
        <Plus size={15} aria-hidden="true" />
        Criar primeiro catalogo
      </button>

      <p className="text-xs text-foreground/50 mt-4 leading-relaxed">
        Diferente do portfolio, catalogo tem preco e botao de contato.
      </p>
    </div>
  )
}
