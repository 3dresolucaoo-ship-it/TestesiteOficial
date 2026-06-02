'use server'

/**
 * app/products/actions.ts — Server Actions pro módulo de Produtos.
 *
 * Mesmo motivo dos outros actions (ADR 031). Cobertura:
 * - createProduct (gera UUID no DB e retorna produto completo)
 * - updateProduct / deleteProduct
 *
 * NÃO coberto aqui: uploadImage (productsService.uploadImage). Storage do
 * Supabase via browser client funciona OK (storage não passa pelo auth-js
 * refresh hook). Mantido como está.
 */

import { createServerClient }      from '@/lib/supabaseServer'
import { revalidatePath }          from 'next/cache'
import { z }                       from 'zod'
import type { Product, CheckoutMode, ProductVariantGroup } from '@/lib/types'

// ─── Schemas Zod ──────────────────────────────────────────────────────────────

const CHECKOUT_MODES: readonly CheckoutMode[] = ['direct', 'variant', 'quote', 'contact_only'] as const

const VariantGroupSchema = z.object({
  name:    z.string(),
  options: z.array(z.string()),
})

const ProductBaseSchema = z.object({
  projectId:         z.string().min(1),
  name:              z.string().min(1, 'Nome obrigatorio'),
  materialGrams:     z.number().min(0),
  printTimeHours:    z.number().min(0),
  failureRate:       z.number().min(0).max(1),
  energyCostPerHour: z.number().min(0),
  supportCost:       z.number().min(0).optional().default(0),
  marginPercentage:  z.number().min(0).max(5).optional().default(0.30),
  salePrice:         z.number().min(0),
  inventoryItemId:   z.string().optional(),
  notes:             z.string().default(''),
  imageUrl:          z.string().optional(),
  checkoutMode:      z.enum(['direct', 'variant', 'quote', 'contact_only']).default('direct'),
  variants:          z.array(VariantGroupSchema).optional(),
  allowsCustom:      z.boolean().optional().default(false),
})

const CreateProductSchema = ProductBaseSchema
const UpdateProductSchema = ProductBaseSchema.extend({
  id: z.string().min(1),
})

const DeleteProductSchema = z.object({
  id:        z.string().min(1),
  projectId: z.string().min(1),
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

function productToDB(p: z.output<typeof ProductBaseSchema>, userId: string, idForUpdate?: string) {
  return {
    ...(idForUpdate ? { id: idForUpdate } : {}),
    project_id:           p.projectId,
    name:                 p.name,
    material_grams:       p.materialGrams,
    print_time_hours:     p.printTimeHours,
    failure_rate:         p.failureRate,
    energy_cost_per_hour: p.energyCostPerHour,
    support_cost:         p.supportCost,
    margin_percentage:    p.marginPercentage,
    sale_price:           p.salePrice,
    inventory_item_id:    p.inventoryItemId ?? null,
    notes:                p.notes,
    image_url:            p.imageUrl ?? null,
    checkout_mode:        p.checkoutMode,
    variants:             p.variants && p.variants.length > 0 ? p.variants : null,
    allows_custom:        p.allowsCustom,
    user_id:              userId,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function productFromDB(r: any): Product {
  return {
    id:                r.id,
    projectId:         r.project_id,
    name:              r.name,
    materialGrams:     Number(r.material_grams      ?? 0),
    printTimeHours:    Number(r.print_time_hours     ?? 0),
    failureRate:       Number(r.failure_rate         ?? 0.10),
    energyCostPerHour: Number(r.energy_cost_per_hour ?? 0.50),
    supportCost:       Number(r.support_cost         ?? 0),
    marginPercentage:  Number(r.margin_percentage    ?? 0.30),
    salePrice:         Number(r.sale_price           ?? 0),
    inventoryItemId:   r.inventory_item_id ?? undefined,
    notes:             r.notes ?? '',
    imageUrl:          r.image_url ?? undefined,
    checkoutMode:      (r.checkout_mode ?? 'direct') as CheckoutMode,
    variants:          Array.isArray(r.variants) ? r.variants as ProductVariantGroup[] : undefined,
    allowsCustom:      Boolean(r.allows_custom ?? false),
  }
}

// ─── Server Action: criar produto (gera UUID no DB) ───────────────────────────

export async function createProduct(
  rawInput: z.input<typeof CreateProductSchema>,
): Promise<
  | { success: true; product: Product }
  | { success: false; error: string }
> {
  const parsed = CreateProductSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') }
  }

  let supabase, userId
  try {
    ({ supabase, userId } = await getAuthenticatedClient())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { data, error } = await supabase
    .from('products')
    .insert(productToDB(parsed.data, userId))
    .select()
    .single()

  if (error || !data) {
    return { success: false, error: `Erro Supabase: ${error?.message ?? 'sem dados'}` }
  }

  revalidatePath('/products')
  revalidatePath('/dashboard')

  return { success: true, product: productFromDB(data) }
}

// ─── Server Action: atualizar produto ─────────────────────────────────────────

export async function updateProduct(
  rawInput: z.input<typeof UpdateProductSchema>,
): Promise<
  | { success: true; product: Product }
  | { success: false; error: string }
> {
  const parsed = UpdateProductSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') }
  }

  let supabase, userId
  try {
    ({ supabase, userId } = await getAuthenticatedClient())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { id, ...rest } = parsed.data
  const { error } = await supabase
    .from('products')
    .update(productToDB(rest, userId))
    .eq('id', id)
    .eq('user_id', userId)
    .eq('project_id', rest.projectId)

  if (error) {
    return { success: false, error: `Erro ao atualizar produto: ${error.message}` }
  }

  revalidatePath('/products')
  revalidatePath('/dashboard')

  const product: Product = {
    id,
    projectId:         rest.projectId,
    name:              rest.name,
    materialGrams:     rest.materialGrams,
    printTimeHours:    rest.printTimeHours,
    failureRate:       rest.failureRate,
    energyCostPerHour: rest.energyCostPerHour,
    supportCost:       rest.supportCost,
    marginPercentage:  rest.marginPercentage,
    salePrice:         rest.salePrice,
    inventoryItemId:   rest.inventoryItemId,
    notes:             rest.notes,
    imageUrl:          rest.imageUrl,
    checkoutMode:      rest.checkoutMode as CheckoutMode,
    variants:          rest.variants,
    allowsCustom:      rest.allowsCustom,
  }
  return { success: true, product }
}

// ─── Server Action: deletar produto ───────────────────────────────────────────

export async function deleteProduct(
  rawInput: z.input<typeof DeleteProductSchema>,
): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  const parsed = DeleteProductSchema.safeParse(rawInput)
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
    .from('products')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .eq('project_id', projectId)

  if (error) {
    return { success: false, error: `Erro ao deletar produto: ${error.message}` }
  }

  revalidatePath('/products')
  revalidatePath('/dashboard')

  return { success: true }
}
