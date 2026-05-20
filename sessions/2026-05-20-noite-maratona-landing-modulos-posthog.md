# Sessão 2026-05-20 noite — Maratona Landing + Refactor Massivo + PostHog Ativo

> Snapshot imutável. Cole o bloco "Pra continuar depois do /clear" do final desta sessão no início da próxima.

## 🎯 Tema da sessão

Maratona ~10h: fechar landing maker pre-launch (PrinterShowcase + ProductPreview + WhatsAppFlow) + refactor de 4 arquivos gigantes (inventory/products/Sidebar/FinanceView) + PostHog ativo em prod + Otávio GO soft launch 11/06 + QA audit + Calc Pro freemium UI+backend. Terminou com reality check honesto do CEO: medi "88% pronto" mas real é 60-65% (módulos internos não tocados, sem integração end-to-end).

## ⏱️ Duração

~21h (16/05 20:08 primeira foto CEO no chat) → 20/05 ~23:30 fim formal. Núcleo intenso ~10h madrugada-noite 20/05.

## ✅ Entregas

1. **Bug crítico build resolvido** (commit `472b0c1`) — `_sentry-prepared/` quebrava ALL deploys desde 18/05. Site servia versão antiga de cache. Fix em 1 linha tsconfig exclude. Destravou 8 deploys ERROR.
2. **Bug crítico middleware robots.txt** (commit `faa787a`) — /robots.txt retornava 307→/login. Fix matcher exclude. Lighthouse SEO 92→100.
3. **Landing maker 8 sections** em prod:
   - PrinterShowcase (commit `d1a8a63`) — foto real Bambu A1 28 peças amarelas do CEO
   - ProductPreview com screenshot mockup orders V4 (commit `509ff93`) via Playwright
   - WhatsAppFlow nova section (commit `bdcfa9b` série)
   - 4 SVGs Diego integrados (filament-spool, whatsapp-pix, printer-3d, whatsapp-chat-mock)
   - 5 quick wins Felipe (CTA calc, social proof, R$ 49, disclaimer, ProductPreview placeholder)
   - 3 headlines sem ponto final (commit `280e4e9`)
   - Data 04/07 → 27/06 em 3 arquivos
4. **PostHog ativo em prod**:
   - SDK + provider + lib/posthog.ts (Ana, commit `ccb689d`)
   - 7 eventos: calculadora_cta_click/_view/_calculated/_result_copied + waitlist_submit_attempt/success/error
   - Sanitizer PII LGPD-safe
   - Env vars setadas via Chrome MCP no Vercel: `phc_AF6SMi84VS6CWQf9nw4hz3QQoN6yLBCCsCmrL72DSuFU` + host us
   - CSP atualizado pra incluir us.i.posthog.com + us-assets (commit `bdb4626`)
5. **Refactor massivo 4 arquivos** (commits `bdcfa9b` série):
   - `inventory/page.tsx` 1001 → 372 linhas (-62%) + 10 sub-componentes
   - `products/page.tsx` 604 → 285 linhas (-53%) + 6 sub-componentes
   - `Sidebar.tsx` 601 → 36 linhas (-94%) + 8 sub-componentes
   - `FinanceView.tsx` 595 → 362 linhas (-39%) + 6 sub-componentes
   - Total: ~3300 linhas reorganizadas, zero mudança de comportamento, TSC 0 erros
6. **Migration `vertical_type`** aplicada em prod via Supabase MCP. Types TS regenerados em `lib/supabase/database.types.ts`.
7. **WebP** orders-preview 1.05MB → 93KB (-91%). Fonts swap + preload + adjustFontFallback.
8. **Calc Pro freemium completo**:
   - Felipe UI (commit série): rate-limit 5/dia localStorage + modal upsell + pitch refeito + 3 eventos PostHog novos
   - Paulo backend (commit `ff99324`): service calcProSubscription + migration prep + ADR-023 + guide setup-stripe (309 linhas)
9. **PWA + observability + SEO**:
   - public/manifest.json (8 PWA Manifest + shortcuts + screenshots wide)
   - app/api/health/route.ts (GET/HEAD com check Supabase)
   - app/sitemap-images.ts (XML com 5 imagens + captions PT-BR)
   - app/not-found.tsx reescrito (era roxo banido)
   - OG metadata completo (keywords, locale BR, images, robots)
10. **5 fixes a11y P0** do audit QA (commit `bdb4626`):
    - LGPD opt-in ATIVO (removido defaultChecked)
    - Validation PT-BR via setCustomValidity
    - Contraste fog-400 → muted-foreground
    - CSP PostHog 2 hosts
    - Heading order h3→h2 + tap target h-4→h-5
