---
description: "Reunião de 3 agentes (crítico do CEO, crítico do Claude, pesquisador externo) pra decisões grandes. Use pra escopo, prazo, posicionamento, arquitetura, contratação. Não use pra escolhas pequenas (cor de botão)."
allowed-tools: Task, Read, Glob, Grep, WebSearch
---

# /council — Reunião de Decisão

Você ativou o **Council Pattern** da G7 — sistema de 3 agentes que debatem uma decisão grande antes do CEO decidir.

## Tópico do council
$ARGUMENTS

## Como executar

Dispare em PARALELO os 3 subagentes:

1. **critic-user** — ataca a proposta do CEO
   - Brief: "$ARGUMENTS — ataque honestamente os pontos fracos da proposta do CEO. Cite riscos, premissas frágeis, e o pior cenário realista."

2. **critic-claude** — ataca recomendação do Claude
   - Brief: "$ARGUMENTS — assuma que o Claude/Helena vai dar uma recomendação. Antecipe os vieses (over-engineering, hedging, conservadorismo). Proponha versão enxuta."

3. **external-researcher** — busca dados externos
   - Brief: "$ARGUMENTS — pesquise na web casos reais 2026, benchmarks, mudanças recentes em ferramentas, CVEs, e o que a comunidade técnica está fazendo. Cite fontes."

Depois receber as 3 respostas, **VOCÊ (Helena/Claude principal) sintetiza** assim:

```
# Reunião do Council

## Tema
<resumo>

## Voz 1 — Crítico do CEO (riscos)
<síntese da resposta>

## Voz 2 — Crítico do Claude (vieses)
<síntese da resposta>

## Voz 3 — Pesquisador externo (dados frescos)
<síntese da resposta>

## Síntese final (Helena)
<2-3 parágrafos consolidando os 3 pontos de vista>

## Recomendação ao CEO
<decisão única + justificativa baseada nas 3 vozes>

## Próximas ações
1. <ação imediata>
2. <ação se decisão for X>
3. <ação se decisão for Y>
```

## Quando NÃO usar
- Decisões já tomadas
- Refinamento incremental ("ajusta o espaçamento")
- Tarefas operacionais ("implementa o componente")
- "Que cor de botão" (use direto o Diego)

## Custo
Council usa ~3-4x mais tokens que conversa normal. Use só pra decisões que **valem a pena pensar bem**.
