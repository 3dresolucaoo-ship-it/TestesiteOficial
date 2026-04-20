import { supabase }        from '@/lib/supabaseClient'
import { serviceError, validateRequired } from '@/lib/serviceError'
import { requireUserId }   from '@/lib/getUser'
import type { Lead, Affiliate } from '@/lib/types'

// ─── Leads ────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function leadFromDB(r: any): Lead {
  return {
    id:            r.id,
    projectId:     r.project_id,
    name:          r.name,
    contact:       r.contact      ?? '',
    source:        r.source,
    status:        r.status,
    value:         Number(r.value ?? 0),
    notes:         r.notes        ?? '',
    date:          r.date,
    lastContactAt: r.last_contact_at ?? undefined,
    expectedValue: r.expected_value != null ? Number(r.expected_value) : undefined,
    assignedTo:    r.assigned_to   ?? undefined,
  }
}

function leadToDB(l: Lead, userId: string) {
  return {
    id:              l.id,
    project_id:      l.projectId,
    name:            l.name,
    contact:         l.contact,
    source:          l.source,
    status:          l.status,
    value:           l.value,
    notes:           l.notes,
    date:            l.date,
    last_contact_at: l.lastContactAt ?? null,
    expected_value:  l.expectedValue ?? null,
    assigned_to:     l.assignedTo    ?? null,
    user_id:         userId,
  }
}

export const leadsService = {
  async getAll(): Promise<Lead[]> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (error) serviceError('leadsService.getAll', error)
    return (data ?? []).map(leadFromDB)
  },

  async create(l: Lead): Promise<void> {
    validateRequired('leadsService.create', { id: l.id, projectId: l.projectId, name: l.name })
    const userId = await requireUserId()
    const { error } = await supabase.from('leads').insert(leadToDB(l, userId))
    if (error) serviceError('leadsService.create', error)
  },

  async update(l: Lead): Promise<void> {
    validateRequired('leadsService.update', { id: l.id })
    const userId = await requireUserId()
    const { error } = await supabase
      .from('leads')
      .update(leadToDB(l, userId))
      .eq('id', l.id)
      .eq('user_id', userId)
    if (error) serviceError('leadsService.update', error)
  },

  async delete(id: string): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) serviceError('leadsService.delete', error)
  },
}

// ─── Affiliates ───────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function affFromDB(r: any): Affiliate {
  return {
    id:         r.id,
    projectId:  r.project_id,
    name:       r.name,
    platform:   r.platform   ?? '',
    code:       r.code       ?? '',
    totalSales: Number(r.total_sales ?? 0),
    commission: Number(r.commission  ?? 15),
    status:     r.status,
    date:       r.date,
  }
}

function affToDB(a: Affiliate, userId: string) {
  return {
    id:          a.id,
    project_id:  a.projectId,
    name:        a.name,
    platform:    a.platform,
    code:        a.code,
    total_sales: a.totalSales,
    commission:  a.commission,
    status:      a.status,
    date:        a.date,
    user_id:     userId,
  }
}

export const affiliatesService = {
  async getAll(): Promise<Affiliate[]> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (error) serviceError('affiliatesService.getAll', error)
    return (data ?? []).map(affFromDB)
  },

  async create(a: Affiliate): Promise<void> {
    validateRequired('affiliatesService.create', { id: a.id, projectId: a.projectId, name: a.name })
    const userId = await requireUserId()
    const { error } = await supabase.from('affiliates').insert(affToDB(a, userId))
    if (error) serviceError('affiliatesService.create', error)
  },

  async update(a: Affiliate): Promise<void> {
    validateRequired('affiliatesService.update', { id: a.id })
    const userId = await requireUserId()
    const { error } = await supabase
      .from('affiliates')
      .update(affToDB(a, userId))
      .eq('id', a.id)
      .eq('user_id', userId)
    if (error) serviceError('affiliatesService.update', error)
  },

  async delete(id: string): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('affiliates')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) serviceError('affiliatesService.delete', error)
  },
}
