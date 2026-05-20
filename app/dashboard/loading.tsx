/**
 * app/dashboard/loading.tsx — Skeleton screen para /dashboard.
 *
 * Substitui o DashboardSkeleton que estava inline em dashboard/page.tsx
 * via <Suspense fallback={...}>. Next.js exibe este arquivo automaticamente
 * antes da page ser resolvida no streaming SSR.
 *
 * Replica a estrutura do DashboardLayout V4:
 *   1. Sidebar fixed (248px)
 *   2. Topbar
 *   3. CoverHero (area grande de destaque)
 *   4. BentoGrid (6 cards)
 *
 * Sem dependencia de componentes client. CSS via globals-v4.css.
 */

import '../globals-v4.css'

export default function DashboardLoading() {
  const localStyles = `
    [data-skel-root] {
      --skel-bg:     var(--v4-surface-0);
      --skel-card:   var(--v4-surface-1);
      --skel-border: var(--v4-border-soft);
    }
    @media (prefers-color-scheme: light) {
      :root:not([data-theme="dark"]) [data-skel-root] {
        --skel-bg:     hsl(var(--sand-mocha-50));
        --skel-card:   hsl(var(--sand-mocha-100));
        --skel-border: rgba(15, 10, 9, 0.14);
      }
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: localStyles }} />
      <div
        data-skel-root=""
        className="min-h-screen"
        style={{ background: 'var(--skel-bg)' }}
        aria-label="Carregando dashboard..."
        role="status"
        aria-busy="true"
      >
        {/* Sidebar skeleton */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '248px',
            height: '100vh',
            background: 'var(--skel-bg)',
            borderRight: '1px solid var(--skel-border)',
            zIndex: 10,
            padding: '24px 16px',
          }}
          aria-hidden="true"
        >
          {/* Logo */}
          <div className="skeleton" style={{ width: '120px', height: '32px', marginBottom: '32px' }} />
          {/* Nav items */}
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                width: `${90 - i * 4}%`,
                height: '36px',
                marginBottom: '8px',
                borderRadius: '8px',
                opacity: 1 - i * 0.08,
              }}
            />
          ))}
        </div>

        {/* Main */}
        <div
          style={{
            marginLeft: '248px',
            padding: '36px 40px',
          }}
        >
          {/* Topbar skeleton */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '36px',
            }}
            aria-hidden="true"
          >
            <div className="skeleton" style={{ height: '42px', borderRadius: '999px', width: '220px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
              <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
            </div>
          </div>

          {/* CoverHero skeleton */}
          <div
            className="skeleton"
            style={{
              height: '200px',
              borderRadius: '16px',
              marginBottom: '44px',
              opacity: 0.7,
            }}
            aria-hidden="true"
          />

          {/* BentoGrid skeleton */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '18px',
            }}
            aria-hidden="true"
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{
                  height: '220px',
                  borderRadius: '16px',
                  gridColumn: i === 0 ? 'span 2' : 'span 1',
                  opacity: 0.6 - i * 0.06,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
