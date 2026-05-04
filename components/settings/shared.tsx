'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 space-y-4">
      <h3 className="text-[#ebebeb] font-medium text-sm">{title}</h3>
      {children}
    </div>
  )
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[#555555] text-xs font-medium uppercase tracking-wide mb-1.5">{children}</p>
}

export function TextInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#ebebeb] text-sm outline-none focus:border-[#7c3aed] transition-colors"
    />
  )
}

export function NumberInput({ value, onChange, min, max }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#ebebeb] text-sm outline-none focus:border-[#7c3aed] transition-colors"
    />
  )
}

export function SecretInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 pr-10 py-2 text-[#ebebeb] text-sm outline-none focus:border-[#7c3aed] transition-colors"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#888888] transition-colors"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  )
}
