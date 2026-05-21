# Animations Landing — Spec v2 (PNGs reais)

> Versão: 2.0 · 21/05/2026 · Diego (designer)
> Substitui v1 (SVG inline carteira CSS · NUNCA foi escrita, descartada antes de codar).
> Anchor: 12 PNGs cinematográficos gerados pelo CEO (IA + Photoshop manual).
> Felipe implementa. CSS-first onde der; framer-motion só onde já existe lazy.
> **Ganho esperado TBT vs v1**: igual ou melhor — v1 SVG inline custava ~2KB CSS extra + 1 IO; v2 é só `<picture>` + cross-fade (zero JS novo).

---

## 1. Princípios

1. **Asset > animação**. Os PNGs contam a história sozinhos. CSS é só revelar/transicionar, nunca "performar".
2. **CSS-first**. Cross-fade, zoom sutil, pulse e stagger = `@keyframes` + `IntersectionObserver` mínimo. Framer-motion só onde o chunk já está pago (Hero, Features, WhyDifferent, FinalCTA).
3. **Sem regressão TBT**. Asset Hero atual continua sendo o mockup texto (low-bytes). Asset pesado (laptop) entra APENAS depois do hero, com `loading="lazy"` e `decoding="async"`.
4. **Mobile-first**. Cada section define comportamento <768px. Stack vertical, aspect-ratio que não enterra texto.
5. **prefers-reduced-motion**. Bloco global em `app/globals.css` desativa todas as animações. Imagens continuam visíveis (não dependem de animação pra ler).

---

## 2. Bloco prefers-reduced-motion (a ADICIONAR)

Felipe adiciona no fim de `app/globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  /* Garantia: imagens nunca dependem de animação pra aparecer */
  .reveal-img { opacity: 1 !important; transform: none !important; }
}
```

---

## 3. Mapa decisão por section (DO TOPO PRO FIM)

### 3.1 Hero (NÃO mexer no PNG)

- **Decisão**: NÃO substituir mockup texto por `produto-laptop.webp`. Motivo: TBT 3.6s prod, qualquer asset >100KB no above-the-fold piora LCP.
- **Mudança única**: Hero continua exatamente igual. Asset laptop migra pra ProductPreview (3.5).
- **Animação**: framer-motion existente (`opacity 0→1 + y 12→0`, ease `[0.22, 0.61, 0.36, 1]`, stagger 100ms).
- **Pendência Felipe**: confirmar migração `motion` → `LazyMotion + m.*` (CLAUDE.md cita "feito" mas arquivo atual ainda importa `motion` direto · ver `components/landing/Hero.tsx:3`).
- **Mobile**: já OK.
- **prefers-reduced fallback**: framer-motion respeita automaticamente quando `transition: { duration: 0 }`. Felipe valida via `useReducedMotion()`.

---

### 3.2 PrinterShowcase — TROCAR foto

- **Anchor PNG**: `timelapse-impressora.webp` (substitui `printer-hero.jpg` Bambu CEO atual).
- **Motivo**: PNG é cinematic — neon noturno + caneca HAYZER + iPhone gravando. Mais "estúdio sério" que foto bruta. Mantém auth (não é stock).
- **Aspect ratio fonte**: 4:3 (640×480 aprox no PNG original). Em desktop continua `lg:aspect-[9/16]` (portrait) via `object-cover object-center` — fica natural mesmo com asset wide (mostra zoom no centro: impressora + caneca + neon).
- **Trigger**: nenhum. `<img>` estático com `priority` ainda (above-the-fold do segundo viewport).
- **Animação**: nenhuma. Vinheta interna existente continua via `box-shadow inset`.
- **Filter atual**: `saturate(0.92) contrast(1.04) brightness(0.96)` — REMOVER. O PNG já vem tratado.
- **`<picture>` srcset**:
  ```html
  <picture>
    <source media="(min-width: 1024px)" srcset="/landing/v3/timelapse-impressora-1080.webp 1x, /landing/v3/timelapse-impressora-1920.webp 2x" />
    <source media="(max-width: 1023px)" srcset="/landing/v3/timelapse-impressora-480.webp 1x, /landing/v3/timelapse-impressora-1080.webp 2x" />
    <img src="/landing/v3/timelapse-impressora-1080.webp" alt="Bambu A1 imprimindo torre branca espiral, iPhone em tripé gravando timelapse, caneca HAYZER no canto, neon âmbar ao fundo, estúdio noturno" loading="lazy" decoding="async" width="1080" height="720" />
  </picture>
  ```
