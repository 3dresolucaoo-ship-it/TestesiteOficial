import { notFound } from 'next/navigation'
import { portfoliosService, portfolioItemsService } from '@/services/portfolios'

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function PortfolioPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const portfolio = await portfoliosService.getBySlug(slug)
  if (!portfolio) notFound()

  const items = await portfolioItemsService.listPublic(portfolio.id)
  const waLink = portfolio.whatsapp
    ? `https://wa.me/${portfolio.whatsapp.replace(/\D/g, '')}`
    : null

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #0d0d1a 0%, #12122a 50%, #0d0d1a 100%)',
      }}
    >
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12">

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center gap-5 mb-14">
          {portfolio.avatarUrl ? (
            <img
              src={portfolio.avatarUrl}
              alt={portfolio.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-500/30"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                color: 'white',
              }}
            >
              {portfolio.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ color: '#f1f5f9' }}
            >
              {portfolio.name}
            </h1>
            {portfolio.bio && (
              <p
                className="text-base mt-3 max-w-lg mx-auto leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                {portfolio.bio}
              </p>
            )}
          </div>

          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: '#25d366', color: '#fff' }}
            >
              {/* WhatsApp icon SVG */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Falar no WhatsApp
            </a>
          )}
        </div>

        {/* ── Works grid ──────────────────────────────────────────────────── */}
        {items.length > 0 && (
          <section className="mb-16">
            <h2
              className="text-lg font-semibold mb-6 text-center"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Trabalhos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map(item => (
                <div
                  key={item.id}
                  className="rounded-2xl overflow-hidden border flex flex-col"
                  style={{
                    background:  '#1a1a2e',
                    borderColor: 'rgba(255,255,255,0.07)',
                    boxShadow:   '0 4px 24px rgba(0,0,0,0.3)',
                  }}
                >
                  {item.imageUrl ? (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div
                      className="aspect-video flex items-center justify-center"
                      style={{ background: '#12122a' }}
                    >
                      <div className="w-12 h-12 rounded-xl opacity-20" style={{ background: '#7c3aed' }} />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── CTA Footer ──────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-8 flex flex-col items-center text-center gap-5"
          style={{
            background:  '#1a1a2e',
            border:      '1px solid rgba(124,58,237,0.2)',
            boxShadow:   '0 0 40px rgba(124,58,237,0.08)',
          }}
        >
          <p className="text-xl font-bold" style={{ color: '#f1f5f9' }}>
            Gostou do meu trabalho?
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Entre em contato ou veja o catálogo completo de produtos.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {portfolio.catalogSlug && (
              <a
                href={`/catalogo/${portfolio.catalogSlug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                  color:      '#fff',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
                Ver produtos
              </a>
            )}
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: '#25d366', color: '#fff' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Falar no WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Feito com BVaz Hub
          </p>
        </div>
      </div>
    </div>
  )
}
