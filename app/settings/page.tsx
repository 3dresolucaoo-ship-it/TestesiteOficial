import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabaseServer'
import { SettingsView } from '@/components/SettingsView'
import { loadInitialState } from '@/lib/serverDataLoader'

export default async function SettingsPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase                                           = await createServerClient()
  const { config, projects, orders, transactions }         = await loadInitialState(supabase, user.id)

  return (
    <SettingsView
      initialConfig={config}
      projectsCount={projects.length}
      ordersCount={orders.length}
      transactionsCount={transactions.length}
    />
  )
}
