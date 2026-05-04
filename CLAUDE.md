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

`/bug:fix` · `/feature:create` · `/ui:improve` · `/db:sync` · `/deploy:check` · `/catalog:improve` · `/product:flow` · `/stock:sync` · `/sales:setup` · `/mode:fast` · `/mode:analyze`

Skills = **métodos** (como agir). CLAUDE.md = **estado** (o que existe). Não misturar.

---

## 📞 QUANDO TRAVAR

- Não sei onde algo vive → `audits/<último>.md`
- Não sei **por que** algo é assim → `decisions/`
- Não sei o que fazer agora → `ROADMAP.md`
- Não sei convenção da pasta → `<pasta>/CLAUDE.md`
