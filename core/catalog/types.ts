export type CatalogTemplate = 'grid' | 'list' | 'minimal'

export interface Catalog {
  id: string
  userId: string
  projectId: string
  name: string
  slug: string
  mode: 'catalog' | 'portfolio'
  template: CatalogTemplate
  productIds: string[]
  logoUrl?: string
  whatsapp?: string
  portfolioSlug?: string
  isPublic: boolean
  createdAt: string
}
