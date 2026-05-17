# Dashboard V4 — Híbrido V1+V3 — Spec Consolidado

> **Status**: Em construção (17/05/2026)
> **Decisão**: CEO escolheu caminho A (híbrido V1+V3) em 17/05
> **Regra fixa**: Logo H+raízes (`public/logo-hayzer.png`) preservada — ADR-013
> **Output**: `mockups/dashboard/v4-hibrido.html`
> **Deploy**: `hayzer.com.br/mockups` (auth admin)
> **Próximo**: Felipe converte React em 2-3 dias após validação CEO

---

## Os 3 problemas que o V4 RESOLVE

1. **"Muito escuro"** — usar dark soft (1 step mais claro) + toggle light mode
2. **"Letras pequenas"** — body 16-17px base, labels micro 13px min, KPI hero 96px+
3. **"Faltam animações vivas (raízes)"** — SVG path stroke-dashoffset com hover em cada bento-card

---

## Origem dos elementos (V1 + V3 → V4)

### Vindos do V1 Dataviz-Rich (gráficos)
- **KPI hero petrol sólido** com Fraunces 96px + sparkline inline + foot meta
- **Donut chart** margem por produto com legend organizada (V1 linhas 631-708)
- **Bar vertical 6 meses** lucro com mês atual em ember + animação barGrow (V1 linhas 712-789)
- **Sparkline fila Bambu 7 dias** com hoje em ember (V1 linhas 794-846)
- **Gauge semicircular 89% meta** com value central + thresholds (V1 linhas 851-899)
- **Status pill com live-dot** animado pulse (V1 linhas 336-361)
- **KPI cards secundários** com delta up/down em pílula (V1 linhas 574-625)
- **Top produtos por lucro** (mini-list V3 — mas conceito do V1)

### Vindos do V3 Editorial-Bento (design)
- **Body base 16px** (✅ já corrige problema CEO)
- **Sidebar 248px fixed esquerda** com nav-items border-left petrol on active
- **Raízes SVG estruturais animadas no fundo** (root-canvas com root-trunk/branch/sub + stroke-dashoffset no load — V3 linhas 105-163)
- **Watermark Fraunces gigante 240px italic opacity 0.022** (V3 linhas 285-299)
- **Cover editorial** com cover-figure Fraunces 96px + anchor italic + meta mono (V3 linhas 365-449)
- **Live-rows hover state** com border petrol + bg surface-2 (V3 linhas 451-504)
- **Hairline gradient** petrol→transparent
- **Bento-card hover** com connector pulse + after height growth + translateY(-2px) (V3 linhas 662-733)
- **Pill warning/petrol** (ember/petrol variantes)
- **"Receita do mês"** + "despesa filamento+energia" — copy maker BR real (CEO aprovou)

### Vindos do V2 Hero-Card (salvado)
- **Gráfico Bambu fila** (já tem no V1 também, mas V2 detalhou bem)
- **Alerta filamento crítico** (pill warning ember + sub texto)
- **Ritmo crítico** (indicador visual quando margem cai)

### NOVO no V4 (não estava em nenhum)
- **Raízes ANIMADAS REAIS no hover** de cada bento-card (SVG path stroke-dashoffset puro CSS) — destaque CEO
- **Toggle light mode** top-right (localStorage persist)
- **Count-up animation** em KPI hero ao carregar (0 → valor em 1.2s)
- **Streak indicator sutil** canto inferior ("12 dias seguidos no controle")
- **Glow petrol** em gauge ao passar 100% da meta
- **Information scent colors** (verde meta batida / âmbar atenção / vermelho perdendo)

---

## Estrutura final (layout)

