'use client'

import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import type { CategoryEntry } from '@/core/admin/config'

export function CategoryListEditor({
  items,
  onChange,
  keyPrefix,
}: {
  items: CategoryEntry[]
  onChange: (items: CategoryEntry[]) => void
  keyPrefix: string
}) {
  const [newLabel, setNewLabel] = useState('')

  function add() {
    const label = newLabel.trim()
    if (!label) return
    const key = `${keyPrefix}_${label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`
    onChange([...items, { key, label }])
    setNewLabel('')
  }

  function remove(key: string) {
    onChange(items.filter(i => i.key !== key))
  }

  function updateLabel(key: string, label: string) {
    onChange(items.map(i => i.key === key ? { ...i, label } : i))
  }

  return (
    <div className="space-y-1.5">
      {items.map(item => (
        <div key={item.key} className="flex items-center gap-2">
          <input
            value={item.label}
            onChange={e => updateLabel(item.key, e.target.value)}
            className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-[#ebebeb] text-sm outline-none focus:border-[#7c3aed] transition-colors"
          />
          <span className="text-[#3a3a3a] text-xs font-mono shrink-0 hidden sm:block">{item.key}</span>
          <button
            onClick={() => remove(item.key)}
            className="p-1.5 text-[#3a3a3a] hover:text-[#ef4444] transition-colors shrink-0"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        <input
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Nova categoria..."
          className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] border-dashed rounded-lg px-3 py-1.5 text-[#888888] text-sm outline-none focus:border-[#7c3aed] transition-colors placeholder:text-[#3a3a3a]"
        />
        <button
          onClick={add}
          className="p-1.5 text-[#555555] hover:text-[#a78bfa] hover:bg-[#7c3aed1a] rounded-lg transition-colors shrink-0"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  )
}
