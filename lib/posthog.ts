/**
 * PostHog — analytics client + event helpers.
 *
 * Configuração LGPD-safe:
 *   - autocapture: false   → só eventos manuais (zero coleta acidental de PII)
 *   - person_profiles: 'identified_only' → não cria profile pra anônimo (reduz custo)
 *   - session_recording: false           → session replay desligado (decisão CEO pendente)
 *   - capture_pageview: false            → pageviews manuais (só onde queremos medir)
 *
 * Identificação (LGPD):
 *   - posthog.identify(email) só após consent_lgpd=true
 *   - Antes: usuário anônimo (distinct_id gerado pelo SDK)
 *   - NUNCA enviar nome, whatsapp, CPF — só metadados comportamentais
 *
 * Uso:
 *   import { track, identify } from '@/lib/posthog'
 *   track('calculadora_calculated', { filamento: 110, peso: 100 })
 *   identify('user@email.com')
 *
 * Performance (TBT fix 2026-05-20):
 *   posthog-js NÃO é importado estático aqui. Dynamic import lazy via
 *   _getSDK() — o bundle (~50KB) só é baixado quando initPostHog() roda
 *   (PostHogProvider, via useEffect, após hidratação). Nunca bloqueia first paint.
 */

// Sem import estático de posthog-js — lazy load no _getSDK()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PostHogSDK = any

let _sdk: PostHogSDK | null = null
let _initPromise: Promise<void> | null = null

/**
 * Carrega o SDK posthog-js de forma lazy (dynamic import).
 * Retorna a instância já inicializada, ou null se SSR / sem key.
 */
async function _getSDK(): Promise<PostHogSDK | null> {
  if (typeof window === 'undefined') return null
  if (_sdk) return _sdk
  if (_initPromise) {
    await _initPromise
    return _sdk
  }
  return null
}

/**
 * Sanitiza propriedades antes de enviar ao PostHog.
 * Remove qualquer campo suspeito de PII passado acidentalmente.
 * Campos bloqueados: email, name, nome, phone, telefone, whatsapp, cpf, document.
 */
function sanitizeProps(
  properties: Record<string, unknown>,
  _event_name: string
): Record<string, unknown> {
  const PII_KEYS = ['email', 'name', 'nome', 'phone', 'telefone', 'whatsapp', 'cpf', 'document', 'senha', 'password']
  const safe: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(properties)) {
    if (PII_KEYS.includes(k.toLowerCase())) continue
    safe[k] = v
  }
  return safe
}

/**
 * Inicializa o PostHog. Chamado UMA vez no PostHogProvider (client-side).
 * No-op em SSR (typeof window === 'undefined') e sem NEXT_PUBLIC_POSTHOG_KEY.
 *
 * Usa dynamic import: posthog-js só entra no bundle quando este módulo
 * de fato inicializa (via useEffect), nunca no first paint.
 */
export function initPostHog() {
  if (typeof window === 'undefined') return
  if (_sdk || _initPromise) return

  const key  = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

  if (!key) {
    // Dev sem key configurada — silencioso, não polui console em modo dev
    return
  }

  _initPromise = import('posthog-js').then(({ default: posthog }) => {
    posthog.init(key, {
      api_host:              host,
      autocapture:           false,   // LGPD: zero coleta acidental de PII de DOM
      capture_pageview:      false,   // Pageviews manuais — só onde queremos funil
      capture_pageleave:     false,
      // Session replay desativado por padrao (decisao LGPD pendente CEO).
      // Quando ativar futuramente, voltar com config { maskAllInputs: true, maskTextSelector: '*' }.
      disable_session_recording: true,
      person_profiles:       'identified_only', // não cria profile pra visitante anônimo
      sanitize_properties:   sanitizeProps,
    })
    _sdk = posthog
  }).catch(() => {
    // Falha silenciosa — analytics não é crítico pro fluxo do usuário
  })
}

/**
 * Dispara um evento PostHog. No-op se SDK não inicializado ou SSR.
 * Fire-and-forget: não bloqueia o caller (track é chamado em handlers de UI).
 * Todas as props passam pelo sanitizeProps automaticamente (via PostHog SDK).
 *
 * @param event  Nome do evento (snake_case, ex: 'waitlist_submit_success')
 * @param props  Propriedades do evento — NUNCA PII diretamente
 */
export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  // Fire-and-forget: se SDK ainda não carregou, fila interna do posthog
  // não existe aqui — perdemos o evento. Aceitável: eventos de UI (click)
  // só disparam após interação do user, que ocorre bem depois da hidratação.
  _getSDK().then((sdk) => {
    if (!sdk) return
    sdk.capture(event, props)
  }).catch(() => { /* silencioso */ })
}

/**
 * Identifica o usuário SOMENTE após consent_lgpd=true.
 * Chama posthog.identify com email como distinct_id.
 * Não passa nome, telefone ou qualquer dado adicional aqui.
 *
 * @param email   Email do usuário (identificador único)
 */
export function identify(email: string) {
  if (typeof window === 'undefined') return
  _getSDK().then((sdk) => {
    if (!sdk) return
    sdk.identify(email)
  }).catch(() => { /* silencioso */ })
}

/**
 * Reseta identificação (logout ou saída de sessão).
 */
export function resetIdentity() {
  if (typeof window === 'undefined') return
  _getSDK().then((sdk) => {
    if (!sdk) return
    sdk.reset()
  }).catch(() => { /* silencioso */ })
}

/**
 * Acesso direto ao SDK (para casos avançados que precisam da instância).
 * Retorna null se SDK não inicializado ainda.
 * @deprecated Prefira as funções track/identify/resetIdentity.
 */
export function getPostHogClient(): PostHogSDK | null {
  return _sdk
}
