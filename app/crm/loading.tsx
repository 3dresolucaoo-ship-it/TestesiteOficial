/**
 * app/crm/loading.tsx — Skeleton screen para /crm.
 *
 * Replica a estrutura do ModuleShell V4 (padrao /orders):
 *   1. PageHeader (eyebrow + titulo + frase viva)
 *   2. KpiRow     (1 hero + 3 satellites)
 *   3. FilterBar  (tabs Pipeline/Clientes + search)
 *   4. Kanban board (3 colunas com 2-3 cards cada)
 */

import '../globals-v4.css'

export default function CrmLoading() {
  return (
    <div
      className="module-content"
      style={{ padding: '40px 40px 80px', maxWidth: '1400px', margin: '0 auto' }}
      aria-label="Carregando CRM..."
      role="status"
      aria-busy="true"
    >
      {/* PageHeader skeleton */}
      <div style={{ marginBottom: '32px' }}>
        <div className="skeleton skeleton-text" style={{ width: '200px', marginBottom: '12px' }} />
        <div className="skeleton skeleton-title" style={{ marginBottom: '10px' }} />
        <div className="skeleton skeleton-text" style={{ width: '340px', marginBottom: '16px' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="skeleton" style={{ width: '120px', height: '38px', borderRadius: '8px' }} />
        </div>
      </div>

      {/* KpiRow skeleton — 1 hero + 3 satellites */}
      <div className="kpi-row" style={{ marginBottom: '24px' }} aria-hidden="true">
        <div
          className="kpi-card hero-petrol"
          style={{
            background: 'rgba(31,118,105,0.12)',
            border: '1px solid rgba(31,118,105,0.22)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div className="skeleton skeleton-text" style={{ width: '140px', marginBottom: '12px' }} />
          <div className="skeleton skeleton-kpi-value" style={{ marginBottom: '10px' }} />
          <div className="skeleton skeleton-text" style={{ width: '180px' }} />
        </div>

        {[130, 100, 120].map((w, i) => (
          <div
            key={i}
            className="kpi-card"
            style={{
              background: 'var(--v4-surface-1)',
              border: '1px solid var(--v4-border-soft)',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <div className="skeleton skeleton-text" style={{ width: `${w}px`, marginBottom: '12px' }} />
            <div className="skeleton" style={{ height: '32px', width: '80px', marginBottom: '8px', borderRadius: '6px' }} />
            <div className="skeleton skeleton-text" style={{ width: `${w - 20}px` }} />
          </div>
        ))}
      </div>

      {/* FilterBar skeleton — tabs Pipeline/Clientes */}
      <div
        style={{ display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'center' }}
        aria-hidden="true"
      >
        {[90, 80].map((w, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ width: `${w}px`, height: '36px', borderRadius: '999px' }}
          />
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <div className="skeleton" style={{ width: '200px', height: '36px', borderRadius: '8px' }} />
        </div>
      </div>

      {/* Kanban board skeleton — 5 colunas de status */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
          overflowX: 'auto',
        }}
        aria-hidden="true"
      >
        {['Novo', 'Contatado', 'Negociando', 'Ganho', 'Perdido'].map((col, colIdx) => (
          <div
            key={col}
            style={{
              background: 'var(--v4-surface-1)',
              border: '1px solid var(--v4-border-soft)',
              borderRadius: '12px',
              padding: '14px',
              minHeight: '300px',
            }}
          >
            {/* Coluna header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div className="skeleton skeleton-text" style={{ width: '70px' }} />
              <div className="skeleton" style={{ width: '24px', height: '20px', borderRadius: '999px' }} />
            </div>
            {/* Cards da coluna */}
            {Array.from({ length: colIdx < 3 ? 2 : 1 }).map((_, cardIdx) => (
              <div
                key={cardIdx}
                style={{
                  background: 'var(--v4-surface-2)',
                  border: '1px solid var(--v4-border-soft)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '8px',
                  opacity: 1 - cardIdx * 0.15,
                }}
              >
                <div className="skeleton skeleton-text" style={{ width: '100px', marginBottom: '8px' }} />
                <div className="skeleton skeleton-text" style={{ width: '70px', marginBottom: '6px', opacity: 0.7 }} />
                <div className="skeleton" style={{ width: '60px', height: '18px', borderRadius: '999px', marginTop: '8px' }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
