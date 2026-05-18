# Sessão 2026-05-17 (manhã → 23h) — Domingo Marathon — V4.x + G7 Estudo + Tier 1 Fechado

> Snapshot imutável. Cole o bloco "Pra continuar depois do /clear" do final desta sessão no início da próxima.

## 🎯 Tema da sessão

Maratona de domingo cobrindo (1) dashboard V4 do MVP iterado 10 vezes em 1 dia até aprovado, (2) primeira rodada formal de estudo G7 dominical com 12 agentes em paralelo, (3) bug crítico Paulo (transaction atômica webhook) resolvido + Tier 1 segurança fechado, (4) descoberta Claude Code Routines incluso no Max plan = sistema 24/7 sem custo extra, (5) sistema pillars/SCORES.md com 12 pilares operacionalizando filosofia CEO de melhoria contínua.

## ⏱️ Duração

~14 horas (manhã → 23h). Múltiplas ondas de agentes G7 em paralelo (background).

## ✅ Entregas

### Dashboard (V4.0 → V4.9, 10 iterações)
1. **V4.0** — `mockups/dashboard/v4-hibrido.html` 2742 linhas, híbrido V1+V3 + correções CEO (auditoria caminho A escolhido) — `general-purpose` brief detalhado
2. **V4.1** — 10 ajustes consensuais (em dash → vírgula, dark soft, light toggle, raízes hover, 9 mecanismos dopamina) — commit `a399db0`
3. **V4.2** — TOP 5 Diego + auditoria G7 paralela Sofia+Júlia+Carla (18 ajustes) — commit `42b8244`
4. **V4.3** — cover-anchor dinâmico 5 estados copy baseado em % meta — commit `16f0da0`
5. **V4.4** — light warm white `#F8F5EE` + ícone Próxima Ação raíz Hayzer + sistema scores criado — commit `3a52c94`
6. **V4.5** — bordas visíveis 0.08→0.14 + Wave 8 Segunda Venda no ROADMAP + Semana 2 gantt — commit `9769fef`
7. **V4.6** — light WARM PESADO + glow petrol atrás + petrol mantém forte (CEO 4ª vez sobre light branco) — commit `8151c3e`
8. **V4.7** — light MARROM ELEGANTE paleta CEO print (off-white bege + cocoa + sand) — commit `a7ac3e9`
9. **V4.8** — light com profundidade (ambient glow cocoa + raízes marrom + body gradient + watermark visível) — commit `5001116` · **APROVADO MVP** — ADR-014, commit `c019409`
10. **V4.9** — Anti-IA 8.5→9.0 (SVG decor-roots lateral autoral + watermark rotação -0.4° + tracking variado) — commit `c94ed55`

### Bug Paulo (race condition webhook → duplicate charge)
- Diagnóstico Bruna: na verdade 5 roundtrips Supabase (não 2 como Paulo achou inicialmente)
- Migration `supabase/migrations/20260518_webhook_events.sql` (tabela + RPC `process_webhook_atomic` em UMA TX Postgres com `ON CONFLICT DO NOTHING` lock atômico)
- Handler `app/api/webhooks/payment/route.ts` refatorado pra chamar RPC
- Aplicada em prod via Supabase MCP `{success:true}` — commit `38b517e`

### Tier 1 Segurança (Otávio fechou)
- CSP report-only header em `next.config.ts` (12 directives)
- Zod completo em APIs autenticadas (`fixedCostCreate/PatchSchema`, `profitGoalSchema`, `paymentConfigSchema` discriminated union por provider)
- Rate-limit DB-based (`services/apiRateLimit.ts` + migration `20260518_api_rate_limits.sql` aplicada prod) — 20/min checkout/encomenda, 10/min quote, fail-OPEN
- 7 rotas API agora protegidas — commit `ea794ec`

