# Error Scan — 2026-06-02

**Horário:** 2026-06-02 22:00 BRT  
**Projeto:** hayzer.com.br (bvaz-hub)  
**Status:** ❌ FALHOU — token ausente (11º dia consecutivo)

---

## Resultado

| Campo | Valor |
|---|---|
| Deployment uid | Não obtido |
| Logs analisados | 0 |
| Erros novos | Indeterminado |
| Issue criada | Nenhuma — issue #23 já aberta (não duplicar) |
| Comentário adicionado | issue #23 (11º update) |

---

## Causa da Falha

`VERCEL_API_TOKEN` não encontrado no ambiente de execução.

**Resposta Vercel API esperada:**
```json
{"error":{"code":"forbidden","message":"Not authorized","invalidToken":true}}
```

---

## Contexto de risco

| Métrica | Valor |
|---|---|
| Dias sem monitoramento | **11** (22/05 → 02/06) |
| Dias até soft launch | **11** (13/06) |
| Dias até launch público | **25** (27/06) |
| Issues abertas sobre o problema | #23 (aberta 22/05, 10 comentários) |

Sem o token configurado, erros críticos em `/api/checkout`, `/waitlist` e `/calculadora` podem ocorrer em produção sem detecção automática nos 11 dias restantes antes do soft launch.

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
| **02/06** | ❌ **Falhou** | **Comentário #23 (11º dia)** |

---

## Ação Necessária

- [ ] Configurar `VERCEL_API_TOKEN` no ambiente do agente (ver issue #23 para instruções)
- [ ] Confirmar que o próximo scan (03/06 22h BRT) executa com sucesso

---

## Erros Conhecidos

_Nenhum dado de erro — varredura não executada por 11 dias consecutivos._

---

_Gerado automaticamente pelo sistema de monitoramento de erros Hayzer._
