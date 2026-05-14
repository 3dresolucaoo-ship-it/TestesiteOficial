/**
 * Waitlist Rate Limit — defesa Tier 1 (Otávio + Bruna).
 *
 * Hash do IP via SHA-256 + salt (LGPD-friendly, IP cru nunca toca o DB).
 * Conta inserts pelo mesmo hash nas últimas 24h.
 *
 * Estratégia: 3 leads/IP/24h. Família compartilhando IP residencial passa,
 * bot tentando floodar morre. Quando precisar de mais robustez (campanha
 * paga, tráfego alto), trocar pra Upstash Redis (env vars já no .env.example).
 */

import { createHash } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const MAX_LEADS_PER_IP_24H = 3
const WINDOW_MS = 24 * 60 * 60 * 1000

/**
 * Hash determinístico de IP — usa salt da env pra impedir lookup reverso.
 * Retorna string truncada (32 chars hex) — suficiente pra unicidade no índice.
 */
export function hashIp(ip: string): string {
  if (!ip || ip === 'unknown') return ''
  const salt = process.env.WAITLIST_IP_SALT || 'bvaz-hub-fallback-salt-troca-em-prod'
  return createHash('sha256')
    .update(`${ip}:${salt}`)
    .digest('hex')
    .slice(0, 32)
}

/**
 * Conta leads inseridos pelo mesmo IP nas últimas 24h.
 * Fail-open: se DB falha, retorna 0 (não bloqueia user real por bug nosso).
 */
export async function countRecentLeadsByIpHash(ipHash: string): Promise<number> {
  if (!ipHash) return 0
  try {
    const admin = getSupabaseAdmin()
    const since = new Date(Date.now() - WINDOW_MS).toISOString()

    const { count, error } = await admin
      .from('waitlist_leads')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', since)

    if (error) {
      console.error('[waitlistRateLimit] count error:', error)
      return 0
    }
    return count ?? 0
  } catch (err) {
    console.error('[waitlistRateLimit] unexpected:', err)
    return 0
  }
}

/**
 * Decide se o IP pode submeter agora.
 * Combina hash + count num único chamado pra simplificar a Server Action.
 */
export async function checkWaitlistIpRateLimit(ip: string): Promise<{
  allowed: boolean
  ipHash: string
  recentCount: number
}> {
  const ipHash = hashIp(ip)
  if (!ipHash) {
    // IP desconhecido — não dá pra rate-limit. Deixa passar (fail-open).
    return { allowed: true, ipHash: '', recentCount: 0 }
  }

  const recentCount = await countRecentLeadsByIpHash(ipHash)
  return {
    allowed: recentCount < MAX_LEADS_PER_IP_24H,
    ipHash,
    recentCount,
  }
}
