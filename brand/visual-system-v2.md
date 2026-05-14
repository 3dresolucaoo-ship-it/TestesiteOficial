# BVaz Hub — Sistema Visual v2 (Linha Editorial Oficial)

> Versão 2.0 · 2026-05-14 · Mantido por: Diego (designer G7) + Gabriel (CEO).
>
> **Esta é a fonte da verdade do visual a partir de 14/05/2026.** Substitui a Paleta B v1.
> Aplicado em produção na landing pública (commit `6b02c6d`). Dashboard interno migra na Fase 2 (pós-launch).

---

## 📜 CONTEXTO DA DECISÃO

A v1 (Paleta B premium escuro com azul corporativo) foi feita em 13/05. No dia seguinte, vendo o resultado em prod, o CEO bateu de frente: **"tá genérica, com ar de IA, muito escura"**.

Diego refez visual completo. CEO mostrou 4 mockups de referência (Zero waitlist, NFT mint, Watlisto, OPENVERIZON branco) — gostou especificamente de Zero e OPENVERIZON. Diego entregou 3 alternativas em HTML standalone. CEO escolheu **"estrutura do mockup A + paleta do mockup B"** — o que virou o `option-c-hybrid.html`.

**Filosofia da v2**: editorial premium, anti-IA, "feito à mão". Vibe Substack + Linear marketing + Stripe deslogado. Acolhedor pro Rafael (persona não-tech). **NÃO** é "tech corporativo" nem "premium frio".

---

## 🎨 PALETA

### Tokens shadcn (override em `html.dark[data-layout="marketing"]`)

| Token | HSL | Hex | Uso |
|---|---|---|---|
| `--background` | 200 11% 3% | `#07090A` | Fundo principal |
| `--foreground` | 43 17% 93% | `#F2EFEA` | Texto principal (alto contraste) |
| `--card` | 200 11% 6% | `#0B0E10` | Card / Footer bg |
| `--primary` | 173 58% 28% | `#1F7669` | PRIMARY (focus ring, accent forte) |
| `--primary-foreground` | 0 0% 100% | `#FFFFFF` | Texto sobre primary |
| `--muted-foreground` | 40 12% 71% | `#BDB7AB` | Texto secundário |
| `--accent` | 28 60% 55% | `#D08A4A` | Sticker, marker (âmbar) |
| `--border` | 43 17% 93% / 0.08 | rgba(242,239,234,.08) | Bordas sutis |

### Tokens custom (família night/fog/petrol/ember)

```css
/* night — base do dark */
--night-950: 200 11% 3%;   /* #07090A — bg principal */
--night-900: 200 11% 6%;   /* #0B0E10 — card/footer */
--night-800: 200 10% 9%;   /* #13171A — surface elevada */

/* fog — texto sobre dark (off-white quente) */
--fog-50:  43 17% 93%;     /* #F2EFEA — texto principal */
--fog-100: 40 21% 86%;     /* #E3DED5 — texto secundário forte */
--fog-200: 40 12% 71%;     /* #BDB7AB — texto muted-foreground */
--fog-300: 38 7%  51%;     /* #8A8478 — texto muted */
--fog-400: 35 9%  33%;     /* #5B564D — texto bem fraco */

/* petrol — accent principal (verde-petróleo, anti azul corporativo) */
--petrol-300: 173 30% 57%; /* #6FB5A8 — tags, bullets */
--petrol-400: 173 39% 41%; /* #3F9286 — hover, accent visual */
--petrol-500: 173 58% 28%; /* #1F7669 — PRIMARY */
--petrol-600: 172 62% 22%; /* #155A50 — primary hover */

/* ember — accent secundário (âmbar handmade) */
--ember-400: 27 67% 65%;   /* #E2A06A — sticker gradient top */
--ember-500: 28 60% 55%;   /* #D08A4A — marker + sticker mid */
--ember-600: 25 56% 42%;   /* #A86A30 — sticker gradient bottom */
```

### Por que não azul?

Bling, Conta Azul, Stripe — todo SaaS brasileiro de gestão usa azul. Petrol (verde-petróleo) lê como "orgânico, confiança madura, anti-tech-frio". Foi escolha intencional pra diferenciar.

### Por que dark e não light?

A v2 manteve dark (apesar do CEO ter pedido "mais claro") porque:
1. **Grain + glow em fundo escuro** = visual premium editorial
2. **Contraste alto** com fog-50 (texto off-white quente, não branco puro) dá legibilidade
3. **Petrol/ember acendem** sobre fundo escuro (em light mode ficaria opaco)

CEO aprovou ao ver renderizado: "ficou perfeito, gostei da cor".

---

## 🅰️ TIPOGRAFIA

