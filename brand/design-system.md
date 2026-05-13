# BVaz Hub — Design System

> Tokens vivos. Fonte da verdade para Diego (designer) e Felipe (frontend).
> Versão 1.0 · 13/05/2026

---

## 🎨 Cores

### Decisão pendente — 2 paletas em A/B

#### Paleta A — Tech minimalista
```css
--background:        #0A0A0A;    /* preto grafite */
--foreground:        #FAFAFA;    /* branco gelo */
--accent:            #10B981;    /* verde tech */
--accent-foreground: #FFFFFF;
--muted:             #18181B;
--muted-foreground:  #A1A1AA;
--border:            #27272A;
--ring:              #10B981;
```

#### Paleta B — Premium escuro
```css
--background:        #18181B;    /* cinza escuro */
--foreground:        #FAFAFA;    /* branco gelo */
--accent:            #1E40AF;    /* azul profundo */
--accent-foreground: #FFFFFF;
--muted:             #27272A;
--muted-foreground:  #A1A1AA;
--border:            #3F3F46;
--ring:              #1E40AF;
```

### Cores BANIDAS
- ❌ Roxo IA (`#8B5CF6`, gradiente purple→pink)
- ❌ Neon exagerado
- ❌ Vibe crypto (verde fluorescente sobre preto puro)
- ❌ Saturação alta sem propósito
- ❌ Azul corporativo genérico (`#2563EB` puro)

---

## 🔤 Tipografia

### Famílias
```css
--font-sans: 'Geist', 'Inter', system-ui, sans-serif;
--font-mono: 'Geist Mono', 'JetBrains Mono', ui-monospace, monospace;
```

### Escala (clamp para responsividade)
```css
--text-xs:   clamp(0.75rem, 0.7rem + 0.1vw, 0.875rem);   /* 12-14px */
--text-sm:   clamp(0.875rem, 0.8rem + 0.1vw, 1rem);      /* 14-16px */
--text-base: clamp(1rem, 0.95rem + 0.2vw, 1.125rem);     /* 16-18px */
--text-lg:   clamp(1.25rem, 1.15rem + 0.3vw, 1.5rem);    /* 20-24px */
--text-xl:   clamp(1.5rem, 1.3rem + 0.5vw, 1.875rem);    /* 24-30px */
--text-2xl:  clamp(1.875rem, 1.6rem + 0.8vw, 2.5rem);    /* 30-40px */
--text-3xl:  clamp(2.25rem, 1.9rem + 1.2vw, 3.5rem);     /* 36-56px */
--text-hero: clamp(3rem, 2.5rem + 2vw, 5rem);            /* 48-80px hero */
```

### Pesos
- **400** — body, descritivo
- **500** — buttons, labels
- **600** — headings nível 2-3
- **700** — h1, hero
- **800** — display gigante (raro)

### Hierarquia (máx 4 níveis por página)
```
H1 → text-hero, weight 700, tracking-tight
H2 → text-3xl, weight 700, tracking-tight
H3 → text-xl, weight 600
Body → text-base, weight 400, leading-relaxed (1.625)
```

### Regras
- **Line-height**: títulos `1.1-1.2`, corpo `1.625`
- **Letter-spacing**: títulos `-0.02em` (tight), corpo `0`
- **Max-width corpo**: `65ch` pra legibilidade

---

## 📏 Espaçamento (sistema 4)

```css
--space-0:  0;
--space-1:  0.25rem;   /* 4px */
--space-2:  0.5rem;    /* 8px */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-24: 6rem;      /* 96px */
--space-32: 8rem;      /* 128px */
```

### Uso
- **Dentro componente**: 4, 8, 12, 16
- **Entre componentes**: 24, 32
- **Entre seções**: 48, 64, 96
- **Hero section**: 96, 128

---

## 🌟 Sombras (sutis, premium)

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow:    0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-glow: 0 0 60px -20px var(--accent);  /* premium glow no accent */
```

### Regras
- Botão primário: `shadow` em hover (não default)
- Card: `shadow-md` em hover
- Modal: `shadow-lg`
- Glow no accent: usar com moderação (hero CTA, feature destacada)

---

## ⏱️ Animação

```css
--duration-fast:   150ms;
--duration-base:   250ms;
--duration-slow:   400ms;
--duration-slowest: 700ms;

