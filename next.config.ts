import type { NextConfig } from "next";

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

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
