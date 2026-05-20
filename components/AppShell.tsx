'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { StoreProvider, useStore } from '@/lib/store'
import { Sidebar, BottomNav } from '@/components/Sidebar'
import { AlertTriangle, X } from 'lucide-react'
import type { AppState } from '@/lib/types'

// ─── Loading screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'var(--t-bg)' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-[600px] h-[600px] rounded-full"
          style={{
            background: 'var(--t-accent)',
            opacity:    0.06,
            filter:     'blur(120px)',
          }}
        />
      </div>
      <div className="relative flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center
            text-white font-bold text-lg"
          style={{
            background: 'hsl(173 58% 28%)',
            boxShadow:  '0 0 30px hsl(173 58% 28% / 0.5)',
          }}
        >
          H
        </div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: 'hsl(173 58% 28%)',
                animation:  `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── DB Error Toast ───────────────────────────────────────────────────────────

function DbErrorToast() {
  const { dbError } = useStore()
  const [visible, setVisible] = useState(false)
  const [msg, setMsg]         = useState<string | null>(null)

  useEffect(() => {
    if (dbError) {
      setMsg(dbError)
      setVisible(true)
      const t = setTimeout(() => setVisible(false), 8000)
      return () => clearTimeout(t)
    }
  }, [dbError])

  if (!visible || !msg) return null

  return (
    <div
      className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[9999]
        flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl max-w-sm w-[calc(100%-2rem)]"
      style={{
        background: 'rgba(239,68,68,0.12)',
        border:     '1px solid rgba(239,68,68,0.35)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <AlertTriangle size={16} className="text-[#ef4444] shrink-0 mt-0.5" />
      <p className="text-[#ef4444] text-xs leading-relaxed flex-1">
        <span className="font-semibold block mb-0.5">Erro ao salvar</span>
        {msg}
      </p>
      <button
        onClick={() => setVisible(false)}
        className="text-[#ef4444] opacity-60 hover:opacity-100 transition-opacity shrink-0"
      >
        <X size={13} />
      </button>
    </div>
  )
}

// ─── TopBar (inline to avoid circular import) ─────────────────────────────────

import { TopBar } from '@/components/TopBar'

// ─── App Shell ────────────────────────────────────────────────────────────────

export function AppShell({
  children,
  initialState,
}: {
  children: ReactNode
  /** SSR-fetched store state injected by RootLayout. Eliminates the F5 flash
   *  of empty data on pages that read directly from useStore(). */
  initialState?: AppState | null
}) {
  const { user, loading } = useAuth()
  const pathname         = usePathname()

  const isPublicPath =
    pathname === '/login'                     ||
    pathname === '/showcase'                  ||
    pathname.startsWith('/showcase/')         ||
    pathname.startsWith('/catalogo/')         ||
    pathname.startsWith('/portfolio/')        ||
    pathname.startsWith('/checkout')

  // Redirect client-side removido intencionalmente.
  // middleware.ts:66 já valida a sessão via cookies Supabase antes da rota
  // carregar — se o usuário chegou aqui, o middleware aprovou.
  // O useEffect de redirect duplicava essa checagem no cliente e causava loop:
  // quando AuthProvider.getSession() dava timeout (~5s), loading virava false
  // com user=null, o router.replace('/login') disparava e o middleware
  // redirecionava de volta para a rota original — loop infinito.

  // Public pages (login): render without chrome
  if (isPublicPath) return <>{children}</>

  // Auth loading state — só mostrar LoadingScreen se loading=true. Se loading=false
  // e user=null (getSession timeout), renderizamos o shell mesmo assim trustando
  // o middleware (middleware.ts:66 ja validou cookies Supabase server-side). Sem
  // isso, AppShell retornava null em getSession timeout e a pagina virava tela
  // preta (bug 2026-05-21 madrugada apos remocao do redirect duplicado).
  if (loading) return <LoadingScreen />

  return (
    <StoreProvider initialState={initialState}>
      <Sidebar />
      <div className="sidebar-content flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6 animate-fade-in-up">
          {children}
        </main>
      </div>
      <BottomNav />
      <DbErrorToast />
    </StoreProvider>
  )
}
