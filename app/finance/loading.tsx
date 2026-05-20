/**
 * app/finance/loading.tsx — Skeleton screen para /finance.
 *
 * Replica a estrutura do ModuleShell V4 do modulo financeiro:
 *   1. PageHeader (eyebrow + titulo)
 *   2. KpiRow     (1 hero Lucro Liquido + 3 satellites: receita, despesas, margem)
 *   3. FilterBar  (tabs Lancamentos/Custos Fixos/Break Even + search)
 *   4. Lista de transacoes (5 linhas skeleton)
 */

import '../globals-v4.css'

export default function FinanceLoading() {
  return (
    <div
      className="module-content"
      style={{ padding: '40px 40px 80px', maxWidth: '1400px', margin: '0 auto' }}
      aria-label="Carregando financeiro..."
      role="status"
      aria-busy="true"
    >
      {/* PageHeader skeleton */}
      <div style={{ marginBottom: '32px' }}>
        <div className="skeleton skeleton-text" style={{ width: '180px', marginBottom: '12px' }} />
        <div className="skeleton skeleton-title" style={{ marginBottom: '10px' }} />
        <div className="skeleton skeleton-text" style={{ width: '320px', marginBottom: '16px' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="skeleton" style={{ width: '140px', height: '38px', borderRadius: '8px' }} />
        </div>
      </div>

      {/* KpiRow skeleton — hero + 3 satellites */}
      <div className="kpi-row" style={{ marginBottom: '24px' }} aria-hidden="true">
        {/* Hero: Lucro Liquido */}
        <div
          className="kpi-card hero-petrol"
          style={{
            background: 'rgba(31,118,105,0.12)',
            border: '1px solid rgba(31,118,105,0.22)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div className="skeleton skeleton-text" style={{ width: '150px', marginBottom: '12px' }} />
          <div className="skeleton skeleton-kpi-value" style={{ marginBottom: '10px' }} />
          <div className="skeleton skeleton-text" style={{ width: '200px' }} />
        </div>

        {/* Satellite: Receita */}
        <div
          className="kpi-card"
          style={{
            background: 'var(--v4-surface-1)',
            border: '1px solid var(--v4-border-soft)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div className="skeleton skeleton-text" style={{ width: '80px', marginBottom: '12px' }} />
          <div className="skeleton" style={{ height: '32px', width: '110px', marginBottom: '8px', borderRadius: '6px' }} />
          <div className="skeleton skeleton-text" style={{ width: '100px' }} />
        </div>

        {/* Satellite: Despesas */}
        <div
          className="kpi-card"
          style={{
            background: 'var(--v4-surface-1)',
            border: '1px solid var(--v4-border-soft)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div className="skeleton skeleton-text" style={{ width: '90px', marginBottom: '12px' }} />
          <div className="skeleton" style={{ height: '32px', width: '110px', marginBottom: '8px', borderRadius: '6px' }} />
          <div className="skeleton skeleton-text" style={{ width: '80px' }} />
        </div>

        {/* Satellite: Margem */}
        <div
          className="kpi-card"
          style={{
            background: 'var(--v4-surface-1)',
            border: '1px solid var(--v4-border-soft)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div className="skeleton skeleton-text" style={{ width: '70px', marginBottom: '12px' }} />
          <div className="skeleton" style={{ height: '32px', width: '80px', marginBottom: '8px', borderRadius: '6px' }} />
          <div className="skeleton skeleton-text" style={{ width: '90px' }} />
        </div>
      </div>

      {/* FilterBar skeleton — tabs + search */}
      <div
        style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center' }}
        aria-hidden="true"
      >
        {[110, 100, 90].map((w, i) => (
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

      {/* Lista de transacoes skeleton */}
      <div
        style={{
          background: 'var(--v4-surface-1)',
          border: '1px solid var(--v4-border-soft)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr 2fr 1fr 1fr',
            padding: '12px 16px',
            borderBottom: '1px solid var(--v4-border-soft)',
          }}
        >
          {[60, 80, 120, 70, 70].map((w, i) => (
            <div key={i} className="skeleton skeleton-text" style={{ width: `${w}px`, opacity: 0.5 }} />
          ))}
        </div>

        {/* Linhas */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.5fr 2fr 1fr 1fr',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: i < 5 ? '1px solid var(--v4-border-soft)' : 'none',
              opacity: 1 - i * 0.1,
            }}
          >
            <div className="skeleton skeleton-text" style={{ width: '50px' }} />
            <div className="skeleton" style={{ width: '68px', height: '20px', borderRadius: '999px' }} />
            <div className="skeleton skeleton-text" style={{ width: '150px' }} />
            <div className="skeleton skeleton-text" style={{ width: '80px' }} />
            <div className="skeleton skeleton-text" style={{ width: '70px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
