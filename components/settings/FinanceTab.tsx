'use client'

import { SectionCard, FieldLabel, NumberInput } from './shared'
import { CategoryListEditor } from './CategoryListEditor'
import type { AdminConfig } from '@/lib/types'
import type { SettingsTabProps } from './types'

export function FinanceTab({ draft, setDraft }: SettingsTabProps) {
  function updateFinance(patch: Partial<AdminConfig['finance']>) {
    setDraft(d => ({ ...d, finance: { ...d.finance, ...patch } }))
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Categorias de Receita">
        <CategoryListEditor
          items={draft.finance.incomeCategories}
          onChange={v => updateFinance({ incomeCategories: v })}
          keyPrefix="income"
        />
      </SectionCard>
      <SectionCard title="Categorias de Despesa">
        <CategoryListEditor
          items={draft.finance.expenseCategories}
          onChange={v => updateFinance({ expenseCategories: v })}
          keyPrefix="expense"
        />
      </SectionCard>
      <SectionCard title="Metas e Alertas">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Meta de margem de lucro (%)</FieldLabel>
            <NumberInput
              value={draft.finance.profitMarginTarget}
              onChange={v => updateFinance({ profitMarginTarget: v })}
              min={0} max={100}
            />
            <p className="text-[#3a3a3a] text-xs mt-1">Projetos abaixo desta margem recebem alerta no dashboard</p>
          </div>
          <div>
            <FieldLabel>Moeda padrão</FieldLabel>
            <select
              value={draft.finance.defaultCurrency}
              onChange={e => updateFinance({ defaultCurrency: e.target.value as 'BRL' | 'USD' | 'EUR' })}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#ebebeb] text-sm outline-none focus:border-[#7c3aed] transition-colors"
            >
              <option value="BRL">BRL — Real Brasileiro</option>
              <option value="USD">USD — Dólar Americano</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
