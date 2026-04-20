import { supabase }        from '@/lib/supabaseClient'
import { serviceError, validateRequired } from '@/lib/serviceError'
import { requireUserId }   from '@/lib/getUser'
import type { ContentItem } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDB(r: any): ContentItem {
  return {
    id:             r.id,
    projectId:      r.project_id,
    idea:           r.idea,
    status:         r.status,
    platform:       r.platform,
    views:          Number(r.views          ?? 0),
    leads:          Number(r.leads          ?? 0),
    salesGenerated: Number(r.sales_generated ?? 0),
    link:           r.link ?? '',
    date:           r.date,
    likes:          r.likes    != null ? Number(r.likes)    : undefined,
    comments:       r.comments != null ? Number(r.comments) : undefined,
    shares:         r.shares   != null ? Number(r.shares)   : undefined,
    saves:          r.saves    != null ? Number(r.saves)    : undefined,
  }
}

function toDB(c: ContentItem, userId: string) {
  return {
    id:              c.id,
    project_id:      c.projectId,
    idea:            c.idea,
    status:          c.status,
    platform:        c.platform,
    views:           c.views,
    leads:           c.leads,
    sales_generated: c.salesGenerated,
    link:            c.link,
    date:            c.date,
    likes:           c.likes    ?? 0,
    comments:        c.comments ?? 0,
    shares:          c.shares   ?? 0,
    saves:           c.saves    ?? 0,
    user_id:         userId,
  }
}

export const contentService = {
  async getAll(): Promise<ContentItem[]> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (error) serviceError('contentService.getAll', error)
    return (data ?? []).map(fromDB)
  },

  async create(c: ContentItem): Promise<void> {
    validateRequired('contentService.create', {
      id: c.id, projectId: c.projectId, idea: c.idea,
    })
    const userId = await requireUserId()
    const { error } = await supabase.from('content').insert(toDB(c, userId))
    if (error) serviceError('contentService.create', error)
  },

  async update(c: ContentItem): Promise<void> {
    validateRequired('contentService.update', { id: c.id })
    const userId = await requireUserId()
    const { error } = await supabase
      .from('content')
      .update(toDB(c, userId))
      .eq('id', c.id)
      .eq('user_id', userId)
    if (error) serviceError('contentService.update', error)
  },

  async delete(id: string): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) serviceError('contentService.delete', error)
  },

  async getPostedWithLinks(): Promise<Array<{ id: string; link: string }>> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('content')
      .select('id, link')
      .eq('user_id', userId)
      .eq('status', 'posted')
      .not('link', 'is', null)
      .neq('link', '')
    if (error) serviceError('contentService.getPostedWithLinks', error)
    return (data ?? []) as Array<{ id: string; link: string }>
  },

  async updateMetrics(
    id: string,
    metrics: { views: number; likes: number; comments: number; shares: number; saves: number },
  ): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('content')
      .update(metrics)
      .eq('id', id)
      .eq('user_id', userId)
    if (error) serviceError('contentService.updateMetrics', error)
  },
}
