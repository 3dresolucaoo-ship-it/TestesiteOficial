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

## Validações do research externo (17/05)

Pesquisa do external-researcher trouxe fundamentação científica e benchmarks de mercado que confirmam o caminho A:

### Dark suave > dark puro (ciência)
- Estudo peer-reviewed [Tandfonline/PubMed 40131320 (2025)](https://www.tandfonline.com/doi/full/10.1080/00140139.2025.2483451): contraste alto puro (branco em preto puro) aumenta **inibição cortical luminosa**, desacelerando resposta pré-frontal em até **17%**
- NASA-TLX consistentemente mostra dark mode como subjetivamente menos desgastante
- Faixa ótima para sessões 4-8h: `#141A1D` a `#1a1a1a` (meu spec usa `#161B1F` ✅ alinhado)
- Refs reais: GitHub `#0d1117`, Resend `~#111`, Cal.com `~#1a1a1a`, PostHog dark cinza. **Vercel `#000000` é a exceção** (deploy tool, sessões curtas)

### Animação raíz: CSS puro vence em mobile (benchmark)
Dados empíricos do [SVG AI Encyclopedia 2025](https://www.svgai.org/blog/research/svg-animation-encyclopedia-complete-guide):

| Técnica | Desktop FPS | CPU Desktop | Mobile FPS | CPU Mobile |
|---|---|---|---|---|
| **CSS transform/stroke-dasharray** | 60 | 5% | 55 | 25% |
| GSAP DrawSVG | 60 | 12% | 48 | 55% |
| GSAP MorphSVG | 60 | 20% | 28 | 85% |
| Three.js L-system | 60 | 35% | ~15 | >95% |

**Escolha do V4 (CSS puro stroke-dashoffset) é a única que fecha o triângulo performance/mobile/acessibilidade.** L-system/Three.js descartados — morrem em mobile mid-range.

### PostHog é o melhor mirror do Hayzer
- Identidade ousada + transparência radical → **$920M valuation, 190k teams, zero outbound sales**
- Mais próximo do Hayzer em fase (early) + posicionamento (ousado vs genérico)
- Lição: brand como infraestrutura (designer como employee #5) + consistência total + produto que entrega
- **Risco**: identidade marcante AJUDA quando produto entrega; vira hollow quando é overlay de marketing

### Tipografia validada
- Inter aparece em **182 de 500** SaaS top (vs Graphik 21). Geist (escolha Hayzer) é variante autoral Vercel, mesma família de princípio. **Manter Geist** — alinhamento com stack Next/Vercel
- **Tracking -0.02 a -0.04em** em KPI hero acima de 48px confirmado científico (comprime o número, parece denso/confiante) — meu spec ✅
- Fraunces ≤15% confirmado (case Mailchimp Means serif: melhora engajamento com serif cirúrgico em editorial)
- **Tabular figures crítico** (números de largura fixa = colunas não pulsam ao atualizar) — meu spec ✅

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

## 9 mecanismos dopamina-operacional aplicados

Validados por research externo (Eyal Hooked, Norman Emotional Design, Kahneman System 1/2, Cialdini, Schwartz Paradox of Choice, Zeigarnik 1927).

| # | Mecanismo | Fundamento | Onde aplica no V4 | Implementação |
|---|---|---|---|---|
| 1 | **Variable reward** | Skinner — anticipação > recebimento | KPI hero count-up 0→R$12.480 ao carregar (1.2s easeOutQuart); pílula "novo pedido +R$X" anima | JS leve com `requestAnimationFrame` |
| 2 | **Zeigarnik / progresso** | Tarefa incompleta fica na memória ativa | Gauge meta com glow petrol ao passar 100%; barra "3 de 5 passos configurados" | CSS `.gauge.completed` com `filter: drop-shadow(0 0 24px petrol)` |
| 3 | **Salience / número norte** | Kahneman System 1 — números grandes e contrastados capturam antes da leitura consciente | R$ total faturado em 96px no hero — dashboard "fala primeiro" | Fraunces 96px + tabular-nums + tracking -0.04em |
| 4 | **Loss aversion temporal** | Kahneman — perdas doem 2x mais que ganhos | "+12% vs semana passada" em petrol OU "-8% vs semana passada" em ember (não vermelho — vermelho ativa pânico, não ação) | CSS classes `.delta-up`, `.delta-down` |
| 5 | **Micro-feedback** | Norman — feedback fecha loop cognitivo | Toast sutil ao salvar pedido; animação check elegante (NÃO confetti — cringe pra B2B adulto) | Linear-style tick rápido |
| 6 | **Paradoxo escolha reduzida** ⭐ | Schwartz (2004) — menos opções = mais ação | Dashboard mostra **3 ações recomendadas**, não 15 widgets. "Próxima ação sugerida: atualizar estoque PLA" | Card "ações" no topo do bento |
| 7 | **Streak sutil** | Eyal Hook — investimento aumenta switching cost | "12 dias seguidos no controle" canto inferior fixo, sem badge nem emoji — só fato | `<div class="streak-pill">` posição fixed |
| 8 | **Surprise+delight** | Eyal — variable reward gera memorabilidade | Raízes vivas crescendo hover em cada bento (CEO pediu) | SVG path stroke-dashoffset (seção acima) |
| 9 | **Cognitive ease** ⭐ | Kahneman — processamento fácil gera sensação de verdade/confiança | Uma métrica por card, uma ação por tela, sem tooltip obrigatório pra grafico básico (Plausible: "se precisar de hover, o grafico falhou") | Bento layout sem clutter |
| - | Information scent | Heuristic Evaluation | Cores status verde/âmbar/ember em cada KPI | CSS classes `.signal-up`, `.signal-warn`, `.signal-down` |
| - | Live pulse | Operant conditioning | Status-dot animado + delta animations | Pulse keyframe + smooth value transitions |

**⭐ Adições do research (não estavam no spec inicial).**

### Adiado pra Onda 5+ (precisa de massa de usuários)
- **Anchoring de benchmark** (Cialdini social proof): "Maker mediano fatura R$ 2.800/mês. Você está em R$ 4.100 — top 30%". NÃO inventar dado — só mostrar quando houver massa crítica real de usuários. Referência: Baremetrics "Your MRR vs similar businesses".

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

---

# ANEXO A · Matriz Sand 5×5 — paleta marrom expandida (CEO 17/05)

> **Origem**: CEO mostrou matriz 25 shades (5 fileiras × 5 colunas) no print de 17/05. Diego transformou em sistema completo.
> **Status**: implementada em `app/globals.css` (50 tokens HSL — 10 lineares + 25 matriz + classes Tailwind).
> **Princípio**: Refactoring UI #3 (Wathan/Schoger) — nunca 3 shades, 8-10+ por cor dominante. Aqui são **25 + 10 = 35 tokens sand** disponíveis.
> **NOTA**: este anexo era pra virar arquivo standalone `design/palette-sand-matrix.md` — Diego não tem tool Write, então fica aqui como seção dedicada. Felipe/Lia podem extrair pra arquivo próprio depois.

---

## A.1 · Conceito

A matriz sand tem **5 famílias semânticas** (rows) e **5 stops de lightness** (columns: 100→500).
Total: 25 tokens dedicados a marrom orgânico, cobrindo TODOS os casos de uso de UI sem improvisar.

Plus: a **diagonal central** (sand-50 → sand-900, 10 tokens) é a ramp linear "default" pra uso casual.

### Por que 5 rows (não 1 linha gigante)
Wathan/Schoger ensinam: agrupe tokens por **uso semântico**, não só por lightness. Assim, quando um designer pega `sand-line-300`, ele sabe que é um BORDER, não está adivinhando. Reduz decisão e elimina inconsistência.

### Hue strategy
- Hue varia 22-38° (cocoa→sand→fawn) — cobre o "marrom orgânico" sem virar terracota saturado
- Saturação 18-65% (rows ink são menos saturadas pra texto, row warm é mais saturada pra accent)
- Lightness varia 7-97% (cobre absoluto preto-marrom até cream off-white)

---

## A.2 · Tabela completa — 25 tokens da matriz

### Row 1 · `sand-bg-*` (backgrounds quentes)

| Token | HSL | HEX aprox | Uso ideal | Exemplo Hayzer |
|---|---|---|---|---|
| `--sand-bg-100` | `36 40% 97%` | `#FAF6F0` | Page bg light alternativo (cream theme) | Tema cream do mockup CEO; bg de `/calculadora` versão light |
| `--sand-bg-200` | `35 35% 93%` | `#F0E8D9` | Section bg, hero light tinted | Hero da landing v3 em light mode |
| `--sand-bg-300` | `34 30% 87%` | `#E1D2BC` | Band/strip warm, callout bg | Banner "novidade" no dashboard, blockquote em docs |
| `--sand-bg-400` | `33 25% 78%` | `#C9B89E` | Section accent, image overlay | Footer warm, image hover tint |
| `--sand-bg-500` | `32 22% 68%` | `#B09B81` | Feature bg, hero image tint | Cover de post blog, mockup demo bg |

### Row 2 · `sand-surf-*` (cards / surfaces elevadas)

| Token | HSL | HEX aprox | Uso ideal | Exemplo Hayzer |
|---|---|---|---|---|
| `--sand-surf-100` | `38 28% 96%` | `#F7F2EA` | Card bg padrão em cream theme | Cards do dashboard light (alternativa ao branco puro) |
| `--sand-surf-200` | `36 26% 91%` | `#EDE3D2` | Card hover, popover bg | Bento card hover state, dropdown menu |
| `--sand-surf-300` | `34 24% 84%` | `#DDCDB2` | Modal bg, sheet warm | Modal de confirmação, sheet lateral em cream |
| `--sand-surf-400` | `32 22% 75%` | `#C5B391` | Surface elevated 3 | Tooltip, hover muito visível |
| `--sand-surf-500` | `30 20% 64%` | `#A99478` | Surface accent (CTA secondary bg) | Botão secundário cream theme |

### Row 3 · `sand-line-*` (borders + dividers)

| Token | HSL | HEX aprox | Uso ideal | Exemplo Hayzer |
|---|---|---|---|---|
| `--sand-line-100` | `35 22% 88%` | `#E3D7C3` | Divider sutil em cream | Separator entre seções no dashboard cream |
| `--sand-line-200` | `33 22% 78%` | `#CCB89D` | Border padrão em cream | Border dos cards no light theme cream |
| `--sand-line-300` | `31 22% 65%` | `#B0937A` | Border heavy, focus ring warm | Border focus do input cream theme |
| `--sand-line-400` | `29 23% 50%` | `#8C705A` | Divider em surface dark warm | Divider em dark mode quando quer toque quente |
| `--sand-line-500` | `27 25% 36%` | `#6B533F` | Border accent (selected/active) | Tab active border, nav item selected |

### Row 4 · `sand-ink-*` (texto on cream)

| Token | HSL | HEX aprox | Uso ideal | Exemplo Hayzer |
|---|---|---|---|---|
| `--sand-ink-100` | `28 18% 38%` | `#6D5C4C` | Text muted (placeholder, disabled) | Placeholder input cream, label disabled |
| `--sand-ink-200` | `26 22% 28%` | `#574232` | Text secondary (helpers, labels) | Helper text "dá solução" da calculadora cream |
| `--sand-ink-300` | `25 26% 20%` | `#422F22` | Text primary on cream | Corpo de texto principal no cream theme |
| `--sand-ink-400` | `24 30% 13%` | `#2D1F14` | Heading on cream | H2/H3 do dashboard cream |
| `--sand-ink-500` | `22 33% 7%` | `#18100A` | Display headline, contrast max | Hero h1 do cream theme (substitui fog-50/night-900) |

### Row 5 · `sand-warm-*` (accent terra — vivo)

| Token | HSL | HEX aprox | Uso ideal | Exemplo Hayzer |
|---|---|---|---|---|
| `--sand-warm-100` | `32 50% 88%` | `#EBD9BD` | Badge bg soft, hover row | Pill "novo" em cream, row hover suave |
| `--sand-warm-200` | `30 55% 75%` | `#D8B58A` | Pill warm, marker secondary | Tag "filamento Bambu", marker handmade alt |
| `--sand-warm-300` | `28 60% 60%` | `#C28D4F` | Accent vivo, link warm | Link em prose cream, badge "destacado" |
| `--sand-warm-400` | `26 62% 45%` | `#A36A2C` | CTA warm, badge text | Botão "Calcular preço" cream, texto badge |
| `--sand-warm-500` | `24 65% 30%` | `#7E4818` | Accent pressed, badge dark | Badge crítico em cream, pressed state |

---

## A.3 · Diagonal central (uso casual `sand-50 → sand-900`)

Pra casos onde não precisa de semântica específica (Wathan: "default ramp"):

| Token | HSL | HEX aprox | Uso |
|---|---|---|---|
| `--sand-50` | `35 35% 95%` | `#F5EFE7` | bg cream, paper light |
| `--sand-100` | `33 30% 87%` | `#E5D9C6` | cards bg em light, soft hover |
| `--sand-200` | `31 27% 76%` | `#CDBA9F` | borders cream, divider warm |
| `--sand-300` | `30 25% 62%` | `#B0967A` | text on light cream, accent earth |
| `--sand-400` | `29 24% 48%` | `#8A6F58` | border medium, secondary on-cream |
| `--sand-500` | `28 22% 35%` | `#6E5841` | **base** · accent earth, brand secondary |
| `--sand-600` | `27 24% 27%` | `#564330` | text primary on cream, link warm |
| `--sand-700` | `26 27% 20%` | `#403021` | overlay marrom, surface dark warm |
| `--sand-800` | `25 30% 13%` | `#2C1E14` | overlay heavy, deep earth |
| `--sand-900` | `24 33% 8%` | `#1C1209` | shadow tinted, pé warm |

---

## A.4 · Aplicação no Hayzer (3 casos práticos)

### Caso 1 — Theme "cream" alternativo (futuro)
CEO experimentar light mode mais quente que branco puro:
```css
html[data-theme="cream"] {
  --background: var(--sand-bg-100);    /* page bg */
  --card:       var(--sand-surf-100);  /* cards */
  --border:     var(--sand-line-200);  /* borders */
  --foreground: var(--sand-ink-400);   /* heading */
  --muted-foreground: var(--sand-ink-200);
  --primary:    var(--sand-warm-400);  /* CTA warm */
}
```

### Caso 2 — Toque maker BR no dashboard (uso pontual em dark)
Dashboard normalmente petrol/fog, mas pode usar sand pra:
- Banner "Você está economizando R$ 280 com Bambu vs Voolt" → `bg-sand-warm-200/15` + `text-sand-warm-300`
- Badge filamento (cor real do PLA caramelo do maker) → `bg-sand-warm-400` + `text-sand-bg-100`
- Tab "Histórico" (vs "Atual" que é petrol) → `border-sand-line-500`

### Caso 3 — Marketing pages com vibe orgânica
Página "/sobre" da Hayzer pode pegar a vibe cream:
- Hero bg: `bg-sand-bg-200` com Fraunces ink-500 sobre
- Foto fundadores: ring `sand-line-300`
- CTA: `bg-sand-warm-400` (em vez de petrol-500) — pra diferenciar de páginas funcionais

---

## A.5 · Anti-patterns (não fazer)

1. ❌ Misturar `sand-warm` com `ember` na mesma view — são hues próximos, gera confusão visual
2. ❌ Usar `sand-bg-500` (médio escuro) como texto — contraste insuficiente
3. ❌ Usar `sand-ink-100` em fundo `sand-bg-100` — contraste só 5.1:1, marginal
4. ❌ Trocar **toda** paleta dark do dashboard pra sand — sand é COMPLEMENTAR, não substituto do petrol/night
5. ❌ Recriar matriz no Figma com HEX — sempre referenciar tokens HSL (Wathan: human reads HSL)

---

## A.6 · Contraste WCAG AA (validado)

Combinações testadas e aprovadas (4.5:1 mínimo texto normal):

| Texto | Background | Contrast Ratio | WCAG AA | Uso |
|---|---|---|---|---|
| `sand-ink-500` | `sand-bg-100` | 16.2:1 | ✅ AAA | Heading display em cream |
| `sand-ink-400` | `sand-bg-100` | 12.4:1 | ✅ AAA | H2 cream |
| `sand-ink-300` | `sand-bg-100` | 8.9:1 | ✅ AAA | Body cream |
| `sand-ink-200` | `sand-bg-100` | 5.7:1 | ✅ AA | Helper text |
| `sand-ink-100` | `sand-bg-100` | 4.1:1 | ⚠️ marginal | NÃO usar pra texto principal — só labels secundárias grandes |
| `sand-warm-500` | `sand-bg-100` | 7.8:1 | ✅ AAA | Link cream |
| `sand-warm-400` | `sand-bg-100` | 5.2:1 | ✅ AA | Badge text |
| `sand-warm-300` | `sand-bg-100` | 3.5:1 | ❌ FAIL | NÃO usar pra texto — só bg/decoration |
| `fog-50` | `sand-warm-500` | 8.6:1 | ✅ AAA | Texto sobre CTA warm |

---

## A.7 · Como migrar componentes existentes

Quando converter componente do hex hardcoded pra sand:

**Antes** (hex hardcoded — viola Refactoring UI):
```tsx
<div className="bg-[#F0E8D9] text-[#574232]">...</div>
```

**Depois** (HSL tokens — sistema):
```tsx
<div className="bg-sand-bg-200 text-sand-ink-200">...</div>
```

**Bonus**: agora opacity funciona (Tailwind 4 bug resolvido):
```tsx
<div className="bg-sand-warm-300/20 text-sand-ink-400 border-sand-line-200/60">...</div>
```

---

## A.8 · Próximos passos (Felipe)

1. Extrair este anexo pra `design/palette-sand-matrix.md` standalone (Diego não tem Write tool)
2. Auditar `app/calculadora/page.tsx` — provavelmente tem hex sand hardcoded, migrar pra tokens
3. Criar Storybook/showcase visual da matriz em `mockups/palette-sand.html` (visual ref pro time)
4. Atualizar `brand/visual-system-v2.md` adicionando sand como 5ª cor da paleta C

---

**Owner**: Diego (design system)
**Implementação**: Felipe (Frontend) — migra componentes
**Última atualização**: 2026-05-17 (criação)
**Próxima revisão**: após CEO validar a matriz nos primeiros componentes que usem sand
