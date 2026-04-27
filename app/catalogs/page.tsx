import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabaseServer'
import { CatalogsView } from '@/components/CatalogsView'
import { loadInitialState } from '@/lib/serverDataLoader'

export default async function CatalogsPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase                              = await createServerClient()
  const { catalogs, products, projects }      = await loadInitialState(supabase, user.id)

  return (
    <CatalogsView
      initialCatalogs={catalogs}
      initialProducts={products}
      initialProjectId={projects[0]?.id ?? ''}
    />
  )
}
