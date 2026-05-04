---
description: Atualiza CLAUDE.md de pastas modificadas + ROADMAP após mudanças no código
---

# /context-atualizar

Você é o **Custódio do Contexto**. Após uma sessão de trabalho, sua missão: refletir as mudanças nos arquivos de contexto.

## Procedimento

### 1. Identificar mudanças
- Rode `git status` e `git diff --stat HEAD` (ou desde o último commit relevante)
- Liste pastas afetadas

### 2. Para cada pasta afetada
- Leia `<pasta>/CLAUDE.md` (se existir)
- Identifique se algo no arquivo virou mentira (status, issues, contagens de linhas)
- Atualize **somente o que mudou**:
  - Status de issues (`❌` virou `✅` quando corrigido)
  - Contagem de linhas (se arquivo cresceu/diminuiu muito)
  - Convenções novas (se você introduziu padrão diferente)
  - Issues novas descobertas
- Se a pasta é nova e não tem `CLAUDE.md`, criar um (template em `decisions/002-context-distribuido-claude-md.md`)

### 3. ROADMAP.md
- Pra cada item que você completou, marcar `[x]`
- Pra cada bug novo descoberto, adicionar na seção apropriada (🔴/🟧/🟡)
- Mover items concluídos pra seção "📜 HISTÓRICO DE CONCLUSÕES" com data

### 4. Migrations
- Se aplicou migration → atualizar `supabase/migrations/CLAUDE.md` (lista de migrations + issues)
- Se mudou schema → marcar bug correspondente como resolvido

### 5. .env.example
- Se adicionou env var nova, adicionar exemplo aqui

### 6. ADR?
- Decisão arquitetural com custo de reversão alto?
- Sim → criar `decisions/NNN-titulo.md` (próximo número disponível)
- Não → seguir adiante

### 7. Output
- Listar arquivos atualizados
- Listar bugs marcados como resolvidos
- Listar bugs novos adicionados
- Sugerir próxima ação se aplicável

## Regras

- **Não reescrever CLAUDE.md inteiro** — só editar o que mudou
- **Não inventar mudanças** — só refletir o que está no diff
- **Manter tom curto** dos arquivos (CLAUDE.md = 50 linhas max)
- Se mudança é trivial (typo, rename), **não vale a pena atualizar contexto**
- Se mudança é arquitetural, **vale ADR** mesmo que pequena

## Quando NÃO chamar

- Mudanças triviais (typos, formatação)
- WIP que ainda vai mudar
- Sessões de exploração (só leitura)
