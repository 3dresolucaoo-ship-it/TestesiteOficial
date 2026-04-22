'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { StoreProvider } from '@/lib/store'
import { Sidebar, BottomNav } from '@/components/Sidebar'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

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
            background: '#7c3aed',
            boxShadow:  '0 0 30px rgba(124,58,237,0.5)',
          }}
        >
          B
        </div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: '#7c3aed',
                animation:  `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── TopBar (inline to avoid circular import) ─────────────────────────────────

import { TopBar } from '@/components/TopBar'

// ─── Admin-only paths ─────────────────────────────────────────────────────────

const ADMIN_PATHS = ['/settings']

// ─── App Shell ────────────────────────────────────────────────────────────────

export function AppShell({ children }: { children: ReactNode }) {
  const { user, role, loading } = useAuth()
  const pathname                = usePathname()
  const router                  = useRouter()

  const isPublicPath = pathname === '/login'
  const isAdminPath  = ADMIN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))

  // Redirect unauthenticated users to /login
  useEffect(() => {
    if (isSupabaseConfigured && !loading && !user && !isPublicPath) {
      router.replace('/login')
    }
  }, [user, loading, isPublicPath, router])

  // Redirect non-admin users away from admin paths
  useEffect(() => {
    if (
      isSupabaseConfigured &&
      !loading &&
      user &&
      isAdminPath &&
      role !== null &&
      role !== 'admin'
    ) {
      router.replace('/dashboard')
    }
  }, [user, loading, role, isAdminPath, router])

  // Public pages (login): render without chrome
  if (isPublicPath) return <>{children}</>

  // Auth loading state
  if (isSupabaseConfigured && loading) return <LoadingScreen />

  // Unauthenticated: blank while redirect fires
  if (isSupabaseConfigured && !user) return null

  // Admin path: blank while role is still loading
  if (isSupabaseConfigured && isAdminPath && role === null) return <LoadingScreen />

  // Admin path + non-admin: blank while redirect fires
  if (isSupabaseConfigured && isAdminPath && role !== 'admin') return null

  // Authenticated (or Supabase not configured — local dev mode)
  return (
    <StoreProvider>
      <Sidebar />
      <div className="lg:ml-56 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-4 sm:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </StoreProvider>
  )
}
