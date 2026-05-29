# Smoke Test — 2026-05-29

**Horario:** 2026-05-29 06:10 BRT  
**Status:** ALERTA AMARELO  
**Dia consecutivo em alerta:** 9

---

## Rotas (2/4 OK)

| Rota | Status |
|---|---|
| hayzer.com.br | 200 OK |
| /calculadora | 200 OK |
| /waitlist | 404 — DIA 9 |
| /calculadora/pro | 404 — esperado (decision-024) |

## Deployment Vercel

- Ultimo deploy: `dpl_CgsWCHfhXwz32CjpP5hD2h8t95Ni` (~8h, preview, READY)
- 12 deploys nas ultimas 24h: 12 READY, 0 ERROR
- Main nao foi atualizado (todos os deploys sao previews de feature branches)

## Supabase

- Status: ACTIVE_HEALTHY (sa-east-1)
- SELECT 1: OK
- Leads waitlist: 3 (0 novos hoje)
- Table notifications: OK
- View search_index: AUSENTE (dia 9+)

## Performance

Indisponivel — VERCEL_API_TOKEN ausente (issue #23, dia 9).

---

## Issues ativos

1. **/waitlist 404** — severity 3 — dia 9 — fix pronto (feature/ember-destaque-fotos-reais, commit 3806f083) mas PR nao mergeado. BLOCKER soft launch 11/06.
2. **search_index view ausente** — severity 2 — persistente dia 9+.
3. **VERCEL_API_TOKEN ausente** — severity 2 — sem metricas de performance (issue #23).

## Acao recomendada

Mergear PR da feature/ember-destaque-fotos-reais ao main para resolver /waitlist.
Adicionar VERCEL_API_TOKEN nas env vars Vercel (issue #23).
