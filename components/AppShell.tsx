'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { StoreProvider, useStore } from '@/lib/store'
import { V4Shell } from '@/components/dashboard/v4/V4Shell'
import { OnboardingController } from '@/components/onboarding/OnboardingController'
import { AlertTriangle, X } from 'lucide-react'
import type { AppState } from '@/lib/types'

// ─── Loading screen V4 ────────────────────────────────────────────────────────
// Background preto Hayzer + glow petrol bottom + watermark Fraunces.
// Visual coerente com V4Shell pra evitar flash de tela escura "antiga" entre
// auth loading e shell montado.

function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: '#0A0E10' }}
    >
      {/* Glow petrol vindo de baixo (luz suave) */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom:     '-30%',
          left:       '50%',
          transform:  'translateX(-50%)',
          width:      '120vw',
          height:     '90vh',
          background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(31, 118, 105, 0.28) 0%, rgba(31, 118, 105, 0.10) 35%, transparent 65%)',
          filter:     'blur(40px)',
        }}
      />

      {/* Glow ember sutil top-right pra dar dimensão */}
      <div
        className="absolute pointer-events-none"
        style={{
          top:        '-10%',
          right:      '-15%',
          width:      '50vw',
          height:     '50vh',
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(208, 138, 74, 0.12) 0%, transparent 60%)',
          filter:     'blur(60px)',
        }}
      />

      {/* Watermark hayzer Fraunces italic gigante embaixo */}
      <div
        aria-hidden="true"
        style={{
          position:     'absolute',
          bottom:       '4%',
          left:         '50%',
          transform:    'translateX(-50%)',
          fontFamily:   'var(--font-fraunces, Fraunces, Georgia, serif)',
          fontStyle:    'italic',
          fontSize:     'clamp(120px, 18vw, 280px)',
          fontWeight:   400,
          color:        'rgba(166, 212, 204, 0.04)',
          letterSpacing: '-0.04em',
          lineHeight:    1,
          pointerEvents: 'none',
          userSelect:    'none',
          whiteSpace:    'nowrap',
        }}
      >
        hayzer
      </div>

      {/* Logo H + dots */}
      <div className="relative flex flex-col items-center gap-5 z-10">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center
            font-bold text-xl"
          style={{
            background:  'linear-gradient(135deg, hsl(173 58% 28%), hsl(173 58% 22%))',
            color:       '#F2EFEA',
            boxShadow:   '0 0 40px hsl(173 58% 28% / 0.6), 0 0 80px hsl(173 58% 28% / 0.3)',
            border:      '1px solid hsl(173 35% 40% / 0.5)',
          }}
        >
          H
        </div>
        <div className="flex items-center gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: 'hsl(173 35% 60%)',
                animation:  `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                opacity:    0.75,
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

// ─── V4Shell adapter ──────────────────────────────────────────────────────────
// Lê useAuth + useStore (precisa estar DENTRO de StoreProvider) e monta props
// do V4Shell. Adapter, não shell — V4Shell faz o trabalho real.

function V4ShellAdapter({ children }: { children: ReactNode }) {
  const { user }  = useAuth()
  const { state } = useStore()

  // Projeto ativo: primeiro projeto disponível. Se zero projetos, V4Shell
  // recebe '' e renderiza '??' no switcher (tolerado, MVP).
  const projects = state.projects.map(p => ({
    id:       p.id,
    name:     p.name,
    revenue:  0,
    isActive: true,
  }))

  const userName  = user?.user_metadata?.full_name as string | undefined
    ?? user?.email?.split('@')[0]
    ?? 'Maker'

  const projectId = projects[0]?.id ?? ''
  const streak    = { days: 0 }  // TODO Wave 4: popular via streakService

  return (
    <V4Shell
      userName={userName}
      projectId={projectId}
      projects={projects}
      streak={streak}
    >
      {children}
    </V4Shell>
  )
}

// ─── App Shell ────────────────────────────────────────────────────────────────
// V4 shell unificado para TODAS as rotas internas (decisao CEO 21/05 A.5):
// "v4 e antigo entre dentro dele e fique integrado". Sidebar/topbar/ambient
// do V4Shell envolve children — paginas continuam renderizando seu conteudo
// (V4 ModuleShell ou legado), independente do shell exterior.

export function AppShell({
  children,
  initialState,
}: {
  children: ReactNode
  /** SSR-fetched store state injected by RootLayout. Eliminates the F5 flash
   *  of empty data on pages that read directly from useStore(). */
  initialState?: AppState | null
}) {
  const { loading } = useAuth()
  const pathname    = usePathname()

  const isPublicPath =
    pathname === '/login'                     ||
    pathname === '/showcase'                  ||
    pathname.startsWith('/showcase/')         ||
    pathname.startsWith('/catalogo/')         ||
    pathname.startsWith('/portfolio/')        ||
    pathname.startsWith('/checkout')

  // Public pages (login, showcase, catalogo publico): render sem shell
  if (isPublicPath) return <>{children}</>

  // Auth loading. Apos fix A.6 (commit 6a7a376), UI destrava em <3s sem
  // bloquear no loadProfile. Mantemos LoadingScreen como fallback minimo.
  if (loading) return <LoadingScreen />

  return (
    <StoreProvider initialState={initialState}>
      <V4ShellAdapter>{children}</V4ShellAdapter>
      <DbErrorToast />
      <OnboardingController />
    </StoreProvider>
  )
}
