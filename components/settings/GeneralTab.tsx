'use client'

import { useAuth } from '@/context/AuthContext'
import { SectionCard, FieldLabel, TextInput } from './shared'
import type { SettingsTabProps } from './types'

interface Props extends SettingsTabProps {
  projectsCount: number
  ordersCount: number
  transactionsCount: number
}

export function GeneralTab({ draft, setDraft, projectsCount, ordersCount, transactionsCount }: Props) {
  const { role } = useAuth()

  return (
    <div className="space-y-4">
      <SectionCard title="Informações do Sistema">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Nome da empresa</FieldLabel>
            <TextInput
              value={draft.companyName}
              onChange={v => setDraft(d => ({ ...d, companyName: v }))}
              placeholder="Minha Empresa"
            />
          </div>
          <div>
            <FieldLabel>Fuso Horário</FieldLabel>
            <select
              value={draft.timezone}
              onChange={e => setDraft(d => ({ ...d, timezone: e.target.value }))}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#ebebeb] text-sm outline-none focus:border-[#7c3aed] transition-colors"
            >
              <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
              <option value="America/Manaus">Manaus (UTC-4)</option>
              <option value="America/Belem">Belém (UTC-3)</option>
              <option value="America/Fortaleza">Fortaleza (UTC-3)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Aparência">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>URL do Logo (opcional)</FieldLabel>
            <TextInput
              value={draft.brand?.logoUrl ?? ''}
              onChange={v => setDraft(d => ({ ...d, brand: { ...d.brand, logoUrl: v } }))}
              placeholder="https://..."
            />
            <p className="text-[#3a3a3a] text-xs mt-1">Substitui o ícone no topo da barra lateral</p>
          </div>
          <div>
            <FieldLabel>Cor de Destaque</FieldLabel>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={draft.brand?.accentColor ?? '#3b82f6'}
                onChange={e => setDraft(d => ({ ...d, brand: { ...d.brand, accentColor: e.target.value } }))}
                className="w-10 h-9 rounded cursor-pointer border-0 bg-transparent"
              />
              <TextInput
                value={draft.brand?.accentColor ?? '#3b82f6'}
                onChange={v => setDraft(d => ({ ...d, brand: { ...d.brand, accentColor: v } }))}
                placeholder="#3b82f6"
              />
            </div>
            <p className="text-[#3a3a3a] text-xs mt-1">Aplicado a botões, links e destaques</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Módulos Ativos">
        <p className="text-[#555555] text-xs -mt-2">Desative módulos que você não usa — eles somem da barra lateral.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {([
            ['finance',    'Finanças'],
            ['orders',     'Vendas'],
            ['crm',        'CRM'],
            ['products',   'Produtos'],
            ['inventory',  'Estoque'],
            ['production', 'Produção'],
            ['content',    'Conteúdo'],
            ['decisions',  'Decisões'],
            ['metrics',    'Métricas'],
          ] as const).map(([key, label]) => {
            const enabled = draft.modules?.[key] ?? true
            return (
              <label key={key} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-[#1c1c1c] transition-colors">
                <div
                  onClick={() =>
                    setDraft(d => ({
                      ...d,
                      modules: { ...d.modules, [key]: !enabled },
                    }))
                  }
                  className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${
                    enabled ? 'bg-[#7c3aed]' : 'bg-[#2a2a2a]'
                  }`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                    enabled ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </div>
                <span className="text-[#ebebeb] text-sm">{label}</span>
              </label>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard title="Sobre o BVaz Hub">
        <div className="space-y-2 text-[#555555] text-sm">
          <p>Sistema Operacional v0.3 — construído para gerenciar múltiplos projetos com finanças, estoque, CRM e conteúdo integrados.</p>
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              ['Projetos', projectsCount],
              ['Pedidos', ordersCount],
              ['Transações', transactionsCount],
            ].map(([label, value]) => (
              <div key={String(label)} className="bg-[#0f0f0f] rounded-lg p-3 text-center">
                <p className="text-[#ebebeb] font-bold text-lg">{value}</p>
                <p className="text-[#555555] text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
