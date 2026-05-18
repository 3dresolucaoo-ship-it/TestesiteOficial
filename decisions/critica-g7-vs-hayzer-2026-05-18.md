# Crítica brutal: G7 (Área de Trabalho) vs Hayzer (este projeto)

> **Pedido do CEO 2026-05-18**: análise crítica do app G7 que está sendo criado em paralelo. Comparar com o setup atual do Hayzer (que está mais maduro). Resultado vai ser mostrado pro G7 aprender e ficar no mesmo nível.
> **Tom**: crítica honesta, sem puxar saco. Princípio #2 da própria G7.

---

## TL;DR (1 parágrafo)

O G7 spec está num lugar **conceitualmente bonito mas operacionalmente atrasado**. Documenta princípios, organograma e visão de produto com clareza, mas não tem o que o Hayzer já tem rodando: memória ativa nos agentes, sistema de aprendizado em uso, skills operacionais, routines automatizadas em produção, e princípios traduzidos em comportamento concreto. **Pior**: o roadmap do app 3D isométrico (12 semanas full-time) é distração financeira séria num momento de runway curto (R$ 1.680 + 1 mês). Recomendação: 3 mudanças cirúrgicas + cancelar o app 3D temporariamente.

---

## O que o G7 está fazendo BEM (manter)

1. **Princípios sintetizados em 1 frase cada** — `company/principles.md` é exemplar, fácil de citar. Hayzer poderia copiar esse formato.
2. **Memory management documentado** — `workflows/memory-management.md` lista tipos, cadências, anti-padrões. Bem pensado.
3. **Anti-IA presente desde o brief** — Princípio #3 "brasileiro de verdade, nunca com cara de IA" + tom em cada persona. Igualou o Hayzer aqui.
4. **Custo zero via subprocess Claude** — Solução criativa pra usar plano Max sem API key separada. Inteligente.
5. **Council pattern documentado em `workflows/council-pattern.md`** — base correta.
6. **Hierarquia clara**: CEO → Helena → 3 squads. Limpo, sem ambiguidade.

---

## Onde o G7 está FRACO (Hayzer já resolveu)

### 1. Personas estáticas, sem memória ativa nem aprendizado

**G7 spec**: `team/personas/helena.md` é uma página estática com bio, cargo, tom, anti-padrões. Bonito mas **morto** — não tem campo onde acumula aprendizado da prática.

**Hayzer agora**: `.claude/agents/carla-copy.md` tem seção `## Memória ativa` com 4 categorias preenchidas:
- 3 padrões do CEO observados (ex: "CEO odeia em-dash, já cobrou 4 vezes")
- 3 erros cometidos com cicatriz (ex: "Em 2026-05-14 inventei 'parceiro maker' que CEO odiou")
- 3 sucessos a repetir
- Princípios da área extraídos dos livros do `studies/carla-copy/`

**Crítica**: G7 ensina como cada persona deve PENSAR (estrutural). Hayzer ensina **o que essa persona JÁ APRENDEU sobre o CEO específico** (comportamental). É a diferença entre um funcionário que leu o manual da empresa vs um que trabalha lá há 6 meses.

**Fix**: copiar literal a estrutura `## Memória ativa` do Hayzer pras 12 personas G7. Cada persona ganha 4 categorias preenchidas conforme a prática vai gerando dado.

---

### 2. Sistema de aprendizado contínuo NÃO EXISTE no G7

**G7 spec**: zero referência a estudo, leitura curada, atualização contínua.

**Hayzer agora**: `studies/_index.md` (criado 2026-05-16) tem:
- 4 livros core curados por agente (~50 livros total)
- Routine semanal automática toda terça 9h BRT pra leitura
- Status por livro: 🔵 não lido → 🟡 em leitura → 🟢 sintetizado
- Validação mensal CEO: ✅útil / ❌inútil / ⚠️errado em princípios extraídos
- Sistema aprende a separar sinal de ruído (3+ ⚠️ remove princípio)

