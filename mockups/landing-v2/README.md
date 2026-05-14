# Landing v2 — Mockups (2026-05-14)

Resposta direta ao feedback do CEO: "tá genérica, com ar de IA, muito escura".

Dois mockups HTML standalone foram criados como direções visuais ANTES de tocar no código real do Next.js. Compara, escolhe, aí implementa.

**Como abrir:** `npm run dev` + acessar:
- http://localhost:3001/mockups/option-a-light-warm.html
- http://localhost:3001/mockups/option-b-dark-grain.html

(rota `/mockups/*` foi adicionada temporariamente em `middleware.ts` PUBLIC_PATHS)

---

## Option A — Light Warm

**Paleta:** Creme (#FBF8F2) + Ink quase-preto (#0F1410) + Moss verde-musgo + Amber âmbar
**Tipografia:** Fraunces (serif editorial) pro h1 e headings + Geist sans pro body + Geist Mono pra tags
**Background:** Gradient ambient warm (moss + amber diluídos no creme) + noise grain leve (opacity 0.35)
**Layout do hero:** Split assimétrico — logo+headline esquerda (col 7), form em "carta" direita (col 5)
**Detalhes anti-IA:**
- Marker handmade laranja no "caos" (efeito marca-texto)
- Sticker "ACESSO ANTECIPADO" rotacionado 6° no canto do form
- Number stamps "01 — estoque" em font-mono
- "Construído para" com bullets verde-musgo (impressão 3D · loja de bairro · serviço sob demanda)
- Watermark gigante "feito no brasil." no footer (200px Fraunces serif)
- Feature card 4 destacada em moss-50 (assimetria de peso)

**Ponto forte:** Atende exatamente o feedback ("gostei do branco"). Editorial, "feito à mão", acolhedor pro Rafael (target persona). Fraunces serif dá alma. Vibe Substack + Stripe deslogado + Linear marketing.

**Ponto fraco:** Mais polarizador. Vendedores de software brasileiros raramente usam serif — quem chegar esperando dashboard tech pode estranhar. Mas isso é exatamente o que faz a marca destacar.

**Tempo estimado de implementação no Next.js real:** 4-6h (criar `Logo` component, refatorar `Hero.tsx` em layout 2-col, criar feature cards assimétricos, ajustar Header com nav, adicionar Fraunces no layout root + font config).

---

## Option B — Dark Grain

**Paleta:** Night quase-preto (#07090A → #0B0E10) + Fog off-white (#F2EFEA) + Petrol verde-petróleo + Ember âmbar acento
**Tipografia:** Geist sans (h1 GIGANTE até 120px com gradient branco→cinza) + Instrument Serif italic pros accents ("sem caos", "conta certo", "dinheiro real")
**Background:** Ambient verde-petróleo (3 radial gradients) + vinheta nas bordas + grain forte (opacity 0.45 com mix-blend-mode screen)
**Layout do hero:** Centralizado puro (estilo Zero/mockup 1) — logo gigante central, h1 abaixo, form inline embaixo, "1 dev · 1 designer · sem VC" no rodapé do hero
**Detalhes anti-IA:**
- Logo "B" 96-112px central com pulse-glow verde-petróleo (4.5s ease-in-out)
- Pixel art icons (rect SVG sem antialiasing, image-rendering: pixelated)
- Instrument Serif italic em palavras-chave (verde-petróleo) — anti-tech-frio
- Bento asymmetric (col 4/2/2/4) nas features
- "construído por gente real, no Brasil" + "1 dev · 1 designer · sem VC" — humaniza
- Watermark "BVAZ HUB." gigante no footer (220px)

**Ponto forte:** Mantém vibe premium escuro mas com ALMA real (grain forte + glow + pulse). Verde-petróleo foge do azul corporativo. Vibe Zero (mockup 1 que CEO aprovou) capturada literalmente. Pixel art icons são detalhe que diferencia.

**Ponto fraco:** CEO reclamou que landing atual está "muito escura". B continua escuro, mesmo com personalidade. Risco: ele rejeitar pelo fato de ser dark.

**Tempo estimado de implementação no Next.js real:** 5-7h (mesmo de A + lidar com SVG inline pra grain + pixel icons + pulse animation Framer Motion).

---

## Recomendação do Diego (designer sênior)

**Vai de A (Light Warm).**

Três razões:

1. **CEO expressou preferência literal por branco** — design não é exercício de teimosia. Se ele pediu mais claro e mostrou que gostou do mockup 4 (branco), respeitar.

2. **Persona Rafael** (dono de loja 3D, brasileiro não-tech profundo): dark mode lê como "ferramenta de programador". Light mode lê como "ferramenta que entende meu negócio". Diferença emocional importa pra conversão da waitlist.

3. **Anti-IA real**: A tem MAIS sinais de "feito por pessoa" — serif italic, marker handmade no "caos", sticker rotacionado, watermark serif gigante no rodapé. B é mais "indie tech studio" (válido mas mais nichado).

Se você abrir A no Chrome e sentir que falta peso/premium, mexemos no peso da Fraunces (subir pra 700) e adicionamos mais um detalhe (talvez um glow tênue moss no canto do hero). Mas comece por A.

---

## Falta entregar

- `option-c-hybrid-bento.html` — esse não saiu antes do limit de API. Se quiser ver, peça e gera depois.
- Mobile preview de cada (testei só desktop 1440x900).
- Versão tablet (768-1024).

---

## Antes de implementar a vencedora no código real

1. Confirmar escolha A ou B
2. Adicionar font (Fraunces ou Instrument Serif) no `app/layout.tsx`
3. Refatorar `Hero.tsx` (split A ou centered B)
4. Criar `components/landing/Logo.tsx` decente (vira identidade, não item de header)
5. Adicionar grain SVG inline via `globals.css` ou componente `<Grain />`
6. Criar feature cards com layout assimétrico (substituir grid 2x2 atual)
7. Remover `/mockups` do PUBLIC_PATHS no middleware antes do commit final
8. Apagar pasta `public/mockups/` antes do deploy de prod (ou adicionar no .gitignore)

---

## Arquivos

- `option-a-light-warm.html` — 576 linhas, 28KB, standalone
- `option-b-dark-grain.html` — 622 linhas, 28KB, standalone
- `README.md` — este arquivo

Diego (designer) · 2026-05-14
