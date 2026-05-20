'use client'

/**
 * ProductionEmptyState.tsx — Estado vazio do modulo de producao.
 *
 * Extraido de app/production/page.tsx (2026-05-20).
 * Exibe icone + mensagem + botao de acao quando nao ha itens na fila.
 */

import { Printer, Plus } from 'lucide-react'

interface ProductionEmptyStateProps {
  onAdd: () => void
}

export function ProductionEmptyState({ onAdd }: ProductionEmptyStateProps) {
  return (
    <div className="py-20 text-center" role="status" aria-label="Fila de producao vazia">
      <Printer
        size={36}
        className="text-[#2a2a3a] mx-auto mb-4"
        aria-hidden="true"
      />
      <p className="text-[#555566] text-sm">
        Fila vazia. Adicione um item de producao.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-4 py-2.5 rounded-xl mx-auto transition-all"
        aria-label="Adicionar primeiro item de producao"
      >
        <Plus size={15} aria-hidden="true" /> Adicionar item
      </button>
    </div>
  )
}
