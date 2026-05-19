/**
 * Sentry — configuracao EDGE runtime
 *
 * Usado para: middleware.ts (Next.js Edge Runtime).
 * O middleware Hayzer (middleware.ts) roda em Edge por padrao.
 * Edge runtime tem restricoes: sem Node.js APIs, sem fs, sem crypto nativo.
 *
 * INSTRUCOES DE APLICACAO:
 * Copiar para a raiz do projeto. Ver _sentry-prepared/APPLY.md para passo-a-passo.
 *
 * NAO aplicar antes de 17/06/2026 (ver ADR-017)
 */

import * as Sentry from "@sentry/nextjs";
import type { Event as SentryEvent } from "@sentry/nextjs";

// Scrubbing simplificado para Edge (sem regex flags avancadas para compat)
function scrubEdgeEvent(event: SentryEvent): SentryEvent {
  // No Edge, o principal risco de PII e na URL (redirect com query params)
  if (event.request?.url) {
    try {
      const url = new URL(event.request.url);
      const sensitiveParams = ["email", "cpf", "telefone", "phone", "token"];
      sensitiveParams.forEach((param) => {
        if (url.searchParams.has(param)) {
          url.searchParams.set(param, "[REDACTED]");
        }
      });
      event.request.url = url.toString();
    } catch {
      // ignora URL invalida
    }
  }
  // Remover cookies (tokens Supabase)
  if (event.request?.headers?.cookie) {
    event.request.headers.cookie = "[REDACTED]";
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

  // Edge runtime: amostragem menor por limitacoes de quota
  // Middleware roda em TODA requisicao — 1% ja e estatisticamente significativo
  tracesSampleRate: process.env.VERCEL_ENV === "production" ? 0.01 : 0.1,

  sendDefaultPii: false,

  beforeSend(event) {
    return scrubEdgeEvent(event);
  },
});
