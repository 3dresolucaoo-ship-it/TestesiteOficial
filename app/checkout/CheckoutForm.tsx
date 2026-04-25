'use client'

import { useState } from 'react'

interface Props {
  productId:    string
  productName:  string
  salePrice:    number
  catalogSlug:  string
  catalogName:  string
  initialQty:   number
}

export function CheckoutForm({
  productId,
  productName,
  salePrice,
  catalogSlug,
  catalogName,
  initialQty,
}: Props) {
  const [name,     setName]     = useState('')
  const [phone,    setPhone]    = useState('')
  const [qty,      setQty]      = useState(initialQty)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const total = salePrice * qty

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res  = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          productId,
          catalogSlug,
          quantity:     qty,
          customerName: name.trim(),
          whatsapp:     phone.replace(/\D/g, ''),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Erro ao iniciar pagamento. Tente novamente.')
        return
      }

      window.location.href = data.url
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #12122a 50%, #0d0d1a 100%)' }}
    >
      <div className="max-w-md mx-auto px-4 py-12">

        {/* Back link */}
        <a
          href={`/catalogo/${catalogSlug}`}
          className="text-sm mb-6 inline-block"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          ← {catalogName}
        </a>

        <h1 className="text-2xl font-bold mb-6" style={{ color: '#f1f5f9' }}>
          Finalizar pedido
        </h1>

        {/* Product info */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{productName}</p>
          <p className="text-base font-bold mt-1" style={{ color: '#a78bfa' }}>
            R$ {salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            <span className="text-xs font-normal ml-1" style={{ color: 'rgba(255,255,255,0.35)' }}>/ un.</span>
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl p-5 flex flex-col gap-4"
          style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Nome completo *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome"
              required
              className="rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border:     '1px solid rgba(255,255,255,0.1)',
                color:      '#f1f5f9',
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>WhatsApp *</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="11999999999"
              required
              maxLength={11}
              className="rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border:     '1px solid rgba(255,255,255,0.1)',
                color:      '#f1f5f9',
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Quantidade</label>
            <input
              type="number"
              value={qty}
              onChange={e => setQty(Math.max(1, Math.min(999, Number(e.target.value) || 1)))}
              min={1}
              max={999}
              className="rounded-lg px-3 py-2.5 text-sm outline-none w-24"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border:     '1px solid rgba(255,255,255,0.1)',
                color:      '#f1f5f9',
              }}
            />
          </div>

          {/* Total */}
          <div
            className="flex justify-between items-center rounded-lg px-3 py-2.5"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}
          >
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Total</span>
            <span className="font-bold" style={{ color: '#a78bfa' }}>
              R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {error && (
            <p className="text-sm rounded-lg px-3 py-2.5" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: '#fff' }}
          >
            {loading ? 'Aguarde...' : 'Pagar agora →'}
          </button>
        </form>

        <p className="mt-10 text-center text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Feito com BVaz Hub
        </p>
      </div>
    </div>
  )
}
