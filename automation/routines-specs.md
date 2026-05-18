# Claude Code Routines — Specs para o Dashboard

> **Criado por**: Ricardo (DevOps) · **Data**: 2026-05-17
> **Destino**: https://code.claude.com → Routines
> **Repo alvo**: github.com/3dresolucaoo-ship-it/TestesiteOficial
> **Plano**: Max (15 runs/dia cloud-hosted)
>
> Estas 3 routines consomem no total ~9 runs/mes (usando ~2% da quota diaria).
> CEO sempre revisa PR antes de mergear — nenhuma routine faz auto-merge.
> Se a routine falhar 2x seguidas, o dashboard Anthropic avisa via email.
> Para desligar temporariamente: Dashboard → Routines → Pause.

---

## Routine 1 — estudo-g7-semanal

### Configuracao no dashboard

- **Name**: `estudo-g7-semanal`
- **Repository**: `3dresolucaoo-ship-it/TestesiteOficial`
- **Branch**: `main`
- **Schedule**: cron `0 12 * * 2` — toda terca-feira as 12h UTC (9h BRT)
- **Connectors**: GitHub (auth via OAuth — necessario para criar PR)
- **Allowed tools**: `Read`, `Write`, `Edit`, `Glob`, `Grep`, `Bash`
- **Env vars**: nenhuma (tudo lido do repo)
- **Setup script**: nenhum

### Prompt completo (copy/paste)

```
Voce e o sistema de aprendizado continuo do G7 do Hayzer (SaaS maker 3D, Next.js 16, Supabase, Vercel).

Seu objetivo: processar a leitura semanal dos 12 agentes G7 e atualizar suas memorias ativas.

## Passo 1 — Ler o indice de estudos

Leia `studies/_index.md` para entender a curadoria completa (12 agentes, ~50 livros).

## Passo 2 — Identificar proximas leituras

Para cada agente listado em `studies/_index.md`:
1. Verifique qual livro esta com status "nao lido" (marcado com 🔵)
2. Se o agente tem pasta `studies/<agente>/README.md`, leia para ver o contexto atual
3. Escolha o primeiro livro 🔵 da lista do agente como leitura desta semana

Agentes a processar (em ordem):
- helena-strategy
- carla-copy
- marcos-marketing
- sofia-cs
- diego-designer
- felipe-frontend
- bruna-backend
- otavio-security
- paulo-financial
- ricardo-devops
- lia-docs
- julia-qa

## Passo 3 — Sintetizar principios por agente

Para cada agente, com base no titulo e tema do livro designado para esta semana, extraia 5 principios acionaveis no formato exato:

**P[N] — [Titulo curto do principio]**
Quando [situacao concreta], faca: [acao especifica]. Porque: [razao com fonte]. Aplicacao Hayzer: [como isso se aplica no contexto do projeto — maker 3D, Supabase, Vercel, etc].
(Livro: [Titulo] · Autor · Data: [YYYY-MM-DD])

Os principios devem ser praticos, especificos para a area do agente, e conectados ao contexto Hayzer (maker 3D, launch 04/07/2026).

## Passo 4 — Atualizar memorias ativas

Para cada agente:
1. Leia `.claude/agents/<agente>.md`
2. Encontre a secao `## Memoria ativa` → `### Principios da area`
3. Adicione os 5 novos principios ao final da secao (nao substitua os existentes)
4. Se a secao nao existir, crie-a seguindo o padrao:

```
### Principios da area

**P1 — [titulo]**
[conteudo]
(Livro: ... · Data: YYYY-MM-DD)
```

5. Atualize o status do livro em `studies/_index.md`: 🔵 → 🟡 (se em leitura) ou 🟢 (se sintetizado)

## Passo 5 — Criar branch e PR