```
┌─────────────────────────────────────────────────────────┐
│ SIDEBAR  │           MAIN                                │
│ 248px    │           (max-width 1280px ou flex 1fr)      │
│ fixed    │           padding 36px 40px                   │
│          │                                               │
│ LOGO PNG │  ┌── TOPBAR ──────────────────────────────┐  │
│ + word   │  │ project-switcher | live-dot | light-tg │  │
│          │  └────────────────────────────────────────┘  │
│ NAV      │                                               │
│ Dashboard│  ┌── COVER EDITORIAL ────────────────────┐  │
│ Pedidos  │  │ eyebrow | hairline                    │  │
│ Catálogo │  │ R$ 12.480,00  (Fraunces 96px)         │  │
│ Estoque  │  │ "tá no ritmo" (anchor italic 22px)    │  │
│ Clientes │  │ Maio · sem 03 · atualizado há 4min    │  │
│ Finanças │  └────────────────────────────────────────┘  │
│ Config   │                                               │
│          │  ┌── KPI MARQUEE (4 cards) ───────────────┐  │
│ ─────    │  │ Receita | Custos | Margem | Pedidos    │  │
│ USER     │  └────────────────────────────────────────┘  │
│          │                                               │
│          │  ┌── BENTO GRID (4 colunas × N rows) ─────┐  │
│          │  │ ┌─DONUT-margem──┐ ┌─BARS-6meses────┐  │  │
│          │  │ │ (span 2)       │ │ (span 2)       │  │  │
│          │  │ └────────────────┘ └────────────────┘  │  │
│          │  │ ┌─FILA-Bambu─┐ ┌─GAUGE-89%──┐         │  │
│          │  │ │ (1)        │ │ (1)         │         │  │
│          │  │ └────────────┘ └─────────────┘         │  │
│          │  │ ┌─TOP-prods─┐ ┌─EM-prod-NOW─┐         │  │
│          │  │ │ (1)        │ │ (1)         │         │  │
│          │  │ └────────────┘ └─────────────┘         │  │
│          │  │ ┌─FILAMENTO-crítico (alert)──────────┐ │  │
│          │  │ │ (span 2 ou 4)                       │ │  │
│          │  │ └─────────────────────────────────────┘ │  │
│          │  └────────────────────────────────────────┘  │
│          │                                               │
│          │  watermark "Hayzer" Fraunces 240px @ 0.022   │
│          │  streak "12 dias seguidos" canto inferior    │
└─────────────────────────────────────────────────────────┘
        + raízes SVG fundo (root-canvas fixed, anima no load)
        + ambient glow radial petrol/ember
        + grain SVG fixed
```

---

## Tokens novos (V4 dark soft + light mode)

### Dark mode (default)
```css
:root[data-theme="dark"], :root {
  /* night ladder — SOFT (1 step mais claro que V1/V3) */
  --night-950: #0A0D0F;   /* era #07090A — sutil clarear */
  --night-900: #11161A;   /* era #0B0E10 */
  --night-850: #161B1F;   /* era #0F1316 */
  --night-800: #1B2125;   /* era #13171A */
  --night-700: #232A2F;   /* era #1B2024 */
  --night-600: #2C343A;   /* era #262C31 */

  /* surface ladder */
  --surface-0: #11161A;   /* main bg — antes #0F1416 */
  --surface-1: #161B1F;   /* card base */
  --surface-2: #1F262B;   /* card hover/destaque */
  --surface-3: #2A3239;   /* card extra */

  /* fog (texto) */
  --fog-50:  #F2EFEA;     /* texto principal */
  --fog-100: #E3DED5;
  --fog-200: #BDB7AB;
  --fog-300: #8A8478;
  --fog-400: #5B564D;

  /* petrol — cor de marca, mantém */
  --petrol-200: #A6D4CC;
  --petrol-300: #6FB5A8;
  --petrol-400: #3F9286;
  --petrol-500: #1F7669;
  --petrol-600: #155A50;
  --petrol-700: #0E443D;

  /* ember — destaque/atenção */
  --ember-300: #ECC196;
  --ember-400: #E0A269;
  --ember-500: #D08A4A;

  /* signal (information scent) */
  --signal-green: var(--petrol-300);   /* meta batida */
  --signal-amber: var(--ember-400);    /* atenção */
  --signal-red:   #E07A5F;             /* perdendo */

  /* borders */
  --border-soft: rgba(242, 239, 234, 0.08);
  --border-md:   rgba(242, 239, 234, 0.14);
  --border-strong: rgba(242, 239, 234, 0.22);

  --shadow-card: 0 1px 0 rgba(242, 239, 234, 0.04) inset, 0 4px 14px rgba(7, 9, 10, 0.45);
  --shadow-petrol: 0 8px 24px -8px rgba(31, 118, 105, 0.4), 0 2px 4px rgba(7, 9, 10, 0.6);

  --easing: cubic-bezier(0.22, 0.61, 0.36, 1);
}
```

