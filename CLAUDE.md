# Hayzer — Cérebro do Projeto

> SaaS multi-projeto · Next.js 16 · Supabase · Stripe · Mercado Pago · Vercel
> **Sempre comece lendo este arquivo.** Ele aponta pra todo o resto.
>
> 📝 **Nota de naming**: "Hayzer" é o nome oficial desde 14/05/2026 (ver `decisions/009-naming-hayzer.md`). O nome anterior "BVaz Hub" era placeholder. Domínio: **hayzer.com.br** (registrado, em prod com SSL). Subdomínio Vercel `bvaz-hub.vercel.app` continua ativo até futura migração de infra (Onda 5 pós-launch).

---

## 🗺️ MAPA DA DOCUMENTAÇÃO

| Onde | Quando ler |
|---|---|
| `ROADMAP.md` | Antes de começar feature nova / planejar fase |
| **`pillars/SCORES.md`** ⭐ | **TODA SESSÃO** — score atual dos 12 pilares + meta 30d/90d. Lembrar de buscar melhorar. CEO 17/05: "nunca se acomodar com nota atual" |
| `audits/<data>.md` | Pra ver snapshot do projeto numa data |
| `audits/_rolling.md` | Resumo dos últimos meses |
| `decisions/<NNN>.md` | Quando precisar saber **por que** algo é assim |
| `<pasta>/CLAUDE.md` | Antes de editar qualquer arquivo dessa pasta |
| `.env.example` | Pra saber quais env vars são necessárias |
| `skills/_ctx.md` + `skills/_standards.md` | Convenções de código (não estado) |

**CLAUDE.md por pasta** carrega automaticamente quando trabalho ali. Eles descrevem **convenções, status e issues conhecidos** dessa parte específica.

**`pillars/SCORES.md`** = filosofia operacional CEO. Lembrar dele:
1. Toda sessão começa olhando média geral atual + pilar mais baixo
2. Cada commit que sobe score → atualizar `pillars/SCORES.md` na hora
3. Toda segunda 9h = revisão semanal CEO + Helena
4. Pilar com 2 semanas sem revisão = aviso ao owner G7

---

## 📐 REGRAS GLOBAIS

1. **`project_id`** obrigatório em toda query DB (multi-projeto)
2. **`user_id`** obrigatório (RLS) em toda tabela
3. **Não recriar sistema** — corrigir fluxos existentes
4. **Idioma**: PT-BR em UI/console/comentários; código em inglês
5. **Service-first**: lógica de DB SEMPRE em `services/`, nunca direto na page
6. **Bugs não-arrumáveis agora** → comentário `// TODO:` ou `// BUG:` no código
7. **Mudanças com custo de reversão alto** → ADR em `decisions/`

---

## 🔄 PROTOCOLO DE AUTO-ATUALIZAÇÃO

**Quando termino uma tarefa, devo verificar:**

- [ ] Mexi em código de uma pasta? → Atualizar `<pasta>/CLAUDE.md` se status/issues mudaram
- [ ] Apliquei migration? → Atualizar `supabase/migrations/CLAUDE.md`
- [ ] Resolvi bug do ROADMAP? → Marcar `[x]` no `ROADMAP.md`
- [ ] Decisão arquitetural não-trivial? → Criar `decisions/NNN-titulo.md`
- [ ] Adicionei env var? → Atualizar `.env.example`
- [ ] Feature nova em diretório novo? → Criar `<dir>/CLAUDE.md`

**Regra de ouro**: se mudou o estado real do projeto, **a doc precisa refletir isso na mesma sessão**. Não deixe pra depois.

---

## 📅 AUDITORIA MENSAL

1× por mês: rodar `/audit-mensal` (slash command em `.claude/commands/`).
Vai:
1. Re-auditar todo o projeto
2. Gerar `audits/YYYY-MM-DD.md` (snapshot imutável)
3. Comparar com último audit → atualizar CLAUDE.md afetados
4. Adicionar bugs novos no `ROADMAP.md`
5. Atualizar `audits/_rolling.md`

Se passou >35 dias do último audit, eu devo **avisar** e sugerir rodar.

---

## 🎯 STATUS RÁPIDO