1. Crie uma branch chamada `study/g7-weekly-[YYYY-MM-DD]` (data de hoje)
2. Commite todas as alteracoes em `.claude/agents/*.md` e `studies/_index.md`
3. Abra Pull Request com:
   - **Title**: `study: G7 semanal [YYYY-MM-DD] — 12 agentes atualizados`
   - **Body**:
     ```
     ## Resumo da semana de estudos

     **Data**: [data]
     **Agentes processados**: 12

     ## Livros desta semana
     - Helena: [livro]
     - Carla: [livro]
     - Marcos: [livro]
     - Sofia: [livro]
     - Diego: [livro]
     - Felipe: [livro]
     - Bruna: [livro]
     - Otavio: [livro]
     - Paulo: [livro]
     - Ricardo: [livro]
     - Lia: [livro]
     - Julia: [livro]

     ## Principios adicionados
     60 novos principios distribuidos (5 por agente).

     ## Como revisar
     1. Spot-check 3-5 principios aleatorios em agentes diferentes
     2. Marque principios uteis (manter), inuteis (remover) ou errados (corrigir)
     3. Merge quando satisfeito

     > CEO: nao precisa ler tudo — revisao amostral de 5 principios ja cobre o ciclo de aprendizado.
     ```
4. Nao faca auto-merge. Aguarde revisao do CEO.

## Restricoes

