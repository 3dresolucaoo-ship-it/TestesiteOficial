'use client'

/**
 * app/reset-password/confirm/page.tsx — Cria senha nova.
 *
 * User chega aqui via link no email (Supabase recovery flow).
 * Token vem no URL hash — Supabase SDK trata automaticamente via
 * onAuthStateChange('PASSWORD_RECOVERY').
 *
 * Aqui só pega senha nova e chama supabase.auth.updateUser.
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'

function GlowOrb({ className }: { className?: string }) {
  return <div className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`} />
}

export default function ResetPasswordConfirmPage() {
  const router = useRouter()
  const [password, setPassword]       = useState('')
  const [confirmPwd, setConfirmPwd]   = useState('')
  const [showPwd, setShowPwd]         = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [success, setSuccess]         = useState(false)
  const [recoveryReady, setRecoveryReady] = useState(false)

  // Listener pra confirmar que evento PASSWORD_RECOVERY chegou
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setRecoveryReady(true)
      }
    })

    // Fallback: depois de 2s sem evento, assume que tá OK (link clicado direto)
    const timer = setTimeout(() => setRecoveryReady(true), 2000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirmPwd) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) throw err
      setSuccess(true)
      setTimeout(() => router.replace('/dashboard'), 1500)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Erro ao atualizar senha.'
      setError(msg)
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
                <p className="text-[#555555] text-[11px] mt-0.5">Nova senha</p>
              </div>
            </div>

            {success ? (
              <div className="flex items-start gap-2.5 bg-[#10b9811a] border border-[#10b98133] rounded-xl px-4 py-3">
                <CheckCircle2 size={15} className="text-[#10b981] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#10b981] text-sm font-semibold">Senha atualizada</p>
                  <p className="text-[#888888] text-xs mt-1">Redirecionando pro dashboard...</p>
                </div>
              </div>
            ) : !recoveryReady ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-[#7c3aed]" />
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-[#ebebeb] font-bold text-xl">Cria sua senha nova</h1>
                  <p className="text-[#555555] text-sm mt-1">Mínimo 6 caracteres.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[#888888] text-xs font-medium">Senha nova</label>
                    <div className="relative">
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        className="w-full bg-[#0a0a0f] border border-[#ffffff10] rounded-xl px-4 pr-12 h-12 text-[#ebebeb] text-sm outline-none focus:border-[#7c3aed] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]"
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

                  <div className="space-y-1.5">
                    <label className="text-[#888888] text-xs font-medium">Confirma a senha</label>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={confirmPwd}
                      onChange={e => setConfirmPwd(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                      className="w-full bg-[#0a0a0f] border border-[#ffffff10] rounded-xl px-4 h-12 text-[#ebebeb] text-sm outline-none focus:border-[#7c3aed] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]"
                    />
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
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <>Salvar nova senha <ArrowRight size={15} /></>}
                  </button>

                  <Link
                    href="/login"
                    className="block text-center text-xs text-[#888888] hover:text-[#a78bfa] transition-colors"
                  >
                    Cancelar e voltar pro login
                  </Link>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
