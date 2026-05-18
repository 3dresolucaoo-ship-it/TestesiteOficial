# Plano de Execução — Conversão Dashboard V4.8 → React
# (Semana 20–24/05/2026)

> **Responsável**: Felipe (frontend)
> **Referência**: `decisions/014-dashboard-v4-aprovado-mvp.md` (ADR pai)
> **Mockup**: `mockups/dashboard/v4-hibrido.html` (3300+ linhas, aprovado CEO 17/05)
> **Meta**: dashboard em produção com dados reais do CEO até sexta 24/05

---

## 1. Arquivos criados nesta sessão (estrutura base)

| Arquivo | Tipo | Status |
|---|---|---|
| `components/dashboard/v4/types.ts` | Server | Criado |
| `components/dashboard/v4/Greeting.tsx` | Client | Criado |
| `components/dashboard/v4/CoverHero.tsx` | Client | Criado |
| `components/dashboard/v4/KpiSatellites.tsx` | Re-export | Criado |
| `components/dashboard/v4/NextActionCard.tsx` | Client | Criado |
| `components/dashboard/v4/RootHover.tsx` | Server | Criado |
| `components/dashboard/v4/StreakPill.tsx` | Server | Criado |
| `components/dashboard/v4/BentoGrid.tsx` | Client | Criado |
| `components/dashboard/v4/DashboardLayout.tsx` | Client | Criado |
| `components/dashboard/v4/index.ts` | Barrel | Criado |

---

## 2. Gantt diário expandido

### Segunda 20/05 — CSS tokens + integração page.tsx (8h)

**Manhã (4h) — CSS V4 tokens**
- Criar `app/globals-v4.css` (ou estender `globals.css`) com:
  - Todas as CSS custom properties de `v4-hibrido.html` linhas 25-155
  - Classes utilitárias: `.grain-layer`, `.ambient-glow`, `.root-canvas`, `.root-hover`, `.streak-pill`
  - Classes de layout: `.sidebar`, `.main`, `.topbar`, `.cover`, `.bento-grid`, `.kpi-satellites`
  - Classes de animação: `@keyframes rootDraw`, `nodeFade`, `donutGrow`, `gaugeGrow`, `barGrow`, `barVal`, `rowGrow`, `pulseDot`, `fadeUp`
  - Media queries responsivas (480px / 768px / 1024px / 1280px)
  - `prefers-reduced-motion` fallbacks
- Estimativa: **3-4h** (maior risco da semana — ver seção 4)

**Tarde (4h) — service de dados do dashboard**
- Criar `services/dashboard.ts` com função `getDashboardData(userId, projectId): Promise<DashboardData>`
  - Agregar `transactionsService.getAll()` → calcular revenue, lucro, margem, custos
  - `ordersService.getAll()` → filtrar mês corrente → ordersCount, topProducts, activePrintJobs
  - `profitGoalsService.getByProject()` → monthlyTarget, progressPercent
  - `inventoryService.listByProject()` → stockAlerts (items com qty crítica)
  - Calcular streak: contar dias consecutivos de transação (dados mínimos)
- Estimativa: **3-4h** (depende de clareza das queries)

---

### Terça 21/05 — DashboardLayout + CSS depuração (6h)

**Manhã (3h) — Conectar page.tsx ao DashboardLayout**
- Atualizar `app/dashboard/page.tsx`:
  ```tsx
  import { getDashboardData } from '@/services/dashboard'
  import { DashboardLayout } from '@/components/dashboard/v4'
  // ...
  const data = await getDashboardData(user.id, activeProjectId)
  return <DashboardLayout data={data} />
  ```
- Testar no dev server (pedir ao CEO para rodar)
- Estimativa: **1h**

**Tarde (3h) — Depuração CSS**
- Verificar pixel-perfect vs mockup HTML no Chrome
- Focos de risco: tokens dark/light, grain opacity, root-canvas z-index
- Estimativa: **2-3h**

---

### Quarta 22/05 — Bento cards com dados reais (6h)

