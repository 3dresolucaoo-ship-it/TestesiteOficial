# ADR 014 — Dashboard V4.8 aprovado como MVP do produto Hayzer

> **Data**: 17/05/2026
> **Status**: Aceito — Felipe inicia conversão React segunda 20/05/2026
> **Decisor**: Gabriel (CEO)
> **Custo de reversão**: BAIXO — mockup HTML é referência visual; refactor React permite ajustes infinitos depois

---

## Contexto

Em 16/05 entreguei 3 mockups arquiteturais do dashboard interno (V1 Dataviz / V2 Hero / V3 Editorial). CEO escolheu caminho A: **híbrido V1+V3** com correções.

Em 17/05 (1 dia) iteramos 8 versões (V4.0 → V4.8) absorvendo:
- Auditoria paralela G7: Sofia (UX), Júlia (QA), Carla (microcopy)
- Decisões CEO durante teste em prod: bordas, light warm, glow, paleta marrom
- Princípios estudo G7 dominical (Diego Refactoring UI, Helena Rumelt, Otávio OWASP 2025, etc)

CEO aprovou V4.8 com a frase: **"ta bom para o mvp, depois melhoramos mais."**

---

## Decisão

### V4.8 é o MVP do dashboard interno Hayzer.

**Felipe inicia conversão HTML → React em 20/05/2026 (segunda)** seguindo plano gantt da Semana 2 (`ROADMAP.md`):

1. Componentes React fiéis ao mockup (5 dias)
2. Conexão com services existentes (`services/finance.ts`, `orders.ts`, etc)
3. Deploy preview → CEO valida com dados REAIS
4. Promove pra prod

**Resultado esperado sex 24/05**: dashboard novo em produção com dados reais do CEO.

---

## O que está MVP-aprovado (não mexer sem ADR novo)

### Arquitetura
- **Hero subcategoria**: cover-figure 96px Fraunces R$ 12.480 (60%) + 4 satélites verticais Lucro/Margem/Custos/Pedidos (40%)
- **KPI marquee linha embaixo REMOVIDO** (info migrou pros satélites)
- **Bento grid 4 colunas** com 7 cards: donut margem, bars 6 meses, fila Bambu, gauge meta, top produtos, em produção AGORA, alerta filamento (span-4)
- **Sidebar 248px fixed** com logo PNG + nav-items
- **Streak pill** canto inferior esquerdo fixed (sheen ember)
- **Próxima ação sugerida** card único entre cover e bento (placeholder Copiloto Wave 6)

### Visual
- **Dark**: surface base `#11161A` (soft, não preto puro), petrol `#1F7669` cor de marca
- **Light**: paleta MARROM ELEGANTE (print CEO V4.7) — surface `#ECE7DF` off-white bege neutro, fog texto preto soft `#0F0A09` → cocoa `#6E472F` → sand `#9B8770`, ember vira cocoa `#8B5A33`
- **Petrol mantém forte `#1F7669` em ambos modes** (cor de marca não lava)
- **Logo H+raízes PNG** preservada (ADR-013)
- **Tipografia**: Fraunces ≤15% (hero + section title + anchor italic) + Geist 85% (body 17px + labels 13px Mono)
- **Grain SVG fixed** opacity 0.30 (dark) / 0.28 (light) — vibe papel rugoso, anti-IA
- **Bordas visíveis** rgba 0.14 (dark) / 0.14 marrom (light) — contorno claro
- **Ambient glow cocoa** body gradient radial — perspectiva de profundidade
- **Watermark "hayzer"** Fraunces 240px italic visível ambos modes
- **Raízes SVG estruturais** fundo animadas no load + **animadas no hover** dos bento cards (CSS stroke-dashoffset puro, sem GSAP)

### Comportamento
- **Light/dark toggle** persistido em localStorage
- **Greeting personalizado**: "Boa noite, Gabriel" (JS calcula horário)
- **Count-up animado** KPI hero (0 → R$ 12.480 em 1.2s)
- **Cover-anchor dinâmico**: 5 estados copy baseado em % meta (≥100% "viraço", ≥75% "tá no ritmo", <25% "precisa correr")
- **Theme toggle aria-label** reflete estado atual
- **Sidebar drawer mobile** com overlay + escape key + click fora pra fechar
- **bfcache pageshow listener** restart count-up ao voltar browser
- **prefers-reduced-motion** respeitado em todas animações

