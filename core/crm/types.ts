export type LeadStatus = 'new' | 'contacted' | 'negotiating' | 'won' | 'lost'
export type ContactSource = 'instagram' | 'whatsapp' | 'facebook' | 'shopee' | 'referral' | 'catalog' | 'other'

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
  catalog:   'Catálogo',
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
  // Golden path #1: lead -> pedido (migration 20260520_leads_converted_order)
  convertedOrderId?: string // ID do pedido criado via "Converter em pedido"
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
