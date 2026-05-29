/**
 * Sentry — configuracao SERVER (Node.js runtime)
 *
 * Usado para: API Routes, Server Components, Server Actions, route handlers.
 * Carregado via instrumentation.ts (register() -> onRequestError hook do Next.js 16).
 *
 * INSTRUCOES DE APLICACAO:
 * Copiar para a raiz do projeto. Ver _sentry-prepared/APPLY.md para passo-a-passo.
 *
 * NAO aplicar antes de 17/06/2026 (ver ADR-017)
 */

import * as Sentry from "@sentry/nextjs";
import type { ErrorEvent as SentryEvent } from "@sentry/nextjs";

const PII_PATTERNS: RegExp[] = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g,
  /(\+?55\s?)?(\(?\d{2}\)?\s?)[\d\s-]{8,10}/g,
  /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g,
];

function scrubString(value: string): string {
  let result = value;
  for (const pattern of PII_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, "[PII_REDACTED]");
  }
  return result;
}

function scrubEvent(event: SentryEvent): SentryEvent {
  if (event.request?.data) {
    if (typeof event.request.data === "string") {
      event.request.data = scrubString(event.request.data);
    } else if (typeof event.request.data === "object" && event.request.data !== null) {
      event.request.data = JSON.parse(
        scrubString(JSON.stringify(event.request.data))
      );
    }
  }
  if (event.message) {
    event.message = scrubString(event.message);
  }
  // Remover headers sensiveis (cookies contem tokens de sessao Supabase)
  if (event.request?.headers) {
    const sensitiveHeaders = ["cookie", "authorization", "x-supabase-auth"];
    sensitiveHeaders.forEach((header) => {
      if (event.request?.headers?.[header]) {
        event.request.headers[header] = "[REDACTED]";
      }
    });
  }
  return event;
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  enabled: process.env.NODE_ENV === "production",

  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",

  release: process.env.VERCEL_GIT_COMMIT_SHA
    ? `hayzer@${process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)}`
    : undefined,

  // Performance server-side: 10% em producao
  // Server-side transactions sao mais caras em quota que client-side
  tracesSampleRate: process.env.VERCEL_ENV === "production" ? 0.1 : 1.0,

  // PII: NAO enviar dados de usuario (IP, headers de auth, etc)
  sendDefaultPii: false,

  beforeSend(event) {
    return scrubEvent(event);
  },

  // Integracoes server: request data + Node.js uncaught exceptions
  // @sentry/nextjs ativa automaticamente:
  // - OnUncaughtException
  // - OnUnhandledRejection
  // - RequestData (sem PII — sendDefaultPii: false)
});
