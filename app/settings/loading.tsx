/**
 * app/settings/loading.tsx — Skeleton screen pra /settings.
 *
 * SettingsShell usa ModuleShell V4 com contadores no header.
 */

import '../globals-v4.css'

export default function SettingsLoading() {
  return (
    <div
      className="module-content"
      style={{ padding: '40px 40px 80px', maxWidth: '1400px', margin: '0 auto' }}
      aria-label="Carregando configurações..."
      role="status"
      aria-busy="true"
    >
      {/* PageHeader */}
      <div style={{ marginBottom: '32px' }}>
        <div className="skeleton skeleton-text" style={{ width: '220px', marginBottom: '12px' }} />
        <div className="skeleton skeleton-title" style={{ marginBottom: '10px' }} />
        <div className="skeleton skeleton-text" style={{ width: '380px', marginBottom: '16px' }} />
      </div>

      {/* Tabs internas (Geral, Módulos, Finanças, CRM, etc) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto' }} aria-hidden="true">
        {[70, 85, 80, 65, 90, 75, 85, 70].map((w, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ width: `${w}px`, height: '36px', borderRadius: '999px', flexShrink: 0 }}
          />
        ))}
      </div>

      {/* Form fields skeleton */}
      <div style={{ background: 'var(--v4-surface-1)', border: '1px solid var(--v4-border-soft)', borderRadius: '16px', padding: '32px' }} aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ marginBottom: '24px' }}>
            <div className="skeleton skeleton-text" style={{ width: '120px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ height: '40px', borderRadius: '8px', width: '100%' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
