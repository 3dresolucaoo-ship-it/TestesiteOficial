# Audit de Empty States — Hayzer Módulos Internos
**Data**: 2026-05-21 (hardwork noturno)
**Autora**: Sofia (CS Pleno G7)
**Escopo**: módulos internos do app autenticado. Landing fora de escopo.
**Método**: leitura direta do codebase (grep + read em todas as pages e _components dos 12 módulos).

---

## 1. Componentes EmptyState existentes no codebase

| Arquivo | Tipo |
|---|---|
| `components/EmptyState.tsx` | Componente genérico reutilizável (icon + title + description + actions + helperText). Criado 2026-05-16 por Sofia + Diego. |
| `app/inventory/_components/InventoryEmptyState.tsx` | Específico de inventário. Dois modos: `empty` (estoque zerado) e `no-results` (filtro sem match). |
| `app/crm/_components/CrmEmptyState.tsx` | Específico de CRM. Dois estados: tab `pipeline` vazia e tab `clients` vazia. |
| `app/production/_components/ProductionEmptyState.tsx` | Específico de produção. Um estado: fila vazia. |
| `app/content/_components/ContentEmptyState.tsx` | Específico de conteúdo. Um estado: nenhum conteúdo registrado. |
| `app/decisions/_components/DecisionsEmptyState.tsx` | Específico de decisões. Um estado: nenhuma decisão registrada. |
| `components/onboarding/WelcomeDashboard.tsx` | Onboarding de primeiro acesso. Ativa quando `state.projects.length === 0` (via DashboardView.tsx). 3 passos maker BR com CTA para /projects. |

**Total de componentes EmptyState mapeados**: 7 (incluindo o genérico).

---

## 2. Aplicados por módulo — status atual

| Módulo | Rota | Empty state aplicado | Qualidade |
|---|---|---|---|
| Dashboard (sem projeto) | `/dashboard` | `WelcomeDashboard` via `DashboardView.tsx` — condicional `projects.length === 0` | Bom. 3 passos, CTA direto para /projects. |
| Dashboard (com projeto, dados zerados) | `/dashboard` | NENHUM. Redireciona para `/projects` via `redirect()` no Server Component quando não há projeto — correto. Mas se projeto existe e dados são zero, o DashboardLayout V4 exibe KPIs todos "R$ 0 / 0" sem nenhuma orientação contextual. | Lacuna parcial. |
| Pedidos | `/orders` | Inline em `MobileCards` (mobile) e `DesktopTable` (desktop) — sem usar componente genérico. Copy: "Sua primeira venda esta esperando". | Bom. Dois pontos de entrada (mobile + desktop), copy maker BR, sem CTA de ação (ponto fraco: não tem botão "Novo Pedido" no estado vazio, user precisa voltar pro header). |
| Estoque | `/inventory` | `InventoryEmptyState` com modo `empty` e `no-results`. | Bom. Copy específica ("Adicione o filamento que você usa agora"), CTA inline, helperText educativo sobre materiais além de filamento. |
| Produtos | `/products` | Inline na page, condicional dupla: `products.length === 0` (estado inicial) e filtro sem resultado. | Bom. Copy educativa sobre o que é "produto" no contexto maker 3D. CTA presente. |
| CRM | `/crm` | `CrmEmptyState` aplicado para tab `pipeline` e tab `clients`. | Adequado. Copy razoável. Problema: tab `clients` explica como clientes aparecem (bom) mas não tem CTA alternativo. User pode ficar preso sem saber que precisa ir a /orders ou leads primeiro. |
| Produção | `/production` | `ProductionEmptyState` com ícone de impressora + CTA "Adicionar item". | Fraco. Copy mínima: "Fila vazia. Adicione um item de producao." Não educa o maker sobre o fluxo (pedido vira item de produção automaticamente quando produto é vinculado). Oportunidade perdida. |
| Financeiro | `/finance` | Filtro sem resultado: "Nenhuma transacao encontrada." (texto plano no `FinanceTransactions.tsx`). Estado inicial com transações zeradas: NENHUM estado vazio específico. FinanceView renderiza ModuleShell com KPIs todos zero sem instrução. | Crítico. Novo usuário vê R$ 0,00 em tudo e não sabe o que fazer. |
| Conteúdo | `/content` | `ContentEmptyState` aplicado. Copy sobre anotações, posts, status e views. | Adequado. |
| Decisões | `/decisions` | `DecisionsEmptyState` aplicado. Copy sobre registro de escolhas do negócio com contexto e resultado. | Adequado. |
| Catálogos | `/catalogs` | `EmptyState` local (função `EmptyState` dentro de `CatalogsView.tsx`) com ícone de loja, texto e CTA. | Bom. Copy direta: "link público sem login, sem complicação". |
| Portfólios | `/portfolios` | Inline em `PortfoliosView.tsx`. Ícone User + "Nenhum portfólio ainda" + CTA "Criar portfólio". | Fraco. Não explica o que é portfólio nem por que criar um. User que chegou aqui pela primeira vez não sabe se isso é para ele. |
| Projetos | `/projects` | Inline em `ProjectsView.tsx`: texto "Nenhum projeto ainda." + link "Criar primeiro projeto →". | Fraco. Copy mínima, sem contexto do que é um projeto no Hayzer, sem hierarquia visual. É o primeiro passo do golden path e está no nível mais baixo de capricho. |

