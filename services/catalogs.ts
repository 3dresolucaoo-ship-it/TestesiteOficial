import { supabase } from '@/lib/supabaseClient'
import { serviceError, validateRequired } from '@/lib/serviceError'
import { requireUserId } from '@/lib/getUser'
import type { Catalog } from '@/core/catalog/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDB(r: any): Catalog {
  return {
    id:            r.id,
    userId:        r.user_id,
    projectId:     r.project_id,
    name:          r.name,
    slug:          r.slug,
    mode:          r.mode,
    template:      r.template ?? 'grid',
    productIds:    r.product_ids ?? [],
    logoUrl:       r.logo_url ?? undefined,
    whatsapp:      r.whatsapp ?? undefined,
    portfolioSlug: r.portfolio_slug ?? undefined,
    isPublic:      r.is_public,
    createdAt:     r.created_at,
  }
}

function toDB(c: Catalog, userId: string) {
  return {
    id:             c.id,
    user_id:        userId,
    project_id:     c.projectId,
    name:           c.name,
    slug:           c.slug,
    mode:           c.mode,
    template:       c.template ?? 'grid',
    product_ids:    c.productIds,
    logo_url:       c.logoUrl ?? null,
    whatsapp:       c.whatsapp ?? null,
    portfolio_slug: c.portfolioSlug ?? null,
    is_public:      c.isPublic,
  }
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const catalogsService = {
  async listCatalogs(): Promise<Catalog[]> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('catalogs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) serviceError('catalogsService.listCatalogs', error)
    return (data ?? []).map(fromDB)
  },

  async createCatalog(c: Catalog): Promise<void> {
    validateRequired('catalogsService.createCatalog', {
      id: c.id, name: c.name, slug: c.slug, projectId: c.projectId,
    })
    const userId = await requireUserId()
    const { error } = await supabase.from('catalogs').insert(toDB(c, userId))
    if (error) serviceError('catalogsService.createCatalog', error)
  },

  async updateCatalog(c: Catalog): Promise<void> {
    validateRequired('catalogsService.updateCatalog', { id: c.id })
    const userId = await requireUserId()
    const { error } = await supabase
      .from('catalogs')
      .update(toDB(c, userId))
      .eq('id', c.id)
      .eq('user_id', userId)
    if (error) serviceError('catalogsService.updateCatalog', error)
  },

  async deleteCatalog(id: string): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('catalogs')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) serviceError('catalogsService.deleteCatalog', error)
  },

  /** Público — sem requireUserId. Usado na rota /catalogo/[slug]. */
  async getCatalogBySlug(slug: string): Promise<Catalog | null> {
    const { data, error } = await supabase
      .from('catalogs')
      .select('*')
      .eq('slug', slug)
      .eq('is_public', true)
      .maybeSingle()
    if (error) serviceError('catalogsService.getCatalogBySlug', error)
    return data ? fromDB(data) : null
  },
}
