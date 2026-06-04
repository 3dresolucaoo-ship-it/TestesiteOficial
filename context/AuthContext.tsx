'use client'

import {
  createContext, useContext, useEffect, useState, useCallback, useRef,
  type ReactNode,
} from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { profilesService, type UserRole } from '@/services/profiles'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  user:    User    | null
  session: Session | null
  role:    UserRole | null    // null = still loading or no auth
  loading: boolean
  signIn:  (email: string, password: string) => Promise<void>
  signUp:  (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthState | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User    | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role,    setRole]    = useState<UserRole | null>(null)
  // Start loading=true only when Supabase is configured (otherwise no auth needed)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  /** Fetch (and auto-create) a profile row for the given user. */
  async function loadProfile(userId: string) {
    try {
      const profile = await profilesService.get(userId)
      if (!profile) {
        // First sign-in — auto-create profile with default 'user' role
        await profilesService.upsert(userId, 'user')
        setRole('user')
      } else {
        setRole(profile.role)
      }
    } catch (err) {
      console.warn('[Auth] Could not load profile:', err)
      setRole('user')   // safe default
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Dev-only bypass: auto-login so local development without Supabase still works.
      // In production, env vars must always be set — missing vars mean user=null → /login.
      if (process.env.NODE_ENV === 'development') {
        setUser({ id: 'local-dev', email: 'dev@local.com' } as unknown as User)
        setRole('admin')
      }
      setLoading(false)
      return
    }

    // STEP 1: Read local session from cookie (no network round-trip).
    // Unblocks the UI in ~50 ms. Antes esse boot chamava getUser() PRIMEIRO,
    // que faz network roundtrip pro Supabase pra validar o JWT — em prod com
    // Vercel Fluid cold-start travava 8-12s + safety timer 12s = ~20s no
    // splash. Ver [[hayzer-auth-bug-supabase-2106]] + screenshot CEO 03/06 noite.
    //
    // getSession() lê do cookie via adapter @supabase/ssr (local, ~50ms).
    // Risco: token pode ter expirado entre client e server — mitigado pela
    // revalidação STEP 2 abaixo + middleware SSR continua sendo source of truth.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSession(session)
        setUser(session.user)
        setRole('user')         // optimistic — loadProfile pode promover
      }
      setLoading(false)         // ← UI libera aqui (era 12-20s, agora ~50ms)
    }).catch(err => {
      // Cookie read shouldn't fail, but be safe
      console.warn('[Auth] getSession local read failed:', err?.message)
      setLoading(false)
    })

    // STEP 2: In parallel, revalidate session against Supabase server +
    // promote role via loadProfile if valid.
    //
    // IMPORTANT: NÃO derruba session local se getUser() falhar por
    // network/timeout. Em prod com Vercel Fluid cold-start essa chamada
    // pode dar erro transient (8-12s timeout), e logout indevido seria
    // pior que sessão "fantasma" momentanea. Middleware SSR continua sendo
    // source of truth — derruba no proximo request server-side se token
    // realmente expirou.
    //
    // Só derruba se o SERVER respondeu explicitamente que o token nao vale
    // (AuthApiError com status 401/403). Erros de rede/timeout = mantem
    // session local.
    supabase.auth.getUser().then(({ data: { user: validUser }, error }) => {
      if (validUser) {
        // Server confirmou — promove role
        void loadProfile(validUser.id)
      } else if (error && (error.status === 401 || error.status === 403)) {
        // Server EXPLICITAMENTE rejeitou o token — limpa estado local
        setSession(null)
        setUser(null)
        setRole(null)
      } else {
        // Sem user mas sem erro 401/403 = transient. Log e mantem session
        // local (middleware vai derrubar na proxima request se expirou).
        console.warn('[Auth] revalidation indeterminate, keeping local session:', error?.message ?? 'no user, no error')
      }
    }).catch(err => {
      // Network error completo (DNS, CORS, etc) — mantem session local
      console.warn('[Auth] server revalidation failed (keeping local session):', err?.message)
    })

    // Subscribe to session changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setRole(null)
        }
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('[Auth] signIn failed:', error.message)
      throw error as AuthError
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      console.error('[Auth] signUp failed:', error.message)
      throw error as AuthError
    }
  }, [])

  const signingOutRef = useRef(false)
  const signOut = useCallback(async () => {
    // Idempotent guard so rapid double-clicks don't race the auth.signOut() call.
    if (signingOutRef.current) return
    signingOutRef.current = true

    // Race signOut against a 3 s timeout. If Supabase is unreachable we still
    // forcibly clear local state and redirect — the user must always be able
    // to log out, even when offline. scope:'local' avoids the global revoke
    // network round-trip that was making logout hang.
    try {
      await Promise.race([
        supabase.auth.signOut({ scope: 'local' }),
        new Promise(resolve => setTimeout(resolve, 3000)),
      ])
    } catch (err) {
      console.error('[Auth] signOut failed:', (err as Error)?.message)
    }

    // Force-expire any leftover Supabase auth cookies in case signOut was a
    // no-op (e.g. timed out). Without this, middleware would still see the
    // user authenticated on the next request and bounce us back to /dashboard.
    if (typeof document !== 'undefined') {
      document.cookie.split(';').forEach(c => {
        const name = c.split('=')[0].trim()
        if (name.startsWith('sb-')) {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        }
      })
    }

    setUser(null)
    setSession(null)
    setRole(null)
    window.location.replace('/login')
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside <AuthProvider>')
  return ctx
}
