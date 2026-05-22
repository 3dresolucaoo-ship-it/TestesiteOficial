# Health Prod — Histórico Smoke Test Hayzer

| Data | Status | Rotas OK | Deployment | Leads | Alertas |
|---|---|---|---|---|---|
| 2026-05-22 | ALERTA AMARELO | 2/4 | 11629c0 (~8h) | 2 | /waitlist 404 (bug ativo) |
| 2026-05-21 | ALERTA AMARELO | 2/4 | — | — | /waitlist 404 detectado pela primeira vez |

---

## 22/05/2026 — 06:00 BRT

**Status: ALERTA AMARELO** | Severity: 2/5

- hayzer.com.br: 200 OK
- /calculadora: 200 OK
- /waitlist: **404** — `app/waitlist/page.tsx` nao existe (bug ativo, dia 2)
- /calculadora/pro: 404 esperado (Calc Pro revogada, decisions/024)

Deployment prod: `dpl_9Tgxou7sh4ELV6MJZywEYhmEUMJR` | SHA `11629c0` | ~8h
Supabase: ACTIVE_HEALTHY | 2 leads | notifications + search_index existem
Runtime errors 24h: 0
Performance: nao disponivel via MCP

**Acao pendente:** Felipe criar `app/waitlist/page.tsx` (blocker soft launch 11/06)

---

## 21/05/2026 — Primeira deteccao

- /waitlist 404 detectado pela primeira vez
- Fonte: smoke-test automatico session 01Fcq2GEFCAXX6K9DhQ23PX1
