// ─── Invoice / NF Structure ───────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled'

export interface InvoiceItem {
  description: string
  quantity:    number
  unitPrice:   number
  total:       number    // quantity * unitPrice
}

export interface InvoiceClient {
  name:     string
  email?:   string
  phone?:   string
  document?: string   // CPF/CNPJ
  address?:  string
}

export interface Invoice {
  id:          string
  projectId:   string
  orderId?:    string    // linked BVaz Hub order
  externalId?: string    // Bling NF number or external ERP id
  number:      string    // sequential invoice number
  client:      InvoiceClient
  items:       InvoiceItem[]
  subtotal:    number
  discount:    number
  total:       number
  status:      InvoiceStatus
  issuedAt:    string    // ISO date
  dueAt?:      string
  paidAt?:     string
  notes?:      string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function calcInvoiceTotal(items: InvoiceItem[], discount = 0): number {
  const subtotal = items.reduce((s, i) => s + i.total, 0)
  return Math.max(0, subtotal - discount)
}

export function invoiceFromOrder(
  orderId:   string,
  projectId: string,
  client:    InvoiceClient,
  description: string,
  value:     number,
): Omit<Invoice, 'id' | 'number'> {
  const item: InvoiceItem = { description, quantity: 1, unitPrice: value, total: value }
  return {
    projectId,
    orderId,
    client,
    items:    [item],
    subtotal: value,
    discount: 0,
    total:    value,
    status:   'draft',
    issuedAt: new Date().toISOString().slice(0, 10),
  }
}