---

## 3. Faltando — críticos (golden path maker)

O golden path do Rafael é: **criar projeto > registrar estoque > cadastrar produto > criar pedido > acompanhar produção > ver financeiro**. Empty states nesses pontos determinam se ele vai em frente ou abandona.

### 3.1 Financeiro — estado inicial zerado
**Arquivo**: `components/FinanceView.tsx` + `components/finance/FinanceTransactions.tsx`
**Problema**: quando usuário abre /finance pela primeira vez sem nenhuma transação, vê ModuleShell com todos KPIs em zero (R$ 0,00 / R$ 0,00 / 0%). Não há instrução, não há CTA. A tab "Lancamentos" exibe lista vazia sem estado vazio proprio — só o texto "Nenhuma transacao encontrada." aparece quando há filtro ativo, não na entrada zerada.
**Copy maker BR sugerida**: "Seu financeiro começa aqui. Registre a primeira receita ou despesa e o Hayzer mostra lucro real, margem e break-even do seu negócio de impressão 3D."
**CTA sugerido**: "Registrar primeiro lançamento"

### 3.2 Projetos — estado inicial (porta de entrada do golden path inteiro)
**Arquivo**: `components/ProjectsView.tsx` (linha 254)
**Problema**: empty state é texto plano "Nenhum projeto ainda." + link minimal. Projetos são a dependência raiz: sem projeto, inventory, products, orders, finance, crm, production não funcionam. O maker que chega aqui está a 1 clique de travar o onboarding inteiro se não entender o que é um projeto.
**Copy maker BR sugerida**: "Projetos organizam tudo. Pode ser o nome do seu ateliê, da sua impressora ou da sua loja. Crie o primeiro e o Hayzer conecta pedidos, estoque e financeiro automaticamente."
**CTA sugerido**: "Criar meu primeiro projeto" (com destaque visual equivalente ao WelcomeDashboard)

### 3.3 Produção — estado vazio sem contexto de fluxo
**Arquivo**: `app/production/_components/ProductionEmptyState.tsx`
**Problema**: existe o componente, mas a copy não educa. O Rafael não sabe que a fila de produção alimenta automaticamente quando ele cria um pedido com produto vinculado. Ele pode ficar tentando "adicionar item" manualmente sem entender que o fluxo certo é via /orders.
**Copy maker BR sugerida**: "Sua fila de produção aparece aqui automaticamente quando você registra um pedido com produto vinculado. Ou adicione um item manualmente se preferir."
**CTA sugerido**: Dois: "Ir para Pedidos" (primário) + "Adicionar manualmente" (secundário)

