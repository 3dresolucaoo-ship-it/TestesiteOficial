'use client'

import { Trash2 } from 'lucide-react'
import { SectionCard, FieldLabel, NumberInput } from './shared'
import { CategoryListEditor } from './CategoryListEditor'
import type { AdminConfig } from '@/lib/types'
import type { SettingsTabProps } from './types'

export function CrmTab({ draft, setDraft }: SettingsTabProps) {
  function updateCRM(patch: Partial<AdminConfig['crm']>) {
    setDraft(d => ({ ...d, crm: { ...d.crm, ...patch } }))
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Estágios do Pipeline de Leads">
        <div className="space-y-1.5">
          {draft.crm.leadStages.map((stage, idx) => (
            <div key={stage.key} className="flex items-center gap-2">
              <input
                type="color"
                value={stage.color}
                onChange={e => {
                  const stages = [...draft.crm.leadStages]
                  stages[idx] = { ...stage, color: e.target.value }
                  updateCRM({ leadStages: stages })
                }}
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                title="Cor do estágio"
              />
              <input
                value={stage.label}
                onChange={e => {
                  const stages = [...draft.crm.leadStages]
                  stages[idx] = { ...stage, label: e.target.value }
                  updateCRM({ leadStages: stages })
                }}
                className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-[#ebebeb] text-sm outline-none focus:border-[#7c3aed] transition-colors"
              />
              <span className="text-[#3a3a3a] text-xs font-mono shrink-0 hidden sm:block">{stage.key}</span>
              {draft.crm.leadStages.length > 2 && (
                <button
                  onClick={() => updateCRM({ leadStages: draft.crm.leadStages.filter((_, i) => i !== idx) })}
                  className="p-1.5 text-[#3a3a3a] hover:text-[#ef4444] transition-colors shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Origens de Contato">
        <CategoryListEditor
          items={draft.crm.contactSources}
          onChange={v => updateCRM({ contactSources: v })}
          keyPrefix="source"
        />
      </SectionCard>
      <SectionCard title="Afiliados">
        <div>
          <FieldLabel>Comissão padrão (%)</FieldLabel>
          <div className="max-w-[160px]">
            <NumberInput
              value={draft.crm.defaultCommissionRate}
              onChange={v => updateCRM({ defaultCommissionRate: v })}
              min={0} max={100}
            />
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
