export type ProjectModule = 'finance' | 'crm' | 'inventory' | 'content' | 'operations' | 'decisions'
export type ProjectType = '3d_printing' | 'marketing' | 'business' | 'content_creator'

export const PROJECT_MODULES_BY_TYPE: Record<ProjectType, ProjectModule[]> = {
  '3d_printing':    ['finance', 'operations', 'content', 'decisions'],
  'marketing':      ['finance', 'crm', 'content', 'decisions'],
  'business':       ['finance', 'operations', 'inventory', 'decisions'],
  'content_creator':['finance', 'content', 'decisions'],
}