### 3.4 Dashboard V4 — novo usuário com projeto mas dados zerados
**Arquivo**: `app/dashboard/page.tsx` (Server Component) + `components/dashboard/v4/DashboardLayout.tsx`
**Problema**: o redirect para /projects acontece quando não há projeto. Mas quando há projeto e todos os dados são zero (primeiro dia), o DashboardLayout renderiza KPIs com "R$ 0" e gráficos vazios sem nenhuma orientação do próximo passo. O Rafael vê um painel de zeros e não sabe o que fazer.
**Copy maker BR sugerida**: mensagem contextual no card "nextAction" (que já existe no schema DashboardData): "Você tem tudo pronto. Comece registrando o filamento que você usa agora — leva 30 segundos e libera o cálculo de custo de cada peça."
**Observação**: a estrutura `nextAction` no DashboardData já suporta mensagem + ctaLabel + ctaHref. A lacuna é no `getDashboardData` em `services/dashboard.ts` — quando não há pedidos, o campo nextAction retorna mensagem genérica ou vazio.

---

## 4. Faltando — não críticos (secundários)

| Módulo | Lacuna |
|---|---|
| Portfólios `/portfolios` | Empty state existe mas não educa. Não explica o que é portfólio, diferença de catálogo, quem deve usar. Maker confunde os dois. |
| CRM tab Clientes | Explica como clientes aparecem mas não oferece ação alternativa ("ou importe do WhatsApp" / "ou crie um pedido"). User pode ficar preso sem CTA. |
| Produção — modo "filtro sem resultado" | Não existe. Se Rafael filtra por impressora e não acha nada, vê lista vazia sem mensagem. |
| Financeiro — tab "Custos Fixos" zerado | Renderiza lista vazia sem instrução do que são custos fixos e por que cadastrar (impacta break-even). |
| Financeiro — tab "Break Even" sem dados | Renderiza o componente `BreakEvenSection` mas sem transações/produtos cadastrados os cálculos ficam em zero. Não há orientação contextual. |
| Projetos aninhados `/projects/[id]/*` | Sub-rotas de projeto (content, crm, decisions, finance, inventory, operations) herdam o comportamento das rotas globais mas não foi verificado se têm os mesmos empty states aplicados. |
| Métricas `/metrics` | Não auditado (rota client via useStore). Provável estado zerado sem instrução quando não há dados históricos. |

---

## 5. Problemas de qualidade nos empty states existentes

### 5.1 Produção: copy não educa sobre o fluxo
`ProductionEmptyState.tsx` — "Fila vazia. Adicione um item de producao." é funcional mas não é educativo. Único CTA leva a criar item manualmente, ignorando o fluxo automático via pedidos.

### 5.2 Pedidos: empty state sem CTA de ação
`DesktopTable` e `MobileCards` em `/orders` têm copy boa mas não incluem botão "Novo Pedido" no próprio estado vazio. O botão existe só no cabeçalho do ModuleShell — mas se o Rafael chegar pelo celular e rolar a tela, o header pode ter sumido da viewport. Ele vê a mensagem bonita e não tem onde clicar.

### 5.3 CRM pipeline: botão roxo não é padrão do design system
`CrmEmptyState.tsx` usa `bg-[#7c3aed]` (roxo) enquanto o restante do app usa `hsl(173 58% 28%)` (petrol). Inconsistência visual que vai aparecer quando os dois módulos estiverem lado a lado.

### 5.4 FinanceTransactions: "Nenhuma transacao encontrada." é diagnóstico, não orientação
Texto de erro mínimo, sem acento, sem CTA. Violação direta do padrão de empty state definido (contexto + ação clara).

### 5.5 Projetos: hierarquia visual muito baixa
O empty state de /projects é o mais crítico do golden path e é o mais fraco visualmente. Texto + link pequeno vs. o WelcomeDashboard que tem glow, 3 steps, CTA prominente. Inconsistência de importância percebida.

