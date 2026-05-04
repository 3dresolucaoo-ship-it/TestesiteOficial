'use client'

import { SectionCard, FieldLabel, TextInput, NumberInput } from './shared'
import { CategoryListEditor } from './CategoryListEditor'
import type { AdminConfig } from '@/lib/types'
import type { SettingsTabProps } from './types'

export function InventoryTab({ draft, setDraft }: SettingsTabProps) {
  function updateInventory(patch: Partial<AdminConfig['inventory']>) {
    setDraft(d => ({ ...d, inventory: { ...d.inventory, ...patch } }))
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Categorias de Estoque">
        <CategoryListEditor
          items={draft.inventory.categories}
          onChange={v => updateInventory({ categories: v })}
          keyPrefix="cat"
        />
      </SectionCard>
      <SectionCard title="Padrões">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <FieldLabel>Unidade padrão</FieldLabel>
            <TextInput
              value={draft.inventory.defaultUnit}
              onChange={v => updateInventory({ defaultUnit: v })}
              placeholder="un"
            />
          </div>
          <div>
            <FieldLabel>Estoque mínimo padrão</FieldLabel>
            <NumberInput
              value={draft.inventory.defaultLowStockThreshold}
              onChange={v => updateInventory({ defaultLowStockThreshold: v })}
              min={0}
            />
          </div>
          <div>
            <FieldLabel>Markup padrão (%)</FieldLabel>
            <NumberInput
              value={draft.inventory.markupDefault}
              onChange={v => updateInventory({ markupDefault: v })}
              min={0}
            />
            <p className="text-[#3a3a3a] text-xs mt-1">Aplicado ao sugerir preço de venda</p>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