**Donut chart (2h)**
- Dados reais: agrupar orders por `origin` + calcular margem real
- Animação `donutGrow` via `--off` CSS custom property no `<circle>`
- Testar aria-labels dos 5 segmentos

**Bars chart (2h)**
- Query: 6 meses de transactions agrupados por mês
- Normalizar heights (max = 100%)
- Mês corrente em âmbar

**Gauge + Queue + TopProducts + NowPrint (2h)**
- Gauge: calcular `--target` em pixels (251.33 × percent / 100)
- Queue: dados de production.ts (fila da semana)
- TopProducts: agrupar orders do mês por produto → top 5 por lucro
- NowPrint: production.ts jobs ativos

---

### Quinta 23/05 — Polimento + responsivo + A11y (4h)

**Mobile (2h)**
- Testar breakpoints 320px / 480px / 768px / 1024px
- Sidebar drawer: testar escape + click overlay
- root-hover: confirmar `display:none` em ≤768px

**A11y (1h)**
- `<title>` SVG em donut (Júlia P1 backlog — tentar encaixar aqui)
- sr-only deltas diretivos ("subiu" / "caiu")
- Focus ring petrol-300 em todos interativos

**Dark mode (1h)**
- Testar toggle light/dark
- Verificar grain opacity: 0.30 dark / 0.28 light
- Verificar raízes: petrol dark / fog-200 light

---

### Sexta 24/05 — Deploy preview + validação CEO (2h)

- Commit + push branch `feat/dashboard-v4`
- PR para main (não fazer merge sem CEO ver)
- Enviar URL preview para CEO validar com dados reais
- Checkpoint: dashboard funcional com dados do projeto Resolução 3D

---

## 3. Estimativa por componente

| Componente | Estimativa | Risco |
|---|---|---|
| `types.ts` | 1h | Baixo — feito |
| `Greeting.tsx` | 30min | Baixo — feito |
| `CoverHero.tsx` + count-up | 1.5h | Médio (count-up + bfcache) |
| `NextActionCard.tsx` | 30min | Baixo — feito |
| `RootHover.tsx` | 30min | Baixo — feito |
| `StreakPill.tsx` | 30min | Baixo — feito |
| `BentoGrid.tsx` (7 cards) | 4h | Alto (donut/gauge SVG math) |
| `DashboardLayout.tsx` | 2h | Médio (theme toggle + sidebar mobile) |
| `globals-v4.css` (tokens) | 3-4h | **ALTO — ver seção 4** |
| `services/dashboard.ts` | 3-4h | Alto (queries agregadas) |
| `app/dashboard/page.tsx` atualização | 1h | Baixo |
| Debug + responsivo + A11y | 4h | Médio |

**Total estimado**: ~22h (4.5 dias de 5h/dia)

---

## 4. Pontos de risco identificados

### Risco 1 — CSS tokens (ALTO)
**Problema**: O V4.8 usa ~200 CSS custom properties + 15 @keyframes definidos inline no HTML.
Tailwind 4 não suporta `bg-[rgba(31,118,105,0.06)]` via arbitrary values sem config.
As classes `.bento-card`, `.cover-figure`, `.sidebar` etc. são CSS vanilla sem equivalente Tailwind direto.

**Solução**: Criar `app/globals-v4.css` com TODA a CSS do V4 importada no layout.
NÃO converter para Tailwind (risco de perder os tokens de design aprovados pelo CEO).
Override seletivo onde Tailwind é mais claro (spacing, flex, etc.).

**Impacto se não resolvido**: visual do dashboard diverge do mockup aprovado.

### Risco 2 — Paleta Diego incompleta (MÉDIO)
**Problema**: ADR-014 menciona "Matriz 5x5 marrom expandida (CEO 2º print)" como backlog.
Os tokens `--fog-*`, `--night-*` etc. estão definidos no HTML mas podem não estar em `globals.css`.

