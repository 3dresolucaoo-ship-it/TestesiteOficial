
---

## Smoke Test 05/06/2026 06:00 BRT

**Status:** ALERTA AMARELO

| Rota | Status |
|---|---|
| hayzer.com.br | 200 OK |
| /calculadora | 200 OK |
| /waitlist | 200 OK |
| /calculadora/pro | 404 (esperado — ADR-024) |

**Deployment prod:** `c54ef0a` | branch main | ~8h | READY  
**Vercel 24h:** 20 deploys, 0 erros  
**Supabase:** health OK | waitlist_leads: 3 registros | notifications: existe | search_index view: **AUSENTE**  
**Performance:** sem dados (Vercel Analytics fora do MCP)

**Alertas:**
- AMARELO: `search_index` view nao existe no Supabase — verificar se pendente de migration
- INFO: /calculadora/pro 404 esperado (Calc Pro revogada ADR-024)

