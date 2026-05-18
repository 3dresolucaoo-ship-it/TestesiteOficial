/**
 * API Rate Limit — DB-based (Otávio 2026-05-17).
 *
 * Genérico por endpoint. Mesma filosofia do waitlistRateLimit.ts: SHA-256(IP+salt)
 * pra LGPD-friendly (IP cru nunca toca o DB), count em janela deslizante, fail-OPEN
 * (se DB cair, não bloqueia user real).
 *
 * Uso:
 *   import { checkApiRateLimit, getClientIp } from '@/services/apiRateLimit'
 *
 *   const { allowed, retryAfterSec } = await checkApiRateLimit({
 *     endpoint: 'checkout',
 *     ip:       getClientIp(req),
 *     limit:    20,
 *     windowMs: 60_000,
 *   })
 *
 *   if (!allowed) {
 *     return NextResponse.json(
 *       { error: 'Muitas tentativas. Tente novamente em 1 minuto.' },
 *       { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
 *     )
 *   }
 *
 * Migration: 20260518_api_rate_limits.sql
 * Env var:   API_RATE_LIMIT_SALT (32+ chars random hex em prod, fallback dev)
 *
 * Pós-launch: trocar pra Upstash Redis quando passar de ~5k req/dia (latência
 * 5-20ms → 1ms + zero pressão no Supabase).
 */

import { createHash } from 'crypto'
import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extrai IP do request. Vercel: `x-forwarded-for` (primeiro IP é o real do user).
 * Fallback: 'unknown' (vai retornar fail-open no service abaixo).
 */
export function getClientIp(req: NextRequest): string {
  const fwd  = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  return 'unknown'
}

/**
 * Hash determinístico de IP — usa salt da env pra impedir lookup reverso.
 * 32 chars hex (suficiente pra unicidade no índice).
 */
export function hashIpForRateLimit(ip: string): string {
  if (!ip || ip === 'unknown') return ''
  const salt =
    process.env.API_RATE_LIMIT_SALT ||
    process.env.WAITLIST_IP_SALT ||
    'hayzer-api-fallback-salt-troca-em-prod'
  return createHash('sha256')
    .update(`${ip}:${salt}`)
    .digest('hex')
    .slice(0, 32)
}

// ── Core ─────────────────────────────────────────────────────────────────────

interface RateLimitInput {
  /** Identificador lógico do endpoint (ex: 'checkout', 'encomenda', 'quote') */
  endpoint: string
  /** IP cru do client (vindo de getClientIp) */
  ip: string
  /** Máximo de tentativas permitidas na janela */
  limit: number
  /** Tamanho da janela em milissegundos */
  windowMs: number
}

interface RateLimitResult {
  allowed:        boolean
  recentCount:    number
  /** Segundos sugeridos pra header Retry-After quando bloqueado */
  retryAfterSec:  number
}

/**
 * Checa se o IP pode requisitar agora.
 *
 * Fail-OPEN: se DB falhar, retorna allowed=true (não bloqueia user real por
 * bug nosso). Mesma escolha do waitlistRateLimit.ts.
 *
 * Side-effect: SEM auto-insert. O caller decide quando logar (via recordApiHit).
 * Isso permite contar só requests "validamente entrados", evitando que o próprio
 * bloqueio infle o contador na janela seguinte.
 */
export async function checkApiRateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  const { endpoint, ip, limit, windowMs } = input
  const ipHash = hashIpForRateLimit(ip)

  if (!ipHash) {
    // IP desconhecido (proxy mal configurado) — fail-open
    return { allowed: true, recentCount: 0, retryAfterSec: 0 }
  }

  try {
    const admin = getSupabaseAdmin()
    const since = new Date(Date.now() - windowMs).toISOString()

    const { count, error } = await admin
      .from('api_rate_limits')
      .select('id', { count: 'exact', head: true })
      .eq('endpoint', endpoint)
      .eq('ip_hash', ipHash)
      .gte('created_at', since)

    if (error) {
      // Fail-OPEN — log + libera
      console.error('[apiRateLimit] count error:', error.message)
      return { allowed: true, recentCount: 0, retryAfterSec: 0 }
    }

    const recentCount   = count ?? 0
    const allowed       = recentCount < limit
    const retryAfterSec = allowed ? 0 : Math.ceil(windowMs / 1000)

    return { allowed, recentCount, retryAfterSec }
  } catch (err) {
    console.error('[apiRateLimit] unexpected:', err)
    return { allowed: true, recentCount: 0, retryAfterSec: 0 }
  }
}

/**
 * Registra a tentativa (insert na tabela). Chame DEPOIS de validar o request
 * (Zod ok, etc.) pra não inflar contador com payloads inválidos.
 *
 * Fail-silent: se DB cair, request continua. Logging serve pra observabilidade,
 * não bloqueia fluxo.
 */
export async function recordApiHit(params: {
  endpoint: string
  ip: string
  meta?: Record<string, unknown>
}): Promise<void> {
  const ipHash = hashIpForRateLimit(params.ip)
  if (!ipHash) return

  try {
    const admin = getSupabaseAdmin()
    const { error } = await admin.from('api_rate_limits').insert({
      endpoint: params.endpoint,
      ip_hash:  ipHash,
      meta:     params.meta ?? {},
    })
    if (error) {
      console.error('[apiRateLimit] record error:', error.message)
    }
  } catch (err) {
    console.error('[apiRateLimit] record unexpected:', err)
  }
}

/**
 * Helper de conveniência: check + record em 1 chamada.
 *
 * Retorna `{ allowed, retryAfterSec }`. Se allowed=true, já registrou o hit;
 * se allowed=false, NÃO registra (não infla janela seguinte).
 *
 * Use em rotas simples onde não precisa filtrar antes de registrar.
 */
export async function enforceApiRateLimit(input: RateLimitInput): Promise<{
  allowed: boolean
  retryAfterSec: number
  recentCount: number
}> {
  const result = await checkApiRateLimit(input)
  if (result.allowed) {
    // Fire-and-forget: o insert não bloqueia a resposta
    void recordApiHit({ endpoint: input.endpoint, ip: input.ip })
  }
  return result
}
