# Sessão 2026-05-20 — Hardwork V4 completo: visual unificado + perf + golden path #1

> Snapshot imutável. Pra próxima sessão: leia o bloco "Pra continuar" no final.

## 🎯 Tema
Fechar visual V4 unificado em TODOS módulos, otimizar performance, entregar golden path #1 lead→pedido, base pra launch 27/06.

## ⏱️ Duração
~9h corridas (continuação da madrugada 21/05 → tarde 20/05).

## ✅ Entregas

1. **Onda A** (merge `7d330ce`): ícones Lucide coloridos sidebar + count-up KPIs + hover petrol + badges semânticos + watermark dense em módulos densos
2. **Onda B** (merge `ed82046`): 6 mudanças /orders fechando gap mockup (eyebrow rico SEM N + subtitle maker BR humanizado + KPI sub com delta + sat ATRASADOS ember + botão Filtros + badge tempo)
3. **Onda Performance** (merge `821a5e5`): SSR queries 13→2 (84% redução) + Lottie lazy load + fonts preload
4. **Onda Perf 2** (merge `66b6db9`): lazy module loading em store.tsx + skeleton screens FUNCIONANDO de verdade em /orders /crm
5. **Etapa 3 — 4 empty states críticos** (merge `eb6d720`): FP-01 /projects + FP-02 /finance + FP-03 /production + FP-04 /orders
6. **Etapa 3 — Golden Path #1 lead→pedido** (merge `d748ed6`): migration aplicada Supabase + leadsService.convertToOrder + ConvertToOrderModal + badge "Pedido criado"
7. **V4Shell recovery** (sessão anterior cravou base): cherry-pick `f0a2700` + sidebar V4 unificada 14 módulos + AppShell V4 + glow fundo + loading V4
8. **Bug TSC crítico corrigido** (`e0bb450`): redeclare duplicado em orders/page.tsx
9. **43 logos concorrentes + 4 fotos novas + 9 timelapses Bambu Lab** em `public/landing/v3/`
10. **Carla copy onboarding completa**: `brand/onboarding-copy-2026-05-20.md` (welcome wizard 4 telas + email + 7 microcopy)
11. **Diego análise comparativa** Vultrix3D vs Hayzer + 5 mudanças Onda A propostas e implementadas

## 🔴 Pendências críticas pré-launch

1. **QA mobile**: zero feito. Checklist em `sessions/2026-05-20-checklist-qa-mobile.md`. CEO precisa rodar no celular real
2. **Onboarding wizard implementação**: Carla escreveu copy, Felipe ainda não implementou
3. **Inconsistência tu/voce**: Sofia/Felipe usaram "voce" em empty states. Carla cravou "tu". Search-replace simples próxima sessão
4. **Etapa 3 incompleta**: tem golden path #1 e empty states, faltam QA mobile + onboarding wizard

## 📐 Decisões registradas

- ADR informal CEO 20/05: **Opus em tudo na sessão principal**. Eu (sub-CEO) escolho modelo dos subagentes G7
- Diego cravou: **petrol verde fica primary, NÃO adiciona azul**. 7 pilares de diferenciação durável Hayzer
- Bruna 2: Skeleton screens funcionando real exige refator store lazy (entregue Onda Perf 2)

## 📦 Commits da sessão (do início ao fim)

