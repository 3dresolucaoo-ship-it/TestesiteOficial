# Health Prod — Log Acumulado

Smoke test diario 06:00 BRT. Atualizado automaticamente.

---

## 2026-06-13 — ALERTA AMARELO

**Status geral:** ALERTA AMARELO
**Rotas:** 3/4 OK (/calculadora/pro 404 esperado ADR-024, 10o dia)
**Deployment prod:** 07cc8c0 — READY — ~55h (desde 11/06 02:50 UTC)
**Vercel 24h:** 7 deploys preview, todos READY, zero erros
**Supabase:** ACTIVE_HEALTHY — health OK — 6 leads total — notifications OK
**search_index:** AUSENTE em pg_views public (inconsistente com 11-12/06)
**Performance:** N/A — VERCEL_API_TOKEN ausente (23o dia)
**Contexto:** SOFT LAUNCH 13/06 — primeiro dia com usuarios reais

Alertas:
- search_index ausente em public schema (GlobalSearch pode estar degradado)
- Producao 55h sem novo deploy em main (varios PRs preview pendentes)
- VERCEL_API_TOKEN ausente ha 23 dias (Core Web Vitals indisponiveis)

---

## 2026-06-12 — ALERTA AMARELO

**Status geral:** ALERTA AMARELO
**Rotas:** 3/4 OK (/calculadora/pro 404 esperado ADR-024, 9o dia)
**Deployment prod:** 07cc8c0 — READY — ~31h
**Vercel 24h:** 5 deploys preview, todos READY, zero erros
**Supabase:** ACTIVE_HEALTHY — health OK — 6 leads total — notifications OK — search_index OK (via to_regclass)
**Performance:** N/A — VERCEL_API_TOKEN ausente (22o dia)
**Contexto:** 1 dia antes do soft launch 13/06

---

## 2026-06-11 — ALERTA AMARELO

**Status geral:** ALERTA AMARELO
**Rotas:** 3/4 OK (/calculadora/pro 404 esperado ADR-024, 8o dia)
**Deployment prod:** 07cc8c0 — READY — ~7h
**Vercel 24h:** 10 deploys, todos READY, zero erros
**Supabase:** ACTIVE_HEALTHY — health OK — 3 leads waitlist — notifications OK
**search_index:** encontrado via to_regclass (mudanca positiva vs dias anteriores)
**Performance:** N/A — VERCEL_API_TOKEN ausente (21o dia)

---

## 2026-06-10 — ALERTA AMARELO

**Status geral:** ALERTA AMARELO
**Rotas:** 3/4 OK (/calculadora/pro 404 esperado ADR-024, 6o dia)
**Deployment prod:** 9a062847 — READY — ~82h
**Vercel 24h:** 7 deploys, todos READY, zero erros
**Supabase:** ACTIVE_HEALTHY — health OK — 3 leads — notifications OK
**search_index:** AUSENTE (6o dia)
**Performance:** N/A — VERCEL_API_TOKEN ausente (20o dia)

---

## 2026-06-09 — ALERTA AMARELO

**Status geral:** ALERTA AMARELO
**Rotas:** 3/4 OK (/calculadora/pro 404 esperado ADR-024, 5o dia)
**Deployment prod:** 9a062847 — READY — ~58h
**Vercel 24h:** 10 deploys, todos READY, zero erros
**Supabase:** ACTIVE_HEALTHY — health OK — 3 leads — notifications OK
**search_index:** AUSENTE (5o dia)
**Performance:** N/A — VERCEL_API_TOKEN ausente (19o dia)
