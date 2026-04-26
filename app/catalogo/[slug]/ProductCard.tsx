'use client'

import type { Product } from '@/lib/types'
import { BuyButton } from '@/components/BuyButton'

interface Props {
  product:     Product
  showPrice:   boolean
  catalogSlug: string
  stockQty?:   number | null
}

export function ProductCard({ product, showPrice, catalogSlug, stockQty }: Props) {
  const hasStock   = stockQty != null && stockQty > 0
  const noStock    = stockQty === 0
  const stockKnown = stockQty != null

  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden catalog-card"
      style={{
        background: 'linear-gradient(145deg, rgba(26,26,50,0.95) 0%, rgba(18,18,42,0.98) 100%)',
        border:     '1px solid rgba(124,58,237,0.12)',
        boxShadow:  '0 4px 32px rgba(0,0,0,0.4)',
        transition: 'transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(-6px) scale(1.01)'
        el.style.boxShadow = '0 16px 48px rgba(124,58,237,0.25), 0 0 0 1px rgba(124,58,237,0.3)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(0) scale(1)'
        el.style.boxShadow = '0 4px 32px rgba(0,0,0,0.4)'
      }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden" style={{ background: '#0d0d24' }}>
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3" style={{ opacity: 0.3 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.9)" strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
              <span style={{ color: 'rgba(167,139,250,0.6)', fontSize: '11px', letterSpacing: '0.08em' }}>
                SEM FOTO
              </span>
            </div>
          </div>
        )}

        {/* Bottom gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(10,10,28,0.7) 0%, transparent 50%)' }}
        />

        {/* Stock badge — top right */}
        {stockKnown && (
          <div
            className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{
              background:     noStock ? 'rgba(239,68,68,0.85)' : 'rgba(16,185,129,0.85)',
              color:          '#fff',
              backdropFilter: 'blur(8px)',
              border:         `1px solid ${noStock ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`,
              boxShadow:      noStock ? '0 2px 12px rgba(239,68,68,0.3)' : '0 2px 12px rgba(16,185,129,0.3)',
            }}
          >
            {noStock ? 'Sem estoque' : `${stockQty} un.`}
          </div>
        )}

        {/* Portfolio badge — top left */}
        {!showPrice && (
          <div
            className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background:     'rgba(124,58,237,0.7)',
              color:          '#e9d5ff',
              backdropFilter: 'blur(8px)',
              border:         '1px solid rgba(167,139,250,0.3)',
            }}
          >
            Portfólio
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2.5 p-4 flex-1">
        <p className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: '#e2e8f0' }}>
          {product.name}
        </p>

        {showPrice && product.salePrice > 0 && (
          <div className="flex items-baseline gap-1">
            <span className="text-xs" style={{ color: 'rgba(167,139,250,0.6)' }}>R$</span>
            <span
              className="text-xl font-extrabold tracking-tight"
              style={{
                background:           'linear-gradient(135deg, #a78bfa, #e879f9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
              }}
            >
              {product.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {showPrice && product.salePrice <= 0 && (
          <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Indisponível
          </p>
        )}

        {stockKnown && (
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: noStock ? '#ef4444' : '#10b981' }}
            />
            <span className="text-xs font-medium" style={{ color: noStock ? '#fca5a5' : '#6ee7b7' }}>
              {noStock ? 'Fora de estoque' : `Disponível: ${stockQty} unidades`}
            </span>
          </div>
        )}

        <div className="flex-1" />

        {showPrice && (
          <BuyButton productId={product.id} catalogSlug={catalogSlug} outOfStock={noStock || product.salePrice <= 0} />
        )}
      </div>
    </div>
  )
}
