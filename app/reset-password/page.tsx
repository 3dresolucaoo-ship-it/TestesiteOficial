'use client'

/**
 * app/reset-password/page.tsx — Solicita link de reset por email.
 *
 * Usa supabase.auth.resetPasswordForEmail.
 * Email chega via Supabase SMTP (default ou customizado em Settings).
 * Link aponta pra /reset-password/confirm com token no hash.
 */

import { useState } from 'react'
import Link from 'next/link'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { ArrowRight, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'

function GlowOrb({ className }: { className?: string }) {
  return <div className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`} />
}

export default function ResetPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Informe seu email.')
      return
    }

    setLoading(true)
    try {
      const redirectTo = `${window.location.origin}/reset-password/confirm`
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      })
      if (err) throw err
      setSent(true)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Erro ao enviar link.'
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
                <p className="text-[#555555] text-[11px] mt-0.5">Recuperar senha</p>
              </div>
            </div>

            {sent ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2.5 bg-[#10b9811a] border border-[#10b98133] rounded-xl px-4 py-3">
                  <CheckCircle2 size={15} className="text-[#10b981] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#10b981] text-sm font-semibold">Link enviado</p>
                    <p className="text-[#888888] text-xs mt-1">
                      Cheque seu email ({email}) e clique no link pra criar uma senha nova. Pode demorar 1-2 minutos.
                    </p>
                  </div>
                </div>
                <Link
                  href="/login"
                  className="block w-full text-center h-11 leading-[44px] text-[#a78bfa] hover:text-[#c4b5fd] text-sm font-medium transition-colors"
                >
                  Voltar pro login
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-[#ebebeb] font-bold text-xl">Esqueceu a senha</h1>
                  <p className="text-[#555555] text-sm mt-1">A gente manda um link pra você criar uma nova.</p>
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
                      className="w-full bg-[#0a0a0f] border border-[#ffffff10] rounded-xl px-4 h-12 text-[#ebebeb] text-sm placeholder:text-[#333333] outline-none transition-all duration-200 focus:border-[#7c3aed] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]"
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
                    className="w-full h-12 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#6d28d9] hover:to-[#5b21b6] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.3)]"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <>Enviar link <ArrowRight size={15} /></>}
                  </button>

                  <Link
                    href="/login"
                    className="block text-center text-xs text-[#888888] hover:text-[#a78bfa] transition-colors"
                  >
                    Voltar pro login
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
