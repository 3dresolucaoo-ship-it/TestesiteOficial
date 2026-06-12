# Health Prod — Log Acumulado

> Gerado automaticamente pelo smoke test diario (06:00 BRT).
> Formato: data | status | rotas | deployment prod | leads | alertas

---

## 2026-06-12 — ALERTA AMARELO

**Rotas:** 3/4 OK — /calculadora/pro 404 esperado (ADR-024, 8o dia)
**Deployment prod:** 07cc8c0 (~31h) READY | 5 previews 24h todos READY | 0 erros runtime
**Supabase:** ACTIVE_HEALTHY | SELECT 1 OK | leads: 6 total (0 novos 24h, ultimo 01/06) | notifications OK | search_index OK
**Performance:** N/A (VERCEL_API_TOKEN ausente, 22o dia)
**Contexto:** Soft launch AMANHA 13/06 — sistema verde.

---

## 2026-06-11 — ALERTA AMARELO

**Rotas:** 3/4 OK — /calculadora/pro 404 esperado (ADR-024, 7o dia)
**Deployment prod:** 07cc8c0 (~7h) READY | zero erros em 10 deploys 24h
**Supabase:** health OK | 3 leads waitlist (0 novos) | notifications OK | search_index OK (mudanca positiva)
**Performance:** N/A (VERCEL_API_TOKEN ausente, 21o dia)

---

## 2026-06-10 — ALERTA AMARELO

**Rotas:** 3/4 OK — /calculadora/pro 404 esperado (ADR-024, 6o dia)
**Deployment prod:** 9a062847 (~82h) READY | zero erros em 7 deploys 24h
**Supabase:** health OK | 3 leads (0 novos) | notifications OK | search_index ausente (6o dia)
**Performance:** N/A (VERCEL_API_TOKEN ausente, 20o dia)

---

## 2026-06-09 — ALERTA AMARELO

**Rotas:** 3/4 OK — /calculadora/pro 404 esperado (ADR-024, 5o dia)
**Deployment prod:** 9a062847 (~58h) READY | zero erros em 10 deploys 24h
**Supabase:** health OK | 3 leads (0 novos) | notifications OK | search_index ausente (5o dia)
**Performance:** N/A (VERCEL_API_TOKEN ausente, 19o dia)

---

## Legenda

- **CRITICO** = rota principal down / Supabase inacessivel / deployment com ERROR em producao
- **ALERTA AMARELO** = 404 esperado / token ausente / lag detectado / sem bloqueio real
- **OK** = tudo verde, zero alertas
