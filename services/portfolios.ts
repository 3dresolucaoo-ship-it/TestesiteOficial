import { supabase } from '@/lib/supabaseClient'
import { serviceError, validateRequired } from '@/lib/serviceError'
import { requireUserId } from '@/lib/getUser'
import type { Portfolio, PortfolioItem } from '@/core/portfolio/types'

// ─── Converters ───────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function portfolioFromDB(r: any): Portfolio {
  return {
    id:          r.id,
    userId:      r.user_id,
    name:        r.name,
    slug:        r.slug,
    bio:         r.bio ?? undefined,
    avatarUrl:   r.avatar_url ?? undefined,
    whatsapp:    r.whatsapp ?? undefined,
    catalogSlug: r.catalog_slug ?? undefined,
    isPublic:    r.is_public,
    createdAt:   r.created_at,
  }
}

function portfolioToDB(p: Portfolio, userId: string) {
  return {
    id:           p.id,
    user_id:      userId,
    name:         p.name,
    slug:         p.slug,
    bio:          p.bio ?? null,
    avatar_url:   p.avatarUrl ?? null,
    whatsapp:     p.whatsapp ?? null,
    catalog_slug: p.catalogSlug ?? null,
    is_public:    p.isPublic,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function itemFromDB(r: any): PortfolioItem {
  return {
    id:          r.id,
    userId:      r.user_id,
    portfolioId: r.portfolio_id,
    title:       r.title,
    description: r.description ?? undefined,
    imageUrl:    r.image_url ?? undefined,
    sortOrder:   r.sort_order ?? 0,
    createdAt:   r.created_at,
  }
}

function itemToDB(item: PortfolioItem, userId: string) {
  return {
    id:           item.id,
    user_id:      userId,
    portfolio_id: item.portfolioId,
    title:        item.title,
    description:  item.description ?? null,
    image_url:    item.imageUrl ?? null,
    sort_order:   item.sortOrder,
  }
}

// ─── Portfolio service ────────────────────────────────────────────────────────
export const portfoliosService = {
  async list(): Promise<Portfolio[]> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) serviceError('portfoliosService.list', error)
    return (data ?? []).map(portfolioFromDB)
  },

  async create(p: Portfolio): Promise<void> {
    validateRequired('portfoliosService.create', { id: p.id, name: p.name, slug: p.slug })
    const userId = await requireUserId()
    const { error } = await supabase.from('portfolios').insert(portfolioToDB(p, userId))
    if (error) serviceError('portfoliosService.create', error)
  },

  async update(p: Portfolio): Promise<void> {
    validateRequired('portfoliosService.update', { id: p.id })
    const userId = await requireUserId()
    const { error } = await supabase
      .from('portfolios')
      .update(portfolioToDB(p, userId))
      .eq('id', p.id)
      .eq('user_id', userId)
    if (error) serviceError('portfoliosService.update', error)
  },

  async delete(id: string): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) serviceError('portfoliosService.delete', error)
  },

  /** Público — sem requireUserId. */
  async getBySlug(slug: string): Promise<Portfolio | null> {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('slug', slug)
      .eq('is_public', true)
      .maybeSingle()
    if (error) serviceError('portfoliosService.getBySlug', error)
    return data ? portfolioFromDB(data) : null
  },
}

// ─── Portfolio items service ──────────────────────────────────────────────────
export const portfolioItemsService = {
  async listByPortfolio(portfolioId: string): Promise<PortfolioItem[]> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('user_id', userId)
      .order('sort_order')
    if (error) serviceError('portfolioItemsService.listByPortfolio', error)
    return (data ?? []).map(itemFromDB)
  },

  async create(item: PortfolioItem): Promise<void> {
    validateRequired('portfolioItemsService.create', {
      id: item.id, portfolioId: item.portfolioId, title: item.title,
    })
    const userId = await requireUserId()
    const { error } = await supabase.from('portfolio_items').insert(itemToDB(item, userId))
    if (error) serviceError('portfolioItemsService.create', error)
  },

  async update(item: PortfolioItem): Promise<void> {
    validateRequired('portfolioItemsService.update', { id: item.id })
    const userId = await requireUserId()
    const { error } = await supabase
      .from('portfolio_items')
      .update(itemToDB(item, userId))
      .eq('id', item.id)
      .eq('user_id', userId)
    if (error) serviceError('portfolioItemsService.update', error)
  },

  async delete(id: string): Promise<void> {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) serviceError('portfolioItemsService.delete', error)
  },

  /** Público — busca itens de portfólio público. */
  async listPublic(portfolioId: string): Promise<PortfolioItem[]> {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('sort_order')
    if (error) serviceError('portfolioItemsService.listPublic', error)
    return (data ?? []).map(itemFromDB)
  },
}
