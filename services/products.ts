import { supabase } from '@/lib/supabaseClient'
import { serviceError, validateRequired } from '@/lib/serviceError'
import { requireUserId } from '@/lib/getUser'
import type { Product } from '@/core/products/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDB(r: any): Product {
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
  }
}

function toDB(p: Product, userId: string) {
  return {
    id:                   p.id,
    project_id:           p.projectId,
    name:                 p.name,
    material_grams:       p.materialGrams,
    print_time_hours:     p.printTimeHours,
    failure_rate:         p.failureRate,
    energy_cost_per_hour: p.energyCostPerHour,
    support_cost:         p.supportCost       ?? 0,
    margin_percentage:    p.marginPercentage  ?? 0.30,
    sale_price:           p.salePrice,
    inventory_item_id:    p.inventoryItemId   ?? null,
    notes:                p.notes,
    image_url:            p.imageUrl          ?? null,
    user_id:              userId,
  }
}

export const productsService = {
  async getAll(): Promise<Product[]> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('name')
    if (error) serviceError('productsService.getAll', error)
    return (data ?? []).map(fromDB)
  },

  async getById(id: string): Promise<Product | null> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle()
    if (error) serviceError('productsService.getById', error)
    return data ? fromDB(data) : null
  },

  async create(p: Product): Promise<Product> {
    validateRequired('productsService.create', {
      projectId: p.projectId, name: p.name,
    })
    const userId = await requireUserId()
    const { id: _ignored, ...rowWithoutId } = toDB(p, userId)

    const { data, error } = await supabase
      .from('products')
      .insert(rowWithoutId)
      .select()
      .single()
    if (error) {
      serviceError('productsService.create', error)
    }
    return fromDB(data!)
  },

  async update(p: Product): Promise<void> {
    validateRequired('productsService.update', { id: p.id })
    const userId = await requireUserId()
    const { error } = await supabase
      .from('products')
      .update(toDB(p, userId))
      .eq('id', p.id)
      .eq('user_id', userId)
    if (error) serviceError('productsService.update', error)
  },

  async delete(id: string): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) serviceError('productsService.delete', error)
  },

  /**
   * Upload a product image to Supabase Storage and return the public URL.
   * Bucket: products-images (must be public and created in Supabase dashboard).
   */
  async uploadImage(productId: string, file: File): Promise<string> {
    const ext  = file.name.split('.').pop() ?? 'jpg'
    const path = `${productId}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('products-images')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (uploadErr) serviceError('productsService.uploadImage', uploadErr as never)

    const { data } = supabase.storage.from('products-images').getPublicUrl(path)
    return data.publicUrl
  },
}