### Light mode (toggle)
```css
:root[data-theme="light"] {
  --night-950: #FFFFFF;
  --night-900: #FAF7F1;
  --night-850: #F5F1E9;
  --night-800: #EDE8DE;
  --night-700: #DCD5C6;
  --night-600: #BDB7AB;

  --surface-0: #FAF7F1;
  --surface-1: #FFFFFF;
  --surface-2: #F5F1E9;
  --surface-3: #EDE8DE;

  --fog-50:  #0A0D0F;    /* INVERTIDO */
  --fog-100: #1B2125;
  --fog-200: #3A352D;
  --fog-300: #5B564D;
  --fog-400: #8A8478;

  /* petrol mantém */
  --petrol-200: #155A50;
  --petrol-300: #1F7669;
  --petrol-400: #3F9286;
  --petrol-500: #6FB5A8;
  --petrol-600: #A6D4CC;

  --border-soft: rgba(10, 13, 15, 0.06);
  --border-md:   rgba(10, 13, 15, 0.12);

  --shadow-card: 0 1px 3px rgba(10, 13, 15, 0.04), 0 8px 24px rgba(10, 13, 15, 0.06);
  --shadow-petrol: 0 8px 28px -10px rgba(31, 118, 105, 0.25);
}
```

---

## Tipografia (RESOLVE "letras pequenas")

| Elemento | Tamanho | Família | Peso |
|---|---|---|---|
| Body base | **17px** (era 14/16) | Geist | 400 |
| KPI hero (Fraunces) | **96px** | Fraunces opsz 144 | 500 |
| KPI cards secundários | **42px** | Fraunces opsz 72 | 500 |
| Section title | **36px** | Fraunces opsz 96 | 400 |
| Greeting title | **24px** (era 22) | Geist | 500 |
| Card title | **17px** | Geist | 500 |
| Body texto | **15px** | Geist | 400 |
| Card eyebrow / labels | **13px** (NUNCA 11-12) | Geist Mono | 500 (uppercase, letter-spacing 0.14em) |
| Anchor italic punch | **22px** | Fraunces italic opsz 60 | 400 |
| Mini list nome | **15px** | Geist | 500 |
| Mini list meta (números) | **14px** | Geist Mono | 500 |
| Footnote rodapé | **13px** italic | Geist | 400 |

**Regra**: nada abaixo de 13px. Inputs ≥16px (iOS Safari). Numbers sempre `tabular-nums` (`font-variant-numeric: tabular-nums`).

---

## Raízes ANIMADAS no hover (a estrela)

Em cada `.bento-card`, SVG decorativo canto superior esquerdo (40x40px). Raíz "cresce" no hover via `stroke-dashoffset` puro CSS (zero JS).

```html
<div class="bento-card">
  <svg class="root-hover" viewBox="0 0 64 64" aria-hidden="true">
    <path class="rh-trunk" d="M32,4 Q32,18 28,28 Q24,38 22,52" />
    <path class="rh-branch-l" d="M28,22 Q22,24 18,32" />
    <path class="rh-branch-r" d="M30,32 Q38,36 42,46" />
    <path class="rh-sub-l" d="M18,32 Q14,38 12,46" />
    <circle class="rh-node" cx="22" cy="52" r="2" />
    <circle class="rh-node" cx="18" cy="32" r="1.5" />
    <circle class="rh-node" cx="12" cy="46" r="1.2" />
    <circle class="rh-node" cx="42" cy="46" r="1.5" />
  </svg>
  <!-- conteúdo do card -->
</div>
```

```css
.root-hover {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 40px;
  height: 40px;
  pointer-events: none;
  z-index: 2;
  overflow: visible;
}

.root-hover path {
  fill: none;
  stroke: var(--petrol-300);
  stroke-width: 1.2;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0;
  filter: drop-shadow(0 0 4px var(--petrol-500));
  transition: stroke-dashoffset 900ms var(--easing), opacity 250ms ease-out;
}

.root-hover .rh-trunk    { stroke-dasharray: 80; stroke-dashoffset: 80; }
.root-hover .rh-branch-l { stroke-dasharray: 22; stroke-dashoffset: 22; transition-delay: 200ms; }
.root-hover .rh-branch-r { stroke-dasharray: 26; stroke-dashoffset: 26; transition-delay: 300ms; }
.root-hover .rh-sub-l    { stroke-dasharray: 18; stroke-dashoffset: 18; transition-delay: 500ms; }

.root-hover circle {
  fill: var(--petrol-300);
  opacity: 0;
  transition: opacity 400ms ease-out 800ms;
  filter: drop-shadow(0 0 6px var(--petrol-400));
}

.bento-card:hover .root-hover path,
.bento-card:focus-within .root-hover path {
  stroke-dashoffset: 0;
  opacity: 0.95;
}

.bento-card:hover .root-hover circle,
.bento-card:focus-within .root-hover circle {
  opacity: 0.85;
}

/* respeitar accessibility */
@media (prefers-reduced-motion: reduce) {
  .root-hover path { transition: opacity 200ms; }
  .root-hover .rh-trunk,
  .root-hover .rh-branch-l,
  .root-hover .rh-branch-r,
  .root-hover .rh-sub-l { stroke-dashoffset: 0; }
}
```

