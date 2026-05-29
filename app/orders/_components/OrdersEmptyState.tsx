'use client'

/**
 * app/orders/_components/OrdersEmptyState.tsx
 *
 * Extraido de app/orders/page.tsx (inline MobileCards + DesktopTable).
 * Dois modos: `no-results` (filtro ativo sem resultado) e `empty` (zero pedidos).
 * Padrao Shell V4 ES: icon container petrol 12% opacity + glow + CTA petrol.
 *
 * Criado: 2026-05-29 (empty states sprint)
 */

import { ShoppingCart, Plus } from 'lucide-react'

interface OrdersEmptyStateProps {
  /** Modo de exibicao: sem resultado com filtro ativo vs. estado genuinamente vazio */
  mode:           'empty' | 'no-results'
  /** Variante visual: mobile (mais compacto) vs. desktop (com icon container completo) */
  variant?:       'mobile' | 'desktop'
  onCreateClick:  () => void
  onClearFilters: () => void
}

export function OrdersEmptyState({
  mode,
  variant = 'desktop',
  onCreateClick,
  onClearFilters,
}: OrdersEmptyStateProps) {
  const isMobile = variant === 'mobile'

  if (mode === 'no-results') {
    return (
      <div
        className={`flex flex-col items-center justify-center text-center ${isMobile ? 'py-12 px-4' : 'py-16 max-w-sm mx-auto px-6'}`}
        role="status"
        aria-label="Nenhum pedido encontrado com os filtros ativos"
      >
        <ShoppingCart
          size={28}
          className="text-foreground/20 mb-3"
          aria-hidden="true"
        />
        <p className="text-sm text-foreground/60 mb-3">
          {isMobile
            ? 'Nenhum pedido com esses filtros.'
            : 'Nenhum pedido com esses filtros. Limpe os filtros pra ver tudo.'}
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="text-sm font-medium px-4 py-2 rounded-lg border transition-colors text-foreground/70 hover:text-foreground"
          style={{ border: '1px solid hsl(200 11% 20%)' }}
          aria-label="Limpar filtros e ver todos os pedidos"
        >
          {isMobile ? 'Limpar filtros pra ver tudo' : 'Limpar filtros'}
        </button>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center px-4"
        role="status"
        aria-label="Nenhum pedido registrado ainda"
      >
        <ShoppingCart size={32} className="text-[hsl(173_30%_57%)] mb-3" aria-hidden="true" />
        <h3 className="text-base font-semibold text-foreground mb-1.5">
          Sem pedido por enquanto
        </h3>
        <p className="text-xs text-foreground/65 leading-relaxed max-w-xs mb-4">
          Pedido novo aparece aqui assim que você registra. WhatsApp, Insta, balcao, da onde vier.
        </p>
        <button
          type="button"
          onClick={onCreateClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-colors"
          style={{
            background: 'hsl(173 58% 28%)',
            boxShadow:  '0 0 20px hsl(173 58% 28% / 0.28)',
          }}
          aria-label="Registrar primeiro pedido"
        >
          <Plus size={15} aria-hidden="true" />
          Registrar primeiro pedido
        </button>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto px-6"
      role="status"
      aria-label="Nenhum pedido registrado ainda"
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
        <ShoppingCart size={28} className="text-[hsl(173_30%_57%)]" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
        Sem pedido por enquanto
      </h3>
      <p className="text-sm text-foreground/65 leading-relaxed mb-5 max-w-xs">
        Pedido novo aparece aqui assim que você registra. WhatsApp, Insta, balcao, da onde vier.
      </p>
      <button
        type="button"
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-colors"
        style={{
          background: 'hsl(173 58% 28%)',
          boxShadow:  '0 0 24px hsl(173 58% 28% / 0.30)',
        }}
        aria-label="Registrar primeiro pedido"
      >
        <Plus size={15} aria-hidden="true" />
        Registrar primeiro pedido
      </button>
    </div>
  )
}
