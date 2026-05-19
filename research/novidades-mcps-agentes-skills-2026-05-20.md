# Pesquisa Novidades MCPs/Skills/Routines 2026
## External-researcher · 2026-05-20 · Modo crítico real

> Pergunta: O que vale REALMENTE instalar em 2026 pro Hayzer (Next 16 + Supabase + Vercel + Stripe, hardwork, quota 12/15, launch 27/06)?

---

## 🔥 TOP 3 MCPs que valem instalar

### 1. next-devtools-mcp (Vercel oficial)
- **GitHub**: github.com/vercel/next-devtools-mcp
- Conecta dev server Next.js em runtime
- Captura build errors, runtime errors, type errors SEM rodar `tsc` manual
- Integra Playwright pra verificação browser
- **ROI Hayzer**: elimina loop "build → browser → verifica" do Felipe na conversão React V4.8

### 2. PostHog MCP (PostHog oficial)
- 27+ tools: trends, funnels, feature flags, HogQL, A/B experiments, session replay
- Plugin nativo: `claude plugin install posthog`
- Free tier: 1M eventos/mês
- **ROI Hayzer**: perguntar "qual taxa conversão funnel waitlist essa semana?" direto no terminal. Crítico pré-launch

### 3. Playwright MCP (Microsoft oficial)
- #2 mais popular ecossistema
- `@playwright/cli` companion = **4x menos tokens** que MCP puro
- Browser automation via accessibility snapshots
- **ROI Hayzer**: resolve "validação visual obrigatória pré-deploy" sem precisar CEO no loop

---

## 🛠️ TOP 3 Skills que valem instalar

### 1. supabase-security-skill (Perufitlife)
- v1.0.0 lançado 11/05/2026 (8 dias atrás)
- Audita RLS-disabled tables, SECURITY DEFINER expostas, buckets públicos, grants anon
- Probe ativo com anon-key (confirma vazamento ao vivo)
- **ROI Hayzer**: multi-tenant com `project_id`, falha RLS = tenant vê dados de outro. Migration notifications_and_search pendente

### 2. getsentry/skills@security-review (Sentry oficial)
- Code review com confiança HIGH/MEDIUM/LOW
- Entende padrões Next.js (auto-escaping, etc)
- Rastreia fluxo de dados, não só pattern matching
- Única das 5 skills security testadas que vale (TimOnWeb)
- **ROI Hayzer**: 2ª camada review nos PRs G7 antes do auto-merge Camada 3

### 3. context-mode (compressão contexto)
- Comprime: git log 153 commits → 107 bytes, Playwright snapshot 56KB → 299 bytes
- Mantém stack traces verbatim
- **ROI Hayzer**: sessões 10h+ tipo maratona 19/05. Posterga ponto de colapso da janela

---

## 🔌 TOP 3 Conectores/Plugins novos

### 1. /goal command (nativo Claude Code v2.1.141)
- Define condição de conclusão + Claude trabalha autônomo até satisfazer
- **ROI Hayzer**: 13 agents G7 sem supervisão constante. Maior ROI imediato de maio/2026

### 2. Plugin PostHog nativo
- `claude plugin install posthog` carrega 30+ skills on-demand
- Diferente do MCP (sempre carregado), plugin = on-demand = menos overhead contexto

### 3. Agent View (nativo Claude Code v2.1.139)
- Dashboard de sessões rodando/bloqueadas/completas
- **ROI Hayzer**: operação 13 agents paralelo sem Agent View = caos

---

## 📋 TOP 3 Routines/Patterns que valem

### 1. Deploy Smoke Test via webhook Vercel
- Vercel POST → routine → Playwright MCP → verifica rotas críticas → posta go/no-go
- **ROI Hayzer**: pega bug kpi-hero antes do CEO descobrir manualmente
- Custo: 1 run por deploy × ~3-5 deploys/semana = 3-5 runs/semana

### 2. Auditoria RLS semanal (segunda noite)
- Rodar supabase-security-skill antes da revisão semanal CEO+Helena
- Relatório HTML com fixes SQL copy-paste
- **ROI Hayzer**: migration pendente + multi-tenant = auditoria crítica
- Custo: 1 run/semana = 4/mês

### 3. Waitlist conversion digest DIÁRIO
- Substituto da `waitlist-weekly-digest` atual
- Conta leads novos/dia, segmento, step 1/step 2, WhatsApp join
- **ROI Hayzer**: launch 27/06 com meta 12-18% conversão = dado diário não vanity
- Custo: 1 run/dia = 30/mês (consome 2 de 15 quota diária)

