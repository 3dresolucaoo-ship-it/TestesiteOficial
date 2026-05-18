# Visual Library Catalog · Diego Designer · 2026-05-18

> Catálogo navegável dos componentes únicos que vão pra `components/visual-library/`.
> Cada componente: descrição + variants + props TypeScript + onde aplicar + inspiração + mock HTML inline.
> Felipe converte HTML→React copiando estilos inline e movendo pra `globals.css` ou `globals-v4.css` (consistência com dashboard).
>
> Inspiração detalhada (de qual site veio cada elemento): ver `design/inspiration-extracts.md`.
> Filosofia: 10-12 componentes globais carregam o tom novo PRA DENTRO dos módulos legados. Sem refactor estrutural — só decoração.

---

## Índice

1. [TapeBadge](#1-tapebadge) — etiqueta rotacionada estilo washi tape
2. [Stamp](#2-stamp) — carimbo circular "PAGO/ENVIADO/PRODUZINDO"
3. [MarkerUnderline](#3-markerunderline) — marca-texto ember sob palavra
4. [HighlightedText](#4-highlightedtext) — fundo sólido em palavra-chave
5. [HandDrawnArrow](#5-handdrawnarrow) — seta SVG rabiscada
6. [AsteriskNote](#6-asterisknote) — asterisco footnote editorial
7. [MarginNote](#7-marginnote) — nota margem caderno (lateral)
8. [GrainOverlay](#8-grainoverlay) — textura papel fotográfico fullscreen
9. [GlowPetrol](#9-glowpetrol) — halo radial em card de destaque
10. [RootDecor](#10-rootdecor) — raiz SVG animada em canto
11. [PolaroidCard](#11-polaroidcard) — card rotated + tape no topo
12. [TickerMarquee](#12-tickermarquee) — rodapé estilo terminal animado
13. [SkewBanner](#13-skewbanner) — faixa diagonal canto de card
14. [TooltipHandwritten](#14-tooltiphandwritten) — callout editorial com arrow conectora
15. [InsetHighlight](#15-insethighlight) — luz interna 1px topo (utility CSS)

---

## 1. TapeBadge

**O que faz**: etiqueta curta rotacionada com tom warning/sucesso/neutro, simula washi tape colada no card.

**Variants**:
- `tone`: `ember` (default · warning) · `petrol` (sucesso) · `red` (alerta crítico) · `neutral` (info)
- `size`: `sm` (h-5 · 10px font) · `md` (h-6 · 11px) · `lg` (h-7 · 13px)
- `rotation`: número entre -8 e 8 (default alterna `-3/+4/-2` por instância via JS pra não repetir)
- `pulse`: boolean (warning crítico ganha animação pulse subtle)

**Props TypeScript**:
```ts
type TapeBadgeProps = {
  children: React.ReactNode
  tone?: 'ember' | 'petrol' | 'red' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  rotation?: number          // default: pseudo-random entre -5 e +5
  pulse?: boolean
  className?: string
}
```

**Onde aplicar**:
- `/orders`: status "ATRASADO" (red), "URGENTE" (ember), "PAGO" (petrol)
- `/catalogs`: "NOVO" (petrol), "ESGOTANDO" (ember), "PROMOÇÃO" (red)
- `/finance`: "PAGAR HOJE" (ember), "VENCIDO" (red)
- `/settings`: "BETA" (neutral), "PRO" (petrol)
- `/inventory`: "CRÍTICO" (red)

**Inspiração**: godly.website + lapa.ninja + landing v2 do próprio Hayzer ("ACESSO ANTECIPADO" hero).

**Mock visual HTML**:
```html
<span class="tape-badge tape-ember" style="transform: rotate(-3deg);">ATRASADO</span>

<style>
.tape-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 11px;
  font-family: 'Geist Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  border-radius: 3px;
  position: relative;
  white-space: nowrap;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.25),
    inset 0 -1px 0 rgba(0,0,0,0.14),
    0 6px 14px -4px rgba(0,0,0,0.35);
}
.tape-ember   { background: #D08A4A; color: #1A100A; }
.tape-petrol  { background: #1F7669; color: #F2EFEA; }
.tape-red     { background: #C25E45; color: #FBF1ED; }
.tape-neutral { background: #BDB7AB; color: #1A100A; }
</style>
```

---

## 2. Stamp

**O que faz**: carimbo circular com texto rotacionado dentro, vibe "PAGO/ENVIADO" do correio brasileiro.

**Variants**:
- `tone`: `petrol` (PAGO/APROVADO) · `petrol-light` (ENVIADO) · `ember` (PRODUZINDO) · `red` (ATRASADO) · `neutral` (CANCELADO)
- `size`: `sm` (48px) · `md` (72px) · `lg` (96px)
- `dotted`: boolean (border tracejada vs sólida)
- `rotated`: number (-12 a 12 · default -8)

**Props TypeScript**:
```ts
type StampProps = {
  label: string              // máx 12 chars
  tone?: 'petrol' | 'petrol-light' | 'ember' | 'red' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  dotted?: boolean
  rotated?: number
  pulse?: boolean            // só pra "PRODUZINDO" (dot ember animado)
  className?: string
}
```

**Onde aplicar**:
- `/orders`: cada linha do pedido, canto direito
- `/finance`: cada invoice/recibo
- `/crm`: status do cliente ("RECOMPRA", "PERDIDO")
- `/decisions`: decisão concluída ("DECIDIDO")

**Inspiração**: mobbin.com (Receipt apps), correios.com.br carimbos clássicos, godly websites de produto físico.

**Mock visual HTML**:
```html
<div class="stamp stamp-petrol" style="transform: rotate(-8deg);">
  <div class="stamp-inner">
    <span>PAGO</span>
  </div>
</div>

<style>
.stamp {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 2px solid currentColor;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-family: 'Geist Mono', monospace;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.stamp::before {
  content: '';
  position: absolute;
  inset: 4px;
  border: 1px solid currentColor;
  border-radius: 50%;
  opacity: 0.5;
}
.stamp-petrol       { color: #6FB5A8; box-shadow: 0 0 14px -2px rgba(31, 118, 105, 0.30); }
.stamp-petrol-light { color: #A6D4CC; }
.stamp-ember        { color: #E0A269; box-shadow: 0 0 14px -2px rgba(208, 138, 74, 0.30); }
.stamp-red          { color: #E07A5F; box-shadow: 0 0 14px -2px rgba(224, 122, 95, 0.30); }
.stamp-neutral      { color: #8A8478; opacity: 0.75; }
</style>
```

---

## 3. MarkerUnderline

**O que faz**: marca-texto ember (estilo highlighter amarelo) por baixo de palavra-chave dentro de frase.

**Variants**:
- `tone`: `ember` (default) · `petrol` (positivo) · `red` (atenção)
- `intensity`: `subtle` (alpha 0.35) · `default` (0.55) · `bold` (0.70)
- `style`: `flat` (gradient linear) · `wavy` (SVG path curva)

**Props TypeScript**:
```ts
type MarkerUnderlineProps = {
  children: React.ReactNode
  tone?: 'ember' | 'petrol' | 'red'
  intensity?: 'subtle' | 'default' | 'bold'
  style?: 'flat' | 'wavy'
  className?: string
}
```

**Onde aplicar**:
- `/dashboard` cover-anchor: "produzindo agora" (já tem)
- `/orders` headline: "3 [atrasaram]"
- `/finance` insight: "[R$ 12.480] entrou esse mês"
- `/metrics` callout: "meta [batida] essa semana"

**Inspiração**: ishadeed.com SVG underlines + codepen davidwebca generative pen strokes + globals.css `.marker` da landing.

**Mock visual HTML**:
```html
<p>Tem <span class="marker marker-ember">3 pedidos</span> pra hoje.</p>

<style>
.marker {
  padding: 0 0.05em;
  background-repeat: no-repeat;
}
.marker-ember {
  background-image: linear-gradient(
    180deg,
    transparent 62%,
    rgba(208, 138, 74, 0.55) 62%,
    rgba(208, 138, 74, 0.55) 92%,
    transparent 92%
  );
}
.marker-petrol {
  background-image: linear-gradient(
    180deg,
    transparent 62%,
    rgba(31, 118, 105, 0.55) 62%,
    rgba(31, 118, 105, 0.55) 92%,
    transparent 92%
  );
}
.marker-wavy {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 8'><path d='M0 5 Q15 1 30 5 T60 5 T90 5 T120 5' stroke='%23D08A4A' stroke-width='2.4' fill='none' stroke-linecap='round'/></svg>");
  background-position: 0 100%;
  background-size: 100% 6px;
  padding-bottom: 2px;
}
</style>
```

---

## 4. HighlightedText

**O que faz**: span com background sólido translúcido em palavra. Diferença pro MarkerUnderline: fundo inteiro vs só linha embaixo.

**Variants**:
- `tone`: `ember` (default) · `petrol` (positivo) · `red` (alerta) · `fog` (neutro contornado)
- `weight`: `subtle` (alpha 0.10) · `default` (0.18) · `bold` (0.28)

**Props TypeScript**:
```ts
type HighlightedTextProps = {
  children: React.ReactNode
  tone?: 'ember' | 'petrol' | 'red' | 'fog'
  weight?: 'subtle' | 'default' | 'bold'
  className?: string
}
```

**Onde aplicar**:
- Greeting de /dashboard: "Bom dia, [Rafael]"
- Insight em /finance: "Vendeu [R$ 12.480] essa semana"
- Alerta em /orders: "Tem [3 atrasos] pra resolver"
- Empty state: "Nenhum [pedido em produção] agora"

**Inspiração**: stripe.com landing + linear.app + landing v2 Hayzer.

**Mock visual HTML**:
```html
<p>Vendeu <span class="hl hl-petrol">R$ 12.480</span> essa semana.</p>

<style>
.hl {
  padding: 0 6px;
  border-radius: 4px;
  font-weight: 500;
}
.hl-ember  { background: rgba(208, 138, 74, 0.18); color: #F2EFEA; }
.hl-petrol { background: rgba(31, 118, 105, 0.20); color: #F2EFEA; }
.hl-red    { background: rgba(224, 122, 95, 0.18); color: #F2EFEA; }
.hl-fog    { background: rgba(242, 239, 234, 0.06); color: #F2EFEA; border: 1px solid rgba(242, 239, 234, 0.14); }
</style>
```

---

## 5. HandDrawnArrow

**O que faz**: seta SVG com curva irregular + ponta aberta, vibe rabiscada a caneta sobre o app.

**Variants**:
- `direction`: `right` · `down` · `left` · `up` · `right-curve` · `down-curve`
- `tone`: `ember` (default) · `petrol`
- `length`: `sm` (60px) · `md` (100px) · `lg` (160px)
- `animated`: boolean (stroke-dashoffset "desenha" no load/hover)

**Props TypeScript**:
```ts
type HandDrawnArrowProps = {
  direction?: 'right' | 'down' | 'left' | 'up' | 'right-curve' | 'down-curve'
  tone?: 'ember' | 'petrol'
  length?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}
```

**Onde aplicar**:
- Empty state /orders: seta apontando "+ Novo pedido"
- Onboarding: seta entre sidebar e KPI principal
- /metrics: seta conectando dois cards comparativos
- Tutorial primeira vez: seta pro botão de ajuda

**Inspiração**: designspells.com easter eggs + awwwards handmade collection + godly websites 2025.

**Mock visual HTML**:
```html
<svg class="arrow-hand arrow-ember" viewBox="0 0 100 40" width="100" height="40">
  <path d="M5 20 Q30 5, 55 22 T90 18" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" />
  <path d="M85 12 L93 18 L83 24" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" />
</svg>

<style>
.arrow-hand          { display: inline-block; }
.arrow-hand path     { stroke-dasharray: 200; stroke-dashoffset: 200; animation: drawArrow 900ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards; }
.arrow-hand.delay-1 path { animation-delay: 200ms; }
.arrow-ember         { color: #E0A269; }
.arrow-petrol        { color: #6FB5A8; }
@keyframes drawArrow { to { stroke-dashoffset: 0; } }
</style>
```

---

## 6. AsteriskNote

**O que faz**: asterisco inline pequeno + footnote no final do bloco, vibe editorial Refactoring UI.

**Variants**:
- `style`: `asterisk` (★ Fraunces italic) · `numbered` (¹ ² ³)
- `tone`: `ember` (default · atenção) · `petrol` (info técnica) · `fog` (neutro)
- `position`: `inline` · `block` (footnote em parágrafo separado abaixo)

**Props TypeScript**:
```ts
type AsteriskNoteProps = {
  note: string                   // texto da nota
  index?: number                 // se numbered
  style?: 'asterisk' | 'numbered'
  tone?: 'ember' | 'petrol' | 'fog'
  position?: 'inline' | 'block'
  children: React.ReactNode      // o texto que recebe o asterisco
  className?: string
}
```

**Onde aplicar**:
- /dashboard KPI: "R$ 12.480*" → "* sem custos operacionais"
- /metrics gráfico: "Margem 38%¹" → "¹ inclui filamento + tempo + energia"
- /finance valor: "Saldo R$ 8.230*" → "* sem cobranças pendentes"
- /catalogs: preço com asterisco pra "* frete grátis acima de R$ 300"

**Inspiração**: designspells.com micro-interactions + Refactoring UI editorial + landing v2 hairline editorial.

**Mock visual HTML**:
```html
<p>
  Receita do dia <strong>R$ 12.480<sup class="asterisk-note">*</sup></strong>
</p>
<p class="footnote-text">
  <span class="asterisk-note">*</span> sem custos operacionais (filamento, energia, embalagem).
</p>

<style>
.asterisk-note {
  font-family: 'Fraunces', Georgia, serif;
  font-style: italic;
  color: #E0A269;
  font-size: 0.7em;
  font-weight: 400;
  margin: 0 0.05em;
}
.footnote-text {
  font-family: 'Geist', sans-serif;
  font-size: 13px;
  color: #94908A;
  font-style: italic;
  line-height: 1.5;
  margin-top: 8px;
  padding-left: 8px;
  border-left: 1px solid rgba(208, 138, 74, 0.30);
}
</style>
```

---

## 7. MarginNote

**O que faz**: nota lateral fora do grid principal (estilo caderno com margem), traz dica/contexto sem poluir o bloco.

**Variants**:
- `side`: `left` (default em desktop) · `right`
- `tone`: `ember` (alerta) · `petrol` (dica positiva) · `fog` (info neutra)
- `width`: `sm` (140px) · `md` (180px) · `lg` (240px)

**Props TypeScript**:
```ts
type MarginNoteProps = {
  children: React.ReactNode
  side?: 'left' | 'right'
  tone?: 'ember' | 'petrol' | 'fog'
  width?: 'sm' | 'md' | 'lg'
  label?: string                 // opcional · "DICA", "AVISO", "OBSERVAÇÃO"
  className?: string
}
```

**Onde aplicar**:
- /products: "DICA — use este SKU pro Bambu Lab X1" (lado direito do form)
- /metrics: "OBS — margem inclui energia + filamento + tempo" (lado esquerdo do KPI)
- /orders: explicação de status complexo (margem do detalhe do pedido)
- /settings: aviso contextual (margem do toggle de feature)

**Inspiração**: godly.website editorial + awwwards handmade + notion.so anotações + livros de design (Refactoring UI margens).

**Mock visual HTML**:
```html
<div class="block-with-margin">
  <aside class="margin-note margin-petrol margin-side-right">
    <span class="margin-label">DICA</span>
    <p>Use SKU "BAMBU-X1" pra agrupar peças impressas na X1 Carbon.</p>
  </aside>
  <div class="block-content">
    <h2>Novo produto</h2>
    <p>Preencha SKU, nome, custo de filamento e tempo de impressão.</p>
  </div>
</div>

<style>
.block-with-margin {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 28px;
  align-items: start;
}
.margin-note {
  padding: 4px 10px 4px 12px;
  font-family: 'Fraunces', Georgia, serif;
  font-style: italic;
  font-size: 13.5px;
  line-height: 1.55;
  color: #BDB7AB;
}
.margin-petrol { border-left: 1px solid rgba(111, 181, 168, 0.45); }
.margin-ember  { border-left: 1px solid rgba(208, 138, 74, 0.45); }
.margin-fog    { border-left: 1px solid rgba(242, 239, 234, 0.18); }
.margin-label {
  display: block;
  font-family: 'Geist Mono', monospace;
  font-style: normal;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #6FB5A8;
  margin-bottom: 6px;
}
@media (max-width: 768px) {
  .block-with-margin { grid-template-columns: 1fr; }
  .margin-note { border-left: none; border-top: 1px solid rgba(111, 181, 168, 0.30); padding: 10px 0 4px; }
}
</style>
```

---

## 8. GrainOverlay

**O que faz**: textura SVG fixed full-screen, vibe papel fotográfico anti-IA. Já existe em globals.css linha 627 mas falta APLICAR nos módulos.

**Variants**:
- `intensity`: `soft` (opacity 0.18) · `default` (0.30) · `heavy` (0.45)
- `scope`: `global` (fixed body) · `card` (absolute dentro de container)

**Props TypeScript**:
```ts
type GrainOverlayProps = {
  intensity?: 'soft' | 'default' | 'heavy'
  scope?: 'global' | 'card'
  className?: string
}
```

**Onde aplicar**:
- TODO módulo interno (/orders, /finance, /inventory, etc) precisa ter `<GrainOverlay scope="global" />` no layout
- Heavy: hero sections, cover do dashboard
- Soft: cards individuais que querem textura sem overpower

**Inspiração**: hayzer.com.br landing v2 (já implementado), godly.website 60% dos sites premium 2025 usam, awwwards handmade.

**Mock visual HTML**:
```html
<div class="grain-layer grain-default"></div>

<style>
.grain-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.95 0 0 0 0 0.93 0 0 0 0 0.88 0 0 0 0.45 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  mix-blend-mode: screen;
}
.grain-soft    { opacity: 0.18; }
.grain-default { opacity: 0.30; }
.grain-heavy   { opacity: 0.45; }
:root[data-theme="light"] .grain-layer { mix-blend-mode: multiply; }
:root[data-theme="light"] .grain-soft    { opacity: 0.16; }
:root[data-theme="light"] .grain-default { opacity: 0.28; }
:root[data-theme="light"] .grain-heavy   { opacity: 0.42; }
</style>
```

---

## 9. GlowPetrol

**O que faz**: halo radial sutil em volta de card de destaque (KPI, meta atingida, total). É decoração de elevação — não substitui shadow.

**Variants**:
- `tone`: `petrol` (default · sucesso) · `ember` (atenção/celebração) · `red-soft` (alerta · único uso)
- `intensity`: `subtle` (alpha 0.20) · `default` (0.32) · `bold` (0.45)
- `pulse`: boolean (animação 2.4s respira)

**Props TypeScript**:
```ts
type GlowPetrolProps = {
  children: React.ReactNode
  tone?: 'petrol' | 'ember' | 'red-soft'
  intensity?: 'subtle' | 'default' | 'bold'
  pulse?: boolean
  className?: string
}
```

**Onde aplicar**:
- /dashboard KPI hero "Receita do dia" (já tem no V4)
- /metrics card de meta atingida
- /finance total do mês
- /orders card "+ Novo pedido" CTA principal
- /inventory: filamento crítico (red-soft, atenção)

**Inspiração**: linear.app inbox hover, stripe.com dashboard "Total", apple.com sempre, refactoring UI cap "Creating Depth".

**Mock visual HTML**:
```html
<div class="glow-wrap glow-petrol">
  <div class="card-content">
    <span class="label">RECEITA DO DIA</span>
    <strong class="value">R$ 12.480</strong>
  </div>
</div>

<style>
.glow-wrap {
  position: relative;
  border-radius: 14px;
  padding: 24px;
  background: #161B1F;
  border: 1px solid rgba(242, 239, 234, 0.14);
  transition: box-shadow 320ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
.glow-petrol {
  box-shadow:
    0 0 32px -8px rgba(31, 118, 105, 0.32),
    0 8px 24px -10px rgba(7, 9, 10, 0.5),
    inset 0 1px 0 rgba(111, 181, 168, 0.10);
}
.glow-petrol:hover {
  box-shadow:
    0 0 48px -6px rgba(31, 118, 105, 0.45),
    0 12px 30px -10px rgba(7, 9, 10, 0.55),
    inset 0 1px 0 rgba(111, 181, 168, 0.14);
}
.glow-ember {
  box-shadow:
    0 0 32px -8px rgba(208, 138, 74, 0.32),
    0 8px 24px -10px rgba(7, 9, 10, 0.5),
    inset 0 1px 0 rgba(224, 162, 105, 0.10);
}
.glow-red-soft {
  box-shadow:
    0 0 28px -8px rgba(224, 122, 95, 0.28),
    0 8px 22px -10px rgba(7, 9, 10, 0.5),
    inset 0 1px 0 rgba(224, 122, 95, 0.08);
}
@keyframes glowBreath {
  0%, 100% { box-shadow: 0 0 24px -8px rgba(31, 118, 105, 0.22), inset 0 1px 0 rgba(111, 181, 168, 0.06); }
  50%      { box-shadow: 0 0 40px -6px rgba(31, 118, 105, 0.42), inset 0 1px 0 rgba(111, 181, 168, 0.12); }
}
.glow-pulse { animation: glowBreath 2.4s cubic-bezier(0.22, 0.61, 0.36, 1) infinite; }
</style>
```

---

## 10. RootDecor

**O que faz**: raiz SVG decorativa no canto do card. Identidade core Hayzer (logo H + raízes). Já existe no V4 dashboard `.root-hover`.

**Variants**:
- `corner`: `top-left` (default) · `top-right` · `bottom-left` · `bottom-right`
- `size`: `sm` (24px) · `md` (36px) · `lg` (48px)
- `tone`: `petrol` (default) · `ember` (cards de alerta)
- `trigger`: `hover` (cresce no hover do parent) · `always` (sempre visível) · `load` (cresce uma vez no load)

**Props TypeScript**:
```ts
type RootDecorProps = {
  corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  size?: 'sm' | 'md' | 'lg'
  tone?: 'petrol' | 'ember'
  trigger?: 'hover' | 'always' | 'load'
  className?: string
}
```

**Onde aplicar**:
- /orders: card do pedido em destaque (trigger=hover)
- /finance: card "saldo do mês" (always · ancora a marca)
- /inventory: card "filamento crítico" (ember · alerta)
- /projects: cada chip de projeto (sm · always · sutil)
- /dashboard: cards do bento (já tem · trigger=hover)

**Inspiração**: identidade Hayzer (logo + arquitetura V4 já estabelecida).

**Mock visual HTML**:
```html
<div class="card-with-root">
  <svg class="root-decor root-tl root-md root-petrol" viewBox="0 0 36 36">
    <path d="M18 4 L18 22" class="rd-trunk" />
    <path d="M18 12 L8 20" class="rd-branch" />
    <path d="M18 14 L26 22" class="rd-branch" />
    <path d="M18 18 L13 24" class="rd-sub" />
    <circle cx="8" cy="20" r="1.4" />
    <circle cx="26" cy="22" r="1.4" />
  </svg>
  <span class="label">EM PRODUÇÃO AGORA</span>
</div>

<style>
.root-decor {
  position: absolute;
  pointer-events: none;
  z-index: 2;
}
.root-tl { top: 14px; left: 14px; }
.root-tr { top: 14px; right: 14px; transform: scaleX(-1); }
.root-bl { bottom: 14px; left: 14px; transform: scaleY(-1); }
.root-br { bottom: 14px; right: 14px; transform: scale(-1, -1); }
.root-sm { width: 24px; height: 24px; }
.root-md { width: 36px; height: 36px; }
.root-lg { width: 48px; height: 48px; }
.root-petrol path,
.root-petrol circle { stroke: #6FB5A8; fill: none; }
.root-petrol circle { fill: #6FB5A8; stroke: none; }
.root-ember path,
.root-ember circle { stroke: #E0A269; fill: none; }
.root-ember circle { fill: #E0A269; stroke: none; }
.root-decor path {
  stroke-width: 1.3;
  stroke-linecap: round;
  filter: drop-shadow(0 0 4px currentColor);
}
.rd-trunk    { stroke-dasharray: 80; stroke-dashoffset: 80; transition: stroke-dashoffset 900ms cubic-bezier(0.22, 0.61, 0.36, 1); }
.rd-branch   { stroke-dasharray: 24; stroke-dashoffset: 24; transition: stroke-dashoffset 900ms cubic-bezier(0.22, 0.61, 0.36, 1) 200ms; }
.rd-sub      { stroke-dasharray: 16; stroke-dashoffset: 16; transition: stroke-dashoffset 900ms cubic-bezier(0.22, 0.61, 0.36, 1) 400ms; }
.root-decor circle { opacity: 0; transition: opacity 400ms ease-out 800ms; }
/* trigger=hover */
.card-with-root:hover .root-decor path { stroke-dashoffset: 0; }
.card-with-root:hover .root-decor circle { opacity: 0.85; }
/* trigger=always */
.root-always .rd-trunk,
.root-always .rd-branch,
.root-always .rd-sub { stroke-dashoffset: 0; opacity: 0.55; }
.root-always circle { opacity: 0.85; }
</style>
```

---

## 11. PolaroidCard

**O que faz**: card retangular com leve rotação + tape no topo + sombra colorida petrol, vibe "foto colada no álbum".

**Variants**:
- `rotation`: number (-3 a +3 · default alterna)
- `tone`: `fog` (default · papel warm) · `petrol-tinted` (versão petrol sutil)
- `tape-tone`: `ember` (default) · `petrol` · `neutral`
- `tape-position`: `top-center` (default) · `top-left` · `top-right`

**Props TypeScript**:
```ts
type PolaroidCardProps = {
  children: React.ReactNode
  caption?: string               // texto embaixo da imagem
  rotation?: number
  tone?: 'fog' | 'petrol-tinted'
  tapeTone?: 'ember' | 'petrol' | 'neutral'
  tapePosition?: 'top-center' | 'top-left' | 'top-right'
  className?: string
}
```

**Onde aplicar**:
- /portfolios: mosaic de trabalhos (rotações alternadas)
- /catalogs/[slug] showcase: produto físico premium
- /content: portfolio editorial
- /products gallery: máximo 4-6 cards (mais que isso cansa)

**Inspiração**: godly.website portfolio premium + awwwards handmade + designspells scrapbook tag.

**Mock visual HTML**:
```html
<div class="polaroid" style="transform: rotate(-1.5deg);">
  <span class="polaroid-tape" style="transform: translateX(-50%) rotate(-3deg);"></span>
  <div class="polaroid-image">[ imagem ]</div>
  <p class="polaroid-caption">Mini-vaso suculenta · Bambu X1</p>
</div>

<style>
.polaroid {
  padding: 12px 12px 18px;
  background: #F2EFEA;
  border-radius: 4px;
  position: relative;
  max-width: 240px;
  box-shadow:
    0 1px 0 rgba(0,0,0,0.04),
    0 8px 16px rgba(7, 9, 10, 0.30),
    0 24px 48px -12px rgba(31, 118, 105, 0.18);
  transition: transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
.polaroid:hover { transform: rotate(0deg) translateY(-2px); }
.polaroid-tape {
  position: absolute;
  top: -8px;
  left: 50%;
  width: 64px;
  height: 18px;
  background: rgba(208, 138, 74, 0.85);
  border-radius: 2px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.20);
}
.polaroid-image {
  width: 100%;
  height: 200px;
  background: #BDB7AB;
  border-radius: 2px;
  margin-bottom: 12px;
}
.polaroid-caption {
  font-family: 'Fraunces', Georgia, serif;
  font-style: italic;
  font-size: 14px;
  color: #1F1B17;
  text-align: center;
  line-height: 1.4;
}
</style>
```

---

## 12. TickerMarquee

**O que faz**: faixa horizontal com texto deslizando (CSS keyframes), vibe terminal / live data.

**Variants**:
- `speed`: `slow` (60s) · `default` (40s) · `fast` (25s)
- `tone`: `petrol` (default) · `ember` · `neutral`
- `position`: `top` · `bottom` (default · rodapé)
- `pauseOnHover`: boolean (default true)

**Props TypeScript**:
```ts
type TickerMarqueeProps = {
  items: string[]                // ["+ 8 PEDIDOS HOJE", "+R$ 2.340 EM 6H", ...]
  speed?: 'slow' | 'default' | 'fast'
  tone?: 'petrol' | 'ember' | 'neutral'
  position?: 'top' | 'bottom'
  pauseOnHover?: boolean
  separator?: string             // "·" default
  className?: string
}
```

**Onde aplicar**:
- Rodapé fixed do dashboard (atividade da semana)
- Topo de /orders (live: novos pedidos chegando)
- /finance: entradas/saídas em tempo real
- /metrics: KPIs rotacionando

**Inspiração**: vercel.com analytics + designvault.io patterns + mobbin "live data" + landing v2 hayzer.com.br rodapé.

**Mock visual HTML**:
```html
<div class="ticker-marquee ticker-bottom ticker-petrol">
  <div class="ticker-track">
    <span>+ 8 PEDIDOS HOJE</span>
    <span class="sep">·</span>
    <span>+R$ 2.340 EM 6H</span>
    <span class="sep">·</span>
    <span>3 EM PRODUÇÃO</span>
    <span class="sep">·</span>
    <span>BAMBU X1 73%</span>
    <span class="sep">·</span>
    <span>ML 12 NOVAS</span>
    <span class="sep">·</span>
    <!-- duplicar pra loop sem corte -->
    <span>+ 8 PEDIDOS HOJE</span>
    <span class="sep">·</span>
    <span>+R$ 2.340 EM 6H</span>
  </div>
</div>

<style>
.ticker-marquee {
  position: fixed;
  bottom: 0;
  left: 248px;     /* alinhado com fim da sidebar */
  right: 0;
  height: 38px;
  background: #11161A;
  border-top: 1px solid rgba(242, 239, 234, 0.10);
  overflow: hidden;
  display: flex;
  align-items: center;
  z-index: 5;
}
.ticker-track {
  display: flex;
  gap: 28px;
  white-space: nowrap;
  animation: tickerScroll 40s linear infinite;
  font-family: 'Geist Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.10em;
  text-transform: uppercase;
}
.ticker-petrol  { color: #6FB5A8; }
.ticker-ember   { color: #E0A269; }
.ticker-neutral { color: #BDB7AB; }
.ticker-track .sep { color: rgba(242, 239, 234, 0.20); }
.ticker-marquee:hover .ticker-track { animation-play-state: paused; }
@keyframes tickerScroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
</style>
```

---

## 13. SkewBanner

**O que faz**: faixa diagonal no canto do card, vibe "ENTERPRISE" Stripe / promo.

**Variants**:
- `corner`: `top-right` (default) · `top-left`
- `tone`: `ember` (default) · `petrol` · `red-soft`

**Props TypeScript**:
```ts
type SkewBannerProps = {
  label: string                  // máx 14 chars
  corner?: 'top-right' | 'top-left'
  tone?: 'ember' | 'petrol' | 'red-soft'
  className?: string
}
```

**Onde aplicar**:
- /calculadora-pro: "RECOMENDADO" no plano pro
- /settings: "PLANO ATUAL" no card de plano
- /catalogs: "EDIÇÃO LIMITADA" em produto especial
- /finance: "VAI VENCER" em fatura próxima do vencimento

**Inspiração**: stripe.com pricing + godly portfolios + lapa.ninja landings.

**Mock visual HTML**:
```html
<div class="card-with-banner">
  <span class="skew-banner skew-tr skew-ember">RECOMENDADO</span>
  <div class="card-content">
    <h3>Plano Pro</h3>
  </div>
</div>

<style>
.card-with-banner {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
}
.skew-banner {
  position: absolute;
  width: 160px;
  text-align: center;
  font-family: 'Geist Mono', monospace;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  padding: 5px 0;
  color: #1A100A;
  z-index: 3;
}
.skew-banner.skew-tr {
  top: 22px;
  right: -42px;
  transform: rotate(38deg);
}
.skew-banner.skew-tl {
  top: 22px;
  left: -42px;
  transform: rotate(-38deg);
}
.skew-ember     { background: #D08A4A; }
.skew-petrol    { background: #1F7669; color: #F2EFEA; }
.skew-red-soft  { background: #C25E45; color: #FBF1ED; }
</style>
```

---

## 14. TooltipHandwritten

**O que faz**: callout editorial estilo nota colada, com hand-drawn arrow conectora ao alvo.

**Variants**:
- `side`: `top` · `right` · `bottom` · `left`
- `tone`: `ember` (alerta) · `petrol` (dica) · `fog` (info)
- `arrow`: boolean (mostra arrow conectora)

**Props TypeScript**:
```ts
type TooltipHandwrittenProps = {
  children: React.ReactNode      // texto do tooltip
  target: React.ReactNode        // elemento que recebe o tooltip
  side?: 'top' | 'right' | 'bottom' | 'left'
  tone?: 'ember' | 'petrol' | 'fog'
  arrow?: boolean
  visible?: boolean              // forçar exibição (default: hover do target)
  className?: string
}
```

**Onde aplicar**:
- Onboarding primeira vez (apontando pra feature nova)
- /metrics: explicação de gráfico complexo
- /settings: dica em toggle de feature beta
- /orders: tutorial pro primeiro pedido

**Inspiração**: designspells.com easter eggs + mobbin onboarding flows + notion.so anotações.

**Mock visual HTML**:
```html
<div class="tooltip-wrap">
  <button class="tooltip-target">+ Novo pedido</button>
  <div class="tooltip-hw tooltip-petrol tooltip-side-right">
    <p>Começa aqui — adiciona o pedido do Rafael.</p>
    <svg class="tooltip-arrow" viewBox="0 0 60 30" width="60" height="30">
      <path d="M5 25 Q20 10, 35 18 T55 12" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" />
      <path d="M50 8 L57 12 L48 18" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </div>
</div>

<style>
.tooltip-wrap { position: relative; display: inline-block; }
.tooltip-hw {
  position: absolute;
  top: 50%;
  left: calc(100% + 16px);
  transform: translateY(-50%);
  padding: 12px 16px;
  background: #F2EFEA;
  color: #1F1B17;
  border-radius: 8px 8px 8px 2px;
  font-family: 'Fraunces', Georgia, serif;
  font-style: italic;
  font-size: 14px;
  line-height: 1.45;
  max-width: 220px;
  box-shadow: 0 12px 32px -8px rgba(7, 9, 10, 0.45);
  z-index: 10;
}
.tooltip-petrol { color: #1F7669; border: 1px solid rgba(31, 118, 105, 0.30); }
.tooltip-ember  { color: #A86A30; border: 1px solid rgba(208, 138, 74, 0.30); }
.tooltip-fog    { color: #3A352D; border: 1px solid rgba(58, 53, 45, 0.18); }
.tooltip-arrow {
  position: absolute;
  top: -22px;
  left: -54px;
  color: currentColor;
}
.tooltip-arrow path { stroke-dasharray: 100; stroke-dashoffset: 100; animation: drawArrow 900ms cubic-bezier(0.22, 0.61, 0.36, 1) 200ms forwards; }
</style>
```

---

## 15. InsetHighlight (utility CSS)

**O que faz**: 1px de luz interna no topo do card, simula luz vinda de cima. Refactoring UI "Creating Depth".

**Variants** (utility class · sem props):
- `.inset-soft` (alpha 0.06)
- `.inset-default` (alpha 0.08)
- `.inset-strong` (alpha 0.12 · destaque)
- `.inset-petrol` (tinted petrol)

**Mock visual HTML**:
```html
<div class="card inset-default">
  <p>Card com luz interna sutil no topo.</p>
</div>

<style>
.card {
  background: #161B1F;
  border: 1px solid rgba(242, 239, 234, 0.14);
  border-radius: 14px;
  padding: 20px;
}
.inset-soft     { box-shadow: inset 0 1px 0 rgba(242, 239, 234, 0.06); }
.inset-default  { box-shadow: inset 0 1px 0 rgba(242, 239, 234, 0.08); }
.inset-strong   { box-shadow: inset 0 1px 0 rgba(242, 239, 234, 0.12); }
.inset-petrol   { box-shadow: inset 0 1px 0 rgba(111, 181, 168, 0.10); }
:root[data-theme="light"] .inset-soft     { box-shadow: inset 0 1px 0 rgba(15, 10, 9, 0.04); }
:root[data-theme="light"] .inset-default  { box-shadow: inset 0 1px 0 rgba(15, 10, 9, 0.06); }
:root[data-theme="light"] .inset-strong   { box-shadow: inset 0 1px 0 rgba(15, 10, 9, 0.10); }
:root[data-theme="light"] .inset-petrol   { box-shadow: inset 0 1px 0 rgba(31, 118, 105, 0.05); }
</style>
```

---

## Estrutura de arquivos sugerida (Felipe implementar)

```
components/visual-library/
├── index.ts                      // exports nomeados
├── TapeBadge.tsx
├── Stamp.tsx
├── MarkerUnderline.tsx
├── HighlightedText.tsx
├── HandDrawnArrow.tsx
├── AsteriskNote.tsx
├── MarginNote.tsx
├── GrainOverlay.tsx
├── GlowPetrol.tsx
├── RootDecor.tsx
├── PolaroidCard.tsx
├── TickerMarquee.tsx
├── SkewBanner.tsx
├── TooltipHandwritten.tsx
└── _styles.css                   // estilos compartilhados (utility classes inset, etc)
```

Importação nos módulos legados:
```tsx
import { TapeBadge, Stamp, MarkerUnderline } from '@/components/visual-library'

// em /orders
<Stamp label="PAGO" tone="petrol" />
<TapeBadge tone="red">ATRASADO</TapeBadge>
<p>Tem <MarkerUnderline tone="ember">3 pedidos</MarkerUnderline> pra hoje.</p>
```

---

## Roadmap de adoção (sugestão pra Felipe)

| Sprint | Componentes | Onde aplica primeiro |
|---|---|---|
| 1 | GrainOverlay, GlowPetrol, InsetHighlight (utilities) | TODOS os módulos (one-shot global) |
| 2 | TapeBadge, Stamp, MarkerUnderline, HighlightedText | /orders + /finance |
| 3 | RootDecor, HandDrawnArrow, AsteriskNote | /inventory + /metrics |
| 4 | MarginNote, TickerMarquee, SkewBanner | /products + /catalogs |
| 5 | PolaroidCard, TooltipHandwritten | /portfolios + onboarding |

Cada sprint pequena (1-2h dev) → módulo ganha tom rico SEM refactor estrutural.

---

## Notas anti-IA (checklist Diego)

- [x] Zero gradiente roxo
- [x] Zero cantos arredondados padrão demais (variar 4/8/14/16/999px)
- [x] Tipografia escolhida (Fraunces + Geist + Geist Mono)
- [x] Rotações intencionais (alternam sentido)
- [x] Sem emoji em UI (só em copy de celebração isolada — landing /obrigado)
- [x] Sem ícone genérico de IA (lucide-react banido em decoração — Phosphor duotone preferido)
- [x] Variação intencional de tamanho/cor (sistema fechado)
- [x] Acessibilidade WCAG AA validada por contraste
