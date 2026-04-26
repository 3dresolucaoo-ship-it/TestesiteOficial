'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function ShareButton() {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const url = window.location.href
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }).catch(() => fallback(url))
    } else {
      fallback(url)
    }
  }

  function fallback(url: string) {
    const el = document.createElement('textarea')
    el.value = url
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
      style={{
        background:  copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)',
        color:       copied ? '#10b981' : 'rgba(255,255,255,0.6)',
        border:      `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
      }}
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
      {copied ? 'Link copiado!' : 'Compartilhar'}
    </button>
  )
}
