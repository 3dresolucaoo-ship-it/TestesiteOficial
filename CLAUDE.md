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

- **Versão**: v0.6 · Fase 1 em curso · soft launch **11/06** · launch público **27/06/2026**
- **Último audit**: `audits/2026-05-04.md` (próximo: ~04/06/2026)
- **Última sessão**: 20/05 noite → 21/05 madrugada (~7h, 22 commits push) — ver `sessions/2026-05-21-madrugada-v4-3c-G7-diagnose.md`
- **Pillars score**: **7.7** (era 7.4, meta 30d: 8.0) · ver `pillars/SCORES.md`

### 🚨 BLOQUEADOR ABERTO (21/05 madrugada) — A.3 vs A.4

CEO escolheu "opção A 3c" (migrar TODOS módulos pro V4 igual /dashboard). 4 módulos foram migrados (/crm /finance /production /orders). MAS classes CSS do ModuleShell (`.kpi-card`, `.filter-bar`, `.page-header`, etc) NUNCA foram extraídas pro `globals-v4.css` — vivem só em `mockups/orders-v4-tom-novo.html` linhas 556-790 + 1195-1213. Resultado: módulos renderizam mas com KPIs em texto cru.

3 vozes G7 (read-only diagnose):
- **Felipe + Diego**: A.4 — fix 45-60min, extrair CSS do mockup. Resultado híbrido (KPIs V4 + sidebar antiga).
- **Helena**: A.3 — reverter 4 módulos, foca golden path. V4 completo fica pra Onda 2 pós-launch.

**Decisão CEO pendente.** Estado atual em prod (commit `284fa2c`): /dashboard perfeito, outros 4 renderizam feio mas funcionais. Sem decisão, não migramos os 7 módulos restantes.

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
- Empty states quase inexistentes (Sofia mapeou FP-01/02/03 mas não implementou)
- Onboarding zero (first-time experience inexistente)

#### O que NÃO EXISTE ainda (Wave 1+)
- Tela /customers completa (lista + perfil + LTV + "sumiu há X dias")
- Tela /admin protegida (audit log + email massa)
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

### Foco atual: MAKER hardwork (19/05 → 27/06)

- Soft launch: 11-13/06 (GO Otávio + GO QA fixed) · Launch público: 27/06 · Beauty pausado (volta 05/07)
- Operação noturna oficial: sexta 22/05 22h com Bruna + Lia (ADR-020)

### Decisões CEO pendentes (3 abertas)

1. **INPI**: pagar PIX GRU 1 R$ 440 classe 42 antes 13/06 (ver `decisions/parecer-inpi-pagamento-2026-05-18.md`)
2. **CNPJ MEI→ME**: desenquadrar antes 1ª venda paga do Hayzer completo
3. **Decisão 7 doc P3**: cobrança Hayzer Beauty (R$ 197 único vs 3 tiers vs combo gestora-mãe)

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
