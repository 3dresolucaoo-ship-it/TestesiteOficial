# ADR 008 — Criação do Time G7 (subagents) + Estrutura de Skills

> **Status**: accepted
> **Data**: 2026-05-13
> **Autor**: Gabriel (CEO) + Claude/Helena
> **Tags**: organização, processo, ai-tooling

---

## Contexto

O projeto BVaz Hub está entrando em **Fase 1** com lançamento marcado pra 04/07/2026 (~8 semanas). O CEO trabalha solo, com ~25-30h/semana disponíveis, e precisa atuar como dev, designer, marketing, security officer, copywriter, devops simultaneamente.

Sem estrutura, cada conversa com Claude começa do zero — o contexto de cada papel se perde, decisões grandes são tomadas sem múltiplas vozes, e há risco de viés (over-engineering, hedging, conservadorismo do LLM, people-pleasing).

Também há ambição de longo prazo: o CEO toca múltiplos projetos paralelos (BVaz Hub agora, Heshiley/Ybera depois, VideoEdit no futuro). Sem uma "empresa-casa" conceitual, cada projeto vira silo.

---

## Decisão

Foram criadas **3 camadas de infraestrutura de IA** dentro do projeto BVaz Hub:

### 1. Time G7 — 15 subagents especializados em `.claude/agents/`

Personas com cargo, senioridade, persona e responsabilidade clara:

**Squad Estratégia**
- helena-strategy (Diretora, opus)

**Squad Produto**
- diego-designer (opus)
- felipe-frontend (sonnet)
- bruna-backend (sonnet)
- julia-qa (sonnet)

**Squad Operação**
- otavio-security (opus)
- ricardo-devops (sonnet)
- paulo-financial (opus)
- lia-docs (sonnet)

**Squad Crescimento**
- carla-copy (opus)
- marcos-marketing (sonnet)
- sofia-cs (sonnet)

**Squad Council** (invocados por /council pra decisões grandes)
- critic-user (opus) — ataca proposta do CEO
- critic-claude (opus) — ataca recomendação do Claude
- external-researcher (sonnet) — pesquisa web

### 2. Skills customizadas em `.claude/commands/`

- `/council` — reunião 3 agentes pra decisão grande
- `/team:meeting` — reunião informal de squad
- `/team:status` — status semanal
- `/design:component` — criar componente (Diego+Carla+Felipe)
- `/design:audit` — auditar visual+UX+QA
- `/security:check` — Tier 1 audit (Otávio)
- `/pwa:test` — valida PWA
- `/launch:checklist` — pre-launch completo
- `/brand:update` — atualizar BRIEF.md

### 3. Skills externas clonadas em `.claude/skills/`

**Anti-IA + design premium**:
- frontend-design (Anthropic oficial)
- humanize-writing (lguz)
- ui-ux-pro-max (nextlevelbuilder) — 161 paletas, 57 fontes, 99 UX rules
- taste (Leonxlnx) — anti-AI slop, senior UX
- soft-design (Leonxlnx) — high-end agency feel
- redesign-audit (Leonxlnx) — audita AI patterns genéricos
- minimalist (Leonxlnx) — clean editorial vibe

**Implementação**:
- design-tokens (ui-ux-pro) — token architecture
- ui-styling (ui-ux-pro) — shadcn/Tailwind helper
- image-to-code (Leonxlnx) — screenshot → código

**Utilidade**:
- pdftk (github/awesome-copilot) — manipulação PDF avançada (pós-launch)

### 4. MCPs adicionais em `.mcp.json`

- shadcn (oficial)
- magicui (oficial Magic UI)
- context7 (Upstash — docs em tempo real)

Já existentes: Supabase MCP, Vercel MCP.

### 5. Documentação consolidada

- `brand/BRIEF.md` — briefing de marca completo
- `brand/design-system.md` — tokens fixos (cor, tipo, espaçamento, animação)
- `brand/naming.md` — 10 candidatos avaliados, decisão "BVaz Hub provisório"
- `CEO_COMMAND.md` — dashboard central do CEO
- `~/OneDrive/Documentos/Contextos Projetos/G7-CONTEXTO-COMPLETO.md` — documento da empresa-casa G7 (pra usar no Cowork)

