# Smoke Test — 2026-05-25 06:00 BRT

**Status:** ALERTA AMARELO
**Rotas:** 2/4 respondendo 200
**Deployment prod:** 4de064 (idade: ~32h)
**Supabase:** ACTIVE_HEALTHY

---

## Rotas

| Rota | Status | Nota |
|---|---|---|
| `/` | 200 OK | Normal |
| `/calculadora` | 200 OK | Normal |
| `/waitlist` | **404** | 5o dia consecutivo -- `app/waitlist/page.tsx` inexistente |
| `/calculadora/pro` | 404 | Esperado (decisions/024) |

## Vercel

- Deployment prod: `dpl_DJMUhNu8Kw2iQ36cVhF6jCccKJqp` (SHA `4de064`)
- Estado: READY, target: production
- Idade: ~32h (2026-05-24 01:10 UTC)
- Deployments nas ultimas 24h: 0
- Erros/stuck: nenhum

## Supabase

- Status: ACTIVE_HEALTHY (sa-east-1)
- Health check (SELECT 1): OK
- waitlist_leads: 3 leads
- Tabela `notifications`: EXISTE
- View `search_index`: **NAO EXISTE** (alerta)

## Performance

Indisponivel via MCP. Referencia historica: TBT 3.6s (hero motion + Zod no first paint).

---

## Alertas

### ALERTA 1 -- Severity 3/5
`/waitlist` retorna 404 pelo **5o dia consecutivo** (desde 21/05).
`app/waitlist/page.tsx` simplesmente nao existe no codebase.
**BLOCKER pre-launch 11/06** -- 17 dias restantes.
Acao: criar `app/waitlist/page.tsx` com urgencia.

### ALERTA 2 -- Severity 1/5
View `search_index` ausente no Supabase.
Funcionalidade de busca interna inoperante.
Acao: verificar se migration foi aplicada em prod.

---

## Diagnostico /waitlist

O diretorio `app/waitlist/` existe com `actions.ts` e subdiretorio `obrigado/`,
mas o arquivo `page.tsx` nunca foi criado. A rota retorna 404 desde 21/05
(5 dias). Nao e bug de deploy -- o arquivo realmente nao existe no repositorio
em nenhuma branch rastreada.
