# Operação Noturna Hayzer — Plano 2026-05-20

> Helena · Diretora de Estratégia · Modo Hardwork ativo 19/05 → 27/06
> Resposta crítica ao pedido CEO 20/05: "modo paralelo time inteiro pressão, trabalhar enquanto eu durmo"

## Resumo da pergunta

Como operar Claude + 13 agents G7 em paralelo durante 5-6h em que o CEO dorme (~1-2h → ~7-8h), entregando avanço real no launch 27/06 e digest matinal sem virar lixo ao acordar.

## Contexto relevante

- **Modo hardwork ativo** (`memory/feedback_modo_hardwork_19-05-26-06.md`): 3 fases/dia (manhã 8-12h, tarde 13-18h, noite 18-22h). Operação noturna é uma **4ª fase**, não substitui as 3 oficiais.
- **Ownership Matrix** (`.claude/ownership-matrix.md`) já define dono exclusivo por arquivo. Operação noturna respeita essa matriz.
- **Quota Max**: 15 execuções/dia routines + sessões Claude Code. Custo Claude monitorado, alerta se passar 50k tokens/agent.
- **Memória crítica `feedback_validacao_visual_obrigatoria.md`**: toda mudança UI exige validação visual em prod. Sem CEO online, eu mesma valido via Chrome MCP, mas só se Chrome MCP estiver ativo no PC dele.
- **7 perguntas CEO pendentes 19/05** (`memory/feedback_perguntas_pendentes_19-05.md`): operação noturna NÃO começa antes de resolver itens 1, 2, 4 (hooks settings.json, routine claude-quota-monitor, finalizar estudo Ybera Club).

---

## 1. Janelas operacionais

### Início (22h-1h) — Handoff CEO → Claude
- CEO ainda acordado. Digest 22h reportado normalmente.
- CEO autoriza explicitamente as 3-5 tasks noturnas ("vai trabalhar nessas, qualquer dúvida acumula").
- Claude cria **checkpoint inicial**: `sessions/<data>-noite-checkpoint-inicio.md` com lista de tasks autorizadas + estado git (commit hash atual).
- CEO checa Chrome aberto + extensão Claude in Chrome ativa (pra eu validar visual). Confirma Power Plan Windows "nunca dormir" (ver §5).
- **1h: CEO desconecta.** A partir daqui sou solo.

### Núcleo (1h-7h) — Operação solo
- **3 ciclos de 2h** estruturados:
  - Ciclo 1 (1h-3h): tasks de pesquisa/auditoria/docs (baixo risco, alta paralelização)
  - Ciclo 2 (3h-5h): tasks de implementação backend/refactor (médio risco, validação por tsc/eslint)
  - Ciclo 3 (5h-7h): tasks de validação visual + commits + preparação digest
- **A cada ciclo**: commit no branch `night/<data>` (NÃO main), update `sessions/<data>-noite-progresso.md`, snapshot git hash.
- **Despacho paralelo**: 3-5 agents G7 simultâneos por ciclo, respeitando Ownership Matrix.
- **Modo crítico**: cada agent recebe prompt com cláusula "ESCOPO CIRÚRGICO + REPORTE BLOQUEIOS, NÃO INVENTE SOLUÇÃO IRREVERSÍVEL".

### Fim (7h-8h) — Digest matinal
- Claude consolida outputs em `sessions/<data>-noite-digest-matinal.md`.
- Formato (ver §6): 1 página, leitura <5min.
- CEO acorda 7-8h, lê, decide o que vira main, o que vira lixo.
- **Antes de qualquer merge pra main**: CEO autoriza explicitamente cada PR/commit.

---

## 5 Decisões críticas que CEO precisa tomar pra ativar modo noturno

### Decisão 1 — Data de ativação
**Pergunta**: Começa hoje 20/05 noite ou aguarda QUI 22/05 após resolver pré-requisitos?

**Recomendação Helena**: **QUI 22/05** com piloto de 3 agents. Hoje é primeiro dia hardwork oficial, Fase 1 ainda não rodou nenhuma vez. Operação noturna sobre fundação instável = risco multiplicado.

### Decisão 2 — Canal de "acordar CEO" em emergência
**Recomendação Helena**: **Email Gmail com subject `[CRÍTICO HAYZER]`** + SMS via Twilio como backup.

### Decisão 3 — Quantas noites por semana?
**Recomendação Helena**: **Máximo 3/7 inicialmente** (ter, qua, qui).

### Decisão 4 — Threshold de tokens/custo por noite
**Recomendação Helena**: **R$ 50/noite** (~390k tokens Sonnet médio). Cap semanal R$ 200.

### Decisão 5 — Lista de agents autorizados pra noite piloto QUI 22/05
**Recomendação Helena**:
1. **Bruna (backend)** — refactor de `services/finance.ts` em branch
2. **Lia (docs)** — atualiza CLAUDE.md de `app/orders/`, `app/inventory/`, `app/products/`
3. **Otávio (security)** — completa audit Tier 1 dos itens pendentes ROADMAP

---

## Próxima ação

**CEO responde 5 decisões em bloco copiável**. Sem isso, operação noturna NÃO ativa. Helena bloqueia até resposta.

**Quem executa após aprovação**:
- **Ricardo** (DevOps): hooks settings.json + routine `claude-quota-monitor` (21/05 manhã)
- **Lia** (Docs): registrar como ADR-016 `decisions/016-operacao-noturna.md` (21/05 manhã)
- **Helena**: `night-prompts.md` com cláusulas anti-scope-creep + 3 memórias novas (21/05 tarde)
- **CEO**: Power Plan Windows + canal de alerta (21/05 noite, 22h)
- **Claude principal**: primeira noite piloto QUI 22/05

---

**NOTA**: este é resumo do plano. Documento completo ficou no output da Helena (~2500 palavras com 8 seções detalhadas: janelas, distribuição por agent, tarefas tier A/B/C, proibições absolutas, failsafes 5 cenários, modelo digest, riscos maiores, plano de implementação 3 dias). Se quiser versão completa, peço pra Helena salvar em arquivo separado ou retorno via /rcs.
