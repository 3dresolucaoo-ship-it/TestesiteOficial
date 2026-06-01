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

- **Versão**: v0.6 · Fase 1 em curso · soft launch **13/06** · launch público **27/06/2026** (ADR-029, Bloco 2 commitado 29/05)
- **Último audit**: `audits/2026-05-04.md` (próximo: ~04/06/2026)
- **Última sessão**: 29/05 (10h, plano focar-qualidade + datas hard ADR-029 + Bloco 1 90% + Bloco 2 100%) — commits: `1b7702f` (Bloco 2 onboarding wizard + 7 empty states + tu/voce), `c6d8ad6` (ADR 029). Sessão anterior: 20/05 22h-21/05 madrugada (~9h paralelo G7). Ver `sessions/2026-05-20-hardwork-v4-completo.md`
- **Pillars score**: **8.0** (era 7.9, meta 30d: 8.5) · ver `pillars/SCORES.md` — Bloco 2 entregue subiu A11Y + Conversão

### 🟢 Estado real prod atual (29/05 pós Bloco 2)

**hayzer.com.br** com TODOS 14 módulos visual V4 unificado:
- Sidebar V4 com ícones Lucide coloridos (NÚCLEO petrol, CRESCIMENTO ember, SISTEMA fog)
- KPIs editoriais Fraunces gigante + count-up animado ao mount
- Hover petrol nos cards, badges semânticos (.badge-ok/warn/danger/neutral)
- Watermark "hayzer" reduzido em módulos densos (orders/inventory/finance/etc)
- /orders rico igual mockup: eyebrow SEM N + subtitle maker BR humanizado + KPI delta + sat ATRASADOS ember + botão Filtros + badge tempo
- Loading lento RESOLVIDO: SSR 13→2 queries (Bruna 2 Onda Perf 2 lazy store)
- Skeleton screens visíveis em /orders /crm
- Golden path #1: lead→pedido manual funcional (migration `20260520_leads_converted_order.sql` APLICADA)
- 4 empty states críticos implementados (FP-01 projects, FP-02 finance, FP-03 production, FP-04 orders)

**Branch ember (29/05 — 11 commits à frente de main, push origin feito, deploy preview Vercel buildando):**
- Bloco 2 entregue commit `1b7702f`: wizard 4 steps (aria-modal + focus trap) + 7 empty states com role=status + tu/voce search-replace em 17 arquivos
- ADR 029 commit `c6d8ad6`: data hard 13/06 soft + 27/06 público (supera ADR-028)
- Pendente merge em main + aplicar migration onboarding em prod

**Branches noturna 20-21/05 ainda abertas (em review):**
- `feature/onboarding-wizard` — Felipe, 788 linhas, wizard 3 telas (consolidado em ember Bloco 2)
- `feature/customers-v4` + `feature/customers-backend` — Felipe tela /customers V4 + Bruna customersService LTV
- `feature/perf-tbt-fix` — Bruna LazyMotion + posthog lazy + requestIdleCallback (TBT est. -2.0 a -2.7s)
- `feature/landing-assets-webp` — 36 PNGs→WebP -96% (23.3MB→2.75MB)
- `feature/empty-states-p1` — Sofia, 10 empty states mapeados + 5 P1 implementados
- `feature/landing-v2-pngs-reais` — Diego spec v2 com cliente mulher + maker antes/depois
- `chore/voce-pra-tu` — Carla, search-replace "voce"→"tu" em 17 arquivos (consolidado em ember Bloco 2)

### 🔴 Pendências pré-soft launch 13/06 (ADR-029) — atualizado 01/06 22h

1. ✅ ~~**Aplicar migration onboarding em prod**~~ — aplicada (verificado via SQL 01/06)
2. ✅ ~~**Merge branch ember em main**~~ — via bypass `git push origin feature/ember-...:main` (todos commits em main)
3. ⏳ **Stripe Connect** — testar em sandbox antes 13/06 (Bloco 1 a 90%, fechar até 03/06) — CEO faz
4. ⏳ **Discord webhook + Sentry DSN no Vercel** — vars commitadas, faltam valores em prod — CEO faz (10 min)
5. ⏳ **QA mobile** — checklist em `sessions/2026-05-29-checklist-qa-mobile-v2.md`; agora inclui drag-and-drop kanban (commit 9164f8a) — CEO faz no iPhone+Android
6. ⏳ **Lighthouse rotas internas** — bloqueado por CEO criar `.env.lighthouse.local` com `LIGHTHOUSE_SESSION_COOKIE` extraído do DevTools
7. ✅ ~~**Golden path #1 fim a fim em prod**~~ — VALIDADO 01/06 via SQL JOIN bidirecional (lead.converted_order_id ↔ order.source_lead_id)

