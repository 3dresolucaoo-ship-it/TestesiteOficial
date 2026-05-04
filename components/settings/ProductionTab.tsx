'use client'

import { SectionCard, FieldLabel, NumberInput } from './shared'
import { CategoryListEditor } from './CategoryListEditor'
import type { AdminConfig } from '@/lib/types'
import type { SettingsTabProps } from './types'

export function ProductionTab({ draft, setDraft }: SettingsTabProps) {
  function updateProduction(patch: Partial<AdminConfig['production']>) {
    setDraft(d => ({ ...d, production: { ...d.production, ...patch } }))
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Tipos de Impressora">
        <p className="text-[#555555] text-xs -mt-2">Modelos de impressoras que você usa. Aparece no cadastro de tarefas de produção.</p>
        <CategoryListEditor
          items={draft.production.printerTypes}
          onChange={v => updateProduction({ printerTypes: v })}
          keyPrefix="printer"
        />
      </SectionCard>

      <SectionCard title="Tipos de Filamento">
        <p className="text-[#555555] text-xs -mt-2">Materiais disponíveis no seu estoque. Usado para calcular custos automaticamente.</p>
        <CategoryListEditor
          items={draft.production.filamentTypes}
          onChange={v => updateProduction({ filamentTypes: v })}
          keyPrefix="filament"
        />
      </SectionCard>

      <SectionCard title="Alertas de Estoque">
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => updateProduction({ lowStockAlertEnabled: !draft.production.lowStockAlertEnabled })}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                draft.production.lowStockAlertEnabled ? 'bg-[#7c3aed]' : 'bg-[#2a2a2a]'
              }`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                draft.production.lowStockAlertEnabled ? 'translate-x-4' : 'translate-x-0.5'
              }`} />
            </div>
            <div>
              <p className="text-[#ebebeb] text-sm">Alertar quando filamento estiver baixo</p>
              <p className="text-[#555555] text-xs">Exibe aviso no dashboard quando o estoque de filamento ficar abaixo do limite</p>
            </div>
          </label>
          {draft.production.lowStockAlertEnabled && (
            <div className="max-w-[200px]">
              <FieldLabel>Limite mínimo (gramas)</FieldLabel>
              <NumberInput
                value={draft.production.lowStockGrams}
                onChange={v => updateProduction({ lowStockGrams: v })}
                min={0}
              />
              <p className="text-[#3a3a3a] text-xs mt-1">Alerta aparece abaixo desta quantidade</p>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