### Famílias

```ts
// app/layout.tsx
import { Geist, Fraunces } from 'next/font/google'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['opsz', 'SOFT'],   // variable font — NÃO passar weight
})
```

| Família | Var | Uso |
|---|---|---|
| **Geist Sans** | `--font-geist-sans` | Body, navegação, labels, parágrafos |
| **Geist Mono** | (system mono fallback) | Tags uppercase, preços, datas, `04.07.2026` |
| **Fraunces serif** (variable) | `--font-fraunces` | h1, h2, watermark, `BVaz Hub` no logo grande |

**Settings ativos no body marketing:**
```css
font-feature-settings: 'ss01', 'ss02', 'cv11';
```

### Classes utility (em `globals.css`)

| Classe | Configuração |
|---|---|
| `.display-h1` | Fraunces 600, opsz=144, SOFT=30, line-height 0.95, tracking -0.035em |
| `.display-h2` | Fraunces 600, opsz=144, SOFT=30, line-height 1.02, tracking -0.03em |
| `.italic-soft` | italic, opsz=144, SOFT=100, weight 300 — pra acentos delicados |
| `.tag` | Geist Mono 11px, uppercase, tracking 0.06em, cor petrol-300 |
| `.tag-fog` | igual `.tag` mas cor fog-300 (variante neutra) |

### Princípios

1. **Headings**: SEMPRE Fraunces (display-h1, display-h2). Nunca Geist em h1/h2.
2. **Body**: Geist sans (default body font).
3. **Italic-soft** parcimonioso — 1-2 palavras-chave por seção, nunca parágrafo inteiro.
4. **Tags**: font-mono uppercase pra dar peso "técnico/handmade" — "V0.3 · WAITLIST ABERTA", "01 — ESTOQUE", "04.07.2026".

---

## 🪞 DETALHES ANTI-IA (essenciais — não pula)

Esses são os elementos que **transformam o visual de "template Vercel default" em "feito por pessoa".**

### 1. Grain (noise SVG inline)

```css
.grain::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='...'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.95 0 0 0 0 0.93 0 0 0 0 0.88 0 0 0 0.45 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  opacity: 0.45;
  mix-blend-mode: screen;
}
.grain-heavy::before { opacity: 0.65; }
.grain-soft::before  { opacity: 0.22; }
```

3 níveis: heavy (FinalCTA), normal (Hero), soft (Features/Footer). **Cria ritmo de textura**.

### 2. Marker handmade

```css
.marker {
  background: linear-gradient(180deg, transparent 62%, hsl(var(--ember-500) / 0.55) 62%, hsl(var(--ember-500) / 0.55) 92%, transparent 92%);
  padding: 0 0.05em;
}
```

Aplicar **inline** em 1 palavra forte por h1. Ex: `<h1>Seu negócio, sem <span class="marker">caos</span>.</h1>`. **Não abusa** — 1x por landing.

### 3. Italic-soft em palavras-chave

```html
<h2>Hoje você paga<br>por <span class="italic-soft">quatro coisas</span>.</h2>
```

Fraunces variable com `font-variation-settings: 'opsz' 144, 'SOFT' 100` + weight 300 dá um italic delicado, editorial.

### 4. Sticker âmbar (estilo adesivo)

```css
.sticker-amber {
  background: linear-gradient(180deg, hsl(var(--ember-400)) 0%, hsl(var(--ember-600)) 100%);
  color: hsl(var(--night-800));
  box-shadow:
    0 1px 0 rgba(255,255,255,0.4) inset,
    0 1px 2px rgba(0,0,0,0.4),
    0 0 28px -8px hsl(var(--ember-500) / 0.6);
}
```

Usar **rotacionado 6°** pra parecer colado a mão. Ex: badge de lançamento, "ACESSO ANTECIPADO" no canto do form.

### 5. Logo-mark com pulse-glow

```css
.logo-mark {
  background: linear-gradient(180deg, hsl(var(--fog-50)) 0%, hsl(var(--fog-100)) 100%);
  color: hsl(var(--night-950));
  box-shadow:
    0 1px 0 rgba(255,255,255,0.4) inset,
    0 0 0 1px rgba(255,255,255,0.06),
    0 20px 40px -16px hsl(var(--petrol-500) / 0.4),
    0 0 60px -10px hsl(var(--petrol-500) / 0.25);
}
.logo-pulse { animation: pulse-glow 5s ease-in-out infinite; }
```

Variantes: `sm` (32px header) e `lg` (96px hero — vira identidade visual).

### 6. Vinheta

```css
.vignette::after {
  background: radial-gradient(ellipse 110% 80% at 50% 40%, transparent 55%, rgba(0,0,0,0.55) 100%);
}
```