---

## Alternativas consideradas

### A) Construir app G7 visual próprio (dashboard com squads)
- **Descartada**: 30-60 sessões de trabalho → atrapalha launch 04/07/2026
- Reconsiderar em jan-mai/2027 (Fase 4 G7 roadmap) se estrutura atual virar gargalo

### B) Não criar time, usar Claude direto pra tudo
- **Descartada**: perde coerência entre sessões, sem multiplos perspectivos, vieses do LLM não combatidos
- CEO solo precisa de "time" pra não burnar

### C) Usar apenas Cowork + arquivos (sem Claude Code custom)
- **Descartada**: BVaz é projeto técnico — código exige Claude Code com agents/MCPs/skills
- Cowork é complementar (estratégia, marketing, conteúdo) — não substitui

### D) Subagents genéricos sem personas
- **Descartada**: personas com nome humano + persona detalhada melhoram qualidade do output (estudos 2025-2026 indicam)
- Custo zero adicional, benefício de coerência alto

---

## Consequências

### Positivas
- **Coerência entre sessões**: contexto persiste em arquivos, não em memória de conversa
- **Decisões grandes têm múltiplas vozes**: `/council` força confronto de perspectivas
- **Anti-IA estrutural**: 8 skills externas focadas em remover AI-look
- **Escala pra multi-projeto**: estrutura serve BVaz hoje, Heshiley amanhã, outros depois
- **CEO solo ≠ sozinho**: 15 "funcionários" virtuais sempre disponíveis
- **Documentação viva**: docs refletem estado, atualizados por Lia
- **Velocidade depois**: design system fixo + skills prontas = menos retrabalho

### Negativas / Riscos
- **Overhead inicial**: 30 arquivos criados, exige reinicializar Claude Code pra MCPs ativarem
- **Curva de aprendizado**: CEO precisa lembrar quando usar qual squad/skill
- **Custo de tokens**: subagents (especialmente council) usam ~3-4x mais tokens
- **Risco de over-process**: tentação de "fazer reunião pra tudo" quando decisão simples

### Mitigação
- CLAUDE.md atualizado com mapa claro de quando usar o quê
- CEO_COMMAND.md como ponto único de entrada
- Princípio 10 do G7: "reunião quando precisa, não toda hora"
- Auditoria mensal: demitir agentes não usados em >2 meses

### Reversibilidade
- **Custo de reverter**: baixo — todos os arquivos são `.md`, basta deletar
- **Trabalho perdido**: ~3-4 horas se for descartar tudo
- **Conhecimento preservado**: briefing e design system ficam mesmo se time for desativado

---

## Quando revisitar

- **Auditoria mensal** (skill `/audit-mensal` em `.claude/commands/`)
- **Pós-launch** (julho 2026) — revisar se time funcionou na prática durante Fase 1
- **Início Heshiley** (set 2026) — adaptar agents pro novo projeto
- **Janeiro 2027** — avaliar Fase 4 G7 (construir app visual próprio?)

---

## Próximos passos imediatos

1. ✅ Estrutura criada nesta sessão
2. ⏳ CEO reinicia Claude Code (manual) — pra MCPs ativarem
3. ⏳ Testar primeiro fluxo real: `/design:component "landing hero"` invocando Diego+Carla+Felipe
4. ⏳ Após Fase 1 semana 1 (sexta 16/05): retrospectiva — o que funcionou? o que ajustar?

---

## Referências

- Documento G7 completo: `~/OneDrive/Documentos/Contextos Projetos/G7-CONTEXTO-COMPLETO.md`
- ADR anteriores: 001-007 (ver `decisions/`)
- Pesquisa multi-agent 2026: [Claude Code Agent Teams](https://claudefa.st/blog/guide/agents/agent-teams), [Building multi-agent systems](https://claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them)
