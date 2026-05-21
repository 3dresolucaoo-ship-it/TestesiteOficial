
---

## 2026-05-21 06:04 BRT — Smoke Test

**Status: ALERTA AMARELO** (severity 2/5)

| Rota | Status |
|---|---|
| hayzer.com.br | 200 OK |
| /calculadora | 200 OK |
| /waitlist | **404 BUG** |
| /calculadora/pro | 404 esperado |

**Deployment Vercel**: nao verificado (MCP sem aprovacao)
**Supabase health**: nao verificado (MCP sem aprovacao)
**Performance CWV**: nao verificado (MCP sem aprovacao)

**Alertas**:
- `/waitlist` retorna 404 — `app/waitlist/page.tsx` inexistente. Captacao de leads via URL direta quebrada.
- `/calculadora/pro` 404 esperado (Calc Pro revogada 21/05, decisions/024).
- MCPs Vercel + Supabase precisam aprovacao para smoke tests completos.

**Fix prioritario**: criar `app/waitlist/page.tsx` ou redirect para `/#waitlist`.