### 🟢 Conquistas sessão 01/06 (5h, 6 commits, modo ultracode com workflow G7)

- **Bug P0 raiz resolvido** — `supabase.auth.getUser()` browser trava 8-12s em prod (auth-js 2.106.0 cold-start). Workaround estrutural: WRITES críticos via Server Actions cookie-based.
- **8 Server Actions implementadas** cobrindo todo CRUD leads + pedidos:
  - `createLead` (commit 386ceb6) — golden path passo 1
  - `convertLeadToOrder` (386ceb6) — golden path passo 2
  - `updateLeadStatus` (9164f8a) — drag-and-drop kanban
  - `updateLead` (d48f462) — editar lead
  - `deleteLead` (d48f462) — deletar lead
  - `createOrder` (d48f462) — pedido standalone
  - `updateOrder` (d48f462) — editar pedido
  - `deleteOrder` (d48f462) — deletar pedido
- **Drag-and-drop estilo Trello no CRM** (commit 9164f8a) — @dnd-kit + PointerSensor desktop + TouchSensor mobile long-press 200ms + KeyboardSensor a11y + visual feedback (ghost opacity, drag overlay, drop indicator petrol)
- **3 fixes técnicos prévios** — skeleton eternal /crm /orders (2072be4), erro silencioso → toast (5f0a1f4), ADR 031 documentado (8baf7f4)
- **Validação SQL em prod** — 3 leads testes persistiram com FKs corretas (GP1-ServerAction-Test, GP2-LeadConverter-v2 convertido em pedido god8d0qy, GP3-DragKanban arrastado pra "negotiating")

### 🟠 Pendências TÉCNICAS pós-soft launch 13/06 (Bloco 5)

- Side effects auto de ADD_ORDER (production task + transaction receita + estoque) — `core/flows/processOrder.ts` refactor pra Server Action
- Writes em production / finance / inventory / products (mesmo bug auth, baixa prio pre-launch)
- ✅ ~~Reads completos via SSR initialState (ADR 030 — leads/orders/etc somem após F5)~~ — **Onda A minimal entregue 01/06** (branch `feature/store-ssr-initialstate-core` commit `4a74a74`, push origin, aguarda preview Vercel + CEO validar). 5 core puxados no SSR: orders/production/inventory/transactions/leads. Falta Onda B (lazy load secundários — já parcial via useStoreModule) + Onda C (invalidar cache ao trocar projeto) + passar projectId nas queries
- Pin `@supabase/supabase-js` exato no package.json

