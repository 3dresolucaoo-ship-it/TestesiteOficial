'use client'

interface Props {
  productId:   string
  catalogSlug: string
  noPrice?:    boolean  // sale_price = 0 → desabilitado
  outOfStock?: boolean  // estoque = 0 → solicitar encomenda
}

export function BuyButton({ productId, catalogSlug, noPrice, outOfStock }: Props) {
  if (noPrice) {
    return (
      <button
        disabled
        className="w-full py-2.5 rounded-xl text-xs font-bold tracking-wide mt-1"
        style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'not-allowed' }}
      >
        Indisponível
      </button>
    )
  }

  if (outOfStock) {
    return (
      <a
        href={`/checkout?productId=${productId}&catalogSlug=${catalogSlug}&encomenda=1`}
        className="w-full py-2.5 rounded-xl text-xs font-bold tracking-wide mt-1 flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: '#fff', boxShadow: '0 4px 16px rgba(59,130,246,0.35)' }}
      >
        Solicitar
      </a>
    )
  }

  return (
    <a
      href={`/checkout?productId=${productId}&catalogSlug=${catalogSlug}`}
      className="w-full py-2.5 rounded-xl text-xs font-bold tracking-wide mt-1 flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
      style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)', color: '#fff', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}
    >
      Comprar
    </a>
  )
}
