# Error Scan — 2026-05-21

**Horário:** 22h BRT (job diário)
**Ambiente:** Produção · hayzer.com.br · Vercel project `bvaz-hub`
**Status:** ❌ FALHA — token inválido

---

## Resultado

| Item | Valor |
|---|---|
| API Vercel | `403 Forbidden` |
| Token presente | Não |
| Logs analisados | 0 |
| Erros novos | N/A (não foi possível verificar) |
| Issue criada | [#17 — [infra] VERCEL_API_TOKEN invalido — renovar](https://github.com/3dresolucaoo-ship-it/TestesiteOficial/issues/17) |

---

## Motivo da falha

`VERCEL_API_TOKEN` ausente ou inválido no ambiente de execução.
A API retornou HTTP 403 no endpoint:
```
GET https://api.vercel.com/v6/deployments?projectId=bvaz-hub&limit=5&target=production
```

## Ação necessária

Renovar `VERCEL_API_TOKEN` (ver Issue #17) e re-executar o job.

---

## Erros conhecidos (semana anterior)

_Nenhum relatório anterior encontrado — esta é a primeira execução._

---

## Próxima execução

2026-05-22 22h BRT — exige token válido para funcionar.
