/**
 * services/calcProSubscription.ts
 *
 * Service de assinaturas da Calculadora Pro (SaaS subscription mensal).
 *
 * ADR: decisions/023-calc-pro-freemium-subscription.md
 * Migration: supabase/migrations/20260520_calc_pro_subscriptions.sql
 *
 * Modelo: 1 user = 1 subscription. Trial 7 dias com cartao. R$ 19/mes recurring.
 *
 * Separacao de clientes:
 *   - Leitura por user logado: supabase browser client com RLS
 *     (policy calc_pro_sub_select_own).
 *   - Leitura por email/customer_id (webhook context, sem auth.uid()): admin.
 *   - Escrita (insert/update): SEMPRE admin (RPC upsert_calc_pro_subscription).
 *
 * Status considerado "ativo" = trialing OR active.
 * past_due tambem da acesso (Stripe ainda nao desistiu da cobranca, dunning rodando).
 */

import { supabase }         from '@/lib/supabaseClient'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { serviceError, validateRequired } from '@/lib/serviceError'

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Status possiveis da subscription Stripe.
 * Mesmos valores do Stripe API (mantem fidelidade — nao traduzir).
 *   trialing            — em periodo trial (acesso liberado)
 *   active              — pagando normalmente (acesso liberado)
 *   past_due            — primeira tentativa de cobranca falhou (acesso liberado durante dunning)
 *   canceled            — cancelada definitivamente (acesso negado)
 *   unpaid              — varios retries falharam, Stripe desistiu (acesso negado)
 *   incomplete          — checkout iniciado mas pagamento nao confirmado em 24h (acesso negado)
 *   incomplete_expired  — incomplete expirou (acesso negado)
 *   paused              — pausada manualmente (acesso negado)
 */
export type CalcProSubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'

export interface CalcProSubscription {
  id:                     string
  userId:                 string
  email:                  string
  stripeCustomerId:       string
  stripeSubscriptionId:   string
  stripePriceId:          string | null
  status:                 CalcProSubscriptionStatus
  currentPeriodStart:     string | null
  currentPeriodEnd:       string | null
  trialEnd:               string | null
  cancelAtPeriodEnd:      boolean
  canceledAt:             string | null
  lastEventId:            string | null
  lastEventAt:            string | null
  createdAt:              string
  updatedAt:              string
}

export interface UpsertSubscriptionInput {
  userId:                 string
  email:                  string
  stripeCustomerId:       string
  stripeSubscriptionId:   string
  stripePriceId:          string | null
  status:                 CalcProSubscriptionStatus
  currentPeriodStart:     string | null     // ISO timestamp
  currentPeriodEnd:       string | null
  trialEnd:               string | null
  cancelAtPeriodEnd:      boolean
  canceledAt:             string | null
  lastEventId:            string
}

// ─── Mapeamento DB <> TS ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDB(r: any): CalcProSubscription {
  return {
    id:                   r.id,
    userId:               r.user_id,
    email:                r.email,
    stripeCustomerId:     r.stripe_customer_id,
    stripeSubscriptionId: r.stripe_subscription_id,
    stripePriceId:        r.stripe_price_id ?? null,
    status:               r.status as CalcProSubscriptionStatus,
    currentPeriodStart:   r.current_period_start ?? null,
    currentPeriodEnd:     r.current_period_end ?? null,
    trialEnd:             r.trial_end ?? null,
    cancelAtPeriodEnd:    Boolean(r.cancel_at_period_end),
    canceledAt:           r.canceled_at ?? null,
    lastEventId:          r.last_event_id ?? null,
    lastEventAt:          r.last_event_at ?? null,
    createdAt:            r.created_at,
    updatedAt:            r.updated_at,
  }
}

// ─── Helpers de status ────────────────────────────────────────────────────────

/**
 * Status que dao acesso ao Pro.
 * past_due esta incluido porque Stripe ainda nao desistiu — durante dunning,
 * cliente continua com acesso por ate ~3 semanas. Quando Stripe desiste, status
 * muda pra unpaid ou canceled e o acesso e cortado automaticamente.
 */
const ACTIVE_STATUSES: ReadonlyArray<CalcProSubscriptionStatus> = [
  'trialing',
  'active',
  'past_due',
]

export function isActiveStatus(status: CalcProSubscriptionStatus): boolean {
  return ACTIVE_STATUSES.includes(status)
}

// ─── Queries de leitura (RLS — user logado le a propria row) ─────────────────

