'use client'

import type { Product } from '@/lib/types'

interface Props {
  products:    Product[]
  showPrice:   boolean
  catalogSlug: string
  stockMap:    Record<string, number | null>
}

export function MinimalTemplate({ products, showPrice, catalogSlug, stockMap }: Props) {
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {products.map((p, i) => {
        const stockQty = p.inventoryItemId ? stockMap[p.id] : undefined
        const noStock  = stockQty === 0
        const isLast   = i === products.length - 1

        return (
          <div
            key={p.id}
            className="flex items-center justify-between gap-4 px-6 py-4 transition-colors"
            style={{ borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.06)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[15px] leading-snug truncate" style={{ color: '#e2e8f0' }}>
                {p.name}
              </p>
              {stockQty != null && (
                <p className="text-xs mt-0.5" style={{ color: noStock ? '#fca5a5' : 'rgba(255,255,255,0.35)' }}>
                  {noStock ? '● Sem estoque' : `● ${stockQty} em estoque`}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {showPrice && (p.salePrice > 0 ? (
                <span
                  className="text-base font-bold"
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
                  Sem preço
                </span>
              ))}
              {showPrice && p.salePrice > 0 && (
                noStock ? (
                  <a
                    href={`/checkout?productId=${p.id}&catalogSlug=${catalogSlug}&encomenda=1`}
                    className="flex items-center justify-center px-2.5 h-8 rounded-xl transition-opacity hover:opacity-90 text-xs font-bold"
                    style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)' }}
                    title="Solicitar encomenda"
                  >
                    Solicitar
                  </a>
                ) : (
                  <a
                    href={`/checkout?productId=${p.id}&catalogSlug=${catalogSlug}`}
                    className="flex items-center justify-center w-8 h-8 rounded-xl transition-all"
                    style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}
                    title="Comprar"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 01-8 0"/>
                    </svg>
                  </a>
                )
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
