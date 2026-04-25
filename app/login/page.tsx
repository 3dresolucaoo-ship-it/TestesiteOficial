'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'

function AuthLoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050508]">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 30px rgba(124,58,237,0.5)' }}
        >
          B
        </div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]"
              style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Animated gradient orb ────────────────────────────────────────────────────
function GlowOrb({ className }: { className?: string }) {
  return (
    <div
      className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`}
    />
  )
}

export default function LoginPage() {
  const { signIn, signUp, user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [mode,     setMode]     = useState<'login' | 'register'>('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard')
    }
  }, [user, authLoading, router])

  // While auth is resolving, don't flash the login form
  if (authLoading) return <AuthLoadingScreen />

  // If user is logged in, redirect is in flight — blank until it fires
  if (user) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email.trim() || !password.trim()) {
      setError('Preencha todos os campos.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password)
        router.replace('/dashboard')
      } else {
        await signUp(email.trim(), password)
        setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
        setMode('login')
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Ocorreu um erro. Tente novamente.'
      // Translate common Supabase error messages
      if (msg.includes('Invalid login credentials'))
        setError('E-mail ou senha incorretos.')
      else if (msg.includes('User already registered'))
        setError('Este e-mail já está cadastrado.')
      else if (msg.includes('Email not confirmed'))
        setError('Confirme seu e-mail antes de entrar.')
      else
        setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050508] overflow-hidden">

      {/* ── Background gradient orbs ─────────────────────────────────── */}
      <GlowOrb className="w-[700px] h-[700px] bg-[#7c3aed] opacity-[0.08] top-[-10%] left-[-15%]" />
      <GlowOrb className="w-[500px] h-[500px] bg-[#3b82f6] opacity-[0.06] bottom-[-10%] right-[-10%]" />
      <GlowOrb className="w-[300px] h-[300px] bg-[#10b981] opacity-[0.04] top-[60%] left-[30%]" />

      {/* ── Grid texture ─────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Card ─────────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-sm mx-4">
        {/* Card glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#7c3aed40] via-transparent to-[#3b82f620]
          rounded-2xl blur-sm" />

        <div className="relative bg-[#0d0d12]/90 backdrop-blur-xl border border-[#ffffff10]
          rounded-2xl shadow-2xl overflow-hidden">

          {/* Top accent line */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#6d28d9]
                flex items-center justify-center text-white font-bold text-base
                shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                B
              </div>
              <div>
                <p className="text-[#ebebeb] font-semibold text-sm leading-none">BVaz Hub</p>
                <p className="text-[#555555] text-[11px] mt-0.5">Sistema Operacional</p>
              </div>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-[#ebebeb] font-bold text-xl">
                {mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
              </h1>
              <p className="text-[#555555] text-sm mt-1">
                {mode === 'login'
                  ? 'Entre para acessar o sistema'
                  : 'Preencha os dados para criar sua conta'}
              </p>
            </div>

            {/* Mode tabs */}
            <div className="flex bg-[#0a0a0f] rounded-lg p-0.5 border border-[#ffffff08] mb-6">
              {(['login', 'register'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null); setSuccess(null) }}
                  className={`flex-1 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                    mode === m
                      ? 'bg-[#7c3aed] text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                      : 'text-[#555555] hover:text-[#888888]'
                  }`}
                >
                  {m === 'login' ? 'Entrar' : 'Cadastrar'}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* E-mail */}
              <div className="space-y-1.5">
                <label className="text-[#888888] text-xs font-medium">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                  className="w-full bg-[#0a0a0f] border border-[#ffffff10] rounded-xl
                    px-4 h-12 text-[#ebebeb] text-sm placeholder:text-[#333333]
                    outline-none transition-all duration-200
                    focus:border-[#7c3aed] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[#888888] text-xs font-medium">Senha</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    className="w-full bg-[#0a0a0f] border border-[#ffffff10] rounded-xl
                      px-4 pr-12 h-12 text-[#ebebeb] text-sm placeholder:text-[#333333]
                      outline-none transition-all duration-200
                      focus:border-[#7c3aed] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#888888] transition-colors"
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Feedback */}
              {error && (
                <div className="bg-[#ef44441a] border border-[#ef444433] rounded-xl px-4 py-3">
                  <p className="text-[#ef4444] text-sm">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-[#10b9811a] border border-[#10b98133] rounded-xl px-4 py-3">
                  <p className="text-[#10b981] text-sm">{success}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9]
                  hover:from-[#6d28d9] hover:to-[#5b21b6]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  text-white text-sm font-semibold rounded-xl
                  flex items-center justify-center gap-2
                  transition-all duration-200
                  shadow-[0_4px_20px_rgba(124,58,237,0.3)]
                  hover:shadow-[0_4px_30px_rgba(124,58,237,0.5)]"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Entrar' : 'Criar conta'}
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom */}
          <div className="px-8 pb-6">
            <p className="text-center text-[#3a3a3a] text-[11px]">
              Acesso restrito — BVaz Hub v0.4
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
