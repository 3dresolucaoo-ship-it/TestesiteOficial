import { supabase }        from '@/lib/supabaseClient'
import { serviceError, validateRequired } from '@/lib/serviceError'
import { requireUserId }   from '@/lib/getUser'
import type { ProductionItem } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDB(r: any): ProductionItem {
  return {
    id:             r.id,
    orderId:        r.order_id ?? '',
    projectId:      r.project_id ?? '',
    clientName:     r.client_name,
    item:           r.item,
    printer:        r.printer,
    status:         r.status,
    estimatedHours: Number(r.estimated_hours),
    priority:       Number(r.priority),
  }
}

function toDB(p: ProductionItem, userId: string) {
  return {
    id:              p.id,
    order_id:        p.orderId || null,
    project_id:      p.projectId || null,
    client_name:     p.clientName,
    item:            p.item,
    printer:         p.printer,
    status:          p.status,
    estimated_hours: p.estimatedHours,
    priority:        p.priority,
    user_id:         userId,
  }
}

export const productionService = {
  /**
   * Busca itens de produção do usuário, opcionalmente filtrados por projeto.
   * Multi-tenant: aplica `.eq('project_id', projectId)` quando fornecido.
   * Migration `20260518_production_project_id` adicionou a coluna em prod 2026-05-18.
   */
  async getAll(projectId?: string): Promise<ProductionItem[]> {
    const userId = await requireUserId()
    let query = supabase
      .from('production')
      .select('*')
      .eq('user_id', userId)
    if (projectId) {
      query = query.eq('project_id', projectId)
    }
    const { data, error } = await query.order('priority')
    if (error) serviceError('productionService.getAll', error)
    return (data ?? []).map(fromDB)
  },

  async create(p: ProductionItem): Promise<void> {
    validateRequired('productionService.create', {
      id: p.id, clientName: p.clientName, item: p.item, printer: p.printer,
    })
    const userId = await requireUserId()
    const { error } = await supabase.from('production').insert(toDB(p, userId))
    if (error) serviceError('productionService.create', error)
  },

  async update(p: ProductionItem): Promise<void> {
    validateRequired('productionService.update', { id: p.id })
    const userId = await requireUserId()
    const { error } = await supabase
      .from('production')
      .update(toDB(p, userId))
      .eq('id', p.id)
      .eq('user_id', userId)
    if (error) serviceError('productionService.update', error)
  },

  async delete(id: string): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('production')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) serviceError('productionService.delete', error)
  },
}
