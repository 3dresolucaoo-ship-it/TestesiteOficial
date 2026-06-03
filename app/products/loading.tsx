/**
 * app/products/loading.tsx — Skeleton screen V4 pra /products.
 */

import '../globals-v4.css'

export default function ProductsLoading() {
  return (
    <div
      className="module-content"
      style={{ padding: '40px 40px 80px', maxWidth: '1400px', margin: '0 auto' }}
      aria-label="Carregando produtos..."
      role="status"
      aria-busy="true"
    >
      <div style={{ marginBottom: '32px' }}>
        <div className="skeleton skeleton-text" style={{ width: '220px', marginBottom: '12px' }} />
        <div className="skeleton skeleton-title" style={{ marginBottom: '10px' }} />
        <div className="skeleton skeleton-text" style={{ width: '380px', marginBottom: '16px' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="skeleton" style={{ width: '120px', height: '38px', borderRadius: '8px' }} />
        </div>
      </div>

      <div className="kpi-row kpi-row-sat-2" style={{ marginBottom: '24px' }} aria-hidden="true">
        <div className="kpi-card hero-petrol" style={{ background: 'rgba(31,118,105,0.12)', border: '1px solid rgba(31,118,105,0.22)', borderRadius: '16px', padding: '24px' }}>
          <div className="skeleton skeleton-text" style={{ width: '160px', marginBottom: '12px' }} />
          <div className="skeleton skeleton-kpi-value" style={{ marginBottom: '10px' }} />
          <div className="skeleton skeleton-text" style={{ width: '200px' }} />
        </div>
        <div className="kpi-card" style={{ background: 'var(--v4-surface-1)', border: '1px solid var(--v4-border-soft)', borderRadius: '16px', padding: '24px' }}>
          <div className="skeleton skeleton-text" style={{ width: '120px', marginBottom: '12px' }} />
          <div className="skeleton" style={{ height: '32px', width: '80px', marginBottom: '8px', borderRadius: '6px' }} />
          <div className="skeleton skeleton-text" style={{ width: '140px' }} />
        </div>
        <div className="kpi-card" style={{ background: 'var(--v4-surface-1)', border: '1px solid var(--v4-border-soft)', borderRadius: '16px', padding: '24px' }}>
          <div className="skeleton skeleton-text" style={{ width: '120px', marginBottom: '12px' }} />
          <div className="skeleton" style={{ height: '32px', width: '60px', marginBottom: '8px', borderRadius: '6px' }} />
          <div className="skeleton skeleton-text" style={{ width: '120px' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }} aria-hidden="true">
        {[70, 80, 90].map((w, i) => (
          <div key={i} className="skeleton" style={{ width: `${w}px`, height: '36px', borderRadius: '999px', flexShrink: 0 }} />
        ))}
        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <div className="skeleton" style={{ width: '200px', height: '36px', borderRadius: '8px' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }} aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '280px', borderRadius: '16px', opacity: 1 - i * 0.08 }} />
        ))}
      </div>
    </div>
  )
}
