export type LeadStatus = 'new' | 'contacted' | 'negotiating' | 'won' | 'lost'
export type ContactSource = 'instagram' | 'whatsapp' | 'facebook' | 'shopee' | 'referral' | 'other'

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new:         'Novo',
  contacted:   'Contatado',
  negotiating: 'Negociando',
  won:         'Ganho',
  lost:        'Perdido',
}

export const CONTACT_SOURCE_LABELS: Record<ContactSource, string> = {
  instagram: 'Instagram',
  whatsapp:  'WhatsApp',
  facebook:  'Facebook',
  shopee:    'Shopee',
  referral:  'Indicação',
  other:     'Outro',
}

export interface Lead {
  id: string
  projectId: string
  name: string
  contact: string
  source: ContactSource
  status: LeadStatus
  value: number
  notes: string
  date: string
  // Extended CRM fields
  lastContactAt?: string    // ISO date of last follow-up
  expectedValue?: number    // refined deal value
  assignedTo?:    string    // team member name/id
}

export interface Affiliate {
  id: string
  projectId: string
  name: string
  platform: string
  code: string
  totalSales: number
  commission: number
  status: 'active' | 'inactive'
  date: string
}
