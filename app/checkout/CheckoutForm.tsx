'use client'

import { useState } from 'react'

interface Props {
  productId:        string
  productName:      string
  salePrice:        number
  catalogSlug:      string
  catalogName:      string
  catalogWhatsapp?: string
  initialQty:       number
  isEncomenda?:     boolean
}

export function CheckoutForm({
  productId,
  productName,
  salePrice,
  catalogSlug,
  catalogName,
  catalogWhatsapp,
  initialQty,
  isEncomenda,
}: Props) {
  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [qty,     setQty]     = useState(initialQty)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [done,    setDone]    = useState(false)

  const total = salePrice * qty

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isEncomenda) {
        const res = await fetch('/api/encomenda', {
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
        if (!res.ok) {
          setError(data.error ?? 'Erro ao registrar solicitação.')
          return
        }
        // Se o catálogo tem WhatsApp, abre conversa com mensagem pré-pronta
        if (catalogWhatsapp) {
          const msg = encodeURIComponent(
            `Olá! Me chamo ${name.trim()} e gostaria de solicitar uma encomenda do produto: *${productName}* (qtd: ${qty}).\nMeu WhatsApp: ${phone}`
          )
          window.open(`https://wa.me/${catalogWhatsapp.replace(/\D/g, '')}?text=${msg}`, '_blank')
        }
        setDone(true)
      } else {
        const res = await fetch('/api/checkout', {
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
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // ── Tela de sucesso (encomenda registrada) ────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
           style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #12122a 50%, #0d0d1a 100%)' }}>
        <div className="max-w-md w-full text-center flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
               style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#f1f5f9' }}>Solicitação registrada!</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Recebemos seu pedido de <strong style={{ color: '#e2e8f0' }}>{productName}</strong>.<br/>
              O vendedor entrará em contato pelo WhatsApp.
            </p>
          </div>
          <a href={`/catalogo/${catalogSlug}`}
             className="text-sm px-5 py-2.5 rounded-xl transition-opacity hover:opacity-80"
             style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
            ← Voltar ao catálogo
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen"
         style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #12122a 50%, #0d0d1a 100%)' }}>
      <div className="max-w-md mx-auto px-4 py-12">

        <a href={`/catalogo/${catalogSlug}`} className="text-sm mb-6 inline-block"
           style={{ color: 'rgba(255,255,255,0.4)' }}>
          ← {catalogName}
        </a>

        {/* Badge de modo */}
        {isEncomenda && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
               style={{ background: 'rgba(59,130,246,0.12)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.25)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Produto sob encomenda
          </div>
        )}

        <h1 className="text-2xl font-bold mb-6" style={{ color: '#f1f5f9' }}>
          {isEncomenda ? 'Solicitar encomenda' : 'Finalizar pedido'}
        </h1>

        {/* Info do produto */}
        <div className="rounded-xl p-4 mb-6"
             style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{productName}</p>
          {salePrice > 0 ? (
            <p className="text-base font-bold mt-1" style={{ color: isEncomenda ? '#93c5fd' : '#a78bfa' }}>
              R$ {salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <span className="text-xs font-normal ml-1" style={{ color: 'rgba(255,255,255,0.35)' }}>/ un.</span>
            </p>
          ) : (
            <p className="text-xs mt-1 italic" style={{ color: 'rgba(255,255,255,0.35)' }}>Preço a combinar</p>
          )}
          {isEncomenda && (
            <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Este produto está fora de estoque. Ao solicitar, o vendedor receberá seu pedido e entrará em contato.
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-xl p-5 flex flex-col gap-4"
              style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.07)' }}>

          <div className="flex flex-col gap-1">
            <label className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Nome completo *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Seu nome" required
              className="rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>WhatsApp *</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="11999999999" required maxLength={11}
              className="rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Quantidade</label>
            <input type="number" value={qty}
              onChange={e => setQty(Math.max(1, Math.min(999, Number(e.target.value) || 1)))}
              min={1} max={999}
              className="rounded-lg px-3 py-2.5 text-sm outline-none w-24"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }} />
          </div>

          {/* Total — só mostra se tem preço */}
          {salePrice > 0 && (
            <div className="flex justify-between items-center rounded-lg px-3 py-2.5"
                 style={{ background: isEncomenda ? 'rgba(59,130,246,0.08)' : 'rgba(124,58,237,0.1)', border: `1px solid ${isEncomenda ? 'rgba(59,130,246,0.2)' : 'rgba(124,58,237,0.2)'}` }}>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Total estimado</span>
              <span className="font-bold" style={{ color: isEncomenda ? '#93c5fd' : '#a78bfa' }}>
                R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {error && (
            <p className="text-sm rounded-lg px-3 py-2.5"
               style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: isEncomenda ? 'linear-gradient(135deg, #1e40af, #3b82f6)' : 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: '#fff' }}>
            {loading ? 'Aguarde...' : isEncomenda ? 'Solicitar encomenda →' : 'Pagar agora →'}
          </button>
        </form>

        <p className="mt-10 text-center text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Feito com BVaz Hub
        </p>
      </div>
    </div>
  )
}