---

## 6. Recomendação — ordem de implementação

**Prioridade 1 — Antes do soft launch (11/06)**

1. **Projetos** (`components/ProjectsView.tsx`) — esforço: baixo — impacto: desbloqueio do golden path inteiro. Elevar para o mesmo padrão visual do WelcomeDashboard. Quem chega em /projects pela primeira vez precisa de orientação equivalente.

2. **Financeiro estado inicial** (`components/FinanceView.tsx` + `FinanceTransactions.tsx`) — esforço: baixo — impacto: evita abandono de usuário que abre finance, vê zeros, e acha que algo está quebrado.

3. **Produção copy** (`app/production/_components/ProductionEmptyState.tsx`) — esforço: muito baixo (só copy) — impacto: elimina confusão sobre fluxo automático de pedidos. Carla precisa aprovar o texto final.

4. **Pedidos: CTA no empty state** (`app/orders/page.tsx`, componentes `MobileCards` e `DesktopTable`) — esforço: baixo — impacto: resolve o gap de "vejo a mensagem mas não sei onde clicar" em mobile.

**Prioridade 2 — Antes do launch público (27/06)**

5. **Dashboard V4 dados zerados** — depende de ajuste em `services/dashboard.ts`. O `nextAction` já existe no schema, é questão de popular com mensagem de onboarding quando ordersCount === 0.

6. **Portfólios copy** — esforço: muito baixo — impacto: reduz confusão catálogo vs. portfólio.

7. **CRM tab Clientes: CTA alternativo** — adicionar link para /orders ou /crm?tab=pipeline quando lista de clientes está vazia.

8. **Financeiro Custos Fixos e Break Even zerados** — copy educativa sobre por que cadastrar custos fixos e como o break-even funciona.

**Prioridade 3 — Wave 1 pós-launch**

9. **Produção filtro sem resultado** — empty state para busca/filtro sem match.
10. **Projetos aninhados** — auditoria das sub-rotas `/projects/[id]/*` para confirmar herança de empty states.
11. **Métricas** — auditoria específica da rota /metrics.
12. **CRM: consistência de cor** — padronizar botão do CrmEmptyState para petrol (hsl 173) em vez de roxo.

---

## 7. Mapa visual de cobertura

```
Módulo          Golden path?   Empty state?   Qualidade
/projects            S             fraco        baixa
/inventory           S             sim          boa
/products            S             sim          boa
/orders              S           parcial        media (sem CTA no vazio)
/production          S             sim          fraca (copy mínima)
/finance             S           parcial        crítico (inicial sem estado)
/crm                 N             sim          media
/decisions           N             sim          adequada
/content             N             sim          adequada
/catalogs            N             sim          boa
/portfolios          N           parcial        fraca (sem educação)
/dashboard (zero)    S         WelcomeDashboard  boa (mas só sem projeto)
/dashboard (dados 0) S             lacuna       crítico
```

---

## Arquivos de referência citados neste audit

- `components/EmptyState.tsx`
- `components/onboarding/WelcomeDashboard.tsx`
- `app/inventory/_components/InventoryEmptyState.tsx`
- `app/crm/_components/CrmEmptyState.tsx`
- `app/production/_components/ProductionEmptyState.tsx`
- `app/content/_components/ContentEmptyState.tsx`
- `app/decisions/_components/DecisionsEmptyState.tsx`
- `app/orders/page.tsx` (linhas 122-198 e 214-239)
- `app/products/page.tsx` (linhas 157-192)
- `components/ProjectsView.tsx` (linhas 254-260)
- `components/CatalogsView.tsx` (linhas 206-222)
- `components/PortfoliosView.tsx` (linhas 310-332)
- `components/FinanceView.tsx` (sem empty state inicial)
- `components/finance/FinanceTransactions.tsx` (linha 142-145)
- `components/DashboardView.tsx` (integração WelcomeDashboard)
- `app/dashboard/page.tsx` (redirect sem projeto, linha 169-171)
