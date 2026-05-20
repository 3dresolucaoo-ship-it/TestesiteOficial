'use client'

/**
 * ContentEmptyState — estado vazio do módulo de conteúdo.
 * Extraído em 2026-05-20 (QW3 quick-win, Felipe).
 * Pattern idêntico ao InventoryEmptyState de app/inventory/_components/.
 */

import { Plus, BookOpen } from 'lucide-react'

interface ContentEmptyStateProps {
  /** Callback para abrir modal de criação */
  onCreateClick: () => void
}

export function ContentEmptyState({ onCreateClick }: ContentEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto px-6">
      <div
        className="w-16 h-16 mb-5 rounded-2xl flex items-center justify-center"
        style={{
          background: 'hsl(173 58% 28% / 0.12)',
          border: '1px solid hsl(173 58% 28% / 0.25)',
        }}
        aria-hidden="true"
      >
        <BookOpen size={28} className="text-[hsl(173_30%_57%)]" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
        Nenhum conteúdo registrado ainda
      </h3>
      <p className="text-sm text-foreground/70 leading-relaxed mb-6">
        Aqui você guarda anotações, pesquisas e referências do seu negócio. Registre uma ideia de post, acompanhe o status e veja quantas views cada conteúdo gerou.
      </p>
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 bg-[hsl(173_58%_28%)] hover:bg-[hsl(173_58%_32%)] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
      >
        <Plus size={15} aria-hidden="true" /> Criar primeiro conteúdo
      </button>
    </div>
  )
}
