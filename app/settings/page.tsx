/**
 * app/settings/page.tsx — Modulo de Configuracoes V4.8
 *
 * Migrado para ModuleShell em 2026-05-20 (onda 3c.2).
 * Mantido como Server Component: busca dados via loadInitialState,
 * delega render ao SettingsShell (client) que aplica ModuleShell V4.
 *
 * Sem KPIs de negocio — hero exibe contagem de projetos/pedidos como
 * indicador de contexto. Sem botao primary (salvar fica dentro do SettingsView).
 * Tabs internas gerenciadas pelo SettingsView (Geral/Financas/CRM/etc).
 */

import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabaseServer'
import { loadInitialState } from '@/lib/serverDataLoader'
import { SettingsShell } from './_components/SettingsShell'

export default async function SettingsPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase  = await createServerClient()
  const { state } = await loadInitialState(supabase, user.id)

  return (
    <SettingsShell
      initialConfig={state.config}
      projectsCount={state.projects.length}
      ordersCount={state.orders.length}
      transactionsCount={state.transactions.length}
    />
  )
}
