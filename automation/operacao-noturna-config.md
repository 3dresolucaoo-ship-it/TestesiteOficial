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

## Primeira noite (22/05 sexta 22h) — TASKS DEFINIDAS

**Agents piloto**: Bruna + Lia (Otávio cortado — Tier 1 + Tier 2 fechados)

### Tarefa Bruna (4-5h)

1. **Auditar `services/dashboard.ts`** (543 linhas)
   - Mapear todas as queries Supabase
   - Identificar N+1 queries (uma query que dispara N outras)
   - Identificar queries que não usam index (verificar via EXPLAIN)
2. **Extrair tipos pro `lib/supabase/database.types.ts`** (criado 20/05)
   - Substituir `any` por tipos gerados
   - Tipos de retorno de getDashboardData, getKpis, getProductsTop5
3. **Refactor cirúrgico** (apenas o que detectou no passo 1):
   - Combinar queries quando faz sentido
   - Adicionar projection (`.select('col1, col2')` em vez de `.select('*')`)
4. **NÃO**: aplicar migration, mudar schema, mexer em RLS
5. **Reportar**: arquivo com diff, N queries antes/depois, ms estimado salvo

### Tarefa Lia (3-4h)

1. **Sweep `CLAUDE.md` por pasta** — atualizar status do que mudou 20/05:
   - `app/CLAUDE.md`: rota `/dashboard/v4` sandbox criada
   - `components/landing/CLAUDE.md`: ProductPreview + WhatsAppFlow novos (já atualizou Felipe, validar)
   - `automation/CLAUDE.md`: Discord webhooks + operação noturna ativa
   - `decisions/CLAUDE.md` ou `decisions/_index.md`: índice dos 19 ADRs
2. **Criar 3 ADRs faltantes** identificados no audit:
   - ADR-020 Discord webhooks operação noturna (decisão dia 20/05)
   - ADR-021 sub-marca Hayzer Beauty mesmo domínio (decisão 6 CEO 20/05)
   - ADR-022 launch acelerado 04/07 → 27/06 (decisão hardwork 19/05)
3. **NÃO**: criar docs por criar, mexer em código
4. **Reportar**: arquivos criados/editados, links cruzados nos ADRs

### Limites técnicos primeira noite

- Cada agent 1 prompt de ~600 palavras pré-pronto
- Timeout 5h por agent
- Se algum bater bloqueio (precisa decisão CEO), pausa + #digest aviso
- Eu (Claude) monitoro a cada 30min, NÃO interfere a não ser que travou
- Custo estimado: ~8-12h Opus (cabe folga em 75h/sem)

### Digest matinal sábado 23/05 7h BRT

Deve conter:
1. ✅/❌ pra cada tarefa
2. Diff resumido por agent
3. Bloqueios (se houve)
4. Próximos passos sugeridos
5. Consumo Opus da noite (% janela semanal)

### Plano de escape primeira noite

Se algo crítico acontecer:
- Bruna mexer em código que afete prod = stop imediato + `#critico`
- Lia criar conflito com docs Felipe/Diego = stop + reverter
- Custo Opus > 20h consumidas = pausar (manter folga semanal)

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