### 🟠 Pré-launch público 27/06 (Blocos 5-6)
1. Coleta feedback 5-10 makers soft (13/06 → 17/06)
2. V4 nos 8 módulos restantes (customers, leads, inventory, products, production, finance, content, decisions) — Bloco 5 polimento
3. Sequência email D+1/D+3/D+7 — Bloco 5
4. Landing comparativa (Hayzer vs planilha vs ERP genérico) — Bloco 5
5. Go/No-Go 26/06 23h (golden path #2 fim a fim + Sentry sem P0 + CEO go)

### ⚠️ Status REAL do produto (modo crítico CEO 20/05 23h)

**Landing + setup técnico**: ~85% pronto
**Produto interno (módulos)**: ~50% pronto
**Integração entre módulos** (golden path real do maker): ~30% pronto

**Average ponderado real**: ~**60-65% pra ter usuário real usando o sistema sem bug grave**.

#### O que TÁ pronto pra mostrar (landing/marketing)
- Landing maker 8 sections (Hero, PrinterShowcase com foto real CEO, ProductPreview com mockup orders V4, Features SVGs, WhatsAppFlow, WhyDifferent, FinalCTA, Footer)
- 4 SVGs maker + foto real Bambu A1 do CEO + screenshot mockup
- PostHog ativo (7 eventos waitlist + calc), env vars Vercel, redeploy READY
- SEO 100/100 + robots.txt + sitemap (texto + imagens) + OG metadata
- WebP -91% otimização imagens
- 404 page paleta Hayzer + manifest.json PWA + /api/health
- Calc grátis SEM CAP (magnet eterno — Calc Pro freemium REVOGADA 21/05, ver `decisions/024-calc-gratis-magnet-eterno.md`. Cobrança = Hayzer completo)

#### O que precisa REFACTOR pra ficar usável (módulos internos)
- Dashboard V4 só 1 módulo migrado (orders). Faltam 11 módulos pro shell V4: customers, leads, inventory, products, production, finance, content, decisions, catalogs, portfolios, settings
- Inventory.tsx + Products.tsx refatorados em sub-componentes hoje, MAS não testados visualmente em prod com user real
- Sidebar + FinanceView idem (refatorados, não testados em prod)
- Mobile dos módulos internos: caos. Só landing foi auditada
- Empty states: 5 P1 implementados (Sofia, branch feature/empty-states-p1), 5 P2 pendentes, merge pendente
- Onboarding: wizard CODIFICADO (Felipe, 788 linhas, branch feature/onboarding-wizard), pendente merge + teste visual

#### O que NÃO EXISTE ainda (Wave 1+)
- Tela /customers: CODIFICADA em branch (Felipe V4 + Bruna LTV), pendente merge + QA
- Tela /admin protegida (audit log + email massa) — ADR-026 spec pronta, implementacao pos-launch (ver ADR-028)
- Integração WhatsApp → pedido → produção → estoque → financeiro end-to-end
- Catálogo público polido (bugs reais reportados)
- Sequência email D+1/D+3/D+7

#### Bugs/débitos críticos pra launch 27/06
- **TBT 3.6s** em prod (perfomance) — Hero motion + WaitlistForm Zod no first paint
- **MP OAuth bloqueado** desde 07/05 (painel MP bugado, Stripe Connect cobre)
- **Lighthouse só rodou em /** — rotas internas não medidas
- **Júlia QA agent não existe** (substituí por general-purpose) — sem QA dedicado
- **Sentry não aplicado** (programado 17/06)
- **Cap quota Anthropic** rodando 4-5 agents/noite pode bater limite Max 5x

### Foco atual: MAKER hardwork (29/05 → 27/06) — datas hard ADR-029

- **Soft launch interno**: sábado **13/06** (5-10 makers grupo WhatsApp Beta) · Bloco 4 abre
- **Launch público**: sábado **27/06** (mantém alvo original) · Bloco 6 abre
- 14 dias entre soft e público pra Bloco 5 (polimento pós-feedback)
- Beauty pausado (volta 05/07) · Heshiley/Edu mantêm 1h/semana cada (conversa franca CEO 30/05)
- Operação noturna oficial: sexta 22/05 22h com Bruna + Lia (ADR-020)

### Decisões CEO pendentes (4 abertas)

1. **INPI classe 42**: "Hayzer" LIVRE confirmado pePI 21/05 (noturna) · pagar PIX GRU 1 R$ 440 antes 13/06 · ver `decisions/parecer-inpi-pagamento-2026-05-18.md`
2. **CNPJ MEI→ME**: desenquadrar antes 1ª venda paga do Hayzer completo (sem decisao ainda)
3. **Hayzer Beauty cobrança**: R$ 197 unico vs 3 tiers vs combo gestora-mae · ver doc P3
4. **MP OAuth**: root cause confirmado Paulo (app tipo errado, nao bug) · ADR-027 documentado · decisao pendente: reconfigurar MP agora ou manter Stripe como default ate MRR estavel

> Decisão soft launch 11/06 → RESOLVIDA via ADR-029 (data hard 13/06 + 27/06).
> ADR-028 corte de escopo → SUPERSEDED por ADR-029 (manter escopo, soltar o que ficar pronto, resto pós-launch).

> Calc Pro freemium REVOGADA 21/05 — ver `decisions/024-calc-gratis-magnet-eterno.md`. Setup Stripe Calc Pro e migration `20260520_calc_pro_subscriptions.sql` cancelados.

### Tarefas operacionais TU faz (não eu)
- Postar Post #1 no grupo WhatsApp Hayzer Beta (texto pronto Marcos)
- Conversar Heshiley (3 perguntas: beta tester, co-host, listar 5 gestoras) — sem deadline
- Limpar 7 branches GitHub `claude/*` not-merged via UI

> Historico de mudancas pre-20/05 em `audits/_rolling.md`. Sessão maratona 20/05 detalhe em `sessions/`.

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

## 👥 TIME G7 (subagents em `~/.claude/agents/`, casa única nível-usuário compartilhada por todos os projetos desde 26/05/2026)

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