- Nao invente fatos sobre os livros — use apenas o que e conhecido sobre o tema/area do livro
- Se um livro e muito tecnico e voce nao tem dados suficientes, extraia principios gerais da area (ex: "boas praticas de copywriting") com nota "(principio geral da area, fonte: conhecimento baseline)"
- Nao altere nenhum outro arquivo alem dos listados acima
- Linguagem dos principios: portugues (sem acentos para compatibilidade de arquivo), mas termos tecnicos em ingles
```

### Output esperado

- Branch `study/g7-weekly-YYYY-MM-DD` criada no repo
- PR aberto com titulo `study: G7 semanal YYYY-MM-DD — 12 agentes atualizados`
- 12 arquivos `.claude/agents/*.md` atualizados (secao `Principios da area`)
- `studies/_index.md` com status de livros atualizados (🔵 → 🟡 ou 🟢)
- Nenhum auto-merge — CEO revisa e aprova

### Validacao pos-execucao

- **Onde ver o resultado**: GitHub → Pull Requests → filtrar por branch `study/g7-weekly-*`
- **Como saber se rodou bem**: PR aberto com 12+ arquivos modificados + corpo descrevendo livros da semana
- **Se rodou mal**: PR ausente ou com menos de 12 arquivos → checar log no dashboard Anthropic (Routines → Run history)
- **Validacao CEO**: spot-check de 5 principios aleatorios em agentes diferentes. Principios incoerentes ou sem conexao com Hayzer = indicam que o livro e muito obscuro → substituir na curadoria

---

## Routine 2 — pillars-review-semanal

### Configuracao no dashboard

- **Name**: `pillars-review-semanal`
- **Repository**: `3dresolucaoo-ship-it/TestesiteOficial`
- **Branch**: `main`
- **Schedule**: cron `0 12 * * 1` — toda segunda-feira as 12h UTC (9h BRT)
- **Connectors**: GitHub (auth via OAuth — necessario para criar Issue e commit)
- **Allowed tools**: `Read`, `Write`, `Edit`, `Glob`, `Grep`, `Bash`
- **Env vars**: nenhuma
- **Setup script**: nenhum

### Prompt completo (copy/paste)

```
Voce e o sistema de monitoramento de pilares de qualidade do Hayzer (SaaS maker 3D, Next.js 16, Supabase, Vercel).

O Hayzer tem 12 pilares de qualidade definidos em `pillars/SCORES.md`. Sua missao semanal: revisar evidencias dos commits da semana, detectar movimentos nos pilares, e reportar.

## Passo 1 — Ler estado atual dos pilares

Leia `pillars/SCORES.md` e registre mentalmente:
- Score atual de cada pilar (coluna "Hoje")
- Owner G7 de cada pilar
- Data da proxima revisao de cada pilar

## Passo 2 — Analisar commits da semana

Execute o comando bash para obter commits dos ultimos 7 dias:

```bash
git log --oneline --since="7 days ago" --format="%h %s" | head -50
```

Para cada commit, classifique qual pilar foi impactado:
- Commits de componentes/UI/CSS → Pilar 1 (Design) e/ou 5 (Acessibilidade) e/ou 6 (Mobile)
- Commits de autenticidade/copy/texto → Pilar 2 (Anti-IA)
- Commits de middleware/auth/validacao → Pilar 3 (Seguranca)
- Commits de build/bundle/imagens → Pilar 4 (Performance)
- Commits de landing/funil/analytics → Pilar 7 (Conversao)
- Commits de email/notificacao/engajamento → Pilar 8 (Retencao)
- Commits de stripe/mp/webhook → Pilar 9 (Pagamento)
- Commits de docs/ADR/CLAUDE.md → Pilar 10 (Documentacao)
- Commits de services/DB/API → Pilar 11 (Backend)
- Commits de ADR/roadmap/decisao → Pilar 12 (Estrategia)

## Passo 3 — Avaliar evidencias de movimento

Para cada pilar com commits relevantes na semana:

1. Leia os arquivos modificados (use `git show <hash> --stat` ou `Glob` + `Read`)
2. Avalie se a mudanca representa:
   - **Subiu**: bug corrigido, feature implementada, auditoria feita, test adicionado
   - **Manteve**: refactor sem impacto funcional, mudanca cosmetica
   - **Caiu**: regressao, remocao de feature, bug introduzido, seguranca piorou

Criterio de rigor: score so muda com evidencia concreta. Refactor sem impacto funcional = manteve.

## Passo 4 — Criar relatorio semanal

Crie o arquivo `pillars/weekly-[YYYY-MM-DD].md` com o seguinte conteudo:

```markdown
# Revisao semanal de pilares — [YYYY-MM-DD]

> Semana de [data inicio] a [data fim]
> Commits analisados: [N]
> Pilares com movimento: [N]

## Movimentos detectados

| Pilar | Score anterior | Score proposto | Evidencia | Acao recomendada |
|---|---|---|---|---|
| [nome] | [score] | [score] | [commit hash + descricao] | [o que fazer] |

## Pilares sem movimento esta semana

[Lista dos pilares sem commits relevantes]

## Alertas

[Pilares com score < 6 ou em queda por 2+ semanas]

## Recomendacao para revisao CEO + Helena (segunda 9h)

[Bullets do que discutir na reuniao semanal]
```

## Passo 5 — Atualizar SCORES.md (se houver movimento confirmado)

Se ha evidencia clara de movimento em algum pilar:
1. Leia `pillars/SCORES.md`
2. Atualize a coluna "Hoje" do(s) pilar(es) afetados
3. Atualize a coluna "Proxima revisao" para a semana seguinte
4. Adicione linha no historico (se `pillars/history.md` existir)
5. Atualize a linha "MEDIA GERAL" com a nova media

Se a evidencia for ambigua, nao atualize o score — apenas documente no relatorio com nota "Score proposto sujeito a validacao CEO".

## Passo 6 — Criar GitHub Issue se pilar caiu

Se algum pilar teve score reduzido OU se qualquer pilar ficou com score < 6:

Crie uma GitHub Issue com:
- **Title**: `[ALERTA] Pilar [nome] em [score] — revisao necessaria`
- **Labels**: `pilar`, `alerta`
- **Body**:
  ```
  ## Pilar em atencao

  **Pilar**: [nome]
  **Score atual**: [N]
  **Score anterior**: [N]
  **Data detectado**: [YYYY-MM-DD]

  ## Evidencia

  [Commits ou ausencia de commits que indicam a queda]

  ## Impacto

  [O que isso significa para o launch 04/07/2026]

  ## Acao sugerida

  [O que o owner G7 deve fazer para recuperar o pilar]

  **Owner G7**: @[owner]
  ```

## Passo 7 — Commitar relatorio

1. Commit direto em main com o arquivo `pillars/weekly-[YYYY-MM-DD].md` e `pillars/SCORES.md` (se atualizado)
2. Mensagem de commit: `pillars: revisao semanal [YYYY-MM-DD]`

Nota: este commit vai em main diretamente (relatorio nao precisa de PR, e observacional). Alteracoes de score proposto = PR separado para revisao CEO.

## Restricoes

- Nao altere scores sem evidencia de commit concreto
- Nao crie PR para o relatorio — apenas commit direto em main
- Nao modifique arquivos fora de `pillars/`
- Se nao houver commits nos ultimos 7 dias, crie o relatorio indicando "semana sem commits" e mantenha todos os scores inalterados
```

### Output esperado

- Arquivo `pillars/weekly-YYYY-MM-DD.md` commitado em main
- `pillars/SCORES.md` atualizado se houver evidencia de movimento
- GitHub Issue criada automaticamente se algum pilar caiu ou ficou abaixo de 6
- Nenhum PR (commit direto em main para o relatorio e OK — e observacional)

### Validacao pos-execucao

- **Onde ver**: GitHub → commits em main filtrados por "pillars:" / GitHub → Issues com label "pilar"
- **Como saber se rodou bem**: arquivo `pillars/weekly-YYYY-MM-DD.md` existindo no repo com data correta
- **Reuniao de segunda**: CEO + Helena usam o relatorio como pauta — abrir `pillars/weekly-[ultima segunda].md` antes de comecar
- **Issue criada**: se aparecer Issue com label "alerta", owner G7 deve agir antes da proxima semana

---

## Routine 3 — audit-mensal

### Configuracao no dashboard

- **Name**: `audit-mensal`
- **Repository**: `3dresolucaoo-ship-it/TestesiteOficial`
- **Branch**: `main`
- **Schedule**: cron `0 9 1 * *` — todo dia 1 do mes as 9h UTC (6h BRT)
- **Connectors**: GitHub (auth via OAuth — necessario para criar Issue)
- **Allowed tools**: `Read`, `Write`, `Edit`, `Glob`, `Grep`, `Bash`
- **Env vars**: nenhuma
- **Setup script**: nenhum

### Prompt completo (copy/paste)

```
Voce e o sistema de auditoria mensal do Hayzer (SaaS maker 3D, Next.js 16, Supabase, Vercel, hayzer.com.br).

Objetivo: gerar um snapshot imutavel do estado do projeto, comparar com o audit anterior, detectar bugs novos, e atualizar o rolling summary. Equivalente ao slash command `/audit-mensal`.

## Passo 1 — Ler contexto

Leia estes arquivos em sequencia:
1. `CLAUDE.md` — estado atual, bugs abertos, status rapido
2. `ROADMAP.md` — features planejadas, bugs criticos, fases
3. `audits/_rolling.md` — historico dos ultimos audits
4. `audits/<data-mais-recente>.md` — ultimo snapshot (para comparacao)
5. `pillars/SCORES.md` — scores atuais dos 12 pilares

## Passo 2 — Auditar estrutura do projeto

Execute os seguintes comandos para mapear o estado atual:

```bash
# Estrutura de pastas de primeiro nivel
find . -maxdepth 2 -type d | grep -v node_modules | grep -v ".git" | sort

# Total de arquivos TypeScript
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | wc -l

# Ultimos 30 commits
git log --oneline --since="30 days ago" --format="%h %ad %s" --date=short | head -30

# Dependencias (package.json)
cat package.json
```

Leia tambem:
- `app/` (estrutura de rotas — quantas pages, quantas API routes)
- `services/` (quantos services)
- `components/` (quantos componentes)
- `supabase/migrations/` (quantas migrations)
- `.claude/agents/` (quantos agentes ativos)

## Passo 3 — Detectar bugs novos

Compare o estado atual com o ultimo audit (`audits/<data>.md`). Procure por:

1. **TODOs e BUGs no codigo**:
```bash
grep -r "// TODO:" . --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "// BUG:" . --include="*.ts" --include="*.tsx" | grep -v node_modules
```

2. **Imports quebrados ou suspeitos**: arquivos que importam de caminhos que nao existem
3. **Env vars sem documentacao**: variaveis em `.env.example` que nao tem descricao
4. **Migrations nao aplicadas**: arquivos em `supabase/migrations/` sem registro
5. **Dependencias desatualizadas**: comparar versoes em `package.json` com releases recentes conhecidas

Para cada bug novo detectado (que nao estava no ultimo audit):
- Classifique: Critico (bloqueia pagamento/auth) / Importante (UX ruim) / Minor (cosmetic)

## Passo 4 — Gerar snapshot imutavel

Crie o arquivo `audits/[YYYY-MM-DD].md` com a seguinte estrutura:

```markdown
# Auditoria Completa — [YYYY-MM-DD]

> **Status**: Arquivada (imutavel)
> Snapshot do projeto na data acima. Nunca editar. Diferencas vs estado atual → ver `ROADMAP.md`.

---

## Estrutura geral

[Arvore de pastas de primeiro nivel com contagem de arquivos por pasta]

## Stack e dependencias

[Versoes das principais dependencias do package.json]

## Banco de dados

- Migrations aplicadas: [N]
- Tabelas conhecidas: [lista das tabelas do schema]
- RLS: [status]

## API e rotas

- Pages: [N]
- API routes: [N]
- Services: [N]

## Agentes G7

- Agentes ativos: [N]
- Com memoria ativa preenchida: [N]
- Estudos sintetizados: [N livros com status 🟢]

## Pilares — snapshot

[Tabela de pilares com scores do dia]

## Bugs detectados neste audit

### Criticos (resolver antes do launch 04/07/2026)
[Lista com descricao + arquivo + linha se disponivel]

### Importantes
[Lista]

### Minor
[Lista]

## Comparacao com audit anterior ([data])

### Resolvidos desde o ultimo audit
[Bugs que existiam antes e agora sumiram]

### Novos desde o ultimo audit
[Bugs detectados agora que nao estavam no anterior]

### Score de pilares: mudancas
[Pilares que subiram ou caíram vs audit anterior]

## Itens de atencao para o CEO

[Top 3-5 itens mais importantes pra CEO ter em mente]
```

## Passo 5 — Atualizar ROADMAP.md

Para cada bug critico detectado que NAO esta no ROADMAP:
1. Leia `ROADMAP.md`
2. Adicione o bug na secao `## Bugs Criticos` ou equivalente
3. Formato: `- [ ] [descricao curta] — detectado em audit [data] · arquivo: [path]`

Nao remova itens existentes do ROADMAP — apenas adicione novos.

## Passo 6 — Atualizar audits/_rolling.md

1. Leia `audits/_rolling.md`
2. Adicione linha na tabela de audits arquivados:
   `| [YYYY-MM-DD] | audits/[YYYY-MM-DD].md | [N bugs criticos] | [N itens cleanup] |`
3. Atualize a secao "Tendencia" se tiver 2+ audits
4. Mova o audit mais antigo pra secao "Arquivados" se tiver mais de 3 audits na tabela

## Passo 7 — Criar GitHub Issue com resumo

Crie uma GitHub Issue com:
- **Title**: `audit: Resumo mensal [YYYY-MM] — [N bugs criticos] criticos`
- **Labels**: `audit`, `mensal`
- **Body**:
  ```
  ## Auditoria mensal — [YYYY-MM-DD]

  **Arquivo**: `audits/[YYYY-MM-DD].md`
  **Bugs criticos novos**: [N]
  **Bugs resolvidos desde ultimo audit**: [N]
  **Media pilares**: [N]/10 (era [N] em [data anterior])

  ## Top 3 itens para o CEO

  1. [item mais importante]
  2. [segundo mais importante]
  3. [terceiro mais importante]

  ## Bugs criticos novos (resolver antes de 04/07/2026)

  [Lista com descricao e arquivo]

  ## Progresso vs launch

  - **Data launch**: 04/07/2026
  - **Semanas restantes**: [calcular]
  - **Status geral**: [no trilho / atrasado / adiantado]

  > Audit completo em `audits/[YYYY-MM-DD].md`. Nao editar — snapshot imutavel.
  ```

## Restricoes

- O arquivo `audits/[YYYY-MM-DD].md` e imutavel — nunca reprocessar uma data ja existente
- Nao delete nenhum arquivo de audit anterior
- Nao remova itens do ROADMAP — apenas adicione
- Se for dia 1 de janeiro, atualize tambem a secao "Historico" de `studies/_index.md` (ano novo = nova curadoria)
- Nao altere `CLAUDE.md` — ele e atualizado manualmente pelo CEO + Helena
```

### Output esperado

- `audits/YYYY-MM-DD.md` criado (snapshot imutavel do mes)
- `audits/_rolling.md` atualizado (nova linha + tendencia)
- `ROADMAP.md` com bugs novos adicionados
- GitHub Issue criada com label `audit` e `mensal` — resumo executivo para o CEO

### Validacao pos-execucao

- **Onde ver**: GitHub → Issues com label "audit" / pasta `audits/` no repo
- **Como saber se rodou bem**: Issue criada no dia 1 do mes + arquivo `audits/YYYY-MM-DD.md` existindo
- **Revisao CEO**: ler a Issue (resumo executivo) — so abrir o arquivo `.md` completo se quiser detalhe
- **Prazo audit seguinte**: sempre no dia 1 do mes seguinte (automatico)

---

## Resumo geral das 3 routines

| Routine | Schedule | Quando (BRT) | Output principal | Auto-merge? | Quota/mes |
|---|---|---|---|---|---|
| `estudo-g7-semanal` | `0 12 * * 2` | Terça 9h | PR com 12 agentes atualizados | Nao | 4 runs |
| `pillars-review-semanal` | `0 12 * * 1` | Segunda 9h | Commit relatorio + Issue se alerta | Nao (so commit observacional) | 4 runs |
| `audit-mensal` | `0 9 1 * *` | Dia 1, 6h | Snapshot + Issue resumo + ROADMAP update | Nao | 1 run |
| **Total** | | | | | **~9 runs/mes (~2% quota)** |

---

## Ordem de configuracao recomendada

1. **Primeiro**: `audit-mensal` — menos critico se falhar na primeira vez, roda 1x/mes
2. **Segundo**: `pillars-review-semanal` — monitora saude do produto, pauta para segunda 9h
3. **Terceiro**: `estudo-g7-semanal` — aprendizado continuo, mais complexo, mais arquivos tocados

---

## Troubleshooting rapido

| Problema | O que checar |
|---|---|
| Routine nao roda | Dashboard → Routines → Run history → ver erro |
| PR nao aparece | GitHub → Pull Requests → filtrar branch `study/g7-weekly-*` |
| Issue nao criada | Verificar se GitHub connector esta autenticado (OAuth) |
| Score mudou sem motivo | SCORES.md — ver commit hash na ultima linha alterada via `git log -p pillars/SCORES.md` |
| Falhou 2x seguidas | Dashboard avisa por email — pausar routine, investigar log, reativar |

---

> **Mantenedor**: Ricardo (DevOps G7) · **Ultima atualizacao**: 2026-05-17
