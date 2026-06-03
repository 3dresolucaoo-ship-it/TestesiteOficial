# ADR 032 — Débitos técnicos consolidados pro Bloco 5 (pós soft-launch)

> Status: **DOCUMENTAÇÃO** (não decisão nova — consolida pendências)
> Data: 2026-06-03
> Autor: Claude (Opus 4.7)
> Contexto: pós-merge `feature/store-ssr-initialstate-core` em main, restam 2 branches preview + débitos abertos
> Bloco 5: 18-25/06/2026 (entre soft launch 13/06 e launch público 27/06)

---

## Por que este ADR existe

Sessão 03/06 manhã entregou 14 commits em 3 branches resolvendo a maioria dos débitos pré soft-launch. Mas alguns ficaram abertos por escolha consciente (risco vs valor). Este ADR consolida pra próxima sessão pegar contexto rápido e não atacar débito de menor prioridade antes do crítico.

---

## Débitos abertos por categoria

### 🔴 Crítico (atacar primeiros 3 dias pós soft-launch)

**1. Side effects auto de ADD_ORDER**
- **Onde**: `core/flows/processOrder.ts`
- **Funções**: `processNewOrder` e `processOrderUpdate`
- **Impacto**: hoje, criar pedido via Server Action (`createOrder`) NÃO dispara automaticamente production task + transaction receita + decrement estoque. Maker precisa criar production task manual.
- **Por que ficou aberto**: refactor pra Server Action é complexo (transação multi-tabela, lógica de produto template, idempotência). Sessão 03/06 atacou writes diretos mas não esse fluxo de orquestração.
- **Solução proposta**: 
  - Opção A: Server Action única `processOrderWithSideEffects` em `app/orders/actions.ts`
  - Opção B: Edge Function Supabase chamada pelo client (mantém atomicidade DB)
  - Recomendação: A (Server Action) por consistência com resto do golden path
- **Estimativa**: 4-6h com testes
- **Risco**: alto (lógica de negócio crítica + multi-tabela)

**2. Mobile QA real**
- **Onde**: TODAS as rotas internas, especialmente /crm, /orders, /production, /inventory, /finance
- **Impacto**: ADR 029 + Lição memory "Chrome MCP NÃO emula mobile" — só CEO no iPhone real pode validar
- **Por que ficou aberto**: CEO precisa fazer pessoalmente
- **Solução proposta**: agendado pra 03/06 18h pelo CEO
- **Estimativa**: 30-60min CEO + ajustes (variável)

---

### 🟠 Médio (atacar dias 4-7 pós soft-launch)

**3. Onda C ADR 030 — Invalidar cache trocar projeto**
- **Onde**: `lib/store.tsx` + `components/dashboard/v4/V4Shell.tsx` (project switcher)
- **Impacto**: trocar projeto ativo no V4Shell hoje não re-fetch dados (store mantém dados do projeto anterior misturado)
- **Por que ficou aberto**: Onda A minimal foca em F5 funcionar. Trocar projeto é uso secundário.
- **Solução proposta**: useEffect no project switcher que dispara `loadModule` pros 5 core + invalida cache lazy dos secundários
- **Estimativa**: 2-3h

**4. Loading.tsx + Layout V4 pros últimos 2 módulos legacy**
- **Onde**: `app/content/page.tsx` + `app/decisions/page.tsx`
- **Impacto**: visual dark/roxo antigo (pré-V4) — inconsistente com resto do app
- **Por que ficou aberto**: tempo. Loading.tsx feito pra ambos (em layout simples), mas page ainda legacy.
- **Solução proposta**: migrar pages pra ModuleShell V4 (mesmo padrão de /orders)
- **Estimativa**: 3-4h por módulo

