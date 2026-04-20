// ─── Bling ERP Integration Adapter ───────────────────────────────────────────
// Stub implementation. Wire up Bling API v3 when ready.

export interface BlingOrder {
  id:         string
  number:     string
  clientName: string
  total:      number
  status:     string
  date:       string
  items:      Array<{ description: string; qty: number; unitPrice: number }>
}

export interface BlingProduct {
  id:          string
  code:        string
  description: string
  stockQty:    number
  price:       number
  cost:        number
}

export interface BlingConfig {
  apiKey?:      string
  apiSecret?:   string
  accessToken?: string
}

let _config: BlingConfig = {}

export function configure(config: BlingConfig): void {
  _config = { ..._config, ...config }
}

export function isConfigured(): boolean {
  return Boolean(_config.accessToken || _config.apiKey)
}

export async function connect(): Promise<{ success: boolean; message: string }> {
  if (!isConfigured()) {
    return { success: false, message: 'Configure accessToken ou apiKey primeiro.' }
  }
  // TODO: POST /oauth/token or GET /Api/v3/situacoes/modulos
  return { success: false, message: 'Integração Bling em breve.' }
}

export async function fetchOrders(since?: string): Promise<BlingOrder[]> {
  if (!isConfigured()) return []
  // TODO: GET /Api/v3/pedidos/vendas?dataInicial={since}
  console.log('[BlingAdapter] fetchOrders since', since)
  return []
}

export async function fetchProducts(): Promise<BlingProduct[]> {
  if (!isConfigured()) return []
  // TODO: GET /Api/v3/produtos
  console.log('[BlingAdapter] fetchProducts')
  return []
}

export async function createOrder(order: Omit<BlingOrder, 'id' | 'number'>): Promise<{ success: boolean; blingId?: string; message: string }> {
  if (!isConfigured()) return { success: false, message: 'Integração não configurada.' }
  // TODO: POST /Api/v3/pedidos/vendas
  console.log('[BlingAdapter] createOrder', order)
  return { success: false, message: 'Integração Bling em breve.' }
}

export async function fetchData(since?: string): Promise<BlingOrder[]> {
  return fetchOrders(since)
}

export async function sync(projectId: string): Promise<{ synced: number; errors: string[] }> {
  return syncStock(projectId)
}

export async function syncStock(projectId: string): Promise<{ synced: number; errors: string[] }> {
  if (!isConfigured()) return { synced: 0, errors: ['Integração não configurada.'] }
  // TODO: Sync InventoryItem[] quantities with Bling stock
  console.log('[BlingAdapter] syncStock → project', projectId)
  return { synced: 0, errors: ['Integração Bling em breve.'] }
}