### Sistema Aprendizado G7 (12 agentes estudaram em paralelo)
- Carla (Ogilvy on Advertising) · Diego (Refactoring UI) · Helena (Good Strategy Bad Strategy) · Marcos (Hooked) · Sofia (Effortless Experience) · Felipe (Patterns.dev) · Bruna (DDIA) · Otávio (OWASP Top 10:2025 RC1) · Paulo (Stripe Press) · Ricardo (Phoenix Project + Accelerate) · Lia (Docs for Developers) · Júlia (Lessons Learned in Software Testing)
- 85 princípios acionáveis extraídos no total, todos com aplicação Hayzer
- 12/12 agentes com `## Memória ativa` populada (era piloto de 1 agente em 16/05)

### Sistema Scores Pillars (filosofia CEO operacionalizada)
- `pillars/SCORES.md` criado com 12 pilares (Design, Anti-IA, Segurança, Performance, A11y, Mobile, Conversão, Retenção, Pagamento, Documentação, Backend, Estratégia)
- Cada pilar: score atual + meta 30d + meta 90d + owner G7 + plano de ação concreto
- Categorias: 🔴 Não cair (<6) · 🟧 Fortalecer (6-7.9) · 🟢 Expandir (8+)
- Cadência: revisão semanal segunda 9h (CEO + Helena) + via /rcs com evidência
- **Média geral**: 6.9 (manhã) → **7.3** (noite) ⬆️ — 4 pilares subiram +1 ou mais
- `pillars/SCORES.md` adicionado em `CLAUDE.md` raiz com tag **TODA SESSÃO ⭐**

### Wave 8 Segunda Venda (nova ideia CEO)
- Inspiração: vídeo Facebook que CEO mandou (transcrito) sobre app "Segunda Venda" — captura WhatsApp+email cliente marketplace + automações condicionais
- Mapeado em `ROADMAP.md` como Wave 8 (set/2026, Fase 3 Crescimento): 5 abas (anuncios, perguntas, segunda-venda, comissao, importar) + 5 schemas + 5 APIs externas (ML, Shopee, Amazon, Bling, WhatsApp Business)
- Comparativo vence Anymarket (R$ 297) / Plugg.to (R$ 197) / ECOMMENU (R$ 160) porque integra com calculadora + estoque + financeiro

### Marketing (Marcos)
- `marketing/posts-linkedin-pre-launch.md` — 3 versões post LinkedIn (V1 Direta, V2 Provocadora, V3 Educadora)
- Ordem inteligente: V3 (25/05) → V1 (01/06) → V2 (08/06)
- Calendário 7 sem mapeado (7 LinkedIn + 14 Instagram stories)
- 2 riscos críticos identificados: feed sem 20-30 conexões makers = <100 impressões · link no corpo é penalizado (vai no 1º comentário)

### Documentação
- ADR-013 logo H+raízes preservada (regra fixa)
- ADR-014 V4.8 aprovado MVP
- ADR-015 Automação 24/7 via Claude Code Routines
- `studies/anthropic-changelog.md` (novo) — rastreio mensal lançamentos Anthropic + processo (lição Routines)
- `design/dashboard-v4-spec.md` atualizado com Anexo A matriz sand
- `design/palette-sand-matrix.md` (novo, standalone)
- `automation/routines-specs.md` (novo) — 3 routines prontas pra CEO copiar/colar no dashboard

### Diego (paleta HSL + matriz sand 5×5)
- `app/globals.css` — 75 tokens HSL nomeados (10 lineares × 5 cores petrol/fog/ember/night/sand + 25 matriz sand 5×5)
- Resolve bug latente Tailwind 4 `bg-X/Y` quebrando
- Classes Tailwind auto-geradas via `@theme inline`

## 🔴 Blockers / Pendências críticas

