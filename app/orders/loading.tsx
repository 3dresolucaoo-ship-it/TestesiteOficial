/**
 * app/orders/loading.tsx — Skeleton screen para /orders.
 *
 * Next.js exibe este componente automaticamente via Suspense enquanto
 * a page (client component + store hydration) carrega.
 *
 * Replica a estrutura do ModuleShell V4:
 *   1. PageHeader (eyebrow + titulo + frase viva + acoes)
 *   2. KpiRow     (1 card hero petrol + 2 satellites)
 *   3. FilterBar  (tabs + search)
 *   4. Tabela     (5 linhas skeleton)
 *
 * Sem dependencia de componentes client. CSS via globals-v4.css
 * (importado aqui — mesmo padrao das pages V4).
 */

import '../globals-v4.css'

export default function OrdersLoading() {
  return (
    <div
      className="module-content"
      style={{ padding: '40px 40px 80px', maxWidth: '1400px', margin: '0 auto' }}
      aria-label="Carregando pedidos..."
      role="status"
      aria-busy="true"
    >
      {/* PageHeader skeleton */}
      <div style={{ marginBottom: '32px' }}>
        <div className="skeleton skeleton-text" style={{ width: '220px', marginBottom: '12px' }} />
        <div className="skeleton skeleton-title" style={{ marginBottom: '10px' }} />
        <div className="skeleton skeleton-text" style={{ width: '380px', marginBottom: '16px' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="skeleton" style={{ width: '120px', height: '38px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ width: '120px', height: '38px', borderRadius: '8px' }} />
        </div>
      </div>

      {/* KpiRow skeleton */}
      <div
        className="kpi-row"
        style={{ marginBottom: '24px' }}
        aria-hidden="true"
      >
        {/* Hero card */}
        <div
          className="kpi-card hero-petrol"
          style={{
            background: 'rgba(31,118,105,0.12)',
            border: '1px solid rgba(31,118,105,0.22)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div className="skeleton skeleton-text" style={{ width: '160px', marginBottom: '12px' }} />
          <div className="skeleton skeleton-kpi-value" style={{ marginBottom: '10px' }} />
          <div className="skeleton skeleton-text" style={{ width: '200px' }} />
        </div>

        {/* Satellite card 1 */}
        <div
          className="kpi-card"
          style={{
            background: 'var(--v4-surface-1)',
            border: '1px solid var(--v4-border-soft)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div className="skeleton skeleton-text" style={{ width: '120px', marginBottom: '12px' }} />
          <div className="skeleton" style={{ height: '32px', width: '100px', marginBottom: '8px', borderRadius: '6px' }} />
          <div className="skeleton skeleton-text" style={{ width: '140px' }} />
        </div>

        {/* Satellite card 2 */}
        <div
          className="kpi-card"
          style={{
            background: 'var(--v4-surface-1)',
            border: '1px solid var(--v4-border-soft)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div className="skeleton skeleton-text" style={{ width: '120px', marginBottom: '12px' }} />
          <div className="skeleton" style={{ height: '32px', width: '80px', marginBottom: '8px', borderRadius: '6px' }} />
          <div className="skeleton skeleton-text" style={{ width: '120px' }} />
        </div>
      </div>

      {/* FilterBar skeleton */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          alignItems: 'center',
          overflowX: 'auto',
        }}
        aria-hidden="true"
      >
        {[100, 80, 90, 70, 85, 75].map((w, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ width: `${w}px`, height: '36px', borderRadius: '999px', flexShrink: 0 }}
          />
        ))}
        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <div className="skeleton" style={{ width: '200px', height: '36px', borderRadius: '8px' }} />
        </div>
      </div>

      {/* Tabela skeleton */}
      <div
        style={{
          background: 'var(--v4-surface-1)',
          border: '1px solid var(--v4-border-soft)',
          borderRadius: '16px',
          overflow: 'hidden',
          padding: '0',
        }}
        aria-hidden="true"
      >
        {/* Header da tabela */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 80px',
            gap: '0',
            padding: '12px 16px',
            borderBottom: '1px solid var(--v4-border-soft)',
          }}
        >
          {['Cliente', 'Projeto', 'Origem', 'Valor', 'Status', ''].map((_, i) => (
            <div
              key={i}
              className="skeleton skeleton-text"
              style={{ width: i === 5 ? '20px' : '60px', opacity: 0.5 }}
            />
          ))}
        </div>

        {/* Linhas da tabela */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 80px',
              alignItems: 'center',
              gap: '0',
              padding: '14px 16px',
              borderBottom: i < 5 ? '1px solid var(--v4-border-soft)' : 'none',
              opacity: 1 - i * 0.1,
            }}
          >
            <div>
              <div className="skeleton skeleton-text" style={{ width: '120px', marginBottom: '6px' }} />
              <div className="skeleton skeleton-text" style={{ width: '70px', opacity: 0.6 }} />
            </div>
            <div className="skeleton skeleton-text" style={{ width: '90px' }} />
            <div className="skeleton skeleton-text" style={{ width: '60px' }} />
            <div className="skeleton skeleton-text" style={{ width: '70px' }} />
            <div className="skeleton" style={{ width: '68px', height: '22px', borderRadius: '999px' }} />
            <div className="skeleton" style={{ width: '28px', height: '28px', borderRadius: '8px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
