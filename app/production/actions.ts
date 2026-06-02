'use server'

/**
 * app/production/actions.ts — Server Actions pro módulo de Produção.
 *
 * Mesmo motivo dos outros actions (ADR 031). Cobertura:
 * - createProductionTask / updateProductionTask / deleteProductionTask
 *
 * Side effects de changeStatus (descontar estoque + criar transação receita
 * ao iniciar impressão) são compostos no client chamando adjustStock
 * (app/inventory/actions.ts) + createTransaction (app/finance/actions.ts)
 * em sequência. Não há ATOMICIDADE entre eles — se um falhar, o outro pode
 * já ter persistido. Trade-off conhecido pré soft-launch (mesma situação
 * do ADD_ORDER side effects que vivem em core/flows/processOrder.ts).
 * Refactor pra Server Action única ou Edge Function = Bloco 5.
 *
 * Nota schema: production NÃO tem project_id no DB (ver coment store.tsx:302).
 * Por isso delete/update filtram apenas por user_id, sem .eq('project_id').
 */

import { createServerClient }      from '@/lib/supabaseServer'
import { revalidatePath }          from 'next/cache'
import { z }                       from 'zod'
import type { ProductionItem, ProductionStatus, PrinterName } from '@/lib/types'

// ─── Schemas Zod ──────────────────────────────────────────────────────────────

const PRODUCTION_STATUSES: readonly ProductionStatus[] = ['waiting', 'printing', 'done'] as const
const PRINTERS:            readonly PrinterName[]      = ['bambu', 'flashforge'] as const

const CreateProductionSchema = z.object({
  id:             z.string().min(1),
  orderId:        z.string().default(''),
  projectId:      z.string().default(''),
  clientName:     z.string().min(1, 'Nome do cliente obrigatorio'),
  item:           z.string().min(1, 'Item obrigatorio'),
  printer:        z.enum(['bambu', 'flashforge']),
  status:         z.enum(['waiting', 'printing', 'done']),
  estimatedHours: z.number().min(0),
  priority:       z.number().min(0),
})

const UpdateProductionSchema = CreateProductionSchema

const DeleteProductionSchema = z.object({
  id: z.string().min(1),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthenticatedClient() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Nao autenticado')
  }
  return { supabase, userId: user.id }
}

function taskToDB(p: z.output<typeof CreateProductionSchema>, userId: string) {
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

function buildTaskReturn(p: z.output<typeof CreateProductionSchema>): ProductionItem {
  return {
    id:             p.id,
    orderId:        p.orderId,
    projectId:      p.projectId,
    clientName:     p.clientName,
    item:           p.item,
    printer:        p.printer as PrinterName,
    status:         p.status as ProductionStatus,
    estimatedHours: p.estimatedHours,
    priority:       p.priority,
  }
}

// ─── Server Action: criar task ────────────────────────────────────────────────

export async function createProductionTask(
  rawInput: z.input<typeof CreateProductionSchema>,
): Promise<
  | { success: true; task: ProductionItem }
  | { success: false; error: string }
> {
  const parsed = CreateProductionSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') }
  }

  let supabase, userId
  try {
    ({ supabase, userId } = await getAuthenticatedClient())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { error } = await supabase.from('production').insert(taskToDB(parsed.data, userId))
  if (error) {
    return { success: false, error: `Erro Supabase: ${error.message}` }
  }

  revalidatePath('/production')
  revalidatePath('/dashboard')

  return { success: true, task: buildTaskReturn(parsed.data) }
}

// ─── Server Action: atualizar task ────────────────────────────────────────────

export async function updateProductionTask(
  rawInput: z.input<typeof UpdateProductionSchema>,
): Promise<
  | { success: true; task: ProductionItem }
  | { success: false; error: string }
> {
  const parsed = UpdateProductionSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') }
  }

  let supabase, userId
  try {
    ({ supabase, userId } = await getAuthenticatedClient())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { error } = await supabase
    .from('production')
    .update(taskToDB(parsed.data, userId))
    .eq('id', parsed.data.id)
    .eq('user_id', userId)

  if (error) {
    return { success: false, error: `Erro ao atualizar task: ${error.message}` }
  }

  revalidatePath('/production')
  revalidatePath('/dashboard')

  return { success: true, task: buildTaskReturn(parsed.data) }
}

// ─── Server Action: deletar task ──────────────────────────────────────────────

export async function deleteProductionTask(
  rawInput: z.input<typeof DeleteProductionSchema>,
): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  const parsed = DeleteProductionSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') }
  }

  let supabase, userId
  try {
    ({ supabase, userId } = await getAuthenticatedClient())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { error } = await supabase
    .from('production')
    .delete()
    .eq('id', parsed.data.id)
    .eq('user_id', userId)

  if (error) {
    return { success: false, error: `Erro ao deletar task: ${error.message}` }
  }

  revalidatePath('/production')
  revalidatePath('/dashboard')

  return { success: true }
}
