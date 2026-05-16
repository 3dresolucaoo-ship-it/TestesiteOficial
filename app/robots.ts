import type { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hayzer.com.br'

// Otávio (Security) + Felipe (frontend):
// - APIs nunca indexadas (`/api/*`)
// - Rotas autenticadas (dashboard, settings, etc) bloqueadas — usuário precisa estar logado
// - Rotas públicas (landing, calculadora, catálogos, LGPD) liberadas pra SEO
// - Adicionar `X-Robots-Tag: noindex` em `/api/*` ainda pendente no ROADMAP (Importante)

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/calculadora',
          '/catalogo/',
          '/portfolio/',
          '/privacidade',
          '/termos',
          '/waitlist/',
        ],
        disallow: [
          '/api/',
          '/dashboard',
          '/settings',
          '/inventory',
          '/products',
          '/orders',
          '/production',
          '/finance',
          '/crm',
          '/content',
          '/decisions',
          '/metrics',
          '/projects',
          '/catalogs',
          '/portfolios',
          '/admin',
          '/login',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
