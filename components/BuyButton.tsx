'use client'

interface Props {
  productId:   string
  catalogSlug: string
  outOfStock?: boolean
}

export function BuyButton({ productId, catalogSlug, outOfStock }: Props) {
  function handleClick() {
    if (outOfStock) return
    window.location.href = `/checkout?productId=${productId}&catalogSlug=${catalogSlug}`
  }

  return (
    <button
      onClick={handleClick}
      disabled={outOfStock}
      className="w-full py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all mt-1"
      style={
        outOfStock
          ? {
              background: 'rgba(255,255,255,0.04)',
              color:      'rgba(255,255,255,0.2)',
              border:     '1px solid rgba(255,255,255,0.06)',
              cursor:     'not-allowed',
            }
          : {
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)',
              color:      '#fff',
              boxShadow:  '0 4px 20px rgba(124,58,237,0.4)',
              cursor:     'pointer',
            }
      }
    >
      {outOfStock ? 'Indisponível' : 'Comprar'}
    </button>
  )
}
