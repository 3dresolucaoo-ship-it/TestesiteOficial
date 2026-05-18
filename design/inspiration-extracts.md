# Inspiration Extracts · Diego Designer · 2026-05-18

> Audit visual de 7 sites de referência (designspells.com, mobbin.com, godly.website, designvault.io, awwwards.com, lapa.ninja, screensdesign.com).
> Extraí 15 elementos visuais únicos que fazem sentido pro Hayzer (tom petrol+ember+orgânico, vibe maker BR).
> Cada elemento vira componente em `components/visual-library/` (ver `design/visual-library-catalog.md` pra spec técnica).
>
> Stack: HTML/CSS puro + Tailwind 4 + SVG inline. ZERO dependência externa.

---

## Resumo executivo

A landing v2 do Hayzer (hayzer.com.br) tem identidade rica e hand-crafted: grain SVG, Fraunces editorial, marker ember, glow petrol, tape badge "ACESSO ANTECIPADO". O dashboard V4 perdeu metade disso ao virar React (ficou flat).

A solução não é refazer cada módulo, e sim criar uma **visual library** de 10-12 componentes globais que carreguem o tom novo, e puxar pra dentro dos módulos legados (orders, finance, inventory, etc) via `<TapeBadge />`, `<Stamp />`, `<MarkerUnderline />`.

Sites estudados confirmam a direção: a virada 2026 em SaaS é "calm + emotional + personality" (saasframe, saasui, designstudiouiux). Quem quebra a regra "B2B precisa ser funcional e frio" tá ganhando retenção.

---

## 15 elementos extraídos

### 1. Tape Badge rotated (washi tape estilo scrapbook)

- **Fonte**: godly.website + lapa.ninja (várias landings premium 2025-2026 usam isso pra badge "NEW", "BETA", "SOLD OUT")
- **Descrição visual**: retângulo curto (60-80px largura, 18-22px altura) com rotação `-3deg a 6deg`, fundo cor sólida (ember `#D08A4A` no Hayzer), texto Geist Mono uppercase 11-13px tracking 0.10em. Box-shadow externo soft + inset top highlight 0.25 alpha branco pra simular brilho do papel.
- **Onde no Hayzer**: status crítico em /orders ("ATRASADO", "URGENTE"), badge novidade em /catalogs ("NOVO"), warning em /finance ("PAGAR HOJE"). Já uso "ACESSO ANTECIPADO" na landing — mesmo padrão.
- **Variante Hayzer**: além de `ember` (warning/urgência), criar `petrol` pra sucesso ("PAGO") e `neutral` pra info ("REVISAR"). Rotação alterna sentido por instância pra evitar repetição mecânica (`-3deg`, `+4deg`, `-2deg`).

### 2. Marker handmade underline (marca-texto âmbar)

- **Fonte**: codepen "Hand-drawn underline effect" (CodeMyUI) + ishadeed.com "Custom Underlines with SVG"
- **Descrição visual**: gradient linear horizontal embaixo da palavra: `transparent 0-62% → ember-500/0.55 62-92% → transparent 92-100%`. Padding 0 0.05em. Cria efeito marca-texto destacando palavra-chave dentro do parágrafo. Já uso em `.marker` no globals.css da landing.
- **Onde no Hayzer**: palavras-chave em headings de módulos. Ex: em /orders, headline "8 pedidos pra entregar essa semana, 3 [atrasaram]" — "atrasaram" com marker ember. Em /finance: "[R$ 12.480] entrou esse mês" — valor com marker petrol.
- **Variante Hayzer**: além de `ember` (chamada de atenção), `petrol` (positivo) e `wavy-svg` (curva irregular, mais hand-drawn — usar pra microcopy mais editorial).

### 3. Stamp circular "PAGO / ENVIADO / PRODUZINDO" (carimbo decorado)

