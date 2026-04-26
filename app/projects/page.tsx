import { getUser } from '@/lib/auth'
import { createServerClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import { ProjectsView } from '@/components/ProjectsView'
import type { Project } from '@/lib/types'

export default async function ProjectsPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at')

  const projects: Project[] = (data ?? []).map((r) => ({
    id:          r.id,
    name:        r.name,
    status:      r.status,
    description: r.description ?? '',
    type:        r.type     ?? undefined,
    modules:     r.modules  ?? [],
    color:       r.color    ?? undefined,
  }))

  return <ProjectsView initialProjects={projects} />
}