**Crítica mais dura**: o CEO acabou de me pedir HOJE pra expandir isso pra incluir **referências de design (designspells, mobbin, godly, designvault)**, **concorrentes**, **newsletters**, **weekly-log de observações**. O G7 spec não previu nem o sistema básico de livros. Está 2 gerações atrás.

**Fix**: portar estrutura `studies/` inteira pro G7. Routine semanal automática igual o Hayzer já tem rodando em prod.

---

### 3. Sistema de skills NÃO ESTÁ na spec do G7

**G7 spec**: zero menção a slash commands ou skills externas. Toda interação parece ser "abre chat com NPC".

**Hayzer agora**:
- 15+ skills do projeto (`/council`, `/design:audit`, `/security:check`, `/launch:checklist`, `/audit-mensal`, `/rcs`, `/team:status`, etc)
- 11 skills externas instaladas (frontend-design, humanize-writing, ui-ux-pro-max, taste, redesign-audit, etc)
- Cada skill = método de trabalho reusável que NÃO é responsabilidade de uma persona específica

**Crítica**: G7 mistura "como faço X" (método) com "quem é Y" (persona) tudo nos `.md` de personas. Hayzer separa: `agents/` = QUEM, `commands/` (skills) = COMO. Skills atravessam personas (`/council` envolve 3 agentes diferentes).

**Fix**: criar pasta `G7/commands/` espelhando o Hayzer. Migrar workflows existentes (council, delegação) pra slash commands acionáveis.

---

### 4. Princípios CONCEITUAIS, não COMPORTAMENTAIS

**G7 spec**: "Bias to action, mas pensa antes" / "Long-term thinking vence ganho rápido quebrado" / "Brasileiro de verdade".

São bonitos, são "values" de startup. Mas **não viram comportamento real**.

**Hayzer agora** (memórias salvas que JÁ alteram meu comportamento):
- `feedback_zero_em_dash.md` → "Em-dash (—) é assinatura IA. BANIDO. CEO já cobrou múltiplas vezes."
- `feedback_consultar_g7.md` → "Marketing/visual/estratégia: chama o agente G7 ANTES de fazer."
- `feedback_paralelizar_sempre.md` → "Tarefas independentes rodam simultâneo. Sequencial só com dependência real."
- `feedback_verificar_prs_pendentes_inicio_sessao.md` → "Toda sessão, checo PRs de routine abertos no repo."
- `feedback_aceito_sua_sugestao_literal.md` → "Cito a frase exata da sugestão antes de agir."

**Crítica**: G7 princípios são placas de parede. Hayzer feedbacks são instruções acionáveis que mudam o output AGORA. A diferença prática é gigante.

**Fix**: pra cada princípio G7, criar 2-3 feedbacks operacionais derivados. Ex: "Bias to action" vira "Após análise, sempre proponha próxima ação concreta (não pergunte 'o que você quer fazer?')".

---

### 5. Memory NÃO TEM TIPOLOGIA, vai virar pântano

**G7 spec**: `memory/facts.md`, `memory/learnings.md`, `memory/glossario.md`. 3 arquivos grandes que vão crescer indefinidamente.

**Hayzer agora**: 23 memórias atômicas tipadas (`user/`, `feedback/`, `project/`, `reference/`), cada uma em arquivo próprio, indexada em `MEMORY.md` (sempre carregada no contexto, max 200 linhas).

**Crítica**: em 6 meses o `learnings.md` do G7 vai ter 200 itens misturados e ninguém vai achar nada. Hayzer foi desenhado pra escalar: tipo + arquivo único + índice curto.

**Fix**: refatorar `memory/` do G7 pro modelo Hayzer. Cada aprendizado vira arquivo próprio com frontmatter (name/description/type).

---

### 6. ROADMAP do APP 3D é distração financeira séria (crítica brutal)

**G7 spec `07-roadmap-fases.md`**: 12 semanas full-time pra construir:
- Electron + Three.js + Ready Player Me
- 15 NPCs animados com pathfinding A*
- Câmera ortográfica isométrica
- Council visual com 3 streams paralelos
- Animação de reuniões (NPCs caminhando até sala)
- XP, conquistas, ritual mensal animado
- 60fps, ≤300k tris, build .exe

