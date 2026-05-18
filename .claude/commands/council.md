---
description: "Reunião estruturada de 3 agentes (crítico do CEO, crítico do Claude, pesquisador externo) com 5 etapas: crítica → crítica-da-crítica → pesquisa profunda → reunião → consenso auditado. Use para decisões grandes (escopo, prazo, posicionamento, arquitetura, contratação, integração externa custosa). Não use para escolhas pequenas."
allowed-tools: Task, Read, Glob, Grep, WebSearch, WebFetch
---

# /council — Reunião Estruturada de Decisão (5 etapas)

Você ativou o **Council Pattern Reforçado** da G7. Diferente do Council antigo (3 vozes paralelas + síntese), este tem **crítica-da-crítica** e **reunião auditada** para sair do "genérico" e entregar consenso defendido pelos 3 agentes.

## Tópico do council
$ARGUMENTS

---

## Etapa 1 — Críticas iniciais (em PARALELO)

Dispare os 3 subagentes em um único bloco de tool calls (paralelo obrigatório, sequencial é proibido aqui — tempo importa):

1. **critic-user** — ataca a proposta do CEO
   - Brief: "$ARGUMENTS — ataque a proposta do CEO. Liste premissas frágeis, riscos, pior cenário realista, custo de oportunidade, e o que está sendo subestimado. Seja específico, não genérico. Cite onde a proposta é fraca."

2. **critic-claude** — ataca recomendação do Claude/Helena
   - Brief: "$ARGUMENTS — assuma que o Claude/Helena vai recomendar algo. Antecipe os vieses (over-engineering, hedging conservador, complexidade desnecessária, abstração prematura). Aponte onde o Claude estaria sendo cauteloso demais ou ambicioso demais. Proponha versão enxuta."

3. **external-researcher** — pesquisa PROFUNDA na web
   - Brief: "$ARGUMENTS — busque dados frescos de 2026 (não training data). Casos reais, benchmarks, CVEs recentes, releases de ferramentas, posts da comunidade técnica, regulamentação BR se aplicável. Cite fontes (URLs). Profundidade > amplitude — 5 fontes bem lidas valem mais que 20 superficiais."

Aguarde as 3 respostas voltarem.

---

## Etapa 2 — Crítica-da-crítica (em PARALELO)

Agora cada agente lê o que os outros 2 disseram e gera uma SEGUNDA rodada de crítica. Dispare os 3 de novo em paralelo:

1. **critic-user (rodada 2)**
   - Brief: "Você criticou a proposta do CEO antes. Agora leia o que critic-claude e external-researcher disseram. Onde eles têm razão sobre algo que você não viu? Onde eles erram? Atualize sua posição: o que você manteria, o que mudaria, o que descartaria. Seja específico — referencie pontos dos outros dois."

2. **critic-claude (rodada 2)**
   - Brief: "Você criticou os vieses do Claude/Helena antes. Agora leia o que critic-user e external-researcher disseram. Eles trazem dados ou ângulos que mudam sua análise? Atualize sua posição. Onde a sua crítica original era forte? Onde ela era frágil à luz dos outros?"

3. **external-researcher (rodada 2)**
   - Brief: "Você trouxe dados externos antes. Agora leia o que critic-user e critic-claude disseram. Os pontos deles invalidam ou reforçam algum dado seu? Se invalidam, busque MAIS dados pra resolver a tensão. Se reforçam, fortaleça com fontes adicionais. Atualize sua posição com pesquisa nova se necessário."

Passe explicitamente os outputs da Etapa 1 dos OUTROS dois como contexto pra cada agente (não os do próprio agente).

---

## Etapa 3 — Reunião / Consenso auditado

Após receber as 6 respostas (3 da Etapa 1 + 3 da Etapa 2), VOCÊ (Helena/Claude principal) conduz uma **reunião sintetizada** seguindo este formato:

```
# Council — Reunião Final

## Tema
<resumo do $ARGUMENTS em 1 parágrafo>

## Etapa 1 — Críticas iniciais

### Crítico do CEO
<3-5 bullets com os pontos mais fortes>

### Crítico do Claude
<3-5 bullets>

### Pesquisador externo
<3-5 bullets com FONTES citadas (URLs)>

## Etapa 2 — Crítica-da-crítica

### Crítico do CEO (rodada 2 — onde mudou de ideia)
<2-3 bullets>

### Crítico do Claude (rodada 2)
<2-3 bullets>

### Pesquisador externo (rodada 2 — dados adicionais)
<2-3 bullets>

## Etapa 3 — Pontos de convergência (onde os 3 concordam)
<bullets com os pontos em que houve consenso entre os 3 agentes após a rodada 2>

## Etapa 3 — Pontos de divergência (onde discordam)
<bullets dos pontos em que os 3 ainda discordam, com a posição de cada um>

## Consenso final defendido
<2-3 parágrafos. Esta NÃO é "média das opiniões" — é a posição que sobrevive depois dos 3 atacarem mutuamente e nenhum conseguir derrubar. Se os 3 não chegam em consenso em algum ponto, explicite: "Há disputa não resolvida em X, com a posição [A] argumentando Y e [B] argumentando Z. Recomendo [escolha], pelos motivos K e L.">

## Recomendação ao CEO
<decisão única, defensável, com justificativa baseada no consenso>

## Próximas ações concretas
1. <ação imediata, hoje>
2. <ação se CEO aprovar>
3. <ação se CEO discordar — qual é o plano B>

## O que NÃO vamos fazer (e por quê)
<bullets com os caminhos descartados na reunião e o motivo>
```

---

## Quando usar
- Decisões grandes: escopo, prazo, posicionamento, arquitetura, contratação, integração externa custosa, mudança de stack, política de pagamento, refator de banco
- Tradeoffs entre velocidade vs qualidade, custo vs feature, segurança vs UX
- Quando o CEO está em dúvida estratégica e quer "uma reunião"
- Antes de gastar muito tempo/dinheiro em algo que pode ser errado

## Quando NÃO usar
- Decisão já tomada (use direto o agente da área)
- Refinamento incremental ("ajusta espaçamento")
- Tarefas operacionais ("implementa esse componente")
- Escolha pequena ("que cor de botão" → use direto o Diego)
- Bug fix óbvio (use Felipe/Bruna direto)

## Custo e tempo
- Tokens: ~8-12x conversa normal (6 invocações de agente + síntese)
- Tempo total: 8-15 min (em paralelo)
- Vale a pena para decisões em que o custo de errar > 100x o custo do council
- Princípio: melhor gastar 15 min em council do que 3 semanas refazendo algo errado

## Princípio fundador (CEO, 2026-05-17)
"Imagina um agente que critica a minha sugestão, outro critica a sua crítica, e outro fodão busca na internet bem aprofundado. Depois traz pros 3 agentes críticas, e eles se criticam, entram em reunião, falam sobre cada uma das críticas, entram em consenso, auditoria, conversam entre si pra chegar numa conclusão boa. Melhor escolha do que só vir e me entregar algo genérico."
