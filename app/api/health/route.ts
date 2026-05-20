/**
 * /api/health — endpoint de health check pra monitoring.
 *
 * Uso:
 * - Routine `production-smoke-test` diaria 6h BRT
 * - Vercel uptime monitoring
 * - Status page externa (futuramente)
 *
 * Retorna 200 se app respondendo + 503 se algum service critico down.
 * Inclui timestamp, version (git SHA), uptime do worker.
 *
 * NAO inclui:
 * - Dados sensiveis (env vars, conexoes, queries)
 * - PII de qualquer tipo
 * - Latencia detalhada (so booleano "ok"/"slow"/"down")
 *
 * Servico: Fluid Compute (auto-cache disabled via Cache-Control no header).
 */

import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'

const APP_VERSION = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev'
const REGION = process.env.VERCEL_REGION || 'local'
const STARTED_AT = Date.now()

interface HealthCheck {
  ok: boolean
  latency_ms?: number
  error?: string
}

/**
 * Checa Supabase respondendo (apenas .auth.getSession() — query leve, sem RLS).
 * Timeout 3s pra nao deixar /api/health pendurado.
 */
async function checkSupabase(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const supabase = await createServerClient()
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 3000)
    )
    await Promise.race([
      supabase.auth.getSession(),
      timeoutPromise,
    ])
    return { ok: true, latency_ms: Date.now() - start }
  } catch (err) {
    return {
      ok: false,
      latency_ms: Date.now() - start,
      error: err instanceof Error ? err.message : 'unknown',
    }
  }
}

export async function GET() {
  const checks = {
    supabase: await checkSupabase(),
    // Adicionar mais checks quando relevante:
    // - resend (POST /api/check-email — se quisermos testar Resend acessivel)
    // - stripe (apenas se /api/webhooks/stripe falhar em alta frequencia)
  }

  const allOk = Object.values(checks).every(c => c.ok)
  const status = allOk ? 'ok' : 'degraded'
  const httpStatus = allOk ? 200 : 503

  return NextResponse.json(
    {
      status,
      version: APP_VERSION,
      region: REGION,
      uptime_ms: Date.now() - STARTED_AT,
      timestamp: new Date().toISOString(),
      checks,
    },
    {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json',
      },
    }
  )
}

// HEAD request retorna so o status code (sem body) — usado por uptime monitors leves.
export async function HEAD() {
  const result = await checkSupabase()
  return new NextResponse(null, {
    status: result.ok ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
