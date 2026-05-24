# Health Prod — Log Continuo

Append-only. Smoke test diario 06:00 BRT.
Equivalente local do `07 - Metricas/_Health prod.md` (OneDrive nao acessivel em container remoto).

---

## 2026-05-24 — ALERTA AMARELO

**Rotas:** 2/4 respondendo 200
**Prod deployment:** `4de064` (age ~8h, READY)
**Supabase:** ACTIVE_HEALTHY, 3 leads na waitlist_leads

| Rota | Status |
|---|---|
| hayzer.com.br | 200 OK |
| /calculadora | 200 OK |
| /waitlist | 404 (DIA 4 - BLOCKER launch) |
| /calculadora/pro | 404 (esperado - decisions/024) |

**Alertas:**
- **(3) /waitlist 404 - 4o dia consecutivo desde 21/05. app/waitlist/page.tsx inexistente. BLOCKER soft launch 11/06.**
- (2) View `search_index` ausente no schema public. Smoke 23/05 havia reportado OK - inconsistencia a investigar.

**Performance:** indisponivel via MCP

---
