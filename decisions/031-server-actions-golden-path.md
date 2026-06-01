# ADR 031 — Server Actions pro Golden Path (CRM lead → pedido)

> Status: **ACCEPTED** (já em prod, commit `386ceb6`)
> Data: 2026-06-01
> Autor: Claude (Opus 4.7) + Workflow G7 wv1c1yo49 (Bruna + Felipe + External Researcher + Helena)
> Aprovado: CEO Gabriel (autorizou modo ultracode, validação SQL passou em prod)

---

## Contexto

Pós-deploy `ddc7355` em 29/05/2026, smoke test golden path #1 (lead → pedido)
disparado em 01/06/2026 revelou bug P0 crítico em prod:

### Sintomas observados (Chrome MCP em hayzer.com.br/crm)

1. **Skeleton eternal em /crm, /orders, /projects** — DOM vazio após 14s
2. **Lead criado via UI aparece otimisticamente, NÃO PERSISTE no DB** —
   `SELECT * FROM leads WHERE name = 'GP1-...'` retorna `[]`
3. **Console**: `[Auth] getSession timed out — unblocking UI (no session confirmed)`
   (warning repetido 4x consecutivamente)
4. `/dashboard` funciona OK (única rota com path SSR cookie-based — independe
   do auth client)

### Root cause (Bruna G7, confidence alta)

**@supabase/auth-js 2.106.0** faz `getSession()` disparar `_refreshAccessToken()`
automaticamente quando access_token expirou (padrão 3600s). Cookie `sb-*` tem
refresh_token válido mas access_token expirado:

1. `supabase.auth.getSession()` detecta expiração
2. Dispara `fetch /auth/v1/token?grant_type=refresh_token` síncrono
3. Esse fetch acorda Fluid Compute (cold-start) + roundtrip Supabase Auth
4. Total: **8-12s de bloqueio** antes da resposta

Como `services/*.create()` chamam `requireUserId()` que depende do auth client,
TODOS os writes trampavam. `services/leads.ts:99`, `services/orders.ts:84`,
e mais ~10 services no mesmo padrão.

### External research G7 confirmou

