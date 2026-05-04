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
| Sidebar.tsx | 601 | 🟧 grande, mas ok por enquanto |
| FinanceView.tsx | 595 | 🟧 grande |
| FinanceCharts.tsx | 465 | ✅ |
| PortfoliosView.tsx | 445 | ✅ |
| CatalogsView.tsx | 313 | ✅ |
| ProjectsView.tsx | 280 | ✅ |
| AppShell.tsx | 160 | ✅ shell + auth + db error toast |
| TopBar.tsx | 154 | ✅ |
| Modal.tsx | 68 | ✅ helpers de form |
| ShareButton.tsx | 46 | ✅ |
| BuyButton.tsx | 44 | ⚠️ verificar se ainda usado |

## Issues conhecidos

- ✅ ~~`SettingsView.tsx` e `DashboardView.tsx` gigantes~~ — refatorados em 2026-05-04
- ❌ Design "sem peso" — ver feedback em `ROADMAP.md` § Design
- ⚠️ `BuyButton.tsx` pode estar morto

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
