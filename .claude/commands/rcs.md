---
description: Resumo Completo da sessão atual + atualiza contexto + salva snapshot + ENTREGA bloco pronto pra colar depois do /clear
---

# /rcs — Resumo Completo da Sessão

Você é o **Arquivista da Sessão**. Missão dupla:

1. Fechar a sessão atual com tudo refletido nos arquivos certos
2. **ENTREGAR no chat um bloco gigante pronto pra colar depois do `/clear`** — esse bloco é a coisa MAIS importante. Sem ele, a próxima sessão começa cega.

⚠️ **REGRA DE OURO**: o último output desta skill DEVE ser o bloco copiável dentro de uma code-fence ` ``` `, sem nada depois. CEO copia e cola direto na próxima sessão.

---

## Procedimento

### 1. Coletar dados da sessão

Execute em paralelo:
- `git log --oneline -20` — lista commits recentes
- `git diff --stat HEAD~10 HEAD` — arquivos mudados nos últimos 10 commits
- `git diff --name-only HEAD~10 HEAD | head -50` — lista de arquivos
- `ls decisions/` — lista decisões existentes
- `cat ROADMAP.md | head -100` — estado atual do roadmap
- `ls sessions/ | tail -5` — sessões anteriores pra próxima numeração

### 2. Identificar o que rolou

Categorize cada commit/mudança em:
- ✅ **Conquistas** (features novas, bugs fixados, melhorias entregues)
- 🔴 **Blockers descobertos** (problemas que não consegui resolver)
- ⏳ **Pendências** (items que ficaram pra próxima)
- 📐 **Decisões arquiteturais** (ADRs novos, padrões adotados)
- 🔐 **Segurança** (chaves rotacionadas, expostas, ainda por rotacionar)

### 3. Atualizar arquivos de contexto

Faça isso ANTES de gerar o snapshot:

**`CLAUDE.md` raiz**:
- Seção "🎯 STATUS RÁPIDO": atualizar pendências prioritárias #1/#2/#3
- Adicionar entradas novas em "Em curso" se algo grande mudou
- NÃO reescrever inteiro, só editar o que mudou

**`ROADMAP.md`**:
- Marcar `[x]` items completos com data
- Adicionar bugs novos descobertos
- Mover concluídos pra seção "📜 HISTÓRICO" se fechou marco

**`<pasta>/CLAUDE.md`** (de cada pasta tocada):
- Atualizar status de issues
- Adicionar entry no "Última atualização" com data e resumo curto

**`decisions/NNN-titulo.md`**:
- Criar novo ADR se houve decisão não-trivial não documentada
- Numeração: próximo número livre

**`.env.example`**:
- Adicionar/documentar env vars novas com comentário explicando obrigatoriedade

### 4. Salvar snapshot da sessão

Crie `sessions/YYYY-MM-DD-HHmm-{slug}.md` com este formato:

```markdown
# Sessão {data} — {tema-principal}

> Snapshot imutável. Cole o bloco "Pra continuar depois do /clear" do final da sessão {data} no início da próxima.

## 🎯 Tema da sessão
{1 linha}

## ⏱️ Duração
{horário início → horário fim, total horas}

## ✅ Entregas
{lista numerada com commit hash quando aplicável}

## 🔴 Blockers / Pendências críticas
{lista, com motivo do bloqueio se externo}

## 📐 Decisões registradas (ADRs)
{lista de ADRs criados nesta sessão}

## 📦 Commits
{git log --oneline desde início da sessão}

## 🔐 Itens de segurança a lembrar
{credenciais expostas, rotações pendentes, etc}

## 🚀 Próximas ações (priorizadas)
{1, 2, 3... em ordem de impacto}

## 👥 Agentes G7 envolvidos
{quem foi chamado, pra quê}

## 🧠 Aprendizados da sessão

> Cada aprendizado segue formato: **"Quando X, faça Y, porque Z."** + data + agente envolvido.
> Itens viram entradas na `## Memória ativa` dos agentes correspondentes (auto-propagação).

### Padrões CEO observados
{vocabulário, decisões, preferências percebidas — com evidência da sessão}

### Erros cometidos (não repetir)
{erros desta sessão com causa-raiz + correção. Auto-propaga pra `Erros cometidos` do agente envolvido.}

### Sucessos (repetir)
{soluções que funcionaram. Auto-propaga pra `Sucessos` do agente envolvido.}

### Conhecimento técnico novo
{libs/padrões/APIs/refs descobertos. Vai pra memória do agente da área (Felipe/Bruna/Otávio/etc).}

