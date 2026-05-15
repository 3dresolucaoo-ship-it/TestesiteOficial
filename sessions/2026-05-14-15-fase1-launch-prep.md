# Sessão 14-15/05/2026 — Fase 1 Launch Prep (Hayzer)

> Snapshot imutável. Cole o bloco "Pra continuar depois do /clear" no início da próxima sessão.

## 🎯 Tema da sessão

Rebranding BVaz Hub → Hayzer + Landing v2 + Logo real + Foco vertical maker 3D (ADR-010) + Bug RLS waitlist (ADR-011) + Resend setup + Vercel Analytics. Sessão maratona de ~24h ininterruptas.

## ⏱️ Duração

**14/05/2026 manhã → 15/05/2026 manhã** (~24h, com pausa pra banho do CEO no meio).

## ✅ Entregas

### Marca e identidade
1. **Rebranding completo BVaz Hub → Hayzer** (ADR-009)
   - 11 arquivos atualizados (Logo, Footer, WaitlistForm, WhyDifferent, Step2Form, layout meta tags, termos, privacidade, obrigado, page, BRIEF)
   - Domínio `hayzer.com.br` registrado (Registro.br, Gabriel Vaz, exp 14/05/2028)
   - DNS A record `216.198.79.1` apontando pra Vercel
   - SSL HTTPS automático ativo
   - `NEXT_PUBLIC_APP_URL` + `metadataBase` atualizados
   - Commits: `70fcb13`, `a958610`

2. **Landing v2 — option-c-hybrid** (commit `6b02c6d`)
   - Paleta night/petrol/ember (substituiu paleta antiga)
   - Tipografia Fraunces serif editorial nos headings
   - Grain SVG noise overlay (3 níveis)
   - Layout split Hero (col-7/col-5)
   - Asymmetric features grid
   - WhyDifferent comparativo split com gradient petrol
   - Override shadcn via `html[data-layout="marketing"]` (dashboard intacto)

3. **Logo Hayzer real** (commit `5c3ba7b`)
   - CEO trouxe arte PNG 1536x1024 (H verde com raízes orgânicas)
   - Implementado em `components/landing/Logo.tsx` via Next/Image + `mix-blend-screen` (come fundo preto da PNG, funciona em qualquer bg dark)
   - Variants `sm` (h-9, 36px) e `lg` (h-20→24 com pulse petrol)
   - Pulse migrado de `box-shadow` pra `drop-shadow` (acompanha contorno das raízes)
   - Arquivo: `public/logo-hayzer.png`
   - Notas: 2 rodadas Diego (Cleft + Raízes) foram rejeitadas antes — SVG manual via agente IA não chega no nível ilustrativo

### Estratégia e copy
4. **Foco vertical maker 3D — ADR-010** (commit `cc4330f`)
   - Mini-council Carla + Marcos + Helena fechou: landing Fase 1 fala SÓ com maker 3D (Rafael)
   - Hero, Features, WhyDifferent, CTA reescritos com vocabulário maker (filamento, fila de impressão, comissão marketplace, recompra de maker)
   - Frase âncora destaque: *"Quatro sistemas, nenhum conversa. Aqui é um, e fala português."*
   - CTA novo: "Quero acesso antecipado" (era "Entrar na lista de espera")
   - `SEGMENT_OPTIONS` em `services/waitlistSchema.ts` refeitas (3 variants 3D + estética + loja física + serviço + outro)
   - Gatilho de expansão: pós-launch 04/07, criar `/cabeleireiras` quando Ybera virar Fase 2

### Backend e infra
5. **Bug RLS waitlist fixado — ADR-011** (commit `fccd49f`)
   - Diagnóstico via `SET LOCAL role anon + INSERT`: supabase-js fazia `INSERT...RETURNING`, anon não tinha policy SELECT → RETURNING violava RLS
   - Fix: `addLeadStep1` e `updateLeadStep2` agora usam `getSupabaseAdmin()` (service_role, bypass RLS)
   - Server Action já valida Zod + bot guards antes — seguro
   - Bônus: `SUPABASE_SERVICE_ROLE_KEY` faltava no Vercel — adicionada
   - Form 100% funcional testado fim-a-fim em prod

