'use client'

/**
 * app/crm/_components/CrmEmptyState.tsx
 * Empty state para as duas tabs do CRM.
 * Tab "pipeline" vazia → CTA criar primeiro lead.
 * Tab "clients" vazia → explicacao sobre como clientes aparecem.
 */

import { Users, UserCheck } from 'lucide-react'

interface CrmEmptyStateProps {
  tab:           'pipeline' | 'clients'
  onCreateLead?: () => void
}

export function CrmEmptyState({ tab, onCreateLead }: CrmEmptyStateProps) {
  if (tab === 'pipeline') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div
          className="w-14 h-14 mb-4 rounded-2xl flex items-center justify-center"
          style={{
            background: 'hsl(173 58% 28% / 0.12)',
            border:     '1px solid hsl(173 58% 28% / 0.25)',
          }}
          aria-hidden="true"
        >
          <Users size={24} className="text-[hsl(173_30%_57%)]" aria-hidden="true" />
        </div>
        <h3 className="text-base font-semibold text-[#ebebeb] mb-2 tracking-tight">
          Seu primeiro lead esta esperando
        </h3>
        <p className="text-sm text-[#888888] leading-relaxed mb-4 max-w-xs">
          Registre os contatos que chegam pelo WhatsApp, Instagram ou indicacoes.
          O Hayzer acompanha cada etapa do funil ate o fechamento.
        </p>
        {onCreateLead && (
          <button
            type="button"
            onClick={onCreateLead}
            className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Criar primeiro lead
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div
        className="w-14 h-14 mb-4 rounded-2xl flex items-center justify-center"
        style={{
          background: 'hsl(173 58% 28% / 0.12)',
          border:     '1px solid hsl(173 58% 28% / 0.25)',
        }}
        aria-hidden="true"
      >
        <UserCheck size={24} className="text-[hsl(173_30%_57%)]" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-[#ebebeb] mb-2 tracking-tight">
        Nenhum cliente ainda
      </h3>
      <p className="text-sm text-[#888888] leading-relaxed max-w-xs">
        Cliente aparece aqui automatico quando você marca um lead como{' '}
        <span className="text-[#10b981]">Ganho</span> ou quando um pedido fica com status{' '}
        <span className="text-[#10b981]">Pago</span> ou{' '}
        <span className="text-[#a78bfa]">Entregue</span>.
      </p>
    </div>
  )
}
