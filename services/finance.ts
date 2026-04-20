import { supabase }        from '@/lib/supabaseClient'
import { serviceError, validateRequired } from '@/lib/serviceError'
import { requireUserId }   from '@/lib/getUser'
import type { Transaction } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDB(r: any): Transaction {
  return {
    id:          r.id,
    projectId:   r.project_id,
    type:        r.type,
    category:    r.category,
    description: r.description ?? '',
    value:       Number(r.value),
    date:        r.date,
    source:      r.source ?? '',
  }
}

function toDB(t: Transaction, userId: string) {
  return {
    id:          t.id,
    project_id:  t.projectId,
    type:        t.type,
    category:    t.category,
    description: t.description,
    value:       t.value,
    date:        t.date,
    source:      t.source,
    user_id:     userId,
  }
}

export const transactionsService = {
  async getAll(): Promise<Transaction[]> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (error) serviceError('transactionsService.getAll', error)
    return (data ?? []).map(fromDB)
  },

  async create(t: Transaction): Promise<void> {
    validateRequired('transactionsService.create', {
      id: t.id, projectId: t.projectId, type: t.type, value: t.value,
    })
    const userId = await requireUserId()
    const { error } = await supabase.from('transactions').insert(toDB(t, userId))
    if (error) serviceError('transactionsService.create', error)
  },

  async update(t: Transaction): Promise<void> {
    validateRequired('transactionsService.update', { id: t.id })
    const userId = await requireUserId()
    const { error } = await supabase
      .from('transactions')
      .update(toDB(t, userId))
      .eq('id', t.id)
      .eq('user_id', userId)
    if (error) serviceError('transactionsService.update', error)
  },

  async delete(id: string): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) serviceError('transactionsService.delete', error)
  },
}
