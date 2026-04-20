// ─── Instagram Integration Adapter ───────────────────────────────────────────
// Stub implementation. Wire up Meta Graph API v18+ when ready.

export interface InstagramMetrics {
  postId:   string
  views:    number
  likes:    number
  comments: number
  shares:   number
  saves:    number
  reach:    number
  date:     string
}

export interface InstagramConfig {
  accessToken?:       string
  businessAccountId?: string
}

let _config: InstagramConfig = {}

export function configure(config: InstagramConfig): void {
  _config = { ..._config, ...config }
}

export function isConfigured(): boolean {
  return Boolean(_config.accessToken && _config.businessAccountId)
}

export async function connect(): Promise<{ success: boolean; message: string }> {
  if (!isConfigured()) {
    return { success: false, message: 'Configure accessToken e businessAccountId primeiro.' }
  }
  // TODO: Validate token via GET /me?access_token={token}
  return { success: false, message: 'Integração Instagram em breve.' }
}

export async function fetchMetrics(postId: string): Promise<InstagramMetrics | null> {
  if (!isConfigured()) return null
  // TODO: GET /v18.0/{media-id}/insights?metric=impressions,reach,likes,comments,shares,saved
  console.log('[InstagramAdapter] fetchMetrics →', postId)
  return null
}

export async function fetchData(mediaId?: string): Promise<InstagramMetrics | null> {
  return fetchMetrics(mediaId ?? '')
}

export async function sync(projectId: string): Promise<{ synced: number; errors: string[] }> {
  return syncData(projectId)
}

export async function syncData(projectId: string): Promise<{ synced: number; errors: string[] }> {
  if (!isConfigured()) return { synced: 0, errors: ['Integração não configurada.'] }
  // TODO: Fetch /{account}/media, map to ContentItem[], dispatch ADD_CONTENT
  console.log('[InstagramAdapter] syncData → project', projectId)
  return { synced: 0, errors: ['Integração Instagram em breve.'] }
}
