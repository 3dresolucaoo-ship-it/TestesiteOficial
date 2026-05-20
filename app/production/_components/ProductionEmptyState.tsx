'use client'

/**
 * ProductionEmptyState.tsx — Estado vazio do modulo de producao.
 *
 * Extraido de app/production/page.tsx (2026-05-20).
 * Reescrito FP-03 (2026-05-21 hardwork etapa 3): copy educativa sobre fluxo
 * automatico pedido -> producao + 2 CTAs (ir para pedidos / adicionar manual).
 */

import { Printer, Plus, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

interface ProductionEmptyStateProps {
  onAdd: () => void
}

export function ProductionEmptyState({ onAdd }: ProductionEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center text-center py-14 px-6 max-w-md mx-auto"
      role="status"
      aria-label="Fila de producao vazia"
    >
      <div
        className="w-14 h-14 mb-5 rounded-2xl flex items-center justify-center"
        style={{
          background: 'hsl(173 58% 28% / 0.12)',
          border: '1px solid hsl(173 58% 28% / 0.25)',
          boxShadow: '0 0 32px hsl(173 58% 28% / 0.15)',
        }}
        aria-hidden="true"
      >
        <Printer size={26} className="text-[hsl(173_30%_57%)]" />
      </div>

      <h3 className="text-base font-semibold text-foreground mb-2 tracking-tight">
        Fila de producao vazia
      </h3>

      <p className="text-sm text-foreground/65 leading-relaxed mb-6">
        Sua fila aparece aqui automaticamente quando voce cria um pedido com produto vinculado. Ou adicione manualmente se preferir.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-2">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-colors"
          style={{
            background: 'hsl(173 58% 28%)',
            boxShadow: '0 0 20px hsl(173 58% 28% / 0.28)',
          }}
          aria-label="Ir para modulo de pedidos"
        >
          <ShoppingCart size={15} aria-hidden="true" />
          Ir para Pedidos
        </Link>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-foreground/70 font-medium text-sm border transition-colors hover:text-foreground"
          style={{ border: '1px solid hsl(200 11% 20%)' }}
          aria-label="Adicionar item de producao manualmente"
        >
          <Plus size={15} aria-hidden="true" />
          Adicionar manualmente
        </button>
      </div>
    </div>
  )
}
