/**
 * Sentry — configuracao CLIENT (browser)
 *
 * INSTRUCOES DE APLICACAO (CEO/Ricardo):
 * 1. Copiar este arquivo para a RAIZ do projeto (ao lado de next.config.ts)
 * 2. Instalar: npm install @sentry/nextjs@^10.53.1
 * 3. Adicionar withSentryConfig() no next.config.ts (ver _sentry-prepared/APPLY.md)
 * 4. Setar env vars NEXT_PUBLIC_SENTRY_DSN no Vercel
 *
 * NAO aplicar antes de 17/06/2026 (ver ADR-017)
 * NAO commitar sem env var configurada no Vercel
 */

import * as Sentry from "@sentry/nextjs";
import type { ErrorEvent as SentryEvent } from "@sentry/nextjs";

// Regex para detectar e remover PII antes do envio (LGPD Art. 6)
const PII_PATTERNS: RegExp[] = [
  // Email
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // CPF com ou sem mascara (000.000.000-00 ou 00000000000)
  /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g,
  // Telefone BR (11 digitos com ou sem mascara, com ou sem +55)
  /(\+?55\s?)?(\(?\d{2}\)?\s?)[\d\s-]{8,10}/g,
  // Cartao de credito (PCI DSS)
  /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g,
];

function scrubString(value: string): string {
  let result = value;
  for (const pattern of PII_PATTERNS) {
    // Reset lastIndex para evitar bug com flag /g em loop
    pattern.lastIndex = 0;
    result = result.replace(pattern, "[PII_REDACTED]");
  }
  return result;
}

function scrubEvent(event: SentryEvent): SentryEvent {
  // Scrub URL (query params podem conter email como ?email=...)
  if (event.request?.url) {
    try {
      const url = new URL(event.request.url);
      const sensitiveParams = ["email", "cpf", "telefone", "phone", "name", "nome"];
      sensitiveParams.forEach((param) => {
        if (url.searchParams.has(param)) {
          url.searchParams.set(param, "[REDACTED]");
        }
      });
      event.request.url = url.toString();
    } catch {
      // URL invalida (ex: chrome-extension://...) — ignora
    }
  }

  // Scrub request body (POST com dados do formulario)
  if (event.request?.data) {
    if (typeof event.request.data === "string") {
      event.request.data = scrubString(event.request.data);
    } else if (typeof event.request.data === "object" && event.request.data !== null) {
      // JSON body: scrub recursivo nas folhas string
      event.request.data = JSON.parse(
        scrubString(JSON.stringify(event.request.data))
      );
    }
  }

  // Scrub mensagem de erro (pode conter email em erros de validacao)
  if (event.message) {
    event.message = scrubString(event.message);
  }

  return event;
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Tracking de erros: ativo em producao, silencioso em dev/preview
  enabled: process.env.NODE_ENV === "production",

  // Ambiente: "production" ou "preview" (Vercel seta VERCEL_ENV automaticamente)
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",

  // Versao do release: Vercel injeta VERCEL_GIT_COMMIT_SHA no build
  release: process.env.VERCEL_GIT_COMMIT_SHA
    ? `hayzer@${process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)}`
    : undefined,

  // Performance: 10% de amostragem em producao
  // 1.0 em staging/preview para debug (zero custo de quota em preview)
  tracesSampleRate: process.env.VERCEL_ENV === "production" ? 0.1 : 1.0,

  // Session Replay: DESATIVADO
  // Motivo: dado altamente sensivel (grava interacoes do usuario).
  // Exige decisao explicita sobre consentimento (LGPD).
  // Habilitar apenas apos implementar consentimento de cookies/analytics.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // PII: NAO enviar dados de usuario por padrao (IP, email, etc)
  sendDefaultPii: false,

  // Scrubbing de PII antes do envio (LGPD)
  beforeSend(event) {
    return scrubEvent(event);
  },

  // Ignorar erros conhecidos de terceiros que nao sao bugs nossos
  ignoreErrors: [
    // Chrome extensions
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    // Safari quirks
    "Non-Error promise rejection captured",
    // Erros de rede do usuario (offline, ad-blocker, etc)
    "NetworkError when attempting to fetch resource",
    "Failed to fetch",
    "Load failed",
  ],

  // Filtrar breadcrumbs de console.log em producao (ruido)
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === "console" && breadcrumb.level === "log") {
      return null;
    }
    return breadcrumb;
  },
});