- **Fonte**: mobbin.com (collections de Receipts/Invoices apps premium), godly.website (sites de produto físico-digital)
- **Descrição visual**: círculo 64-88px diâmetro, 2px solid border ember-400, fundo transparente, texto Geist Mono 700 weight 11-14px uppercase tracking 0.16em rotated `-8deg`. Dupla borda concêntrica (border principal + outline 4-6px gap). Glow externo sutil ember `0 0 12px ember-500/0.30`.
- **Onde no Hayzer**: linha de pedido em /orders (canto direito), invoice em /finance, "RECOMPRA" em /crm. Stamp não substitui badge — coexiste pra status forte/celebratório.
- **Variante Hayzer**: 5 status core — PAGO (petrol), ENVIADO (petrol-300), PRODUZINDO (ember-400 com dot pulsante), ATRASADO (red soft, único uso de #E07A5F), CANCELADO (fog-400 dessaturado). Variant `size` sm (48px) / md (72px) / lg (96px).

### 4. Hand-drawn arrow (seta curva irregular)

- **Fonte**: designspells.com (gallery de "easter eggs" em onboarding), awwwards handmade collection, godly.website 2025
- **Descrição visual**: SVG path com curva Bézier irregular (Q comando), terminação com triangulo ou seta aberta. Stroke 1.5-2px ember-400, opacity 0.85. Tamanho ~80-140px largura. Pode ter pequeno tremor (`stroke-dasharray` solto). Sensação "rabiscado a caneta sobre o app".
- **Onde no Hayzer**: empty states (de "+ Novo pedido" apontando pro botão), tooltip onboarding (primeira vez na tela), seta entre dois cards relacionados em /metrics.
- **Variante Hayzer**: direções (right, down, up-curve), tons (ember default, petrol pra positivo), animação stroke-dashoffset que "desenha" no hover/load (180ms ease-out).

### 5. Asterisk Note (asterisco footnote handwritten)

- **Fonte**: designspells.com (notas em micro-interações editoriais), lapa.ninja (landings premium), Refactoring UI principles
- **Descrição visual**: pequeno asterisco SVG (★ ou * decorado) inline ao final de uma palavra/número, abrindo footnote no final do bloco. Asterisco em Fraunces italic ember-400 superscript 0.7em. Footnote: Geist 12-13px fog-400 italic com `*` no início (`* total inclui frete grátis acima de R$ 300`).
- **Onde no Hayzer**: valores que precisam contexto sem poluir KPI (ex: "R$ 12.480*" → "* não inclui custos operacionais"), metas que têm exceção, microcopy editorial em /metrics.
- **Variante Hayzer**: numerada (¹ ² ³) pra múltiplas notes no mesmo bloco, ou color-coded (ember = atenção, petrol = info técnica).

### 6. Margin Note (nota à margem caderno)

- **Fonte**: godly.website + awwwards (sites editoriais premium tipo It's Nice That), designspells
- **Descrição visual**: bloco fora do grid principal, posicionado absoluto à esquerda ou direita do parágrafo, com largura 140-180px. Texto Fraunces italic 13-14px fog-200 alinhado pro lado oposto do conteúdo. Border-left 1px ember-500/0.5 (3px de padding-left). Vibe "anotação à caneta na margem".
- **Onde no Hayzer**: dica do maker em /products ("dica: use esse SKU pro Bambu Lab X1"), explicação de KPI em /metrics ("Margem inclui custo de filamento + tempo + energia"), avisos contextuais em /settings.
- **Variante Hayzer**: lado (left/right), tom (ember pra alerta, petrol pra dica positiva, fog pra info neutra). Em mobile vira inline acima do bloco com border-top em vez de border-left.

### 7. Grain Overlay SVG (textura papel fotográfico)

- **Fonte**: hayzer.com.br landing v2 (já implementado), godly.website (60% dos sites premium 2025 usam grain), awwwards handmade
- **Descrição visual**: SVG `<filter feTurbulence baseFrequency='0.85-0.90' numOctaves='3' stitchTiles='stitch'>` aplicado como background-image em pseudo-element fixed full-screen. Cor warm `feColorMatrix values='0 0 0 0 0.95 ... 0 0 0 0 0.88'`. Opacity 0.30 dark / 0.28 light. Blend mode screen (dark) / multiply (light).
- **Onde no Hayzer**: TODO módulo interno deveria ter `.grain-layer` no body. Hoje só landing tem. Falta em /orders, /finance, /inventory, etc.
- **Variante Hayzer**: 3 intensidades — soft (0.18), default (0.30), heavy (0.45 só pra hero sections). Já existe em `globals.css` linha 627-641, falta APLICAR nos módulos.

### 8. Glow Petrol (halo em valor importante)

- **Fonte**: linear.app (sutilíssimo em hover de Inbox), stripe.com (em "Total" do dashboard), godly websites de produto premium
- **Descrição visual**: box-shadow externo radial petrol-500/0.3 alpha, raio 24-48px, spread negativo (-8 a -12px pra contornar só a borda). Combinado com inset 1px highlight branco/0.06 pra emular luz vinda de cima. Em hover sobe pra 0.45 alpha.
- **Onde no Hayzer**: KPI hero "Receita do dia" (já tem no V4), card de meta atingida em /metrics, total do mês em /finance. NÃO usar em todo card — só no "número principal da tela".
- **Variante Hayzer**: `petrol` (default, sucesso financeiro), `ember` (atenção/celebração — meta atingida), `red-soft` (alerta, único — fatura vencida). Animação ao hover: glow cresce 18→32px shadow em 320ms ease-out.

### 9. Root Decor (raiz SVG decorativa em canto)

- **Fonte**: identidade Hayzer (logo H + raízes), já presente no V4 dashboard como `.root-canvas` + `.root-hover`
- **Descrição visual**: SVG 36-40px no canto sup esq do card, com path de tronco + 2-3 branches + 1-2 nodes (círculos pequenos). Stroke petrol-300 1.3px, fill none. Glow `drop-shadow(0 0 4px petrol-500)`. Animação stroke-dashoffset que "cresce" no hover (180ms trunk + 200/300ms delay branches + 800ms nodes).
- **Onde no Hayzer**: cards principais de cada módulo. NÃO em todos — só nos "destaques" (1-2 por tela). Em /orders: card do pedido em destaque. Em /finance: card "saldo do mês". Em /inventory: card "filamento crítico".
- **Variante Hayzer**: lado (sup-esq, sup-dir, inf-esq), tamanho (sm 24px, md 36px, lg 48px), tom (petrol default, ember pra cards de alerta).

### 10. Highlighted Text (background ember em palavra)

- **Fonte**: stripe.com landing, godly websites editorial, linear.app
- **Descrição visual**: span inline com `background: ember-500/0.18`, padding 0 6px, border-radius 4px, color: fog-50 (não muda). Funciona em qualquer texto sem precisar quebrar linha. Em hover sobe pra 0.25 alpha. Diferente do `.marker` (gradient bottom-só) — esse é fundo inteiro.
- **Onde no Hayzer**: chamada de atenção em frase curta. "Tem [3 pedidos] pra hoje" em greeting. "Vendeu [R$ 12.480]" em insight card. Diferente do marker porque highlight é volume sólido (ênfase forte), marker é sutil.
- **Variante Hayzer**: `ember` (default, atenção), `petrol` (positivo), `fog` (neutro contornado).

### 11. Polaroid card (card rotated com tape)

- **Fonte**: godly.website portfolio premium, awwwards handmade, designspells "scrapbook" tag
- **Descrição visual**: card 240-320px largura com leve rotação `-1.5deg a 2deg`, box-shadow 3 layers (1 sharp curta + 1 soft larga + 1 colored petrol), e uma tape badge no topo (item #1 acima). Conteúdo dentro sem rotação (caption embaixo, imagem em cima). Vibe "foto colada no álbum".
- **Onde no Hayzer**: portfolio mosaic em /portfolios, showcase produto em /catalogs, "trabalhos recentes" em landing. NÃO usar em listas longas (rotation cansa) — só em galleries premium.
- **Variante Hayzer**: rotação alterna sentido (1ª `-1.5deg`, 2ª `+1deg`, 3ª `-0.8deg`), bg fog-50 (foto-paper warm). Em hover endireita pra 0deg (transition 320ms ease-out).

### 12. Ticker / Marquee de mono caption (rodapé estilo terminal)

- **Fonte**: vercel.com analytics, designvault.io patterns, mobbin "live data" collection
- **Descrição visual**: faixa horizontal estreita (32-44px altura), bg surface-1, border-top 1px border-soft, texto Geist Mono 12px uppercase tracking 0.10em fog-300. Animação CSS keyframes `translateX(-100% → 0)` em loop 30-45s. Conteúdo: "+ 8 PEDIDOS HOJE · +R$ 2.340 EM 6H · 3 EM PRODUÇÃO · BAMBU X1 73% · ML 12 NOVAS"
- **Onde no Hayzer**: rodapé fixed do dashboard (lá embaixo, persistente), topo de /orders mostrando atividade da semana, /finance mostrando entradas/saídas em tempo real.
- **Variante Hayzer**: velocidade (slow 60s / med 40s / fast 25s), tom (petrol/ember/neutral), pausa em hover.

### 13. Inset Border Highlight (luz "vinda de cima")

- **Fonte**: linear.app cards (assina sutil), apple.com (sempre), refactoring UI capítulo "Creating Depth"
- **Descrição visual**: `box-shadow: inset 0 1px 0 rgba(255,255,255,0.06)` em todos os cards principais. Em dark, vira luz fria; em light, ajusta pra rgba(0,0,0,0.04). Combinado com border-soft externa, dá a sensação que o card é uma placa de vidro/metal escovado.
- **Onde no Hayzer**: TODO card do dashboard. Já tem no V4 (`--shadow-card`). Falta nos módulos legados.
- **Variante Hayzer**: padrão (sutil 0.06), strong (0.12 pra cards destacados), petrol-tinted (0.10 com hue petrol).

### 14. Skew Banner / Diagonal Stripe (faixa diagonal)

- **Fonte**: stripe.com (faixa "ENTERPRISE" em pricing), godly portfolios, lapa.ninja landings 2024-2026
- **Descrição visual**: faixa absoluta diagonal `transform: rotate(-45deg)` no canto do card. Bg ember-500 sólido, texto Geist Mono 700 11px branco uppercase letter-spacing 0.10em. Geralmente sai do card pelas bordas com `overflow:hidden` no parent. Diferença pra TapeBadge: skew é mais formal, integrado ao card; tape é mais lúdico, sobreposto.
- **Onde no Hayzer**: pricing /calculadora-pro ("RECOMENDADO"), card de plano em /settings, edição limitada de catálogo. NÃO em lista comum.
- **Variante Hayzer**: lado (top-right, top-left), tom (ember default, petrol pra "FREE", red-soft pra "VAI VENCER"). Texto sempre uppercase mono.

### 15. Tooltip handwritten (callout em estilo nota)

- **Fonte**: designspells.com "easter eggs", mobbin onboarding flows premium, notion.so anotações
- **Descrição visual**: balão arredondado (border-radius variável: `8px 8px 8px 2px` pra parecer rasgado em um canto), bg fog-50 dark / sand-mocha-100 light, sombra suave. Texto Fraunces italic 13-14px. Conectado ao elemento alvo por linha curva SVG (não seta default, linha hand-drawn). Diferente de tooltip nativo: este é editorial, lúdico.
- **Onde no Hayzer**: onboarding de feature nova ("isso é novo — clica pra ver"), explicação de gráfico complexo em /metrics, dica contextual em primeiro pedido.
- **Variante Hayzer**: side (top/right/bottom/left), tom (ember pra alerta, petrol pra dica, fog pra info), com ou sem hand-drawn arrow conectora.

---

## Mapeamento por módulo (onde aplicar)

| Módulo | Elementos prioritários | Por quê |
|---|---|---|
| `/orders` | TapeBadge, Stamp, MarkerUnderline, GrainOverlay, GlowPetrol | Status visual é a alma do módulo. Atrasado/pago/produzindo precisa virar identidade. |
| `/finance` | GlowPetrol, MarkerUnderline, AsteriskNote, MarginNote | Valores monetários precisam respiro editorial. Asterisco/margin pra contextualizar sem poluir. |
| `/inventory` | TapeBadge ("CRÍTICO"), HandDrawnArrow (empty), Stamp ("REPOR") | Estoque vazio = empty state com arrow. Crítico = tape urgente. |
| `/products` | PolaroidCard, GlowPetrol em destaque, MarkerUnderline | Showcase de produto físico → vibe scrapbook funciona bem. |
| `/crm` | Stamp ("RECOMPRA"), MarginNote (histórico), Highlighted (sumiu) | Status do cliente vira carimbo memorável. |
| `/catalogs` | TapeBadge ("NOVO"), PolaroidCard, GlowPetrol | Catálogo público = produto, premiar destaques. |
| `/portfolios` | PolaroidCard mosaic, GlowPetrol, HandDrawnArrow | Portfolio = scrapbook nato. |
| `/metrics` | AsteriskNote, MarginNote, GlowPetrol em KPI, MarkerUnderline | Métricas precisam contexto sem poluir. Margin/asterisco resolvem. |
| `/decisions` | Highlighted, MarkerUnderline, AsteriskNote | Decisões = texto editorial → marker em palavras-chave. |
| `/content` | PolaroidCard, GrainOverlay heavy | Conteúdo editorial = vibe pesada de scrapbook. |
| `/settings` | TapeBadge ("BETA"), SkewBanner ("PLANO ATUAL") | Plans/features in beta destacados. |
| `/projects` | RootDecor (cada projeto = uma raiz), GlowPetrol no ativo | Projeto = árvore → raiz reforça metáfora. |

---

## Princípios cross-cutting

1. **Não exagerar**: máximo 2-3 elementos únicos por tela. Mais que isso vira "site portfolio", não SaaS.
2. **Hierarquia clara**: TapeBadge > Stamp > MarkerUnderline > Highlighted > AsteriskNote (do mais chamativo ao mais sutil).
3. **Variação intencional**: rotações alternam, paletas variam, mas o sistema é fechado (ember/petrol/red-soft/neutral — sem novos hues).
4. **Light mode adapta**: cada elemento tem variant light testada. Em light, ember vira cocoa, petrol mantém, glow vira sombra warm.
5. **Acessibilidade**: contraste WCAG AA mantido. Decorações nunca substituem texto/label. Rotação ≤6deg pra leitura confortável.
6. **Performance**: SVG inline (sem libs). Animações via CSS (stroke-dashoffset, transform). Sem JS pra microinteração.

---

## Próximo passo

Cada um desses 15 elementos vira componente em `components/visual-library/` — spec técnica completa em `design/visual-library-catalog.md`.

Felipe converte HTML→React, exporta tudo de `components/visual-library/index.ts`. Módulos legados (/orders, /finance, etc) importam direto sem refactor estrutural — só decoração.

---

## Sources

- [Design Spells - micro-interactions gallery](https://designspells.com/)
- [Mobbin - 600k+ app screenshots](https://mobbin.com/)
- [Godly - astronomically good web design](https://godly.website/)
- [Lapa Ninja - 7300+ landing designs](https://lapa.ninja/)
- [Custom Underlines with SVG - ishadeed](https://ishadeed.com/article/custom-underline-svg/)
- [Hand-drawn underline effect - CodeMyUI](https://codemyui.com/hand-drawn-underline-effect-for-links/)
- [Ribbon style badge for cards - Sudeep Gumaste](https://medium.com/@so_deep.dev/ribbon-style-badge-for-cards-with-css-5c9da53d908e)
- [SVG Underline doodles - SVG Backgrounds](https://www.svgbackgrounds.com/elements/underline-doodles/)
- [SaaS Design Trends 2026 - 12 Shifts](https://www.designstudiouiux.com/blog/top-saas-design-trends/)
- [7 SaaS UI Design Trends 2026 - SaaSUI](https://www.saasui.design/blog/7-saas-ui-design-trends-2026)
- [Beyond border-radius CSS corner-shape - Smashing](https://www.smashingmagazine.com/2026/03/beyond-border-radius-css-corner-shape-property-ui/)
