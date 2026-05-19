# Sessão 2026-05-18 — Routines criadas, Claude Design dominado, Ybera Paris briefada

> Snapshot imutável. Cole o bloco "Pra continuar depois do /clear" do final da sessão 2026-05-18 no início da próxima.

## 🎯 Tema da sessão
Sessão maratona: crítica G7 + parecer INPI corrigido ao vivo + visual library 9 componentes + mockup orders V4 + ModuleShell reusável + backend sino+lupa + bug fix build Vercel + 3 Routines criadas via Chrome MCP + Ybera Paris SaaS briefada (segundo produto G7) + Claude Design workflow dominado.

## ⏱️ Duração
~6-7h (16h-22h+ BRT). Sessão longa por causa de re-trabalho do parecer INPI (errei inicial, corrigi com pesquisa pePI ao vivo) e bug do build Vercel que travou 5 deploys.

## ✅ Entregas

1. **Crítica G7 vs Hayzer** (`decisions/critica-g7-vs-hayzer-2026-05-18.md`, 253 linhas). 70% da crítica aceita pelo G7. Resultado: G7 ADR-010 "congelar polish app 3D + portar Hayzer→G7". 5 slash commands criados (`/council`, `/audit-mensal`, `/team-status`, `/sync-bvaz`, `/skip-3d-validate-output`).

2. **Parecer INPI revisado** (`decisions/parecer-inpi-pagamento-2026-05-18.md`, 159 linhas). Errei na 1ª versão (baseei em WG Trade Baterias). Pesquisa pePI INPI AO VIVO via Chrome MCP revelou HAIZER BUILDING SOLUTION LTDA com 7 registros em vigor, incluindo 2 na **classe 35** (que CEO ia depositar). **Veredito revisado: pagar SÓ classe 42 (R$ 440). NÃO pagar classe 35**.

3. **Pendência INPI documentada** (`decisions/pending-inpi-busca-profunda-pre-pagamento.md`, 89 linhas).

4. **Comparativo Gateways BR (Paulo)** (`payments/comparativo-gateways-br-2026-05-18.md`, 418 linhas). Veredito: NÃO pivotar pra AbacatePay agora. Mantém Stripe + MP.

5. **Visual Library completa (Felipe)** — 9 componentes em `components/visual-library/`: TapeBadge, UnderlineMarker, HighlightedText, Stamp, GrainOverlay, GlowPetrol, RootSvg, LottiePlayer, VideoBackground. Página `/library` admin-only funcional. Dep `lottie-react` instalada.

6. **Mockup orders V4 (Diego)** — `mockups/orders-v4-tom-novo.html` (1958 linhas), em prod em `hayzer.com.br/mockups/orders-v4-tom-novo.html`. CEO **APROVOU**.

7. **15 elementos visuais catalogados (Diego)** — `design/inspiration-extracts.md` + `design/visual-library-catalog.md` (1098 linhas).

8. **3 ajustes glow Felipe no dashboard V4** — `.kpi-hero` glow petrol box-shadow + GrainOverlay confirmado já aplicado + TapeBadge ember substituindo pill-warning. Bug descoberto depois: classe `kpi-hero` não estava aplicada no CoverHero.tsx (CSS solto). Corrigido nesta sessão.