- **CEO precisa configurar 3 Routines** no dashboard `code.claude.com` (especificações prontas em `automation/routines-specs.md`, ~15-30min) — destrava sistema 24/7. CEO pediu ajuda Chrome MCP pra configurar.
- **CEO precisa setar `API_RATE_LIMIT_SALT`** no Vercel (salt gerado: `2e67b65deec41ab7456389715858e4dd72ae8b1b90cab3d8f9623c36542cdca9`) — service cai pro WAITLIST_IP_SALT se vazio, mas defense in depth recomenda separar.
- **Felipe começa conversão React V4 → produção** segunda 20/05 (ROADMAP Semana 2 gantt detalhado dia-a-dia).
- **CEO precisa adicionar 20-30 makers 3D no LinkedIn** antes 25/05 (1º post Marcos) — risco crítico identificado de feed sem alcance.

## 📐 Decisões registradas (ADRs)

- `decisions/013-logo-h-raizes-preservada.md` (manhã) — Logo H+raízes congelada, regra fixa pra todos os agentes G7
- `decisions/014-dashboard-v4-aprovado-mvp.md` (tarde) — V4.8 aprovado MVP, Felipe começa React 20/05
- `decisions/015-automacao-24-7.md` (noite) — Claude Code Routines incluso Max plan, 6 opções analisadas, vencedor R$ 0 adicional

## 📦 Commits

Em ordem cronológica (manhã → noite):

```
a399db0 refactor(dashboard): V4.1 — ajustes consensuais CEO 17/05
42b8244 feat(dashboard): V4.2 — TOP 5 Diego + G7 audit consolidado (Sofia+Júlia+Carla)
16f0da0 feat(dashboard): V4.3 — cover-anchor dinâmico (CEO sugestão 17/05)
188576f feat(mockups): adiciona V4.3 híbrido na listagem + marca antigos como descartado
83bad03 feat(g7): memória ativa Helena + Otávio + Paulo (estudo G7 17/05)
3a52c94 feat(v4.4 + pillars): light warm white + ícone raíz + sistema de pontuação por pilar
9769fef feat(v4.5 + roadmap): bordas visíveis + Semana 2 gantt + Wave 8 Segunda Venda
38b517e feat(payments): bug Paulo resolvido — RPC atômica webhook + webhook_events table
8151c3e feat(v4.6): light WARM PESADO + glow petrol atrás + petrol mantém forte (CEO 4ª vez)
1010c41 feat: lembrança pillars/SCORES.md em CLAUDE.md raiz + migration aplicada doc
a7ac3e9 feat(v4.7): light MARROM ELEGANTE (paleta CEO print 17/05)
5001116 feat(v4.8): light com PROFUNDIDADE — ambient glow cocoa + raízes marrom + body gradient
c019409 feat: V4.8 APROVADO MVP + ADR-014 + recalibração honesta scores
17a0813 decision(015): automação 24/7 via Claude Code Routines (R$ 0 adicional)
c94ed55 feat(v4.9): Anti-IA 8.5 → 9.0 — SVG decor lateral autoral + imperfeições humanas
ea794ec feat(noite-17-05): 6 agentes paralelo entregaram TUDO + migrations aplicadas prod
```

(+ vários auto-commits intermediários do hook)

## 🔐 Itens de segurança a lembrar

- **`SUPABASE_SERVICE_ROLE_KEY` rotação** ainda pendente (mantida da sessão anterior — janela noturna)
- **`API_RATE_LIMIT_SALT`** novo gerado: `2e67b65deec41ab7456389715858e4dd72ae8b1b90cab3d8f9623c36542cdca9` — CEO setar no Vercel (recomendado, fail-open se vazio)
- **2 migrations aplicadas em prod hoje via Supabase MCP**: `20260518_webhook_events.sql` (RPC atômica) + `20260518_api_rate_limits.sql` (rate-limit tabela)
- **CSP report-only** em prod desde 17/05 noite — monitorar DevTools console por 2-4 sem antes de promover pra enforcing
- **Vercel BotID** ainda em modo Log (Firewall não bloqueando — promover quando tiver tráfego real)

## 🚀 Próximas ações (priorizadas)

