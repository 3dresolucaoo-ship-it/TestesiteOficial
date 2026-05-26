# Health Prod — Hayzer

Arquivo gerado automaticamente pela rotina smoke-test diaria.
OneDrive path original: `~/OneDrive/Documentos/Contextos Projetos/07 - Metricas/_Health prod.md`
Nota: arquivo espelhado no repo para sessoes remotas sem acesso ao OneDrive local.

---

## 2026-05-26 | ALERTA AMARELO

**Rotas**: 2/4 OK
- hayzer.com.br: 200 OK
- /calculadora: 200 OK
- /waitlist: 404 (6o dia consecutivo -- page.tsx AUSENTE, BLOCKER launch)
- /calculadora/pro: 404 esperado (decision-024)

**Vercel**: todos READY. Prod main `4de0641` (~57h). Sem ERROR.
**Supabase**: ACTIVE_HEALTHY. 3 leads. notifications ok. search_index view AUSENTE.
**Performance**: indisponivel (VERCEL_API_TOKEN ausente, issue #23, 6o dia).

Acao urgente: criar `app/waitlist/page.tsx` — 16 dias pro soft launch.

---

## 2026-05-25 | ALERTA AMARELO

**Rotas**: 2/4 OK
- /waitlist: 404 (5o dia consecutivo)
- /calculadora/pro: 404 esperado

**Vercel**: zero deployments nas ultimas 24h. Prod `4de064` ~32h. Todos READY.
**Supabase**: ACTIVE_HEALTHY. 3 leads. notifications ok. search_index AUSENTE.
**Performance**: indisponivel (VERCEL_API_TOKEN ausente, issue #23, 5o dia).

_(fonte: commit `aff04a8` — smoke-test 25/05)_

---
