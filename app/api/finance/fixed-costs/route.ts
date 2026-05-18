import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { createServerClient } from '@/lib/supabaseServer'
import { fixedCostCreateSchema, zodErrorToPtBr } from '@/services/apiSchemas'

export async function GET(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = req.nextUrl.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('fixed_costs')
    .select('*')
    .eq('user_id', user.id)
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    items: (data ?? []).map(r => ({
      id: r.id,
      projectId: r.project_id,
      label: r.label,
      amount: Number(r.amount),
      createdAt: r.created_at,
    })),
  })
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Otávio (Security) 2026-05-17: Zod schema — bloqueia label XSS/oversize,
  // valida UUID estrito, garante amount nonneg + finite + max 1e9.
  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido (JSON esperado)' }, { status: 400 })
  }

  const parsed = fixedCostCreateSchema.safeParse(rawBody)
  if (!parsed.success) {
    const { message, fields } = zodErrorToPtBr(parsed.error)
    return NextResponse.json({ error: message, fields }, { status: 400 })
  }
  const { id, projectId, label, amount } = parsed.data

  const supabase = await createServerClient()
  const { error } = await supabase.from('fixed_costs').insert({
    id, user_id: user.id, project_id: projectId, label, amount,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
