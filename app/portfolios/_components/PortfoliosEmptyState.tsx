'use client'

/**
 * app/portfolios/_components/PortfoliosEmptyState.tsx
 *
 * Reescrita de PortfoliosView.tsx (inline bloco com tokens velhos: var(--t-surface),
 * var(--t-border), var(--t-text-muted), CTA #7c3aed roxo).
 * Atualizado para padrao Shell V4 ES: icon container petrol 12% + glow + CTA petrol.
 *
 * Criado: 2026-05-29 (empty states sprint)
 */

import { FolderOpen, Plus } from 'lucide-react'

interface PortfoliosEmptyStateProps {
  onCreateClick: () => void
}

export function PortfoliosEmptyState({ onCreateClick }: PortfoliosEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto px-6"
      role="status"
      aria-label="Nenhum portfolio criado ainda"
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
        <FolderOpen size={28} className="text-[hsl(173_30%_57%)]" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
        Nenhum portfolio ainda
      </h3>

      <p className="text-sm text-foreground/65 leading-relaxed mb-2 max-w-xs">
        Portfolios sao paginas publicas pra mostrar seus trabalhos e receber contatos.
        Compartilha o link direto com clientes.
      </p>

      <p className="text-xs text-foreground/45 leading-relaxed mb-6 max-w-xs">
        Cada portfolio pode ter foto, bio, WhatsApp e link pro seu catalogo de produtos.
      </p>

      <button
        type="button"
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-colors"
        style={{
          background: 'hsl(173 58% 28%)',
          boxShadow:  '0 0 20px hsl(173 58% 28% / 0.28)',
        }}
        aria-label="Criar primeiro portfolio"
      >
        <Plus size={15} aria-hidden="true" />
        Criar primeiro portfolio
      </button>
    </div>
  )
}
