import { supabase } from '@/lib/supabaseClient'
import { serviceError, validateRequired } from '@/lib/serviceError'
import { requireUserId } from '@/lib/getUser'
import type { FixedCost, ProfitGoal } from '@/core/finance/financeConfigTypes'

// ─── Fixed Costs converters ──────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fixedCostFromDB(r: any): FixedCost {
  return {
    id:        r.id,
    projectId: r.project_id,
    label:     r.label,
    amount:    Number(r.amount),
    createdAt: r.created_at,
  }
}

function fixedCostToDB(c: FixedCost, userId: string) {
  return {
    id:         c.id,
    user_id:    userId,
    project_id: c.projectId,
    label:      c.label,
    amount:     c.amount,
  }
}

// ─── Profit Goal converters ──────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function profitGoalFromDB(r: any): ProfitGoal {
  return {
    projectId:     r.project_id,
    monthlyTarget: Number(r.monthly_target),
    updatedAt:     r.updated_at,
  }
}

// ─── Services ────────────────────────────────────────────────────────────────
export const fixedCostsService = {
  async listByProject(projectId: string): Promise<FixedCost[]> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('fixed_costs')
      .select('*')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
    if (error) serviceError('fixedCostsService.listByProject', error)
    return (data ?? []).map(fixedCostFromDB)
  },

  async create(c: FixedCost): Promise<void> {
    validateRequired('fixedCostsService.create', {
      id: c.id, projectId: c.projectId, label: c.label,
    })
    const userId = await requireUserId()
    const { error } = await supabase.from('fixed_costs').insert(fixedCostToDB(c, userId))
    if (error) serviceError('fixedCostsService.create', error)
  },

  async update(c: FixedCost): Promise<void> {
    validateRequired('fixedCostsService.update', { id: c.id })
    const userId = await requireUserId()
    const { error } = await supabase
      .from('fixed_costs')
      .update(fixedCostToDB(c, userId))
      .eq('id', c.id)
      .eq('user_id', userId)
    if (error) serviceError('fixedCostsService.update', error)
  },

  async delete(id: string): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('fixed_costs')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) serviceError('fixedCostsService.delete', error)
  },
}

export const profitGoalsService = {
  async getByProject(projectId: string): Promise<ProfitGoal | null> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('profit_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .maybeSingle()
    if (error) serviceError('profitGoalsService.getByProject', error)
    return data ? profitGoalFromDB(data) : null
  },

  async upsert(g: ProfitGoal): Promise<void> {
    validateRequired('profitGoalsService.upsert', { projectId: g.projectId })
    const userId = await requireUserId()
    const { error } = await supabase
      .from('profit_goals')
      .upsert({
        user_id:        userId,
        project_id:     g.projectId,
        monthly_target: g.monthlyTarget,
        updated_at:     new Date().toISOString(),
      }, { onConflict: 'user_id,project_id' })
    if (error) serviceError('profitGoalsService.upsert', error)
  },
}
