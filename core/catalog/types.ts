export interface Catalog {
  id: string
  userId: string
  projectId: string
  name: string
  slug: string
  mode: 'catalog' | 'portfolio'
  productIds: string[]
  logoUrl?: string
  whatsapp?: string
  portfolioSlug?: string
  isPublic: boolean
  createdAt: string
}