- **Mobile**: aspect-ratio muda pra 4:3 (atual já faz isso, mantém). Caption Geist Mono abaixo: trocar "Bambu Lab A1 · 28 peças · PLA amarelo + verde · build plate 256×256" por "estúdio maker · gravação real · timelapse Bambu A1".
- **Alt PT-BR**: usar texto acima (descritivo, maker BR).
- **prefers-reduced**: imagem não anima, nada a fazer.

---

### 3.3 NOVA SECTION — "Antes/Depois maker" (ENTRE PrinterShowcase e ProductPreview)

- **Anchor PNG**: `maker-antes-depois.webp` (1 PNG único · split A/B já embutido no asset: maker triste + lista vermelha vs maker sorrindo HAYZER + lista verde, 6 dores espelhadas).
- **Conceito**: zoom-in cinematic + fade. Não é cross-fade entre 2 imagens (o SPLIT já vem no PNG). É 1 imagem que aparece no scroll.
- **Trigger**: IntersectionObserver, threshold 0.35 (1/3 visível), `once: true`.
- **Animação CSS**:
  ```css
  .reveal-zoom-fade {
    opacity: 0;
    transform: scale(0.95);
    transition: opacity 700ms cubic-bezier(0.22, 0.61, 0.36, 1),
                transform 700ms cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .reveal-zoom-fade.is-visible {
    opacity: 1;
    transform: scale(1);
  }
  ```
- **JS mínimo**: snippet `IntersectionObserver` em hook utilitário `useRevealOnScroll(ref, { threshold: 0.35 })`. Adicionar classe `.is-visible` quando interseccionar.
- **Aspect ratio fonte**: 3:2 (1200×800 aprox).
- **Headline acima** (Fraunces 500, clamp 2rem→3rem): "Mesma rotina. Cabeça diferente." (Carla refina depois)
- **Subhead Geist 17px**: "Não muda a impressora. Muda o caos." (Carla refina)
- **Mobile**: o PNG já é split A/B horizontal — em <600px a leitura fica apertada. Solução: NO MOBILE, exibir o PNG inteiro em `width: 100%` + adicionar caption Geist Mono curta "A (caos) / B (Hayzer)" pra ancorar leitura. Não cropar o PNG.
- **prefers-reduced**: regra `.reveal-img` no globals.css força `opacity: 1; transform: none` (imagem aparece estática).
- **Posição no DOM**: `app/page.tsx`, novo `<MakerBeforeAfter />` ENTRE `<PrinterShowcase />` e `<ProductPreview />`.

---

### 3.4 NOVA SECTION — "Carteira reformulada" (ENTRE Antes/Depois e ProductPreview)

- **Anchor PNGs**: `carteira-rasgada.webp` + `carteira-organizada.webp` (escolher v3 ou v4 da pasta, ambas valem — CEO indica qual).
- **Conceito**: stack vertical, 2 imagens em sequência. NÃO cross-fade (não vai ler bem mobile). É REVEAL sequencial: rasgada aparece primeiro, scrolla, organizada aparece com headline "depois do Hayzer".
- **Layout desktop**:
  ```
  [ rasgada — 4:3 ]    "antes — carteira do maker"
        ↓ (seta CSS visual)
  [ organizada — 1:1 ] "depois — Hayzer no bolso"
  ```
  Grid 2 colunas (md+): imagem esquerda, headline + bullet pequeno direita. Alterna A/B (rasgada esq / organizada dir).
