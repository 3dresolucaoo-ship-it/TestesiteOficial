import { ImageResponse } from 'next/og'

// Diego (designer) + Felipe (frontend):
// - OG image dinâmica gerada via Edge Runtime (next/og)
// - Visual: paleta petrol (background) + ember (acento)
// - Tipografia editorial pra reforçar identidade marketing
// - Tamanho padrão Open Graph: 1200x630

export const runtime = 'edge'
export const alt = 'Calculadora 3D Hayzer · preço justo, lucro real'
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
          backgroundColor: '#07090A', // night-950 da paleta marketing
          backgroundImage:
            'radial-gradient(ellipse at top right, rgba(31, 118, 105, 0.55), transparent 60%), radial-gradient(ellipse at bottom left, rgba(208, 138, 74, 0.22), transparent 55%)',
          color: '#F2EFEA',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header: logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              backgroundColor: '#1F7669', // petrol-500 da paleta
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
          <span
            style={{
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: '-0.02em',
            }}
          >
            Hayzer
          </span>
        </div>

        {/* Centro: título + subtítulo */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              color: '#F2EFEA',
              maxWidth: 1000,
            }}
          >
            Calculadora 3D
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: '#9CA8AE',
              maxWidth: 900,
            }}
          >
            Custo real. Lucro real. <span style={{ color: '#D08A4A' }}>Preço justo.</span>
          </div>
        </div>

        {/* Footer: domain + tagline */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 22,
            color: '#7B868C',
          }}
        >
          <span>hayzer.com.br/calculadora</span>
          <span style={{ color: '#6FB5A8', fontWeight: 600 }}>
            Para makers de impressão 3D
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
