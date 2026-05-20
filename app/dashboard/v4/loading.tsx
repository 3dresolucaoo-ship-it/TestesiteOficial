/**
 * app/dashboard/v4/loading.tsx — Skeleton de carregamento da rota sandbox V4
 *
 * Exibido automaticamente pelo Next.js App Router enquanto o Suspense boundary
 * do DashboardV4Inner aguarda. Extrai o mesmo pattern do DashboardV4Skeleton
 * inline em page.tsx, mas como arquivo de rota independente — permite que o
 * shell estático seja servido imediatamente sem bloquear o data fetching.
 *
 * Tokens: usa --v4-surface-* com fallback literal para o caso em que
 * globals-v4.css ainda não foi processado pelo browser (SSR stream inicial).
 *
 * Sem 'use client': este componente é pure Server Component (nenhum hook).
 */

import '../../globals-v4.css'

// ---------------------------------------------------------------------------
// Skeleton atom reutilizável
// ---------------------------------------------------------------------------

interface SkeletonBlockProps {
  height: number | string
  width?: number | string
  radius?: number
  opacity?: number
  gridColumn?: string
}

function SkeletonBlock({
  height,
  width = '100%',
  radius = 16,
  opacity = 0.55,
  gridColumn,
}: SkeletonBlockProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        height,
        width,
        borderRadius: radius,
        background: 'var(--v4-surface-1, #161B1F)',
        opacity,
        gridColumn,
        flexShrink: 0,
      }}
    />
  )
}

// ---------------------------------------------------------------------------
// Loading export
// ---------------------------------------------------------------------------

export default function DashboardV4Loading() {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--v4-surface-0, #11161A)' }}
      aria-label="Carregando dashboard..."
      role="status"
    >
      {/* Sidebar skeleton */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 248,
          height: '100vh',
          background: 'var(--v4-surface-0, #11161A)',
          borderRight: '1px solid var(--v4-border-soft, rgba(242,239,234,0.14))',
          zIndex: 10,
          padding: '28px 0 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}
      >
        {/* Logo placeholder */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px' }}>
          <SkeletonBlock height={40} width={40} radius={10} opacity={0.45} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <SkeletonBlock height={16} width={80} radius={6} opacity={0.4} />
            <SkeletonBlock height={10} width={96} radius={4} opacity={0.3} />
          </div>
        </div>
        {/* Nav groups */}
        {[5, 3, 2].map((count, gi) => (
          <div key={gi} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 14px' }}>
            <SkeletonBlock height={10} width={64} radius={4} opacity={0.25} />
            {Array.from({ length: count }).map((_, i) => (
              <SkeletonBlock key={i} height={38} radius={8} opacity={0.3 - i * 0.03} />
            ))}
          </div>
        ))}
      </div>

      {/* Main skeleton */}
      <div
        aria-hidden="true"
        style={{ marginLeft: 248, padding: '36px 40px 120px' }}
      >
        {/* Topbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 36 }}>
          <SkeletonBlock height={42} width={220} radius={999} opacity={0.5} />
          <div style={{ display: 'flex', gap: 10 }}>
            <SkeletonBlock height={38} width={110} radius={999} opacity={0.35} />
            <SkeletonBlock height={38} width={38} radius={10} opacity={0.35} />
            <SkeletonBlock height={38} width={38} radius={10} opacity={0.35} />
          </div>
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: 40 }}>
          <SkeletonBlock height={14} width={120} radius={6} opacity={0.3} />
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonBlock height={52} width={340} radius={8} opacity={0.45} />
            <SkeletonBlock height={20} width={260} radius={6} opacity={0.3} />
          </div>
        </div>

        {/* Cover hero */}
        <SkeletonBlock height={200} radius={16} opacity={0.65} />

        {/* Branch divisor */}
        <div style={{ height: 24, marginTop: 44, marginBottom: 28 }}>
          <SkeletonBlock height={1} radius={0} opacity={0.18} />
        </div>

        {/* Section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <SkeletonBlock height={36} width={280} radius={8} opacity={0.4} />
          <SkeletonBlock height={16} width={160} radius={4} opacity={0.25} />
        </div>

        {/* Bento grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 18,
            marginBottom: 48,
          }}
        >
          {/* Donut — span 2 */}
          <SkeletonBlock height={280} radius={16} opacity={0.60} gridColumn="span 2" />
          {/* Bars — span 2 */}
          <SkeletonBlock height={280} radius={16} opacity={0.55} gridColumn="span 2" />
          {/* Queue — span 1 */}
          <SkeletonBlock height={240} radius={16} opacity={0.50} />
          {/* Gauge — span 1 */}
          <SkeletonBlock height={240} radius={16} opacity={0.48} />
          {/* Top — span 1 */}
          <SkeletonBlock height={240} radius={16} opacity={0.46} />
          {/* NowPrint — span 1 */}
          <SkeletonBlock height={240} radius={16} opacity={0.44} />
          {/* Alert — span 4 */}
          <SkeletonBlock height={120} radius={16} opacity={0.42} gridColumn="span 4" />
        </div>
      </div>
    </div>
  )
}
