import type { ContentItem } from '@/lib/types'

// ─── Engagement ───────────────────────────────────────────────────────────────

export function totalEngagement(item: ContentItem): number {
  return (item.likes ?? 0) + (item.comments ?? 0) + (item.shares ?? 0) + (item.saves ?? 0)
}

export function engagementRate(item: ContentItem): number {
  if (!item.views || item.views === 0) return 0
  return (totalEngagement(item) / item.views) * 100
}

// ─── Top performers ───────────────────────────────────────────────────────────

export type ContentMetric = 'views' | 'leads' | 'sales' | 'engagement'

export function getTopPerformingContent(
  items: ContentItem[],
  limit = 5,
  metric: ContentMetric = 'views',
): ContentItem[] {
  const posted = items.filter(i => i.status === 'posted')
  return [...posted]
    .sort((a, b) => {
      switch (metric) {
        case 'views':      return b.views - a.views
        case 'leads':      return b.leads - a.leads
        case 'sales':      return b.salesGenerated - a.salesGenerated
        case 'engagement': return engagementRate(b) - engagementRate(a)
      }
    })
    .slice(0, limit)
}

// ─── Conversion & revenue ─────────────────────────────────────────────────────

export function conversionRate(totalLeads: number, wonLeads: number): number {
  if (totalLeads === 0) return 0
  return (wonLeads / totalLeads) * 100
}

export function revenuePerContent(items: ContentItem[], totalRevenue: number): number {
  const posted = items.filter(i => i.status === 'posted').length
  if (posted === 0) return 0
  return totalRevenue / posted
}

// ─── Platform breakdown ───────────────────────────────────────────────────────

export interface PlatformStat {
  platform: string
  count:  number
  views:  number
  leads:  number
  sales:  number
}

export function platformBreakdown(items: ContentItem[]): PlatformStat[] {
  const map: Record<string, PlatformStat> = {}
  for (const item of items.filter(i => i.status === 'posted')) {
    if (!map[item.platform]) {
      map[item.platform] = { platform: item.platform, count: 0, views: 0, leads: 0, sales: 0 }
    }
    map[item.platform].count++
    map[item.platform].views += item.views
    map[item.platform].leads += item.leads
    map[item.platform].sales += item.salesGenerated
  }
  return Object.values(map).sort((a, b) => b.views - a.views)
}

// ─── Content velocity ─────────────────────────────────────────────────────────

/** Average days between posting a new piece of content */
export function contentVelocity(items: ContentItem[]): number {
  const dates = items
    .filter(i => i.status === 'posted')
    .map(i => new Date(i.date).getTime())
    .sort((a, b) => a - b)
  if (dates.length < 2) return 0
  const totalDays = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24)
  return totalDays / (dates.length - 1)
}
