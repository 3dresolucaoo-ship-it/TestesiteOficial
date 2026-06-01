# Health prod — Hayzer

Historico de smoke tests diarios. Atualizado automaticamente 06:00 BRT.

| Data | Status | Rotas OK | Deploy hash | Leads waitlist | Alertas |
|---|---|---|---|---|---|
| 01/06/2026 | ALERTA AMARELO | 3/4 | 9164f8a (~5h) | 3 | /calculadora 403 unauthenticated; search_index ausente (dia 12); LCP 5.9s |

---

## 2026-06-01 06:00 BRT — ALERTA AMARELO

**Rotas:** / OK, /calculadora AMARELO (403 sem auth / 200 autenticado), /waitlist OK, /calculadora/pro 404 esperado
**Deployment prod:** `9164f8a` feat(crm): drag-and-drop kanban — READY, ~5h, 0 erros em 13 deploys 24h
**Supabase:** ACTIVE_HEALTHY, SELECT 1 OK, 3 leads na waitlist (0 novos 24h), notifications OK, search_index ausente
**Performance:** LCP 5.9s landing / 4.1s calc (Lighthouse 29/05, 3 dias atras)

**Alertas:**
1. AMARELO — /calculadora retorna 403 para requests sem auth (possivel regressao fix(auth) madrugada 01/06). Abrir em aba anonima para confirmar.
2. AMARELO — search_index view nao existe (dia 12 consecutivo)
3. AMARELO — LCP 5.9s acima de 4s (TBT fix pendente Bloco 3)
