'use client'

import type { Product } from '@/lib/types'

interface Props {
  products:    Product[]
  showPrice:   boolean
  catalogSlug: string
  stockMap:    Record<string, number | null>
}

export function ListTemplate({ products, showPrice, catalogSlug, stockMap }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {products.map(p => {
        const stockQty = p.inventoryItemId ? stockMap[p.id] : undefined
        const noStock  = stockQty === 0
        const hasImg   = Boolean(p.imageUrl)
        const noPrice  = p.salePrice <= 0

        return (
          <div
            key={p.id}
            className="flex items-center gap-4 rounded-2xl overflow-hidden transition-all duration-200"
            style={{
              background: 'linear-gradient(145deg, rgba(26,26,50,0.95) 0%, rgba(18,18,42,0.98) 100%)',
              border:     '1px solid rgba(124,58,237,0.12)',
              boxShadow:  '0 2px 16px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'rgba(124,58,237,0.3)'
              el.style.boxShadow   = '0 4px 24px rgba(124,58,237,0.15)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'rgba(124,58,237,0.12)'
              el.style.boxShadow   = '0 2px 16px rgba(0,0,0,0.3)'
            }}
          >
            {/* Thumbnail */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden" style={{ background: '#0d0d24' }}>
              {hasImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl!} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.3)" strokeWidth="1.2">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 py-3 pr-4 flex flex-col gap-1.5">
              <p className="font-semibold text-sm sm:text-base leading-snug truncate" style={{ color: '#e2e8f0' }}>
                {p.name}
              </p>

              {stockQty != null && (
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: noStock ? '#ef4444' : '#10b981' }} />
                  <span className="text-xs" style={{ color: noStock ? '#fca5a5' : '#6ee7b7' }}>
                    {noStock ? 'Sem estoque' : `${stockQty} un. disponíveis`}
                  </span>
                </div>
              )}

              {showPrice && (
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {p.salePrice > 0 ? (
                    <span
                      className="font-extrabold text-lg tracking-tight"
                      style={{
                        background:           'linear-gradient(135deg, #a78bfa, #e879f9)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor:  'transparent',
                      }}
                    >
                      R$ {p.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  ) : (
                    <span className="text-xs italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      Sem preço definido
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Buy button (desktop) */}
            {showPrice && (
              <div className="pr-4 hidden sm:block flex-shrink-0">
                {noPrice ? (
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)', cursor: 'not-allowed' }}
                  >
                    Indisponível
                  </span>
                ) : noStock ? (
                  <a
                    href={`/checkout?productId=${p.id}&catalogSlug=${catalogSlug}&encomenda=1`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: '#fff', boxShadow: '0 2px 12px rgba(59,130,246,0.3)' }}
                  >
                    Solicitar
                  </a>
                ) : (
                  <a
                    href={`/checkout?productId=${p.id}&catalogSlug=${catalogSlug}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', boxShadow: '0 2px 12px rgba(124,58,237,0.3)' }}
                  >
                    Comprar
                  </a>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