/**
 * Retorna a subscription do usuario logado (1 por user devido a UNIQUE constraint).
 * Retorna null se nunca assinou.
 *
 * Usado por /api/calc-pro/status pra responder ao frontend se libera Pro.
 */
export async function getSubscriptionByUserId(
  userId: string,
): Promise<CalcProSubscription | null> {
  validateRequired('calcProSubscriptionService.getSubscriptionByUserId', { userId })

  const { data, error } = await supabase
    .from('calc_pro_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) serviceError('calcProSubscriptionService.getSubscriptionByUserId', error)
  return data ? fromDB(data) : null
}

/**
 * Retorna true se o usuario tem subscription com status ativo (trialing/active/past_due).
 * Atalho semantico pra UI esconder paywall + liberar features Pro.
 */
export async function isActiveSubscription(userId: string): Promise<boolean> {
  const sub = await getSubscriptionByUserId(userId)
  if (!sub) return false
  return isActiveStatus(sub.status)
}

// ─── Queries por email/customer_id (admin context — webhook handler) ─────────

/**
 * Busca subscription por email — usado durante webhook quando ainda nao temos
 * relacao explicita com auth.users.id. O webhook handler resolve user_id por
 * email antes de chamar upsert.
 *
 * USA admin client (service_role) porque eh chamado em webhook context, sem
 * auth.uid() disponivel pra RLS.
 */
export async function getSubscriptionByEmail(
  email: string,
): Promise<CalcProSubscription | null> {
  validateRequired('calcProSubscriptionService.getSubscriptionByEmail', { email })

  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('calc_pro_subscriptions')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  if (error) serviceError('calcProSubscriptionService.getSubscriptionByEmail', error)
  return data ? fromDB(data) : null
}

/**
 * Busca por stripe_customer_id — usado em eventos invoice.* que vem com
 * customer_id mas nao subscription_id explicito no payload.
 */
export async function getSubscriptionByCustomerId(
  stripeCustomerId: string,
): Promise<CalcProSubscription | null> {
  validateRequired('calcProSubscriptionService.getSubscriptionByCustomerId', {
    stripeCustomerId,
  })

  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('calc_pro_subscriptions')
    .select('*')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle()

  if (error) serviceError('calcProSubscriptionService.getSubscriptionByCustomerId', error)
  return data ? fromDB(data) : null
}

// ─── Mutacao via RPC (admin context — webhook handler) ──────────────────────

/**
 * Upsert idempotente da subscription via RPC.
 *
 * USA admin client porque RLS bloqueia INSERT/UPDATE pra authenticated/anon.
 *
 * RPC retorna jsonb: { status: 'ok', id: uuid }.
 * Em conflito por stripe_subscription_id, atualiza a row existente.
 */
export async function upsertSubscription(
  input: UpsertSubscriptionInput,
): Promise<{ id: string }> {
  validateRequired('calcProSubscriptionService.upsertSubscription', {
    userId:               input.userId,
    email:                input.email,
    stripeCustomerId:     input.stripeCustomerId,
    stripeSubscriptionId: input.stripeSubscriptionId,
    status:               input.status,
    lastEventId:          input.lastEventId,
  })

  const admin = getSupabaseAdmin()

  const { data, error } = await admin.rpc('upsert_calc_pro_subscription', {
    p_user_id:                  input.userId,
    p_email:                    input.email.toLowerCase().trim(),
    p_stripe_customer_id:       input.stripeCustomerId,
    p_stripe_subscription_id:   input.stripeSubscriptionId,
    p_stripe_price_id:          input.stripePriceId,
    p_status:                   input.status,
    p_current_period_start:     input.currentPeriodStart,
    p_current_period_end:       input.currentPeriodEnd,
    p_trial_end:                input.trialEnd,
    p_cancel_at_period_end:     input.cancelAtPeriodEnd,
    p_canceled_at:              input.canceledAt,
    p_last_event_id:            input.lastEventId,
  })

  if (error) serviceError('calcProSubscriptionService.upsertSubscription', error)

  // RPC retorna jsonb. supabase-js entrega data como unknown — normalizamos.
  const result = data as { status?: string; id?: string } | null
  if (!result || typeof result.id !== 'string') {
    const detail = JSON.stringify(result ?? null)
    throw new Error(
      `[calcProSubscriptionService.upsertSubscription] RPC retornou payload invalido: ${detail}. Verificar funcao upsert_calc_pro_subscription no Supabase.`,
    )
  }

  return { id: result.id }
}
