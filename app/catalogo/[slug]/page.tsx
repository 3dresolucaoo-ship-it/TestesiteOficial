import { notFound } from 'next/navigation'
import { catalogsService } from '@/services/catalogs'
import { supabase } from '@/lib/supabaseClient'
import type { Product } from '@/lib/types'
import type { CatalogTemplate } from '@/core/catalog/types'
import { ShareButton } from '@/components/ShareButton'
import { ProductCard } from './ProductCard'

// ─── Data ────────────────────────────────────────────────────────────────────
async function getProducts(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return []
  const { data } = await supabase.from('products').select('*').in('id', ids)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => ({
    id:                r.id,
    projectId:         r.project_id,
    name:              r.name,
    materialGrams:     Number(r.material_grams ?? 0),
    printTimeHours:    Number(r.print_time_hours ?? 0),
    failureRate:       Number(r.failure_rate ?? 0.10),
    energyCostPerHour: Number(r.energy_cost_per_hour ?? 0.50),
    supportCost:       Number(r.support_cost ?? 0),
    marginPercentage:  Number(r.margin_percentage ?? 0.30),
    salePrice:         Number(r.sale_price ?? 0),
    inventoryItemId:   r.inventory_item_id ?? undefined,
    notes:             r.notes ?? '',
    imageUrl:          r.image_url ?? undefined,
  }))
}

async function getInventoryQuantity(id: string): Promise<number | null> {
  const { data } = await supabase.from('inventory').select('quantity').eq('id', id).maybeSingle()
  return data ? Number(data.quantity ?? 0) : null
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-32">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5">
          <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
          <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
        </svg>
      </div>
      <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Nenhum produto neste catálogo ainda.
      </p>
    </div>
  )
}

// ─── Grid template (default) ──────────────────────────────────────────────────
function GridTemplate({
  products, showPrice, catalogSlug, stockMap,
}: {
  products: Product[]; showPrice: boolean; catalogSlug: string; stockMap: Record<string, number | null>
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
      {products.map(p => (
        <ProductCard
          key={p.id}
          product={p}
          showPrice={showPrice}
          catalogSlug={catalogSlug}
          stockQty={p.inventoryItemId ? stockMap[p.id] : undefined}
        />
      ))}
    </div>
  )
}

