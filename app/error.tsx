'use client'

// Felipe (frontend) + Sofia (CS):
// Error boundary global do Hayzer. Mensagem em PT-BR formal, tom de parceiro.
// Botão "Tentar de novo" usa reset() do Next.js — re-renderiza segmento.
// Em produção, erros são reportados via Vercel Analytics + console.

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log de erro pra observabilidade futura (Sentry/Vercel Agent — Semana 7 do ROADMAP)
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-background text-foreground px-6">
      <div className="max-w-md text-center space-y-4">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(173_58%_28%)] text-2xl font-bold">
          H
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Algo travou aqui do nosso lado.
        </h1>
        <p className="text-sm text-foreground/70 leading-relaxed">
          Já registramos a falha e estamos resolvendo. Tenta de novo em alguns segundos. Se persistir, manda o código abaixo pelo WhatsApp.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-foreground/50 bg-foreground/5 inline-block px-3 py-1.5 rounded-md">
            ref: {error.digest}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-lg bg-[hsl(173_58%_28%)] text-foreground hover:bg-[hsl(173_58%_32%)] transition-colors text-sm font-medium"
        >
          Tentar de novo
        </button>
        <a
          href="/"
          className="px-5 py-2.5 rounded-lg border border-foreground/15 text-foreground/80 hover:bg-foreground/5 transition-colors text-sm font-medium"
        >
          Voltar para o início
        </a>
      </div>
    </div>
  )
}
