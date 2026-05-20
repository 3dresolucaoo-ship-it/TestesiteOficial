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
 */

import posthog from 'posthog-js'

let initialized = false

/**
 * Inicializa o PostHog. Chamado UMA vez no PostHogProvider (client-side).
 * No-op em SSR (typeof window === 'undefined') e sem NEXT_PUBLIC_POSTHOG_KEY.
 */
export function initPostHog() {
  if (typeof window === 'undefined') return
  if (initialized) return

  const key  = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

  if (!key) {
    // Dev sem key configurada — silencioso, não polui console em modo dev
    return
  }

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

  initialized = true
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
 * Dispara um evento PostHog. No-op se SDK não inicializado ou SSR.
 * Todas as props passam pelo sanitizeProps automaticamente (via PostHog SDK).
 *
 * @param event  Nome do evento (snake_case, ex: 'waitlist_submit_success')
 * @param props  Propriedades do evento — NUNCA PII diretamente
 */
export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (!initialized) return
  posthog.capture(event, props)
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
  if (!initialized) return
  posthog.identify(email)
}

/**
 * Reseta identificação (logout ou saída de sessão).
 */
export function resetIdentity() {
  if (typeof window === 'undefined') return
  if (!initialized) return
  posthog.reset()
}

export { posthog as posthogClient }