**Realidade financeira (memory `project_runway_hayzer.md`)**:
- CEO investiu R$ 1.680 + 1 mês
- Plano de recuperação: Lifetime + Curso + Parcerias
- Launch Hayzer 04/07/2026 (em 7 semanas)

**Crítica brutal**:

O app G7 é **caro em tempo CEO, zero em retorno produtivo**. Pergunta cirúrgica: o que o app 3D entrega que `.claude/agents/` + slash commands não entrega?

Resposta honesta: **gratificação visual**. Ver NPCs caminhando até a sala de reunião é prazeroso, mas não acelera tomada de decisão, não fecha venda, não recupera R$ 1.680, não traz cliente pro Hayzer.

Custo de oportunidade:
- 12 semanas full-time desenvolvendo o app = 480h
- Mesmas 480h aplicadas em Hayzer pós-launch (Onda 4/5) = potencial de 3-5x mais leads convertidos
- OU 480h em curso/lifetime = R$ 15-30k de receita potencial

**Recomendação**: Cancelar app 3D pelos próximos 4-6 meses. Voltar a considerar SÓ se:
1. Hayzer atingir MRR ≥ R$ 8k/mês (ponto de conforto)
2. CEO tiver 1 mês de runway garantido
3. Tarefas Hayzer estabilizadas a ponto de sobrar 15h/semana

**Plano interino**: G7 continua sendo o que já é hoje: sistema markdown + agentes Claude Code + skills operacionais. Adiciona o que Hayzer descobriu (memória ativa, studies, weekly-log) mas SEM construir app desktop separado.

---

### 7. Agente Júlia (QA) listada na spec mas NÃO EXISTE em prod

**G7 spec `team/squad-global.md`**: Júlia listada como QA Tester pleno do Squad Produto.

**Hayzer realidade**: `.claude/agents/` não tem `julia-qa.md`. Memory diz "julia-qa NÃO existe, usar general-purpose".

**Crítica**: spec G7 desatualizada da prática Hayzer. Outras divergências prováveis (não auditei todas as 12 personas).

**Fix**: auditoria 1x/mês entre `G7/team/personas/` e `bvaz-hub/.claude/agents/` pra detectar drift. Lia faz.

---

### 8. CEO_COMMAND.md é boa ideia, Hayzer não tem

Aqui o G7 acerta e Hayzer pode aprender.

**G7 spec**: `CEO_COMMAND.md` separa "estado atual da semana" (foco, decisões pendentes, alertas) de princípios/convenções do projeto.

**Hayzer agora**: usa `CLAUDE.md` pra TUDO (convenções + estado + memórias + status). Está crescendo demais.

**Fix recíproco**: Hayzer adota `CEO_COMMAND.md` pra estado semanal. `CLAUDE.md` fica só convenções. Reduz contexto carregado por sessão.

---

### 9. Routines/automação NÃO está na spec do G7

**G7 spec**: `rituals/` é pasta com templates manuais. Tudo manual.

**Hayzer agora**: 4 routines em prod rodando automaticamente (audit-mensal dia 1, pillars-review-semanal segunda, estudo-g7-semanal terça, pr-review-bot 2x/dia). Custo ~70 runs/mês = 16% quota Max.

**Crítica**: G7 spec não previu automação. Hayzer já automatizou 4 fluxos operacionais. Diferença real entre "tem doc" e "está vivo sozinho".

**Fix**: migrar templates `rituals/` pra routines remotas igual Hayzer. Auditoria mensal automática, status semanal, etc.

---

### 10. Falta camada de OBSERVABILIDADE do agentes

**G7 spec `team/squad-global.md`**: tem tabela "Estado de cada agente — atualizado mensalmente" mas todos os 12 estão com "🆕 acabou de ser instituída". Estática.

**Hayzer agora**: não tem essa observabilidade ainda. Memory parou em 17/05.

**Crítica simétrica**: AMBOS estão fracos aqui. Idealmente cada chamada de agente loga: data, contexto, custo de tokens, qualidade subjetiva (👍/👎 do CEO). Métrica mensal real.

