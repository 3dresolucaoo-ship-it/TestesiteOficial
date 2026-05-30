
---

## Smoke Test 30/05/2026 — 06:00 BRT

**Status: ALERTA AMARELO**

| Rota | Status |
|---|---|
| hayzer.com.br | 200 OK |
| /calculadora | 200 OK |
| /waitlist | INDEFINIDO (10o dia, 404 provavel) |
| /calculadora/pro | 404 ESPERADO (decisao-024) |

**Deployment prod:** `ddc7355` (8.7h) — READY
**Supabase:** ACTIVE_HEALTHY — waitlist_leads: 3, leads CRM: 1
**notifications:** OK | **search_index:** AUSENTE (persistente)
**/api/health:** 403 (fix em feature branch, nao mergeado)

**Performance (Lighthouse 29/05):**
- Landing: LCP 5.9s 🔴, TBT 780ms, CLS 0, Perf 53, A11Y 100
- Calc: LCP 4.1s 🔴, TBT 2.6s 🔴, Perf 53
- Vercel Analytics: indisponivel (VERCEL_API_TOKEN issue #23, 10o dia)

**Alertas ativos:**
1. [S2] /waitlist inacessivel — 10o dia — merge ember→main desbloqueie
2. [S3] /api/health 403 — coberto pelo mesmo merge
3. [S4] search_index view ausente — nao bloqueante
4. [S5] VERCEL_API_TOKEN ausente — issue #23

