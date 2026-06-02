'use server'

/**
 * app/inventory/actions.ts — Server Actions pro módulo de Estoque.
 *
 * Mesmo motivo de existir que orders/actions.ts e crm/actions.ts:
 * supabase.auth.getUser() do browser client trava 8-12s em Vercel Fluid
 * Compute cold-start (auth-js 2.106.0 _refreshAccessToken síncrono).
 * Resultado: inventoryService.create/update/delete via syncAction NUNCA
 * persistem em prod.
 *
 * Estratégia: WRITES de inventory + movements via Server Actions
 * cookie-based (createServerClient funciona ok — SSR layout prova).
 *
 * Cobertura nesta sessão:
 * - createInventoryItem / updateInventoryItem / deleteInventoryItem
 * - adjustStock (movement + setQuantity atômico, equivale ao ADJUST_STOCK
 *   do reducer cliente)
 *
 * NÃO cobertos aqui (débito conhecido — viviam em fluxos do processOrder):
 * - decreaseFromProduct / decreaseManual (chamados por core/flows/processOrder)
 *   continuam no path antigo. Quando processOrder virar Server Action
 *   (Bloco 5), ataca junto.
 *
 * Referência decisão: ADR 031.
 */

import { createServerClient }      from '@/lib/supabaseServer'
import { revalidatePath }          from 'next/cache'
import { z }                       from 'zod'
import type {
  InventoryItem, StockMovement, InventoryCategory, FilamentUso, MovementReason,
} from '@/lib/types'

// ─── Schemas Zod ──────────────────────────────────────────────────────────────

const INVENTORY_CATEGORIES: readonly InventoryCategory[] = ['filament', 'product', 'equipment', 'other'] as const
const FILAMENT_USOS:        readonly FilamentUso[]       = ['impressao', 'venda', 'ambos'] as const
const MOVEMENT_REASONS:     readonly MovementReason[]    = ['purchase', 'sale', 'printing', 'damage', 'adjustment'] as const

const CreateInventorySchema = z.object({
  id:          z.string().min(1),
  projectId:   z.string().min(1),
  category:    z.enum(['filament', 'product', 'equipment', 'other']),
  name:        z.string().min(1, 'Nome obrigatorio'),
  sku:         z.string().default(''),
  quantity:    z.number().min(0),
  unit:        z.string().default('un'),
  costPrice:   z.number().min(0).default(0),
  salePrice:   z.number().min(0).default(0),
  notes:       z.string().default(''),
  minStock:    z.number().optional(),
  imageUrl:    z.string().optional(),
  filamentUso: z.enum(['impressao', 'venda', 'ambos']).optional(),
})

const UpdateInventorySchema = CreateInventorySchema

const DeleteInventorySchema = z.object({
  id:        z.string().min(1),
  projectId: z.string().min(1),
})