6. **Resend setup — email transacional** (commit `5bc66af`)
   - SDK `resend` instalado (`npm install resend`)
   - `services/email.ts` criado: wrapper + template HTML+texto + escape XSS
   - Wire-up em `app/waitlist/actions.ts` após `addLeadStep1` ok — falha silenciosa graceful
   - 3 env vars Vercel setadas: `RESEND_API_KEY`, `RESEND_FROM_EMAIL=ola@hayzer.com.br`, `NEXT_PUBLIC_WHATSAPP_GROUP_URL`
   - DNS records no Registro.br (Modo Avançado de Zona DNS): DKIM TXT + MX + SPF TXT
   - DNS propagado globalmente (Cloudflare, Google, Quad9 todos veem)
   - **Status atual: `pending` há ~10h** — bloqueador externo (workflow AWS SES interno, possivelmente bug regional sa-east-1)

7. **WhatsApp CTA na tela /obrigado** (incluído em `5bc66af`)
   - `components/landing/WhatsAppGroupCta.tsx` criado
   - Renderiza botão verde "Entra no grupo Hayzer Beta" entre `ThankYouHero` e `Step2Form`
   - Graceful: oculta se `NEXT_PUBLIC_WHATSAPP_GROUP_URL` vazia
   - Link real: `https://chat.whatsapp.com/DGgFEWwRjefLMZuHPZUJam`
   - Testado fim-a-fim (CEO clicou e foi pro grupo)

### Segurança Tier 1
8. **Defesa pré-launch completa** (commit `a5b20ba`, do início da sessão)
   - HSTS + X-Frame-Options DENY + nosniff + Referrer-Policy + Permissions-Policy via `next.config.ts`
   - Honeypot (campo `website` invisível) — humano nunca preenche
   - Time-check ≥2.5s entre render e submit
   - Rate-limit por IP hash (3 leads/24h, SHA-256 com salt random 32 bytes)
   - `WAITLIST_IP_SALT` random hex em prod (não mais fallback previsível)
   - Vercel Bot Protection (Firewall) modo Log

### Observabilidade
9. **Vercel Web Analytics ativado** (commit `48071c3`)
   - Hobby plan: 50k events/mês, 30 days history
   - `@vercel/analytics` instalado, `<Analytics />` em `app/layout.tsx`
   - Habilitado no Dashboard
   - Já coletando dados

10. **Vercel Speed Insights SDK instalado** (commit `8fe770f`)
    - `@vercel/speed-insights` instalado
    - `<SpeedInsights />` em `app/layout.tsx`
    - ⏳ Falta clicar Enable no Dashboard (botão não respondeu via automação, provável proteção anti-bot do Vercel)

### Docs
11. **Atualização massiva de contexto** (commits `4ddb75a`, `57dbae2`, `8fe770f`)
    - `CLAUDE.md` raiz: pendências prioritárias atualizadas (Resend verify, INPI, rotação chaves)
    - `components/landing/CLAUDE.md`: 5 entradas novas (logo, foco 3D, WhatsApp CTA, Resend, fix RLS)
    - `services/CLAUDE.md`: email.ts adicionado, waitlist usando service_role, pattern RLS+RETURNING
    - `.env.example`: `SUPABASE_SERVICE_ROLE_KEY` documentada como obrigatória + Resend descomentado
    - `CEO_COMMAND.md`: atualizado com balanço da sessão e pendência crítica de rotação de chaves
    - `ROADMAP.md`: 7 items marcados concluídos

## 🔴 Blockers / Pendências críticas

