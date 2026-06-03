/**
 * app/production/loading.tsx — Skeleton screen V4 pra /production.
 *
 * KPI shape: Hero (Impressoes Ativas) + 2 satellites (Tempo Restante, Lucro Previsto).
 */

import '../globals-v4.css'

export default function ProductionLoading() {
  return (
    <div
      className="module-content"
      style={{ padding: '40px 40px 80px', maxWidth: '1400px', margin: '0 auto' }}
      aria-label="Carregando produção..."
      role="status"
      aria-busy="true"
    >
      <div style={{ marginBottom: '32px' }}>
        <div className="skeleton skeleton-text" style={{ width: '220px', marginBottom: '12px' }} />
        <div className="skeleton skeleton-title" style={{ marginBottom: '10px' }} />
        <div className="skeleton skeleton-text" style={{ width: '380px', marginBottom: '16px' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="skeleton" style={{ width: '160px', height: '38px', borderRadius: '8px' }} />
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
          <div className="skeleton" style={{ height: '32px', width: '100px', marginBottom: '8px', borderRadius: '6px' }} />
          <div className="skeleton skeleton-text" style={{ width: '140px' }} />
        </div>
        <div className="kpi-card" style={{ background: 'var(--v4-surface-1)', border: '1px solid var(--v4-border-soft)', borderRadius: '16px', padding: '24px' }}>
          <div className="skeleton skeleton-text" style={{ width: '120px', marginBottom: '12px' }} />
          <div className="skeleton" style={{ height: '32px', width: '110px', marginBottom: '8px', borderRadius: '6px' }} />
          <div className="skeleton skeleton-text" style={{ width: '120px' }} />
        </div>
      </div>

      {/* Printer board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }} aria-hidden="true">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '160px', borderRadius: '16px' }} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }} aria-hidden="true">
        {[80, 90, 70].map((w, i) => (
          <div key={i} className="skeleton" style={{ width: `${w}px`, height: '36px', borderRadius: '999px' }} />
        ))}
      </div>

      {/* Cards de tarefas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '90px', borderRadius: '12px', opacity: 1 - i * 0.1 }} />
        ))}
      </div>
    </div>
  )
}
