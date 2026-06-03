# Error Scan — 2026-06-03

**Horário:** 2026-06-03 22:00 BRT  
**Projeto:** hayzer.com.br (bvaz-hub)  
**Status:** ❌ FALHOU — token ausente (12º dia consecutivo)

---

## Resultado

| Campo | Valor |
|---|---|
| Deployment uid | Não obtido |
| Logs analisados | 0 |
| Erros novos | Indeterminado |
| Issue criada | Nenhuma — issue #23 já aberta (não duplicar) |
| Comentário adicionado | issue #23 (12º update) |

---

## Causa da Falha

`VERCEL_API_TOKEN` não encontrado no ambiente de execução.

**Resposta Vercel API:**
```json
{"error":{"code":"forbidden","message":"Not authorized","invalidToken":true}}
```

---

## Contexto de risco

| Métrica | Valor |
|---|---|
| Dias sem monitoramento | **12** (22/05 → 03/06) |
| Dias até soft launch | **10** (13/06) |
| Dias até launch público | **24** (27/06) |
| Issues abertas sobre o problema | #23 (aberta 22/05, 12 comentários) |

Sem o token configurado, erros críticos em `/api/checkout`, `/waitlist` e `/calculadora` podem ocorrer em produção sem detecção automática nos 10 dias restantes antes do soft launch.

---

## Histórico de falhas consecutivas

| Data | Status | Issue / Comentário |
|---|---|---|
| 22/05 | ❌ Falhou | Issue #23 criada |
| 23/05 | ❌ Falhou | Comentário #23 |
| 24/05 | ❌ Falhou | Comentário #23 (3º dia) |
| 25/05 | ❌ Falhou | Comentário #23 |
| 26/05 | ❌ Falhou | Comentário #23 |
| 27/05 | ❌ Falhou | Comentário #23 |
| 28/05 | ❌ Falhou | Comentário #23 |
| 29/05 | ❌ Falhou | Comentário #23 |
| 30/05 | ❌ Falhou | Comentário #23 |
| 01/06 | ❌ Falhou | Comentário #23 (10º dia) |
| 02/06 | ❌ Falhou | Comentário #23 (11º dia) |
| **03/06** | ❌ **Falhou** | **Comentário #23 (12º dia)** |

---

## Ação Necessária

- [ ] Configurar `VERCEL_API_TOKEN` no ambiente do agente (ver issue #23 para instruções)
- [ ] Confirmar que o próximo scan (04/06 22h BRT) executa com sucesso

---

## Erros Conhecidos

_Nenhum dado de erro — varredura não executada por 12 dias consecutivos._

---

_Gerado automaticamente pelo sistema de monitoramento de erros Hayzer._
