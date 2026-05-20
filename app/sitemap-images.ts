/**
 * Sitemap de imagens (SEO bonus).
 *
 * Convencao Google: declarar imagens em sitemap dedicado ajuda indexacao
 * de Image Search + Discover Feed. Especialmente util pra landing com
 * foto autentica (printer-hero) + screenshots do produto (orders-preview).
 *
 * Apontado em robots.txt via Sitemap: tag (next.config.ts handle).
 *
 * Padrao Next.js: arquivo `app/sitemap-images.ts` NAO e convention auto-discovered.
 * Em vez disso, registramos como rota /sitemap-images.xml via Route Handler abaixo.
 */

import { NextResponse } from 'next/server'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hayzer.com.br'

interface ImageEntry {
  loc: string
  title: string
  caption: string
}

const IMAGES: Array<{ pageUrl: string; images: ImageEntry[] }> = [
  {
    pageUrl: BASE_URL,
    images: [
      {
        loc: `${BASE_URL}/landing/v2/printer-hero.jpg`,
        title: 'Bambu Lab A1 imprimindo 28 peças PLA amarelo',
        caption:
          'Foto real de impressora 3D Bambu A1 em produção com 28 peças cônicas em PLA amarelo com listras verdes. Build plate 256x256 mm visível.',
      },
      {
        loc: `${BASE_URL}/landing/orders-preview.webp`,
        title: 'Tela de pedidos do Hayzer com filamento calculado',
        caption:
          'Screenshot do módulo de pedidos do Hayzer mostrando pedido do WhatsApp com filamento PLA preto 200g, custo R$ 12,40, preço R$ 47, margem 73%.',
      },
      {
        loc: `${BASE_URL}/landing/v2/whatsapp-chat-mock.svg`,
        title: 'Conversa do WhatsApp virando pedido no sistema',
        caption:
          'Split-screen ilustrando como cliente pede no WhatsApp e Hayzer transforma em ficha de pedido com filamento, canal e margem.',
      },
      {
        loc: `${BASE_URL}/logo-hayzer.png`,
        title: 'Logo Hayzer com raízes orgânicas',
        caption:
          'Logo Hayzer em verde petróleo com raízes orgânicas descendo do H. Identidade da marca a raiz do seu negócio.',
      },
    ],
  },
  {
    pageUrl: `${BASE_URL}/calculadora`,
    images: [
      {
        loc: `${BASE_URL}/landing/v2/filament-spool.svg`,
        title: 'Spool de filamento PLA 1kg',
        caption:
          'Ícone de spool de filamento PLA para calculadora de preço de impressão 3D Hayzer.',
      },
    ],
  },
]

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const now = new Date().toISOString()

  const urlsXml = IMAGES.map(({ pageUrl, images }) => {
    const imagesXml = images
      .map(
        img => `    <image:image>
      <image:loc>${escapeXml(img.loc)}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>
      <image:caption>${escapeXml(img.caption)}</image:caption>
    </image:image>`
      )
      .join('\n')

    return `  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <lastmod>${now}</lastmod>
${imagesXml}
  </url>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlsXml}
</urlset>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