### Externos (fora do nosso controle)
- **Resend domain verify travado em `pending`** há ~10h depois do DNS publicar
  - DNS validado em todos os resolvers (Cloudflare, Google, Quad9) com valores idênticos ao que Resend espera
  - Suspeita principal: região `sa-east-1` (São Paulo) é menos ativa no AWS SES, latência alta pra propagar verificação
  - 3 verifies forçados em sequência não destravaram
  - **Próxima ação proposta**: deletar e recriar domain no Resend escolhendo `us-east-1` (Virginia, região mais ativa) — força re-fetch e gera novos records DKIM/MX. ~15-20min de retrabalho no Registro.br.

### Pendências de você (CEO)
- **Rotacionar chaves expostas no chat**: `RESEND_API_KEY` (`re_dC5mthxm_...`) e `SUPABASE_SERVICE_ROLE_KEY` (passou pelo clipboard)
  - Resend Dashboard → API Keys → delete + create new → atualizar Vercel env (5min)
  - Supabase Dashboard → Settings → JWT Keys → Reset JWT Secret → atualizar Vercel env (5min)
- **Speed Insights Enable** (Vercel Dashboard, 1 clique)
- **Marca INPI** depositar HAYZER nas classes 35 + 42 (R$ 415-1660/classe) — proteger antes do post LinkedIn público
- **Post LinkedIn anúncio** — Marcos + Carla podem escrever (~30min)

## 📐 Decisões registradas (ADRs)

- `decisions/009-naming-hayzer.md` — Rebranding BVaz Hub → Hayzer
- `decisions/010-foco-vertical-maker-3d.md` — Foco vertical em maker 3D na landing Fase 1
- `decisions/011-rls-returning-anon.md` — Service Role no insert público da waitlist (pattern reutilizável)

## 📦 Commits da sessão (19 commits)

Em ordem cronológica:

1. `a5b20ba` — defesa pre-launch: honeypot + time-check + rate-limit IP + security headers + waitlist_leads
2. `dbe6c5d` — fix landing: scroll-padding pra anchors + hero proporções + gradient ambient
3. `7b12bf0` — fix LayoutSwitch: não sobrescrever bg via inline style
4. `6b02c6d` — landing v2: refundação visual option-c (paleta petrol + Fraunces + split + grain)
5. `ba47432` — brand: salva linha editorial v2 oficial (visual-system-v2.md)
6. `70fcb13` — naming: rebatiza BVaz Hub → Hayzer (oficial 14/05/2026)
7. `a958610` — naming: aponta metadataBase pra hayzer.com.br
8. `db490d0` — fix(footer): watermark 'feito no brasil.' cortado no mobile
9. `195e04e` — auto: claude session changes
10. `adeb36f` — logos: mockup r2 com 4 conceitos figurativos (Diego rodada 2)
11. `4ddb75a` — docs: atualiza CLAUDE.md raiz + landing + CEO_COMMAND pra Hayzer
12. `5c3ba7b` — auto: claude session changes (logo Hayzer real)
13. `9cd43c6` — chore: remove duplicate public/hayzer.png
14. `cc4330f` — feat(landing): foco vertical maker 3D (ADR-010)
15. `5bc66af` — auto: claude session changes (services/email.ts + WhatsAppGroupCta + actions wire-up)
16. `fccd49f` — fix(waitlist): usa service_role no insert/update (RLS bloqueava RETURNING)
17. `57dbae2` — docs: atualiza CLAUDE.md/ROADMAP + ADR-011 sobre RLS+RETURNING
18. `48071c3` — feat: ativa Vercel Web Analytics (Hobby plan, 50k events/mês)
19. `8fe770f` — feat: ativa Vercel Speed Insights + atualiza CEO_COMMAND

Total: **~3.162 linhas adicionadas, 134 removidas, 37 arquivos**.

## 🔐 Itens de segurança a lembrar

- **`RESEND_API_KEY`** (`re_dC5mthxm_AB9HBKokkyDxX5RBy3ZPV2vr`) exposta no chat — rotacionar
- **`SUPABASE_SERVICE_ROLE_KEY`** passou pelo clipboard (Supabase → Vercel via Ctrl+V) — rotacionar via Reset JWT
- Ambas estão em ambiente seguro (Vercel env vars), risco é se chat vazar. Higiene > urgência.

