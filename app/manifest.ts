import type { MetadataRoute } from 'next'

/**
 * PWA Manifest do Hayzer.
 *
 * Next.js 16 gera `/manifest.webmanifest` automaticamente a partir deste
 * arquivo. O <link rel="manifest"> é injetado no <head> via metadata.manifest
 * do app/layout.tsx (Next faz isso por padrão quando o arquivo existe).
 *
 * Ícones:
 *   - /icon (gerado de app/icon.svg) — 512x512 escalável, SVG vetorial.
 *   - /apple-icon (gerado de app/apple-icon.png) — fallback iOS.
 *
 * Criado em 2026-05-16. Quando Diego entregar ícones polidos em múltiplos
 * tamanhos (192/512 maskable separados), atualizar a lista `icons`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hayzer — A raiz do seu negócio',
    short_name: 'Hayzer',
    description:
      'Substitui gambiarra, planilha perdida e WhatsApp confuso por controle real. Estoque, vendas, clientes e financeiro num lugar só.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07090A', // night-950
    theme_color: '#1F7669',      // petrol-500
    orientation: 'portrait-primary',
    lang: 'pt-BR',
    dir: 'ltr',
    categories: ['business', 'productivity', 'finance'],
    icons: [
      {
        src: '/icon',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '1536x1024',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    // Shortcuts pro Android: long-press no ícone do app abre menu rápido
    shortcuts: [
      {
        name: 'Calculadora 3D',
        short_name: 'Calculadora',
        description: 'Calcule custo + lucro + preço por canal',
        url: '/calculadora',
        icons: [{ src: '/icon', sizes: 'any' }],
      },
      {
        name: 'Dashboard',
        short_name: 'Painel',
        description: 'Ver lucro, pedidos e estoque',
        url: '/dashboard',
        icons: [{ src: '/icon', sizes: 'any' }],
      },
    ],
  }
}
