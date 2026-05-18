/**
 * app/dashboard/page.tsx — Dashboard V4.8
 *
 * Server Component (default) que:
 * 1. Autentica o usuário via Supabase cookie-based auth
 * 2. Resolve o projeto ativo (primeiro ativo do usuário)
 * 3. Agrega dados via services/dashboard.ts (Promise.all paralelo)
 * 4. Passa DashboardData para DashboardLayout (Client Component)
 *
 * ADR: decisions/014-dashboard-v4-plano-execucao.md
 * CSS V4: app/globals-v4.css (importado aqui — scoped ao dashboard)
 */

import { redirect }       from 'next/navigation'
import { Suspense }        from 'react'
import { getUser }         from '@/lib/auth'
import { createServerClient } from '@/lib/supabaseServer'
import { getDashboardData } from '@/services/dashboard'
import { DashboardLayout } from '@/components/dashboard/v4'
import '../globals-v4.css'

// ---------------------------------------------------------------------------
// Skeleton (Suspense fallback)
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--v4-surface-0)' }}
      aria-label="Carregando dashboard..."
      role="status"
    >
      {/* Sidebar skeleton */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '248px',
          height: '100vh',
          background: 'var(--v4-surface-0)',
          borderRight: '1px solid var(--v4-border-soft)',
          zIndex: 10,
        }}
        aria-hidden="true"
      />

      {/* Main skeleton */}
      <div
        style={{
          marginLeft: '248px',
          padding: '36px 40px',
        }}
      >
        {/* Topbar skeleton */}
        <div
          style={{
            height: '42px',
            borderRadius: '999px',
            background: 'var(--v4-surface-1)',
            width: '220px',
            marginBottom: '36px',
          }}
        />

        {/* Cover skeleton */}
        <div
          style={{
            height: '200px',
            borderRadius: '16px',
            background: 'var(--v4-surface-1)',
            marginBottom: '44px',
            opacity: 0.7,
          }}
        />

        {/* Bento skeleton */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '18px',
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: '220px',
                borderRadius: '16px',
                background: 'var(--v4-surface-1)',
                gridColumn: i === 0 ? 'span 2' : 'span 1',
                opacity: 0.6 - i * 0.06,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inner (permite Suspense wrapping)
// ---------------------------------------------------------------------------

async function DashboardInner() {
  // 1. Auth
  const user = await getUser()
  if (!user) redirect('/login')

  // 2. Projeto ativo — pega o primeiro projeto ativo do usuário
  //    O projectId real virá do store/cookie na Wave 3 (multi-projeto).
  //    Por ora: primeiro projeto ativo, fallback para qualquer projeto.
  const supabase = await createServerClient()
  const { data: projectRows } = await supabase
    .from('projects')
    .select('id, name')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)

  let projectId: string | null = projectRows?.[0]?.id ?? null

  // Fallback: qualquer projeto
  if (!projectId) {
    const { data: anyProject } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
    projectId = anyProject?.[0]?.id ?? null
  }

  // Sem projetos — redireciona para criar projeto
  if (!projectId) {
    redirect('/projects')
  }

  // 3. Nome do usuário (profile ou metadata)
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const userName: string =
    (profile as { full_name?: string } | null)?.full_name ??
    user.user_metadata?.full_name ??
    user.email?.split('@')[0] ??
    'Maker'

  // 4. Dados do dashboard (Promise.all interno no service)
  const dashboardData = await getDashboardData(user.id, projectId, userName)

  // 5. Render
  return <DashboardLayout data={dashboardData} />
}

// ---------------------------------------------------------------------------
// Page export
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardInner />
    </Suspense>
  )
}
