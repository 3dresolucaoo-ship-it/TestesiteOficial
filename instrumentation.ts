/**
 * instrumentation.ts — ponto de entrada de telemetria do Next.js 16
 *
 * Chamado UMA VEZ no startup do servidor (Node.js ou Edge).
 * Next.js detecta automaticamente este arquivo na raiz do projeto
 * quando `experimental.instrumentationHook` esta habilitado no next.config.ts.
 *
 * Next.js 16 ja suporta Instrumentation Hook sem flag experimental.
 * Referencia: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * INSTRUCOES DE APLICACAO:
 * 1. Copiar este arquivo para a raiz do projeto (ao lado de next.config.ts)
 * 2. Verificar que next.config.ts NAO tem `experimental.instrumentationHook: false`
 *    (Next 16 habilita por padrao, nao precisa setar true)
 * 3. Ver _sentry-prepared/APPLY.md para passo completo
 *
 * NAO aplicar antes de 17/06/2026 (ver ADR-017)
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Node.js runtime: Server Components, API Routes, Server Actions
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime: middleware.ts
    await import("./sentry.edge.config");
  }
}

/**
 * onRequestError — captura erros de request antes de chegar ao error.tsx
 *
 * Disponivel desde Next.js 15.1 (e Next.js 16).
 * Captura erros que normalmente so apareceriam no error.tsx do usuario.
 * Sentry usa isso para rastrear erros 5xx sem precisar de try/catch manual.
 *
 * Referencia: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation#onrequesterror
 */
export const onRequestError = Sentry.captureRequestError;

// Importacao dinamica para nao quebrar o bundle se Sentry nao estiver instalado
import * as Sentry from "@sentry/nextjs";
