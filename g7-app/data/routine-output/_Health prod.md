# Health Prod — Hayzer

Append diario do smoke test 06h BRT. Status mais recente no topo.

---

## 2026-05-27 — ALERTA AMARELO

| Rota | Status |
|---|---|
| hayzer.com.br | 200 OK |
| /calculadora | 200 OK |
| /waitlist | 404 (dia 7 consecutivo) |
| /calculadora/pro | 404 (esperado — decision-024) |

**Vercel**: todos READY (20 deploys nas ultimas 40h, zero ERROR). Prod hash `4de0641` ~76h. Fix /waitlist na branch `feature/ember-destaque-fotos-reais` (commit `3806f083`) aguardando merge ao main.

**Supabase**: ACTIVE_HEALTHY. SELECT 1 OK. Leads: 1. notifications: presente. search_index view: ausente (persistente).

**Performance**: indisponivel (VERCEL_API_TOKEN ausente, issue #23, dia 7).

**Alertas ativos**:
- /waitlist 404 -- 7o dia. BLOCKER soft launch 11/06 (15 dias). Fix ja existe, merge pendente.
- search_index view inexistente.

---

## 2026-05-26 — ALERTA AMARELO

| Rota | Status |
|---|---|
| hayzer.com.br | 200 OK |
| /calculadora | 200 OK |
| /waitlist | 404 (dia 6 consecutivo) |
| /calculadora/pro | 404 (esperado) |

Vercel: todos READY. Prod main 4de0641 ~57h. Supabase: OK, 3 leads. search_index view ausente. Performance: indisponivel (issue #23).

---

_Arquivo criado em 27/05/2026. Append automatico pelo smoke test diario._
