# components/ — UI Components

> Componentes globais reutilizáveis. Componentes de página vivem dentro da rota.

## Convenções

- `'use client'` no topo (todos são client components)
- PascalCase em arquivos e nomes
- Props tipadas via `interface Props`
- Estilos: Tailwind 4 + CSS variables (`var(--t-bg)`, `var(--t-accent)`)
- **Não usar valores hardcoded de cor** — usar variáveis CSS (`bg-background`, `text-foreground`)
- Dark/light mode via classe `dark:` no `<html>` (definida em `context/ThemeContext.tsx`)

## Status atual

| Componente | Linhas | Status |
|---|---|---|
| SettingsView.tsx | **220** | ✅ refatorado — tabs em `settings/` (8 sub-componentes) |
| DashboardView.tsx | **483** | ✅ refatorado — shared em `dashboard/shared.tsx` |
| Sidebar.tsx | 36 | ✅ refatorado — sub-componentes em `sidebar/` (7 arquivos) |
| FinanceView.tsx | ~420 | ✅ migrado ModuleShell V4 (2026-05-20) — KpiRow hero+3 satellites, tabs Lancamentos/Custos Fixos/Break Even, FilterBar integrado |
| FinanceCharts.tsx | 465 | ✅ |
| PortfoliosView.tsx | 445 | ✅ |
| CatalogsView.tsx | 313 | ✅ |
| ProjectsView.tsx | 280 | ✅ |
| AppShell.tsx | 160 | ✅ shell + auth + db error toast |
| TopBar.tsx | 154 | ✅ |
| Modal.tsx | 68 | ✅ helpers de form |
| ShareButton.tsx | 46 | ✅ |

## dashboard/v4/ModuleShell (novo · 2026-05-18)

Shell editorial V4 reutilizavel para os 12 modulos do dashboard.
Extrai o pattern do mockup `orders-v4-tom-novo.html` (PageHeader + KpiRow + FilterBar + children).
Exportado no barrel `@/components/dashboard/v4`. Doc de uso em `ModuleShell.md`.
TypeScript estrito, zero any, zero ESLint warnings. CSS depende de `app/globals-v4.css`.
Proxima etapa: migrar `/orders` real como primeiro modulo (valida visual ao vivo).

## visual-library/ (novo · 2026-05-18)

Biblioteca de assets decorativos e utilitarios da identidade Hayzer.
9 componentes: TapeBadge, UnderlineMarker, HighlightedText, Stamp, GrainOverlay, GlowPetrol, RootSvg, LottiePlayer, VideoBackground.
Barrel export via `index.ts`. Doc completa em `components/visual-library/README.md`.
Showcase vivo em `/library` (admin only).
Dep nova instalada: `lottie-react`.

## finance/ (novo · 2026-05-20)

FinanceView decomposto em 6 arquivos focados dentro de `components/finance/`.
Export publico mantido identico: `FinanceView` via `components/FinanceView.tsx`.

| Arquivo | Responsabilidade |
|---|---|
| `types.ts` | `FormData`, `ALL_LABELS`, `fmt`, `parseDate`, keys legacy (FinanceTab V4 agora em FinanceView.tsx) |
| `FinanceKpis.tsx` | Grid 4 cards KPI legado (nao usado pelo ModuleShell V4 — substituido por KpiRow declarativo) |
| `FinanceFixedCosts.tsx` | `FixedCostRow` (inline edit) + `FinanceFixedCosts` (lista + form add) + `ProgressBar` |
| `FinanceTransactionForm.tsx` | `TransactionForm` + `CreateTransactionModal` + `EditTransactionModal` |
| `FinanceBreakEven.tsx` | `BreakEvenSection` completo (header educacional + projeto selector + fixed-costs + profit goal + tabela produtos) |
| `FinanceTransactions.tsx` | `FinanceFilterBar` + `FinanceTransactionList` + `FinanceChartsPanel` + `FinanceMonthlySummary` |

ESLint: 2 erros pre-existentes de `react-hooks/set-state-in-effect` (herdados do arquivo original, nao introduzidos — BUG pendente correcao futura).

## sidebar/ (novo · 2026-05-19)

Sidebar decomposto em 7 arquivos focados dentro de `components/sidebar/`.
Exports publicos mantidos identicos: `Sidebar`, `MobileNav`, `BottomNav` via `components/Sidebar.tsx`.

| Arquivo | Responsabilidade |
|---|---|
| `types.ts` | `NavItem`, `ModuleNavItem` |
| `useSidebarState.ts` | `useProjectContext()`, `useSidebarCollapsed()` |
| `SidebarNavLink.tsx` | Link individual com estado ativo/hover |
| `SidebarLogo.tsx` | Logo com fallback Hayzer |
| `SidebarFooter.tsx` | Status Supabase + versao |
| `SidebarGlobalNav.tsx` | Nav global (expanded + collapsed) + dados de nav |
| `SidebarProjectNav.tsx` | Nav de projeto especifico |
| `SidebarMobileNav.tsx` | `MobileNav` (drawer) + `BottomNav` (barra inferior) |

## Issues conhecidos

- ✅ ~~`SettingsView.tsx` e `DashboardView.tsx` gigantes~~ — refatorados em 2026-05-04
- ❌ Design "sem peso" — ver feedback em `ROADMAP.md` § Design
- ✅ ~~`BuyButton.tsx` pode estar morto~~ — removido em 2026-05-09; substituído por `app/catalogo/[slug]/CatalogActionButton.tsx` (4 modos: direct/variant/quote/contact_only)

## Pendências de design (do usuário)

- Tipografia hierárquica (heavy/medium/semibold)
- Light mode "muito branco" precisa peso
- Micro-animações
- Empty states ilustrados
- Toasts customizados

## Related

- `app/CLAUDE.md` — onde os componentes são usados
- `context/ThemeContext.tsx` — tema dark/light
- `ROADMAP.md` § "🎨 DESIGN"
