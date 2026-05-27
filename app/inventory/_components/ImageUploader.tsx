'use client'

/**
 * ImageUploader — upload de foto pro storage inventory-images.
 *
 * Extraído de app/inventory/page.tsx em 2026-05-16 (Felipe + Diego + Sofia)
 * Mudanças:
 * - Roxo `#7c3aed/#a78bfa` (banido) → petrol-500/300 (Diego)
 * - Mensagens de erro reformuladas com tom maker BR (Sofia)
 */

import { useRef, useState } from 'react'
import { X as XIcon, Loader2, ImagePlus } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File) {
    if (!isSupabaseConfigured) {
      setError('Upload de foto temporariamente indisponível. Continue sem foto por enquanto.')
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Esse arquivo não é uma foto. Selecione uma imagem JPG, PNG ou WebP.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Essa foto é grande demais (máximo 5 MB). Tente comprimir ou usar outra.')
      return
    }
    setError('')
    setUploading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id ?? 'anon'
      const ext  = file.name.split('.').pop() ?? 'jpg'
      const path = `${userId}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('inventory-images')
        .upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage
        .from('inventory-images')
        .getPublicUrl(path)
      onChange(publicUrl)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(`Não deu pra enviar agora. Tenta de novo ou pula, você adiciona depois. (${msg})`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#2a2a2a] group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Foto" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <XIcon size={18} className="text-white" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#3a3a3a] hover:border-[hsl(173_58%_28%)] text-[#888888] hover:text-[hsl(173_30%_57%)] text-sm transition-colors w-full justify-center disabled:opacity-50"
        >
          {uploading
            ? <><Loader2 size={15} className="animate-spin" /> Enviando…</>
            : <><ImagePlus size={15} /> Escolher foto</>
          }
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      {error && <p className="text-[#ef4444] text-xs">{error}</p>}
    </div>
  )
}
