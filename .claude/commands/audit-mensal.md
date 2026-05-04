---
description: Auditoria mensal completa do projeto (atualiza contexto + bugs + roadmap)
---

# /audit-mensal

Você é o **Auditor do BVaz Hub**. Sua missão: re-auditar o projeto, comparar com o último audit e atualizar o "cérebro do projeto".

## Procedimento

### Fase 1 — Re-auditoria
1. Leia `audits/_rolling.md` pra ver quando foi o último audit
2. Se passou >35 dias → seguir; senão → avisar e parar
3. Audite o projeto inteiro (use o protocolo da auditoria base — mesmas seções):
   - Estrutura geral
   - Stack & deps
   - Banco de dados (tabelas, migrations, RLS)
   - Bugs críticos / importantes / menores
   - Rotas API
   - Services
   - Componentes & páginas (linhas)
   - Código morto / descartável
   - Faltando

### Fase 2 — Snapshot
4. Crie `audits/YYYY-MM-DD.md` (data de hoje) com a auditoria completa
   - Use o template de `audits/2026-05-04.md` como base
   - **Imutável** — nunca editar depois de criado

### Fase 3 — Diff vs último audit
5. Leia o último audit
6. Compare lado a lado:
   - **Bugs antigos resolvidos** → marcar `[x]` em `ROADMAP.md`, mover pra "📜 HISTÓRICO"
   - **Bugs novos detectados** → adicionar em `ROADMAP.md` na seção apropriada
   - **Itens recorrentes** (apareceram em 2+ audits) → registrar em `audits/_rolling.md` § "Itens recorrentes"
   - **Mudanças de status em pastas** → atualizar `<pasta>/CLAUDE.md` correspondente

### Fase 4 — Rolling summary
7. Atualize `audits/_rolling.md`:
   - Adicione linha na tabela "Audits arquivados"
   - Mantenha apenas os 3 audits mais recentes na tabela
   - Atualize "Tendência" com observações
   - Atualize "Itens resolvidos entre audits"

### Fase 5 — Output
8. Resumo curto pro usuário:
   - Audits comparados: <data antigo> vs <hoje>
   - Bugs resolvidos: N
   - Bugs novos: N
   - Pastas com status atualizado: lista
   - Próxima ação prioritária recomendada

## Regras

- **Não inventar bugs** — só reportar o que estiver realmente quebrado
- **Não duplicar entradas** — se item já está no ROADMAP, não duplicar
- **Não alterar audits antigos** — eles são imutáveis
- **Tom direto** — sem bajulação, sem introdução longa
- Se algo não está claro (ex: sem migrations recentes mas DB tem mudanças), **perguntar** antes de assumir

## Próximo passo após `/audit-mensal`

Sugerir ao usuário rodar `/context-atualizar` se algum CLAUDE.md de pasta precisar reescrever.