### A11y
- **Aria-labels** nos 5 segmentos do donut (WhatsApp 88%, Loja 82%, etc)
- **Body 17px**, labels micro 13px mínimo (nunca 11-12)
- **Focus rings** petrol-300 em todos interativos
- **role="img"** + aria-labels nos charts
- **`<title>` SVG individual** pendente (backlog Felipe-React)

### 9 mecanismos dopamina-operacional aplicados
1. Variable reward (count-up KPI)
2. Zeigarnik (progresso meta + glow gauge ao bater 100%)
3. Salience (R$ gigante 96px Fraunces)
4. Loss aversion (deltas petrol/ember soft, sem vermelho puro)
5. Micro-feedback (mousedown scale 0.99)
6. Paradoxo escolha reduzida (próxima ação ÚNICA sugerida)
7. Streak sutil (12 dias seguidos pill)
8. Surprise+delight (raízes hover crescem)
9. Cognitive ease (uma métrica por card)

---

## O que vira BACKLOG pós-MVP (Felipe revisita futuramente)

- Tooltips charts ao hover (Recharts/Visx no React)
- Search Cmd+K global (cmdk lib)
- Filtros período pill toggle (state mgmt)
- Drag widgets reorder (@dnd-kit) — endowment effect
- Empty states maker-específicos por card
- Banner "modo demonstração" quando user ainda não cadastrou nada real (Sofia P1)
- Onboarding 3 passos progressivos
- Streak D3+ (não D1 com dados falsos)
- Alerta filamento crítico no TOPO do bento (era span-4 embaixo)
- sr-only delta direção pra screen reader (Júlia P1)
- `<title>` SVG individual nos segmentos
- Edge case data `R$ 0,00` (fallback visual decente)
- Matriz 5x5 marrom expandida (paleta CEO 2º print) — sistema de 25 shades
- L-system fractal pra raízes (mais orgânicas, opcional desktop)
- Animação raíz REAL crescendo (não só stroke-dashoffset — algoritmo orgânico)

Tudo registrado em `ROADMAP.md > 🎯 BACKLOG CONVERSÃO REACT V4 → FELIPE`.

---

## Justificativa

1. **Pre-launch tem deadline 04/07** — perfeccionismo come tempo de validação
2. **CEO aprovou pessoalmente após 8 iterações** — não é decisão prematura
3. **G7 auditou** (Sofia/Júlia/Carla + estudos Diego Refactoring UI/Helena Rumelt/Otávio OWASP) — não é decisão isolada
4. **Custos de reversão BAIXOS**: refactor React permite ajustes infinitos pós-launch
5. **Pillars/SCORES.md** registra Design 9.0 → recalibrado pra 8.5 honesto (sem vanity metric)

---

## Relacionados

- `ADR-013` — Logo H+raízes preservada (regra fixa)
- `ADR-010` — Foco vertical maker 3D
- `design/dashboard-v4-spec.md` — spec original V4
- `mockups/dashboard/v4-hibrido.html` — código aprovado (3300+ linhas)
- `ROADMAP.md > Semana 2` — gantt Felipe conversão React
- `pillars/SCORES.md` — scores Design/Anti-IA atualizados

---

## Lições aprendidas

1. **8 iterações em 1 dia funcionou** porque CEO testou em prod a cada commit — feedback loop real, não teatro
2. **Memória G7 dos estudos dominicais aplicou imediato** — Rumelt chain-link guiou priorização, Refactoring UI guiou paleta HSL, OWASP 2025 guiou segurança
3. **Print de referência > descrição verbal** — print da paleta CEO resolveu 4 rodadas de "tá branco demais" em 1 mensagem
4. **Honestidade > vanity metric** — recalibrar 9.0 → 8.5 mantém credibilidade do sistema de scores
5. **Aprovação MVP ≠ produto final** — backlog explícito do que ainda pode melhorar permite seguir sem culpa
