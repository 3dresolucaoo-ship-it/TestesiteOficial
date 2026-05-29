'use client'

/**
 * app/customers/_components/CustomersEmptyState.tsx
 *
 * Extraido de app/customers/page.tsx (inline MobileCards + DesktopTable).
 * Dois modos: `no-results` (filtro ativo sem resultado) e `empty` (zero clientes).
 * Padrao Shell V4 ES: icon container petrol 12% opacity + glow + CTA petrol.
 *
 * Clientes sao derivados de pedidos — CTA primario redireciona para /orders.
 *
 * Criado: 2026-05-29 (empty states sprint)
 */

import { Users, Plus } from 'lucide-react'

interface CustomersEmptyStateProps {
  /** Modo de exibicao: sem resultado com filtro ativo vs. estado genuinamente vazio */
  mode:           'empty' | 'no-results'
  /** Variante visual: mobile (mais compacto) vs. desktop (com icon container completo) */
  variant?:       'mobile' | 'desktop'
  onNewOrder:     () => void
  onClearFilters: () => void
}

export function CustomersEmptyState({
  mode,
  variant = 'desktop',
  onNewOrder,
  onClearFilters,
}: CustomersEmptyStateProps) {
  const isMobile = variant === 'mobile'

  if (mode === 'no-results') {
    return (
      <div
        className={`flex flex-col items-center justify-center text-center ${isMobile ? 'py-12 px-4' : 'py-16 max-w-sm mx-auto px-6'}`}
        role="status"
        aria-label="Nenhum cliente encontrado com os filtros ativos"
      >
        <Users size={28} className="text-foreground/20 mb-3" aria-hidden="true" />
        <p className="text-sm text-foreground/60 mb-3">
          Nenhum cliente com esses filtros.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="text-sm font-medium px-4 py-2 rounded-lg border transition-colors text-foreground/70 hover:text-foreground"
          style={{ border: '1px solid hsl(200 11% 20%)' }}
          aria-label="Limpar filtros e ver todos os clientes"
        >
          {isMobile ? 'Ver todos' : 'Limpar filtros'}
        </button>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center px-4"
        role="status"
        aria-label="Nenhum cliente registrado ainda"
      >
        <Users size={32} className="text-[hsl(173_30%_57%)] mb-3" aria-hidden="true" />
        <h3 className="text-base font-semibold text-foreground mb-1.5">
          Ainda sem cliente
        </h3>
        <p className="text-xs text-foreground/65 leading-relaxed max-w-xs mb-4">
          Seu primeiro pedido cria o cliente automatico aqui. Registra um pedido pra comecar.
        </p>
        <button
          type="button"
          onClick={onNewOrder}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-colors"
          style={{
            background: 'hsl(173 58% 28%)',
            boxShadow:  '0 0 20px hsl(173 58% 28% / 0.28)',
          }}
          aria-label="Registrar primeiro pedido"
        >
          <Plus size={15} aria-hidden="true" />
          Registrar pedido
        </button>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto px-6"
      role="status"
      aria-label="Nenhum cliente registrado ainda"
    >
      <div
        className="w-16 h-16 mb-5 rounded-2xl flex items-center justify-center"
        style={{
          background: 'hsl(173 58% 28% / 0.12)',
          border:     '1px solid hsl(173 58% 28% / 0.25)',
          boxShadow:  '0 0 36px hsl(173 58% 28% / 0.18)',
        }}
        aria-hidden="true"
      >
        <Users size={28} className="text-[hsl(173_30%_57%)]" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
        Ainda sem cliente
      </h3>
      <p className="text-sm text-foreground/65 leading-relaxed mb-5 max-w-xs">
        Seu primeiro pedido cria o cliente automatico aqui. Cada venda nova aparece nessa lista.
      </p>
      <button
        type="button"
        onClick={onNewOrder}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-colors"
        style={{
          background: 'hsl(173 58% 28%)',
          boxShadow:  '0 0 24px hsl(173 58% 28% / 0.30)',
        }}
        aria-label="Registrar primeiro pedido"
      >
        <Plus size={15} aria-hidden="true" />
        Registrar pedido
      </button>
    </div>
  )
}