**5. Affiliates writes via Server Action**
- **Onde**: `services/leads.ts` (affiliatesService) + `store.tsx` syncAction
- **Impacto**: affiliates ainda usa path antigo (dispatch + syncAction) — trampa pelo bug auth-js
- **Por que ficou aberto**: affiliates não é golden path (decisão 31/05). Ataque após validar maker beta usa de fato.
- **Estimativa**: 1-2h

---

### 🟡 Baixo (pode ficar pra v0.5)

**6. Side effects DELETE_ORDER**
- Pedido pago deletado hoje não reverte transação receita nem repõe estoque
- Risco: contabilidade fica errada se maker deletar pedido pago
- Estimativa: 2-3h

**7. uploadImage de produto migrar pra Server Action**
- Hoje usa browser client direto (funciona porque storage não passa pelo auth-js refresh)
- Não trampa, mas inconsistência com resto. Baixa prio.
- Estimativa: 1h

**8. Search index refresh pós bulk inserts**
- `services/search.ts.refreshSearchIndex` existe mas não é chamado em lugar algum
- View materializada `search_index` precisa refresh manual ou via pg_cron
- Estimativa: 1h (configurar pg_cron) ou 30min (chamada pós-import)

**9. Lighthouse rotas internas**
- Bloqueado por `LIGHTHOUSE_SESSION_COOKIE` que CEO precisa extrair do DevTools
- Estimativa: CEO 5min + audit ~30min

**10. Sentry init em prod**
- Programado 17/06 (ADR 025). DSN já existe no Vercel env, falta validar init
- Estimativa: 1h

**11. /catalogs page lazy loaders consistência**
- Hoje page usa `loadCatalogsForUser` + `loadProductsForUser` (entregue Onda A)
- Funciona mas duplica padrão com `loadInitialState`. Refactor opcional pra consistência.
- Estimativa: 1h

---

## Não débitos (entregue na sessão 03/06)

- ✅ SSR initialState 5 core (Onda A minimal) — mergeado main
- ✅ Pin @supabase/supabase-js 2.106.0 — mergeado main
- ✅ PostHog `supabase_sync_error` — mergeado main
- ✅ Server Actions writes inventory/finance/production/products (aguarda merge)
- ✅ 6 loading.tsx pages V4 (aguarda merge)
- ✅ OG image catálogo dinâmica (aguarda merge)
- ✅ Reset password + signup público (aguarda merge)
- ✅ Email sequence D+1/D+3/D+7 + cron Vercel (aguarda merge)
- ✅ Migration `email_sequence_log` em prod
- ✅ CRON_SECRET no Vercel env
- ✅ Fix middleware `/api/cron` público

## Falsos débitos (já existiam — Bruna 18/05)

- ✅ NotificationBell.tsx funcional (sino + drawer + mark as read)
- ✅ GlobalSearch.tsx funcional (cmdk Ctrl+K + agrupamento)

---

## Plano de execução proposto pra Bloco 5

**Dias 14-15/06** (logo após soft launch 13/06)
- Coleta feedback inicial 5-10 makers beta (variável CEO)
- Bug fixes do que aparecer no mobile QA + feedback

**Dias 16-18/06**
- Débito #1: refactor `processOrder` pra Server Action
- Débito #3: Onda C invalidar cache trocar projeto

**Dias 19-21/06**
- Débito #4: migrar /content e /decisions pra V4
- Débito #10: validar Sentry init

**Dias 22-25/06**
- Polimento visual + débitos baixos
- Landing comparativa (Marcos)
- Sequência email D+1/D+3/D+7 monitoring (se cron já tiver disparado, ajustar copy)
- Go/No-Go 26/06

---

## Decisões relacionadas

- ADR 029 (29/05): datas soft 13/06 + público 27/06
- ADR 030 (29/05, ACCEPTED PARCIAL): Onda A entregue, B parcial via useStoreModule, C aberta
- ADR 031 (01/06, ACCEPTED): Server Actions golden path — 3 débitos fechados 02/06 (reads SSR + pin deps + PostHog)
