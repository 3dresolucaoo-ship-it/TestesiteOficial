import { supabase } from '@/lib/supabaseClient'
import { serviceError, validateRequired } from '@/lib/serviceError'
import { requireUserId } from '@/lib/getUser'
import type { Decision } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDB(r: any): Decision {
  return {
    id:        r.id,
    projectId: r.project_id,
    decision:  r.decision,
    impact:    r.impact ?? '',
    date:      r.date,
    status:    r.status,
  }
}

function toDB(d: Decision, userId: string) {
  return {
    id:         d.id,
    project_id: d.projectId,
    decision:   d.decision,
    impact:     d.impact,
    date:       d.date,
    status:     d.status,
    user_id:    userId,
  }
}

export const decisionsService = {
  async getAll(): Promise<Decision[]> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('decisions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (error) serviceError('decisionsService.getAll', error)
    return (data ?? []).map(fromDB)
  },

  async create(d: Decision): Promise<void> {
    validateRequired('decisionsService.create', {
      id: d.id, projectId: d.projectId, decision: d.decision,
    })
    const userId = await requireUserId()
    const { error } = await supabase.from('decisions').insert(toDB(d, userId))
    if (error) serviceError('decisionsService.create', error)
  },

  async update(d: Decision): Promise<void> {
    validateRequired('decisionsService.update', { id: d.id })
    const userId = await requireUserId()
    const { error } = await supabase
      .from('decisions')
      .update(toDB(d, userId))
      .eq('id', d.id)
      .eq('user_id', userId)
    if (error) serviceError('decisionsService.update', error)
  },

  async delete(id: string): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('decisions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) serviceError('decisionsService.delete', error)
  },
}
