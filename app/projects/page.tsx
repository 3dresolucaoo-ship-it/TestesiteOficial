import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabaseServer'
import { ProjectsView } from '@/components/ProjectsView'
import { loadInitialState } from '@/lib/serverDataLoader'

export default async function ProjectsPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase                     = await createServerClient()
  const { projects, transactions, orders } = await loadInitialState(supabase, user.id)

  return (
    <ProjectsView
      initialProjects={projects}
      initialTransactions={transactions}
      initialOrders={orders}
    />
  )
}
