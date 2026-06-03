# Health Prod — Log Rolling

Smoke tests diarios de producao. Status acumulado.

---

## 2026-06-03 06:00 BRT — ALERTA AMARELO

**Rotas:** 3/4 x 200 (calculadora/pro 404 esperado ADR-024)
**Deploy prod:** c0959ec READY, 41h, fix hydration 15s->3s
**Supabase:** ACTIVE_HEALTHY, 3 leads waitlist, 0 nas ultimas 24h
**notifications table:** OK | **search_index view:** AUSENTE (dia 3)
**Performance:** LCP 5.9s historico (29/05) | VERCEL_API_TOKEN ausente dia 13

Alertas ativos:
- search_index view nao existe (migration pendente em prod?)
- VERCEL_API_TOKEN nao configurado (issue #23, CEO pende 10min)
- LCP 5.9s acima de 4s (Lighthouse bloqueado por env var CEO)

Nenhuma quebra nova. Produto em ar.

---

## 2026-06-02 06:00 BRT — ALERTA AMARELO

(retroativo, baseado em commit `e181f905`)

**Rotas:** 3/4 x 200 (calculadora/pro 404 esperado ADR-024)
**Deploy prod:** c0959ec READY, ~17h no momento
**Supabase:** ACTIVE_HEALTHY, 3 leads waitlist, 0 signups 24h
**notifications table:** OK | **search_index view:** AUSENTE (dia 2)
**Performance:** LCP 5.9s historico | VERCEL_API_TOKEN ausente dia 12