- **Layout mobile**: stack vertical puro. PNG → headline → PNG → headline.
- **Trigger**: cada bloco `IntersectionObserver` independente, threshold 0.4.
- **Animação CSS**: mesma `.reveal-zoom-fade` da section 3.3 (reutilizar classe).
- **Seta visual**: SVG simples (24px) entre os 2 blocos, cor `hsl(var(--petrol-400) / 0.4)`. Não anima.
- **Aspect ratios fonte**: rasgada 4:3, organizada 1:1.
- **`<picture>` srcset**: ambas em 480w/1080w/1920w webp.
- **Copy overlay** (Carla escreve depois, placeholders):
  - Bloco 1 acima da carteira rasgada: tag "antes" + h3 Fraunces "Tua carteira hoje" + p "papel, dívida, esquecimento. Não é organização — é sobrevivência."
  - Bloco 2 abaixo da carteira organizada: tag "depois" + h3 Fraunces "Tua carteira com Hayzer" + p "R$ 18.730 visíveis. Controle, foco, liberdade — no bolso."
- **prefers-reduced**: idem.
- **Posição DOM**: novo componente `<WalletTransform />` ENTRE `<MakerBeforeAfter />` e `<ProductPreview />`.

---

### 3.5 ProductPreview — TROCAR mockup

- **Anchor PNG**: `produto-laptop.webp` (substitui placeholder `orders-preview.webp` que ainda nem existe).
- **Cleanup**: APAGAR todo o bloco `screenshotExists` + placeholder fallback do `ProductPreview.tsx`. PNG sempre existirá.
- **Aspect ratio fonte**: 3:2 (1200×800).
- **Anotações ember (3 dots) — RECALIBRAR coordenadas pro novo asset**:
  - "Resumo R$ 12.450,00" — `top: 22%`, `left: 38%`, side `right`
  - "23 pedidos · 8/12 produção" — `top: 38%`, `left: 30%`, side `left`
  - "Resumo no celular também" — `top: 60%`, `left: 78%`, side `right`
- **Animação ember dots — INFINITE PULSE**:
  ```css
  @keyframes ember-pulse {
    0%, 100% { box-shadow: 0 0 0 3px hsl(var(--ember-400) / 0.25); }
    50% { box-shadow: 0 0 0 6px hsl(var(--ember-400) / 0.10); }
  }
  .ember-dot { animation: ember-pulse 2.2s ease-in-out infinite; }
  ```
  Stagger via `animation-delay`: dot 1 (0ms), dot 2 (700ms), dot 3 (1400ms). NÃO sincronizado de propósito (mais orgânico).
- **Trigger**: ZERO IO. Pulse inicia no mount. Cards <768px escondem dots (`hidden md:block` no overlay — já existe).
- **Caption**: trocar "Suporte Bambu X1C · PLA Preto..." por "Resumo R$ 12.450 · 23 pedidos · 8/12 em produção · celular sincronizado".
- **Alt**: "Laptop e iPhone exibindo dashboard Hayzer com resumo R$ 12.450,00, 23 pedidos, 8/12 em produção, lateral esquerda com módulos de navegação".
- **`<picture>` srcset**: 480w/1080w/1920w webp. `loading="lazy"`, `decoding="async"`. `priority={false}`.
- **Mobile**: dots seguem `hidden md:block` (já implementado). PNG full-width.
- **prefers-reduced**: pulse para via media query global.

---

### 3.6 WhatsAppFlow — TROCAR SVG mock por PNG real

- **Anchor PNG**: `whats-bagunca.webp` (print real WhatsApp "Pedidos 3D · URGENTE" — maker triste segurando celular ao fundo).
- **Aspect ratio fonte**: 9:16 (450×800 mobile portrait).
- **Layout desktop**: split 2 colunas — PNG esquerda (col-5/12 max 360px width), copy + 3 step-cards direita (col-7/12).
- **Layout mobile**: PNG topo (max-w-[280px] mx-auto), copy + steps abaixo. PNG não pode passar de 60vh ou enterra steps.
- **Trigger**: PNG entra com `.reveal-zoom-fade` (IO threshold 0.3). Step-cards usam `.stagger-children` existente em `globals.css` (3 cards = 0/50/100ms).
- **Headline atual fica**: "Pedido do WhatsApp vira pedido no sistema" — Carla validou.
- **Headline EXTRA acima da imagem**: tag mono Geist 11px "é assim que o teu zap parece HOJE".
- **3 step-cards** (mantém os textos atuais que estão bons):
  - 01 — Cola o número do cliente do WhatsApp
  - 02 — Preenche o pedido. Hayzer calcula filamento e margem
  - 03 — Cliente recebe confirmação. Estoque já baixou
