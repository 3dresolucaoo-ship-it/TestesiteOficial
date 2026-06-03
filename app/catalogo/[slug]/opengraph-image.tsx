/**
 * app/catalogo/[slug]/opengraph-image.tsx
 *
 * Imagem OG dinâmica pra link compartilhado de catálogo público.
 * Renderiza nome do negócio + tipo (catálogo/portfólio) + qtd produtos + marca Hayzer.
 *
 * Usada automaticamente pelo Next.js no metadata do route /catalogo/[slug].
 * Quando maker compartilha hayzer.com.br/catalogo/seuslug no Instagram/WhatsApp,
 * essa imagem aparece no preview.
 *
 * Trade-offs:
 * - 1200x630 = padrão OG Facebook/Twitter/WhatsApp/Insta DM
 * - Sem foto de produto destaque por agora (precisaria download remoto da Supabase
 *   Storage que torna lento o build de OG). Fica pra v2.
 * - Fallback "Maker 3D BR" quando catálogo não existe (não quebra share)
 */

import { ImageResponse } from 'next/og'
import { catalogsService } from '@/services/catalogs'

export const runtime = 'edge'
export const alt     = 'Catálogo Hayzer — pedidos via WhatsApp'
export const size    = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function CatalogOgImage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params

  let catalog: Awaited<ReturnType<typeof catalogsService.getCatalogBySlug>> = null
  try {
    catalog = await catalogsService.getCatalogBySlug(slug)
  } catch {
    // fallthrough — renderiza fallback
  }

  const isCatalog  = catalog?.mode === 'catalog'
  const label      = isCatalog ? 'CATÁLOGO' : 'PORTFÓLIO'
  const accent     = isCatalog ? '#a78bfa' : '#f472b6'
  const accentSoft = isCatalog ? 'rgba(124,58,237,0.18)' : 'rgba(236,72,153,0.14)'
  const productCount = catalog?.productIds?.length ?? 0
  const name = catalog?.name ?? 'Maker 3D BR'

  return new ImageResponse(
    (
      <div
        style={{
          width:        '100%',
          height:       '100%',
          display:      'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding:      '64px',
          background:   'linear-gradient(160deg, #080818 0%, #0d0d28 40%, #080820 100%)',
          fontFamily:   'sans-serif',
          color:        '#f8fafc',
        }}
      >
        {/* Glow superior */}
        <div
          style={{
            position:  'absolute',
            top:       '-180px',
            left:      '50%',
            transform: 'translateX(-50%)',
            width:     '900px',
            height:    '500px',
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.22) 0%, transparent 70%)',
            display:   'flex',
          }}
        />

        {/* Topo: label tipo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display:        'flex',
              alignItems:     'center',
              gap:            '10px',
              padding:        '10px 18px',
              borderRadius:   '999px',
              background:     accentSoft,
              border:         `1px solid ${accent}33`,
              fontSize:       '20px',
              fontWeight:     700,
              letterSpacing:  '0.18em',
              color:          accent,
            }}
          >
            <div
              style={{
                width:        '10px',
                height:       '10px',
                borderRadius: '50%',
                background:   accent,
              }}
            />
            {label}
          </div>
        </div>

        {/* Centro: nome */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h1
            style={{
              fontSize:    '108px',
              fontWeight:  900,
              lineHeight:  1.05,
              margin:      0,
              letterSpacing: '-0.04em',
              maxWidth:    '900px',
              color:       '#f8fafc',
            }}
          >
            {name}
          </h1>
          {productCount > 0 && (
            <p
              style={{
                fontSize:   '36px',
                fontWeight: 500,
                color:      'rgba(248, 250, 252, 0.55)',
                margin:     0,
              }}
            >
              {productCount} {productCount === 1 ? 'item' : 'itens'}
              {isCatalog ? ' à venda' : ' no portfólio'}
            </p>
          )}
        </div>

        {/* Rodapé: marca Hayzer */}
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width:         '56px',
                height:        '56px',
                borderRadius:  '14px',
                background:    'linear-gradient(135deg, #7c3aed, #6d28d9)',
                display:       'flex',
                alignItems:    'center',
                justifyContent: 'center',
                fontSize:      '28px',
                fontWeight:    900,
                color:         '#ffffff',
                boxShadow:     '0 4px 24px rgba(124,58,237,0.45)',
              }}
            >
              H
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#f8fafc' }}>
                hayzer.com.br
              </span>
              <span style={{ fontSize: '18px', color: 'rgba(248, 250, 252, 0.45)' }}>
                Pedido pelo WhatsApp, lucro real
              </span>
            </div>
          </div>

          <div
            style={{
              fontSize:    '20px',
              color:       'rgba(248, 250, 252, 0.35)',
              fontWeight:  500,
              display:     'flex',
            }}
          >
            /catalogo/{slug}
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