--ease-default: cubic-bezier(0.4, 0, 0.2, 1);   /* default tailwind */
--ease-out:     cubic-bezier(0.16, 1, 0.3, 1);  /* smooth out */
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);  /* leve overshoot */
```

### Regras
- **Microinteração**: 150ms `ease-default`
- **Hover/foco**: 250ms `ease-out`
- **Modal/sheet entrada**: 400ms `ease-out`
- **Página enter**: 700ms `ease-out` máx (não atrasa user)
- **Bias against**: animação acima de 1000ms é exibicionismo
- **Respect**: `prefers-reduced-motion` — desliga ou reduz

---

## 🔘 Border radius

```css
--radius-sm: 0.25rem;  /* 4px - input pequeno */
--radius:    0.5rem;   /* 8px - botão, card padrão */
--radius-md: 0.75rem;  /* 12px - card destacado */
--radius-lg: 1rem;     /* 16px - modal */
--radius-full: 9999px; /* pill */
```

### Regras
- **Não use cantos super arredondados** (mais de 16px em card) — vira IA-look
- **Botão**: `radius` (8px) default; pill só pra micro pill (badge)
- **Imagem hero**: `radius` ou `radius-md`

---

## 🎯 Z-index (escala definida)

```css
--z-base:     0;
--z-dropdown: 10;
--z-sticky:   20;
--z-overlay:  30;
--z-modal:    40;
--z-popover:  50;
--z-tooltip:  60;
--z-toast:    70;
```

---

## 📱 Breakpoints (mobile-first)

```css
/* Tailwind padrão — não custom */
sm:  640px   /* small tablet */
md:  768px   /* tablet */
lg:  1024px  /* desktop */
xl:  1280px  /* large desktop */
2xl: 1536px  /* extra large */
```

### Regras
- **Mobile-first**: classe base = 320-768px; `md:` = ≥768px
- **Hero**: testar especialmente em 360px (Android comum)
- **Tabelas**: virar lista vertical em mobile

---

## 🎨 Componentes visuais (princípios)

### Botão (estados)
- Default: cor accent, weight 500, padding 12/24
- Hover: shadow + leve scale (`scale-[1.02]`)
- Active: scale (`scale-[0.98]`) + duração 100ms
- Disabled: opacity 50, cursor not-allowed, sem hover
- Loading: spinner + texto desaparece

### Input
- Default: border muted, bg background, foreground
- Focus: ring accent (2px), border accent
- Error: border red-500 + texto erro abaixo

### Card
- Bg: bg ligeiramente claro que background
- Padding: 24
- Hover (se clicável): scale 1.01 + shadow-md

---

## ✅ Checklist anti-IA (Diego aplica em toda criação)

- [ ] Sem gradiente roxo→rosa
- [ ] Sem layout 100% centralizado todas seções
- [ ] Sem cantos arredondados acima de 16px
- [ ] Sem 3 cards iguais lado a lado por padrão
- [ ] Sem ícone genérico em todo "feature"
- [ ] Tipografia escolhida (Geist), não default sans-serif
- [ ] Espaçamento intencional (sistema 4), não arbitrário
- [ ] Animação tem propósito (≤300ms, ease-out)
- [ ] Dark mode pensado (não derivado), bem testado
- [ ] Mobile pensado (não desktop encolhido)

---

## 🛠️ Stack que usamos

| Camada | Ferramenta |
|---|---|
| **CSS** | Tailwind 4 |
| **Componentes app** | shadcn/ui |
| **Componentes marketing** | Aceternity UI + Magic UI |
| **Animação** | Framer Motion |
| **Tipografia** | Geist Sans + Geist Mono (via Next/font) |
| **Ícones** | Lucide React |

---

## 🔁 Como atualizar este arquivo

- Use `/brand:update` skill
- Quando muda token, atualiza data + nota o que mudou abaixo
- Mudança grande (paleta principal) → ADR em `decisions/`

### Histórico
- **v1.0** (13/05/2026): criação inicial baseada em brand/BRIEF.md
