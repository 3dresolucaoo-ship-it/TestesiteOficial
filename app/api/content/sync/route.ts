import { NextResponse, type NextRequest } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'

// ─── Mock metrics generator ───────────────────────────────────────────────────
// Produces deterministic fake metrics from a URL string.
// Replace this function body with a real platform API call when ready.

function mockMetricsFromLink(link: string): {
  views: number; likes: number; comments: number; shares: number; saves: number
} {
  // Deterministic hash → stable fake numbers for the same link
  let h = 0
  for (let i = 0; i < link.length; i++) h = (h * 31 + link.charCodeAt(i)) >>> 0

  const rand = (seed: number, max: number) =>
    Math.floor(Math.abs(Math.sin(h + seed)) * max)

  const views    = rand(1, 15000) + 100
  const likes    = Math.floor(views * (rand(2, 15) / 100 + 0.02))
  const comments = Math.floor(likes * (rand(3, 20) / 100 + 0.01))
  const shares   = Math.floor(likes * (rand(4, 15) / 100 + 0.005))
  const saves    = Math.floor(likes * (rand(5, 30) / 100 + 0.02))

  return { views, likes, comments, shares, saves }
}

// ─── POST /api/content/sync ───────────────────────────────────────────────────
// Body: { items: Array<{ id: string; link: string }> }
// Returns: { synced: number; items: Array<updatedRow> }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { items: Array<{ id: string; link: string }> }
    const items = body?.items ?? []

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ synced: 0, items: [] })
    }

    const results: Array<{
      id: string; views: number; likes: number
      comments: number; shares: number; saves: number
    }> = []

    for (const item of items) {
      if (!item.id || !item.link) continue

      // Generate metrics (swap with real API call when ready)
      const metrics = mockMetricsFromLink(item.link)

      results.push({ id: item.id, ...metrics })

      // Persist to Supabase if configured
      if (isSupabaseConfigured) {
        await supabase
          .from('content')
          .update(metrics)
          .eq('id', item.id)
      }
    }

    return NextResponse.json({ synced: results.length, items: results })
  } catch (err) {
    console.error('[/api/content/sync]', err)
    return NextResponse.json(
      { error: 'Sync failed', detail: String(err) },
      { status: 500 },
    )
  }
}
