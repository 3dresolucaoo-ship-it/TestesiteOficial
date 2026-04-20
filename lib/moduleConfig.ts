import { TrendingUp, Users, Package, Video, Printer, Lightbulb } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ProjectModule } from '@/lib/types'

export interface ModuleConfig {
  label: string
  icon: LucideIcon
  href: (projectId: string) => string
}

export const MODULE_CONFIG: Record<ProjectModule, ModuleConfig> = {
  finance:    { label: 'Finanças',  icon: TrendingUp, href: id => `/projects/${id}/finance` },
  crm:        { label: 'CRM',       icon: Users,      href: id => `/projects/${id}/crm` },
  inventory:  { label: 'Estoque',   icon: Package,    href: id => `/projects/${id}/inventory` },
  content:    { label: 'Conteúdo',  icon: Video,      href: id => `/projects/${id}/content` },
  operations: { label: 'Operação',  icon: Printer,    href: id => `/projects/${id}/operations` },
  decisions:  { label: 'Decisões',  icon: Lightbulb,  href: id => `/projects/${id}/decisions` },
}

export const PROJECT_COLORS: Record<string, string> = {
  p1: '#7c3aed',
  p2: '#f59e0b',
  p3: '#3b82f6',
  p4: '#10b981',
}

export function getProjectColor(project: { id: string; color?: string }): string {
  return project.color ?? PROJECT_COLORS[project.id] ?? '#7c3aed'
}
