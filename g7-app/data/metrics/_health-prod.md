# Health Prod — Hayzer

Log rolling do smoke test diario. Mais recente no topo.

---

## 2026-05-31 06:00 BRT — ALERTA AMARELO

**Rotas:** 3/4 respondendo 200 (1x 404 esperado: /calculadora/pro per ADR-024)
**Deploy prod:** `ddc7355` — main — READY — 32.4h
**Supabase:** ACTIVE_HEALTHY — latencia 4ms — 3 waitlist_leads
**Performance (Lighthouse 29/05):** LCP landing 5.9s / LCP calc 4.1s / TBT calc 2.6s / CLS 0

Alertas ativos (todos conhecidos, nada novo):
- search_index view ausente — dia 11
- LCP > 4s em 2 rotas — previsto Bloco 5 (18-25/06)
- Vercel Analytics sem token — dia 11 (issue #23)

Veredicto: producao estavel. Mesmos amarelos do dia 10.

---

## 2026-05-30 06:00 BRT — ALERTA AMARELO

**Rotas:** 2/4 confirmadas 200 (/ e /calculadora). /waitlist indefinido (provavel 404, 10o dia). /calculadora/pro 404 esperado.
**Deploy prod:** `ddc7355` — READY — 8.7h
**Supabase:** ACTIVE_HEALTHY — 3 waitlist_leads — notifications ok — search_index ausente (dia 10)
**Performance (Lighthouse 29/05):** LCP landing 5.9s / TBT calc 2.6s
**Vercel Analytics:** indisponivel (VERCEL_API_TOKEN — issue #23, dia 10)