---

## ❌ O que NÃO vale (modo crítico real)

1. **Sequential Thinking MCP** (5.550 installs) — Sonnet 4.6 já faz internamente. Overhead sem ROI
2. **Linear MCP** — Hayzer usa GitHub Issues + ROADMAP.md. Sem Linear = zero ROI
3. **Skills security outras que NÃO getsentry/supabase-skill** — falsos positivos, checklists estáticos sem contexto framework
4. **claude-mem** — duplica infra de memória `~/.claude/projects/<hash>/memory/` já existente
5. **Superpowers (TDD forçado)** — Hayzer sem suite de testes (ROADMAP fase 4). TDD agora = atrito sem retorno. Revisar pós-launch

---

## ⚠️ Riscos críticos identificados

### CVE-2026-30623 (RCE via stdio MCP)
- Divulgada abril/2026 pela OX Security
- Afeta 7.000+ servidores públicos, 150M+ downloads SDK
- Anthropic: sanitização é responsabilidade do cliente
- **Impacto Hayzer**: BAIXO se MCPs locais de vendors oficiais (Vercel, Microsoft, PostHog, Supabase, Stripe). NÃO instalar MCPs de terceiro não auditados

### 66% MCPs populares têm achados segurança
- Scans sistemáticos jan-fev/2026
- **Filtro Hayzer**: instalar APENAS vendor oficial (Microsoft, PostHog, Vercel, Supabase)

---

## 📊 Quota check (Hayzer atual)

| Item | Runs/dia |
|---|---|
| Routines ativas hoje | 10-12 |
| Margem livre | 3-5 |
| Deploy smoke test (~5/sem) | <1 média |
| RLS audit (1/sem) | <1 média |
| Waitlist digest diário | 1 |
| **Total se adotar 3 novas** | **12-14/15** |

**Veredito**: cabe nas 4 que recomendei criar (item 3 + 5 da sessão CEO). Margem 1-3 livre pra emergência.

---

## 🎯 Sumário executivo (modo crítico)

3 MCPs com maior ROI imediato Hayzer:
1. **next-devtools-mcp** (Vercel) — elimina loop dev manual Felipe
2. **PostHog MCP** — dados conversão diretos no terminal
3. **Playwright MCP** (Microsoft) — validação visual autônoma pós-deploy

3 Skills:
1. **supabase-security-skill** — RLS audit multi-tenant
2. **getsentry security-review** — 2ª camada PR review
3. **context-mode** — sessões longas (10h+)

3 Routines:
1. **Deploy smoke test** (webhook Vercel)
2. **RLS audit semanal** (segunda noite)
3. **Waitlist digest diário**

CVE-2026-30623 é real mas afeta servidores expostos. Uso local com vendors oficiais = risco baixo.

NÃO instalar: Sequential Thinking, Linear MCP, claude-mem, Superpowers TDD.

---

## 📚 Fontes principais

- [Best MCP Servers 2026 - TECHSY](https://techsy.io/en/blog/best-mcp-servers-2026)
- [Claude Code Changelog maio/2026 - Releasebot](https://releasebot.io/updates/anthropic/claude-code)
- [5 Skills Worth Installing - Betamize](https://blog.betamize.com/5-claude-code-skills-that-are-actually-worth-installing-in-2026)
- [supabase-security-skill GitHub](https://github.com/Perufitlife/supabase-security-skill)
- [next-devtools-mcp Vercel](https://github.com/vercel/next-devtools-mcp)
- [Playwright MCP Microsoft](https://github.com/microsoft/playwright-mcp)
- [PostHog MCP Docs](https://posthog.com/docs/model-context-protocol/claude-code)
- [MCP RCE Vulnerability - Hacker News](https://thehackernews.com/2026/04/anthropic-mcp-design-vulnerability.html)
- [Quota Max 15 runs - Threads](https://www.threads.com/@george_sl_liu/post/DXI7mnUiaEf)
- [Deploy Smoke Test pattern - Instil](https://instil.co/blog/automate-playwright-testing-on-vercel)
- [A/B test PostHog + Vercel + Claude - MindStudio](https://www.mindstudio.ai/blog/build-ab-test-landing-page-claude-code-free-posthog-vercel)
