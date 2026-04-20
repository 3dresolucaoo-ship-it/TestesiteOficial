// ─── YouTube Integration Adapter ─────────────────────────────────────────────
// Stub implementation. Wire up YouTube Data API v3 when ready.

export interface YouTubeMetrics {
  videoId:   string
  title:     string
  views:     number
  likes:     number
  comments:  number
  shares:    number
  watchTime: number   // minutes
  date:      string
}

export interface YouTubeConfig {
  apiKey?:     string
  channelId?:  string
  oauthToken?: string
}

let _config: YouTubeConfig = {}

export function configure(config: YouTubeConfig): void {
  _config = { ..._config, ...config }
}

export function isConfigured(): boolean {
  return Boolean(_config.apiKey || _config.oauthToken)
}

export async function connect(): Promise<{ success: boolean; message: string }> {
  if (!isConfigured()) {
    return { success: false, message: 'Configure apiKey ou oauthToken primeiro.' }
  }
  // TODO: Validate key via GET /youtube/v3/channels?mine=true
  return { success: false, message: 'Integração YouTube em breve.' }
}

export async function fetchVideoMetrics(videoId: string): Promise<YouTubeMetrics | null> {
  if (!isConfigured()) return null
  // TODO: GET /youtube/v3/videos?id={id}&part=statistics,snippet
  console.log('[YouTubeAdapter] fetchVideoMetrics →', videoId)
  return null
}

export async function fetchData(videoId?: string): Promise<YouTubeMetrics | null> {
  return fetchVideoMetrics(videoId ?? '')
}

export async function sync(projectId: string): Promise<{ synced: number; errors: string[] }> {
  return syncData(projectId)
}

export async function syncData(projectId: string): Promise<{ synced: number; errors: string[] }> {
  if (!isConfigured()) return { synced: 0, errors: ['Integração não configurada.'] }
  // TODO: Fetch channel uploads playlist, map to ContentItem[], dispatch ADD_CONTENT
  console.log('[YouTubeAdapter] syncData → project', projectId)
  return { synced: 0, errors: ['Integração YouTube em breve.'] }
}
