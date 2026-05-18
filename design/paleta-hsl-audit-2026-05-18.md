# Audit Paleta HSL — V4.8 Ready
> Data: 2026-05-18 · Diego G7

## TL;DR

**Paleta HSL está SÓLIDA estruturalmente, mas DESALINHADA com V4.8 em 3 frentes.** Felipe não fica bloqueado segunda — mas vai precisar improvisar hex inline ou criar tokens duplicados em CSS scoped pro dashboard, o que **fura o sistema** que eu mesmo defendi no estudo Wathan/Schoger (Refactoring UI #3).

**Recomendação**: aplicar patch antes de Felipe começar (commit 19/05 ainda, custa 30min). Risco baixo (adições, zero remoção).

---

## 1) Status atual da paleta em `app/globals.css`

### Famílias existentes
| Família | Shades | Cobertura | Status |
|---|---|---|---|
| **petrol** | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 | 10/10 | ✅ completa |
| **fog** | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 | 10/10 | ✅ completa |
| **ember** | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 | 10/10 | ✅ completa |
| **night** | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 | 11/11 | ✅ completa (1 extra: 950) |
| **sand** (linear) | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 | 10/10 | ✅ completa |
| **sand-bg** (matriz) | 100, 200, 300, 400, 500 | 5/5 | ✅ completa |
| **sand-surf** | 100→500 | 5/5 | ✅ completa |
| **sand-line** | 100→500 | 5/5 | ✅ completa |
| **sand-ink** | 100→500 | 5/5 | ✅ completa |
| **sand-warm** | 100→500 | 5/5 | ✅ completa |

**Total**: 75 tokens HSL ativos + 25 expostos em `@theme inline`. Sólido pra Refactoring UI #3.

### Sistemas paralelos (problema arquitetural latente)
Existem **3 sistemas de tokens** convivendo no mesmo arquivo:
1. **HSL paleta nova** (`--petrol-500`, `--sand-bg-100`) — linhas 34-153, sistema correto pós-estudo.
2. **shadcn tokens** (`--background`, `--foreground`, `--primary`) — linhas 313-358, semântico.
3. **`--t-*` legado dashboard** (`--t-bg`, `--t-card-from`, `--t-accent`) — linhas 360-474, paleta B azul antiga.

O sistema #3 (`--t-*`) **AINDA referencia roxo banido**:
- `globals.css:412` — `--t-body-bg` light usa `rgba(124,58,237,...)` (lilás)
- `globals.css:822` — `.card-glow` border `rgba(124,58,237,0.25)` (lilás)
- `globals.css:832` — `input:focus` ring `rgba(124,58,237,0.7)` (lilás) — afeta TODOS os inputs do app
- `globals.css:923` — `.stat-card::before` usa `--t-accent-soft` (azul)

Isso é débito técnico — não bloqueia Felipe, mas o V4.8 React vai precisar override em camadas se não consolidarmos.

---

## 2) Cores no V4.8 HTML

### Tokens novos que V4.8 USA mas globals.css NÃO tem

Light mode marrom (PRINT REFERÊNCIA CEO V4.7-V4.8) — TODO o sistema novo. V4.8 light é a **paleta marrom elegante** (CEO aprovou MVP) e ela está documentada SÓ no HTML, não no globals.css. São 5 faixas (#ECE7DF, #E2DBD0, #D5CABA, #BFB29D, #9B8770, etc).

Shades intermediárias usadas no V4.8 mas faltando em globals:
- `--night-850` dark `#161B1F` (surface-1 cards base, entre 800 e 700)
- `--night-600` dark `#2C343A` (surface elevada extra)
- `--surface-3` dark `#2A3239` (dropdowns/popovers)

Tokens semânticos NOVOS que V4.8 introduz:
- `--signal-green`, `--signal-amber`, `--signal-red` (data viz)
- `--shadow-card`, `--shadow-petrol`
- `--logo-blend` (screen|multiply)
- `--easing`, `--t-fast`, `--t-med`, `--t-slow`
- `--grain-color`, `--grain-opacity`, `--grain-blend`
- `--border-soft`, `--border-md`, `--border-strong`

---

## 3) Gaps detectados (priorizado)

| # | Família | Gap | Razão | Crítico? |
|---|---|---|---|---|
| 1 | sand-mocha (NOVO row) | 100→500 | Light mode marrom CEO V4.8 não tem família dedicada | 🔴 |
| 2 | night | 850 | V4.8 usa como surface-1 card base | 🔴 |
| 3 | red/danger | 50→700 | V4.8 introduz `signal-red` mas paleta atual não tem família vermelha | 🔴 |
| 4 | semantic tokens novos | shadows, borders, blend, easing, grain | V4.8 inteiro depende destes | 🔴 |
| 5 | ember | 300, 400, 600 — drift | V4.8 ajustou pra paleta marrom (cocoa/whisky) | 🟧 |
| 6 | fog | 100, 300, 400 — drift WCAG | V4.8 ajustou contraste fog-400 dark | 🟧 (correção a11y) |
| 7 | petrol-200 | drift `#A6D4CC` vs `#B7DAD2` | Diferença visível | 🟡 |

---

## 4) Patch globals.css proposto (CEO precisa aprovar)

```css
:root {
  /* Shade extra night-850 */
  --night-850: 200 11% 10%;

  /* Família NOVA: red/danger Hayzer */
  --red-50:  10 80% 96%;
  --red-100: 11 70% 88%;
  --red-200: 12 65% 76%;
  --red-300: 13 60% 63%;
  --red-400: 12 55% 52%;
  --red-500: 11 60% 42%;
  --red-600: 10 65% 33%;
  --red-700: 9 70% 24%;

  /* Família NOVA: sand-mocha (V4.8 light marrom CEO) */
  --sand-mocha-50:  35 28% 89%;
  --sand-mocha-100: 35 25% 85%;
  --sand-mocha-200: 33 23% 78%;
  --sand-mocha-300: 35 22% 68%;
  --sand-mocha-400: 30 17% 53%;
  --sand-mocha-500: 21 41% 31%;
  --sand-mocha-600: 13 22% 28%;
  --sand-mocha-700: 18 32% 7%;
  --sand-mocha-800: 20 35% 4%;

  /* Ajuste de contraste WCAG AA (fog-400 dark) */
  --text-footnote-dark:  36 5% 56%;
  --text-footnote-light: 13 22% 28%;

  /* Tokens semânticos V4.8 */
  --shadow-card-dark: 0 1px 0 rgba(242, 239, 234, 0.04) inset, 0 4px 14px rgba(7, 9, 10, 0.45);
  --shadow-card-light: 0 2px 6px rgba(15, 10, 9, 0.10), 0 14px 32px rgba(87, 64, 57, 0.18);
  --shadow-petrol-dark: 0 8px 24px -8px rgba(31, 118, 105, 0.45);
  --shadow-petrol-light: 0 10px 32px -10px rgba(21, 90, 80, 0.35);

  --easing-default: cubic-bezier(0.22, 0.61, 0.36, 1);
  --t-fast: 180ms var(--easing-default);
  --t-med:  320ms var(--easing-default);
  --t-slow: 540ms var(--easing-default);
}

@theme inline {
  --color-night-850: hsl(200 11% 10%);
  --color-red-50:  hsl(10 80% 96%);
  /* ... etc (8 reds + 9 sand-mocha) */
}
```

---

## 5) Risco de aplicar agora

| Risco | Prob | Impacto | Mitigação |
|---|---|---|---|
| Quebrar landing/auth/checkout | Muito baixa | Médio | Patch só ADIÇÃO, zero remoção |
| Felipe ignorar tokens novos | Média | Baixo | Compromisso de consultar audit |
| sand-mocha colidir com sand | Baixa | Médio | Naming distinto |
| Bug Tailwind 4 voltar | Muito baixa | Alto | Padrão HSL nomeado já validado |

**Veredito**: risco baixíssimo de aplicar, risco médio de NÃO aplicar.

---

## 6) Próxima ação

**Caminho A (recomendado)**: aplicar patch hoje 18/05 noite ou 19/05 manhã. Custo: 30min Diego + 5min CEO review. Felipe começa segunda com paleta sólida.

**Caminho B**: NÃO aplicar agora. Felipe usa hex inline ou tokens scoped. Cria débito técnico V5 mas não bloqueia MVP.

**Opinião Diego**: A. Custo de B = todo CSS dashboard React saindo com hex hardcoded, e em 3 semanas precisaremos refatorar.

---

## 7) Decisões pendentes CEO

1. Aplicar patch agora (A) ou começar V4 React e refatorar depois (B)?
2. Família `--red-*` ou renomear `--signal-*` (signal-red/green/amber)?
3. Promover `--surface-0/1/2/3` pra tokens públicos ou scoped só em `.dashboard`?

---

## Files relevantes

- `app/globals.css` (1080 linhas)
- `mockups/dashboard/v4-hibrido.html` (V4.8 MVP)
- `design/palette-sand-matrix.md`
- `design/dashboard-v4-spec.md`
