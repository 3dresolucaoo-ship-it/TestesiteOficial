# Health Log — Hayzer Prod

Log rolling dos smoke tests diários. Ultima entrada = mais recente.
Formato: `DATA | STATUS | ROTAS | DEPLOY | SUPABASE | LCP | NOTAS`

---

## 2026-06-02 06:00 BRT

**Status: ALERTA AMARELO**

| Metric | Valor |
|---|---|
| Rotas | 3/4 OK (calculadora/pro 404 esperado) |
| API /health | 200 OK, Supabase 6ms |
| Deploy prod | `dpl_5eLHyzHxsjwuu45ioqbKJ44ZgpuP` · `c0959ec` · 17h · READY |
| Commit prod | fix(store): timeout hydration 15s->3s |
| Deploys 24h | 5 READY, 0 ERROR |
| Supabase | ACTIVE_HEALTHY, 3 waitlist_leads, 0 novos 24h |
| notifications | OK (tabela existe) |
| search_index | AUSENTE (dia 2 rastreamento) |
| LCP | 5.9s (Lighthouse 29/05, > threshold 4s) |
| INP/CLS | indisponível (VERCEL_API_TOKEN ausente, dia 12) |

**Alertas amarelos:**
- PERF-01: LCP 5.9s > 4s. Fix parcial: hydration timeout 3s aplicado 02/06. Bloco 5: TBT fix pendente.
- DB-01: search_index view ausente. Sem bloqueio critico pre-launch.
- INFRA-01: VERCEL_API_TOKEN ausente — sem Vercel Analytics. Dia 12.

---

## 2026-06-01 06:00 BRT

**Status: ALERTA AMARELO**

3/4 rotas respondendo 200. /calculadora retornava 403 sem auth (possivel regressao fix auth 01/06 madrugada).
/calculadora/pro 404 esperado (ADR-024).
Deploy prod 9164f8a (feat: drag-drop CRM), READY, ~5h, 0 erros em 13 deploys 24h.
Supabase ACTIVE_HEALTHY, 3 waitlist_leads, notifications OK, search_index ausente (dia 1).
LCP 5.9s (Lighthouse 29/05).

---
