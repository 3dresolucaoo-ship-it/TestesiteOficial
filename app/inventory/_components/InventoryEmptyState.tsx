'use client'

/**
 * InventoryEmptyState: estados vazios do módulo de inventário.
 * Dois estados: estoque totalmente vazio vs. filtro sem resultados.
 * Extraído de app/inventory/page.tsx em 2026-05-19 (refactor Felipe).
 *
 * Sofia (CS) 2026-05-16: empty state customizado pro maker 3D.
 * Explica que filamento é o início, mostra benefício direto (cálculo de custo).
 */

import { Plus, Package } from 'lucide-react'

interface InventoryEmptyStateProps {
  /** Modo: estoque vazio vs. filtro sem resultados */
  mode: 'empty' | 'no-results'
  /** Callback para abrir modal de criação (usado só no modo 'empty') */
  onCreateClick?: () => void
}

export function InventoryEmptyState({ mode, onCreateClick }: InventoryEmptyStateProps) {
  if (mode === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto px-6">
        <div
          className="w-16 h-16 mb-5 rounded-2xl flex items-center justify-center"
          style={{
            background: 'hsl(173 58% 28% / 0.12)',
            border: '1px solid hsl(173 58% 28% / 0.25)',
          }}
        >
          <Package size={28} className="text-[hsl(173_30%_57%)]" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
          Teu estoque tá vazio
        </h3>
        <p className="text-sm text-foreground/70 leading-relaxed mb-6">
          Começa cadastrando o filamento que tu usa agora. Com ele registrado, o Hayzer calcula sozinho o custo de cada peça que tu imprime.
        </p>
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 bg-[hsl(173_58%_28%)] hover:bg-[hsl(173_58%_32%)] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={15} /> Adicionar primeiro filamento
        </button>
        <p className="text-xs text-foreground/50 mt-5 leading-relaxed">
          Cadastra filamento, equipamento e qualquer material que entra no custo da peça.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Package size={36} className="text-[#2a2a2a] mb-3" />
      <p className="text-[#555555] text-sm">
        Nenhum item corresponde aos filtros.
      </p>
    </div>
  )
}
