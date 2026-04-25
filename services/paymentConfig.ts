/**
 * Payment Config Service — server-side only.
 *
 * Manages payment gateway configurations stored in `payment_configs` table.
 * Uses per-merchant in-memory cache (60 s TTL) to avoid querying on every
 * checkout/webhook request. Cache is invalidated on every write.
 *
 * NEVER import this file from a client component — it uses the admin client
 * (service role key) and exposes raw credentials internally.
 */

import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

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

// ─── Service ──────────────────────────────────────────────────────────────────

export const paymentConfigService = {
  /**
   * Returns the active payment config for a merchant.
   *
   * @param userId      - merchant's user_id
   * @param bypassCache - when true, skips the 60 s cache and queries the DB
   *                      directly. Use in webhook handlers to avoid stale creds.
   *
   * Returns null if no active config — caller should fall back to env vars.
   */
  async getActiveConfig(
    userId: string,
    options?: { bypassCache?: boolean },
  ): Promise<PaymentConfig | null> {
    if (!options?.bypassCache) {
      const cached = _cache.get(userId)
      if (cached && isFresh(cached)) return cached.config
    }

    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('payment_configs')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle()

    if (error) {
      console.error('[paymentConfig] getActiveConfig error:', error.message)
      // Don't cache errors — next request will retry the DB
      return null
    }

    const config = data ? fromDB(data) : null

    // Only populate cache on normal (non-bypass) reads
    if (!options?.bypassCache) {
      _cache.set(userId, { config, ts: Date.now() })
    }

    if (!config) {
      console.warn(`[paymentConfig] No active config for merchant ${userId} — caller should use env fallback`)
    }

    return config
  },

  /**
   * Lists all configs for a user with sensitive fields masked.
   * Safe to return from an API route to the frontend.
   */
  async listForDisplay(userId: string): Promise<PaymentConfigDisplay[]> {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin
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
   * On UPDATE: only updates credential/sandbox fields — is_active is untouched.
   * Invalidates cache after write.
   */
  async upsertConfig(userId: string, input: UpsertPaymentConfigInput): Promise<void> {
    const admin = getSupabaseAdmin()

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
      ;({ error } = await admin
        .from('payment_configs')
        .update(row)
        .eq('id', input.id)
        .eq('user_id', userId))
    } else {
      // New config starts inactive — admin must explicitly activate it
      ;({ error } = await admin
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
   *
   * Delegates to the `set_active_payment_config` Postgres function which runs
   * both UPDATEs inside a single transaction — no intermediate inconsistent
   * state and no partial-index violation window.
   *
   * Raises if configId does not belong to userId (enforced in the DB function).
   * Invalidates cache after write.
   */
  async setActiveProvider(userId: string, configId: string): Promise<void> {
    const admin = getSupabaseAdmin()

    const { error } = await admin.rpc('set_active_payment_config', {
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
   * If the deleted config was active, no config is active afterwards — caller
   * should prompt the admin to activate another one.
   * Invalidates cache after write.
   */
  async deleteConfig(userId: string, configId: string): Promise<void> {
    const admin = getSupabaseAdmin()
    const { error } = await admin
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
