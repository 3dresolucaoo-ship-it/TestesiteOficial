# Anthropic Changelog (Hayzer)

> Por que existe: features novas Claude/Anthropic podem mudar nossa stack ou economizar R$ centenas/mês. Rastrear mensalmente evita perder lançamentos relevantes.
>
> Owner: Lia (docs) + Ricardo (devops)
> Cadência: 1a segunda do mês — leitura de changelog oficial + blog posts.
> Fontes: anthropic.com/news · claude.ai/changelog · docs.anthropic.com

---

## Como ler

- NOVO: feature nova que pode ser util pra Hayzer
- DEPRECATED: algo que estamos usando vai morrer
- CUSTO: features pagas/free tier mudou
- STACK: mudou jeito de configurar/usar
- IGNORAR: lancamento nao aplicavel (enterprise, outro segmento)

---

## Maio 2026

- NOVO (~14/05): **Claude 4 Sonnet / Opus** — modelos publicados. Claude Code usa sonnet por padrao. Verificar se `/rcs` de agentes precisa atualizar campo `model:`.
- NOVO (?)     : **Claude Code Max Plan aumentou limite de routines** — verificar limites atuais em claude.ai/settings.
- *[completar na 1a segunda de junho com leitura do blog oficial]*

---

## Abril 2026

- NOVO (14/04): **Claude Code Routines** — tarefas agendadas hospedadas na nuvem. Max plan: ate 15 execucoes/dia. Custo adicional: R$ 0 (incluso no plano). Resolve o sistema 24/7 do Hayzer sem VPS. Decisao lavrada em `decisions/015-claude-code-routines.md`.
- NOVO (08/04): **Claude Managed Agents** — runtime hosted para agentes (enterprise). Nao aplicavel ao Hayzer agora — revisar quando escalar alem de G7 interno.
- IGNORAR: Claude API batch pricing update — nao usamos API diretamente, usamos Claude Code.

---

## Marco 2026

- NOVO: **Agendamento /loop em Claude Code** — precursor das Routines. Substituido pelas Routines em abril. Se voce via `/loop` em algum CLAUDE.md, atualizar para Routines.
- NOVO: **Computer Use GA** — Claude consegue operar browser/desktop autonomamente. Ja usamos via Chrome MCP. Sem mudanca de stack necessaria.

---

## Fevereiro 2026

- *[nao mapeado — preencher na proxima auditoria se relevante]*

---

## Janeiro 2026

- *[nao mapeado — preencher na proxima auditoria se relevante]*

---

## Como fazer a leitura mensal (protocolo)

1. Abrir anthropic.com/news e rolar desde a ultima leitura
2. Abrir claude.ai/changelog (se disponivel)
3. Para cada lancamento: classificar com os labels acima
4. Se NOVO ou CUSTO: avaliar impacto no Hayzer (stack, custo, oportunidade)
5. Se impacto alto: abrir ADR ou issue no ROADMAP
6. Atualizar este arquivo com data e resumo
7. Pingar Ricardo (devops) se for mudanca de infraestrutura

**Tempo estimado**: 20-30 min/mes.

---

## Historico de revisoes

- 2026-05-17: criado por Lia apos incidente "Routines existia 1 mes e nao sabiamos" (CEO quase contratou VPS R$ 30-100/mes desnecessario)