Aplicar em hero + finalCTA. Foca o olhar no centro, escurece bordas.

### 7. Watermark gigante no footer

```html
<div class="watermark text-[7.5rem] md:text-[12.5rem]">feito no brasil.</div>
```

```css
.watermark {
  font-family: var(--font-fraunces), Georgia, serif;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: hsl(var(--fog-50) / 0.04);
}
```

200px Fraunces, opacity 0.04 — só lê de perto. **Peso visual no encerramento.**

### 8. Number stamps font-mono

```html
<div class="tag">01 — estoque</div>
<div class="tag">04.07.2026</div>
<div class="tag">v0.3 · waitlist aberta</div>
```

Adiciona ar "técnico-artesanal".

### 9. Ícones SVG duotone custom

**Não usar Lucide default 24x24.** Criar SVG inline com classes:
- `.icon-warm` (cor petrol-300)
- `.icon-bg` (fill petrol-300/10%)
- `.icon-stroke` (stroke currentColor 1.5, fill none)

Exemplo: caixa empilhada, recibo, gente, gráfico (ver `components/landing/Features.tsx`).

### 10. Asymmetric layouts

**Banido**: grid 2x2 padrão Tailwind, layout 100% centralizado.

**Usar**:
- Hero split `lg:grid-cols-12` com `col-span-7 + col-span-5`
- Features `grid-template-columns: 1.15fr 0.85fr` (cards desproporcionais)
- Section headings alinhados à esquerda, não centralizados
- WhyDifferent split com gradient só num lado

---

## 🧩 COMPONENTES-CHAVE

### `.card-letter` — form em "carta"

```css
.card-letter {
  background: linear-gradient(180deg, hsl(var(--fog-50) / 0.045) 0%, hsl(var(--fog-50) / 0.02) 100%);
  border: 1px solid hsl(var(--fog-50) / 0.12);
  backdrop-filter: blur(14px);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.06) inset,
    0 30px 70px -20px rgba(0,0,0,0.6),
    0 0 60px -20px hsl(var(--petrol-500) / 0.18);
}
```

Glassmorphism dark. Usar pra forms premium, painéis de destaque.

### `.feature-card` (+ `.feature-card-glow`)

```css
.feature-card {
  background: linear-gradient(180deg, hsl(var(--fog-50) / 0.028), hsl(var(--fog-50) / 0.01));
  border: 1px solid hsl(var(--fog-50) / 0.08);
}
.feature-card::before {
  background: radial-gradient(ellipse at top left, hsl(var(--petrol-300) / 0.06), transparent 60%);
}
.feature-card:hover {
  border-color: hsl(var(--petrol-300) / 0.22);
}
.feature-card-glow {
  background: linear-gradient(135deg, hsl(var(--petrol-500) / 0.10), hsl(var(--fog-50) / 0.02) 60%);
  border-color: hsl(var(--petrol-300) / 0.20);
}
```

Card com glow interno top-left. Variante `-glow` pra destaque (1 card especial por seção).

### `.field-dark` — input

```css
.field-dark {
  background: hsl(var(--fog-50) / 0.04);
  border: 1px solid hsl(var(--fog-50) / 0.10);
}
.field-dark:focus {
  border-color: hsl(var(--petrol-300) / 0.5);
  box-shadow: 0 0 0 3px hsl(var(--petrol-500) / 0.18);
}
```

Glass sutil. Focus com ring petrol.

### `.btn-light` — botão primário sobre dark

```css
.btn-light {
  background: hsl(var(--fog-50));
  color: hsl(var(--night-950));
  box-shadow: 0 1px 0 rgba(255,255,255,0.5) inset, 0 6px 18px -6px hsl(var(--fog-50) / 0.22);
}
.btn-light:hover {
  background: #FFFFFF;
  transform: translateY(-1px);
}
```

Inverso do convencional. **Contraste alto** estilo Zero.

### `.compare-row` — linha tracejada

```css
.compare-row { border-bottom: 1px dashed hsl(var(--fog-50) / 0.10); }
```

Usar em tabelas comparativas, listas técnicas.

---

## 📋 QUANDO APLICAR

### ✅ Aplicar agora

- Landing pública (`/`)
- `/waitlist/obrigado`
- Páginas LGPD (`/privacidade`, `/termos`)
- Emails transacionais (futuro Resend)
- Material de marketing externo (banners, posts)
- Mídia social (templates de carrossel LinkedIn, Instagram)

### ⏳ Aplicar gradualmente (pós-launch, Fase 2)

- `/login` (próxima onda — Onda 1 tokens-only é rápida, ~1h)
- `/dashboard` (após validar com user real)
- Componentes operacionais (FinanceView, InventoryView, etc) — Onda 3