**Verificação necessária**: `grep --night-900 app/globals.css` antes de segunda 20/05.
Se ausentes: copiar tokens do HTML para `globals-v4.css` (não sobrescrever globals.css existente).

### Risco 3 — finance.ts sem project_id (MÉDIO)
**Problema**: `transactionsService.getAll()` em `services/finance.ts` não filtra por `project_id` — só por `user_id`.
Isso viola a regra global do BVaz (multi-tenant) e pode misturar dados de projetos.

**Solução necessária (Bruna)**: Antes de conectar o dashboard, confirmar com Bruna se existe
`transactionsService.getAllByProject(projectId)` ou se precisa de nova query filtrada.
Se não existir: adicionar em `services/finance.ts` antes de terça.

**Impacto se ignorado**: métricas do dashboard podem misturar receita de projetos diferentes.

### Risco 4 — production.ts não lido (BAIXO)
**Problema**: `services/production.ts` não foi lido nesta sessão. Os cards "Em produção agora"
e "Fila Bambu" dependem dele.

**Ação**: Ler `services/production.ts` na segunda antes de implementar esses cards (terça 22/05).

### Risco 5 — count-up + bfcache (BAIXO)
**Problema**: `pageshow` event para restart count-up implementado no CoverHero.
Testar que `e.persisted === true` funciona corretamente no Chrome/Safari modernos.

### Risco 6 — SVG donut math (BAIXO-MÉDIO)
**Problema**: `stroke-dashoffset` cumulativo no donut SVG (cada segmento precisa do offset do anterior).
A implementação atual no BentoGrid calcula em loop — verificar resultado visual no dev server.

---

## 5. Critério de "pronto" por componente

Cada componente está pronto quando:

- [ ] Visual igual ao mockup HTML (comparação side-by-side no Chrome)
- [ ] TypeScript: `tsc --noEmit` sem erros
- [ ] ESLint: 0 errors, 0 warnings
- [ ] Loading state: Suspense com skeleton adequado
- [ ] Error state: error.tsx ou fallback gracioso
- [ ] Mobile: testado em 320px, 480px, 768px mentalmente
- [ ] Dark mode: toggle funcional (light bege marrom / dark soft night)
- [ ] A11y: aria-labels, foco visível petrol-300, roles corretos
- [ ] Sem console.log
- [ ] Sem TODO crítico (backlog OK, crítico não)

---

## 6. Checkpoint sexta 24/05 — Deploy preview

**Critério mínimo para preview ao CEO**:
1. `npm run build` sem erros
2. Dashboard carrega em prod com dados reais do projeto Resolução 3D
3. Cover-figure mostra receita real com count-up
4. Donut mostra canais reais (mesmo que com margem estimada)
5. Theme toggle funciona (dark/light)
6. Mobile drawer funciona

**O que pode estar incompleto no preview**:
- Gauge com dados hardcoded (se production.ts não estiver pronto)
- Top produtos mockados (se query de top por lucro não estiver pronta)
- Streak em D1 fixo (funcionalidade real é backlog)

---

## 7. Dependências externas

| Dependência | Owner | Prazo |
|---|---|---|
| `services/dashboard.ts` query de revenue mensal | Bruna (confirmar schema) | Segunda 20/05 manhã |
| `services/production.ts` leitura | Felipe (ler arquivo) | Segunda 20/05 |
| `project_id` em `transactionsService` | Bruna | Segunda 20/05 |
| Deploy preview | Ricardo | Sexta 24/05 |
| Validação visual CEO | Gabriel | Sexta 24/05 |

---

## 8. O que NÃO entra nesta semana (backlog ADR-014)

- Tooltips Recharts/Visx no hover
- Search Cmd+K
- Filtros período
- Drag widgets (@dnd-kit)
- Empty states maker por card
- Banner "modo demonstração"
- Streak D3+ com dados reais
- `<title>` SVG individual nos segmentos (Júlia P1)
- sr-only delta direção screen reader (Júlia P1)
- Matriz 5x5 marrom expandida

---

*Criado por Felipe · 18/05/2026 · ref ADR-014*
