import { ImageResponse } from 'next/og'

// OG image global do Hayzer — fallback usado em todas as páginas que não definirem própria.
// Diego (designer): variação da paleta marketing (petrol + ember + grain).
// Tamanho padrão Open Graph: 1200x630.

export const runtime = 'edge'
export const alt = 'Hayzer · A raiz do seu negócio'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          backgroundColor: '#07090A', // night-950
          backgroundImage:
            'radial-gradient(ellipse at center, rgba(31, 118, 105, 0.55), transparent 65%), radial-gradient(ellipse at bottom right, rgba(208, 138, 74, 0.28), transparent 60%)',
          color: '#F2EFEA',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              backgroundColor: '#1F7669', // petrol-500
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 700,
              color: '#F2EFEA',
            }}
          >
            H
          </div>
          <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em' }}>
            Hayzer
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              color: '#F2EFEA',
              maxWidth: 1000,
            }}
          >
            A raiz do seu negócio.
          </div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              color: '#9CA8AE',
              maxWidth: 950,
            }}
          >
            Quatro sistemas, nenhum conversa. <span style={{ color: '#D08A4A' }}>Aqui é um, e fala português.</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 22,
            color: '#7B868C',
          }}
        >
          <span>hayzer.com.br</span>
          <span style={{ color: '#6FB5A8', fontWeight: 600 }}>
            Para makers de impressão 3D
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
