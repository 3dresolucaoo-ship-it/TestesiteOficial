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
      setLoading(false)
      return
    }

    // Safety timeout: if getSession() hangs for any reason (bad key, CORS,
    // network failure), we unblock the UI after 5 s instead of loading forever.
    const safetyTimer = setTimeout(() => {
      console.warn('[Auth] getSession timed out — unblocking UI')
      setLoading(false)
    }, 5000)

    // Restore existing session (handles page refresh).
    // setLoading(false) is called IMMEDIATELY after the local session read
    // so the app renders without waiting for the profile network call.
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(safetyTimer)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)                                    // ← unblocks the UI instantly
      if (session?.user) loadProfile(session.user.id)    // ← background, no await
    }).catch(err => {
      clearTimeout(safetyTimer)
      console.error('[Auth] getSession failed:', err?.message)
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

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('[Auth] signOut failed:', error.message)
    setUser(null)
    setSession(null)
    setRole(null)
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
