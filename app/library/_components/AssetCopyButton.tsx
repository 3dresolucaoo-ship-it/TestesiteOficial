'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface AssetCopyButtonProps {
  path: string
}

/**
 * AssetCopyButton — botao client-only que copia o path do asset pro clipboard.
 * Separado de AssetSection (Server Component) pelo boundary client/server.
 */
export function AssetCopyButton({ path: assetPath }: AssetCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(assetPath)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard bloqueado — ignora
    }
  }

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? 'Caminho copiado' : `Copiar caminho de ${assetPath}`}
      className="shrink-0 rounded p-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
      style={{
        backgroundColor: copied
          ? 'rgba(31, 118, 105, 0.25)'
          : 'rgba(242, 239, 234, 0.06)',
        color: copied ? 'hsl(171 40% 80%)' : 'hsl(40 12% 71%)',
      }}
    >
      {copied
        ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        : <Copy  className="h-3.5 w-3.5" strokeWidth={2}   />
      }
    </button>
  )
}
