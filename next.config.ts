import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Otávio (Security): cabeçalhos Tier 1 — HSTS, anti-clickjacking, MIME sniffing, referrer.
// Aplicados em todas as rotas via async headers().
const securityHeaders = [
  // HSTS: força HTTPS por 2 anos, inclui subdomínios.
  // Sem 'preload' por enquanto — depende de submeter domínio ao Chromium preload list.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  // Anti-clickjacking: ninguém embuti BVaz Hub em iframe.
  { key: 'X-Frame-Options', value: 'DENY' },
  // Browser não tenta adivinhar tipo MIME (anti XSS via upload).
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Referrer: mantém origem, não vaza path completo cross-site.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Nega APIs sensíveis por padrão (libera depois conforme feature precisar).
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

// ── Content Security Policy — REPORT-ONLY (Otávio 2026-05-17) ────────────────
// OWASP A02:2025 Security Misconfiguration. CSP é defense-in-depth contra XSS:
// mesmo se atacante injetar <script>, browser bloqueia execução se origem não
// estiver na whitelist.
//
// Modo REPORT-ONLY: navegador APENAS reporta violações, não bloqueia. Isso evita
// quebrar produção se alguma origem legítima escapou da whitelist. Monitora-se
// 2-4 semanas no DevTools (Console + Network), ajusta-se, e só então promove
// pra `Content-Security-Policy` (enforcing).
//
// Whitelist atual cobre:
// - 'self' tudo do próprio domínio
// - va.vercel-scripts.com + vitals.vercel-insights.com (Vercel Analytics + Speed Insights)
// - fonts.googleapis.com + fonts.gstatic.com (Geist Sans/Mono carregados via next/font)
// - *.supabase.co (REST + Auth + Storage + Realtime do Supabase)
// - api.mercadopago.com (Checkout MP)
// - api.stripe.com + js.stripe.com (Stripe Elements quando entrar)
// - data: e https: em img-src (imagens Supabase Storage + avatars)
// - frame-ancestors 'none' (defense-in-depth com X-Frame-Options DENY)
// - 'unsafe-inline' em script/style ainda necessário pra Next.js inline runtime
//   + Tailwind utility classes. Pós-launch: migrar pra nonces (`headers()` dinâmico).
// - 'unsafe-eval' só em dev (React reconstrói server stack via eval).
const isDev = process.env.NODE_ENV !== 'production';
const scriptSrcParts: string[] = [
  "'self'",
  "'unsafe-inline'",
  "va.vercel-scripts.com",
  "vitals.vercel-insights.com",
  "js.stripe.com",
  // PostHog (Ana 20/05): SDK + asset CDN. us-assets serve recordings/replays JS.
  "us.i.posthog.com",
  "us-assets.i.posthog.com",
];
if (isDev) scriptSrcParts.splice(2, 0, "'unsafe-eval'");
const scriptSrc = scriptSrcParts.join(' ');

const cspReportOnly = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
  "font-src 'self' fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  // PostHog connect: ingest events + decide flags + assets CDN
  "connect-src 'self' *.supabase.co va.vercel-scripts.com vitals.vercel-insights.com api.mercadopago.com api.stripe.com us.i.posthog.com us-assets.i.posthog.com",
  "frame-src 'self' js.stripe.com checkout.stripe.com www.mercadopago.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join('; ');

const allSecurityHeaders = [
  ...securityHeaders,
  { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: allSecurityHeaders,
      },
    ];
  },
};

// ── Sentry wrapper ───────────────────────────────────────────────────────────
// withSentryConfig habilita:
//   - Source map upload automatico (build time, exige SENTRY_AUTH_TOKEN)
//   - Tunneling pra contornar ad-blockers (rotas /monitoring → Sentry)
//   - Tree-shake de log/debug em prod
//
// Env vars necessarios (todos ja existem no Vercel preview + production):
//   - NEXT_PUBLIC_SENTRY_DSN  → init no browser/server
//   - SENTRY_ORG              → upload source map
//   - SENTRY_PROJECT          → upload source map
//   - SENTRY_AUTH_TOKEN       → upload source map
//
// Aplicado 2026-06-03 (debito ADR 032). Antes desse commit, Sentry funcionava
// MAS sem source map upload (stacktrace em prod ficava minificado/ilegivel).
export default withSentryConfig(nextConfig, {
  org:           process.env.SENTRY_ORG,
  project:       process.env.SENTRY_PROJECT,
  silent:        !process.env.CI,            // suprime log no dev local
  widenClientFileUpload: true,               // sobe ate arquivos shared
  reactComponentAnnotation: { enabled: true }, // marca componente nos erros
  tunnelRoute:   "/monitoring",              // contorna ad-blocker
  disableLogger:  true,                      // tree-shake logs em prod
  automaticVercelMonitors: true,             // expoe Sentry no painel Vercel
  sourcemaps: {
    disable:     false,                      // upload ativo
    deleteSourcemapsAfterUpload: true,       // nao serve .map publico
  },
});
