# ADR 002 — Contexto Distribuído via CLAUDE.md por Pasta

> **Data**: 2026-05-04
> **Status**: ✅ Implementado
> **Custo de reversão**: Médio (apagar arquivos é fácil; reconstruir contexto perdido é caro)

---

## Contexto

Toda vez que `/clear` é dado, Claude perde contexto e tem que reler 30+ arquivos pra entender o projeto. Sem persistência, trabalho repetido a cada sessão. Auditoria gerada custa ~30k tokens. Precisamos de "cérebro do projeto" que sobreviva sessões.

---

## Alternativas consideradas

### A) Arquivo único `CONTEXT.md` gigante
- Um arquivo com tudo
- ❌ Apodrece rápido, edição cara, lê inteiro mesmo quando precisa só de 1 seção

### B) Obsidian
- Vault com backlinks, graph, plugins
- ❌ Backlinks são inúteis pra Claude (não navego grafo)
- ❌ Lock-in em ferramenta humana
- ❌ Plugins não rodam no meu ambiente

### C) `.context/` separado com `state/`, `tasks/`, `features/`
- Pasta dedicada com arquivos por feature/camada
- ❌ Cria sistema novo pra manter
- ❌ Duplica info que já vive no código (apodrece)
- ❌ Conflita com `skills/` existente

### D) **CLAUDE.md distribuído + arquivos cross-cutting na raiz** (escolhido)
- Cada pasta tem seu próprio `CLAUDE.md` (auto-loaded pelo Claude Code)
- Cross-cutting (ROADMAP, decisions, audits) na raiz
- Bugs como `// TODO:` no próprio código
- Changelog = `git log`
- Env vars = `.env.example` (padrão da indústria)

---

## Decisão

**Distribuir documentação por pasta**, mantendo apenas o estritamente cross-cutting na raiz.

Estrutura:
```
CLAUDE.md                         (raiz: regras + mapa)
ROADMAP.md                        (cross-cutting, evolutivo)
.env.example                      (env vars)
decisions/NNN-titulo.md           (ADRs com custo de reversão alto)
audits/YYYY-MM-DD.md              (snapshots imutáveis)
audits/_rolling.md                (resumo dos últimos meses)
<pasta>/CLAUDE.md                 (convenções + status local)
.claude/commands/audit-mensal.md  (slash command pra audit periódico)
```

---

## Consequências

✅ **Positivas**
- Documentação **co-localizada** com código → moveu o código, moveu a doc; deletou código, deletou a doc
- **Auto-load** nativo do Claude Code (não precisa instruir Claude a ler)
- **Zero ferramenta nova** (markdown puro, git versiona, grep busca)
- **Sem conflito** com `skills/` existente (skills = métodos, CLAUDE.md = estado)
- Escala 10x naturalmente (nova pasta → novo CLAUDE.md)

❌ **Negativas**
- Perde "visão tudo num lugar" — precisa de `grep -r "❌"` ou abrir vários arquivos
- Atualização ainda depende de disciplina (mas co-localização força visibilidade)

🔧 **Mitigações**
- `ROADMAP.md` agrega cross-cutting
- `audits/` arquiva snapshots periódicos pra reconstrução
- Slash command `/audit-mensal` força revisão mensal
- `CLAUDE.md` raiz tem "Protocolo de Auto-Atualização" como instrução pra Claude

---

## Referências

- Auditoria base: `audits/2026-05-04.md`
- Slash command: `.claude/commands/audit-mensal.md`
- Conversa de design: este sistema foi proposto, criticado 2× e refinado antes de implementado
