export interface Portfolio {
  id: string
  userId: string
  name: string
  slug: string
  bio?: string
  avatarUrl?: string
  whatsapp?: string
  catalogSlug?: string
  isPublic: boolean
  createdAt: string
}

export interface PortfolioItem {
  id: string
  userId: string
  portfolioId: string
  title: string
  description?: string
  imageUrl?: string
  sortOrder: number
  createdAt: string
}
