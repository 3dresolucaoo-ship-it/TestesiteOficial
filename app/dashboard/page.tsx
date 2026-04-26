import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardView } from '@/components/DashboardView'

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  return <DashboardView />
}