**Fix conjunto**: criar tabela observability_agents (Supabase) que loga toda invocação de agente em ambos os sistemas. Dashboard simples mostra quem trabalha, quem está parado.

---

## Resumo executivo (pra mostrar pro G7)

| Frente | G7 (spec) | Hayzer (vivo) | Gap |
|---|---|---|---|
| Personas | Estáticas (bio + tom) | Memória ativa preenchida | Alto |
| Aprendizado | Não existe | studies/ + routine semanal + validação CEO | Crítico |
| Skills | Não existe | 15+ slash commands + 11 externas | Alto |
| Princípios | Conceituais ("bias to action") | Comportamentais ("ZERO em-dash, já cobrei 4x") | Crítico |
| Memory | 3 arquivos crescendo indefinidamente | 23 memórias atômicas tipadas + índice | Médio |
| Automação | Templates manuais | 4 routines em prod | Alto |
| App desktop 3D | 12 sem full-time previstas | Não tem (e não precisa) | Distração |
| CEO_COMMAND.md | Existe (✅) | Não tem (Hayzer aprende) | Inverso |
| Observabilidade | Estática | Não tem | Ambos fracos |

---

## 3 mudanças cirúrgicas (priorizadas)

### Prioridade 1 (FAZER ESSA SEMANA)
**Cancelar trabalho ativo no app 3D G7 por 4-6 meses.** Reinvestir 100% das horas em Hayzer pré-launch + plano de recuperação financeira. App vira projeto opcional pós-MRR R$ 8k.

### Prioridade 2 (próximas 2 semanas, em paralelo com Hayzer)
**Portar do Hayzer pro G7**:
1. Estrutura `## Memória ativa` em cada uma das 12 personas G7
2. Pasta `studies/` com curadoria de livros + routine semanal
3. Pasta `commands/` com slash commands portados dos workflows existentes
4. Conversão memory/ pra modelo tipado (user/feedback/project/reference)

### Prioridade 3 (próximo mês)
**Migrar routines pra automação remota** (igual Hayzer já tem):
- Auditoria mensal G7
- Status semanal Helena
- Validação mensal CEO de princípios extraídos
- Sync semanal G7 ↔ Hayzer (detectar drift de personas)

---

## Pra mostrar pro G7 aprender (links concretos)

Leitura sugerida pro CEO mostrar/colar na sessão G7:

1. **Memória ativa de exemplo**: `bvaz-hub/.claude/agents/carla-copy.md` (seção `## Memória ativa`)
2. **Sistema de aprendizado**: `bvaz-hub/studies/_index.md`
3. **Memória persistente**: `bvaz-hub/MEMORY.md` (23 entradas) + arquivos individuais em `~/.claude/projects/<hash>/memory/`
4. **Skills operacionais**: `bvaz-hub/.claude/commands/` (15+ slash commands)
5. **Routines em prod**: `bvaz-hub/automation/routines-specs.md`
6. **Estado vivo do projeto**: `bvaz-hub/CLAUDE.md`

---

## Honestidade brutal final

O G7 está **excessivamente investido em VISUAL** (app 3D, NPCs animados, escritório isométrico) e **subinvestido em OPERACIONAL** (memória, aprendizado, automação, observabilidade).

O Hayzer fez o caminho oposto: cresceu operacionalmente primeiro, deixou o app principal (hayzer.com.br) com visual decente mas nunca foi sofisticado. Resultado: Hayzer funciona, evolui, gera leads (waitlist + calculadora). G7 spec é bonita mas não está rodando.

**Lição**: forma segue função. App 3D bonito do G7 não tem função clara que `.claude/agents/` + skills não cubra. Hayzer deixou claro que **operacional vivo > visual bonito morto**.

---

## Histórico

- **2026-05-18**: arquivo criado por Claude principal a pedido do CEO Gabriel após sessão onde CEO comentou que Claude está "mais esperto que os agentes do G7" e pediu crítica brutal pro G7 aprender e ser o mesmo.
- **Próximo**: CEO leva pro G7 ler. G7 valida ou contesta cada ponto.
