'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface ComponentCardProps {
  name: string
  description: string
  /** Snippet de codigo exibido com botao de copia */
  snippet: string
  children: React.ReactNode
}

/**
 * ComponentCard — card de showcase de um componente da visual-library.
 * Preview vivo + nome + descricao + snippet copiavel.
 */
export function ComponentCard({ name, description, snippet, children }: ComponentCardProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback silencioso — clipboard pode estar bloqueado em contextos sem HTTPS
    }
  }

  return (
    <article
      style={{
        backgroundColor: 'hsl(200 11% 9%)',      // night-700
        border: '1px solid rgba(242, 239, 234, 0.07)',
        borderRadius: '12px',
      }}
      className="flex flex-col gap-0 overflow-hidden"
    >
      {/* Preview area */}
      <div
        className="flex min-h-[120px] items-center justify-center p-6"
        style={{ background: 'hsl(200 11% 6%)' }}  // night-800 — fundo pra ver glow certo
      >
        {children}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="mb-1 text-sm font-semibold" style={{ color: 'hsl(43 17% 93%)' }}>
          {name}
        </h3>
        <p className="mb-3 text-xs leading-relaxed" style={{ color: 'hsl(40 12% 71%)' }}>
          {description}
        </p>

        {/* Snippet */}
        <div
          className="group relative rounded-md overflow-hidden"
          style={{ background: 'rgba(7, 9, 10, 0.6)' }}
        >
          <pre
            className="overflow-x-auto p-3 text-[11px] leading-relaxed"
            style={{ color: 'hsl(171 40% 80%)', fontFamily: 'var(--font-mono)' }}
          >
            <code>{snippet}</code>
          </pre>

          <button
            onClick={handleCopy}
            aria-label={copied ? 'Copiado' : `Copiar snippet de ${name}`}
            className="absolute right-2 top-2 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              backgroundColor: copied
                ? 'rgba(31, 118, 105, 0.3)'
                : 'rgba(242, 239, 234, 0.08)',
              color: copied ? 'hsl(171 40% 80%)' : 'hsl(40 12% 71%)',
            }}
          >
            {copied
              ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              : <Copy  className="h-3.5 w-3.5" strokeWidth={2}   />
            }
          </button>
        </div>
      </div>
    </article>
  )
}