### ❌ Não tocar agora

- CSS legado do dashboard (`--t-bg`, `--t-text-primary`, etc) — convive em paralelo via override
- Classes hardcoded espalhadas (`bg-[#0f0f0f]`, `text-white`, etc) — overrides existentes em `globals.css:448-510` compensam

---

## 🛠️ COMO APLICAR EM NOVO COMPONENTE

1. **Verificar se é rota marketing** — `html[data-layout="marketing"]` precisa estar ativo (rotas em `MARKETING_PATHS` do `LayoutSwitch.tsx`)
2. **Usar tokens shadcn** (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`) — eles já apontam pros valores v2 via override
3. **Usar utility classes custom** (`.display-h1`, `.marker`, `.sticker-amber`, `.card-letter`, `.feature-card`, etc) pra elementos do sistema
4. **Tags em font-mono uppercase** com classes `.tag` ou `.tag-fog`
5. **Headings em Fraunces**: `<h1 className="display-h1 text-foreground">` e `<h2 className="display-h2">`
6. **Animações**: framer-motion staggered com `cubic-bezier(0.22, 0.61, 0.36, 1)` e delays 0.1s-0.4s
7. **Containers**: usar `.container-warm` (max-w 1180px) ou `max-w-6xl` Tailwind pra largura padrão

### Exemplo mínimo

```tsx
<section className="vignette grain relative overflow-hidden">
  <div className="container-warm relative mx-auto max-w-[1180px] px-6 py-24">
    <div className="tag mb-3">categoria</div>
    <h2 className="display-h2 text-[2.5rem] text-foreground md:text-[3.5rem]">
      Headline <span className="italic-soft">editorial</span>.
    </h2>
    <p className="mt-5 text-[16px] leading-[1.55] text-muted-foreground">
      Subtítulo em Geist sans cinza fog-200.
    </p>
  </div>
</section>
```

---

## 🚫 BANIDOS

### Cores
- Gradiente roxo padrão `indigo → purple`
- Azul corporativo `#3B82F6` (Bling, Conta Azul vibe)
- Gradiente azul→roxo SaaS genérico

### Layouts
- Grid 2x2 padrão Tailwind (`grid grid-cols-2 gap-4`)
- Hero 100% centralizado simétrico
- Cards todos do mesmo tamanho em features

### Tipografia
- Apenas Geist em h1 (sempre Fraunces nos headings)
- Centralização forçada em parágrafos longos

### Ícones
- Lucide default 24x24 grid sem trato (`<Heart className="h-6 w-6" />`)
- Ícones genéricos de SaaS (foguete, raio, check em círculo verde)

### Copy
- "Plataforma", "solução", "que ajuda", "revolucionário", "transformar"
- Em-dashes (—) em copy de marketing (parece IA)

### Visual
- Cantos arredondados em TUDO (`rounded-3xl` em cada card)
- Drop shadow `shadow-2xl` em qualquer coisa
- Borders sólidas grossas (preferir `border-fog-50/0.08` translúcidas)

---

## 📁 ARQUIVOS DE REFERÊNCIA

### Mockups HTML standalone (vivos no repo)

- `mockups/landing-v2/option-a-light-warm.html` — alternativa light/creme (NÃO escolhida)
- `mockups/landing-v2/option-b-dark-grain.html` — Zero-style (NÃO escolhido)
- `mockups/landing-v2/option-c-hybrid.html` — **ESCOLHIDO** — base do que está em prod
- `mockups/landing-v2/README.md` — comparativo Diego

### Implementação real (em prod)

- `app/layout.tsx` — fontes Geist + Fraunces
- `app/globals.css:218-460` — tokens v2 + utility classes
- `components/landing/Logo.tsx`
- `components/landing/Header.tsx`
- `components/landing/Hero.tsx`
- `components/landing/WaitlistForm.tsx`
- `components/landing/Features.tsx`
- `components/landing/WhyDifferent.tsx`
- `components/landing/FinalCTA.tsx`
- `components/landing/Footer.tsx`

### Commit em prod

`6b02c6d` — "landing v2: refundacao visual option-c (paleta petrol + Fraunces + split + grain)"

---

## 🔄 ATUALIZAÇÕES

| Data | Mudança | Autor |
|---|---|---|
| 2026-05-14 | Criação do sistema visual v2 — substitui Paleta B v1 | Diego + Gabriel |

---

## 🎯 SLOGAN DA LINHA

> **"Editorial, anti-IA, feito por gente."**

Toda decisão visual passa por essa frase. Se a opção em mesa parece "template Vercel default" ou "render de SaaS genérico", está errado.
