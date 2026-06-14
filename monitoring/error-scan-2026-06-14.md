# Error Scan — 2026-06-14

**Horário:** 2026-06-14 22:00 BRT  
**Projeto:** hayzer.com.br (bvaz-hub)  
**Status:** ⚠️ MONITORAMENTO PARCIAL — Vercel 403 (23º dia) + Sentry DSN não conectado

---

## Resultado

| Campo | Valor |
|---|---|
| Deployment uid | Não obtido (Vercel 403) |
| Fonte alternativa | Sentry `hayzer-prod` (acessível) |
| Logs Vercel analisados | 0 |
| Eventos Sentry (24h) | 0 — DSN provavelmente não conectado em prod |
| Erros novos confirmados | **Indeterminado** |
| Issue criada | Nenhuma — issue #23 já aberta (não duplicar) |
| Comentário adicionado | [issue #23 (23º update)](https://github.com/3dresolucaoo-ship-it/TestesiteOficial/issues/23) |

---

## Contexto crítico

**HOJE É O DIA SEGUINTE AO SOFT LAUNCH (13/06).** As primeiras horas com makers reais no sistema estão ocorrendo sem cobertura de monitoramento ativa em nenhuma das duas fontes.

| Métrica | Valor |
|---|---|
| Dias sem monitoramento Vercel | **23** (22/05 → 14/06) |
| Status Sentry | ⚠️ Projeto `hayzer-prod` existe mas 0 eventos — DSN não conectado |
| Dias desde soft launch | 1 (13/06) |
| Dias até launch público | 13 (27/06) |
| Issues abertas sobre o problema | #23 (aberta 22/05, 22 comentários) |

---

## Fontes de monitoramento verificadas

### 1. Vercel API (primária)
```
GET /v6/deployments?projectId=bvaz-hub&target=production
HTTP 403 — {"error":{"code":"forbidden","message":"The request is missing an authentication token"}}
```
`VERCEL_API_TOKEN` ausente no ambiente de execução — 23º dia consecutivo.

### 2. Sentry (alternativa — descoberta hoje)
- **Organização**: `hayzer` → `https://hayzer.sentry.io` (região EU: `https://de.sentry.io`)
- **Projeto**: `hayzer-prod` (encontrado e acessível via MCP)
- **Erros lastSeen:-24h level:error**: 0 resultados
- **Issues firstSeen:-24h**: 0 resultados
- **Issues is:unresolved (todos)**: 0 resultados
- **Causa provável**: CLAUDE.md documenta "Sentry não aplicado (programado 17/06)" e "Discord webhook + Sentry DSN no Vercel — vars commitadas, faltam valores em prod"

**Dashboard Sentry (24h erros):**  
https://hayzer.sentry.io/explore/discover/homepage/?dataset=errors&queryDataset=error-events&query=level%3Aerror&project=4511475541737552&field=title&field=transaction&field=count%28%29&field=lastSeen&sort=-count%28%29&statsPeriod=24h&mode=aggregate&yAxis=count%28%29

---

## Erros Conhecidos

_Nenhum dado — varredura primária (Vercel) falhou por 23 dias consecutivos. Sentry sem eventos (DSN não conectado em prod)._

---

## Ações necessárias (em ordem de prioridade)

1. **[CRÍTICO — hoje]** Configurar `VERCEL_API_TOKEN` no ambiente do agente (ver issue #23)
2. **[CRÍTICO — hoje]** Adicionar `SENTRY_DSN` no Vercel → variables de produção (17/06 planejado, antecipar dado soft launch)
3. Após configurar DSN, verificar que `hayzer-prod` no Sentry começa a receber eventos

---

## Histórico de falhas consecutivas (seleção)

| Data | Status | Fonte |
|---|---|---|
| 22/05 | ❌ Falhou | Issue #23 criada |
| 24/05 | ❌ Falhou | Comentário #23 (3º dia) |
| 01/06 | ❌ Falhou | Comentário #23 (10º dia) |
| 05/06 | ❌ Falhou | Comentário #23 (14º dia) |
| 11/06 | ❌ Falhou | Comentário #23 (20º dia) |
| 12/06 | ❌ Falhou | Comentário #23 (21º dia) |
| 13/06 | ❌ Falhou | Comentário #23 (22º dia — soft launch) |
| **14/06** | ⚠️ **Parcial** | **Sentry acessível mas 0 eventos; Vercel 403 persiste** |

---

_Gerado automaticamente pelo sistema de monitoramento de erros Hayzer._
