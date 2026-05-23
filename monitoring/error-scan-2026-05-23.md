# Error Scan — 2026-05-23

**Horário:** 2026-05-23 22:00 BRT  
**Projeto:** hayzer.com.br (bvaz-hub)  
**Status:** ❌ FALHOU — token inválido (5º dia consecutivo)

---

## Resultado

| Campo | Valor |
|---|---|
| Deployment uid | Não obtido |
| Logs analisados | 0 |
| Erros novos | Indeterminado |
| Issue criada | Nenhuma — comentário adicionado à Issue #23 (evitar duplicata) |

## Causa da Falha

`VERCEL_API_TOKEN` ausente no ambiente de execução. API Vercel retornou:
```json
{"error":{"code":"forbidden","message":"The request is missing an authentication token","missingToken":true}}
```

## Histórico de falhas consecutivas

| Data | Issue |
|---|---|
| 2026-05-19 | #8 criada |
| 2026-05-21 | #17 criada |
| 2026-05-22 | #23 criada |
| 2026-05-23 | Comentário em #23 |

## Ação Necessária

- [ ] Renovar `VERCEL_API_TOKEN` em vercel.com/account/tokens
- [ ] Adicionar como env var `VERCEL_API_TOKEN` em Settings → Environment Variables (Claude Code on the web)
- [ ] Re-executar scan manualmente após renovação
- [ ] Fechar Issues #8, #17, #23 após confirmação

## Erros Conhecidos (acumulados sem varredura)

_Indeterminado — 5 dias sem cobertura de monitoramento._

---

_Gerado automaticamente pelo sistema de monitoramento de erros Hayzer._
