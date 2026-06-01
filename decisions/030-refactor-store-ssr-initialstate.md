# ADR 030 — Refactor store.tsx: SSR initialState + projectId

> Status: **ACCEPTED PARCIAL** — Onda A minimal entregue 2026-06-01 (branch `feature/store-ssr-initialstate-core`). Onda B e C + passar projectId continuam aguardando Bloco 5 (18-25/06).
> Data: 2026-05-29 (criado) · 2026-06-01 (Onda A minimal entregue)
> Autor: Claude (Opus 4.7) · Aprovado: CEO Gabriel (ack visual /orders skeleton "eternal" + ack execução Onda A minimal 01/06)

---

## Status execução

### ✅ Onda A minimal — entregue 2026-06-01

Resolve o sintoma raiz do bug ADR 031 "dados somem após F5". Escopo reduzido vs. plano original pra caber no timebox pré-soft launch:

- `lib/serverDataLoader.ts`: expandido de 2 → 7 queries (projects + config + **orders + production + inventory + transactions + leads**). Retorna `InitialStateBundle = { state, preloadedKeys }`.
- `lib/store.tsx`: `StoreProvider` aceita prop nova `preloadedKeys?: LazyModuleKey[]`. Marca como 'loaded' SÓ os módulos em preloadedKeys — antes marcava TODOS, causando empty state nos não-puxados.
- `app/layout.tsx` + `components/LayoutSwitch.tsx` + `components/AppShell.tsx`: propagam o bundle.
- `app/finance/page.tsx` + `app/projects/page.tsx` + `app/settings/page.tsx`: atualizadas pra `(await loadInitialState).state.xxx`. Bônus: **conserta bug latente** — antes recebiam orders/transactions vazios do loader e silenciosamente mostravam empty state.
- `app/catalogs/page.tsx`: usa `loadCatalogsForUser` + `loadProductsForUser` (já existentes em serverDataLoaderLazy.ts) pra puxar dados reais. Antes recebia vazios.

**NÃO incluído** (Onda B+C — pós soft launch 13/06):
- Passar projectId nas queries (mantém padrão filtragem na UI; débito conhecido)
- Lazy load por módulo trocando projeto ativo
- Invalidar cache ao mudar projeto

**Validação build**: TSC zero erros, `npm run build` completa 50 pages.

**Validação prod**: pendente — branch `feature/store-ssr-initialstate-core` aguarda deploy preview Vercel + CEO confirmar via F5 em /crm e /orders após criar lead/pedido via Server Action.

### ⏳ Onda B — Lazy load secundários (já parcialmente entregue)

`useStoreModule()` JÁ existe (Onda Perf 2, 2026-05-20) — content, decisions, affiliates, movements, products, catalogs disparam fetch on-demand quando page monta. Pós Onda A minimal, esses módulos ficam 'idle' no boot (antes ficavam 'loaded' com array vazia, mascarando o bug de F5).

### ⏳ Onda C — Trocar projeto ativo (Bloco 5)

Sem execução. Atacado depois do soft launch.

---

## Contexto

Pós-deploy prod `797c149` em 29/05/2026, CEO testou `hayzer.com.br/orders` no browser logado. Observou:
- Sidebar carrega instantâneo (shell SSR + contadores corretos: 3 pedidos, 7 leads)
- **Área principal mostra skeleton placeholder por 3-8 segundos**
- Trocar entre módulos (/orders → /customers → /finance) reapresenta skeleton
- Em rede 3G/4G mobile, comportamento provavelmente piora

Diagnóstico crítico via `lib/store.tsx:214-218`:

```ts
async function loadFromSupabase(): Promise<AppState> {
  const [projects, orders, production, content, decisions,
         transactions, leads, affiliates, inventory, movements,
         config, products, catalogs] = await Promise.all([
    safeLoad(() => projectsService.getAll(),    [], 'projects'),
    safeLoad(() => ordersService.getAll(),      [], 'orders'),     // ← sem projectId
    safeLoad(() => productionService.getAll(),  [], 'production'), // ← sem projectId
    safeLoad(() => contentService.getAll(),     [], 'content'),
    safeLoad(() => decisionsService.getAll(),   [], 'decisions'),
    safeLoad(() => transactionsService.getAll(),[], 'transactions'),
    safeLoad(() => leadsService.getAll(),       [], 'leads'),
    safeLoad(() => affiliatesService.getAll(),  [], 'affiliates'),
    safeLoad(() => inventoryService.getAll(),   [], 'inventory'),
    safeLoad(() => movementsService.getAll(),   [], 'movements'),
    safeLoad(() => configService.getConfig(),   null, 'config'),
    safeLoad(() => productsService.getAll(),    [], 'products'),
    safeLoad(() => catalogsService.getAll(),    [], 'catalogs'),
  ])
  // ...
}
```

**Problemas estruturais identificados:**

1. **13 queries paralelas client-side** — toda primeira navegação aguarda 13 requests Supabase voltarem
2. **Nenhuma passa `projectId`** — cada service puxa TODOS os dados de TODOS os projetos do user. Multi-tenant correto via RLS user_id (não vaza entre users), mas overhead grande
3. **Timeout 15s** (linha 528) — se Supabase atrasar, skeleton fica até timeout estourar
4. **Sem SSR initialState** — Server Component poderia pre-carregar dados do projeto ativo via `createServerClient()` (cookie-based)
5. **`useStoreModule` existe mas não é usado universalmente** — pages V4 ainda dependem do store global hidratado

