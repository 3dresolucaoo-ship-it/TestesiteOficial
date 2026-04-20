'use client'

import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
          <h2 className="text-[#ebebeb] font-semibold text-base">{title}</h2>
          <button onClick={onClose} className="text-[#888888] hover:text-[#ebebeb] transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

interface FormFieldProps {
  label: string
  children: ReactNode
}

export function FormField({ label, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[#888888] text-xs font-medium uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

const inputClass = "w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#ebebeb] text-sm placeholder-[#555555] focus:outline-none focus:border-[#7c3aed] transition-colors"

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={inputClass + ' cursor-pointer'} />
  )
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={inputClass + ' resize-none'} rows={3} />
}

export function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
    >
      {children}
    </button>
  )
}
