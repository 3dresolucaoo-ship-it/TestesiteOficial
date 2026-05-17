import { NextResponse, type NextRequest } from 'next/server'
import { getUser } from '@/lib/auth'
import { createServerClient } from '@/lib/supabaseServer'
import { contentSyncSchema, zodErrorToPtBr } from '@/services/apiSchemas'

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
// Body: { items: Array<{ id: uuid; link: url }> }
// Returns: { synced: number; items: Array<updatedRow> }
//
// Otávio 2026-05-17: hardening completo.
// Antes: sem auth, sem Zod, client browser no server (sem RLS) →
//   qualquer um podia POST com {id: <id_alheio>} e sobrescrever métricas
//   de qualquer usuário (corrupção + vazamento cross-tenant).
// Agora: getUser() obrigatório + Zod (UUID + URL limits) + createServerClient
//   (RLS filtra automaticamente por user_id na policy do `content`).

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = contentSyncSchema.safeParse(body)
  if (!parsed.success) {
    const { message, fields } = zodErrorToPtBr(parsed.error)
    return NextResponse.json({ error: message, fields }, { status: 400 })
  }

  const { items } = parsed.data
  const supabase = await createServerClient()

  const results: Array<{
    id: string; views: number; likes: number
    comments: number; shares: number; saves: number
  }> = []

  try {
    for (const item of items) {
      // Generate metrics (swap with real API call when ready)
      const metrics = mockMetricsFromLink(item.link)

      results.push({ id: item.id, ...metrics })

      // RLS policy do `content` filtra por user_id = auth.uid() —
      // tentativa de update em row de outro user retorna 0 rows alterados
      // sem erro (silent reject). Seguro contra cross-tenant write.
      await supabase
        .from('content')
        .update(metrics)
        .eq('id', item.id)
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