## 🚀 Próximas ações (priorizadas)

### Imediato (próxima sessão)
1. **Decidir Resend**: deletar e recriar domain em us-east-1 (15-20min) — se quiser destravar email rápido. Ou contatar suporte Resend.
2. **Speed Insights Enable** no Dashboard (1 clique)
3. **Rotacionar as 2 chaves expostas** (10min total)

### Esta semana (até 19/05)
4. **Marca INPI** (~30min via gov.br/inpi, com guia pelo Chrome) — classes 35 + 42, custo R$ 415-1660/classe
5. **Post LinkedIn** anunciando "em breve" (Marcos + Carla escrevem)
6. **Direito de deleção** endpoint DELETE /api/me (LGPD compliance)
7. **Vercel BotID** ativar no form

### Próximas semanas (até 04/07)
- Semana 4: Wave 1 Customers (tela /customers + métricas)
- Semana 5: Admin completo (/admin com flags)
- Semana 6: PWA + Mobile polish
- Semana 7: Launch checklist (`/launch:checklist`)
- 04/07: Launch público

---

## 📋 Pra continuar depois do /clear

Cole este bloco no início da próxima sessão:

> Continuando trabalho em **Hayzer** (SaaS multi-projeto · Next 16 · Supabase · Vercel · Tailwind 4).
> Última sessão (24h, 14-15/05/2026): rebranding BVaz→Hayzer + landing v2 + logo real + foco maker 3D + bug RLS fixado + Resend setup + Analytics.
>
> **Lê primeiro** (em ordem):
> 1. `CLAUDE.md` (raiz) — regras + status atual
> 2. `sessions/2026-05-14-15-fase1-launch-prep.md` — snapshot da sessão anterior
> 3. `decisions/011-rls-returning-anon.md` + `decisions/010-foco-vertical-maker-3d.md` + `decisions/009-naming-hayzer.md` — ADRs novos
> 4. `ROADMAP.md` — items concluídos e pendentes
>
> **Estado real agora**:
> - ✅ Site no ar em https://hayzer.com.br (SSL automático Vercel)
> - ✅ Form waitlist 100% funcional em prod (RLS bug fixado via service_role)
> - ✅ Tela /waitlist/obrigado com WhatsApp CTA verde clicável
> - ✅ Logo Hayzer real (H+raízes) em produção
> - ✅ Copy maker 3D em prod (ADR-010)
> - ✅ Vercel Web Analytics ativo coletando dados
> - 🔴 Resend domain verify travado em `pending` há 10h+ (DNS perfeito, problema interno AWS SES)
> - ⏳ Speed Insights instalado mas precisa clicar Enable no Dashboard
> - 🔴 Chaves `RESEND_API_KEY` + `SUPABASE_SERVICE_ROLE_KEY` expostas no chat anterior — rotacionar
>
> **Próxima ação**: decidir caminho do Resend (recriar em us-east-1 vs aguardar vs trocar provedor). CEO já tá ciente.
>
> **Próximas ações Fase 1 (até 04/07)**:
> - Esta semana: Marca INPI + Post LinkedIn + Direito deleção + Vercel BotID
> - Semana 4 (03-09/06): Tela /customers
> - Semana 7 (24-30/06): Launch checklist
>
> **Importante**:
> - Lançamento público: 04/07/2026 (~7 semanas)
> - Time G7 ativo (ADR-008): Helena, Diego, Felipe, Bruna, Otávio, Carla, Marcos, Sofia, Júlia, Ricardo, Paulo, Lia + 3 críticos do council
> - Convenções: PT-BR sempre, anti-IA, sem em-dashes em copy, service-first (lógica DB em `services/`), project_id obrigatório em queries
> - Não mexer sem avisar: `lib/supabase/schema.sql`, `services/paymentConfig.ts`, `middleware.ts`, `lib/store.tsx`, `app/layout.tsx`
