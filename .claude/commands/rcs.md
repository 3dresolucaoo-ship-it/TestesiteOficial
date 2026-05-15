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

## 🧠 Aprendizados técnicos
{coisas que aprendi e quero registrar pra não esquecer}
```

### 5. Output FINAL no chat — o que mais importa

A última coisa que aparece no chat tem que ser **o bloco copiável dentro de uma code-fence**. Esse é o passe pra próxima sessão.

Formato exato a entregar:

---

✅ Resumo salvo:
- `sessions/{arquivo-criado}.md`
- `CLAUDE.md`, `ROADMAP.md`, `<pasta>/CLAUDE.md` atualizados

📊 Estatísticas:
- {X} arquivos criados/editados nesta sessão
- {Y} commits
- {Z} bugs resolvidos / decisões grandes

⏭️ Próxima sessão começa em: {ação concreta em 1 frase}

**Pode dar `/clear` agora.** Cola o bloco abaixo no início da próxima sessão pra retomar sem perder contexto:

````
Continuando trabalho em Hayzer (SaaS multi-projeto · Next.js 16 · React 19 · TypeScript · Tailwind 4 · Supabase · Vercel · domínio hayzer.com.br).

🗂️ LÊ PRIMEIRO (em ordem, antes de qualquer outra coisa):
1. CLAUDE.md (raiz) — regras + status atual
2. sessions/{arquivo-criado}.md — snapshot completo da sessão anterior
3. ROADMAP.md — items concluídos e pendentes
4. decisions/{ADRs novos criados} — se houve

🎯 ÚLTIMA SESSÃO ({data}, {duração}):
{resumo executivo em 2-4 frases, o que foi feito de mais importante}

✅ ESTADO REAL EM PROD AGORA:
- {bullet 1, ex: hayzer.com.br/calculadora em prod com 5 inputs + 5 canais marketplace + slider margem + dropdown impressora}
- {bullet 2, ex: WhatsApp grupo Hayzer Beta criado em https://chat.whatsapp.com/...}
- {bullet 3, ex: Resend us-east-1 verified, RESEND_API_KEY rotacionada (v2 ativa)}
- {bullet 4 etc}

🔴 BLOCKERS / PENDÊNCIAS CRÍTICAS:
- {bullet, com contexto: bloqueador X, motivo Y, próximo passo Z}
- {se nada bloqueado, escrever "Nenhum blocker. Próximo: ..."}

🔐 SEGURANÇA - itens a rotacionar quando lembrar:
- {lista de chaves expostas no chat anterior que precisam ser rotacionadas, se houver}

🚀 PRÓXIMA AÇÃO IMEDIATA: {ação concreta em 1 frase}

📅 PRÓXIMAS AÇÕES FASE 1 (até launch 04/07/2026):
- {Item B/C/D que tava em fila}
- {Outras Wave/Semana que vem em sequência}

⚠️ CONVENÇÕES CRÍTICAS QUE NÃO PODEM ESQUECER:
- `project_id` obrigatório em toda query DB (multi-projeto)
- `user_id` obrigatório (RLS) em toda tabela
- Service-first: lógica DB SEMPRE em services/, nunca direto na page
- PT-BR brasileiro em UI/copy. Anti-IA: banido "plataforma", "solução", "que ajuda", "revolucionário", "simplifica", "otimiza", "robusto"
- Em texto INSTRUCIONAL: "para" em vez de "pra/pro" (decisão CEO 15/05)
- Antes de feature de marketing/visual/estratégia → chama agente G7 ANTES, não depois (decisão CEO 15/05)
- Risco sempre vem com solução. Não terminar mensagem em "tem problema X e agora?" — terminar em "problema X → solução A vs B"
- Testar SEMPRE em prod (hayzer.com.br), não localhost

🛠️ STACK:
- Next.js 16 App Router · React 19 · TypeScript estrito · Tailwind 4 (bug latente: bg-X/Y arbitrary retorna transparente — usar inline style ou .surface-strong)
- Supabase Postgres + Auth + RLS · service_role em insert public da waitlist (RLS bypass, ADR-011)
- Vercel Fluid Compute · Node 24 LTS · Web Analytics + Speed Insights ativos
- Resend (us-east-1) · grupo WhatsApp Hayzer Beta

📂 REPO: github.com/3dresolucaoo-ship-it/TestesiteOficial (main)
📂 PATH LOCAL: C:\Users\infin\OneDrive\Área de Trabalho\bvaz-hub
📌 ÚLTIMO COMMIT: {hash + mensagem curta}
🌐 PROD: https://hayzer.com.br · https://hayzer.com.br/calculadora · https://hayzer.com.br/waitlist/obrigado

👥 TIME G7 (subagents em .claude/agents/) — chamar ANTES de feature em paralelo via Agent(run_in_background:true):
- helena-strategy (decisão grande), diego-designer (visual), felipe-frontend, bruna-backend, julia-qa
- otavio-security, ricardo-devops, paulo-financial, lia-docs
- carla-copy (toda copy), marcos-marketing (canal + funil), sofia-cs (UX leigo)
- /council pra decisões enormes (3 críticos + external-researcher)
````

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
