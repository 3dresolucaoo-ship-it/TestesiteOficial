import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { AuthProvider }  from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { AppShell }      from '@/components/AppShell'
import { getUser }       from '@/lib/auth'
import { createServerClient } from '@/lib/supabaseServer'
import { loadInitialState } from '@/lib/serverDataLoader'
import type { AppState } from '@/lib/types'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'BVaz Hub',
  description: 'Sistema operacional de negócios',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Pre-fetch the full app state SSR for authenticated users so the client store
  // starts already populated. This eliminates the F5 flash of empty data on
  // pages that read directly from useStore() (decisions, products, inventory,
  // crm, orders, production, content, metrics).
  let initialState: AppState | null = null
  try {
    const user = await getUser()
    if (user) {
      const supabase = await createServerClient()
      initialState   = await loadInitialState(supabase, user.id)
    }
  } catch (err) {
    // Never let a layout-level fetch failure break the entire app —
    // the client-side fallback hydration in StoreProvider will handle it.
    console.error('[RootLayout] SSR state prefetch failed:', err)
  }

  return (
    <html lang="pt-BR" className={`${geist.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <AppShell initialState={initialState}>
              {children}
            </AppShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