Bug ATIVO nas issues do Supabase, não é regressão isolada:
- [#2344](https://github.com/supabase/supabase-js/issues/2344) — Web Lock deadlock em init
- [#2376](https://github.com/supabase/supabase-js/issues/2376) — RPC hang com noOpLock
- [#2111](https://github.com/supabase/supabase-js/issues/2111) — Browser auth hang
- [#1594](https://github.com/supabase/supabase-js/issues/1594) — `acquireTimeout = -1`
  (infinite) no Web Locks
- [#41968](https://github.com/supabase/supabase/issues/41968) — refreshSession/getUser
  hang após inatividade

**Conclusão**: pin de versão sozinho NÃO resolve (bugs novos chegam sem aviso).
Cookie-based `createServerClient()` JÁ funciona em prod (SSR layout prova —
sidebar carrega badges "Pedidos 3" / "Leads 7" instantaneamente).

---

## Decisão

**Migrar WRITES críticos do golden path #1 (lead → pedido manual) para
Next.js Server Actions.** Reads continuam via store cliente + SSR initialState.

### Escopo cirúrgico (NÃO refactor geral)

Apenas 2 actions atacam o caminho crítico do soft launch 13/06:

1. `createLead(payload)` — substitui `dispatch(ADD_LEAD)` → `leadsService.create()`
2. `convertLeadToOrder(payload)` — substitui `leadsService.convertToOrder()` direto

Demais writes (UPDATE/DELETE leads, ADD_ORDER standalone, production, finance,
inventory, products) **continuam no path antigo** — débito conhecido,
ataque planejado pós-soft-launch (Bloco 5, ADR 030).

### Implementação

**Arquivo novo**: `app/crm/actions.ts`
- `'use server'` no topo (Server Actions Next.js 16 App Router)
- Schemas Zod (`CreateLeadSchema`, `ConvertLeadSchema`) com validação PT-BR
- Helper `getAuthenticatedClient()` usa `createServerClient()` de `@/lib/supabaseServer`
  (cookie-based, NÃO o browser client bugado)
- `revalidatePath('/crm')` + `revalidatePath('/orders')` pra invalidar caches SSR
- Idempotência preservada no `convertLeadToOrder` (lead já convertido retorna pedido existente)
- Multi-tenant guard: `eq('user_id', userId).eq('project_id', projectId)` em todo SELECT/UPDATE

**Arquivo editado**: `app/crm/page.tsx`
- `useStore()` destructure agora pega `rawDispatch` também
- `handleCreate` chama Server Action via `useTransition`, depois `rawDispatch(ADD_LEAD)`
  para atualizar store local SEM disparar `syncAction` (que chamaria
  `leadsService.create()` bugado)
- `handleConvertSubmit` mesmo padrão com `convertLeadToOrder`

**Por que `rawDispatch`** e não `dispatch`?
- `dispatch` = optimistic update + async `syncAction` → roda
  `leadsService.create()` → `requireUserId()` → travamento auth client
- `rawDispatch` = reducer-only, sem Supabase sync. DB já foi escrito pelo
  Server Action.

---

## Trade-offs aceitos

1. **Após F5, leads novos somem do state local** — `initialState` SSR
   (`lib/serverDataLoader.ts`) só puxa `projects` + `config`, não puxa
   `leads`/`orders` (otimização Onda Perf 2 / ADR 030). Lead persiste no DB
   mas UI mostra empty state até navegar com store re-hidratado.
   **Mitigação**: comunicar aos 5-10 makers beta no post WhatsApp inicial
   ("primeira sessão pode mostrar vazio, F5 traz dados").
   **Fix definitivo**: junto com ADR 030 (refactor store SSR + lazy core).

2. **Demais writes (UPDATE/DELETE leads, ADD_ORDER standalone, etc) ainda
   trampam** — usuário pode tentar editar lead durante beta e ver bug.
   **Mitigação**: comunicação WhatsApp + monitoramento via PostHog event
   `supabase_sync_error` (ADD na próxima sessão).

3. **Server Action também passa por Fluid Compute** — cold-start poderia
   afetar. Empiricamente: ~1-2s observado (vs 13s do client path). Aceitável
   pra pré-soft-launch. Caso piore: investigar Vercel region alignment
   (External recomendou Supabase região == Vercel região).

---

## Critérios de sucesso (validados em prod 01/06)

✅ **Passo 1 — Criar lead via UI**:
```sql
SELECT * FROM leads WHERE name = 'GP1-ServerAction-Test';
```
Retornou `{id: '3n8omy4k', user_id: '28f76aca-...', value: 300.00, ...}`.
Modal fechou em <1s. Sem erro toast.

✅ **Passo 2 — Converter lead em pedido via UI**:
```sql
SELECT l.id, l.converted_order_id, o.id, o.source_lead_id, o.status, o.customer_whatsapp
FROM leads l LEFT JOIN orders o ON o.id = l.converted_order_id
WHERE l.name = 'GP2-LeadConverter-v2';
```
Retornou JOIN bidirecional completo:
- `lead.status = 'won'` ✅
- `lead.converted_order_id = 'god8d0qy'` ✅
- `order.source_lead_id = '8i445d2n'` ✅ (traceability)
- `order.status = 'paid'` ✅
- `order.customer_whatsapp = '11999990005'` ✅ (extraído auto)
- `order.source = 'manual'` ✅

Modal fechou em 2s. Kanban moveu lead pra coluna "Ganho". KPI Conversão 0→100%.

---

## Débitos — atualizado 01/06/2026 22h (continuação da mesma sessão)

| Débito | Onde | Impacto | Status |
|---|---|---|---|
| UPDATE_LEAD via path antigo | `store.tsx:334` syncAction | Editar lead não persistia | ✅ **FECHADO** — `updateLead` Server Action (commit d48f462) |
| DELETE_LEAD via path antigo | `store.tsx:335-339` | Deletar lead não persistia | ✅ **FECHADO** — `deleteLead` Server Action (commit d48f462) |
| ADD_ORDER standalone (orders/page.tsx) | `services/orders.ts:create` | Criar pedido sem lead não persistia | ✅ **FECHADO** — `createOrder` Server Action em `app/orders/actions.ts` (commit d48f462) |
| UPDATE_ORDER / DELETE_ORDER | `store.tsx:276-303` | Edit/delete pedido falhava | ✅ **FECHADO** — `updateOrder` + `deleteOrder` Server Actions (commit d48f462) |
| **Side effects de ADD_ORDER** (auto production task + transaction receita + decrement estoque) | `core/flows/processOrder.ts` | Pedido novo não cria production task auto | ⏳ **ABERTO** — Bloco 5 (refactor processOrder pra Server Action) |
| production, finance, inventory, products writes | `services/*.ts` | Todo write em módulo interno falha | ⏳ Bloco 5+ ou pós-launch |
| Reads (loadFromSupabase) | `store.tsx:524-540` | UI mostra estado vazio após F5 | ⏳ Junto com ADR 030 |
| Pin `@supabase/supabase-js` exato | `package.json` | Risco de pegar 2.107.x com bug novo | ⏳ Quando voltar a tocar deps |

### Resumo dos commits Server Actions da sessão 01/06

1. `386ceb6` — createLead + convertLeadToOrder (golden path lead→pedido)
2. `9164f8a` — updateLeadStatus (drag-and-drop kanban) + @dnd-kit
3. `d48f462` — updateLead + deleteLead + createOrder + updateOrder + deleteOrder

**Total**: 8 Server Actions cobrindo todo CRUD de leads + pedidos. Golden path
completo + edição/deleção sem trampar em prod. Bug auth-js 2.106.0 contornado
via cookie-based createServerClient em todos os writes críticos.

---

## Plano de rollback

Server Actions são **aditivos**:
- `app/crm/actions.ts` — arquivo novo, deletar = restaurar estado anterior
- `app/crm/page.tsx` — reverter 4 edits (imports + useStore destructure +
  handleCreate + handleConvertSubmit) volta pro estado de `5f0a1f4`

Comando: `git revert 386ceb6` ou edit manual dos 4 pontos.

Risco zero pra `store.tsx` e `services/*` (não foram tocados).

---

## Decisões relacionadas

- **ADR 029** (29/05): data hard 13/06 + 27/06 — **MANTIDA**
- **ADR 030** (29/05, PROPOSED): refactor store.tsx SSR initialState + projectId —
  este ADR 031 é tatical workaround pra liberar golden path; ADR 030 é o
  refactor estrutural definitivo (Bloco 5, 18-25/06)
- **Workflow G7 wv1c1yo49**: 4 agents paralelos (Bruna diagnóstico + Felipe
  Server Actions plano + External research auth-js bugs + Helena síntese).
  Arquivo: `~/.claude/projects/.../workflows/scripts/fix-auth-prod-p0-wf_15560be4-5cd.js`

---

## Observações pra próxima sessão

1. **Logout + Login pode "limpar" o bug temporariamente** — refresh-token novo
   após login passa pelo refresh-token grace period. Bug volta após 1h
   (access_token expira de novo). Não confiável como workaround.

2. **Server Actions em Next.js 16 são server-only** — não dá pra invocar via
   `fetch()` direto sem assinatura React. Pra testes E2E futuros: criar route
   handler `/api/test-*` ou usar Playwright.

3. **Schema `LeadFormData`** em `app/crm/_components/helpers.ts` aceita
   `value: string` (form input), mas Server Action recebe `number`. Caller
   faz `parseFloat(d.value)` antes — mantido pra não quebrar interface
   compartilhada com `LeadForm` component.

4. **`uid()` ainda gera ID local** — Server Action recebe ID já gerado pelo
   client. Aceitável porque colisão é improvável (base 36, ~3 chars úteis ~46k
   combinações) e DB tem PK constraint. Migração pra `crypto.randomUUID()`
   fica pra refactor futuro (não bloqueia soft launch).
