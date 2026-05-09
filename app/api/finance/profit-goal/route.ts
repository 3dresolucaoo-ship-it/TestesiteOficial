import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { createServerClient } from '@/lib/supabaseServer'

export async function GET(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = req.nextUrl.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('profit_goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('project_id', projectId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    goal: data ? {
      projectId: data.project_id,
      monthlyTarget: Number(data.monthly_target),
      updatedAt: data.updated_at,
    } : null,
  })
}

export async function PUT(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { projectId, monthlyTarget } = body
  if (!projectId || typeof monthlyTarget !== 'number') {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = await createServerClient()
  const { error } = await supabase
    .from('profit_goals')
    .upsert({
      user_id: user.id,
      project_id: projectId,
      monthly_target: monthlyTarget,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,project_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
