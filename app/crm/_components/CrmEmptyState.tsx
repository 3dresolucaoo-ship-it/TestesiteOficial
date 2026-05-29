'use client'

/**
 * app/crm/_components/CrmEmptyState.tsx
 * Empty state para as duas tabs do CRM.
 * Tab "pipeline" vazia: CTA criar primeiro lead.
 * Tab "clients" vazia: explicacao sobre como clientes aparecem.
 *
 * Atualizado 2026-05-29: cor CTA corrigida (#7c3aed roxa -> petrol),
 * tokens de texto corrigidos (#ebebeb/#888888 -> text-foreground/text-foreground/65),
 * glow adicionado ao icon container, role+aria adicionados.
 */

import { Users, UserCheck, Plus } from 'lucide-react'

interface CrmEmptyStateProps {
  tab:           'pipeline' | 'clients'
  onCreateLead?: () => void
}

export function CrmEmptyState({ tab, onCreateLead }: CrmEmptyStateProps) {
  if (tab === 'pipeline') {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto px-6"
        role="status"
        aria-label="Pipeline de leads vazio"
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
          <Users size={24} className="text-[hsl(173_30%_57%)]" aria-hidden="true" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2 tracking-tight">
          Seu primeiro lead esta esperando
        </h3>
        <p className="text-sm text-foreground/65 leading-relaxed mb-6 max-w-xs">
          Registra os contatos que chegam pelo WhatsApp, Instagram ou indicacoes.
          O Hayzer acompanha cada etapa do funil ate o fechamento.
        </p>
        {onCreateLead && (
          <button
            type="button"
            onClick={onCreateLead}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-colors"
            style={{
              background: 'hsl(173 58% 28%)',
              boxShadow:  '0 0 20px hsl(173 58% 28% / 0.28)',
            }}
            aria-label="Criar primeiro lead no CRM"
          >
            <Plus size={15} aria-hidden="true" />
            Criar primeiro lead
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto px-6"
      role="status"
      aria-label="Lista de clientes do CRM vazia"
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
        <UserCheck size={24} className="text-[hsl(173_30%_57%)]" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2 tracking-tight">
        Nenhum cliente ainda
      </h3>
      <p className="text-sm text-foreground/65 leading-relaxed max-w-xs">
        Cliente aparece aqui automatico quando você marca um lead como{' '}
        <span className="text-[hsl(173_50%_55%)]">Ganho</span> ou quando um pedido fica com status{' '}
        <span className="text-[hsl(173_50%_55%)]">Pago</span> ou{' '}
        <span className="text-[hsl(173_35%_65%)]">Entregue</span>.
      </p>
    </div>
  )
}
