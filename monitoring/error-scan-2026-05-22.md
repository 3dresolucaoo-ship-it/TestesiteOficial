# Error Scan — 2026-05-22

**Horário:** 2026-05-22 22:00 BRT  
**Projeto:** hayzer.com.br (bvaz-hub)  
**Status:** ❌ FALHOU — token inválido

---

## Resultado

| Campo | Valor |
|---|---|
| Deployment uid | Não obtido |
| Logs analisados | 0 |
| Erros novos | Indeterminado |
| Issue criada | [infra] VERCEL_API_TOKEN invalido — renovar |

## Causa da Falha

`VERCEL_API_TOKEN` não encontrado no ambiente de execução. A API Vercel não foi consultada.

## Ação Necessária

- [ ] Renovar `VERCEL_API_TOKEN` em vercel.com/account/tokens
- [ ] Adicionar token como secret `VERCEL_API_TOKEN` no ambiente do agente
- [ ] Re-executar scan manualmente após renovação

## Erros Conhecidos (da sessão anterior)

_Nenhum relatório anterior encontrado — primeira execução._

---

_Gerado automaticamente pelo sistema de monitoramento de erros Hayzer._
