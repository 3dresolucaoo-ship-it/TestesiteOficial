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

- **Versão**: v0.4
- **Último audit**: `audits/2026-05-04.md` (próximo audit: ~04/06/2026)
- **Bugs críticos abertos**: ver `ROADMAP.md` § "🔴 Críticos"
- **Pendência prioritária #1**: **Resend domain verify** (✅ DNS propagado globalmente, ⏳ Resend interno re-verificando, deve completar em 1-24h sozinho). Quando verificar, email transacional + welcome com botão grupo WhatsApp funcionam 100%.
- **Pendência prioritária #2**: **Marca INPI** (depositar HAYZER nas classes 35 + 42 — R$ 415-1660 por classe) — proteger antes do post LinkedIn público. Posso guiar via Chrome no gov.br/inpi.
- **Pendência prioritária #3**: **Rotacionar SUPABASE_SERVICE_ROLE_KEY** (adiada 15/05 pra janela noturna/madrugada). Motivo: "Reset JWT Secret" do Supabase invalida anon + service_role AO MESMO TEMPO, causando ~2-5min de downtime do form até atualizar as 2 env vars no Vercel + redeploy. Risco real baixo (chave nunca apareceu em plain text no chat, só via clipboard sistema). **RESEND_API_KEY já foi rotacionada** ✅ (nova key `hayzer-prod-v2` ativa em prod, velha deletada via API).
- **Em curso**: **Fase 1 — LANÇAMENTO PÚBLICO 04/07/2026** (~7 semanas). Semana 2 começou 14/05/2026. Time G7 ativo (ADR 008). Painel central: `CEO_COMMAND.md`.
- **Landing v2 (2026-05-14)**: paleta night+petrol+ember, Fraunces serif, grain SVG, layout split hero, asymmetric features. Override shadcn via `html[data-layout="marketing"]` (dashboard intacto).
- **Rebranding Hayzer (2026-05-14)**: BVaz Hub → Hayzer. Domínio `hayzer.com.br` registrado (CEO Gabriel Vaz, exp 14/05/2028) + DNS A record `216.198.79.1` + Vercel SSL automático. 11 arquivos atualizados (Logo, Footer, WaitlistForm, WhyDifferent, Step2Form, layout meta tags, termos, privacidade, obrigado, page, BRIEF). ADR completo em `decisions/009-naming-hayzer.md`. Backend ainda usa "bvaz-hub" como project_id Supabase + URL Vercel default — migração Onda 4/5 pós-launch.
- **Segurança Tier 1 (completa · 2026-05-14)**: ✅ HSTS + X-Frame-Options DENY + nosniff + Referrer-Policy + Permissions-Policy ✅ honeypot ✅ time-check ≥2.5s ✅ rate-limit por IP hash (3/24h) ✅ `WAITLIST_IP_SALT` random 32 bytes hex em prod (não mais fallback previsível) ✅ Vercel Bot Protection em modo Log no Firewall (promover pra On após 1-2 semanas de observação). Pendente: idempotência webhook, Upstash quando escalar.
- **Logo (2026-05-14)**: ✅ CEO trouxe arte (H verde com raízes orgânicas, PNG 1536x1024). Implementado em `Logo.tsx` via `<Image>` Next + `mix-blend-screen` pra eliminar fundo preto. Variants sm (h-9) e lg (h-20→24 com pulse petrol). Arquivo: `public/logo-hayzer.png`. Comentado que SVG manual via agente IA falhou (2 rodadas Diego rejeitadas).
- **Foco vertical maker 3D (2026-05-14)**: ADR-010 lavrado. Landing Fase 1 fala SÓ com maker 3D (Rafael). Copy reescrita (filamento, fila de impressão, comissão marketplace, recompra de maker). Frase âncora destaque: "Quatro sistemas, nenhum conversa. Aqui é um, e fala português." CTA: "Quero acesso antecipado". SEGMENT_OPTIONS atualizadas (3 variants 3D + estética + loja física + serviço + outro). Mini-council Carla + Marcos + Helena.
- **Resend setup (2026-05-15)**: SDK instalado + `services/email.ts` + wire-up em `app/waitlist/actions.ts` (graceful: email falha → lead persiste). 3 env vars Vercel (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_WHATSAPP_GROUP_URL`). DNS records (DKIM + MX + SPF) salvos no Registro.br (Modo Avançado de Zona DNS — transição iniciada 14/05, propagada globalmente). Status Resend: `pending` (workflow interno deles, AWS SES por trás, leva 1-24h pra re-verificar após DNS publicar). **Quando verificar, fluxo completo funciona.** `WhatsAppGroupCta.tsx` na tela /obrigado mostra botão verde "Entra no grupo Hayzer Beta" (graceful: oculta se env var vazia).
- **Bug RLS waitlist (2026-05-15, fix `fccd49f`)**: Form em prod retornava erro genérico. Diagnóstico via `SET LOCAL role anon + INSERT`: `supabase-js` faz `INSERT...RETURNING`, e `anon` não tem policy SELECT, daí RETURNING violava RLS. Fix: `addLeadStep1` + `updateLeadStep2` usam `getSupabaseAdmin()` (service_role, bypass RLS). Server Action já valida Zod + bot guards antes — seguro. Bônus: descobri que `SUPABASE_SERVICE_ROLE_KEY` faltava no Vercel — adicionada. Form 100% funcional testado fim-a-fim.

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