9. **ModuleShell reusável (Felipe Task #2)** — `components/dashboard/v4/ModuleShell.tsx` (322 linhas). Pattern extraído do mockup orders pra replicar em 11 outros módulos. Doc em `ModuleShell.md`. TypeScript + ESLint zero erros.

10. **Backend sino + lupa (Bruna Task #4)** — Migration `supabase/migrations/20260518_notifications_and_search.sql` (NÃO aplicada, aguarda CEO) + `services/notifications.ts` + `services/search.ts`. Schema real das tables validado via Supabase MCP, ajustes feitos (orders sem `code`, customers sem `phone`, products id cast text).

11. **Sistema video-prompts/** — `brand/video-prompts/` com 7 ideias estruturadas (hero raízes, empty state impressora, loader H, meta batida, login sistema, background ambient, produto 360°). Cada uma com `prompt.md` + `iteracoes.md`.

12. **Fix bug build Vercel CRÍTICO** — `LibraryShell.tsx` era client component importando `AssetSection.tsx` que usa `node:fs/promises`. Quebrou 5 deploys consecutivos. Fix: passar AssetSection como prop ReactNode preservando Server Component boundary.

13. **3 Routines criadas AO VIVO em claude.ai/code/routines via Chrome MCP**:
   - `waitlist-weekly-digest` (Dom 24/05 18:00) — `trig_01JB2QGfrqfoYLnbtZc7V5Ry`
   - `vercel-logs-error-scan` (Hoje 22:00) — `trig_0162e5SZs8NQMtzQZTRcdxvb`
   - `status-semanal-helena` (Sex 22/05 17:00) — `trig_014HjSvLPWCQxN7nSNNWoKGU`

14. **Ybera Paris SaaS briefado** (`memory/project_ybera_paris_saas.md`). 2º produto G7 paralelo ao Hayzer. Público 90% mulher (afiliadas+gestoras Ybera Paris cosmético capilar premium BR). Preto+dourado, naming francês, luxo. Modelo: Canva+Notion+CapCut+CRM+IA. Vende status/autoridade/crescimento, não software. Pós-launch Hayzer.

15. **Claude Design workflow dominado** (`memory/reference_claude_design_workflow.md`). CEO transcreveu 2 vídeos YouTube (Alessandro Varela + Tropic Hub). Workflow: Design System em 5min + Prototype em 7min + Handoff pro Claude Code. ~35% do limite por design system completo. Aplicação: Hayzer (auditar existente de 20/04) + Ybera SaaS (começar do zero).

16. **2 agentes G7 novos (Lia Task)** — `.claude/agents/ana-analytics.md` (Data Analyst Pleno) + `joana-community.md` (Community Manager Pleno) com memória ativa pré-populada com 5 princípios cada.

17. **3 routines specs (Ricardo Task)** — `automation/routines-specs.md` expandido com Routines 5-7.

18. **pdftk arquivado** em `.claude/skills/_archived/pdftk` (zero uso documentado, libera slot mental).

19. **8 memórias persistentes novas salvas**:
   - `feedback_verificar_produtos_anthropic_antes_afirmar.md`
   - `feedback_buscar_novidades_anthropic_proativamente.md`
   - `feedback_decisao_financeira_mais_criterio.md`
   - `feedback_verificar_inpi_ao_vivo_antes_parecer_marca.md`
   - `project_ybera_paris_saas.md`
   - `reference_claude_design_workflow.md`
   - `feedback_youtube_ask_transcricao.md`
   - `feedback_buscar_youtube_proativamente.md`

## 🔴 Blockers / Pendências críticas

- **INPI pagamento R$ 440** (apenas classe 42) — CEO decide se paga hoje/amanhã. NÃO PAGAR classe 35 (10-25% chance, aposta ruim).
- **Stripe PIX confirmação** — CEO verifica se está habilitado em dashboard.stripe.com → Settings → Payment methods. Se "invite required", Paulo monta plano B (Stripe cartão + AbacatePay PIX paralelo).
- **Mercado Pago MCP** — adicionado em `.mcp.json`, requer **reiniciar Claude Code** + env var `MERCADOPAGO_ACCESS_TOKEN` no sistema. CEO ainda não reiniciou.
- **Migration notifications + search** — Bruna criou, NÃO aplicou. CEO aprova via Supabase MCP.

## 📐 Decisões registradas (ADRs)

- `decisions/critica-g7-vs-hayzer-2026-05-18.md` — crítica + análise estratégica
- `decisions/parecer-inpi-pagamento-2026-05-18.md` — parecer revisado (errei na 1ª, corrigi)
- `decisions/pending-inpi-busca-profunda-pre-pagamento.md` — pendência ação CEO

## 📦 Commits

```
a4b81e8 auto: claude session changes
ea4141e auto: claude session changes (fix bug LibraryShell, build voltou READY)
d3400db feat(dashboard): aplicar 3 ajustes Diego pra puxar glow da landing
a566585 auto: claude session changes (FALHOU build)
166982e auto: claude session changes (FALHOU build, mockup orders entrou aqui)
1efae12 auto: claude session changes (FALHOU build)
6c64fe2 auto: claude session changes (FALHOU build)
67a3ef3 auto: claude session changes (FALHOU build)
d4ca7f5 auto: claude session changes (último READY antes da quebra)
```

15 commits relevantes nesta sessão. 5 falharam no build por causa do bug LibraryShell (corrigido).

## 🔐 Itens de segurança a lembrar

- `VERCEL_API_TOKEN` precisa ser criado pelo CEO no Vercel Settings → Tokens (scope read-only logs + deployments) e setado no dashboard Anthropic Routines pra Routine `vercel-logs-error-scan` funcionar
- `SUPABASE_SERVICE_ROLE_KEY` já existe no Vercel, precisa replicar no dashboard Routines pra `waitlist-weekly-digest` funcionar
- Migration `20260518_notifications_and_search.sql` adicionada mas NÃO aplicada. Aplicar via Supabase MCP quando CEO aprovar (recomendação Bruna: adicionar `REVOKE ALL ON search_index FROM anon, authenticated; GRANT SELECT TO authenticated` antes de aplicar)

## 🚀 Próximas ações (priorizadas)

1. **CEO paga PIX R$ 440 GRU classe 42** (`29409172357319880`) e me avisa
2. **CEO confirma Stripe PIX** habilitado na conta
3. **CEO seta env vars no dashboard Anthropic Routines**: `SUPABASE_SERVICE_ROLE_KEY` (Routine 5) + `VERCEL_API_TOKEN` (Routine 6)
4. **CEO reinicia Claude Code** pra ativar MP MCP
5. **Migrar /orders real pra usar ModuleShell** (próximo módulo, ~1.5h Felipe estimou)
6. **Aplicar migration notifications + search** no Supabase (Bruna recomenda REVOKE+GRANT extras)
7. **Auditar Design System Hayzer no claude.ai/design** criado em 20/04 (Task #6 pendente)
8. **Ybera Paris SaaS planejamento inicial** após launch Hayzer ou em paralelo se CEO quiser

## 👥 Agentes G7 envolvidos

- **Felipe**: visual-library 9 componentes + 3 ajustes glow + ModuleShell + página /library
- **Diego**: mockup orders V4 + 15 elementos + audit 4 sites inspiração
- **Bruna**: schema notifications + search + services
- **Helena**: auditoria automações + agentes (proposta de 3 routines + 2 agentes)
- **Paulo**: comparativo AbacatePay vs Stripe vs MP (650 linhas)
- **Lia**: criou 2 agentes novos (ana-analytics + joana-community)
- **Ricardo**: 3 routines specs adicionadas em automation/routines-specs.md
- **2 external-researcher**: Small Business plugin + Claude Design + MCPs/Conectores

## 🧠 Aprendizados da sessão

### Padrões CEO observados

- **CEO valoriza memória persistente sobre re-perguntar**: ficou irritado quando perguntei novamente sobre Ybera Paris que ele já tinha briefado em sessão anterior. Salvar contexto valioso = obrigação minha. (Evidência: "voce ja fez um estudao do caralho sobre isso proqeu ta me perguntandod enovo")
- **CEO odeia perda de tempo**: sessão maratona de 6-7h mostrou que aceita lentidão SE for trabalho real, mas detesta retrabalho ou enrolação. (Evidência: "estou tentando fazer oque sgilizar o amximo")
- **CEO quer EU operando Chrome MCP, não ele**: ele assiste. Reforça memória existente `feedback_eu_opero_chrome_mcp.md`.
- **CEO espera que eu busque conhecimento em YouTube PT-BR proativamente**: "voce busca mais conheicmento o yotuube é rico nisso".
- **CEO espera transparência no erro**: quando errei parecer INPI inicial, ele questionou e cobrou pesquisa AO VIVO. Resposta correta: admitir, corrigir, salvar memória pra não repetir.

### Erros cometidos (não repetir)

- **Dei parecer financeiro (INPI R$ 880) baseado só em WebSearch sem verificar pePI INPI AO VIVO via Chrome MCP**. Resultado: análise errada (concluí classe 35 livre, mas HAIZER BUILDING SOLUTION tem 2 registros em vigor lá). Custo: 15 min de retrabalho do parecer + perda de confiança. Memória: `feedback_verificar_inpi_ao_vivo_antes_parecer_marca.md`.
- **Disse que "Claude Design não existe como produto Anthropic"** sem verificar. CEO mostrou print do claude.ai/design funcionando. Memória já existia, mas precisou ser reforçada: `feedback_verificar_produtos_anthropic_antes_afirmar.md`.
- **Não tinha memória persistente sobre Ybera Paris** apesar de o CEO já ter mencionado em sessões anteriores. Falha grave. Corrigido salvando `project_ybera_paris_saas.md`.
- **Felipe (G7)** colocou `node:fs/promises` em arquivo `'use client'` (LibraryShell importando AssetSection). Quebrou 5 deploys consecutivos. Aprendizado pra memória dele: Server vs Client boundary em Next.js App Router requer atenção ao import indireto.
- **Felipe (G7)** adicionou classe `.kpi-hero` no CSS sem aplicar em nenhum componente (CSS solto). Resultado: CEO não viu glow no dashboard mesmo após Felipe dizer "feito". Aprendizado: validar visualmente em prod antes de declarar conclusão.

### Sucessos (repetir)

- **Paralelizar agentes G7 agressivamente em background**: Felipe + Bruna + Helena + Paulo + 2 external-researchers + Lia rodaram em paralelo. Acelerou MUITO. CEO valida: "a equipe g7 nao consegue ajudar cada um fazendo ali nao".
- **Memória persistente como first-class citizen**: cada erro/aprendizado vira `.md` em `memory/` indexado em `MEMORY.md`. Próxima sessão chega sabendo.
- **Chrome MCP pra operações que CEO descreve mas não consegue executar sozinho**: criação de Routines, navegação pePI INPI, audit Design System. EU opero, CEO assiste.
- **Crítica honesta sem bajular**: parecer INPI revisado admitiu erro abertamente. CEO valorizou.
- **Auto-commit hook**: garantiu que todo trabalho ficou salvo no repo automaticamente sem CEO intervir.

### Conhecimento técnico novo

- **Claude Design** (`claude.ai/design`): produto Anthropic Labs Research Preview, motor Opus 4.7. Gera Design System em 5min + Prototype em 7min. Integração coesa com Claude Code via skill exportada. Limite separado (~35% por Design System completo). Aplicação direta pro Hayzer + Ybera SaaS. Memória: `reference_claude_design_workflow.md`.
- **YouTube botão "Ask"**: alternativa quando "Show transcript" não funciona. Pede "transcreva o vídeo completo inteiro" e retorna com timestamps. Memória: `feedback_youtube_ask_transcricao.md`.
- **Routines real no Anthropic**: vivem em `claude.ai/code/routines` (NÃO `claude.ai/routines`). Acessível via menu lateral do Claude Code web. Form de criação tem: Nome, Instruções, Repositório, Gatilho (Agendamento com cron Diário/Semanal/Personalizado), Conectores (Sentry/Stripe/Supabase/Vercel default), Comportamento, Permissões.
- **Server vs Client component boundary no Next.js 16**: Server Component (`async` function) importado por Client Component (`'use client'`) faz Turbopack tentar bundlar o Server Component como client e quebra com `node:fs/promises does not support external modules`. Fix: passar Server Component como prop (`children` ou ReactNode) preservando boundary.
- **Vercel deploy queue**: múltiplos commits em sequência criam fila de deploys. Se um falha, próximos COM o mesmo bug também falham. Ver via Vercel MCP `list_deployments`. Recovery: fix + commit limpo + esperar fila esvaziar.
- **HAIZER BUILDING SOLUTION LTDA**: empresa BR de construção (FRP, polímeros reforçados com fibras). Diferente de bateriashaizer.com.br (WG Trade Baterias). 7 registros marca H HAIZER em vigor INPI (classes 09, 11, 12, 19, 35×2, 37). Procurador KALASHI Marcas e Patentes (especializado).

### Conhecimento de domínio

- **Ybera Paris ecossistema**: marca brasileira de cosméticos capilares premium fundada 2005 (Johnathan + Sauana Alves), branding francês "Paris", 45-50 países. Produtos: Fashion Gold, Discovery, Genoma, Botox Capilar, Vello. Modelo: salões parceiros + treinamento + masterclass + distribuição internacional.
- **Afiliadas+gestoras Ybera dores**: falta clientes constantes, parecer autoridade sem ter resultado, recrutar/manter equipe, produzir conteúdo, instabilidade financeira, comparação visual constante.
- **Mercado SaaS feminino premium**: nicho carente. Concorrência fraca em SaaS específico (genéricos como Notion+Canva não atendem psicologia). Ticket alto provável (R$ 500-2000/mês). Modelo "Canva+Notion+CapCut+CRM+IA".
- **Bug Felipe pattern**: 2 erros nesta sessão (LibraryShell client+fs, kpi-hero solto). Padrão: Felipe declara concluído sem validar visualmente em prod. Memória dele precisa reforçar checkpoint "validar em prod antes de declarar done".

## 🔧 Routines criadas (resumo executivo)

| # | Nome | ID | Schedule | Status |
|---|---|---|---|---|
| 5 | waitlist-weekly-digest | trig_01JB2QGfrqfoYLnbtZc7V5Ry | Dom 18:00 BRT | Ativo (próx 24/05) |
| 6 | vercel-logs-error-scan | trig_0162e5SZs8NQMtzQZTRcdxvb | Diário 22:00 BRT | Ativo (próx hoje) |
| 7 | status-semanal-helena | trig_014HjSvLPWCQxN7nSNNWoKGU | Sex 17:00 BRT | Ativo (próx 22/05) |

Total Routines ativas: **7** (4 antigas + 3 novas). Custo: ~109 runs/mês = ~24% quota Max. Repo: TestesiteOficial. Conectores: Sentry, Stripe, Supabase, Vercel.

**Pendente CEO**: setar env vars no dashboard de cada Routine (`SUPABASE_SERVICE_ROLE_KEY` em Routine 5, `VERCEL_API_TOKEN` em Routine 6).

---

## Próximo CLAUDE.md raiz: atualizar

- Última sessão → este arquivo
- Pendência prioritária #1: INPI revisado (R$ 440 só classe 42, R$ 440 classe 35 NÃO pagar)
- Routines: as 3 novas SAÍRAM de "aguardando config" → "ativas, env vars pendentes"
- Adicionar entrada nova: "Ybera Paris SaaS briefado (memória persistente salva)"
- Adicionar entrada nova: "Claude Design workflow dominado (memória persistente salva)"
