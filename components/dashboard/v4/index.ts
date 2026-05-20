/**
 * index.ts — Barrel exports do Dashboard V4.8
 *
 * Importar de '@/components/dashboard/v4' ao invés de paths individuais.
 *
 * Convenção: tipos separados (./types) para evitar importar código cliente
 * em Server Components que só precisam dos shapes.
 */

// Componentes
export { V4ThemeProvider }  from './V4ThemeProvider'
export { ModuleShell }      from './ModuleShell'
export { DashboardLayout }  from './DashboardLayout'
export { Greeting }         from './Greeting'
export { CoverHero }        from './CoverHero'
export { NextActionCard }   from './NextActionCard'
export { BentoGrid }        from './BentoGrid'
export { StreakPill }        from './StreakPill'
export { RootHover }        from './RootHover'

// Tipos do ModuleShell
export type {
  ModuleShellProps,
  ModuleShellAction,
  ModuleShellHeroKpi,
  ModuleShellSatelliteKpi,
  ModuleShellTab,
  KpiTone,
} from './ModuleShell'

// Tipos compartilhados
export type {
  DashboardData,
  DashboardTheme,
  CoverHeroData,
  CoverAnchorState,
  KpiSatellite,
  DeltaDirection,
  NextActionData,
  DonutSegment,
  MonthBar,
  QueueDay,
  GoalGaugeData,
  TopProduct,
  ActivePrintJob,
  StockAlert,
  StreakData,
} from './types'