- **Versão**: v0.5 (dashboard V4.8 MVP aprovado 17/05)
- **Último audit**: `audits/2026-05-04.md` (próximo audit: ~04/06/2026, automático via Routine)
- **Última sessão**: `sessions/2026-05-20-sessao-ybera-beauty-academy-completo.md` (8-10h maratona — 7 perguntas pendentes 19/05 RESOLVIDAS + Ybera Club CAPTURA PROFUNDA 10 frentes + Mobbr Corrida das Metas + Ybera Academy LMS + Brasil Influencer aprofundado + Gestoras Ybera GAP verificado + Helena briefing executivo Hayzer Beauty 05/07 + 3 routines criadas hoje + comunidades-maker-semanal conectores corrigidos + 4 decisões finais + pivot foco Maker até 27/06). Beauty arquivado (volta 05/07).
- **🎯 PRÓXIMA SESSÃO COMEÇA POR**: `memory/feedback_proximas_acoes_sessao_21-05.md`. Prioridade 1 = MAKER hardwork Fase 1 (5 agents paralelo). 8 decisões CEO pendentes (5 operação noturna + 3 Beauty Helena). INPI segunda 25/05.
- **🏗️ Hayzer Beauty briefing executivo PRONTO**: `strategy/briefing-hayzer-beauty-05-07-executivo.md` (1 pg, 7min leitura). ARPU R$ 197 · TAM R$ 4.7M/ano · meta 12m 50 gestoras = R$ 118k ARR. 3 decisões CEO antes de 05/07: posicionamento sub-marca vs sem brand, R$ 197 único vs 3 tiers, briefar 05/07 vs antecipar 28/06.
- **🎓 Ybera ecossistema 360° capturado** (7 docs): Club operacional + Academy LMS + Brasil Influencer evento (12k pessoas 2025, cresceu 17x em 3 anos) + Mobbr Corrida das Metas + Gestoras GAP verificado (top 2 gestoras 562k+ alcance combinado SEM curso próprio = mercado órfão real).
- **🆕 Memórias 20/05** (5 novas): `feedback_todo_problema_tem_solucao`, `feedback_auto_verificar_github_prs_ceo`, `feedback_modo_trabalho_noturno_enquanto_ceo_dorme`, `feedback_estudo_exaustivo_nao_superficial`, `project_heshiley_gestora_ybera_paris`, `project_hayzer_beauty_mini_academy_por_gestora`, `project_hayzer_beauty_decisoes_20-05`, `feedback_proximas_acoes_sessao_21-05`. Total memórias projeto: 36+.
- **📊 Routines status final 20/05**: 10 ativas + 3 NOVAS criadas hoje (`waitlist-funnel-diario` daily 8h trig_01FYkwcEbHXPMtXEVroi44XP, `production-smoke-test` daily 6h trig_01WeoXnef3uwyNbGnRLgcEvd, `supabase-rls-policy-audit` weekly seg 9h trig_01N2VJa4My5NFVPbiVmvi4Bt). Total: 13 ativas. comunidades-maker-semanal conectores CORRIGIDOS (era só Google Drive, agora 5 conectores).
- **🔥 OPERAÇÃO HARDWORK ATIVA** (memória `feedback_modo_hardwork_19-05-26-06.md`): soft launch acelerado **11-13/06**, launch público **27/06** (era 04/07). 13 agents G7 paralelos amanhã em 3 fases (manhã/tarde/noite). Ownership Matrix em `.claude/ownership-matrix.md`.
- **🎯 Brief Persona Rafael CONSOLIDADO** em `Contextos Projetos/02 - Frentes ativas/5i - Persona Rafael - SÍNTESE FINAL 2026-05-19.md`. Hero copy decidido: híbrido B+C ("Pedido do WhatsApp organizado num lugar só" + sub "Filamento, comissão da Shopee, energia, tempo. No fim do mês você sabe o que sobrou"). Conversão atual 3-6%, potencial 12-18%
- **💰 Calc Pro vira FREEMIUM** (decisão 19/05): ZoomCalc3D existe e é grátis com IA Gemini = ameaça direta R$ 37/mês. Calc Hayzer vira ISCA freemium (5 cálculos/dia grátis → cadastro grátis com gross-up canais → upsell Hayzer SaaS completo)
- **🌳 Arquitetura multi-vertical CONFIRMADA**: Hayzer = umbrella + sub-marcas (Hayzer Maker Vertical 1 + Hayzer Beauty Vertical 2 futuro). Schema `vertical_type` + CSS multi-tema prep AGORA (~3h Bruna+Felipe Fase 1). Mesmo CNPJ, mesma URL, sub-marcas com identidade própria
- **🤖 3 Routines NOVAS criadas via Chrome MCP** (terça 19/05 noite): `concorrencia-diaria-light` (diário 21h `trig_01Rzym6XH1DFBkaLkPQE8ARb`), `concorrencia-semanal-deep` (terça 22h `trig_018m8v3FW656PkVtgwz3huY8`), `comunidades-maker-semanal` (domingo 18:30 `trig_01RBHzDHiuVnbhW4mtwaEP3F`). Total routines ativas: **10/15 quota diária**. 3 spec manual pendente CEO criar em `automation/routines-specs-pending-2026-05-19.md`: mercado-mensal, waitlist-funnel-diario, anthropic-dev-tools-semanal
- **🏭 Ybera Club ESTUDADO ao vivo** via Chrome MCP (logada Heshiley Borges) — análise crítica completa em `Contextos Projetos/02 - Frentes ativas/5j - Estudo Ybera Club ao vivo 2026-05-19.md`. Sistema RPG (Iniciante→Embaixadora Oceania R$15M), multi-nível, limite 20 diretas. Modelo cobrança proposto Hayzer Beauty: gestora paga, afiliadas grátis
- **🏢 CNPJ CEO verificado**: 55.515.732/0001-06, MEI ativo, CNAE 7319-0/99 publicidade. PRECISA desenquadrar MEI→ME antes 1ª venda Calc Pro (Sem 3). Memória `project_empresa_cnpj.md`. Contador faz em 5-10 dias, R$ 250-400 + R$ 200-300/mês recorrente
- **🛠️ Bugs corrigidos 19/05**: dashboard "verde quebrado" (classe `kpi-hero` removida CoverHero.tsx), /orders sem layout (`import '../globals-v4.css'` adicionado), CSV export real implementado em /orders
- **🗑️ Karpathy skill EXCLUÍDA** (decisão 19/05): redundante com 21 memórias persistentes + CLAUDE.md já cobrem. Custo cognitivo > benefício
- **Bugs críticos abertos**: ver `ROADMAP.md` § "🔴 Críticos"
- **📊 Pillars score atual (17/05 noite)**: média **7.4** (meta 30d: 8.0). Design 9.0 · Anti-IA 8.5 · Segurança 9.0 ⬆️ · Pagamento 8.5 · ver `pillars/SCORES.md`
- **🎯 V4.8 dashboard APROVADO MVP** — Felipe inicia conversão React seg 20/05 (ADR-014)
- **🌱 Sistema G7 com memória ativa em 12/12 agentes** — 85 princípios extraídos no estudo dominical 17/05
- **⚡ 2 migrations prod aplicadas hoje via Supabase MCP**: `20260518_webhook_events` (bug Paulo morto) + `20260518_api_rate_limits` (Tier 1 segurança)
- **🤖 7 Routines ATIVAS em prod** (todas com trig ID criadas, 3 novas via Chrome MCP em 2026-05-18 noite): `audit-mensal` (trig_01DJwCxXJGSP3TLcifcyTqGw), `pillars-review-semanal` (trig_01MC2qJxjr6ZC9VmyLSg4fz3), `estudo-g7-semanal` (trig_01AEL5ZnaF3Gu186Rinvdzuq), `pr-review-bot` (trig_01HQv1i6JB221jTSH88N33Dn), **`waitlist-weekly-digest`** (domingo 18h BRT, próx 24/05 — `trig_01JB2QGfrqfoYLnbtZc7V5Ry`, **PENDENTE setar SUPABASE_SERVICE_ROLE_KEY no dashboard**), **`vercel-logs-error-scan`** (diário 22h BRT, próx hoje — `trig_0162e5SZs8NQMtzQZTRcdxvb`, **PENDENTE setar VERCEL_API_TOKEN**), **`status-semanal-helena`** (sexta 17h BRT, próx 22/05 — `trig_014HjSvLPWCQxN7nSNNWoKGU`, zero env vars). Repo: TestesiteOficial. Conectores default: Sentry+Stripe+Supabase+Vercel. Custo: ~109 runs/mês (~24% quota Max). Specs completas em `automation/routines-specs.md`, ADR-015.
- **🛡️ Sistema de auto-revisão de PRs Camadas 1+2+3 ativo** (2026-05-18 madrugada): Camada 1 = email GitHub default (CEO watching o repo) + push mobile opcional. Camada 2 = eu (Claude) verifico PRs pendentes no INÍCIO de cada sessão e aviso CEO (memória persistente). Camada 3 = `pr-review-bot` auto-mergeia PR de Routine + Baixo Risco + Whitelist + 30min wait + zero red flags. Deadline 48h com escape `/extend`. PR fora whitelist (services/, app/, supabase/, etc) NUNCA auto-merge — sempre exige CEO. Camadas 1+2 zero risco. Camada 3 risco baixo, reversível via `git revert`.
- **🔐 API_RATE_LIMIT_SALT setado + redeploy concluído** (2026-05-17 noite): valor random 32 bytes hex. Tier 1 segurança 100% fechado agora. Deploy `D1YRg3yBF` Ready em 1m 8s.
- **🧠 Skill /council reforçada com 5 etapas** (2026-05-17 noite): crítica → crítica-da-crítica → pesquisa profunda → reunião → consenso auditado. Princípio CEO: "melhor escolha do que entregar genérico". 3 agentes (critic-user, critic-claude, external-researcher) ganharam modo "Rodada 2".
- **📋 Helena resolveu 4 decisões CEO** (2026-05-18 madrugada): (1) Calculadora Pro entra Semana 3 com Stripe Payment Link R$ 37, (2) Ritmo PR 30min/semana com gatilho redução automática, (3) Ordem features 1-2-3 OK mas Feature 1 troca lead magnet pela Calculadora Pro como upsell, (4) Deadline PR 48h com escape `/extend` (+48h). Documento completo: `strategy/decisoes-resolvidas-2026-05-18.md`.
- **Pendência prioritária #1 REVISADA 18/05 noite**: **Marca INPI HAYZER — pagar APENAS classe 42 (R$ 440), NÃO pagar classe 35** (parecer revisado em `decisions/parecer-inpi-pagamento-2026-05-18.md`). Pesquisa pePI INPI AO VIVO via Chrome MCP revelou **HAIZER BUILDING SOLUTION LTDA** (haizer.com.br, construção/FRP) com 7 registros em vigor, incluindo **2 na classe 35** (até 2029 e 2030). Marca H HAIZER mista, procurador especializado KALASHI Marcas e Patentes. Probabilidade aprovação classe 35: 10-25% (aposta ruim). Classe 42 LIVRE (0 HAIZER), probabilidade 65-80%. **Ação CEO**: pagar PIX GRU 1 (`29409172357319880`, classe 42, R$ 440), deixar GRU 2 (`29409172357319899`, classe 35) expirar 13/06. Economia R$ 440. Memória: `feedback_verificar_inpi_ao_vivo_antes_parecer_marca.md`.
- **Pendência prioritária #2**: **Post de divulgação canais maker 3D** (Item C). Plano revisado pelo Marcos (15/05) — LinkedIn é canal #7, não #1. Prioridade real: (1) grupos WhatsApp por estado SP/MG/PR (links em impressao3dbrasil.com.br), (2) Grupo Facebook "Impressão 3D Brasil" (50-150k), (3) Instagram nicho (@3dgeekshow 127k, @3dlab_brasil 81k). Antes de divulgar: povoar grupo Hayzer Beta WhatsApp com 5-10 contatos diretos (Héquison/Falconi).
- **Rotação SUPABASE_SERVICE_ROLE_KEY MOVIDA pro `/launch:checklist`** (decisão CEO 18/05 após análise crítica): Supabase 2026 mudou sistema — não há mais "Reset JWT Secret" direto; rotação agora é via Standby Key (zero downtime). NIST SP 800-63B desaconselha rotação periódica sem gatilho real. Chave nunca vazou em plain text. Vai rotacionar na semana 7 pré-launch (~27/06) como item natural de "começar Fase 2 limpa". Memory: `feedback_rotacao_credencial_precisa_gatilho.md`. **RESEND_API_KEY já foi rotacionada** ✅ (nova key `hayzer-prod-v2` ativa em prod, velha deletada via API).
- **Em curso**: **Fase 1 — LANÇAMENTO PÚBLICO 04/07/2026** (~7 semanas). Semana 2 começou 14/05/2026. Time G7 ativo (ADR 008). Painel central: `CEO_COMMAND.md`.
- **Visual Library Hayzer completa (2026-05-18)**: 9 componentes em `components/visual-library/` (TapeBadge, UnderlineMarker, HighlightedText, Stamp, GrainOverlay, GlowPetrol, RootSvg, LottiePlayer, VideoBackground). Página interna `/library` admin-only com showcase vivo. Dep `lottie-react` instalada. Inspirado em audit dos 4 sites do CEO (designspells, mobbin, godly, designvault). Diego catalogou 15 elementos em `design/visual-library-catalog.md` + `design/inspiration-extracts.md`.
- **ModuleShell V4 reusável (2026-05-18)**: `components/dashboard/v4/ModuleShell.tsx` extraído do mockup orders V4 aprovado pelo CEO. Pattern: PageHeader + KpiRow + FilterBar + children. Próximo módulo a migrar: `/orders` real (~1.5h Felipe). Doc em `ModuleShell.md`.
- **Bug build Vercel resolvido (2026-05-18)**: `LibraryShell.tsx` era client component importando `AssetSection.tsx` (Server Component com `node:fs/promises`). Turbopack quebrou 5 deploys consecutivos. Fix: passar AssetSection como prop ReactNode preservando Server Component boundary. Commit `ea4141e` voltou READY.
- **3 ajustes glow Felipe no dashboard V4 (2026-05-18)**: KpiCard ganhou box-shadow petrol + GrainOverlay já estava aplicado + TapeBadge ember substituiu pill-warning. Bug latente descoberto: classe `.kpi-hero` no CSS sem aplicação no componente. Aplicada em `CoverHero.tsx` nesta sessão.
- **Mockup orders V4 APROVADO pelo CEO (2026-05-18)**: `mockups/orders-v4-tom-novo.html` em prod em `hayzer.com.br/mockups/orders-v4-tom-novo.html`. Tape badges, Stamps, MarkerUnderline ember, Fraunces hero, glow petrol. Diego entregou.
- **Backend sino + lupa pronto (Bruna 2026-05-18)**: migration `supabase/migrations/20260518_notifications_and_search.sql` (NÃO aplicada, aguarda CEO) + `services/notifications.ts` + `services/search.ts`. Schema notifications + view materializada `search_index`. CEO aplica via Supabase MCP quando aprovar (recomendação: REVOKE+GRANT extra antes).
- **2 agentes G7 novos (2026-05-18)**: `.claude/agents/ana-analytics.md` (Data Analyst Pleno, lê SQL/PostHog/Vercel Analytics) + `joana-community.md` (Community Manager Pleno, grupos WhatsApp BR maker 3D). Memória ativa pré-populada com 5 princípios cada. Total agentes G7: 17 (era 15).
- **Ybera Paris SaaS briefado (2026-05-18 — projeto 2 G7)**: SaaS pra afiliadas+gestoras Ybera Paris (cosmético capilar premium BR), público 90% mulher. Memória `project_ybera_paris_saas.md`. NÃO mistura com Hayzer (paleta preto+dourado, naming francês, luxo). Modelo "Canva+Notion+CapCut+CRM+IA". Vende status/autoridade/crescimento, não software. Pós-launch Hayzer ou paralelo após MRR estabilizar.
- **Claude Design workflow dominado (2026-05-18)**: produto Anthropic Labs Research Preview em `claude.ai/design`. Workflow: Design System em 5min + Prototype em 7min + Handoff pro Claude Code. Memória `reference_claude_design_workflow.md`. CEO já tem Design System "Default" criado em 20/04 — auditar drift (Task #6).
- **pdftk skill arquivada (2026-05-18)**: movida pra `.claude/skills/_archived/pdftk` (zero uso 30d). Restaurar quando precisar de PDF.
- **Sistema video-prompts/ criado (2026-05-18)**: `brand/video-prompts/` com 7 ideias estruturadas (hero raízes, empty state impressora, loader H, meta batida, login sistema, background ambient, produto 360°). Cada uma com prompt EN + 3 variações + iteracoes.md. CEO gera com IA, eu integro depois.
- **Mercado Pago MCP adicionado (2026-05-18)**: `.mcp.json` com `mercadopago` server pointing pra `https://mcp.mercadopago.com/mcp` com header Authorization `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`. **PENDENTE**: CEO reiniciar Claude Code + setar `MERCADOPAGO_ACCESS_TOKEN` no sistema.
- **Memórias persistentes novas 18/05 (8 arquivos)**: feedback_verificar_produtos_anthropic_antes_afirmar, feedback_buscar_novidades_anthropic_proativamente, feedback_decisao_financeira_mais_criterio, feedback_verificar_inpi_ao_vivo_antes_parecer_marca, project_ybera_paris_saas, reference_claude_design_workflow, feedback_youtube_ask_transcricao, feedback_buscar_youtube_proativamente. Todas indexadas em `~/.claude/projects/<hash>/memory/MEMORY.md`.
- **Dashboard interno — 3 mockups arquiteturais em prod (2026-05-16 noite)**: V1 Dataviz-Rich (refs DWS-like, 3 colunas + 5 charts, 2029 linhas), V2 Hero-Card (card petrol-gradient gigante R$ 12.480 96px Bold + raízes brancas, 1936 linhas), V3 Editorial-Bento Híbrido (Diego v2 refeito, Fraunces dominante, 1877 linhas). CEO escolhe abrindo `hayzer.com.br/mockups`. Felipe converte React em 3-4 dias após escolha. Tipografia consolidada: **Fraunces ≤15% (marca/pausa) + Geist sans 85% (operacional)** com validação científica.
- **Sistema /mockups protegido (2026-05-16)**: route handler `app/mockups/[...slug]/route.ts` lê HTMLs de `mockups/` (não mais `public/mockups/`) após auth Supabase + email em `ADMIN_EMAILS`. Env var setada no Vercel via Chrome MCP, redeploy automatizado.
- **PWA setup (2026-05-16)**: `app/manifest.ts` (Next 16 dinâmico) + `app/icon.svg` (H + raízes) + `app/apple-icon.png` + `public/sw.js` (cache-first assets, network-first HTML, bypass /api e /mockups) + `public/offline.html` + `ServiceWorkerRegister.tsx` wired no layout. Hayzer installable em mobile.
- **Refactor orders.tsx (2026-05-16)**: 695 → 420 linhas (-40%). Extraídos `_components/{helpers.ts, Badge, OrderCostPreview, OrderForm}`. Bugs lint pré-existentes corrigidos (TopBar.tsx, SettingsView.tsx, content/page.tsx + 3 unused-vars). De 4 errors + 3 warnings → 0/0.
- **Sistema Aprendizado Contínuo G7 (2026-05-16 — piloto carla-copy)**: `studies/_index.md` com curadoria 50+ livros por 12 agentes. `studies/carla-copy/README.md` com 4 livros core (Ogilvy/Heath/Halbert/Wiebe). `.claude/agents/carla-copy.md` ganhou seção `## Memória ativa` com 4 categorias (3 padrões CEO + 3 erros + 3 sucessos + princípios da área). `/rcs` evoluiu com auto-propagação pra memória dos agentes. `g7-app/.claude-context/hayzer-snapshot.md` criado pra G7-App ler quando rodar (ADR-003 G7 read-only). Memórias persistentes: `feedback_critica_da_critica.md`, `design_tipografia_fraunces_geist.md`, `design_psicologia_dopamina_saas.md`, `sistema_aprendizado_g7.md`.
- **Landing v2 (2026-05-14)**: paleta night+petrol+ember, Fraunces serif, grain SVG, layout split hero, asymmetric features. Override shadcn via `html[data-layout="marketing"]` (dashboard intacto).
- **Rebranding Hayzer (2026-05-14)**: BVaz Hub → Hayzer. Domínio `hayzer.com.br` registrado (CEO Gabriel Vaz, exp 14/05/2028) + DNS A record `216.198.79.1` + Vercel SSL automático. 11 arquivos atualizados (Logo, Footer, WaitlistForm, WhyDifferent, Step2Form, layout meta tags, termos, privacidade, obrigado, page, BRIEF). ADR completo em `decisions/009-naming-hayzer.md`. Backend ainda usa "bvaz-hub" como project_id Supabase + URL Vercel default — migração Onda 4/5 pós-launch.
- **Segurança Tier 1 (completa · 2026-05-14)**: ✅ HSTS + X-Frame-Options DENY + nosniff + Referrer-Policy + Permissions-Policy ✅ honeypot ✅ time-check ≥2.5s ✅ rate-limit por IP hash (3/24h) ✅ `WAITLIST_IP_SALT` random 32 bytes hex em prod (não mais fallback previsível) ✅ Vercel Bot Protection em modo Log no Firewall (promover pra On após 1-2 semanas de observação). Pendente: idempotência webhook, Upstash quando escalar.
- **Logo (2026-05-14)**: ✅ CEO trouxe arte (H verde com raízes orgânicas, PNG 1536x1024). Implementado em `Logo.tsx` via `<Image>` Next + `mix-blend-screen` pra eliminar fundo preto. Variants sm (h-9) e lg (h-20→24 com pulse petrol). Arquivo: `public/logo-hayzer.png`. Comentado que SVG manual via agente IA falhou (2 rodadas Diego rejeitadas).
- **Foco vertical maker 3D (2026-05-14)**: ADR-010 lavrado. Landing Fase 1 fala SÓ com maker 3D (Rafael). Copy reescrita (filamento, fila de impressão, comissão marketplace, recompra de maker). Frase âncora destaque: "Quatro sistemas, nenhum conversa. Aqui é um, e fala português." CTA: "Quero acesso antecipado". SEGMENT_OPTIONS atualizadas (3 variants 3D + estética + loja física + serviço + outro). Mini-council Carla + Marcos + Helena.
- **Resend setup (2026-05-15)**: SDK instalado + `services/email.ts` + wire-up em `app/waitlist/actions.ts` (graceful: email falha → lead persiste). 3 env vars Vercel (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_WHATSAPP_GROUP_URL`). DNS records (DKIM + MX + SPF) salvos no Registro.br (Modo Avançado de Zona DNS — transição iniciada 14/05, propagada globalmente). Status Resend: `pending` (workflow interno deles, AWS SES por trás, leva 1-24h pra re-verificar após DNS publicar). **Quando verificar, fluxo completo funciona.** `WhatsAppGroupCta.tsx` na tela /obrigado mostra botão verde "Entra no grupo Hayzer Beta" (graceful: oculta se env var vazia).
- **Bug RLS waitlist (2026-05-15, fix `fccd49f`)**: Form em prod retornava erro genérico. Diagnóstico via `SET LOCAL role anon + INSERT`: `supabase-js` faz `INSERT...RETURNING`, e `anon` não tem policy SELECT, daí RETURNING violava RLS. Fix: `addLeadStep1` + `updateLeadStep2` usam `getSupabaseAdmin()` (service_role, bypass RLS). Server Action já valida Zod + bot guards antes — seguro. Bônus: descobri que `SUPABASE_SERVICE_ROLE_KEY` faltava no Vercel — adicionada. Form 100% funcional testado fim-a-fim.
- **Resend us-east-1 verified (2026-05-15)**: domain sa-east-1 estava pending 18h+, recriado em us-east-1 via API → verified em 30s. DKIM + MX trocados no Registro.br via Chrome MCP. **RESEND_API_KEY rotacionada** (chave antiga deletada, `hayzer-prod-v2` ativa). Email transacional funcionando 100% em prod.
- **Calculadora 3D Fase 1 completa (2026-05-15)**: `hayzer.com.br/calculadora` em prod. 5 inputs (filamento, peso, tempo, watts, margem) + 3 outputs (custo/lucro/preço sugerido) + **tabela "preço por canal"** com 5 marketplaces BR 2026 (WhatsApp 0%, ML 12%, Shopee 14%, Amazon 15%, Americanas 16.5%) usando **gross-up correto** `preço/(1-comissão/100)` — diferencial real vs concorrentes (Custos3D, MakerFlow, 3D Prime) que provavelmente erram aí. Plus: **slider visual de margem** com semáforo (verde≥50% / âmbar 20-49 / vermelho<20%) + **dropdown impressora** (8 modelos BR comuns pré-preenchendo W) + **botão "Copiar para o cliente"** (só o valor) + emoji 🥳/🎉 no `/waitlist/obrigado` + WhatsApp CTA brilhante glow verde 40px + grain texture na /obrigado. Build colaborativo G7: Carla (copy), Diego (visual), Marcos (canais marketplace + estratégia revisada sem LinkedIn), Sofia (UX leigo + helpers "dá solução").
- **Phosphor Icons duotone (2026-05-15)**: substituiu lucide-react na Calculadora (Disc/Cube/Hourglass/Plug/TrendUp + WhatsappLogo/ShoppingCart/Storefront). Pacote `@phosphor-icons/react` instalado.
- **Bug Tailwind 4 latente**: classes arbitrary `bg-X/Y` (ex: `bg-card/30`) e `shadow-[..., ...]` retornam transparente/vazio. Workaround: inline style OR utility `.surface-strong` criada em `globals.css`. Aplicar em outros cards afetados depois.
- **Slash command `/rc` → `/rcs` (2026-05-15)**: renomeado pra evitar conflito com comando interno. Conteúdo reforçado pra SEMPRE entregar bloco copiável no fim do output (pra colar depois de `/clear`).
- **Memories persistentes salvas (2026-05-15)**: `feedback_risco_solucao.md` (risco vem com solução) + `feedback_consultar_g7.md` (chamar agente G7 ANTES de feature de marketing/visual/estratégia).
- **PT-BR formal em textos instrucionais (decisão CEO 2026-05-15)**: "para" em vez de "pra/pro" em helpers, labels, botões. Copy de marca anti-IA mantém tom maker BR autêntico.
- **Sessão sábado 16/05 — A→E completos**: trabalho paralelo enquanto CEO editava 11 vídeos + sessão tarde "sem espera até segunda".
  - **OPÇÃO 1 (Diego quick wins)**: 10 fixes visuais — globals.css `--t-body-bg` migrado pra petrol+night (4 radials roxo/azul banidos removidos), `.gradient-text` remapeado fog→petrol, `.glow-purple`→petrol (alias deprecated), `.glow-petrol` + `.glow-ember` novos. 8 arquivos rebranding finalizados (login "H", Sidebar fallback "Hayzer", TopBar sem gradient banido, AppShell LoadingScreen petrol, SettingsView botão+tabs petrol, GeneralTab, checkout x2, catálogo, portfolio).
  - **OPÇÃO 2 (Sofia onboarding)**: `components/EmptyState.tsx` reusável + `components/onboarding/WelcomeDashboard.tsx` (3 passos maker BR) integrado no DashboardView quando `state.projects.length === 0`. Empty states maker BR em `/inventory`, `/products`, `/orders` (Sofia FP-01/02/03 resolvidos).
  - **OPÇÃO 3 (Zod APIs)**: `services/apiSchemas.ts` com checkout/encomenda/quote schemas (UUID, slug regex, trim+max, email RFC, refine pra contato obrigatório). 3 rotas atualizadas: `/api/checkout`, `/api/encomenda`, `/api/catalog/quote`. XSS bloqueado, DOS limitado.
  - **OPÇÃO 4 (Refactor)**: `inventory/page.tsx` 1472→998 linhas (-32%) com helpers.ts + CatBadge + ImageUploader + ItemRow + ItemCard extraídos pra `_components/`. `products/page.tsx` 1113→607 linhas (-45%) com CostPreview + ProductForm + CatalogCard extraídos. **TypeScript check: 0 errors** após corrigir 3 imports faltantes (itemProfit, CAT_COLORS, Clock/Flame/DollarSign) + Zod v4 fix (`invalid_type_error` deprecated). ESLint nos arquivos novos: 0 errors, 0 warnings.
  - **G7 envolvidos sessão**: Carla (3 copy peças marketing), Marcos (27 criadores tier A/B/C + calendário 4 sem), Diego (audit 70 hardcodes roxos), Sofia (5 friction points + 5 empty states reformulados). Tudo em `design/audit-*.md` + `marketing/*`. external-researcher: Inova Simples NÃO qualifica MEI + WG Trade perfil passivo (zero oposições documentadas, risco recalibrado pra 8-10%) + textos backup pra código 394 prontos.
  - **INPI HAIZER confirmado SEM REGISTRO** no pePI INPI ao vivo (busca.inpi.gov.br/pePI) — WG Trade sem standing pra opor. Variantes AYZER/AIZER: só QUAIZER (mista cl42 IA) e ANALAYZER (mista cl42 análise água) em vigor, especificações distintas. Risco final HAYZER: 5-12% (era 10-15% chute).
  - **Bugs pré-existentes detectados** (NÃO introduzidos nesta sessão, mas vale lembrar): `components/TopBar.tsx:38` `Do not assign to module` (next.js error), `components/SettingsView.tsx:70` useEffect setState, vários `unused-vars` em `app/projects/*`.

---

## 🚫 NÃO MEXER SEM AVISAR

- `lib/supabase/schema.sql` (sempre via migration nova)
- `services/paymentConfig.ts` (OAuth + cache — frágil)
- `middleware.ts` (auth global + matcher recém-ajustado pra liberar `.html` em `public/` — não reverter regex)
- `lib/store.tsx` (state global — quebrar = UI quebrada)
- `app/layout.tsx` (Fraunces variable font + `metadataBase` Hayzer + tracking)

---

## 🛠️ STACK

- **Framework**: Next.js 16 App Router · React 19 · TypeScript · Tailwind 4
- **Backend**: Supabase (DB + Auth + RLS + Storage)
- **Pagamento**: Stripe + Mercado Pago (provider abstrato em `payments/`)
- **Deploy**: Vercel (Fluid Compute, Node 24 LTS)
- **Testes**: ❌ ausentes (planejado em ROADMAP fase 4)

---

## 🧠 SKILLS DISPONÍVEIS

### Skills do projeto (operacionais)
`/bug:fix` · `/feature:create` · `/ui:improve` · `/db:sync` · `/deploy:check` · `/catalog:improve` · `/product:flow` · `/stock:sync` · `/sales:setup` · `/mode:fast` · `/mode:analyze`

### Skills G7 (time + processos)
- `/council` — reunião de 3 agentes pra decisão grande
- `/team:meeting` — reunião informal de squad
- `/team:status` — status semanal

### Skills de design
- `/design:component` — cria componente (Diego + Carla + Felipe)
- `/design:audit` — audita visual + UX + QA

### Skills de segurança e launch
- `/security:check` — auditoria Tier 1 (Otávio)
- `/pwa:test` — valida PWA
- `/launch:checklist` — pre-launch completo (todos os squads)

### Skills de marca
- `/brand:update` — atualizar `brand/BRIEF.md`

### Skills externas (em `.claude/skills/`) — 11 skills

#### Anti-IA + Design Premium (núcleo)
- `frontend-design` (Anthropic) — anti-estética IA, design philosophy
- `humanize-writing` (lguz) — remove sinais de IA do texto
- `ui-ux-pro-max` (nextlevelbuilder) — 161 paletas, 57 fontes, 99 UX rules
- `taste` (Leonxlnx) — senior UX, anti-AI slop, metric-based
- `soft-design` (Leonxlnx) — high-end agency feel
- `redesign-audit` (Leonxlnx) — audita AI patterns genéricos
- `minimalist` (Leonxlnx) — clean editorial vibe

#### Implementação
- `design-tokens` (ui-ux-pro) — token architecture 3 camadas
- `ui-styling` (ui-ux-pro) — shadcn/ui + Tailwind + a11y helper
- `image-to-code` (Leonxlnx) — screenshot → código

#### Utilidade
- `pdftk` (awesome-copilot) — manipulação PDF avançada

Skills = **métodos** (como agir). CLAUDE.md = **estado** (o que existe). Não misturar.

---

## 👥 TIME G7 (subagents em `.claude/agents/`)

17 agentes especializados. Chama por nome ou via `/team:*`.

### Squad Estratégia
- **helena-strategy** — Diretora, mão direita do CEO

### Squad Produto
- **diego-designer** · **felipe-frontend** · **bruna-backend** · **julia-qa**

### Squad Operação
- **otavio-security** · **ricardo-devops** · **paulo-financial** · **lia-docs**

### Squad Crescimento
- **carla-copy** · **marcos-marketing** · **sofia-cs** · **ana-analytics** · **joana-community**

### Squad Council (invocado por `/council`)
- **critic-user** · **critic-claude** · **external-researcher**

### Doc completa do time
- `brand/BRIEF.md` — marca consolidada
- `~/OneDrive/Documentos/Contextos Projetos/G7-CONTEXTO-COMPLETO.md` — contexto empresa-casa

---

## 🔌 MCPs ativos (`.mcp.json`)

- **shadcn** — instala componentes shadcn/ui via prompt
- **magicui** — animações Magic UI via prompt
- **context7** — docs atualizadas em tempo real (Next.js, React, Tailwind, Supabase)
- *(já instalados antes)* Supabase MCP · Vercel MCP

⚠️ MCPs novos exigem reiniciar Claude Code pra carregar.

---

## 📞 QUANDO TRAVAR

- Não sei onde algo vive → `audits/<último>.md`
- Não sei **por que** algo é assim → `decisions/`
- Não sei o que fazer agora → `ROADMAP.md`
- Não sei convenção da pasta → `<pasta>/CLAUDE.md`
