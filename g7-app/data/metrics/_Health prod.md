# Health Prod — Hayzer

Log diario de smoke tests automaticos. Append-only.

---

## 2026-06-04 | ALERTA AMARELO

**Rotas:** 3/4 respondendo 200
- hayzer.com.br: OK
- /calculadora: OK
- /waitlist: OK (redireciona para /, esperado)
- /calculadora/pro: 404 (esperado, ADR-024)

**Deploy prod:** `871c70fa` — feat(products): Server Actions writes ADR-031 | READY | ~6h

**Supabase:** ACTIVE_HEALTHY | 3 leads totais | 0 novos 24h | notifications OK | search_index ausente (dia 4)

**Performance:** VERCEL_API_TOKEN ausente dia 14 (issue #23) — sem dados CWV | LCP historico 5.9s (29/05)

**Issues novas:** nenhuma

**Issues persistentes:** search_index ausente (dia 4) | VERCEL_API_TOKEN ausente (dia 14) | LCP 5.9s historico

---
