/**
 * Payment Config Service — server-side only.
 *
 * Manages payment gateway configurations stored in `payment_configs` table.
 * Uses per-merchant in-memory cache (60 s TTL) to avoid querying on every
 * checkout/webhook request. Cache is invalidated on every write.
 *
 * Usage:
 *   - API routes (user session): pass `client` from createServerClient() → uses RLS
 *   - Webhooks / checkout:       omit `client` → falls back to admin (service role key)
 */

import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import type { SupabaseClient } from '@supabase/supabase-js'
import { needsRefresh, refreshMpToken, persistRefreshedTokens } from './mpTokenRefresh'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentProviderName = 'mercadopago' | 'stripe' | 'infinitypay'

/** Full config with raw credentials — server-side only. */
export interface PaymentConfig {
  id:              string
  userId:          string
  provider:        PaymentProviderName
  accessToken:     string
  publicKey?:      string
  webhookSecret?:  string
  refreshToken?:   string
  tokenExpiresAt?: string
  mpUserId?:       string
  sandbox:         boolean
  isActive:        boolean
  createdAt:       string
  updatedAt:       string
}

/** Masked config safe to send to the frontend. */
export interface PaymentConfigDisplay {
  id:              string
  userId:          string
  provider:        PaymentProviderName
  accessToken:     string   // e.g. "****8f3a"
  publicKey?:      string   // e.g. "****9b1c"
  webhookSecret?:  string   // e.g. "****2d7e"
  mpUserId?:       string   // MP account identifier (safe to display)
  hasRefreshToken: boolean  // true if OAuth-connected (not manual token)
  tokenExpiresAt?: string   // ISO date — so UI can warn if near expiry
  sandbox:         boolean
  isActive:        boolean
  createdAt:       string
  updatedAt:       string
}

export interface UpsertPaymentConfigInput {
  id?:            string
  provider:       PaymentProviderName
  accessToken:    string
  publicKey?:     string
  webhookSecret?: string
  sandbox:        boolean
}

export interface UpsertOAuthConfigInput {
  provider:       PaymentProviderName
  accessToken:    string
  refreshToken:   string
  tokenExpiresAt: string
  publicKey?:     string
  mpUserId?:      string
  sandbox:        boolean
}

// ─── Cache ────────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 60_000

const _cache = new Map<string, { config: PaymentConfig | null; ts: number }>()

function isFresh(entry: { ts: number }): boolean {
  return Date.now() - entry.ts < CACHE_TTL_MS
}

function invalidateCache(userId: string): void {
  _cache.delete(userId)
}

// ─── DB mapping ───────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDB(r: any): PaymentConfig {
  return {
    id:              r.id,
    userId:          r.user_id,
    provider:        r.provider        as PaymentProviderName,
    accessToken:     r.access_token,
    publicKey:       r.public_key      ?? undefined,
    webhookSecret:   r.webhook_secret  ?? undefined,
    refreshToken:    r.refresh_token   ?? undefined,
    tokenExpiresAt:  r.token_expires_at ?? undefined,
    mpUserId:        r.mp_user_id      ?? undefined,
    sandbox:         r.sandbox,
    isActive:        r.is_active,
    createdAt:       r.created_at,
    updatedAt:       r.updated_at,
  }
}

function mask(value: string | undefined): string | undefined {
  if (!value) return undefined
  return value.length <= 4 ? '****' : `****${value.slice(-4)}`
}

function toDisplay(c: PaymentConfig): PaymentConfigDisplay {
  return {
    id:              c.id,
    userId:          c.userId,
    provider:        c.provider,
    accessToken:     mask(c.accessToken)!,
    publicKey:       mask(c.publicKey),
    webhookSecret:   mask(c.webhookSecret),
    mpUserId:        c.mpUserId,
    hasRefreshToken: Boolean(c.refreshToken),
    tokenExpiresAt:  c.tokenExpiresAt,
    sandbox:         c.sandbox,
    isActive:        c.isActive,
    createdAt:       c.createdAt,
    updatedAt:       c.updatedAt,
  }
}

function resolveClient(client?: SupabaseClient): SupabaseClient {
  return client ?? getSupabaseAdmin()
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const paymentConfigService = {
  /**
   * Returns the active payment config for a merchant.
   * Auto-refreshes the MP token if it's near expiry and a refresh_token exists.
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

    let config = data ? fromDB(data) : null

    // Auto-refresh MP token if near expiry
    if (
      config &&
      config.provider === 'mercadopago' &&
      config.refreshToken &&
      needsRefresh(config.tokenExpiresAt)
    ) {
      const refreshed = await refreshMpToken(config.refreshToken)
      if (refreshed) {
        await persistRefreshedTokens(config.id, userId, refreshed, resolveClient(options?.client))
        config = {
          ...config,
          accessToken:    refreshed.access_token,
          refreshToken:   refreshed.refresh_token,
          tokenExpiresAt: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
          ...(refreshed.public_key ? { publicKey: refreshed.public_key } : {}),
        }
      }
    }

    if (!options?.bypassCache) {
      _cache.set(userId, { config, ts: Date.now() })
    }

    if (!config) {
      console.warn(`[paymentConfig] No active config for merchant ${userId}`)
    }

    return config
  },

  /** Lists all configs for a user with sensitive fields masked. */
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

  /** Upsert via manual token entry (no OAuth). */
  async upsertConfig(userId: string, input: UpsertPaymentConfigInput, client?: SupabaseClient): Promise<void> {
    const db = resolveClient(client)

    const row = {
      user_id:        userId,
      provider:       input.provider,
      access_token:   input.accessToken,
      public_key:     input.publicKey      ?? null,
      webhook_secret: input.webhookSecret  ?? null,
      sandbox:        input.sandbox,
      // Manual token: clear OAuth fields
      refresh_token:    null,
      token_expires_at: null,
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

  /** Upsert via OAuth flow — stores refresh_token + expiry. */
  async upsertOAuthConfig(userId: string, input: UpsertOAuthConfigInput, client?: SupabaseClient): Promise<void> {
    const db = resolveClient(client)

    const row = {
      user_id:          userId,
      provider:         input.provider,
      access_token:     input.accessToken,
      refresh_token:    input.refreshToken,
      token_expires_at: input.tokenExpiresAt,
      public_key:       input.publicKey  ?? null,
      mp_user_id:       input.mpUserId   ?? null,
      webhook_secret:   null,
      sandbox:          input.sandbox,
    }

    // Upsert on (user_id, provider) unique constraint
    const { error } = await db
      .from('payment_configs')
      .upsert({ ...row, is_active: true }, { onConflict: 'user_id,provider' })

    if (error) {
      console.error('[paymentConfig] upsertOAuthConfig error:', error.message)
      throw new Error(`Failed to save OAuth config: ${error.message}`)
    }

    invalidateCache(userId)
  },

  /** Activates one config and deactivates all others for the same merchant. */
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

  /** Permanently deletes a payment config. */
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
