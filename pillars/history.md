# Hayzer — Histórico de Mudanças de Score por Pilar

> Registra cada mudança de score: data → pilar → score antigo → score novo → razão → ação tomada.
> Permite ver tendência de cada pilar ao longo do tempo.

---

## Formato

```
YYYY-MM-DD | Pilar N (Nome) | X.X → Y.Y | Razão | Ação / Evidência
```

---

## Histórico

### 2026-05-17 — Sessão segurança (Otávio) + APIs Zod + CSP

| Data | Pilar | Antigo | Novo | Razão | Evidência |
|---|---|---|---|---|---|
| 2026-05-17 | P3 Segurança | 8.5 | 9.0 | Tier 1 100% fechado: Zod APIs finance/payment, CSP report-only, rate-limit DB-based, API_RATE_LIMIT_SALT em prod | migration 20260518_api_rate_limits.sql, services/apiSchemas.ts, next.config.ts |
| 2026-05-17 | **MÉDIA** | 7.3 | 7.4 | P3 de 8.5 → 9.0 | — |

### 2026-05-20 — Sessão maratona CEO (~9h, ~109 commits)

| Data | Pilar | Antigo | Novo | Razão | Evidência |
|---|---|---|---|---|---|
| 2026-05-20 | P1 Design | 8.5 | 9.0 | V4 unificado 14 módulos, sidebar ícones Lucide coloridos, KPIs Fraunces, hover petrol, badges semânticos, 5 novas seções landing | feat/v4-shell-recovery, feat/v4-modules-onda2, feat/v4-onda-a, feat/v4-onda-b |
| 2026-05-20 | P2 Anti-IA | 8.5 | 9.0 | Foto real Bambu A1 CEO, 4 SVGs line-art maker, em-dash eliminado, voce→tu, fotos v3-v6, 9 timelapses | 409e672, 6378a91, cebc2c4, c2baaea |
| 2026-05-20 | P4 Performance | 6.5 | 7.0 | WebP -96% (23MB→2.8MB), lottie lazy -150KB, SSR 13→2 queries, posthog lazy, requestIdleCallback | 16e48f7, 0097749, e9ad182, 50212d4 |
| 2026-05-20 | P6 Mobile | 7.0 | 7.5 | 36 WebPs responsive 480/1080/1920w, 5 bugs dashboard V4, 3 bugs landing, skeleton screens | 16e48f7, 66b6db9 |
| 2026-05-20 | P7 Conversão | 5.0 | 6.5 | PostHog ATIVO 7 eventos, social proof dinâmico, CustomerProof+WalletTransform+MakerBeforeAfter (evidência adicional não contada — proposta 7.0 em revisão 25/05) | feat/etapa3-lead-to-order, f3a47f2, 529399c, f4503ea |
| 2026-05-20 | P10 Documentação | 8.0 | 8.5 | 3 ADRs (020-022), CLAUDE.md por pasta, sitemap-images, error-scans | bddc51a, 1ba343a, ad1076e |
| 2026-05-20 | P11 Backend | 7.5 | 8.0 | migration vertical_type, /api/health, posthog service, sanitizer PII, lazy store, skeleton screens, golden path lead→pedido | d748ed6, 66b6db9, feat/etapa3-empty-states |
| 2026-05-20 | P12 Estratégia | 7.5 | 8.0 | 3 ADRs estratégicos (020-022), Doc P3 7/8 decisões CEO, GO Otávio 11/06 | ad1076e |
| 2026-05-20 | **MÉDIA** | 7.4 | 7.7 | 8 pilares subiram | — |

### Propostas em aberto (aguardando validação CEO + Helena)

| Proposta | Pilar | Atual | Proposto | Evidência | Data proposta | Status |
|---|---|---|---|---|---|---|
| P5 +0.2 | P5 Acessibilidade | 6.5 | 6.7 | prefers-reduced-motion global globals.css (2b25c9f), srcset responsive 3 breakpoints | 2026-05-25 | ⏳ aguardando CEO |
| P7 +0.5 | P7 Conversão | 6.5 | 7.0 | CustomerProof + WalletTransform + MakerBeforeAfter (3 seções conversão não contadas no changelog) | 2026-05-25 | ⏳ aguardando CEO + dados PostHog D+7 |

---

*Criado: 2026-05-25 (primeira revisão semanal)*
*Mantido por: sistema de monitoramento + validação CEO + Helena toda segunda 9h*
