export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ catalog?: string }>
}) {
  const { catalog } = await searchParams

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #12122a 50%, #0d0d1a 100%)' }}
    >
      <div className="max-w-sm mx-auto px-4 text-center">

        {/* Icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ color: '#f1f5f9' }}>
          Pagamento aprovado!
        </h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Seu pedido foi recebido.<br />
          Entraremos em contato pelo WhatsApp em breve.
        </p>

        {catalog && (
          <a
            href={`/catalogo/${catalog}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              background: 'rgba(255,255,255,0.07)',
              color:      'rgba(255,255,255,0.7)',
              border:     '1px solid rgba(255,255,255,0.1)',
            }}
          >
            ← Voltar ao catálogo
          </a>
        )}

        <p className="mt-12 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Feito com BVaz Hub
        </p>
      </div>
    </div>
  )
}
