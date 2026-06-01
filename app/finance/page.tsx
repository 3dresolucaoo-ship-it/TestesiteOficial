/**
 * app/finance/page.tsx — Rota /finance
 *
 * SSR guard (auth) + carrega estado inicial via loadInitialState.
 * Delega render pro FinanceView (Client Component com ModuleShell V4).
 *
 * globals-v4.css importado aqui (pattern consistente com /orders e /crm).
 */

import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabaseServer'
import { FinanceView } from '@/components/FinanceView'
import { loadInitialState } from '@/lib/serverDataLoader'

import '../globals-v4.css'

export default async function FinancePage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase    = await createServerClient()
  const { state }   = await loadInitialState(supabase, user.id)

  return <FinanceView initialTransactions={state.transactions} initialProjects={state.projects} />
}
