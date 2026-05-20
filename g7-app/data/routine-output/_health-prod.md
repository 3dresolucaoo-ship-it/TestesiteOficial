# Health Prod — Hayzer

Registro dos smoke tests diarios. Append a cada execucao.
Espelho local de `Contextos Projetos/07 - Metricas/_Health prod.md` (OneDrive inacessivel em ambiente remoto).

---

## 2026-05-20 06:00 BRT | ALERTA AMARELO

**Status geral**: ALERTA AMARELO
**Rotas**: 3/4 respondendo 200
**Deployment prod**: `09a2adca` — READY (~4.5h de idade)
**Supabase**: health OK | leads=1 | tabelas OK | view search_index AUSENTE
**Performance**: sem dados CWV (API MCP indisponivel)

**Alertas:**
- [SEV 3] `/waitlist` retorna 404 — `app/waitlist/page.tsx` ausente. Captura de leads publica quebrada.
- [SEV 2] View `search_index` ausente no Supabase. Busca interna pode estar afetada.
- [SEV 1] Checkout Calc Pro "temporariamente indisponivel" — aguarda setup Stripe CEO.

**Acao recomendada:** Criar `app/waitlist/page.tsx` ou redirect 301 -> `/#waitlist` antes do soft launch 11/06.

---