- **Detalhe visual**: borda `1px hsl(var(--petrol-600) / 0.35)` + box-shadow `0 0 0 1px ... 0 20px 56px ...` (já existe no componente atual, mantém).
- **`<picture>` srcset**: 480w/720w/1080w (mais conservador, é vertical).
- **Alt**: "Maker exausto segurando celular com conversa do WhatsApp 'Pedidos 3D URGENTE', várias mensagens não respondidas, papéis e impressora 3D ao fundo".
- **prefers-reduced**: reveal cancela, steps aparecem instantâneo.

---

### 3.7 NOVA SECTION — "Quem confia" (DEPOIS de WhatsAppFlow)

- **Anchor PNGs**: `cliente-mulher-mestre.webp` + `cliente-mulher-clean.webp` (2 variantes da MESMA cena: maker mulher entregando peça pra cliente, neon "crie. imprima. realize." ao fundo + sacola HAYZER + laptop "Obrigado!").
- **Conceito**: diversifica persona (público maker BR tem várias mulheres makers — não é só "homem barbudo na bancada"). Prova social visual.
- **Layout**: scroll-snap horizontal CSS puro (mobile-first, zero JS).
- **Mobile (<768px)**:
  ```html
  <div class="carousel-snap flex snap-x snap-mandatory overflow-x-auto gap-4 px-6 pb-4">
    <figure class="snap-center shrink-0 w-[85vw] max-w-[420px]">
      <img src="..." />
      <figcaption>...</figcaption>
    </figure>
    <figure class="snap-center shrink-0 w-[85vw] max-w-[420px]">...</figure>
  </div>
  ```
- **Desktop (md+)**: grid 2 colunas, ambas visíveis lado a lado (sem snap).
- **Trigger**: section inteira com `.reveal-zoom-fade` (IO 0.25).
- **Headline Fraunces 500 clamp 2.4rem→3.5rem**: "Quem usa, entrega melhor." (placeholder Carla refina)
- **Caption por imagem (Geist Mono 12.5px)**:
  - cliente-mulher-mestre: "loja maker · entrega presencial · pedido fechado pelo Hayzer"
  - cliente-mulher-clean: "OBRIGADA, PEÇA PERFEITA · confirmação automática"
- **Aspect ratio fonte**: ambas 3:2.
- **`<picture>` srcset**: 480w/1080w/1920w.
- **Alt**: "Maker mulher entregando peça preta impressa em 3D pra cliente sorridente, sacola HAYZER ao lado, laptop com mensagem 'Obrigado!' do Hayzer, neon verde 'crie. imprima. realize.' ao fundo".
- **Indicador snap mobile**: 2 dots embaixo do scroll (CSS `::after`, cor `hsl(var(--fog-400))`). Não anima.
- **Posição DOM**: novo `<CustomerProof />` DEPOIS de `<WhatsAppFlow />` e ANTES de `<WhyDifferent />`.
- **prefers-reduced**: reveal cancela. Snap continua funcionando (não é animação, é layout).

---

### 3.8 Features, WhyDifferent, FinalCTA — NÃO MEXER

Já estão lazy via dynamic. Risco de regressão zero. Felipe NÃO toca.

---

## 4. Ordem do DOM final em `app/page.tsx`

```tsx
<Header />
<Hero waitlistCount={...} />            {/* 3.1 — sem mudança */}
<PrinterShowcase />                      {/* 3.2 — troca PNG */}
<MakerBeforeAfter />                     {/* 3.3 — NOVO */}
<WalletTransform />                      {/* 3.4 — NOVO */}
<ProductPreview />                       {/* 3.5 — troca PNG + dots pulse */}
<Features />                             {/* 3.8 — sem mudança */}
<WhatsAppFlow />                         {/* 3.6 — troca SVG por PNG */}
<CustomerProof />                        {/* 3.7 — NOVO */}
<WhyDifferent />                         {/* 3.8 — sem mudança */}
<FinalCTA />                             {/* 3.8 — sem mudança */}
<Footer />
```

---

## 5. Handoff Felipe — ordem de PRs (1 commit por section)