const AdjustStockSchema = z.object({
  movement: z.object({
    id:        z.string().min(1),
    projectId: z.string().min(1),
    itemId:    z.string().min(1),
    type:      z.enum(['in', 'out']),
    quantity:  z.number().min(0),
    reason:    z.enum(['purchase', 'sale', 'printing', 'damage', 'adjustment']),
    orderId:   z.string().optional(),
    date:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data YYYY-MM-DD'),
    notes:     z.string().default(''),
  }),
  itemId:    z.string().min(1),
  delta:     z.number(),  // negativo desconta, positivo acrescenta
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

function itemToDB(i: z.output<typeof CreateInventorySchema>, userId: string) {
  return {
    id:           i.id,
    project_id:   i.projectId,
    category:     i.category,
    name:         i.name,
    sku:          i.sku,
    quantity:     i.quantity,
    unit:         i.unit,
    cost_price:   i.costPrice,
    sale_price:   i.salePrice,
    notes:        i.notes,
    min_stock:    i.minStock ?? null,
    image_url:    i.imageUrl ?? null,
    filament_uso: i.filamentUso ?? null,
    user_id:      userId,
  }
}

function buildItemReturn(i: z.output<typeof CreateInventorySchema>): InventoryItem {
  return {
    id:          i.id,
    projectId:   i.projectId,
    category:    i.category,
    name:        i.name,
    sku:         i.sku,
    quantity:    i.quantity,
    unit:        i.unit,
    costPrice:   i.costPrice,
    salePrice:   i.salePrice,
    notes:       i.notes,
    minStock:    i.minStock,
    imageUrl:    i.imageUrl,
    filamentUso: i.filamentUso,
  }
}

// ─── Server Action: criar item de inventário ──────────────────────────────────

export async function createInventoryItem(
  rawInput: z.input<typeof CreateInventorySchema>,
): Promise<
  | { success: true; item: InventoryItem }
  | { success: false; error: string }
> {
  const parsed = CreateInventorySchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') }
  }

  let supabase, userId
  try {
    ({ supabase, userId } = await getAuthenticatedClient())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { error } = await supabase.from('inventory').insert(itemToDB(parsed.data, userId))
  if (error) {
    return { success: false, error: `Erro Supabase: ${error.message}` }
  }

  revalidatePath('/inventory')
  revalidatePath('/dashboard')

  return { success: true, item: buildItemReturn(parsed.data) }
}

// ─── Server Action: atualizar item ────────────────────────────────────────────

export async function updateInventoryItem(
  rawInput: z.input<typeof UpdateInventorySchema>,
): Promise<
  | { success: true; item: InventoryItem }
  | { success: false; error: string }
> {
  const parsed = UpdateInventorySchema.safeParse(rawInput)
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
    .from('inventory')
    .update(itemToDB(parsed.data, userId))
    .eq('id', parsed.data.id)
    .eq('user_id', userId)
    .eq('project_id', parsed.data.projectId)

  if (error) {
    return { success: false, error: `Erro ao atualizar item: ${error.message}` }
  }

  revalidatePath('/inventory')
  revalidatePath('/dashboard')

  return { success: true, item: buildItemReturn(parsed.data) }
}

// ─── Server Action: deletar item ──────────────────────────────────────────────

export async function deleteInventoryItem(
  rawInput: z.input<typeof DeleteInventorySchema>,
): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  const parsed = DeleteInventorySchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') }
  }

  let supabase, userId
  try {
    ({ supabase, userId } = await getAuthenticatedClient())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { id, projectId } = parsed.data
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .eq('project_id', projectId)

  if (error) {
    return { success: false, error: `Erro ao deletar item: ${error.message}` }
  }

  revalidatePath('/inventory')
  revalidatePath('/dashboard')

  return { success: true }
}

// ─── Server Action: ajustar estoque (movement + quantity em sequência) ────────

export async function adjustStock(
  rawInput: z.input<typeof AdjustStockSchema>,
): Promise<
  | { success: true; movement: StockMovement; newQuantity: number }
  | { success: false; error: string }
> {
  const parsed = AdjustStockSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') }
  }

  let supabase, userId
  try {
    ({ supabase, userId } = await getAuthenticatedClient())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { movement, itemId, delta } = parsed.data

  // 1. Cria movimento (insert)
  const { error: mvError } = await supabase
    .from('movements')
    .insert({
      id:         movement.id,
      project_id: movement.projectId,
      item_id:    movement.itemId,
      type:       movement.type,
      quantity:   movement.quantity,
      reason:     movement.reason,
      order_id:   movement.orderId ?? null,
      date:       movement.date,
      notes:      movement.notes,
      user_id:    userId,
    })
  if (mvError) {
    return { success: false, error: `Erro ao registrar movimento: ${mvError.message}` }
  }

  // 2. Lê quantidade atual + aplica delta + salva
  const { data: row, error: fetchError } = await supabase
    .from('inventory')
    .select('quantity')
    .eq('id', itemId)
    .eq('user_id', userId)
    .eq('project_id', movement.projectId)
    .maybeSingle()
  if (fetchError) {
    return { success: false, error: `Erro ao ler estoque: ${fetchError.message}` }
  }
  if (!row) {
    return { success: false, error: 'Item de estoque nao encontrado' }
  }

  const newQuantity = Math.max(0, Number(row.quantity ?? 0) + delta)

  const { error: updateError } = await supabase
    .from('inventory')
    .update({ quantity: newQuantity })
    .eq('id', itemId)
    .eq('user_id', userId)
    .eq('project_id', movement.projectId)
  if (updateError) {
    return { success: false, error: `Erro ao ajustar estoque: ${updateError.message}` }
  }

  revalidatePath('/inventory')
  revalidatePath('/dashboard')

  const movementReturn: StockMovement = {
    id:        movement.id,
    projectId: movement.projectId,
    itemId:    movement.itemId,
    type:      movement.type,
    quantity:  movement.quantity,
    reason:    movement.reason,
    orderId:   movement.orderId,
    date:      movement.date,
    notes:     movement.notes,
  }

  return { success: true, movement: movementReturn, newQuantity }
}
