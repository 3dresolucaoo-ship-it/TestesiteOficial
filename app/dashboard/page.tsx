import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabaseServer'
import { DashboardView } from '@/components/DashboardView'
import { loadInitialState } from '@/lib/serverDataLoader'

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase      = await createServerClient()
  const initialState  = await loadInitialState(supabase, user.id)

  return <DashboardView initialState={initialState} />
}