Da Onda A em diante (~30 commits). Principais: `7d330ce` (Onda A), `ed82046` (Onda B), `821a5e5` (Perf), `66b6db9` (Perf 2), `eb6d720` (empty states), `d748ed6` (golden path #1), `6378a91` (assets timelapses+fotos).

## 🔐 Itens de segurança

- Migration `20260520_leads_converted_order.sql` APLICADA em prod via Supabase MCP
- Env vars Vercel: NEXT_PUBLIC_SUPABASE_URL + ANON_KEY agora marcadas em Production E Preview (CEO autorizou)
- Nenhuma credencial exposta nesta sessão

## 🚀 Próximas ações priorizadas

1. **QA mobile** (CEO no celular, ~30-60min, checklist pronto)
2. **Onboarding wizard implementação** (Felipe pega copy Carla + implementa, ~3-4h)
3. **Inconsistência tu/voce** (search-replace 30min)
4. **Onda Landing**: seção comparativa concorrentes com 43 logos (Felipe ~3-4h)
5. **Onda Perf 3** opcional: refatorar /finance /production /inventory pra usar useStoreModule também
6. **G7 app** congelado até pós-launch 27/06 ou MRR R$ 8k/mês (ADR-010)

## 👥 Agentes G7 envolvidos

- **Diego** (Opus): análise comparativa Vultrix vs Hayzer + revisão sidebar V4
- **Felipe** (Opus): Onda A 5 mudanças + Onda B 6 mudanças + 3 módulos legados ModuleShell + 4 empty states + CSS V4 extract
- **Bruna 1** (Opus): golden path #2 filamento + golden path #1 lead→pedido + migration
- **Bruna 2** (Opus): Onda Perf SSR slim + Onda Perf 2 lazy store
- **Carla** (Opus): copy onboarding wizard + email + microcopy
- **Sofia** (Opus): audit empty states (sessão anterior, agora Felipe implementou)
- **Lia** (Opus, sessão anterior): docs

## 🧠 Aprendizados

### Padrões CEO observados
- **Didático com analogias** (cravado em memory): CEO valoriza "cofre vs cópia" pra git merge ao invés de jargão. Toda explicação técnica → analogia primeiro
- **Tu, não você**: maker BR proximidade. Carla cravou nesta sessão, virou padrão brand
- **Opus em tudo** na sessão principal: aceita queimar cota por qualidade de decisão
- **Hardwork autônomo** quando autoriza: "faz tu mesmo, só me chama se realmente precisar"

### Erros cometidos (não repetir)
- **Pedi permissão pra clicar checkbox env var** que não muda valor — CEO bravo "voce ja não falei sobre isso". Memória "Autonomia em ações reversíveis" violada
- **Esqueci do Supabase MCP** pra aplicar migration — CEO lembrou "esquice de novo que tem acesso ao meu computador?"
- **Diego foi agressivo demais** em "não copia Vultrix" — CEO pediu modelar, não copiar. Eu repassei sem suavizar
- **iLove3D não existe**: memória antiga errada. Concorrente real é Precifi3D
- **Bug TSC herdado**: deixei merge passar com bug pré-existente. CORRIGI mas memória "erro pré-existente não existe" violada

### Sucessos (repetir)
- **3-4 agentes G7 paralelos** com escopo cirúrgico bem definido em cada prompt
- **Modo crítico Diego/Helena** quando CEO compara com concorrente — ataca premissa antes de aceitar
- **TSC + build local ANTES de push** sempre — pegou bug duplicado pré-existente
- **CEO valida visual em preview Vercel** antes merge prod = zero rollback hoje

### Conhecimento técnico
- **Vercel preview branches têm cookies separados** de prod (cookies bound to domain). CEO precisa logar em CADA preview novo
- **Lazy store + useStoreModule** Bruna desenhou: SSR boot 2 queries + on-demand por módulo + cache no store
- **Empty states Next.js**: `loading.tsx` só ativa se Suspense boundary. AppShell LoadingScreen intercepta antes → exige refator store (feito Onda Perf 2)
- **Migration aplicada via Supabase MCP** `apply_migration` direto (não precisa CEO no painel)
- **react-countup** dispensável: hook RAF próprio em `lib/hooks/useCountUp.ts` (Bruna 2 desenhou)

### Conhecimento de domínio
- **Vultrix3D não é ameaça** real ainda (placeholder beta com "0+ makers")
- **Precifi3D é concorrente direto** (calculadora 3D paga, Hayzer dá grátis)
- **Maker BR usa**: Bling, Tiny ERP, Conta Azul, Google Sheets, Trello, Notion, WhatsApp Business — todos cobrados separados
- **Hayzer diferencial real**: calculadora grátis sem cap + integração all-in-one no plano único (vs 5+ saas separados)
