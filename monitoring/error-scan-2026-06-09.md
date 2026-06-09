# Error Scan — 2026-06-09

**Horário:** 2026-06-09 22:00 BRT  
**Projeto:** hayzer.com.br (bvaz-hub)  
**Status:** ❌ FALHOU — token Vercel ausente (18º dia consecutivo) · ⚠️ CRÍTICO: 4 dias até soft launch

---

## Resultado

| Campo | Valor |
|---|---|
| Deployment uid | Não obtido (token ausente) |
| Logs Vercel analisados | 0 |
| Erros novos via Vercel | Indeterminado |
| **Sentry MCP** | ✅ Acessível — org `hayzer`, projeto `hayzer-prod` |
| **Eventos Sentry 24h** | 0 (DSN não configurado no Vercel prod) |
| **Erros Sentry 7d** | 0 (sem ingestão ativa) |
| Issue criada | Nenhuma — issue #23 já aberta (não duplicar) |
| Comentário adicionado | [issue #23 (18º update)](https://github.com/3dresolucaoo-ship-it/TestesiteOficial/issues/23#issuecomment-4655047527) |

---

## Causa da Falha

`VERCEL_API_TOKEN` não encontrado no ambiente de execução.

**Resposta Vercel API esperada:** `{"error":{"code":"forbidden","message":"The request is missing an authentication token","missingToken":true}}`

---

## Sentry MCP — diagnóstico detalhado

| Item | Status |
|---|---|
| Organização | ✅ `hayzer` acessível (region: `de.sentry.io`) |
| Projeto | ✅ `hayzer-prod` encontrado (ID: 4511475541737552) |
| Eventos últimas 24h | ❌ Zero — sem ingestão |
| Issues abertas | ❌ Zero — sem ingestão |
| Causa raiz | DSN não apontado nas env vars do Vercel (prod) |

**Dashboard Sentry** (acesso manual): https://hayzer.sentry.io/explore/discover/homepage/?dataset=errors&queryDataset=error-events&query=level%3Aerror&project=4511475541737552&statsPeriod=24h

---

## Contexto de risco CRÍTICO

| Métrica | Valor |
|---|---|
| Dias sem monitoramento automático | **🚨 18** (22/05 → 09/06) |
| Dias até soft launch | **🚨 4 dias** (13/06 sábado) |
| Dias até launch público | **18 dias** (27/06) |
| Issues abertas sobre o problema | #23 (aberta 22/05, 17 comentários) |
| Server Actions em prod sem cobertura | 13 (leads, orders, CRM, inventory, finance, production, products) |
| Rotas críticas sem monitoramento | `/api/checkout`, `/waitlist`, `/calculadora`, `/api/cron/*` |

---

## Bloqueadores duplos pré-launch

O soft launch (13/06) tem **dois problemas de observabilidade** abertos simultaneamente:

1. **`VERCEL_API_TOKEN` ausente** — impede varredura de logs Vercel (18 dias)
2. **Sentry DSN não configurado no Vercel** — impede ingestão de erros em tempo real

Ambos podem ser resolvidos em **~10 minutos** (ver ações abaixo).

---

## Histórico de falhas consecutivas (atualizado)

| Data | Status | Issue / Comentário |
|---|---|---|
| 22/05 | ❌ Falhou | Issue #23 criada |
| 23/05 | ❌ Falhou | Comentário #23 (2º dia) |
| 24/05 | ❌ Falhou | Comentário #23 (3º dia) |
| 25/05 | ❌ Falhou | Comentário #23 |
| 26/05 | ❌ Falhou | Comentário #23 |
| 27/05 | ❌ Falhou | Comentário #23 |
| 28/05 | ❌ Falhou | Comentário #23 |
| 29/05 | ❌ Falhou | Comentário #23 |
| 30/05 | ❌ Falhou | Comentário #23 |
| 01/06 | ❌ Falhou | Comentário #23 (10º dia) |
| 02/06 | ❌ Falhou | Comentário #23 |
| 03/06 | ❌ Falhou | Comentário #23 |
| 04/06 | ❌ Falhou | Comentário #23 |
| 05/06 | ❌ Falhou | Comentário #23 (14º dia) |
| 06/06 | ❌ Falhou | Comentário #23 (15º dia) |
| 07/06 | ❌ Falhou | Comentário #23 (16º dia) |
| 08/06 | ❌ Falhou | Comentário #23 (17º dia) |
| **09/06** | ❌ **Falhou** | **Comentário #23 (18º dia)** |

---

## Ações necessárias (ambas em ~10 min)

### Ação 1 — VERCEL_API_TOKEN (Monitoramento Vercel)
1. Acesse [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Gere token com escopo `Full Account` (ou restrito ao projeto `bvaz-hub`)
3. Configure como secret no GitHub Actions: `VERCEL_API_TOKEN`

### Ação 2 — Sentry DSN (Ingestão de erros em tempo real)
1. Acesse https://hayzer.sentry.io/settings/hayzer/projects/hayzer-prod/keys/
2. Copie o DSN do projeto `hayzer-prod`
3. No Vercel → Settings → Environment Variables → adicione `SENTRY_DSN` (ou `NEXT_PUBLIC_SENTRY_DSN`) em **Production**
4. Redeploy para aplicar

---

## Erros Conhecidos

_Nenhum dado de erro — varredura Vercel não executada. Sentry sem ingestão ativa._

---

_Gerado automaticamente pelo sistema de monitoramento de erros Hayzer._
