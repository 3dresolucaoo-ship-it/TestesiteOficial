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
- **Última sessão**: `sessions/2026-05-18-0200-madrugada-camada3-6agentes-paralelo.md` (Camada 3 ativa + 6 agentes G7 paralelo)
- **Bugs críticos abertos**: ver `ROADMAP.md` § "🔴 Críticos"
- **📊 Pillars score atual (17/05 noite)**: média **7.4** (meta 30d: 8.0). Design 9.0 · Anti-IA 8.5 · Segurança 9.0 ⬆️ · Pagamento 8.5 · ver `pillars/SCORES.md`
- **🎯 V4.8 dashboard APROVADO MVP** — Felipe inicia conversão React seg 20/05 (ADR-014)
- **🌱 Sistema G7 com memória ativa em 12/12 agentes** — 85 princípios extraídos no estudo dominical 17/05
- **⚡ 2 migrations prod aplicadas hoje via Supabase MCP**: `20260518_webhook_events` (bug Paulo morto) + `20260518_api_rate_limits` (Tier 1 segurança)
- **🤖 4 Routines ativas em prod** (3 desde 2026-05-17 + pr-review-bot adicionada 2026-05-18 madrugada): `audit-mensal` (dia 1, 9h BRT — `0 12 1 * *` UTC, trig_01DJwCxXJGSP3TLcifcyTqGw), `pillars-review-semanal` (segunda, 9h BRT — `0 12 * * 1` UTC, trig_01MC2qJxjr6ZC9VmyLSg4fz3, **primeira execução HOJE 18/05**), `estudo-g7-semanal` (terça, 9h BRT — `0 12 * * 2` UTC, trig_01AEL5ZnaF3Gu186Rinvdzuq, primeira 19/05), **`pr-review-bot`** (2x/dia 08h e 16h BRT — `0 11,19 * * *` UTC, trig_01HQv1i6JB221jTSH88N33Dn, **primeira execução HOJE 8:05 BRT**). Repo: TestesiteOficial. Conectores: Supabase + Vercel. Permissão git push direto OFF (cria PR sempre, exceto pr-review-bot que faz auto-merge via gh CLI nas condições da Camada 3). Custo: ~70 runs/mês (~16% quota Max). Specs em `automation/routines-specs.md` e `automation/pr-review-bot-spec.md`, ADR-015.
- **🛡️ Sistema de auto-revisão de PRs Camadas 1+2+3 ativo** (2026-05-18 madrugada): Camada 1 = email GitHub default (CEO watching o repo) + push mobile opcional. Camada 2 = eu (Claude) verifico PRs pendentes no INÍCIO de cada sessão e aviso CEO (memória persistente). Camada 3 = `pr-review-bot` auto-mergeia PR de Routine + Baixo Risco + Whitelist + 30min wait + zero red flags. Deadline 48h com escape `/extend`. PR fora whitelist (services/, app/, supabase/, etc) NUNCA auto-merge — sempre exige CEO. Camadas 1+2 zero risco. Camada 3 risco baixo, reversível via `git revert`.
- **🔐 API_RATE_LIMIT_SALT setado + redeploy concluído** (2026-05-17 noite): valor random 32 bytes hex. Tier 1 segurança 100% fechado agora. Deploy `D1YRg3yBF` Ready em 1m 8s.
- **🧠 Skill /council reforçada com 5 etapas** (2026-05-17 noite): crítica → crítica-da-crítica → pesquisa profunda → reunião → consenso auditado. Princípio CEO: "melhor escolha do que entregar genérico". 3 agentes (critic-user, critic-claude, external-researcher) ganharam modo "Rodada 2".
- **📋 Helena resolveu 4 decisões CEO** (2026-05-18 madrugada): (1) Calculadora Pro entra Semana 3 com Stripe Payment Link R$ 37, (2) Ritmo PR 30min/semana com gatilho redução automática, (3) Ordem features 1-2-3 OK mas Feature 1 troca lead magnet pela Calculadora Pro como upsell, (4) Deadline PR 48h com escape `/extend` (+48h). Documento completo: `strategy/decisoes-resolvidas-2026-05-18.md`.
- **Pendência prioritária #1**: **Marca INPI HAYZER — GRUs EMITIDAS 15/05/2026** ✅ (ADR-012). Titular: **PF (Gabriel Ribeiro Nazareth, CPF 13099225940)**. Nominativa nas classes 35 (gestão comercial) + 42 (SaaS/software), código 389 (lista pré-aprovada, R$ 440/classe = R$ 880 total). **GRU 1**: `29409172357319880` (classe 42, R$ 440) · **GRU 2**: `29409172357319899` (classe 35, R$ 440). Ambas vencem **13/06/2026**. PDFs em `C:\Users\infin\Downloads\`. **Próximo**: CEO paga via PIX (sugerido até 20/05), depois eu deposito a marca em e-Marcas via Chrome MCP usando essas GRUs como referência. Verificação de colisão concluída: HAYZER limpo, HAIZER existe em classe 9 (baterias WG Trade) — risco ~15% de oposição, aceitável.
- **Pendência prioritária #2**: **Post de divulgação canais maker 3D** (Item C). Plano revisado pelo Marcos (15/05) — LinkedIn é canal #7, não #1. Prioridade real: (1) grupos WhatsApp por estado SP/MG/PR (links em impressao3dbrasil.com.br), (2) Grupo Facebook "Impressão 3D Brasil" (50-150k), (3) Instagram nicho (@3dgeekshow 127k, @3dlab_brasil 81k). Antes de divulgar: povoar grupo Hayzer Beta WhatsApp com 5-10 contatos diretos (Héquison/Falconi).
- **Rotação SUPABASE_SERVICE_ROLE_KEY MOVIDA pro `/launch:checklist`** (decisão CEO 18/05 após análise crítica): Supabase 2026 mudou sistema — não há mais "Reset JWT Secret" direto; rotação agora é via Standby Key (zero downtime). NIST SP 800-63B desaconselha rotação periódica sem gatilho real. Chave nunca vazou em plain text. Vai rotacionar na semana 7 pré-launch (~27/06) como item natural de "começar Fase 2 limpa". Memory: `feedback_rotacao_credencial_precisa_gatilho.md`. **RESEND_API_KEY já foi rotacionada** ✅ (nova key `hayzer-prod-v2` ativa em prod, velha deletada via API).
- **Em curso**: **Fase 1 — LANÇAMENTO PÚBLICO 04/07/2026** (~7 semanas). Semana 2 começou 14/05/2026. Time G7 ativo (ADR 008). Painel central: `CEO_COMMAND.md`.
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

15 agentes especializados. Chama por nome ou via `/team:*`.

### Squad Estratégia
- **helena-strategy** — Diretora, mão direita do CEO

### Squad Produto
- **diego-designer** · **felipe-frontend** · **bruna-backend** · **julia-qa**

### Squad Operação
- **otavio-security** · **ricardo-devops** · **paulo-financial** · **lia-docs**

### Squad Crescimento
- **carla-copy** · **marcos-marketing** · **sofia-cs**

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
