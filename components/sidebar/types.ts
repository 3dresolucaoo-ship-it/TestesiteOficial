import type { ModulesConfig } from '@/core/admin/config'

export interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

export interface ModuleNavItem extends NavItem {
  key: keyof ModulesConfig
}
