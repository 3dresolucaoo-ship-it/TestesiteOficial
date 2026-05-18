/**
 * KpiSatellites.tsx — Wrapper de exportação dos satélites KPI
 *
 * Referência HTML: linhas 2663-2710 (v4-hibrido.html)
 * Classes: .kpi-satellites · .kpi-mini-card · .kpi-mini-delta
 *
 * NOTA ARQUITETURAL: os satélites estão co-localizados em CoverHero.tsx
 * (renderizados dentro de <aside class="kpi-satellites">) porque compartilham
 * o mesmo grid .cover e precisam da mesma altura via align-self: stretch.
 *
 * Este arquivo existe como re-export semântico para facilitar testes
 * unitários isolados dos cards satélite no futuro (Júlia Wave 4).
 *
 * Para implementação real, ver CoverHero.tsx (KpiMiniCard interno).
 */

// Re-exporta o tipo para consumo externo
export type { KpiSatellite, DeltaDirection } from './types'
