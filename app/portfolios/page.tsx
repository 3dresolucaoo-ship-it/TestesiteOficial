import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabaseServer'
import { PortfoliosView } from '@/components/PortfoliosView'
import type { Portfolio } from '@/lib/types'

export default async function PortfoliosPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerClient()
  const { data } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const portfolios: Portfolio[] = (data ?? []).map(r => ({
    id:          r.id,
    userId:      r.user_id,
    name:        r.name,
    slug:        r.slug,
    bio:         r.bio         ?? undefined,
    avatarUrl:   r.avatar_url  ?? undefined,
    whatsapp:    r.whatsapp    ?? undefined,
    catalogSlug: r.catalog_slug ?? undefined,
    isPublic:    r.is_public,
    createdAt:   r.created_at,
  }))

  return <PortfoliosView initialPortfolios={portfolios} />
}