### Conhecimento de domínio
{maker 3D BR, mercado brasileiro, behavior do user — vai pra Marcos/Sofia.}
```

### 5.b. Auto-propagação pra memória dos agentes (NOVO)

Após criar o snapshot, para cada aprendizado classificado, ABRA o `.md` do agente alvo e ADICIONE entrada na seção `## Memória ativa` correspondente:

- Padrão CEO → `### Padrões CEO Gabriel aprendidos`
- Erro → `### Erros que cometi (não repetir)`
- Sucesso → `### Sucessos (repetir)`
- Princípio técnico/domínio → `### Princípios da área`

**Regras de auto-propagação**:
- Máx 20 itens por categoria por agente (FIFO — remove o mais antigo se passar)
- Todo item tem data + fonte
- Se agente não tem seção `## Memória ativa`, criar (template no `studies/_index.md`)
- Validação amostral 1x/mês: CEO marca 5 princípios aleatórios como ✅/❌/⚠️

### 5. Output FINAL no chat — o que mais importa

A última coisa que aparece no chat tem que ser **o bloco copiável entre divisores `═══` em texto puro** (NÃO dentro de code-fence ``` ``` — CEO copia melhor sem marcador). Formato direto, sem floreio.

**Formato exato a entregar** (substituir {placeholders} com dados reais):

```
✅ Resumo salvo:
  sessions/{arquivo-criado}.md
  CLAUDE.md + ROADMAP.md + <pasta>/CLAUDE.md atualizados

📊 Estatísticas:
  X arquivos criados/editados
  Y commits relevantes
  Z agentes G7 envolvidos

⏭️ Próxima sessão começa em: {ação concreta em 1 frase}

═══════════════════════════════════════════════════════════════
📋 COPIA E COLA ISSO DEPOIS DO /clear PRA PRÓXIMA SESSÃO PEGAR CONTEXTO:
═══════════════════════════════════════════════════════════════

Continuando trabalho em Hayzer (SaaS Next 16 · Supabase · Vercel · hayzer.com.br · launch 04/07/2026). Lê primeiro nessa ordem:
1. CLAUDE.md
2. ROADMAP.md
3. sessions/{arquivo-criado}.md
4. decisions/{último ADR relevante}

Depois me confirma onde paramos e a próxima ação. Pendente imediato: {ação concreta + contexto curto}.

Estado real em prod: {1-2 frases do que tá vivo}.

Próximas em fila: {Item B/C/D resumido em 1 linha cada}.

Convenções críticas (não esquece): project_id + user_id em toda query DB, service-first, PT-BR formal ("para" não "pra"), chama G7 ANTES de feature de marketing/visual, risco vem com solução, testa em prod (hayzer.com.br), bug Tailwind 4 bg-X/Y → inline style ou .surface-strong, iOS input precisa text-[16px].

Repo: github.com/3dresolucaoo-ship-it/TestesiteOficial · Último commit: {hash + 1 linha} · G7 em .claude/agents/ (helena/diego/carla/marcos/sofia/etc).

═══════════════════════════════════════════════════════════════

Pode dar /clear agora.
```

**Regras do bloco:**
- Texto puro entre os 2 divisores `═══` (sem code-fence)
- Direto e conciso — CEO odeia bloat. Máximo ~25 linhas dentro do bloco.
- A frase "Depois me confirma onde paramos e a próxima ação" é OBRIGATÓRIA — força a próxima sessão a fazer check-in antes de executar.
- "Pendente imediato" no formato ação + contexto curto, não lista enorme.
- Convenções críticas em 1 parágrafo só (inline), não bullets gigantes.

---

## Regras

- **Tom direto, anti-IA** (sem "estou animado em compartilhar", sem "absolutamente")
- **PT-BR brasileiro** em narrativa, mas **"para" formal** em textos instrucionais
- **Não inventar conquistas** — só refletir o que está nos commits e nos arquivos
- **Não duplicar** — se já está no ADR/CLAUDE.md, o resumo só referencia
- **Snapshot é imutável** — uma vez criado, não edite mais. Crie outro pra correções
- **Não commitar automaticamente** — apenas escrever os arquivos. CEO decide quando commitar (pode haver auto-commit hook)
- **O bloco copiável final é OBRIGATÓRIO** — sem ele, próxima sessão começa às cegas. Code-fence completa com ` ``` ` em volta. Nada de texto depois do fechamento da fence.

## Quando chamar

- Antes de `/clear` em sessão longa (>2h ou >5 commits)
- Antes de pausar trabalho por horas
- Antes de virar o dia / terminar a noite
- Quando quer "salvar progresso" mesmo continuando

## Quando NÃO chamar

- Sessões curtas (<30min, <2 commits) — não justifica overhead
- Quando ainda há trabalho ativo pendente que mudaria o resumo
- Antes de testar/deploy crítico (faz depois pra capturar resultado)
