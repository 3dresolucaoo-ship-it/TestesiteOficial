import { supabase }        from '@/lib/supabaseClient'
import { serviceError, validateRequired } from '@/lib/serviceError'
import { requireUserId }   from '@/lib/getUser'
import type { Project }    from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDB(r: any): Project {
  return {
    id:          r.id,
    name:        r.name,
    status:      r.status,
    description: r.description ?? '',
    type:        r.type     ?? undefined,
    modules:     r.modules  ?? [],
    color:       r.color    ?? undefined,
  }
}

function toDB(p: Project, userId: string) {
  return {
    id:          p.id,
    name:        p.name,
    status:      p.status,
    description: p.description,
    type:        p.type    ?? null,
    modules:     p.modules ?? [],
    color:       p.color   ?? null,
    user_id:     userId,
  }
}

export const projectsService = {
  async getAll(): Promise<Project[]> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at')
    if (error) serviceError('projectsService.getAll', error)
    return (data ?? []).map(fromDB)
  },

  async create(p: Project): Promise<void> {
    validateRequired('projectsService.create', { id: p.id, name: p.name })
    const userId = await requireUserId()
    const { error } = await supabase.from('projects').insert(toDB(p, userId))
    if (error) serviceError('projectsService.create', error)
  },

  async update(p: Project): Promise<void> {
    validateRequired('projectsService.update', { id: p.id })
    const userId = await requireUserId()
    const { error } = await supabase
      .from('projects')
      .update(toDB(p, userId))
      .eq('id', p.id)
      .eq('user_id', userId)
    if (error) serviceError('projectsService.update', error)
  },

  async delete(id: string): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) serviceError('projectsService.delete', error)
  },
}
