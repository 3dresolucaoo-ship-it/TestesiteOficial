'use client'

import { useState } from 'react'
import type { Product } from '@/lib/types'
import { QuoteModal } from './QuoteModal'

type Size = 'full' | 'compact' | 'icon'

interface Props {
  product:     Product
  catalogSlug: string
  whatsapp?:   string | null
  noPrice?:    boolean
  outOfStock?: boolean
  size?:       Size
}

export function CatalogActionButton({
  product, catalogSlug, whatsapp, noPrice, outOfStock, size = 'full',
}: Props) {
  const [quoteOpen, setQuoteOpen] = useState(false)
  const mode = product.checkoutMode ?? 'direct'

  const baseClass =
    size === 'icon'
      ? 'flex items-center justify-center w-8 h-8 rounded-xl text-xs'
      : size === 'compact'
        ? 'inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-opacity hover:opacity-90'
        : 'w-full py-2.5 rounded-xl text-xs font-bold tracking-wide mt-1 flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90'

  // contact_only: WhatsApp button (or inert "Indisponível" if no whatsapp)
  if (mode === 'contact_only') {
    if (!whatsapp) {
      return (
        <span
          className={baseClass}
          style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed' }}
        >
          Indisponível
        </span>
      )
    }
    const waUrl = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Tenho interesse em "${product.name}"`)}`
    return (
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClass}
        style={{
          background: 'linear-gradient(135deg, #25d366, #128c7e)',
          color:      '#fff',
          boxShadow:  '0 4px 20px rgba(37,211,102,0.3)',
        }}
      >
        Falar com vendedor
      </a>
    )
  }

  // quote: opens modal
  if (mode === 'quote') {
    return (
      <>
        <button
          type="button"
          onClick={() => setQuoteOpen(true)}
          className={baseClass}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color:      '#fff',
            boxShadow:  '0 4px 20px rgba(16,185,129,0.3)',
          }}
        >
          {size === 'icon' ? '✎' : 'Solicitar orçamento'}
        </button>
        {quoteOpen && (
          <QuoteModal
            product={product}
            catalogSlug={catalogSlug}
            onClose={() => setQuoteOpen(false)}
          />
        )}
      </>
    )
  }

  // direct/variant: same checkout flow, different label
  if (noPrice) {
    return (
      <span
        className={baseClass}
        style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed' }}
      >
        Indisponível
      </span>
    )
  }

  if (outOfStock) {
    return (
      <a
        href={`/checkout?productId=${product.id}&catalogSlug=${catalogSlug}&encomenda=1`}
        className={baseClass}
        style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: '#fff', boxShadow: '0 4px 16px rgba(59,130,246,0.35)' }}
      >
        Solicitar
      </a>
    )
  }

  const label = mode === 'variant' ? 'Personalizar' : 'Comprar'
  return (
    <>
      <a
        href={`/checkout?productId=${product.id}&catalogSlug=${catalogSlug}`}
        className={baseClass}
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)',
          color:      '#fff',
          boxShadow:  '0 4px 20px rgba(124,58,237,0.4)',
        }}
      >
        {size === 'icon' ? '🛒' : label}
      </a>

      {/* allowsCustom: secondary CTA for direct/variant */}
      {product.allowsCustom && size === 'full' && (
        <>
          <button
            type="button"
            onClick={() => setQuoteOpen(true)}
            className="w-full mt-1.5 text-[11px] font-medium underline-offset-2 hover:underline"
            style={{ color: 'rgba(167,139,250,0.7)', background: 'transparent' }}
          >
            ou peça customizado
          </button>
          {quoteOpen && (
            <QuoteModal
              product={product}
              catalogSlug={catalogSlug}
              onClose={() => setQuoteOpen(false)}
            />
          )}
        </>
      )}
    </>
  )
}
