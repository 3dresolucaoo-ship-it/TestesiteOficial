import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabaseServer'
import { FinanceView } from '@/components/FinanceView'
import { loadInitialState } from '@/lib/serverDataLoader'

export default async function FinancePage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase                         = await createServerClient()
  const { transactions, projects }       = await loadInitialState(supabase, user.id)

  return <FinanceView initialTransactions={transactions} initialProjects={projects} />
}