// ─── List template ────────────────────────────────────────────────────────────
function ListTemplate({
  products, showPrice, catalogSlug, stockMap,
}: {
  products: Product[]; showPrice: boolean; catalogSlug: string; stockMap: Record<string, number | null>
}) {
  return (
    <div className="flex flex-col gap-3">
      {products.map(p => {
        const stockQty = p.inventoryItemId ? stockMap[p.id] : undefined
        const noStock  = stockQty === 0
        const hasImg   = Boolean(p.imageUrl)

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
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden"
              style={{ background: '#0d0d24' }}
            >
              {hasImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl!} alt={p.name}
                     className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                       stroke="rgba(167,139,250,0.3)" strokeWidth="1.2">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 py-3 pr-4 flex flex-col gap-1.5">
              <p className="font-semibold text-sm sm:text-base leading-snug truncate"
                 style={{ color: '#e2e8f0' }}>
                {p.name}
              </p>

              {stockQty != null && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: noStock ? '#ef4444' : '#10b981' }}
                  />
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
                      Indisponível
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Buy button (desktop) */}
            {showPrice && (
              <div className="pr-4 hidden sm:block flex-shrink-0">
                {(() => {
                  const disabled = noStock || p.salePrice <= 0
                  return disabled ? (
                    <span
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        color:      'rgba(255,255,255,0.25)',
                        cursor:     'not-allowed',
                      }}
                    >
                      Indisponível
                    </span>
                  ) : (
                    <a
                      href={`/checkout?productId=${p.id}&catalogSlug=${catalogSlug}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                        color:      '#fff',
                        boxShadow:  '0 2px 12px rgba(124,58,237,0.3)',
                      }}
                    >
                      Comprar
                    </a>
                  )
                })()}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Minimal template ─────────────────────────────────────────────────────────
function MinimalTemplate({
  products, showPrice, catalogSlug, stockMap,
}: {
  products: Product[]; showPrice: boolean; catalogSlug: string; stockMap: Record<string, number | null>
}) {
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border:     '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {products.map((p, i) => {
        const stockQty = p.inventoryItemId ? stockMap[p.id] : undefined
        const noStock  = stockQty === 0
        const isLast   = i === products.length - 1

        return (
          <div
            key={p.id}
            className="flex items-center justify-between gap-4 px-6 py-4 transition-colors"
            style={{
              borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.06)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent'
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[15px] leading-snug truncate"
                 style={{ color: '#e2e8f0' }}>
                {p.name}
              </p>
              {stockQty != null && (
                <p className="text-xs mt-0.5"
                   style={{ color: noStock ? '#fca5a5' : 'rgba(255,255,255,0.35)' }}>
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
                  Indisponível
                </span>
              ))}
              {showPrice && !noStock && p.salePrice > 0 && (
                <a
                  href={`/checkout?productId=${p.id}&catalogSlug=${catalogSlug}`}
                  className="flex items-center justify-center w-8 h-8 rounded-xl transition-all"
                  style={{
                    background: 'rgba(124,58,237,0.2)',
                    color:      '#a78bfa',
                    border:     '1px solid rgba(124,58,237,0.25)',
                  }}
                  title="Comprar"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Template pills (visual indicator) ───────────────────────────────────────
const TEMPLATE_LABELS: Record<string, string> = {
  grid:    'Grade',
  list:    'Lista',
  minimal: 'Minimal',
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function CatalogPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug }  = await params
  const catalog   = await catalogsService.getCatalogBySlug(slug)
  if (!catalog) notFound()

  const products  = await getProducts(catalog.productIds)
  const showPrice = catalog.mode === 'catalog'
  const template  = (catalog.template ?? 'grid') as CatalogTemplate

  const stockMap: Record<string, number | null> = {}
  await Promise.all(
    products
      .filter(p => p.inventoryItemId)
      .map(async p => { stockMap[p.id] = await getInventoryQuantity(p.inventoryItemId!) })
  )

  const waLink = catalog.whatsapp
    ? `https://wa.me/${catalog.whatsapp.replace(/\D/g, '')}`
    : null

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(160deg, #080818 0%, #0d0d28 40%, #080820 100%)' }}
    >

      {/* ── Ambient glows ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 65%)' }}
        />
        <div
          className="absolute top-1/3 -left-40 w-[500px] h-[500px]"
          style={{ background: 'radial-gradient(ellipse, rgba(236,72,153,0.06) 0%, transparent 65%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px]"
          style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.05) 0%, transparent 65%)' }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <header className="flex flex-col items-center text-center mb-14 gap-5">
          {catalog.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={catalog.logoUrl}
              alt={catalog.name}
              className="max-h-20 max-w-48 object-contain rounded-2xl"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
            />
          )}

          {/* Mode + template pill */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
              style={{
                background: showPrice ? 'rgba(124,58,237,0.15)' : 'rgba(236,72,153,0.12)',
                color:      showPrice ? '#c4b5fd' : '#f9a8d4',
                border:     `1px solid ${showPrice ? 'rgba(167,139,250,0.2)' : 'rgba(244,114,182,0.2)'}`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: showPrice ? '#a78bfa' : '#f472b6' }}
              />
              {showPrice ? 'Catálogo de produtos' : 'Portfólio de trabalhos'}
            </div>
            <div
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color:      'rgba(255,255,255,0.4)',
                border:     '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {TEMPLATE_LABELS[template] ?? 'Grade'}
            </div>
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight"
            style={{
              background:           'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 60%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor:  'transparent',
              lineHeight:           1.15,
            }}
          >
            {catalog.name}
          </h1>

          <div className="flex items-center gap-3 mt-1">
            <ShareButton />
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  background: 'rgba(37,211,102,0.15)',
                  color:      '#4ade80',
                  border:     '1px solid rgba(37,211,102,0.25)',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            )}
          </div>

          {products.length > 0 && (
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {products.length} {products.length === 1 ? 'produto' : 'produtos'}
            </p>
          )}
        </header>

        {/* ── Products ──────────────────────────────────────────────────── */}
        {products.length === 0 ? (
          <EmptyState />
        ) : template === 'list' ? (
          <ListTemplate
            products={products}
            showPrice={showPrice}
            catalogSlug={slug}
            stockMap={stockMap}
          />
        ) : template === 'minimal' ? (
          <MinimalTemplate
            products={products}
            showPrice={showPrice}
            catalogSlug={slug}
            stockMap={stockMap}
          />
        ) : (
          <GridTemplate
            products={products}
            showPrice={showPrice}
            catalogSlug={slug}
            stockMap={stockMap}
          />
        )}

        {/* ── CTA footer ────────────────────────────────────────────────── */}
        {(waLink || catalog.portfolioSlug) && (
          <div
            className="mt-20 rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center gap-6"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(236,72,153,0.06) 100%)',
              border:     '1px solid rgba(124,58,237,0.2)',
              boxShadow:  '0 0 60px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <div className="flex flex-col gap-2">
              <p className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>
                Gostou do que viu?
              </p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Entre em contato ou veja mais trabalhos
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {catalog.portfolioSlug && (
                <a
                  href={`/portfolio/${catalog.portfolioSlug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color:      'rgba(255,255,255,0.75)',
                    border:     '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                  </svg>
                  Ver portfólio
                </a>
              )}
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, #25d366, #128c7e)',
                    color:      '#fff',
                    boxShadow:  '0 4px 20px rgba(37,211,102,0.3)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Falar no WhatsApp
                </a>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 mb-4 text-center">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.15)', letterSpacing: '0.06em' }}>
            Feito com{' '}
            <span style={{ color: 'rgba(167,139,250,0.4)', fontWeight: 600 }}>BVaz Hub</span>
          </p>
        </div>
      </div>
    </div>
  )
}
