'use client'

import { useState, useEffect } from 'react'
import type { Product } from '@/lib/types'

interface Props {
  product:     Product
  catalogSlug: string
  onClose:     () => void
}

const URGENCY_OPTIONS = [
  { value: 'flexible',  label: 'Sem pressa' },
  { value: 'normal',    label: 'Próximas semanas' },
  { value: 'urgent',    label: 'Urgente (próximos dias)' },
] as const

export function QuoteModal({ product, catalogSlug, onClose }: Props) {
  const [name,        setName]        = useState('')
  const [whatsapp,    setWhatsapp]    = useState('')
  const [email,       setEmail]       = useState('')
  const [description, setDescription] = useState('')
  const [urgency,     setUrgency]     = useState<typeof URGENCY_OPTIONS[number]['value']>('normal')
  const [referenceUrl, setReferenceUrl] = useState('')
  const [submitting,   setSubmitting]   = useState(false)
  const [submitted,    setSubmitted]    = useState(false)
  const [error,        setError]        = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape' && !submitting) onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose, submitting])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || (!whatsapp.trim() && !email.trim()) || !description.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/catalog/quote', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          productId:    product.id,
          catalogSlug,
          name:         name.trim(),
          whatsapp:     whatsapp.trim(),
          email:        email.trim(),
          description:  description.trim(),
          urgency,
          referenceUrl: referenceUrl.trim(),
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error ?? `Erro ${res.status}`)
      }
      setSubmitted(true)
    } catch (err) {
      setError((err as Error).message ?? 'Erro ao enviar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0f0f28 0%, #14142e 100%)',
          border:     '1px solid rgba(124,58,237,0.25)',
          boxShadow:  '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center"
                 style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold" style={{ color: '#f1f5f9' }}>Orçamento enviado!</h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Vamos responder em até 24h pelo {whatsapp ? 'WhatsApp' : 'email'}.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(167,139,250,0.6)' }}>
                Solicitar orçamento
              </p>
              <h3 className="text-lg font-bold leading-tight" style={{ color: '#f1f5f9' }}>
                {product.name}
              </h3>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Conta o que precisa que respondemos com prazo + preço.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3">
              <Field label="Seu nome *">
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: João Silva" required />
              </Field>

              <Field label="WhatsApp">
                <Input
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder="(11) 99999-9999"
                  type="tel"
                />
              </Field>

              <Field label="Email">
                <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" type="email" />
              </Field>

              <Field label="Descrição do que precisa *">
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none focus:outline-none focus:ring-1"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    color:      '#e2e8f0',
                    border:     '1px solid rgba(255,255,255,0.1)',
                  }}
                  placeholder="Tamanho, cor, prazo, qualquer detalhe que ajude…"
                />
              </Field>

              <Field label="Urgência">
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as typeof urgency)}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    color:      '#e2e8f0',
                    border:     '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {URGENCY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value} style={{ background: '#0f0f28' }}>{o.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Link de referência (opcional)">
                <Input
                  value={referenceUrl}
                  onChange={e => setReferenceUrl(e.target.value)}
                  placeholder="https://… (foto, vídeo, modelo)"
                  type="url"
                />
              </Field>

              {error && (
                <p className="text-xs" style={{ color: '#fca5a5' }}>{error}</p>
              )}

              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                * Informe pelo menos WhatsApp ou email pra gente responder.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !name.trim() || (!whatsapp.trim() && !email.trim()) || !description.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color:      '#fff',
                    boxShadow:  '0 4px 20px rgba(16,185,129,0.3)',
                  }}
                >
                  {submitting ? 'Enviando…' : 'Enviar orçamento'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
      {children}
    </label>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1"
      style={{
        background: 'rgba(255,255,255,0.04)',
        color:      '#e2e8f0',
        border:     '1px solid rgba(255,255,255,0.1)',
      }}
    />
  )
}
