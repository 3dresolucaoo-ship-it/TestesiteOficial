'use client'

import { SectionCard } from './shared'
import type { AdminConfig } from '@/lib/types'
import type { SettingsTabProps } from './types'

export function ContentTab({ draft, setDraft }: SettingsTabProps) {
  function updateContent(patch: Partial<AdminConfig['content']>) {
    setDraft(d => ({ ...d, content: { ...d.content, ...patch } }))
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Plataformas">
        <div className="space-y-1.5">
          {draft.content.platforms.map((p, idx) => (
            <div key={p.key} className="flex items-center gap-2">
              <input
                value={p.label}
                onChange={e => {
                  const platforms = [...draft.content.platforms]
                  platforms[idx] = { ...p, label: e.target.value }
                  updateContent({ platforms })
                }}
                className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-[#ebebeb] text-sm outline-none focus:border-[#7c3aed] transition-colors"
              />
              <span className="text-[#3a3a3a] text-xs font-mono shrink-0 hidden sm:block">{p.key}</span>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Métricas de Engajamento">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => updateContent({ trackEngagement: !draft.content.trackEngagement })}
            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
              draft.content.trackEngagement ? 'bg-[#7c3aed]' : 'bg-[#2a2a2a]'
            }`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
              draft.content.trackEngagement ? 'translate-x-4' : 'translate-x-0.5'
            }`} />
          </div>
          <div>
            <p className="text-[#ebebeb] text-sm">Rastrear engajamento (curtidas, comentários, shares, salvos)</p>
            <p className="text-[#555555] text-xs">Campos extras aparecem no formulário de conteúdo postado</p>
          </div>
        </label>
      </SectionCard>
    </div>
  )
}