1. **CEO configura 3 Routines** no dashboard `code.claude.com` via Chrome MCP (eu controlo navegador) — destrava 24/7 sistema
2. **CEO seta `API_RATE_LIMIT_SALT`** no Vercel (env var nova)
3. **Felipe começa conversão React V4.9 → produção** segunda 20/05 (ROADMAP Semana 2 gantt)
4. **Marcos: CEO adiciona 20-30 makers 3D no LinkedIn** antes 25/05 (1º post)
5. **Otávio Tier 2** (Dependabot, Sentry, audit log) — Semana 3+
6. **Diego/Felipe**: migrar componentes existentes pra novos tokens HSL/sand (Wave 1)

## 👥 Agentes G7 envolvidos

12 agentes ativos hoje (todos com memória ativa popular agora):
- **Helena** (estratégia) — estudo Rumelt
- **Diego** (designer) — V4 iterações + paleta HSL 75 tokens + matriz sand 5×5 + estudo Refactoring UI
- **Felipe** (frontend) — estudo Patterns.dev (começa conversão React segunda 20/05)
- **Bruna** (backend) — fix bug Paulo RPC atômica + estudo DDIA
- **Otávio** (security) — 3 fixes Tier 1 críticos + Tier 1 restante (CSP + Zod + rate-limit) + estudo OWASP 2025 RC1
- **Carla** (copy) — auditoria V4.2 + estudo Ogilvy
- **Marcos** (marketing) — post LinkedIn + calendário + estudo Hooked
- **Sofia** (CS) — auditoria UX V4.1 + estudo Effortless Experience
- **Júlia** (QA) — auditoria V4.1 12 bugs + estudo Kaner/Bach
- **Paulo** (financial) — detectou bug transaction atômica (estudo Stripe Press)
- **Ricardo** (devops) — specs Routines + estudo Phoenix Project
- **Lia** (docs) — changelog Anthropic + processo mensal + estudo Bhatti

## 🧠 Aprendizados da sessão

> Cada aprendizado segue formato: **"Quando X, faça Y, porque Z."** + agente envolvido.

### Padrões CEO observados

- **2026-05-17**: CEO autoriza "modo aplicar consensuais" — quando há decisão clara entre nós sem dúvida real, aplico sem perguntar de novo. **Quando**: ajustes já discutidos+acordados. **Faça**: aplicar direto, comitar, reportar. **Porque**: pergunta repetida = perda de tempo CEO. → **Todos**
- **2026-05-17**: CEO valoriza honestidade > vanity metric. Pegou inflação minha (9.0 → 8.5 anti-IA). **Quando**: atualizar `pillars/SCORES.md`. **Faça**: rebaixar score se evidência não bate. **Porque**: vanity metric corrompe sistema. → **Helena + Diego**
- **2026-05-17**: CEO odeia print de paleta pra resolver iteração de cor — print > 4 rodadas de descrição verbal. **Quando**: discussão de cor/visual circulando 3+ rodadas. **Faça**: pedir print de referência. **Porque**: economiza horas. → **Diego**
- **2026-05-17**: CEO entende que R$ 588 Max plan = PECHINCHA (não caro) quando usa pesado. **Quando**: avaliar custo de tooling AI. **Faça**: comparar custo equivalente API pura. **Porque**: API pra rodar agente 24/7 = R$ 1500-3000/mês. → **Ricardo + Helena**
- **2026-05-17**: CEO pede "TODOS em paralelo, vários funcionários trabalhando de uma vez" — não 1 por vez. **Quando**: ele autoriza tarefa múltipla. **Faça**: disparar 5-6 agentes simultâneos em background. **Porque**: paralelo 2h vs serial 10h. → **Todos**
- **2026-05-17**: CEO valoriza imperfeições humanas deliberadas (rotação 0.4° watermark, vírgula em R$). **Quando**: design Hayzer anti-IA. **Faça**: introduzir 1-2 imperfeições por componente. **Porque**: assinatura humana, IA não erra "de propósito". → **Diego + Carla**

### Erros cometidos (não repetir)

