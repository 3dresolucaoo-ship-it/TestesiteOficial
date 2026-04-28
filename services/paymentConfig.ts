/**
 * Payment Config Service — server-side only.
 *
 * Manages payment gateway configurations stored in `payment_configs` table.
 * Uses per-merchant in-memory cache (60 s TTL) to avoid querying on every
 * checkout/webhook request. Cache is invalidated on every write.
 *
 * NEVER import this file from a client component.
 *
 * Usage:
 *   - API routes (user session): pass `client` from createServerClient() → uses RLS
 *   - Webhooks / checkout:       omit `client` → falls back to admin (service role key)
 */

import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentProviderName = 'mercadopago' | 'stripe' | 'infinitypay'

/** Full config with raw credentials — server-side only. */
export interface PaymentConfig {
  id:             string
  userId:         string
  provider:       PaymentProviderName
  accessToken:    string
  publicKey?:     string
  webhookSecret?: string
  sandbox:        boolean
  isActive:       boolean
  createdAt:      string
  updatedAt:      string
}

/** Masked config safe to send to the frontend. */
export interface PaymentConfigDisplay {
  id:             string
  userId:         string
  provider:       PaymentProviderName
  accessToken:    string   // e.g. "****8f3a"
  publicKey?:     string   // e.g. "****9b1c"
  webhookSecret?: string   // e.g. "****2d7e"
  sandbox:        boolean
  isActive:       boolean
  createdAt:      string
  updatedAt:      string
}

export interface UpsertPaymentConfigInput {
  /** If provided → UPDATE; if omitted → INSERT. */
  id?:            string
  provider:       PaymentProviderName
  accessToken:    string
  publicKey?:     string
  webhookSecret?: string
  sandbox:        boolean
}

// ─── Cache ────────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 60_000

/** Per-merchant cache: userId → { config | null, timestamp } */
const _cache = new Map<string, { config: PaymentConfig | null; ts: number }>()

function isFresh(entry: { ts: number }): boolean {
  return Date.now() - entry.ts < CACHE_TTL_MS
}

/** Invalidate cache for one merchant (called after every write). */
function invalidateCache(userId: string): void {
  _cache.delete(userId)
}

// ─── DB mapping ───────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDB(r: any): PaymentConfig {
  return {
    id:            r.id,
    userId:        r.user_id,
    provider:      r.provider        as PaymentProviderName,
    accessToken:   r.access_token,
    publicKey:     r.public_key      ?? undefined,
    webhookSecret: r.webhook_secret  ?? undefined,
    sandbox:       r.sandbox,
    isActive:      r.is_active,
    createdAt:     r.created_at,
    updatedAt:     r.updated_at,
  }
}

/** Mask a sensitive string — shows only last 4 chars. */
function mask(value: string | undefined): string | undefined {
  if (!value) return undefined
  return value.length <= 4 ? '****' : `****${value.slice(-4)}`
}

function toDisplay(c: PaymentConfig): PaymentConfigDisplay {
  return {
    ...c,
    accessToken:   mask(c.accessToken)!,
    publicKey:     mask(c.publicKey),
    webhookSecret: mask(c.webhookSecret),
  }
}

/** Returns admin client if no client provided, otherwise uses the given client. */
function resolveClient(client?: SupabaseClient): SupabaseClient {
  return client ?? getSupabaseAdmin()
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const paymentConfigService = {
  /**
   * Returns the active payment config for a merchant.
   * Omit `client` in webhook/checkout contexts (uses admin, bypasses RLS).
   */
  async getActiveConfig(
    userId: string,
    options?: { bypassCache?: boolean; client?: SupabaseClient },
  ): Promise<PaymentConfig | null> {
    if (!options?.bypassCache) {
      const cached = _cache.get(userId)
      if (cached && isFresh(cached)) return cached.config
    }

    const db = resolveClient(options?.client)
    const { data, error } = await db
      .from('payment_configs')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle()

    if (error) {
      console.error('[paymentConfig] getActiveConfig error:', error.message)
      return null
    }

    const config = data ? fromDB(data) : null

    if (!options?.bypassCache) {
      _cache.set(userId, { config, ts: Date.now() })
    }

    if (!config) {
      console.warn(`[paymentConfig] No active config for merchant ${userId}`)
    }

    return config
  },

  /**
   * Lists all configs for a user with sensitive fields masked.
   * Pass `client` from createServerClient() to use RLS (no service role key needed).
   */
  async listForDisplay(userId: string, client?: SupabaseClient): Promise<PaymentConfigDisplay[]> {
    const db = resolveClient(client)
    const { data, error } = await db
      .from('payment_configs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[paymentConfig] listForDisplay error:', error.message)
      return []
    }

    return (data ?? []).map(fromDB).map(toDisplay)
  },

  /**
   * Create or update a payment config.
   * Pass `client` from createServerClient() to use RLS (no service role key needed).
   */
  async upsertConfig(userId: string, input: UpsertPaymentConfigInput, client?: SupabaseClient): Promise<void> {
    const db = resolveClient(client)

    const row = {
      user_id:        userId,
      provider:       input.provider,
      access_token:   input.accessToken,
      public_key:     input.publicKey      ?? null,
      webhook_secret: input.webhookSecret  ?? null,
      sandbox:        input.sandbox,
    }

    let error
    if (input.id) {
      ;({ error } = await db
        .from('payment_configs')
        .update(row)
        .eq('id', input.id)
        .eq('user_id', userId))
    } else {
      ;({ error } = await db
        .from('payment_configs')
        .insert({ ...row, is_active: false }))
    }

    if (error) {
      console.error('[paymentConfig] upsertConfig error:', error.message)
      throw new Error(`Failed to save payment config: ${error.message}`)
    }

    invalidateCache(userId)
  },

  /**
   * Activates one config and deactivates all others for the same merchant.
   * Pass `client` from createServerClient() to use RLS (no service role key needed).
   */
  async setActiveProvider(userId: string, configId: string, client?: SupabaseClient): Promise<void> {
    const db = resolveClient(client)

    const { error } = await db.rpc('set_active_payment_config', {
      p_user_id:   userId,
      p_config_id: configId,
    })

    if (error) {
      console.error('[paymentConfig] setActiveProvider error:', error.message)
      throw new Error(`Failed to set active provider: ${error.message}`)
    }

    invalidateCache(userId)
  },

  /**
   * Permanently deletes a payment config.
   * Pass `client` from createServerClient() to use RLS (no service role key needed).
   */
  async deleteConfig(userId: string, configId: string, client?: SupabaseClient): Promise<void> {
    const db = resolveClient(client)
    const { error } = await db
      .from('payment_configs')
      .delete()
      .eq('id', configId)
      .eq('user_id', userId)

    if (error) {
      console.error('[paymentConfig] deleteConfig error:', error.message)
      throw new Error(`Failed to delete config: ${error.message}`)
    }

    invalidateCache(userId)
  },
}
