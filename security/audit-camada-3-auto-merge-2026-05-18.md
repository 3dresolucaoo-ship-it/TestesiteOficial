# Audit Camada 3 — Auto-Merge pr-review-bot
> Otávio G7 · 2026-05-18

## Risco geral
- **Score: MÉDIO** (aceitável pra V1, mas tem 4 vetores que merecem guard rail antes do bot acumular ~30 dias de auto-merges sem supervisão)
- **Vetores principais**:
  1. `decisions/*.md` e `audits/*.md` aceitam tamanho ilimitado — Routine envenenada pode publicar ADR/audit fabricado como "verdade do projeto"
  2. `.claude/agents/*.md` permite reescrita de persona/memória — Routine estudo-g7 com fonte ruim pode inserir princípio errado que volta como contexto em TODA sessão futura
  3. `CLAUDE.md` raiz na whitelist sem distinção adição vs remoção — remoção de regra global ("service-first", "project_id obrigatório") passa como "Baixo Risco"
  4. Spec atual não tem **limite de linhas/arquivos**, não tem **blacklist explícita** dentro de pasta whitelist, e não tem **detector de "PR remove mais do que adiciona"**

## Falsos positivos identificados

| Arquivo whitelist | Cenário ruim | Probabilidade | Mitigação proposta |
|---|---|---|---|
| `decisions/*.md` | ADR fabricado por Routine alucinada | Baixa-Média | Exigir prefixo numérico sequencial + bloquear se diff inclui `Status: Aceito` sem CEO author |
| `audits/*.md` | Routine reporta bug crítico inexistente | Baixa | Aceitar — risco coberto por leitura humana posterior |
| `.claude/agents/*.md` | Routine estudo-g7 extrai princípio errado de fonte ruim, princípio entra na memória | **Média** | Limitar diff a **+50 linhas** por PR. Acima escala humano. |
| `CLAUDE.md` raiz | Routine remove acidentalmente regra global | Baixa-Média | Bloquear se diff REMOVE >5 linhas OU toca seção "REGRAS GLOBAIS" / "NÃO MEXER SEM AVISAR" |
| `**/CLAUDE.md` por pasta | Remoção silenciosa de convenção | Baixa | Mesmo guard de "remove > adiciona" |
| `ROADMAP.md` (só adição) | Spec diz "só adição" mas não define COMO valida | Média | Exigir count: `additions > 0 AND deletions == 0` via `gh pr view --json additions,deletions` |
| `automation/routines-specs.md` | Routine altera próprio spec dela mesma (recursivo) | Baixa | **Blacklist explícita** desse arquivo + `automation/pr-review-bot-spec.md` |
| `pillars/SCORES.md` | Routine infla score arbitrariamente | Baixa | Aceitar — owner do pilar revisa toda segunda |
| `studies/<agent>/*.md` | Síntese de livro com viés/erro factual | Baixa | Aceitar — conteúdo só vira "princípio" depois de `/rcs` (passo humano) |

## Red flags faltantes no spec atual

1. **Limite de linhas**: spec não tem teto. PR de 500+ linhas em `.claude/agents/carla-copy.md` passa hoje. **Proposta**: `additions + deletions > 200` → escalar.
2. **Limite de arquivos**: PR tocando 8 arquivos whitelist passa hoje. **Proposta**: `>5 arquivos` → escalar.
3. **Recursividade**: nada impede o bot mergear PR que altera `automation/pr-review-bot-spec.md` ou `.claude/commands/council.md`. **Proposta**: blacklist explícita.
4. **Net deletion**: PR que remove 50 linhas e adiciona 5 passa hoje. **Proposta**: `deletions > additions * 1.5` → escalar.
5. **Seções críticas em CLAUDE.md**: regex de diff buscando linhas removidas em `## REGRAS GLOBAIS`, `## NÃO MEXER SEM AVISAR`, `## STACK` → escalar.
6. **ROADMAP "só adição" não validado**: usar `gh pr view <N> --json additions,deletions` e exigir `deletions == 0`.
7. **Author check**: se conta GitHub comprometida, atacante cria branch `claude/evil` e mergeia sozinho. **Proposta**: `author.login` em allowlist explícita.
8. **PRs sem CI verde**: spec não verifica `gh pr checks <N>`. Routine pode introduzir typo que quebra build e bot mergeia. **Proposta**: `gh pr checks` deve retornar todos PASS ou ausente.

## Patch proposto pro spec (CEO precisa aprovar antes do bot rodar amanhã 8h)

```diff
### 2b. Avaliar risco
**BAIXO (whitelist auto-merge)**: ...
+ **BLACKLIST (sempre escalar, mesmo dentro de whitelist)**:
+ - automation/pr-review-bot-spec.md
+ - .claude/commands/council.md
+ - .claude/commands/*.md (qualquer slash command)
+ - .github/dependabot.yml
+ - .github/workflows/**
+ - qualquer .yml/.yaml na raiz de .github/

### 2c. Red flags
- (existentes)
+ - Linhas removidas em seção `## REGRAS GLOBAIS` ou `## NÃO MEXER SEM AVISAR`
+ - Author NÃO está em allowlist

+ ### 2c.1 Guard rails de volume (gh pr view --json additions,deletions,files)
+ Escalar pra ALTO RISCO se qualquer:
+ - additions + deletions > 200
+ - files.length > 5
+ - deletions > additions * 1.5
+ - Para ROADMAP.md: deletions > 0
+ - Para CLAUDE.md raiz: deletions > 5

+ ### 2c.2 CI check (gh pr checks <N>)
+ - Se houver checks: TODOS devem estar verde
+ - Se fail/pending/cancelled: NÃO auto-merge, comentar e aguardar
+ - Sem checks: ok prosseguir
```

## O que está OK na Camada 3 atual

- Cron 2x/dia (manhã + tarde) — janela razoável pra CEO interceptar via email/push
- 30min wait — bom buffer pra Routine terminar push
- Tipo limitado a Routine (nunca Humano/Dependabot) — bloqueia 99% do vetor externo
- Whitelist por arquivo, não por pasta inteira
- `git revert` documentado — reversão em <1min
- Replay protection (skip se já comentou)
- Deadline 48h + `/extend`
- Permissões: git push direto OFF

## Próxima ação

### Bloqueante antes do bot rodar amanhã 8h (CEO aprova ou não)
- **Aprovar patch do spec** (8 mudanças). Custo: 5min editar `automation/pr-review-bot-spec.md` + atualizar prompt na Routine no dashboard.
- Se CEO aprovar parcialmente: mínimo viável são itens **2c.1 (guard rails volume)** + **blacklist `automation/pr-review-bot-spec.md` recursivo** + **`deletions == 0` pra ROADMAP**.

### Pode ficar pra Semana 3
- CI check (item 2c.2) — depende de Actions
- Allowlist author com `claude[bot]` — depende de mapear nome real no primeiro PR
- Detector de seções críticas em CLAUDE.md via regex

### Sinal de alarme pra reabrir audit
- 3+ auto-merges em sequência sem CEO ler em <48h
- 1 auto-merge que precisou de `git revert`
- Routine `estudo-g7-semanal` adicionar princípio que pareça IA-slop no agente
