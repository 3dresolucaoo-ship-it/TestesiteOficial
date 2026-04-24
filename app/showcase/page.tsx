'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useMemo } from 'react'
import { Package, Sparkles } from 'lucide-react'

interface ShowcaseProduct {
  name: string
  price: number
  image?: string
  notes?: string
  project?: string
}

interface ShowcaseData {
  title?: string
  subtitle?: string
  contact?: string
  products: ShowcaseProduct[]
}

function decode(raw: string | null): ShowcaseData | null {
  if (!raw) return null
  try {
    const json = decodeURIComponent(escape(atob(raw.replace(/-/g, '+').replace(/_/g, '/'))))
    const parsed = JSON.parse(json) as ShowcaseData
    if (!parsed || !Array.isArray(parsed.products)) return null
    return parsed
  } catch {
    return null
  }
}

function fmt(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function ShowcaseContent() {
  const params = useSearchParams()
  const data   = useMemo(() => decode(params.get('d')), [params])

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <Package size={40} className="mx-auto mb-3" style={{ color: 'var(--t-text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--t-text-secondary)' }}>
            Catálogo inválido ou expirado.
          </p>
        </div>
      </div>
    )
  }

  const title    = data.title    || 'Catálogo'
  const subtitle = data.subtitle || 'Seleção especial de produtos'

  return (
    <div className="min-h-screen">
      <header className="max-w-5xl mx-auto px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
          style={{ background: 'var(--t-accent-soft)', color: 'var(--t-accent)' }}>
          <Sparkles size={12} /> Seleção exclusiva
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--t-text-primary)' }}>
          {title}
        </h1>
        <p className="text-sm" style={{ color: 'var(--t-text-secondary)' }}>{subtitle}</p>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.products.map((p, i) => (
          <article key={i} className="rounded-2xl overflow-hidden border"
            style={{
              background: 'var(--t-card-from)',
              borderColor: 'var(--t-card-border)',
              boxShadow: 'var(--t-card-shadow)',
            }}>
            <div className="aspect-[4/3] overflow-hidden" style={{ background: 'var(--t-hover)' }}>
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--t-text-muted)' }}>
                  <Package size={40} />
                </div>
              )}
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--t-text-primary)' }}>{p.name}</h3>
              {p.notes && (
                <p className="text-xs line-clamp-3" style={{ color: 'var(--t-text-secondary)' }}>{p.notes}</p>
              )}
              <p className="text-lg font-bold" style={{ color: 'var(--t-accent)' }}>{fmt(p.price)}</p>
            </div>
          </article>
        ))}
      </main>

      {data.contact && (
        <footer className="max-w-5xl mx-auto px-6 pb-10 text-center">
          <div className="inline-block rounded-xl px-5 py-3 border"
            style={{ background: 'var(--t-surface)', borderColor: 'var(--t-border-mid)' }}>
            <p className="text-xs mb-0.5" style={{ color: 'var(--t-text-muted)' }}>Para orçar</p>
            <p className="text-sm font-medium" style={{ color: 'var(--t-text-primary)' }}>{data.contact}</p>
          </div>
        </footer>
      )}
    </div>
  )
}

export default function ShowcasePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ShowcaseContent />
    </Suspense>
  )
}
