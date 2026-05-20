'use client'

/**
 * Error boundary do dashboard V4.
 *
 * Captura erros de render no tree do /dashboard/v4 sandbox sem crashar
 * a UI inteira. Padrao Next.js App Router (convention: error.tsx em
 * qualquer pasta gera boundary local).
 *
 * Quando dispara:
 * - Erro em getDashboardData (servico Supabase fora)
 * - Erro em algum componente filho do DashboardLayout
 * - Erro em parsing de dados (formato inesperado)
 *
 * NAO dispara em:
 * - 404 (use not-found.tsx)
 * - Erro em server actions (esses voltam como state)
 * - Erro em loading.tsx (esse cai pro error global do app)
 *
 * UI: mensagem PT-BR amigavel + botao "Tentar de novo" (Next.js reset())
 * + link voltar pra /dashboard. Visual herda paleta Hayzer (night/petrol).
 */

import Link from 'next/link'
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardV4Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Em prod, Sentry vai pegar isso automaticamente a partir de 17/06/2026 (ADR-019).
    // Por enquanto, log no console pra debug local.
    console.error('[dashboard/v4] Erro de render:', error)
  }, [error])

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: 'hsl(var(--night-950))' }}
    >
      <div className="mx-auto max-w-[480px] text-center">
        {/* Eyebrow tag */}
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em]"
          style={{
            borderColor: 'hsl(var(--ember-500) / 0.40)',
            color: 'hsl(var(--ember-400))',
            fontFamily: 'ui-monospace, "Geist Mono", monospace',
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: 'hsl(var(--ember-400))' }}
          />
          erro inesperado
        </div>

        {/* Headline editorial sem ponto final (regra Hayzer) */}
        <h1
          className="display-h2 mb-4 text-foreground"
          style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            lineHeight: 1.2,
          }}
        >
          Algo travou no dashboard
        </h1>

        {/* Sub explicativo */}
        <p
          className="mb-8 leading-[1.55]"
          style={{ color: 'hsl(var(--fog-400))', fontSize: '15px' }}
        >
          A gente errou. Pode ser conexao com o banco, formato de dados ou bug
          de codigo novo. Tenta de novo. Se persistir, volta pro dashboard
          principal que tem mais resiliencia.
        </p>

        {/* Acoes */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-[14px] font-medium transition-colors"
            style={{
              background: 'hsl(var(--petrol-600))',
              color: 'hsl(var(--fog-50))',
            }}
          >
            Tentar de novo
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md border px-5 py-2.5 text-[14px] font-medium transition-colors"
            style={{
              borderColor: 'hsl(var(--fog-50) / 0.15)',
              color: 'hsl(var(--fog-200))',
            }}
          >
            Voltar pro dashboard
          </Link>
        </div>

        {/* Digest tecnico (so em dev pra debug) */}
        {error.digest && (
          <p
            className="mt-8 text-[11px]"
            style={{
              color: 'hsl(var(--fog-500))',
              fontFamily: 'ui-monospace, "Geist Mono", monospace',
            }}
          >
            digest: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