**Efeito**: ao passar mouse no card, a raíz "desenha" do tronco aos galhos com leve glow petrol, 4 nós luminosos aparecem por último. Tempo total ~1.2s. Quando o usuário sai, raíz some suave. **Cada card vira "vivo".** Performance: 4-6 paths SVG por card × ~12 cards = ~60 paths. Zero JS. Funciona mobile, respeita prefers-reduced-motion.

---

## 7 mecanismos dopamina-operacional aplicados

| # | Mecanismo | Onde aplica no V4 | Implementação técnica |
|---|---|---|---|
| 1 | **Variable reward** | KPI hero count-up 0→R$12.480 ao carregar (1.2s easeOutQuart) | JS leve com `requestAnimationFrame` |
| 2 | **Streak sutil** | "12 dias calculando preço" canto inferior fixo | `<div class="streak-pill">` posição fixed |
| 3 | **Progress visual** | Gauge meta com glow petrol forte ao passar 100% | CSS class `.gauge.completed` com `filter: drop-shadow(0 0 24px petrol)` |
| 4 | **Endowment** | (Anotado pra Felipe — drag widgets React, fora do mockup HTML) | placeholder no spec |
| 5 | **Surprise+delight** | Raízes vivas crescendo hover em cada bento | SVG path stroke-dashoffset (acima) |
| 6 | **Information scent** | Cores status verde/âmbar/vermelho em cada KPI | CSS classes `.signal-up`, `.signal-warn`, `.signal-down` |
| 7 | **Live pulse** | Status-dot animado (já temos V1) + delta animations em pílulas | Pulse keyframe + smooth value transitions |

---

## Microcopy (Carla aprovado anteriormente — manter)

- Hero: **"tá no ritmo"** (Fraunces italic, anchor)
- KPI hero label: **"Receita do mês"** (não "Total Revenue")
- KPI hero foot: **"Maio · sem 03 · atualizado há 4 min"**
- KPI 2: "Custos (filamento + energia)" — não "Total Costs"
- KPI 3: "Margem média"
- KPI 4: "Pedidos no mês"
- Em produção AGORA: "Bambu X1 #2 — Marina S. · 3h12min restantes"
- Top produtos: nomes reais BR (Vaso Cacto Geo, Suporte AirPods, etc)
- Alerta filamento: "PLA Preto Voolt acaba em 2 dias no ritmo atual"
- Streak: **"12 dias seguidos no controle"** (não "streak: 12")
- Watermark: **"Hayzer"** ou **"hayzer."** (decidir com Carla — manter sutil)

---

## Animações (lista completa)

| # | Elemento | Animação | Duração | Trigger |
|---|---|---|---|---|
| 1 | Raízes fundo (root-canvas) | stroke-dashoffset cresce | 1.8s | Load |
| 2 | Raízes hover bento | stroke-dashoffset cresce + glow | 0.9-1.2s | Hover |
| 3 | KPI hero value | Count-up 0→valor | 1.2s easeOutQuart | Load |
| 4 | Bars 6 meses | scaleY 0→1 stagger 80ms | 0.8s | Load |
| 5 | Donut arcs | strokeDashoffset stagger 100ms | 1.2s | Load |
| 6 | Gauge | stroke arc rotation 0→89% | 1.5s | Load |
| 7 | Status dot | Pulse infinito | 1.8s loop | Always |
| 8 | Bento card hover | translateY(-2px) + after::height 0→10px + connector pulse | 0.22s | Hover |
| 9 | Bento card click | Scale 0.98→1 | 0.15s | Click |
| 10 | Light/dark toggle | All `var(--*)` transition | 0.4s | Click toggle |

**Todas respeitam** `@media (prefers-reduced-motion: reduce)` desabilitando as não-essenciais.

---

## Toggle Light Mode

Top-right do topbar, ícone sol/lua, persiste em localStorage.

```html
<button class="theme-toggle" aria-label="Alternar tema">
  <svg class="icon-sun"><!-- sol --></svg>
  <svg class="icon-moon"><!-- lua --></svg>
</button>
```

