'use client'

import type { Product } from '@/lib/types'
import { CatalogActionButton } from './CatalogActionButton'

interface Props {
  products:    Product[]
  showPrice:   boolean
  catalogSlug: string
  whatsapp?:   string | null
  stockMap:    Record<string, number | null>
}

export function MinimalTemplate({ products, showPrice, catalogSlug, whatsapp, stockMap }: Props) {
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
              {showPrice && (p.salePrice > 0 || p.checkoutMode === 'quote' || p.checkoutMode === 'contact_only') && (
                <CatalogActionButton
                  product={p}
                  catalogSlug={catalogSlug}
                  whatsapp={whatsapp}
                  noPrice={p.salePrice <= 0 && p.checkoutMode !== 'quote' && p.checkoutMode !== 'contact_only'}
                  outOfStock={noStock}
                  size="compact"
                />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
