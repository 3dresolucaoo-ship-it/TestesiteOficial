# Sessão 2026-05-18 tarde — V4 deploy + ciclo login resolvido + Calculadora Pro

> Snapshot imutável. Cole o bloco "Pra continuar depois do /clear" da sessão 2026-05-18 tarde no início da próxima.

## 🎯 Tema da sessão
V4 React em prod + Calculadora Pro paywall completo + caçar root cause do ciclo redirect-to-login.

## ⏱️ Duração
~02h00 BRT → 18h52 BRT · ~16h30 total (continuação direta da madrugada/manhã)

## ✅ Entregas

### Frente "Camada 3 + Dependabot + multi-tenant" (manhã)
1. **pr-review-bot** primeira execução 08h05 BRT (silenciosa, repo sem PRs candidato)
2. **pillars-review-semanal** primeira execução 09h00 BRT (criou `pillars/weekly-2026-05-18.md` + `pillars/history.md`)
3. **Dependabot** 8h BRT abriu 5 PRs · Bruna validou local · 5/5 mergeados via Chrome MCP + `@dependabot squash and merge`:
   - #3 patches (next 16.2.6, react 19.2.6, supabase-js 2.106, supabase/ssr 0.10.3, react-dom 19.2.6, eslint-config-next 16.2.6)
   - #4 dev-dependencies (tailwindcss 4.3.0)
   - #5 lucide-react 1.16.0
   - #6 framer-motion 12.39.0
   - #7 react-hook-form 7.76.0
4. **Bug multi-tenant** em **12 services** corrigido (Bruna E1): finance/orders/inventory/movements/content/decisions/leads/affiliates/products/catalogs/production. `lib/store.tsx` DELETE_* ajustados com lookup em prevState.
5. **Migration `20260518_production_project_id`** aplicada em prod via Supabase MCP (text não uuid — schema.sql stale).
6. **C1-C** (rotação Supabase): NIST SP 800-63B aplicado, movido pro launch-checklist semana 7.

### Frente "V4 React" (Felipe adiantou de QUA→SEG)
7. **Dashboard V4 React em produção** — `app/dashboard/page.tsx` Server Component substituiu DashboardView legado. `services/dashboard.ts` agregador Promise.all (4 funções). `globals-v4.css` 650+ linhas. Suspense + skeleton adaptado light/dark.
8. **Fix V4 duplo-sidebar** `LayoutSwitch.tsx` ganhou `V4_PATHS = ['/dashboard']` que pula AppShell legado.

### Frente "Calculadora Pro" (Carla + Felipe + Paulo + Diego)
9. **Carla** copy completo `marketing/calculadora-pro/copy-paywall.md` (720 + 140 + 210 palavras) — frase âncora: *"Calcula uma vez. Manda o orçamento bonito. Cliente fecha."* Refeito SEM em-dash após cobrança CEO.
10. **Felipe** UI completa: `app/calculadora/pro/page.tsx`, `/sucesso/page.tsx`, `components/calculadora/PaywallModal.tsx`. Integrado na CalculadoraForm com botão "Exportar PDF (Pro)".
11. **Paulo** spec Stripe Payment Link `payments/calc-pro-integration-spec.md` (11 seções, webhook handler, migration, template email, reconciliação).
12. **Diego** aplicou identidade waitlist em `/calculadora/pro` (3 glows, grain, Logo gigante, badge sticker âmbar tilt, display Fraunces + italic-soft + marker).

### Frente "Outros squads"
13. **Marcos** plano divulgação `marketing/divulgacao-disparo-2026-05-18.md` (calendário 22/05→05/06 · Facebook + Instagram DMs + WhatsApp grupos · pré-participação humana antes do post pra evitar banimento).
14. **Bruna** confirmou OrderStatus enum (Felipe acertou: `paid` + `delivered`). Confirmado em prod via execute_sql.
15. **Diego** fix sidebar legada scroll (h-screen + min-h-0 + shrink-0).
16. **Diego** + Carla refinaram hero `/calculadora/pro` (frase: *"Para de calcular preço na cabeça, no Excel ou no zap"*).

### Frente "Em-dash crítico" (CEO cobrou)
17. **ZERO em-dash** em todo escopo calculadora + marketing + dashboard. Memória persistente `feedback_zero_em_dash.md`. Lista NEGRA Carla atualizada (`.claude/agents/carla-copy.md`).
18. Title metadados `Hayzer · A raiz` (era `Hayzer —`), `meta em risco.` no dashboard.

