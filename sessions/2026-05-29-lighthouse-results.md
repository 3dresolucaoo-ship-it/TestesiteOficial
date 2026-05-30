# Lighthouse Mobile — Resultados 29/05/2026 (pós-deploy `797c149`)

> Run via `lighthouse --form-factor=mobile --throttling-method=simulate --chrome-flags="--headless"`
> JSONs em `audits/lighthouse/runs/2026-05-29/{landing,calculadora}.json`

## Scores

| Métrica | Landing `/` | `/calculadora` | Alvo | Status |
|---|---|---|---|---|
| **Performance** | 53/100 | 53/100 | >75 | 🔴 |
| **Accessibility** | 100/100 | 95/100 | >90 | ✅ |
| **Best Practices** | 96/100 | 96/100 | >85 | ✅ |
| **SEO** | 100/100 | 92/100 | >90 | ✅ |

## Web Vitals

| Métrica | Landing | Calc | Alvo | Diagnóstico |
|---|---|---|---|---|
| **TBT** (Total Blocking Time) | **780 ms** ⬇️ | 2,630 ms 🔴 | <300ms | Landing **78% melhor** (era 3.6s 21/05). Calc ainda crítico |
| **LCP** (Largest Contentful Paint) | 5.9 s 🔴 | 4.1 s 🔴 | <2.5s | Imagem Hero grande + Google Font |
| **FCP** (First Contentful Paint) | 1.2 s ✅ | 1.2 s ✅ | <1.8s | OK |
| **CLS** (Cumulative Layout Shift) | 0 ✅ | 0 ✅ | <0.1 | Perfeito |
| **TTI** (Time to Interactive) | 5.9 s 🔴 | — | <3.8s | User espera 5.9s pra clicar |
| **Speed Index** | 7.2 s 🔴 | 5.4 s 🔴 | <3.4s | Render lento |

## Vitórias confirmadas

- ✅ **TBT landing 3.6s → 780ms** (78% melhora). Commit `38b517e` (LazyMotion + posthog lazy + requestIdleCallback) funcionou de verdade.
- ✅ **Accessibility 100** na landing — wizard onboarding + 7 empty states com `aria-modal` + `role="status"` + focus trap.
- ✅ **SEO 100** landing — robots.txt + sitemap.xml + metadata + OG tags.
- ✅ **CLS 0** — zero layout shift = imagens com `width/height` definidos + fonts com fallback adequado.

## Achados críticos pra atacar (Bloco 5 — 18-25/06)

### 1. LCP landing 5.9s — provavelmente imagem Hero
- **Suspeitos**: `printer-real.jpg` (Bambu A1 do CEO) ou hero background
- **Fix**: preload + WebP + dimensões fixas + `priority` no `next/image`
- **Meta**: LCP < 2.5s

### 2. TBT calc 2.6s — JavaScript blocking
- **Suspeitos**: Zod validation rodando no first paint, lib cálculo grande
- **Fix**: Lazy import Zod schema, dynamic import calc lib, idle callback
- **Meta**: TBT < 300ms

### 3. TTI landing 5.9s — main thread bloqueada
- **Suspeitos**: hydration React 19, framer-motion init, PostHog init
- **Fix**: avaliar React Server Components mais agressivos, defer não-críticos
- **Meta**: TTI < 3.8s

## Pendente medir (precisa cookie auth)

10 rotas internas (/orders, /customers, /finance, /production, /inventory, /products, /crm, /settings, /leads, /catalogos) — script preparado em `audits/lighthouse-runner.ps1` (Ana). Precisa cookie `sb-*-auth-token` colado em `.env.lighthouse.local`.

## Impacto nos pillars

| Pilar | Antes (29/05) | Após Lighthouse | Justificativa |
|---|---|---|---|
| Performance | 7.5 | **7.0** ⬇️ | Score real 53/100 < estimativa 7.5. TBT landing melhorou massivamente, mas LCP 5.9s puxa score pra baixo |
| Acessibilidade | 7.0 | **8.5** ⬆️ | 100/100 confirmado por ferramenta real (era estimativa baseada em código) |
| SEO | (não-listado) | 100 baseline | Não é pilar formal, mas indicador saúde |

CEO ajustar se discordar dos novos números.
