'use client'

/**
 * components/finance/FinanceEmptyState.tsx
 *
 * Extraido de FinanceView.tsx (bloco inline nas linhas 397..480).
 * Estado vazio quando nao ha transacoes nem custos fixos registrados.
 * Padrao Shell V4 ES: icon container petrol + glow + 2 CTAs (receita + despesa).
 *
 * Criado: 2026-05-29 (empty states sprint)
 */

import { DollarSign, Plus } from 'lucide-react'

interface FinanceEmptyStateProps {
  onAddReceita:  () => void
  onAddDespesa:  () => void
}

export function FinanceEmptyState({ onAddReceita, onAddDespesa }: FinanceEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center text-center py-14 px-6 mb-6 rounded-2xl max-w-md mx-auto"
      role="status"
      aria-label="Financeiro sem lancamentos"
    >
      <div
        className="w-14 h-14 mb-5 rounded-2xl flex items-center justify-center"
        style={{
          background: 'hsl(173 58% 28% / 0.12)',
          border:     '1px solid hsl(173 58% 28% / 0.25)',
          boxShadow:  '0 0 32px hsl(173 58% 28% / 0.15)',
        }}
        aria-hidden="true"
      >
        <DollarSign size={24} className="text-[hsl(173_30%_57%)]" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
        Sem dinheiro entrando, sem dinheiro saindo
      </h3>

      <p className="text-sm text-foreground/65 leading-relaxed max-w-sm mb-6">
        Registra a primeira receita ou despesa e o Hayzer mostra lucro real, margem e break-even do seu negocio.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-2">
        <button
          type="button"
          onClick={onAddReceita}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-colors"
          style={{
            background: 'hsl(173 58% 28%)',
            boxShadow:  '0 0 20px hsl(173 58% 28% / 0.28)',
          }}
          aria-label="Adicionar primeira receita no financeiro"
        >
          <Plus size={15} aria-hidden="true" />
          Registrar receita
        </button>

        <button
          type="button"
          onClick={onAddDespesa}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-foreground/70 font-medium text-sm border transition-colors hover:text-foreground"
          style={{ border: '1px solid hsl(200 11% 20%)' }}
          aria-label="Adicionar primeira despesa no financeiro"
        >
          <Plus size={15} aria-hidden="true" />
          Registrar despesa
        </button>
      </div>
    </div>
  )
}