- **2026-05-17 manhã**: Errei URL `/mockups/v4-hibrido` sem `/dashboard/` nem `.html`. CEO ficou perdido. **Não fazer**: assumir URL sem verificar route handler. **Fazer**: testar URL antes de mandar ao CEO. → **Claude principal**
- **2026-05-17 tarde**: Apliquei light warm muito sutil (`#F8F5EE` quase branco). CEO reclamou 4x antes de eu aplicar PESADO de verdade. **Não fazer**: respostas tímidas quando CEO claramente quer agressivo. **Fazer**: aplicar opção mais extrema, se ele achar muito abaixa. → **Diego + Claude principal**
- **2026-05-17 tarde**: Inflei scores 9.0 anti-IA + design. CEO pegou. **Não fazer**: vanity metric. **Fazer**: 8.5 honesto > 9.0 inflado. → **Helena**
- **2026-05-17 noite**: Sugeri VPS R$ 30-100/mês antes de pesquisar. Routines existe há 1 mês INCLUSO no Max. **Não fazer**: propor solução paga sem pesquisar Anthropic changelog. **Fazer**: leitura mensal changelog (Lia agendou). → **Ricardo + Lia**

### Sucessos (repetir)

- **2026-05-17 manhã**: Disparar 3 agentes G7 em paralelo (Sofia+Júlia+Carla) reduziu audit V4.1 de 45min serial pra ~15min paralelo. **Padrão**: agentes independentes = background paralelo. → **Claude principal**
- **2026-05-17 tarde**: 12 agentes estudando livros em paralelo durante o dia = 12 livros sintetizados num único domingo. Sistema G7 escalou de 1 piloto pra 12 produção. **Padrão**: estudo dominical em paralelo background. → **Todos**
- **2026-05-17 noite**: 6 agentes G7 em paralelo (Otávio+Diego+Marcos+Lia+Ricardo + eu V4.9) entregou TUDO em ~2h. **Padrão**: noite produtiva = onda paralela de 5-6 agentes simultâneos. → **Helena (orquestração)**
- **2026-05-17**: Print da paleta CEO matou 4 rodadas de iteração verbal de cor em 1 mensagem. **Padrão**: solicitar imagem de referência quando discussão circular. → **Diego**
- **2026-05-17**: Honestidade no score (recalibrar pra 8.5) preservou credibilidade do sistema pillars. **Padrão**: nunca defender score sem evidência sólida. → **Helena + Diego**
- **2026-05-17**: Pesquisa WebSearch sobre Claude Code Routines economizou R$ 30-100/mês de VPS pro CEO. **Padrão**: SEMPRE pesquisar features novas Anthropic antes de propor solução paga alternativa. → **Ricardo + Lia**
- **2026-05-17**: Aplicar fix CRÍTICO (bug Paulo) na MESMA SESSÃO da descoberta (estudo Stripe Press → diagnóstico → migration → handler → prod) — não esperar Semana 2. **Padrão**: bug crítico descoberto + fix possível = aplicar agora. → **Bruna + Paulo + Claude principal**

### Conhecimento técnico novo

- **Claude Code Routines** (Anthropic, 14/04/2026): cloud-hosted scheduled tasks INCLUSO no Max plan (15 runs/dia). Roda na infra Anthropic, computador desligado. Triggers: cron / API / GitHub events. Setup via `code.claude.com`. → **Ricardo + Felipe**
- **Refactoring UI princípio #3** (Wathan/Schoger): NUNCA 3 shades, 8-10+ por cor dominante via HSL nomeado. Resolve bug Tailwind 4 `bg-X/Y`. → **Diego + Felipe**
- **OWASP Top 10 2025 RC1**: SSRF absorvido em A01. 2 categorias NOVAS: A03 Supply Chain (Dependabot urgente) + A10 Mishandling Exceptional Conditions (revisar TODOS catch). Security Misconfig saltou #5→#2. → **Otávio**
- **DDIA / Kleppmann**: durabilidade testada > assumida. Toda escrita crítica com `idempotency_key`. Postgres transaction `BEGIN...COMMIT` em handler webhook (lição via Bruna fix bug Paulo). → **Bruna + Paulo**
- **Stripe webhook patterns**: signature OBRIGATÓRIA antes de qualquer lógica de negócio. Insert event_id + processOrder NA MESMA TRANSACTION (não 2 roundtrips). Idempotency-Key determinística (não UUID random). → **Paulo + Bruna**
- **Phoenix Project + Accelerate**: MTTR > MTBF (projete pra recuperar, não pra não falhar). Deploy frequente REDUZ risco (lotes menores = blast radius menor). Lead time elite < 1h. → **Ricardo**
- **Lessons Learned QA (Kaner/Bach)**: Risk-based testing (ordem fixa pre-release: checkout > waitlist > calculadora > dashboard > visual). Rumble strip (input estranho = explorar imediato). Exploratory > scripted. → **Júlia**
- **Hooked Model**: dor interna antes de trigger externo. Valor antes de investimento (sequenciamento). Variable reward > previsível. Habit antes de reduzir cadência externa. → **Marcos + Carla**

