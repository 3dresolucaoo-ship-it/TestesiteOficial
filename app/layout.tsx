import type { Metadata, Viewport } from 'next'
import { Geist, Fraunces } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { ThemeProvider }     from '@/context/ThemeContext'
import { PostHogProvider }   from '@/context/PostHogProvider'
import { LayoutSwitch }      from '@/components/LayoutSwitch'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import { getUser }           from '@/lib/auth'
import { createServerClient } from '@/lib/supabaseServer'
import { loadInitialState }  from '@/lib/serverDataLoader'
import type { AppState }     from '@/lib/types'

// Fonts loading otimizado (20/05/2026 — Lighthouse audit LCP fix):
//   display: 'swap'  -> fallback aparece, troca quando custom carrega (zero FOIT)
//   preload: true    -> Next.js gera <link rel="preload"> automatico
//   adjustFontFallback: true -> minimiza CLS via metric override
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
  fallback: ['system-ui', 'arial'],
})

// Fraunces serif editorial — usada nos headings da landing (Hero h1, h2, watermark).
// Diego (designer): peso 600 com opsz 144 dá o ar editorial premium anti-IA.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['opsz', 'SOFT'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  // Fraunces é variable font — não passar weight (usa variable por padrão).
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hayzer.com.br'

export const metadata: Metadata = {
  title: {
    default: 'Hayzer · A raiz do seu negócio',
    template: '%s · Hayzer',
  },
  description:
    'Sistema pra maker 3D BR organizar pedido do WhatsApp, custo de filamento e lucro real do mês. Sem 3 assinaturas separadas. Sem planilha que ninguém entende.',
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: '/',
  },
  keywords: [
    'maker 3D Brasil',
    'sistema gestão impressão 3D',
    'precificar peça 3D',
    'calculadora 3D Brasil',
    'gerenciar pedido WhatsApp 3D',
    'ERP maker 3D',
    'controle de filamento',
    'Bambu Lab gestão',
    'pequeno negócio impressão 3D',
    'Hayzer',
  ],
  authors: [{ name: 'Hayzer', url: APP_URL }],
  creator: 'Hayzer',
  publisher: 'Hayzer',
  category: 'business',
  openGraph: {
    title: 'Hayzer · A raiz do seu negócio',
    description:
      'Pedido do WhatsApp, filamento contado, comissão descontada. Tudo numa tela só. Construído pra quem imprime de verdade.',
    type: 'website',
    locale: 'pt_BR',
    url: APP_URL,
    siteName: 'Hayzer',
    images: [
      {
        url: '/landing/v2/printer-hero.jpg',
        width: 1080,
        height: 1920,
        alt: 'Bambu Lab A1 imprimindo 28 peças em PLA amarelo com listras verdes — Hayzer pra maker 3D BR',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hayzer · A raiz do seu negócio',
    description:
      'Pedido do WhatsApp, filamento contado, comissão descontada. Tudo numa tela só. Construído pra quem imprime de verdade.',
    images: ['/landing/v2/printer-hero.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#0a0a0d' },
  ],
}

// PWA: linka manifest.json no <head> (20/05/2026)
// Next.js auto-injeta via manifest property na metadata
export const manifestMetadata: Pick<Metadata, 'manifest'> = {
  manifest: '/manifest.json',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Pre-fetch the full app state SSR for authenticated users so the client store
  // starts already populated. LayoutSwitch decides whether to wrap with AppShell
  // (auth) or render naked (landing pública).
  let initialState: AppState | null = null
  try {
    const user = await getUser()
    if (user) {
      const supabase = await createServerClient()
      initialState   = await loadInitialState(supabase, user.id)
    }
  } catch (err) {
    console.error('[RootLayout] SSR state prefetch failed:', err)
  }

  return (
    <html lang="pt-BR" className={`${geist.variable} ${fraunces.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <PostHogProvider>
          <ThemeProvider>
            <LayoutSwitch initialState={initialState}>
              {children}
            </LayoutSwitch>
          </ThemeProvider>
        </PostHogProvider>
        <Analytics />
        <SpeedInsights />
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
