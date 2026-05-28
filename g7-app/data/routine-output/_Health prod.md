# Health Prod - Hayzer

Historico de smoke tests diarios. Append automatico 06h BRT.

---

## 2026-05-28 | ALERTA AMARELO

**Status:** ALERTA AMARELO
**Rotas:** 2/4 OK (`/` e `/calculadora`). `/waitlist` 404 dia 8. `/calculadora/pro` 404 esperado (decision-024).
**Deploy prod:** main @ 4de0641 (~4 dias). Vercel: 2 deploys 24h, todos READY, zero ERROR.
**Supabase:** ACTIVE_HEALTHY. 3 leads. `notifications` OK. `search_index` view AUSENTE (persistente).
**Performance:** indisponivel (VERCEL_API_TOKEN issue #23, dia 8).
**Acao prioritaria:** Mergear PR feature/ember-destaque-fotos-reais -> fix /waitlist. 14 dias pre-soft-launch.

---

## 2026-05-27 | ALERTA AMARELO

**Status:** ALERTA AMARELO
**Rotas:** 2/4 OK. `/waitlist` 404 dia 7. Fix commitado em feature/ember-destaque-fotos-reais (commit 3806f083) aguardando merge.
**Supabase:** ACTIVE_HEALTHY. 1 lead. `search_index` AUSENTE.
**Performance:** indisponivel (issue #23).

---

## 2026-05-26 | ALERTA AMARELO

**Status:** ALERTA AMARELO
**Rotas:** 2/4 OK. `/waitlist` 404 dia 6. Causa raiz: `app/waitlist/page.tsx` inexistente.
**Deploy prod:** main @ 4de0641 (~57h). Vercel todos READY.
**Supabase:** ACTIVE_HEALTHY. 3 leads. `search_index` AUSENTE.
**Performance:** indisponivel (issue #23).
