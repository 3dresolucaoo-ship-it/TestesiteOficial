# Health Prod — Log Acumulado Smoke Tests

Arquivo de log dos smoke tests diarios (06:00 BRT). Cada entrada eh append-only.

---

## 2026-06-08 — ALERTA AMARELO

**Rotas:** 3/4 respondendo 200
**Deployment prod:** `9a06284` (~42h) — docs ADR-034 — READY
**Supabase:** ACTIVE_HEALTHY — SELECT 1 OK — 3 leads waitlist
**Performance:** N/A (Vercel Analytics sem acesso MCP)

Alertas amarelos (recorrentes):
- `/calculadora/pro` 404 — 4o dia consecutivo — esperado ADR-024 pre-launch
- `search_index` view ausente — recorrente desde 06/06

---

## 2026-06-07 — ALERTA AMARELO

**Rotas:** 3/4 respondendo 200
**Deployment prod:** `9a06284` (~18h) — READY
**Supabase:** health OK — 5 leads 7d — search_index view ausente
**Performance:** N/A

Alertas amarelos (recorrentes):
- `/calculadora/pro` 404 — 3o dia consecutivo — ADR-024
- `search_index` view ausente

---

## 2026-06-06 — ALERTA AMARELO

**Rotas:** 3/4 respondendo 200
**Deployment prod:** `c54ef0a` (~32h) — READY
**Supabase:** health OK — 6 leads waitlist — search_index view ausente
**Performance:** N/A

Alertas amarelos (recorrentes):
- `/calculadora/pro` 404 — 2o dia consecutivo — ADR-024
- `search_index` view ausente
