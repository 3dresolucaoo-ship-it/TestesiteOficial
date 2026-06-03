'use client'

/**
 * app/signup/page.tsx — Signup público.
 *
 * Cria conta via Supabase Auth signUp (no AuthContext.signUp).
 * Default config Supabase exige confirmação por email — se desligado em
 * Settings, user entra direto. Suporta ambos os caminhos.
 *
 * Após signup com sucesso: redireciona pro /dashboard, onde o
 * OnboardingController detecta primeira sessão e mostra wizard.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import { Eye, EyeOff, ArrowRight, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'

function GlowOrb({ className }: { className?: string }) {
  return <div className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`} />
}

export default function SignupPage() {
  const { signUp, user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [confirmSent, setConfirmSent] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard')
    }
  }, [user, authLoading, router])

  if (authLoading) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Preenche email e senha.')
      return
    }
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      await signUp(email.trim(), password)
      // Se Supabase exige confirmação, user fica null até clicar no email.
      // Mostra mensagem. Se não exige, AuthContext detecta session nova e
      // useEffect acima redireciona pro /dashboard.
      setConfirmSent(true)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Erro ao criar conta.'
      if (msg.includes('User already registered')) setError('Esse email já tem conta. Use "Entrar".')
      else if (msg.includes('Password')) setError('Senha fraca. Use ao menos 6 caracteres.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050508] overflow-hidden">
      <GlowOrb className="w-[700px] h-[700px] bg-[#7c3aed] opacity-[0.08] top-[-10%] left-[-15%]" />
      <GlowOrb className="w-[500px] h-[500px] bg-[#3b82f6] opacity-[0.06] bottom-[-10%] right-[-10%]" />

      <div className="relative w-full max-w-sm mx-4">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#7c3aed40] via-transparent to-[#3b82f620] rounded-2xl blur-sm" />

        <div className="relative bg-[#0d0d12]/90 backdrop-blur-xl border border-[#ffffff10] rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent" />

          <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] flex items-center justify-center text-white font-bold text-base shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                H
              </div>
              <div>
                <p className="text-[#ebebeb] font-semibold text-sm leading-none">Hayzer</p>
                <p className="text-[#555555] text-[11px] mt-0.5">Sistema operacional do maker 3D</p>
              </div>
            </div>

            {confirmSent ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2.5 bg-[#10b9811a] border border-[#10b98133] rounded-xl px-4 py-3">
                  <CheckCircle2 size={15} className="text-[#10b981] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#10b981] text-sm font-semibold">Conta criada</p>
                    <p className="text-[#888888] text-xs mt-1">
                      Cheque seu email ({email}) e clique no link de confirmação. Depois volta aqui e entra.
                    </p>
                  </div>
                </div>
                <Link
                  href="/login"
                  className="block w-full text-center h-11 leading-[44px] text-[#a78bfa] hover:text-[#c4b5fd] text-sm font-medium transition-colors"
                >
                  Ir pro login
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-[#ebebeb] font-bold text-xl">Cria sua conta</h1>
                  <p className="text-[#555555] text-sm mt-1">Maker 3D no WhatsApp tem que ter sistema próprio.</p>
                </div>

                {!isSupabaseConfigured && (
                  <div className="flex items-start gap-2.5 bg-[#f59e0b1a] border border-[#f59e0b33] rounded-xl px-4 py-3 mb-4">
                    <AlertTriangle size={15} className="text-[#f59e0b] shrink-0 mt-0.5" />
                    <p className="text-[#f59e0b] text-xs leading-relaxed">Supabase não configurado.</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[#888888] text-xs font-medium">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      required
                      className="w-full bg-[#0a0a0f] border border-[#ffffff10] rounded-xl px-4 h-12 text-[#ebebeb] text-sm placeholder:text-[#333333] outline-none focus:border-[#7c3aed] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#888888] text-xs font-medium">Senha</label>
                    <div className="relative">
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="mínimo 6 caracteres"
                        autoComplete="new-password"
                        required
                        className="w-full bg-[#0a0a0f] border border-[#ffffff10] rounded-xl px-4 pr-12 h-12 text-[#ebebeb] text-sm placeholder:text-[#333333] outline-none focus:border-[#7c3aed] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(p => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#888888]"
                      >
                        {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-[#ef44441a] border border-[#ef444433] rounded-xl px-4 py-3">
                      <p className="text-[#ef4444] text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#6d28d9] hover:to-[#5b21b6] disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(124,58,237,0.3)]"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <>Criar conta <ArrowRight size={15} /></>}
                  </button>

                  <p className="text-center text-xs text-[#888888]">
                    Já tem conta?{' '}
                    <Link href="/login" className="text-[#a78bfa] hover:text-[#c4b5fd] transition-colors">
                      Entrar
                    </Link>
                  </p>
                </form>
              </>
            )}

            <p className="text-center text-[#3a3a3a] text-[11px] mt-6">
              Ao criar conta, aceito os{' '}
              <Link href="/termos" className="text-[#555555] hover:text-[#a78bfa]">termos</Link>
              {' e '}
              <Link href="/privacidade" className="text-[#555555] hover:text-[#a78bfa]">política de privacidade</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