Débito já reconhecido em `services/CLAUDE.md`:

> "O store legado omite projectId e recebe todos os projetos do user — a filtragem nesse caso fica na UI via state.orders.filter(o => o.projectId === id). TODO: migrar store.tsx loadFromSupabase para passar projectId quando V4 substituir o store."

## Decisão

**Refatorar carregamento de dados em 3 ondas, atacar Bloco 5 do plano focar-qualidade (18-25/06).**

### Onda A — SSR initialState (eliminar skeleton inicial)
- Server Component em `app/(authenticated)/layout.tsx` (ou similar pattern) puxa via `createServerClient()`:
  - `projectsService.getAll()` (precisa pra resolver `activeProjectId`)
  - `configService.getConfig()`
  - Núcleo do projeto ativo: `ordersService.getAll(activeProjectId)`, `productionService.getAll(activeProjectId)`, `inventoryService.getAll(activeProjectId)`, `transactionsService.getAll(activeProjectId)`, `customersService.getAll(activeProjectId)` (5 queries server-side)
- Passa `initialState` como prop pro `StoreProvider` client
- `store.tsx` aceita `initialState`, pula `loadFromSupabase()` inicial
- `loadFromSupabase()` continua chamado APENAS no rollback de `syncAction` (mantém comportamento)

### Onda B — Lazy load secundários
- Módulos secundários (content, decisions, portfolios, catalogs, products, leads, affiliates, movements) carregam **sob demanda** via `useStoreModule(moduleName)` quando a page é montada
- Cada hook tem seu próprio loading state (não bloqueia outros)
- Cache em memória por `(moduleName, projectId)` evita re-fetch ao voltar

### Onda C — Trocar projeto ativo
- Ao mudar projeto via project switcher, **invalidar cache lazy + re-fetch núcleo** com novo `projectId`
- Notificação visual "atualizando..." (não skeleton fullscreen)

## Por que essa decisão (modo crítico)

### Por que NÃO atacar agora (29/05)
1. **Refactor cuidadoso = 2-3h focadas, baixo risco**. Sessão atual 13h+, executar nessa hora = receita pra bug
2. **Não bloqueia soft launch 13/06**. UX é lenta, não quebrada. 5-10 makers do beta vão tolerar 3-8s loading pela primeira vez (com mensagem "carregando seus dados...")
3. **Risco de regressão multi-tenant**. Mexer no carregamento de dados sem testar profundamente = risco de vazar entre projetos do mesmo user (RLS user_id continua segurando entre users)
4. **Bloco 3 (QA mobile real) revela MAIS bugs P0 do que esse**. Foco em descobrir vs refatorar

### Por que atacar em 18-25/06 (Bloco 5)
1. Soft launch 13/06 já vai ter expectativa "wait, é beta interno"
2. Feedback dos 5-10 makers vai revelar se UX lenta é DEAL-BREAKER ou só irritação
3. Tempo suficiente pra testar localmente + preview Vercel antes do launch público 27/06
4. Bloco 5 (polimento pós-feedback) é onde essa categoria de problema vive naturalmente

### Trade-offs aceitos
- 5-10 makers no beta vão notar lentidão. **Mitigação**: comunicar no post inicial WhatsApp ("primeira carregada pode demorar uns 5s, é arquitetura legada que vamos arrumar")
- Refactor pode quebrar coisas se mal feito. **Mitigação**: branch separada `feature/store-ssr-refactor`, testar Lighthouse antes/depois, smoke test golden path completo em preview antes do merge

## Critérios de sucesso

- [ ] Skeleton inicial /orders, /customers, /finance, /production, /inventory < 500ms (era 3-8s)
- [ ] Lighthouse mobile rotas internas > 75 (medir baseline antes de começar via `audits/lighthouse-runner.ps1`)
- [ ] TBT rotas internas < 400ms
- [ ] Smoke test golden path completo passa (signup → wizard → projeto → lead → conversão → pedido → produção → finance)
- [ ] Zero regressão multi-tenant (validar com 2 projetos do mesmo user, dados não vazam entre eles)
- [ ] `npm run build` passa zero TypeScript errors

## Riscos + mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Quebrar multi-tenant ao passar projectId em alguns lugares e não em outros | Média | Smoke test com 2 projetos sempre. TypeScript estrito força projectId obrigatório nas signatures |
| SSR pulling antes de cookie resolver | Baixa | `createServerClient` já lida com cookies. Padrão já testado nos webhooks |
| Lazy load por módulo gera flash de "carregando" ao trocar pages | Média | Skeleton screens locais + fade-in suave |
| Refactor leva mais que 2-3h | Alta | Timebox hard: se passar de 4h sem fechar, abortar branch e dividir em 2 ADRs (A primeiro, B+C depois) |

## Decisões relacionadas

- ADR 028 (PROPOSED 21/05): cortar escopo p/ launch 27/06 — **SUPERSEDED por ADR 029**
- ADR 029 (29/05): data hard soft 13/06 + público 27/06 — **MANTIDA**
- ADR 025 (16/05): Sentry aplicar 17/06 — **ANTECIPADO** pra Bloco 1 (29/05)
- `services/CLAUDE.md` reconhecimento débito multi-tenant
