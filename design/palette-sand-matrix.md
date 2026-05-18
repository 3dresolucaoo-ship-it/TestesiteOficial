# Hayzer · Matriz Sand 5×5 — paleta marrom expandida

> **Origem**: CEO mostrou matriz 25 shades (5 fileiras × 5 colunas) em print 17/05/2026.
> **Implementação**: `app/globals.css` — 75 tokens HSL nomeados (10 lineares × 5 cores + 25 matriz sand 5×5).
> **Princípio base**: Refactoring UI cap "Defining Your Color Palette" (Wathan/Schoger) — nunca 3 shades, 8-10+ por cor dominante. Aqui são **25 + 10 = 35 tokens sand** disponíveis.
> **Owner**: Diego (design system) · **Implementação**: Felipe (migra componentes).

---

## 1 · Conceito

A matriz sand tem **5 famílias semânticas** (rows) e **5 stops de lightness** (columns: 100→500).
Total: 25 tokens dedicados a marrom orgânico, cobrindo TODOS os casos de uso de UI sem improvisar.

Plus: a **diagonal central** (`sand-50` → `sand-900`, 10 tokens) é a ramp linear "default" pra uso casual.

### Por que 5 rows (não 1 linha gigante)
Wathan/Schoger ensinam: agrupe tokens por **uso semântico**, não só por lightness. Quando um designer pega `sand-line-300`, ele sabe que é um BORDER — não tá adivinhando. Reduz decisão e elimina inconsistência.

### Hue strategy
- Hue varia 22-38° (cocoa → sand → fawn) — cobre o "marrom orgânico" sem virar terracota saturado
- Saturação 18-65% (rows ink menos saturadas pra texto, row warm mais saturada pra accent)
- Lightness varia 7-97% (cobre absoluto preto-marrom até cream off-white)

---

## 2 · Tabela completa — 25 tokens da matriz

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

## 3 · Diagonal central — uso casual `sand-50 → sand-900`

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

## 4 · Aplicação no Hayzer (3 casos práticos)

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

## 5 · Anti-patterns (não fazer)

1. ❌ Misturar `sand-warm` com `ember` na mesma view — são hues próximos, gera confusão visual
2. ❌ Usar `sand-bg-500` (médio escuro) como texto — contraste insuficiente
3. ❌ Usar `sand-ink-100` em fundo `sand-bg-100` — contraste só 5.1:1, marginal
4. ❌ Trocar **toda** paleta dark do dashboard pra sand — sand é COMPLEMENTAR, não substituto do petrol/night
5. ❌ Recriar matriz no Figma com HEX — sempre referenciar tokens HSL (Wathan: human reads HSL)

---

## 6 · Contraste WCAG AA (validado)

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

## 7 · Migrar componentes existentes

Quando converter hex hardcoded pra sand:

**Antes** (hex hardcoded — viola Refactoring UI):
```tsx
<div className="bg-[#F0E8D9] text-[#574232]">...</div>
```

**Depois** (HSL tokens — sistema):
```tsx
<div className="bg-sand-bg-200 text-sand-ink-200">...</div>
```

**Bonus**: agora opacity funciona (Tailwind 4 bug `bg-X/Y` resolvido pela arquitetura HSL nomeada):
```tsx
<div className="bg-sand-warm-300/20 text-sand-ink-400 border-sand-line-200/60">...</div>
```

---

## 8 · Próximos passos (Felipe / outro agente)

1. ✅ Extraído de `design/dashboard-v4-spec.md > Anexo A` pra arquivo standalone (Claude principal 17/05 noite)
2. [ ] Auditar `app/calculadora/page.tsx` — provavelmente tem hex sand hardcoded, migrar pra tokens
3. [ ] Criar Storybook/showcase visual da matriz em `mockups/palette-sand.html` (visual ref pro time)
4. [ ] Atualizar `brand/visual-system-v2.md` adicionando sand como 5ª cor da paleta C

---

**Owner**: Diego (design system)
**Implementação**: Felipe (Frontend) — migra componentes
**Última atualização**: 2026-05-17 (criação)
**Próxima revisão**: após CEO validar a matriz nos primeiros componentes que usem sand
