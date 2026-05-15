import type { Metadata, Viewport } from 'next'
import { Geist, Fraunces } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AuthProvider }  from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { LayoutSwitch }  from '@/components/LayoutSwitch'
import { getUser }       from '@/lib/auth'
import { createServerClient } from '@/lib/supabaseServer'
import { loadInitialState } from '@/lib/serverDataLoader'
import type { AppState } from '@/lib/types'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
// Fraunces serif editorial — usada nos headings da landing (Hero h1, h2, watermark).
// Diego (designer): peso 600 com opsz 144 dá o ar editorial premium anti-IA.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['opsz', 'SOFT'],
  // Fraunces é variable font — não passar weight (usa variable por padrão).
})

export const metadata: Metadata = {
  title: 'Hayzer — A raiz do seu negócio',
  description: 'Substitui gambiarra, planilha perdida e desorganização por controle real. Estoque, vendas, clientes, financeiro num lugar só. A raiz firme que sustenta tudo.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://hayzer.com.br'),
  openGraph: {
    title: 'Hayzer — A raiz do seu negócio',
    description: 'Substitui gambiarra, planilha perdida e WhatsApp confuso por controle real. A raiz firme do seu negócio.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hayzer — A raiz do seu negócio',
    description: 'Substitui gambiarra, planilha perdida e WhatsApp confuso por controle real. A raiz firme do seu negócio.',
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
        <ThemeProvider>
          <AuthProvider>
            <LayoutSwitch initialState={initialState}>
              {children}
            </LayoutSwitch>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