### Frente "Ciclo infinito login" (CRÍTICO)
19. **ROOT CAUSE encontrado**: `Greeting.tsx` usava `useState(() => getGreetingParts(new Date()))` → server renderia UTC, client renderia local → React #418 hydration mismatch → remount → AuthContext re-rodava → `supabase.auth.getUser()` abortado → safety timer 12s → redirect /login → CICLO.
20. **Fix**: Greeting agora inicia `parts=null` com placeholder "Olá, <nome>" no SSR. useEffect popula hora local após mount.
21. **Botão "Sair"** adicionado na sidebar V4 (Felipe esqueceu de portar). useAuth().signOut(). Hover red-500.
22. Rollback `@supabase/ssr 0.10.3 → 0.10.2` (paliativo descartado como causa raiz, mantido pois 0.10.2 estável).

## 🔴 Blockers / Pendências críticas

### Pendências CEO
- **Stripe Payment Link** — CEO cria no dashboard.stripe.com/payment-links (spec em `payments/calc-pro-integration-spec.md`, 3min)
- **2 env vars Vercel** — `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_CALC_PRO` + `STRIPE_WEBHOOK_SECRET_CALC_PRO`
- **Povoar grupo WhatsApp Hayzer Beta** com 5-10 contatos diretos ANTES do disparo Marcos
- **INPI HAYZER** GRUs R$ 880 PIX antes 13/06/2026

### Pendências dev
- **Webhook handler** `/api/webhooks/stripe-calc-pro` (Felipe implementa quando env var setada)
- **Tabela `calculadora_pro_purchases`** (Bruna aplica migration do spec Paulo quando autorizado)
- **Migrar mais rotas pro V4** (módulo por módulo, 1/semana — orders, inventory, products, etc.)
- **Botões V4 decorativos** (sininho, busca, perfil) sem handler — Felipe portar Wave 3
- **2 temas coexistindo** — confusão UX legítima (não bug). Solução: migração V4 incremental.

## 📐 Decisões registradas (ADRs)
- Nenhum ADR novo nesta sessão. Decisões pequenas documentadas em CLAUDE.md raiz e em memória.

## 📦 Commits

```
0866d8b fix(critical): Greeting hydration mismatch + adiciona botão Sair no V4
12660e1 fix(auth+visual): rollback @supabase/ssr 0.10.2 + Diego /calculadora/pro
11e9965 fix(copy): em-dashes em metadados globais + dashboard 'meta em risco'
d850bd1 fix(copy): último em-dash em comentário JSX limpo
8bdcb0a fix(copy): remove TODOS em-dashes (—) das pages e modal calculadora
40a53f2 fix(v4): LayoutSwitch pula AppShell em /dashboard
815d75c feat(v4): dashboard V4 React em produção (Felipe)
65bc461 docs(c1-c): rotação Supabase movida pro launch-checklist
a57a1d3 fix(multi-tenant): completa filtro project_id em 11 services (Bruna E1)
```
+ ~10 commits `auto: claude session changes` (auto-commit hook capturou Bruna E1 migração, Carla refazendo copy, Diego sidebar fix, etc.)

## 🔐 Itens de segurança a lembrar
- ✅ `@supabase/ssr 0.10.2` pinned (rolled back de 0.10.3)
- ✅ `pg_cron cleanup api_rate_limits` ativo (00h BRT)
- ✅ `RESEND_API_KEY` rotacionada (`hayzer-prod-v2`)
- ⏳ `SUPABASE_SERVICE_ROLE_KEY` movida pro launch-checklist semana 7 (NIST justifica espera)
- ⏳ Camada 3 com 8 guard rails — 3 críticos aplicados em `automation/pr-review-bot-spec.md` hoje madrugada (commit anterior)

## 🚀 Próximas ações (priorizadas)

1. **CEO testa após deploy `0866d8b` entrar (~2min)**: F5 em /dashboard, navegar pra /orders, /finance, /inventory. Confirmar que ciclo login morreu.
2. **CEO cria Stripe Payment Link** + seta 2 env vars (3min). Felipe e Bruna desbloqueiam fluxo Pro completo.
3. **Migrar /orders pro V4** (próximo módulo prioritário — Felipe segunda 25/05). Reduz confusão "2 temas".
4. **Marcos: DM @3dgeekshow 22/05** (calendário divulgação) — antes povoar grupo Beta.
5. **Júlia P0 a11y** — 8 issues V4.8 (heading order, skip-to-content, fog-400 contraste).

## 👥 Agentes G7 envolvidos

- **Carla** (copy): paywall original + reescrita sem em-dash + hero novo "na cabeça, no Excel, no zap"
- **Felipe** (frontend): V4 React conversion + paywall UI + página sucesso + PaywallModal + integração CalculadoraForm + fix Greeting + botão Sair
- **Bruna** (backend): multi-tenant fix 12 services + migration production_project_id + setQuantity defesa profundidade + OrderStatus enum confirm
- **Diego** (design): paleta HSL audit (madrugada) + sidebar legada scroll fix + identidade visual /calculadora/pro + skeleton light/dark
- **Otávio** (security): Camada 3 patches (madrugada, capturado em commits anteriores)
- **Paulo** (financial): Stripe Payment Link spec completa
- **Marcos** (marketing): divulgação maker 3D + reescrita sem em-dash
- **Helena** (strategy): decisões C1-C com NIST + análise V4 "2 temas"

