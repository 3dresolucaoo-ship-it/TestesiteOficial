# Operação Noturna G7 — Configuração

> **Início oficial**: sexta 22/05/2026, 22h BRT
> **Duração**: 22/05 → 26/06 (hardwork, 5 semanas)
> **Dono**: Claude (eu)
> **Aprovação CEO**: pendente Bloco 1 do doc `strategy/decisoes-ceo-pendentes-2026-05-20.md`

---

## Regra base

Claude opera 22h-7h BRT com 2 agents G7 paralelos em trabalho REVERSÍVEL.

**Permitido**:
- Refactor de services/components existentes
- Documentação (CLAUDE.md, ADRs)
- Pesquisa e auditoria
- Build em rota nova (branch separada)
- Testes locais

**PROIBIDO**:
- Deploy em prod
- Migration em prod
- Decisão estratégica (escopo, preço, contratação)
- Commit no main sem PR review
- Mexer em código de pagamento sem CEO autorizar explicitamente

---

## Limites técnicos

| Parâmetro | Valor |
|---|---|
| Agents simultâneos | **2 máximo** |
| Janela trabalho | 22h-7h BRT (~9h disponíveis) |
| Trabalho efetivo agent | ~4-5h cada (não 9h, agent pode parar antes) |
| Horas Opus/noite | ~10-15h consumidas (Max 5x = 75h/sem, cabe) |
| Noites/semana | **5/7** (seg-sex) |
| Pausa | Sábado + Domingo (CEO descansa, eu também) |

---

## Canal de alerta

**Discord servidor**: "Hayzer Ops" (criado 20/05 pelo CEO)

| Canal | Uso | Notificação |
|---|---|---|
| `#critico` | Build prod quebrado, agent travado >2h, pagamento erro, RLS violação | Push som ALTO mobile |
| `#digest` | Resumo da noite: commits, docs atualizadas, agents que terminaram | Silenciosa (lê de manhã) |

**Env vars setadas**:
- `DISCORD_WEBHOOK_CRITICO`
- `DISCORD_WEBHOOK_DIGEST`

**Testado e funcionando**: 20/05, status 204 nos 2 webhooks.

---

## Critério "crítico" (acorda CEO)

Só posta em `#critico` se:
1. Build prod (`hayzer.com.br`) retornou 500 nas últimas 3 verificações
2. Migration aplicada acidentalmente em prod sem autorização
3. Webhook signature invalidando todos os pagamentos
4. RLS quebrada (acesso cross-tenant detectado)
5. Agent travou >2h sem progresso e bloqueou o outro
6. Custo Anthropic ultrapassou 80% da janela semanal de uso

**Tudo o resto** vai pro `#digest`.

---

## Primeira noite (22/05 sexta 22h)

**Agents piloto**: Bruna + Lia (Otávio cortado — Tier 1 fechou)

**Tarefa Bruna**:
- Auditar e refatorar `services/dashboard.ts` (543 linhas) — extrair tipos pro `database.types.ts` recém-gerado
- Reportar oportunidades de simplificar query

**Tarefa Lia**:
- Sweep CLAUDE.md por pasta — atualizar status nas pastas afetadas pelas mudanças de hoje (20/05)
- Listar 3 ADRs faltantes pra criar próxima noite

**Duração estimada**: 3-4h cada. Termino ~2h madrugada.

**Digest matinal**: 7h sábado 23/05 com resumo.

---

## Triagem matinal (7h após operação)

Toda manhã pós-operação noturna, Claude faz:

1. **Verificar `#critico`**: alguma coisa quebrou? Atacar antes do CEO acordar.
2. **Compilar digest** em `#digest`: 5-10 bullets do que rolou.
3. **Verificar consumo Anthropic**: % janela semanal usada.
4. **Verificar `git log` da noite**: nenhum commit não autorizado no main.

---

## Plano de escape

**Se algo der ruim em 1-2 noites consecutivas**:
- Pausa imediata
- CEO + Claude revisam o que falhou
- Volta apenas com proteções extras (ex: 1 agent só, escopo mais reduzido)

**Se janela semanal Opus passa de 80%**:
- Pausa até reset (quinta 12h normalmente)
- Avisa CEO via `#critico` ANTES de bloquear

---

## Histórico de noites

| Data | Agents | Tarefas | Resultado |
|---|---|---|---|
| 22/05 (sex) | Bruna + Lia | Refactor services + sweep docs | ⏳ planejada |

(atualizar após cada noite)

---

## Decisões CEO pendentes que afetam isso

Doc: `strategy/decisoes-ceo-pendentes-2026-05-20.md` — Bloco 1 (5 decisões):

1. Data ativação: **hoje 21/05 vs sexta 22/05** → Helena recomenda sexta
2. Canal alerta: **Discord** ✅ já decidido + configurado 20/05
3. Noites/sem: **5/7** ✅ já decidido (seg-sex)
4. Quota: ajustado pra **2 agents/noite** (não R$ 50 cap — plano Max não cobra por token)
5. 3 agents piloto: **2 só** (Bruna + Lia, Otávio cortado)

CEO ainda precisa confirmar formalmente Decisão 1 (data início). Default = sexta 22/05 22h.
