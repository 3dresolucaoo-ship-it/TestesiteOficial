'use client'

import {
  createContext, useContext, useEffect, useState, useCallback,
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

    // Safety timeout: if getSession() hangs (bad key, CORS, network failure,
    // Supabase cold start), unblock the UI after 12 s instead of loading forever.
    // We track whether getSession() has already resolved so the timer never
    // overrides a real "user is logged in" state.
    let sessionResolved = false
    const safetyTimer = setTimeout(() => {
      if (!sessionResolved) {
        console.warn('[Auth] getSession timed out — unblocking UI (no session confirmed)')
        setLoading(false)
        // user stays null → AppShell will redirect to /login (correct safe-fail behavior)
      }
    }, 12_000)

    // Validate session against Supabase server (getUser makes a network round-trip,
    // unlike getSession which reads the local cookie without verifying expiry).
    // This ensures client and middleware use the same auth source of truth.
    supabase.auth.getUser().then(async ({ data: { user: validUser } }) => {
      sessionResolved = true
      clearTimeout(safetyTimer)
      if (validUser) {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(validUser)
        loadProfile(validUser.id)    // ← background, no await
      } else {
        setSession(null)
        setUser(null)
      }
      setLoading(false)
    }).catch(err => {
      sessionResolved = true
      clearTimeout(safetyTimer)
      console.error('[Auth] getUser failed:', err?.message)
      setLoading(false)
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
      clearTimeout(safetyTimer)
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

  const signOut = useCallback(() => {
    setUser(null)
    setSession(null)
    setRole(null)
    supabase.auth.signOut().catch(err =>
      console.error('[Auth] signOut cleanup failed:', err?.message)
    )
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
