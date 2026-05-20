/**
 * GET /api/calc-pro/status
 *
 * Retorna o status da subscription Calc Pro do usuario logado.
 *
 * Usado pela /calculadora pra decidir se mostra paywall ou libera features Pro
 * (PDF sem watermark, historico, multi-impressora, USD/EUR).
 *
 * Response (200):
 *   {
 *     active: boolean,            // true = libera Pro (trialing/active/past_due)
 *     status?: string,            // status raw da Stripe (ex: 'trialing', 'active', 'canceled')
 *     trial_end?: string,         // ISO se em trial
 *     period_end?: string,        // ISO do fim do ciclo atual
 *     cancel_at_period_end?: boolean,  // true se cliente clicou cancelar no Portal
 *   }
 *
 * Response (401): usuario nao logado
 *
 * ADR: decisions/023-calc-pro-freemium-subscription.md
 */

import { NextResponse } from 'next/server'
import { getUser }      from '@/lib/auth'
import {
  getSubscriptionByUserId,
  isActiveStatus,
} from '@/services/calcProSubscription'

// Sempre forca server-side render (nao cachear status de subscription).
export const dynamic = 'force-dynamic'

export async function GET() {
  // 1. Auth obrigatorio
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Busca subscription do user logado (RLS garante isolamento)
  try {
    const sub = await getSubscriptionByUserId(user.id)

    if (!sub) {
      // Usuario nunca assinou — versao gratis com 5 calculos/dia
      return NextResponse.json({ active: false })
    }

    return NextResponse.json({
      active:                isActiveStatus(sub.status),
      status:                sub.status,
      trial_end:             sub.trialEnd ?? undefined,
      period_end:            sub.currentPeriodEnd ?? undefined,
      cancel_at_period_end:  sub.cancelAtPeriodEnd,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    console.error(`[/api/calc-pro/status] ${msg}`)
    // Fail-CLOSED: erro de DB nao deve dar acesso Pro indevido. Retorna active=false.
    return NextResponse.json({ active: false, error: 'status_unavailable' }, { status: 200 })
  }
}
