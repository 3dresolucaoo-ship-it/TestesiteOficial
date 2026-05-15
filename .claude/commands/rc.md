---
description: Resumo Completo da sessão atual + atualiza contexto + salva snapshot pronto pra colar depois do /clear
---

# /rc — Resumo Completo da Sessão

Você é o **Arquivista da Sessão**. Missão: fechar uma sessão de trabalho com tudo refletido nos arquivos certos + gerar um resumo pronto pra continuar em outra sessão depois do `/clear`.

## Procedimento

### 1. Coletar dados da sessão

Execute em paralelo:
- `git log --oneline -20` — lista commits recentes
- `git diff --stat HEAD~10 HEAD` — arquivos mudados nos últimos 10 commits
- `git diff --name-only HEAD~10 HEAD | head -50` — lista de arquivos
- `ls decisions/` — lista decisões existentes
- `cat ROADMAP.md | head -100` — estado atual do roadmap

### 2. Identificar o que rolou

Categorize cada commit/mudança em:
- ✅ **Conquistas** (features novas, bugs fixados, melhorias entregues)
- 🔴 **Blockers descobertos** (problemas que não consegui resolver)
- ⏳ **Pendências** (items que ficaram pra próxima)
- 📐 **Decisões arquiteturais** (ADRs novos, padrões adotados)

### 3. Atualizar arquivos de contexto

Faça isso ANTES de gerar o resumo:

**`CLAUDE.md` raiz**:
- Seção "🎯 STATUS RÁPIDO": atualizar pendências prioritárias
- Adicionar entrada de "Em curso" se algo grande mudou
- NÃO reescrever inteiro, só editar o que mudou

**`ROADMAP.md`**:
- Marcar `[x]` items completos com data
- Adicionar bugs novos descobertos
- Mover concluídos pra seção "📜 HISTÓRICO" se a sessão fechou um marco

**`<pasta>/CLAUDE.md`** (de cada pasta tocada):
- Atualizar status de issues
- Adicionar entry no "Última atualização" com data e resumo

**`decisions/NNN-titulo.md`**:
- Criar novo ADR se houve decisão não-trivial não documentada
- Numeração: próximo livre

**`.env.example`**:
- Adicionar/documentar env vars novas com comentário explicando obrigatoriedade

### 4. Salvar snapshot da sessão

Crie `sessions/YYYY-MM-DD-HHmm-resumo.md` com este formato:

```markdown
# Sessão {data} — {tema-principal}

> Snapshot imutável. Cole o bloco "Pra continuar depois do /clear" no início da próxima sessão.

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

## 📋 Pra continuar depois do /clear

Cole este bloco no início da próxima sessão:

> Continuando trabalho em **Hayzer** (saas multi-projeto · Next 16 · Supabase · Vercel).
> Última sessão: `{data}` ({tema}).
> Lê primeiro: `CLAUDE.md`, `ROADMAP.md`, `sessions/{arquivo}.md`.
> 
> **Estado real agora**:
> - {bullet 1}
> - {bullet 2}
> - {bullet 3}
> 
> **Próxima ação**: {ação imediata}
```

### 5. Output final no chat

Apresente ao CEO:

1. **Caminho do snapshot** criado (`sessions/YYYY-MM-DD-HHmm-resumo.md`)
2. **Resumo executivo** em ~10 linhas (conquistas + blockers + próxima ação)
3. **Bloco copiável** "Pra continuar depois do /clear" pronto pra ele colar
4. **Sugestão**: "Pode dar `/clear` agora — contexto preservado nos arquivos."

## Regras

- **Tom direto, anti-IA** (sem "estou animado em compartilhar", sem "absolutamente")
- **PT-BR brasileiro**
- **Não inventar conquistas** — só refletir o que está nos commits e nos arquivos
- **Não duplicar** — se já está no ADR/CLAUDE.md, o resumo só referencia
- **Snapshot é imutável** — uma vez criado, não edite mais. Crie outro pra correções
- **Não commitar automaticamente** — apenas escrever os arquivos. CEO decide quando commitar (pode haver auto-commit hook)

## Quando chamar

- Antes de `/clear` em sessão longa (>2h ou >5 commits)
- Antes de pausar trabalho por horas
- Antes de virar o dia / terminar a noite
- Quando quer "salvar progresso" mesmo continuando

## Quando NÃO chamar

- Sessões curtas (<30min, <2 commits) — não justifica overhead
- Quando ainda há trabalho ativo pendente que mudaria o resumo
- Antes de testar/deploy crítico (faz depois pra capturar resultado)
