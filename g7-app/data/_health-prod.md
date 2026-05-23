# Health Prod — Hayzer

Registro historico dos smoke tests diarios. Substituto local do OneDrive `Contextos Projetos/07 - Metricas/_Health prod.md`.

---

## 2026-05-23 — ALERTA AMARELO

**Status:** ALERTA AMARELO
**Rotas:** 2/4 sem erro real (1 bug ativo, 1 esperado)

| Rota | Status | Obs |
|---|---|---|
| hayzer.com.br | 200 OK | |
| /calculadora | 200 OK | |
| /waitlist | **404** | BUG DIA 3 — app/waitlist/page.tsx inexistente |
| /calculadora/pro | 404 | ESPERADO — decisions/024 |

**Deployment atual:** `1e67f8e` — READY — ~8h (branch claude/ecstatic-johnson-hVuwz)
**7 deployments nas 24h — todos READY, zero ERROR.**

**Supabase:** ACTIVE_HEALTHY — SELECT 1 OK — 3 leads em `waitlist_leads` — notifications + search_index existem.

**Performance:** nao disponivel via MCP nesta sessao.

**Alerta severity 2:**
`/waitlist` 404 pelo 3° dia consecutivo (desde 21/05). `app/waitlist/page.tsx` nao existe.
BLOCKER para soft launch 11/06. Fix: `git log --all --full-history -- app/waitlist/page.tsx`

**Correcao interna:** tabela correta e `waitlist_leads`, nao `waitlist_entries`. Atualizar smoke test futuro.

---

## 2026-05-22 — ALERTA AMARELO

(Dado do commit `494a2cf`: "/waitlist 404 dia 2, /calculadora/pro 404 esperado, Supabase ACTIVE_HEALTHY, 2 leads, prod `11629c0` READY ~8h.")