## 🧠 Aprendizados da sessão

### Padrões CEO observados

1. **CEO odeia em-dash com paixão** — chamou de "traço de chatgpt", reclamou múltiplas vezes hoje. Banimento permanente em copy. Memória `feedback_zero_em_dash.md` capturou. Agentes Carla/Marcos receberam regra explícita + validação grep.
2. **CEO compara identidade visual diretamente** — usa hero waitlist como benchmark. "Sem identidade", "glows fariam diferença", "tem alma" são frases-radar. Quando aplica novo design, Diego deve checar paralelo direto com `app/page.tsx`.
3. **CEO escolhe agressivo > conservador** — quando ofereci A1+B1+C1+D1 (4 ações), ele aceitou todas. Não pediu nenhuma adiada. Quando há 50/50, padrão = mais ambicioso.
4. **CEO diferencia "crítica construtiva" de pedido** — falou irritado mas terminou "pega tudo isos com critica construtiva mano". Tom forte ≠ rejeição.

### Erros cometidos (não repetir)

1. **Não testei hydration em V4 antes de declarar pronto** — bug Greeting #418 ficou latente. Próxima vez: rodar `npx next build` + checar warnings de hydration em qualquer componente client com `Date`/`Math.random`/etc.
2. **Despachei Carla sem blindar regra em-dash** — embora ela tinha regra de "anti-IA palavras", em-dash não estava explícito. Sempre incluir regras de pontuação em prompts de copy.
3. **Chutei "cookie órfão" como causa raiz** sem investigar profundo. Investigação via `read_console_messages` revelou React #418 — devia ter feito ANTES de propor rollback `@supabase/ssr`.
4. **Adicionei /dashboard ao V4_PATHS sem migrar resto** — criou "2 temas" coexistindo. CEO estranhou (legítimo). Próxima migração V4 deve incluir comunicação clara sobre estado parcial.

### Sucessos (repetir)

1. **6 agentes G7 em paralelo** entregaram em ~30min real o que seria 4-6h sequencial. Pattern confirmado: single message com múltiplos `Agent` calls + `run_in_background: true`.
2. **Investigação via Chrome MCP** (`read_console_messages` + `javascript_tool` pra testar cookies + fetch direto pro Supabase) deu raio-X exato do problema — React #418 + token JWT 401.
3. **Auto-validação grep** após copy refeita: Carla e Marcos rodaram `grep "—\|–"` ANTES de declarar feito. Zero em-dash confirmado.
4. **Diego "memória ativa" funcionou** — sidebar V4 usa Fraunces + classes já em globals.css. Diego reutilizou pattern do landing Hero sem reinventar.

### Conhecimento técnico novo

- **React 19 Minified error #418 = hydration mismatch**. Sempre `useState<T | null>(null)` + `useEffect` quando valor inicial depende de runtime (Date, Math.random, window). Server e client têm que renderizar HTML idêntico no primeiro paint.
- **`@dependabot squash and merge`** comando funciona — Dependabot rebaseia automaticamente + mergeia. Útil quando PRs Dependabot ficam com conflito após mergear o primeiro.
- **Supabase MCP `apply_migration` falha em type mismatch FK** — `uuid REFERENCES projects(id)` quando `projects.id` é `text` retorna `42804 incompatible types`. Sempre `execute_sql` antes de criar FK pra confirmar tipo.
- **Chrome MCP `javascript_tool`** ótimo pra debug client-side em prod (testar fetch direto, ler cookies, etc.). Stream timeout do streaming chat NÃO afeta agentes background.

### Conhecimento de domínio

- **Maker 3D BR usa "zap" naturalmente** — Carla escolheu "na cabeça, no Excel ou no zap" e o "zap" aterra como BR puro (não "WhatsApp" formal).
- **Calculadora Pro lifetime R$ 37** vendida via Stripe Payment Link aceita PIX + boleto + cartão + Apple/Google Pay — não precisa Stripe Checkout custom. Pagamento único, sem mensalidade, é diferencial vs concorrentes que cobram recorrência.
- **NIST SP 800-63B desaconselha rotação periódica forçada** — adoção desse princípio justifica adiar rotação Supabase pro launch-checklist sem sentir culpa.
- **Antes de divulgar no Grupo Facebook "Impressão 3D Brasil"** (50-150k membros), tem que participar como humano por 3-5 dias respondendo dúvidas — postar direto = banimento. Marcos formalizou no calendário.