| # | Branch | Component(es) | Asset(s) que precisa estar em `public/landing/v3/` antes |
|---|---|---|---|
| 1 | `feat/landing-v3-prefers-reduced-motion` | `app/globals.css` (bloco final) | nenhum |
| 2 | `feat/landing-v3-printer-showcase` | `components/landing/PrinterShowcase.tsx` | `timelapse-impressora-{480,1080,1920}.webp` |
| 3 | `feat/landing-v3-maker-before-after` | NOVO `MakerBeforeAfter.tsx` + hook `useRevealOnScroll.ts` + `app/page.tsx` import | `maker-antes-depois-{480,1080,1920}.webp` |
| 4 | `feat/landing-v3-wallet-transform` | NOVO `WalletTransform.tsx` + `app/page.tsx` import | `carteira-rasgada-{480,1080,1920}.webp` + `carteira-organizada-{480,1080,1920}.webp` |
| 5 | `feat/landing-v3-product-preview-pulse` | `components/landing/ProductPreview.tsx` + `app/globals.css` (keyframe ember-pulse) | `produto-laptop-{480,1080,1920}.webp` |
| 6 | `feat/landing-v3-whatsapp-real` | `components/landing/WhatsAppFlow.tsx` | `whats-bagunca-{480,720,1080}.webp` |
| 7 | `feat/landing-v3-customer-proof` | NOVO `CustomerProof.tsx` + `app/page.tsx` import | `cliente-mulher-mestre-{480,1080,1920}.webp` + `cliente-mulher-clean-{480,1080,1920}.webp` |

**Pré-requisito Bruna**: rodar `npm run optimize:webp` (ou squoosh manual) nos 12 PNGs → gerar 3 variants webp cada → commit em `public/landing/v3/`. Bruna avisa quando pronto.

---

## 6. Estimativa ganho TBT vs v1

| Métrica | v1 (SVG carteira CSS) | v2 (PNGs + reveal CSS) |
|---|---|---|
| JS adicionado | ~1.8KB (IO hook + classe motion novo) | ~0.8KB (`useRevealOnScroll` hook + classes CSS puras) |
| CSS adicionado | ~3KB (SVG inline carteira + 4 keyframes) | ~1.2KB (3 keyframes + 1 utility class) |
| Image weight first paint | 0KB (era SVG) | 0KB (PNGs todos `loading="lazy"` exceto printer já lazy) |
| TBT delta esperado | ~-1.8s (com Bruna fix) | **~-2.0s** (menos JS, sem framer-motion novo) |
| LCP delta | neutro | neutro (asset Hero não muda) |

**Resultado**: v2 é IGUAL OU MELHOR que v1 em perf, com asset visualmente 10× mais rico (PNG cinematic vs SVG vetor).

---

## 7. Auditoria anti-IA

- [x] Sem gradiente roxo (paleta petrol/ember/fog/night)
- [x] Sem cantos arredondados absurdos (max `rounded-[14px]`)
- [x] Sem layout centralizado clichê (split asymmetric mantido)
- [x] Sem stock photo (todos PNGs são CEO + IA + Photoshop, anti-IA real)
- [x] Tipografia editorial (Fraunces hero + Geist Sans corpo + Geist Mono caption)
- [x] Animação ≤700ms ease-out (nada de bounce, spring, scale exagerado)
- [x] Microinterações sutis (ember pulse 2.2s lento, não "marketing")
- [x] Mobile-first em TODAS as novas sections

---

## 8. Resumo digest matinal CEO

```
[diego · spec animations landing v2 · 2026-05-21]

> 12 PNGs cinemáticos virou ÂNCORA da nova landing v3.
> 3 sections NOVAS: Antes/Depois maker, Carteira (rasgada→organizada), Quem Confia (mulheres maker).
> 3 sections TROCAM ANCHOR: PrinterShowcase (timelapse), ProductPreview (laptop+iPhone), WhatsAppFlow (print real).
> Hero NÃO MUDA (proteção TBT).
> 7 PRs sequenciais p/ Felipe, 1 por section. Bruna libera webp variants antes.
> Perf esperado: TBT igual ou MELHOR que v1, CSS-first puro, framer-motion intacto onde já lazy.
> Pendência: confirmar Hero migrou de `motion` → `LazyMotion + m.*` (CLAUDE.md diz sim, arquivo diz não).
> Carla refina copy das 3 sections novas em paralelo.

doc: brand/animations-landing-spec-v2-2026-05-21.md
```
