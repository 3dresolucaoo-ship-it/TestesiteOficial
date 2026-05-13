# BVaz Hub — Cérebro do Projeto

> SaaS multi-projeto · Next.js 16 · Supabase · Stripe · Mercado Pago · Vercel
> **Sempre comece lendo este arquivo.** Ele aponta pra todo o resto.

---

## 🗺️ MAPA DA DOCUMENTAÇÃO

| Onde | Quando ler |
|---|---|
| `ROADMAP.md` | Antes de começar feature nova / planejar fase |
| `audits/<data>.md` | Pra ver snapshot do projeto numa data |
| `audits/_rolling.md` | Resumo dos últimos meses |
| `decisions/<NNN>.md` | Quando precisar saber **por que** algo é assim |
| `<pasta>/CLAUDE.md` | Antes de editar qualquer arquivo dessa pasta |
| `.env.example` | Pra saber quais env vars são necessárias |
| `skills/_ctx.md` + `skills/_standards.md` | Convenções de código (não estado) |

**CLAUDE.md por pasta** carrega automaticamente quando trabalho ali. Eles descrevem **convenções, status e issues conhecidos** dessa parte específica.

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

- **Versão**: v0.3
- **Último audit**: `audits/2026-05-04.md`
- **Bugs críticos abertos**: ver `ROADMAP.md` § "🔴 Críticos"
- **Pendência prioritária #1**: app Mercado Pago Marketplace (OAuth atual rejeita CheckoutPro)
- **Pendência prioritária #2**: migration unificada com colunas faltantes em `orders`, `inventory`, criar `portfolios`/`portfolio_items`
- **Em curso**: **Fase 1 — LANÇAMENTO PÚBLICO 04/07/2026** (8 semanas). Semana 1: landing + waitlist + lead magnet + CRM schema. Time G7 criado em ADR 008. Painel central: `CEO_COMMAND.md` na raiz.

---

## 🚫 NÃO MEXER SEM AVISAR

- `lib/supabase/schema.sql` (sempre via migration nova)
- `services/paymentConfig.ts` (OAuth + cache — frágil)
- `middleware.ts` (auth global — quebrar = 100% offline)
- `lib/store.tsx` (state global — quebrar = UI quebrada)

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