### Conhecimento de domínio

- **Anymarket / Plugg.to / ECOMMENU** cobram R$ 160-297/mês pra fazer sync ML/Shopee/Amazon. Hayzer Wave 8 (Segunda Venda integrada) vai vencer integrando com calculadora + estoque + financeiro do mesmo SaaS. → **Marcos + Helena**
- **ML cobra 12-19% comissão, Shopee 14%, Amazon 15%, Magalu variável**. Calculadora já usa gross-up real, Wave 8 expande pra painel completo. → **Marcos + Paulo**
- **LinkedIn algoritmo penaliza link no corpo do post** — sempre colocar no 1º comentário. **Feed sem 20-30 conexões nicho = <100 impressões** mesmo post perfeito. → **Marcos**
- **PostHog é o melhor mirror do Hayzer**: identidade ousada + transparência radical → $920M valuation, 190k teams, zero outbound sales. Brand como infraestrutura (designer employee #5). → **Helena + Marcos**
- **Maker BR usa**: Bambu Lab X1-Carbon · Ender-3 V3 SE · AnkerMake M5C. Vende em WhatsApp + Loja física + ML + Shopee + Amazon. PLA ~R$ 47/kg. → **Carla + Marcos**

## 📝 Estado da memória ativa dos agentes

- **carla-copy** ✅ Padrões CEO + Erros + Sucessos + Ogilvy 7 princípios
- **diego-designer** ✅ Padrões CEO + Erros + Sucessos + Refactoring UI 6 princípios + paleta HSL/sand
- **helena-strategy** ✅ Rumelt 7 princípios
- **marcos-marketing** ✅ Hooked 6 princípios
- **sofia-cs** ✅ Effortless Experience 7 princípios
- **felipe-frontend** ✅ Patterns.dev 7 padrões
- **bruna-backend** ✅ DDIA 7 princípios + fix bug Paulo
- **otavio-security** ✅ OWASP 2025 RC1 + 3 fixes manhã + Tier 1 restante noite
- **paulo-financial** ✅ Stripe Press 7 princípios
- **ricardo-devops** ✅ Phoenix Project + Accelerate 7 princípios + specs Routines
- **lia-docs** ✅ Docs for Developers 7 princípios + changelog Anthropic
- **julia-qa** ✅ Lessons Learned 7 heurísticas

**12/12 agentes** com memória ativa populada (era 1 piloto em 16/05). Sistema G7 escalou.

## 🎬 Tom da sessão

Sessão GIGANTE. CEO entrou em estado de flow. Trabalhou da manhã até as 23h. Quebrou recorde de produtividade do projeto:
- 4084 linhas inseridas / 241 removidas
- 43 arquivos modificados
- 16 commits significativos (+ vários auto)
- 2 migrations aplicadas em prod
- V4 iterado 10 vezes
- 12 agentes estudaram livros em paralelo
- Sistema scores 12 pilares criado e populado

Maior aprendizado meta: **CEO funciona em modo paralelo. Disparar 5-6 agentes simultâneos é o modo operacional padrão dele, não exceção.**