```js
const toggle = document.querySelector('.theme-toggle');
const stored = localStorage.getItem('hayzer-theme') || 'dark';
document.documentElement.dataset.theme = stored;

toggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('hayzer-theme', next);
});
```

---

## Logo (REGRA FIXA — ADR-013)

**Sempre** usar `<img src="/logo-hayzer.png" alt="Hayzer" />` no sidebar. Variants permitidas em tamanho:
- Sidebar collapsed: 32×24px (apenas H + raízes visíveis)
- Sidebar expanded: 48×36px

```html
<a href="/dashboard" class="brand">
  <img src="/logo-hayzer.png" alt="Hayzer" class="brand-logo" />
  <div class="brand-meta">
    <span class="brand-word">Hayzer</span>
    <span class="brand-tag">CONTROLE MAKER</span>
  </div>
</a>
```

```css
.brand-logo {
  height: 36px;
  width: auto;
  mix-blend-mode: screen;  /* elimina fundo preto */
  filter: drop-shadow(0 0 8px rgba(31, 118, 105, 0.25));
}
.brand-word {
  font-family: 'Geist', sans-serif;  /* NÃO Fraunces inventado */
  font-weight: 500;
  font-size: 18px;
  color: var(--fog-50);
  letter-spacing: -0.01em;
}
.brand-tag {
  font-family: 'Geist Mono', monospace;
  font-size: 10px;
  color: var(--petrol-300);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-top: 2px;
  display: block;
}
```

**Em light mode**: `mix-blend-mode: multiply` (em vez de screen) pra contraste correto.

---

## Pendências (esperando research voltar)

- [ ] external-researcher confirmar refs 2026 (Linear/Stripe/Notion HEX cores)
- [ ] external-researcher confirmar psicologia cores petrol em B2B
- [ ] external-researcher trazer 2-3 exemplos de animação orgânica raíz/galho em SaaS
- [ ] Diego refinar spec após research voltar (opcional — se algo conflitar)
- [ ] general-purpose gerar `mockups/dashboard/v4-hibrido.html` a partir deste spec

---

## Timeline

| Etapa | Tempo estimado | Quando |
|---|---|---|
| Spec inicial escrito | ✅ feito | 17/05 noite |
| Research volta + spec atualizado | ~30 min | 17/05 noite |
| general-purpose gera HTML V4 | 2-3 horas | 17/05 ou 18/05 |
| CEO valida em `/mockups/v4-hibrido` | 30 min CEO | 18/05 |
| Felipe converte React | 2-3 dias | 19-21/05 |
| Deploy dashboard novo em prod | — | 22/05 |

---

## Anti-patterns (NÃO repetir erros)

1. ❌ NÃO criar "H Fraunces" tipográfico inventado (viola ADR-013). USAR PNG.
2. ❌ NÃO usar body 14px (CEO disse "pequeno"). USAR 16-17px.
3. ❌ NÃO usar `#0F1316` puro como bg (CEO disse "escuro"). USAR `#161B1F` ou mais claro.
4. ❌ NÃO esquecer light mode toggle (CEO sentiu fadiga visual).
5. ❌ NÃO usar numeração editorial tipo "01 — Produção" (CEO já reclamou: cheira IA).
6. ❌ NÃO criar dataviz placeholder com `???` ou Lorem Ipsum. USAR dados maker BR reais (Marina S., R$ 12.480, Bambu X1, PLA Voolt).
7. ❌ NÃO ignorar `prefers-reduced-motion`.
8. ❌ NÃO usar gradientes roxos legacy (CEO removeu da paleta na sessão 16/05).

---

## Validação final antes de entregar pro CEO

- [ ] Logo H+raízes preservada (ADR-013 respeitado)
- [ ] Body ≥16px, labels ≥13px
- [ ] Dark soft + toggle light funcionando
- [ ] Raízes animadas no hover em TODOS os bento-cards
- [ ] 7 mecanismos dopamina aplicados
- [ ] Dataviz V1: donut margem + bars 6 meses + fila Bambu + gauge meta — TODOS presentes
- [ ] Design V3: cover editorial + watermark + raízes fundo — TODOS presentes
- [ ] Copy maker BR real (não Lorem nem placeholder)
- [ ] prefers-reduced-motion respeitado
- [ ] 0 erros console
- [ ] Mobile responsive (sidebar vira drawer ≤768px)
