import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabaseServer'
import { CatalogsView } from '@/components/CatalogsView'
import { loadInitialState } from '@/lib/serverDataLoader'
import { loadCatalogsForUser, loadProductsForUser } from '@/lib/serverDataLoaderLazy'

export default async function CatalogsPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  // catalogs e products NÃO estão no SSR core (loadInitialState) — puxados
  // sob demanda via lazy loaders. Mantém o boot pages internas leve enquanto
  // a page de catálogos recebe dados reais.
  const supabase  = await createServerClient()
  const { state } = await loadInitialState(supabase, user.id)
  const [catalogs, products] = await Promise.all([
    loadCatalogsForUser(user.id),
    loadProductsForUser(user.id),
  ])

  return (
    <CatalogsView
      initialCatalogs={catalogs}
      initialProducts={products}
      initialProjectId={state.projects[0]?.id ?? ''}
    />
  )
}
