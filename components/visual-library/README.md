# visual-library — Design System Hayzer

Componentes decorativos e utilitarios da identidade visual Hayzer.
Paleta: night + petrol + ember. Tipografia: Fraunces (display) + Geist (corpo).

Todos sao Client Components (`'use client'`) por usarem Framer Motion ou refs DOM.

---

## Tabela de componentes

| Componente | Arquivo | Props principais | Quando usar |
|---|---|---|---|
| `TapeBadge` | `TapeBadge.tsx` | `tone`, `size`, `rotate` | Labels de status rotacionados (INTERNO, BETA, WIP) |
| `UnderlineMarker` | `UnderlineMarker.tsx` | `tone`, `markerStyle`, `offset` | Destaque de palavras em headlines |
| `HighlightedText` | `HighlightedText.tsx` | `tone`, `size` | Fundo marca-texto em termos-chave |
| `Stamp` | `Stamp.tsx` | `tone`, `size`, `rotate` | Carimbo circular (APROVADO, BETA, OK) |
| `GrainOverlay` | `GrainOverlay.tsx` | `intensity`, `zIndex` | Textura grainy sobre sections/paginas |
| `GlowPetrol` | `GlowPetrol.tsx` | `tone`, `size`, `opacity` | Blob de luz no fundo de sections escuras |
| `RootSvg` | `RootSvg.tsx` | `tone`, `size`, `duration`, `static` | SVG animado das raizes do logo Hayzer |
| `LottiePlayer` | `LottiePlayer.tsx` | `animationData`, `loop`, `autoplay` | Animacoes .json de public/assets/lottie/ |
| `VideoBackground` | `VideoBackground.tsx` | `srcMp4`, `srcWebm`, `poster`, `opacity` | Video em loop no fundo de sections |

---

## Guia rapido

### TapeBadge

```tsx
import { TapeBadge } from '@/components/visual-library'

// Simples
<TapeBadge>INTERNO</TapeBadge>

// Com tom petrol e tamanho grande
<TapeBadge tone="petrol" size="lg" rotate={-6}>BETA</TapeBadge>
```

**Tons:** `ember` (padrao, dourado quente) | `petrol` (verde-petroleo) | `neutral` (fog)
**Sizes:** `sm` (10px) | `md` (12px, padrao) | `lg` (14px)

---

### UnderlineMarker

```tsx
import { UnderlineMarker } from '@/components/visual-library'

<h1>
  Seu negocio, sem <UnderlineMarker>caos</UnderlineMarker>.
</h1>

// Solido petrol
<UnderlineMarker tone="petrol" markerStyle="solid">gestao real</UnderlineMarker>
```

**markerStyle:** `wavy` (padrao) | `solid` | `dashed`

---

### HighlightedText

```tsx
import { HighlightedText } from '@/components/visual-library'

<p>
  Economize <HighlightedText>30 minutos por dia</HighlightedText> de planilha.
</p>
```

---

### Stamp

```tsx
import { Stamp } from '@/components/visual-library'

<div className="relative">
  <Stamp size="lg" aria-label="Produto aprovado">APROVADO</Stamp>
</div>
```

---

### GrainOverlay

```tsx
import { GrainOverlay } from '@/components/visual-library'

// No layout raiz ou numa section especifica
<GrainOverlay intensity="normal" zIndex={50} />
```

Ja existe `.grain` em `globals.css` na landing. Use `GrainOverlay` em paginas internas.

---

### GlowPetrol

```tsx
import { GlowPetrol } from '@/components/visual-library'

<section className="relative overflow-hidden">
  <GlowPetrol tone="petrol" size="lg" className="-top-32 -left-24" opacity={0.25} />
  {/* conteudo */}
</section>
```

O pai precisa de `position: relative` e `overflow-hidden`.

---

### RootSvg

```tsx
import { RootSvg } from '@/components/visual-library'

// Animado (padrao)
<RootSvg size="md" tone="petrol" />

// Estatico (sem animacao)
<RootSvg size="sm" static aria-label="Simbolo raizes Hayzer" />
```

---

### LottiePlayer

```tsx
import { LottiePlayer } from '@/components/visual-library'
import loaderAnim from '@/public/assets/lottie/loader-dots.json'

<LottiePlayer
  animationData={loaderAnim}
  loop
  autoplay
  className="w-16 h-16"
  aria-label="Carregando"
/>
```

Assets em `public/assets/lottie/`. Veja `public/assets/README.md` para convencoes de naming.

---

### VideoBackground

```tsx
import { VideoBackground } from '@/components/visual-library'

<section className="relative overflow-hidden h-screen">
  <VideoBackground
    srcWebm="/assets/videos/hero-roots-1080p.webm"
    srcMp4="/assets/videos/hero-roots-1080p.mp4"
    poster="/assets/png/hero-poster.png"
    opacity={0.4}
    aria-label="Video decorativo de raizes crescendo"
  />
  {/* conteudo sobre o video */}
</section>
```

O pai precisa de `position: relative`, `overflow: hidden` e altura definida.

---

## Regras de uso

1. Sempre importar via barrel: `from '@/components/visual-library'`
2. Nunca adicionar logica de negocio aqui (apenas visual)
3. `GrainOverlay` e `GlowPetrol` sao `aria-hidden` por padrao (decorativos)
4. Todo elemento com texto precisa ter contraste AA (4.5:1) no fundo que for usado
5. Para tokens de cor em `style={}`, sempre referenciar os tokens HSL de `globals.css`

## Relacionados

- `public/assets/README.md` — convencoes de assets (videos, lottie, png, svg)
- `app/globals.css` — tokens HSL da paleta Hayzer
- `app/library/page.tsx` — showcase vivo de todos os componentes
- `brand/BRIEF.md` — identidade visual completa
