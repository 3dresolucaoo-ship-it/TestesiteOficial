'use client'

/**
 * SettingsShell — wrapper client que aplica ModuleShell V4 ao redor do SettingsView.
 *
 * Criado em 2026-05-20 (onda 3c.2) para manter app/settings/page.tsx como
 * Server Component enquanto envolve o conteudo com o shell editorial V4.
 *
 * Settings nao tem KPIs de negocios. O heroKpi exibe o nome do plano/tier
 * ativo como indicador de contexto. Sem botao primary (salvar fica dentro do
 * SettingsView). Sem tabs no ModuleShell — SettingsView gerencia seus proprios
 * tabs internamente.
 *
 * Convencoes: zero em-dash, PT-BR em UI, TypeScript estrito, zero any.
 */

import { useCallback } from 'react'
import type { AdminConfig } from '@/lib/types'
import { ModuleShell, V4ThemeProvider } from '@/components/dashboard/v4'
import { SettingsView } from '@/components/SettingsView'

// CSS V4 do ModuleShell
import '../../globals-v4.css'

interface SettingsShellProps {
  initialConfig:     AdminConfig
  projectsCount:     number
  ordersCount:       number
  transactionsCount: number
}

// Tab unico (settings nao usa FilterBar como navegacao — as tabs ficam
// dentro do SettingsView). Passamos 1 tab "dummy" para satisfazer a API
// do ModuleShell sem exibir nada de forma estranha.
const SETTINGS_TABS = [
  { id: 'config', label: 'Configuracoes', count: 0, active: true },
]

export function SettingsShell({
  initialConfig,
  projectsCount,
  ordersCount,
  transactionsCount,
}: SettingsShellProps) {
  // FilterBar nao e usada em settings, mas a API exige handlers
  const handleTabChange = useCallback((_id: string) => {}, [])
  const handleSearch    = useCallback((_q: string) => {}, [])

  const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase()

  return (
    <>
      <V4ThemeProvider />
      <ModuleShell
        eyebrow={`${mesAtual} · ${projectsCount} PROJETOS · ${ordersCount} PEDIDOS`}
        title="Configuracoes"
        livePhrase="Personalize modulos, categorias e integracoes do seu espaco."
        heroKpi={{
          label:       'PROJETOS ATIVOS',
          value:       String(projectsCount),
          description: `${ordersCount} pedidos · ${transactionsCount} transacoes registradas.`,
        }}
        satelliteKpis={[
          {
            label:       'PEDIDOS',
            value:       String(ordersCount),
            description: 'historico total.',
            tone:        'neutral',
          },
          {
            label:       'TRANSACOES',
            value:       String(transactionsCount),
            description: 'lancamentos financeiros.',
            tone:        'neutral',
          },
        ]}
        tabs={SETTINGS_TABS}
        onTabChange={handleTabChange}
        searchPlaceholder="Buscar configuracao..."
        onSearch={handleSearch}
      >
        {/* SettingsView gerencia seus proprios tabs internamente */}
        <SettingsView
          initialConfig={initialConfig}
          projectsCount={projectsCount}
          ordersCount={ordersCount}
          transactionsCount={transactionsCount}
        />
      </ModuleShell>
    </>
  )
}