11. **Otávio audit pre-soft-launch** (`security/audit-pre-soft-launch-2026-05-20.md`): **GO 11/06**. OWASP 7.4→7.7. 8 verdes / 2 amarelos / 0 vermelho. 5 ações pré-11/06 listadas.
12. **3 ADRs Lia** antecipados (020 Discord webhooks, 021 Sub-marca Beauty, 022 Launch acelerado).
13. **CLAUDE.md raiz reality check** (commit `fa6955e`): listei honestamente 60-65% pronto, não 88%.

## 🔴 Blockers / Pendências críticas

1. **PostHog NÃO VALIDADO em prod** com evento real chegando — Chrome MCP travou tentando ver Live Events. CEO valida manualmente.
2. **Bash background "Wait for robots.txt deploy"** zumbi 70min+ — só botão "Parar" no painel UI Claude Code resolve. Não consigo matar via terminal sem risco de self-kill.
3. **Módulos internos NÃO TESTADOS em prod** com user real após refactor — inventory/products/Sidebar/FinanceView passou TSC mas ninguém criou/editou/deletou item visualmente.
4. **11 módulos faltam migrar pro Dashboard V4** — só /orders foi migrado. Cada um é 2-4h.
5. **MP OAuth bloqueado** desde 07/05 (painel MP bugado React error #130). Stripe Connect cobre.
6. **TBT 3.6s em prod** (Lighthouse) — Hero motion + WaitlistForm Zod no first paint. Refactor profundo.
7. **Calc Pro freemium aguarda CEO**: 6 passos pra ativar (criar Stripe Product+Price+Payment Link + aplicar migration + Vercel env vars).
8. **Júlia QA agent não existe** — substituí por general-purpose nesta sessão.

## 📐 Decisões registradas (ADRs)

- `decisions/020-discord-webhooks-operacao-noturna.md`
- `decisions/021-sub-marca-hayzer-beauty-mesmo-dominio.md`
- `decisions/022-launch-acelerado-04-07-para-27-06.md`
- `decisions/023-calc-pro-freemium-subscription.md`

## 📦 Commits

```
fa6955e docs(CLAUDE): reality check honesto do CEO 20/05 23h
ff99324 feat(calc-pro): Paulo backend Stripe subscription
fe88d53 auto: claude session changes (Felipe Calc Pro UI)
bdb4626 fix(a11y+lgpd): 5 fixes P0 do audit QA pre-launch
bdcfa9b refactor(huge): 4 arquivos gigantes desmembrados em sub-componentes
93248e7 feat: PWA + health endpoint + sitemap-images + fixes UX
b111261 perf(landing): lazy load framer-motion below-the-fold
ccb689d feat: fonts swap + OG metadata + 404 Hayzer + PostHog Ana
faa787a fix(middleware): exclui robots.txt e sitemap.xml do matcher de auth
a1c35e2 chore: WebP + robots.txt + error boundary + 3 ADRs Lia antecipados
d1a8a63 feat(landing): nova section PrinterShowcase com foto real Bambu A1 do CEO
280e4e9 fix(landing): remove ponto final dos 3 headlines editoriais
9e03a35 feat(dashboard): Felipe Fase 2 V4 - mobile fixes + loading + dados reais
509ff93 feat(landing): adiciona screenshot real do mockup orders V4
472b0c1 fix(build): exclui _sentry-prepared do tsconfig pra destravar deploys
(+ ~18 auto-commits da hook entre eles)
```

Total: ~33 commits push em prod.

## 🔐 Itens de segurança a lembrar

- **PostHog Project API Key** `phc_AF6SMi84VS6CWQf9nw4hz3QQoN6yLBCCsCmrL72DSuFU` foi exposta no chat (Chrome MCP read_page mostrou). Risco baixo (key é client-side, NEXT_PUBLIC_ prefix, sem privilégio admin) mas pode revogar/regenerar quando puder.
- **2 Discord webhooks** Hayzer Ops (#critico + #digest) também expostos no chat anterior. Mesma situação: revogar+gerar novos quando puder (UI Discord 30s cada).
- **Otávio audit** GO 11/06 com 0 vermelho. Tier 1 + Tier 2 segurança 100% fechados.
- **CSP report-only** continua (não enforcing). Promover pra enforcing pré-launch público quando tiver 2-4 sem observação Sentry (post 17/06).

## 🚀 Próximas ações (priorizadas)

1. **Parar Bash zumbi robots.txt loop** via painel UI Claude Code (CEO, 5s)
2. **Validar PostHog real funcionando**: abrir hayzer.com.br/calculadora, mover slider, abrir PostHog → Live Events, confirmar evento `calculadora_calculated` chegou (CEO, 3min)
3. **Setup Stripe Calc Pro** via guide `payments/setup-stripe-calc-pro.md` (CEO, ~10min):
   - Criar Product "Hayzer Calc Pro" Subscription no Stripe Dashboard
   - Criar Price recurring R$ 19/mês com trial 7 dias
   - Criar Payment Link mode=subscription
   - Aplicar migration `20260520_calc_pro_subscriptions.sql` via Supabase MCP
   - Atualizar `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_CALC_PRO` + `NEXT_PUBLIC_CALC_PRO_PRICE_MONTHLY=19` no Vercel
4. **AUDITAR módulos internos em prod** próxima sessão — navegar inventory/products/customers/finance/orders/leads/etc com user real, listar bugs, priorizar 3 críticos pra fix
5. **Postar Post #1** grupo WhatsApp Hayzer Beta (texto pronto Marcos no chat sessão anterior)
6. **INPI** segunda 25/05: pagar PIX classe 42 R$ 440 antes 13/06 GRU
7. **Heshiley conversa natural** (3 perguntas: beta tester, co-host, listar 5 gestoras) — sem deadline
8. **Operação noturna oficial sexta 22/05 22h** com Bruna + Lia (ADR-020)
9. **Decisão 7 doc P3**: cobrança Beauty (Helena recomenda R$ 197 único + opção combo gestora-mãe + tier por rede)
10. **7 branches GitHub `claude/*` not-merged** limpar via UI

## 👥 Agentes G7 envolvidos

- **Bruna** (backend) — migration vertical_type prep, ADR-016
- **Diego** (design) — 4 SVGs maker line-art + prompt IA render impressora
- **Lia** (docs) — ADR-014/020/021/022, CLAUDE.md por pasta, refactor Status Rápido
- **Ricardo** (devops) — ADR-018/019 Rolling Releases + Sentry plan
- **Felipe** (frontend) — múltiplas tasks (5 quick wins landing, Fase 2 dashboard, lazy framer, refactor inventory+products+Sidebar+FinanceView, Calc Pro UI freemium completo)
- **Carla** (copy) — Persona Rafael brief consumido em copy WhatsAppFlow + PrinterShowcase
- **Ana** (analytics) — PostHog SDK + 7 eventos + LGPD sanitizer
- **Marcos** (marketing) — Post WhatsApp Beta + carrossel IG + plano 7 dias canais
- **Otávio** (security) — audit pre-soft-launch GO 11/06
- **Paulo** (financial) — Calc Pro Stripe subscription service + migration + ADR-023 + guide
- **general-purpose** (substituiu Julia QA inexistente) — audit a11y + axe-core + cross-browser

## 🧠 Aprendizados da sessão

### Padrões CEO observados

- **"Muito ponto, ja falei sobre isso"**: headlines editorial Fraunces não têm ponto final. 1 ponto no meio OK, zero no final. (Memória: `feedback_headlines_editorial_sem_ponto_final`, 20/05)
- **"Eu n pago Gemini nem ChatGPT, daonde voce tirou isso?"**: NÃO assumir ferramentas pagas. Só Claude Max 5x confirmado. (Memória: `feedback_nao_assumir_ferramentas_pagas`, 20/05)
- **"Falta integrar todos os modulos e arruamr todos eles inernamente voce nao acha?"**: medir % de pronto pela landing inflado. Reality check: 3 camadas (landing 85%/módulos 50%/integração 30%). CEO valoriza HONESTIDADE > vanity metric. (20/05 23h)
- **"Faca voce mesmo só se realmente precisar de mim"**: CEO quer autonomia total quando possível. Reservar dele só pra: prohibitions (Stripe Product create), decisões estratégicas, conversa pessoal (Heshiley).
- **"Tem mais coisa?"** repetido várias vezes = CEO em modo HARDWORK quer máximo de trabalho paralelizado.

### Erros cometidos (não repetir)

- **88% inflado**: medi pronto pelo exterior (landing+docs+setup) e ignorei o interior (módulos+integração). Próxima vez: medir em CAMADAS (cosmético / interno / integração end-to-end). Razão: CEO valoriza brutalidade honesta.
- **Bash `until` em background**: loop `until <check>; do sleep 8; done` virou zumbi 70min porque check nunca foi true OU stdout não chegou no grep. Regra futura: usar `timeout 60 curl...` ou polling sequencial com limite explícito. NUNCA `until` infinito + run_in_background.
- **PostHog não validei real**: env vars + redeploy OK, mas Chrome MCP travou tentando ver Live Events. Custo: CEO tem que validar manualmente. Regra futura: validar evento end-to-end ANTES de declarar feature pronta.
- **Assumi ChatGPT/Gemini Plus**: CEO corrigiu. Regra: PERGUNTAR antes de recomendar alternativa baseada em "você já paga X".
- **"Wait for robots.txt"** Bash desperdiçou 70min de processo zumbi. Eu não tenho ferramenta agent SDK pra matar Bash background. Regra: rastrear todos run_in_background e fechar explicitamente OU usar timeout curto.

### Sucessos (repetir)

- **Modo crítico ataca premissa**: virou padrão dessa sessão. CEO disse "modo critico" várias vezes — eu critiquei plano original antes de executar, cortei Otávio do Hardwork Fase 1 (Tier 1 já fechado), substituí render IA por foto real CEO, etc.
- **Bug crítico build detectado via Vercel MCP**: usar `get_deployment_build_logs` quando deploy não passa em prod tela esperada. Achei `_sentry-prepared` quebrando ALL deploys desde 18/05. Sem essa pesquisa, ficaria horas tentando coisa errada.
- **4 agents Felipe em paralelo refactor**: cada um com escopo cirúrgico (inventory/products/Sidebar/FinanceView), zero conflito, ~3300 linhas reorganizadas em ~1h paralelo. Pattern reutilizar pra wave de migração V4 dos 11 módulos restantes.
- **Foto real CEO > render IA**: Diego sugeriu IA, CEO mandou 5 fotos do galpão, foto 1 (Bambu A1 + 28 peças amarelas) virou hero anti-IA premium. Lição: sempre perguntar se tem asset real antes de gerar.
- **Tirar screenshot mockup via Playwright headless**: file:// local + npx playwright screenshot funcionou perfeito. 5 segundos pra screenshot 1440x900 PNG. Próxima: scriptar pra todos mockups automaticamente.

### Conhecimento técnico novo

- **`_sentry-prepared/` no tsconfig exclude**: pastas staged pra futuro precisam estar em `exclude` do tsconfig, senão Next.js build quebra mesmo arquivo não sendo importado em runtime.
- **Middleware matcher regex**: `robots.txt`/`sitemap.xml`/extensões .txt/.xml/.ico precisam EXPLICITAMENTE no exclude regex. Sem isso = 307 redirect /login.
- **PostHog client-side LGPD**: `autocapture: false` + `person_profiles: 'identified_only'` + `sanitize_properties` helper bloqueando email/cpf/telefone = padrão seguro pra mercado BR.
- **Sharp via Node inline em projeto Next**: `node -e "require('sharp')(...).webp(...).toFile(...)"` funciona sem instalar Sharp global (já vem nas deps Next).
- **revalidatePath('/')** em Server Action após mutate Supabase = contador dinâmico no Hero atualiza imediato sem ISR full rebuild.
- **dynamic({ ssr: false })** pra Framer Motion below-the-fold = chunk 118KB não bloqueia first paint. Hero mantém síncrono (acima dobra).
- **Vercel API list_deployments** + `get_deployment_build_logs` MCP = essencial pra debugar deploy ERROR estrutural.

### Conhecimento de domínio

- **ZoomCalc3D** (concorrente Calc Pro) tem IA Gemini grátis + multi-material + WhatsApp + CSV + ROI/payback. Ameaça #1 do Calc Pro Hayzer. Resposta: Hayzer Calc grátis 5/dia + Pro R$ 19/mês com PDF/histórico.
- **Bambu Lab A1** identificável em 0.3s pra maker BR (frame branco + tela touch + plate texturizado 256x256). Build plate "256x256" é signature info que maker reconhece.
- **PLA amarelo + verde** em fila de 28 peças = visual "produção real" pra Persona Rafael. Diferenciar de stock photo polido.
- **`_components/` (underscore prefix)** em rota Next.js App Router = pasta colocated que NÃO vira rota. Pattern oficial Next.js pra sub-componentes de página.
- **Headlines Fraunces editorial**: 1 ponto no MEIO permitido (separar 2 sentenças), ZERO no final. Padrão Linear/Stripe/Vercel.

## Memórias persistentes criadas/atualizadas nesta sessão

- `feedback_headlines_editorial_sem_ponto_final.md` (NOVO)
- `feedback_nao_assumir_ferramentas_pagas.md` (NOVO)
- MEMORY.md atualizado com 2 entradas novas
- Pendente próxima sessão: criar `feedback_medir_em_camadas_nao_inflar.md` (reality check) + `feedback_bash_until_nunca_em_background.md` (zombie processes)
