# Audit visual — Paginas internas (dashboard logado)

> Data 2026-05-16 - Diego (Designer G7) - Sao paulo
> Escopo Telas pos-login (dashboard, settings, inventory, products, orders, portfolios, finance, crm, AppShell, Sidebar, TopBar)
> Comparativo Landing v2 (petrol+ember+grain+Fraunces) ja em prod vs interno v1 (roxo+azul+gradient-text)
> Objetivo Priorizar trabalho visual ate 04/07/2026 (~7 semanas)

---

## Sumario executivo

O dashboard interno esta em **DIVORCIO VISUAL** com a marca Hayzer.
A landing publica vende uma promessa editorial premium (petrol+ember+grain anti-IA, Fraunces serif, paleta nightline). Depois do login, o usuario cai num produto que parece **outra empresa** - paleta roxo-violeta `#7c3aed/#a78bfa` herdada da v0.1 (era "BVaz Hub" placeholder), `gradient-text` indo pra `#a78bfa`, glow-purple em todo card, sidebar com gradient azul-roxo no body.

**Evidencia objetiva**
- Roxo `#7c3aed` aparece em 21 componentes (70 ocorrencias)
- Roxo + lilas `#a78bfa` aparece em 25 arquivos `/app` (156 ocorrencias)
- Body background do dark mode tem 4 radial-gradients roxo/azul empilhados (`globals.css:197-202`)
- AppShell.tsx ainda mostra letra "B" roxa com `boxShadow: rgba(124,58,237,0.5)` na tela de loading (linha 36)
- TopBar tem linha de accent `rgba(124,58,237,0.4) -> rgba(59,130,246,0.35)` exatamente o gradiente roxo-azul listado como BANIDO no BRIEF.md
- Logo da sidebar ainda mostra "BVaz Hub" como fallback (Sidebar.tsx:112) - **rebrand incompleto no interno**

**Diagnostico em 1 linha**
Visual interno = **v0.1 esquecida**. Marca = v2 nova. Lacuna = 7 semanas pra fechar.

---

## Mapa de prioridades (top 5 telas pra tratar primeiro)

> Criterio impacto = (frequencia de uso) * (visibilidade da quebra) * (custo de fix)

### #1 - `components/AppShell.tsx` + `components/Sidebar.tsx` + `components/TopBar.tsx` - **shell global**
Visivel em **TODA** tela do app. Mudar shell = mudar o produto inteiro de uma vez.
- Loading screen roxo com letra "B" (precisa ser logo Hayzer real)
- Sidebar com gradient roxo-azul de fundo
- TopBar com linha gradient banido (roxo->azul)
- Logo fallback ainda "BVaz Hub"

### #2 - `components/DashboardView.tsx` - **primeira tela pos-login**
Primeira impressao apos a landing v2 linda. Hoje tem:
- `gradient-text` roxo no `<h2>Sistema Operacional</h2>` (linha 104) - cara de IA classico
- 6+ secoes cheias de `StatCard` com glow violeta + lilas (shared.tsx:97)
- Ainda usa `#7c3aed/#a78bfa` em barras de progresso, intelligence cards, top conteudo
- Mistura 5 cores accent (verde/laranja/azul/roxo/vermelho) em badges sem regra clara

### #3 - `components/SettingsView.tsx` - **tela de admin onde Rafael bate cabeca**
Botao salvar = roxo solido `bg-[#7c3aed]` (linha 179). Admin badge roxo `text-[#a78bfa]`. Tabs ativas roxas.
- 8 sub-tabs (General/Finance/CRM/etc) - inconsistencia visual cumulativa
- Tabs com border roxo `border-[#7c3aed33]`

### #4 - `app/inventory/page.tsx` (1472 linhas) - **uso diario do Rafael**
- Cards de estoque ja usando `var(--t-card-from)` parcialmente (bom)
- Mas ImageUploader (linha 121) hardcoded com `hover:border-[#7c3aed]` + `text-[#a78bfa]`
- Badges de categoria misturam `text-[#7c3aed]` (filament) + verde/azul/cinza - paleta sem alma
- Item.list e item.grid carregados de hardcodes `#1c1c1c`, `#2a2a2a` (Paleta A antiga, nao Paleta B atual nem v2 nova)

### #5 - `app/orders/page.tsx` + `app/products/page.tsx` - **funil de receita**
- Orders: paleta de status mistura 4 hardcodes (`#888/#f59e0b/#10b981/#a78bfa`) com bordas `bg-[#88888818]` antigas
- Products: `CostPreview` (linha 65) com `bg-[#0f0f0f] border-[#2a2a2a]` - paleta neutra preta, nao o `--card` shadcn

---

## Auditoria detalhada por tela

### 1. `components/AppShell.tsx` (loading + shell + DB error toast)

**Status visual 2/5** - elementos roxos cravados na primeira impressao.

**3 problemas mais urgentes**
1. LoadingScreen mostra letra "B" + glow `rgba(124,58,237,0.5)` (linhas 34-52) - roxo BANIDO + ainda usa "B" de "BVaz" (rebrand quebrado)
2. Os 3 dots da loading sao `#7c3aed` (linha 47)
3. DbErrorToast com `rgba(239,68,68,0.12)` ok mas estilo `shadow-2xl` listado como BANIDO no visual-system-v2.md

**3 melhorias rapidas (1-2h)**
- Trocar letra "B" pela `<Image src="/logo-hayzer.png">` ja em prod na landing (mesma usada no Logo.tsx)
- Trocar `#7c3aed` da loading por `hsl(var(--primary))` (sera petrol-500 quando aplicar tokens v2)
- Animacao de pulse: trocar `pulse 1.2s` por `pulse-glow 5s ease-in-out` (mesma da landing, mais elegante)

**1 mudanca grande (4-8h)**
Refatorar LoadingScreen pra usar `card-letter` + grain-soft + logo Hayzer real com pulse-glow. Vira identidade visual em vez de "tela de carregamento generica".

**Anti-IA check** FALHA - letra solta com glow violeta = template SaaS exato.

---

### 2. `components/Sidebar.tsx` (601 linhas)

**Status visual 3/5** - estrutura ok, paleta errada.

**3 problemas mais urgentes**
1. Background `linear-gradient(180deg, var(--t-accent-soft) 0%, transparent 30%)` (linha 479) - no dark esse accent-soft eh `rgba(59,130,246,0.14)` = azul corporativo BANIDO
2. Logo fallback mostra "BVaz Hub" (linha 112) - **rebrand incompleto critico**
3. NavLink active usa `var(--t-nav-active-bg)` que no dark eh `rgba(59,130,246,0.15)` (azul)

**3 melhorias rapidas (1-2h)**
- Trocar fallback "BVaz Hub" -> "Hayzer" na linha 112
- Substituir avatar fallback (div com primeira letra + background accent) pelo `<Image src="/logo-hayzer.png">` em `sm` variant
- Trocar `--t-nav-active-bg` de azul pra `hsl(var(--petrol-500) / 0.12)` no dark

**1 mudanca grande (4-8h)**
Criar `Sidebar.v2.tsx` com:
- background `night-900` + grain-soft no topo (estilo Linear redesign 2026)
- Section headers em `.tag` font-mono uppercase (em vez de Geist semibold)
- Nav active com indicador petrol-300 lateral + background `petrol-500/0.10`
- Footer "Sistema Operacional v0.3" -> tag uppercase ".v0.3 . online" font-mono

**Anti-IA check** Sidebar grande, denso, ok estruturalmente. So a paleta polui.

---

### 3. `components/TopBar.tsx`

**Status visual 1/5** - tem o gradient roxo-azul exato listado como BANIDO.

**3 problemas mais urgentes**
1. Linha 69 - `linear-gradient(90deg, transparent, rgba(124,58,237,0.4) 25%, rgba(59,130,246,0.35) 75%, transparent)` - **gradient roxo->azul = exatamente o vibe SaaS que o BRIEF banne**
2. Role badge admin (linha 91) usa `var(--t-accent-soft)` que no dark = azul corporativo
3. User email pill com `bg-[#10b981]` solido + glow verde puro - vibe crypto

**3 melhorias rapidas (1-2h)**
- Apagar a linha de accent gradient (linha 66-71). Substituir por `border-bottom: 1px solid hsl(var(--border))` simples
- Admin badge: trocar tokens por `bg-[hsl(var(--ember-500))/0.12] text-[hsl(var(--ember-500))] border-[hsl(var(--ember-500))/0.30]` (ember dourado = autoridade sem ser azul)
- Status dot online: reduzir glow `boxShadow: 0 0 6px rgba(16,185,129,0.8)` pra `0 0 4px rgba(31,118,105,0.4)` (petrol em vez de verde puro)

**1 mudanca grande (4-8h)**
TopBar com 3 zonas claras:
- Esquerda: titulo da tela em Geist 16px semibold + tag uppercase mostrando contexto ("INVENTARIO" ou "01 - ESTOQUE")
- Centro: command palette stub `<kbd>Cmd K</kbd>` (Linear/Vercel style, ja prepara terreno)
- Direita: status dot + email truncado + actions

**Anti-IA check** FALHA - gradient roxo->azul + glow verde puro + pills com shadow-2xl = template padrao.

---

### 4. `components/DashboardView.tsx` (483 linhas)

**Status visual 2/5** - StatCards bonitos isoladamente, mas paleta cancerosa.

**3 problemas mais urgentes**
1. `<h2 className="gradient-text">` (linha 104) - `gradient-text` em globals.css:511 vai de `--t-text-primary` -> `#a78bfa` lilas = vibe IA exata
2. Production Intelligence (linha 297): mistura 5 cores accent sem regra (`#f59e0b/#10b981/#a78bfa/#ef4444`) - parece template Material default
3. Quick Access cards (linha 449-465) usam `boxShadow: 0 4px 20px rgba(0,0,0,0.4)` + hover `0 16px 40px rgba(0,0,0,0.6)` = `shadow-2xl` BANIDO

**3 melhorias rapidas (1-2h)**
- Apagar classe `gradient-text` do h2 -> usar `text-foreground` puro com Fraunces serif (`display-h2`) pra **uma palavra-chave em italic-soft** ("Sistema *Operacional*")
- Padronizar accent das 4 StatCards principais: trocar mix de cores por 1 cor primaria (petrol-500) + 1 cor de status (verde lucro / vermelho prejuizo). Reduzir 5 cores -> 3.
- Inventory Intelligence (linha 250) usa `<Panel glow="#7c3aed">` - trocar pra `glow="#1F7669"` (petrol)

**1 mudanca grande (6-8h)**
Refatorar `dashboard/shared.tsx` (Section/StatCard/Panel) pra v2:
- StatCard: substituir gradient `linear-gradient(145deg, rgba(255,255,255,0.045)...)` por `.feature-card` (ja existe em globals.css:380), border `petrol-300/0.08`, hover `petrol-300/0.22`
- Sparkline: trocar default purple por petrol-400
- Section header: titulo em Fraunces `display-h2` (24px) + tag uppercase mono ("VISAO FINANCEIRA" -> "01 - financas")
- Adicionar grain-soft em containers grandes

**Anti-IA check** FALHA grave - `gradient-text` + glow violeta em StatCards + Quick Access com box-shadow exagerado = template Vercel-Tailwind padrao + gerador de saas.

---

### 5. `components/SettingsView.tsx`

**Status visual 2/5** - refatorado em sub-tabs (bom), mas estilo dos componentes ainda v1.

**3 problemas mais urgentes**
1. Botao Salvar `bg-[#7c3aed] hover:bg-[#6d28d9]` (linha 179) - roxo solido sobre dark = vibe Notion antigo, fora de marca
2. Tabs ativas com `bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]` (linha 201) - 3 hardcodes roxos em 1 elemento
3. Admin badge `bg-[#7c3aed1a] text-[#a78bfa]` (linha 161) - mesma cor do botao Salvar = sem hierarquia

**3 melhorias rapidas (1-2h)**
- Botao Salvar: usar `btn-light` class de globals.css:445 (fundo fog-50, texto night-950, sombra petrol) - mesmo botao do hero da landing
- Tabs: trocar paleta `#7c3aed*` por `hsl(var(--petrol-500) / 0.12) text-[hsl(var(--petrol-300))]` - mesma logica visual mas em petrol
- Admin badge: trocar por sticker amber rotacionado 6deg (`.sticker-amber` em globals.css) - consistente com landing

**1 mudanca grande (4-6h)**
Tab bar com underline animado (Framer Motion `layoutId`) estilo Vercel - linha petrol-300 desliza entre tabs em vez de pill colorido. Mais elegante, menos "template de SaaS".

**Anti-IA check** FALHA - botao roxo solido + admin badge roxo = padrao Tailwind UI gratuito.

---

### 6. `app/inventory/page.tsx` (1472 linhas)

**Status visual 3/5** - estrutura cards/list ok, paleta fragmentada.

**3 problemas mais urgentes**
1. CAT_COLORS (linha 46-50) - filament em `#7c3aed` (BANIDO), 4 categorias com hardcodes - precisa virar mapa de cores de marca
2. ImageUploader (linha 121) - `hover:border-[#7c3aed]` + `text-[#a78bfa]` (roxo em form de upload, pior lugar pra ter cara de IA)
3. ItemRow (linha 600-660) usa `bg-[#1c1c1c]/#2a2a2a/#888888` - paleta cinza neutra hardcoded em vez de tokens shadcn

**3 melhorias rapidas (1-2h)**
- Remapear CAT_COLORS pra paleta de marca: filament -> petrol-500, product -> fog-100 (neutro), equipment -> ember-500, other -> fog-300
- ImageUploader: trocar `#7c3aed` -> `hsl(var(--petrol-500))` + `#a78bfa` -> `hsl(var(--petrol-300))`
- ItemCard pricing (linha 793): `color: var(--t-accent)` no dark = azul, trocar pra petrol-500

**1 mudanca grande (8h)**
ItemCard v2 com:
- aspect-square com background `night-800` + grain-soft em vez de `#1c1c1c`
- Badges de status (ESGOTADO/BAIXO/OK) em sticker rotacionado 3deg estilo handmade (em vez de pill retangular padrao)
- Hover quick actions com glassmorphism `backdrop-blur(12px)` em vez de `bg-gradient-to-t from-black/70`
- Tipografia: nome do produto em Fraunces `display-h2` reduzido (18px) + projeto em tag mono uppercase

**Anti-IA check** PARCIAL - estrutura de grid/list bem feita, mas paleta + ImageUploader denuncia "template de inventario".

---

### 7. `app/products/page.tsx` (1028 linhas)

**Status visual 2/5** - CostPreview e a peca cirurgica que precisa virar identidade.

**3 problemas mais urgentes**
1. CostPreview (linha 65) `bg-[#0f0f0f] border-[#2a2a2a]` - hardcode preto profundo + cinza neutro em vez de `hsl(var(--card))` + `hsl(var(--border))`
2. Cores de breakdown (linha 71-75): material azul `#3b82f6`, energia laranja `#f59e0b`, falhas vermelho `#ef4444`, suporte lilas `#a78bfa` - **4 cores tropicais sem regra** = vibe Material default
3. Linha 102: margem real exibida em 3 cores condicionais (`#10b981 / #a78bfa / #f59e0b`) - logica certa, paleta errada (lilas no meio)

**3 melhorias rapidas (1-2h)**
- CostPreview: trocar `bg-[#0f0f0f]` por `bg-card` + `border-border`
- Paleta de breakdown: material -> petrol-300, energia -> ember-400, falhas -> destructive, suporte -> fog-300 (menos saturado, ar editorial)
- Custo total: tipografia tabular-nums em Geist Mono uppercase 14px com letra negativa (-0.02em) - "tecnico artesanal" do brief

**1 mudanca grande (6h)**
CostPreview como peca de "demonstracao da inteligencia do produto":
- Card-letter com glassmorphism
- Numero grande do "Custo Total" em Fraunces 32px com italic-soft no R$ ("*R$* 12,40")
- Margin badge sticker-amber rotacionado se margem >= 40% (recompensa visual)
- Sparkline minusculo de historico se houver mais de 3 produtos similares ja salvos

**Anti-IA check** FALHA - paleta azul-laranja-vermelho-lilas = Material UI default 2020.

---

### 8. `app/orders/page.tsx`

**Status visual 3/5** - tabela e badges funcionais mas sem alma.

**3 problemas mais urgentes**
1. statusConfig (linha 13-18) - delivered em `text-[#a78bfa] bg-[#7c3aed1a]` (BANIDO duplo)
2. OrderCostPreview (linha 51) duplica padrao de cores ruim do CostPreview de Products (mesma paleta 4 cores)
3. originColors (linha 27-32) - 4 hardcodes (WhatsApp verde, Instagram laranja, Facebook azul, outro cinza) - origem deveria ser **icone com brand color** + texto neutro, nao texto colorido

**3 melhorias rapidas (1-2h)**
- statusConfig.delivered: trocar `#a78bfa/#7c3aed` por `hsl(var(--petrol-300))` + bg `hsl(var(--petrol-500) / 0.12)`
- originColors: simplificar pra `text-foreground` + icone colorido (icone WhatsApp em #25D366, Instagram em gradient instagram real, Facebook em #1877F2). Texto sempre neutro.
- Adicionar empty state ilustrado quando nenhum pedido (hoje fica vazio sem feedback visual)

**1 mudanca grande (4-6h)**
Kanban view dos pedidos (Lead -> Orcamento -> Pago -> Entregue) com drag-and-drop estilo Linear. Hoje so tem lista - kanban faria sentido pro funil de venda do Rafael.

**Anti-IA check** PARCIAL - badges funcionam, paleta polui.

---

### 9. `components/PortfoliosView.tsx` + `app/portfolios/page.tsx`

**Status visual 4/5** - ja usa `var(--t-surface)` em vez de hardcode, mais perto da marca.

**3 problemas mais urgentes**
1. Avatar fallback (linha 64-69) com `var(--t-surface-2)` que pode nao existir - check de token quebrado
2. Cards de portfolio nao tem peso visual (background flat, border sutil, sem hierarquia tipografica forte)
3. Slug "/portfolio/foo" mostrado como texto neutro - deveria estar em font-mono (e um link tecnico)

**3 melhorias rapidas (1-2h)**
- Avatar fallback: usar logo Hayzer sm em vez de icone User Lucide
- Slug em font-mono uppercase com prefixo "/" em fog-400 e nome em fog-100
- Adicionar hover: levantar 1px + glow petrol sutil

**1 mudanca grande (4h)**
Card de portfolio em estilo "cartao postal":
- Aspect 4:5 com avatar grande topo
- Background com gradient sutil petrol -> night-900
- Stats de view-count em font-mono uppercase no rodape ("128 visitas . 4 contatos")
- Hover revela 3 acoes (copiar link / abrir / deletar) com backdrop-blur

**Anti-IA check** PASSA parcialmente - ja usa tokens semanticos, so falta personalidade.

---

### 10. `app/finance/page.tsx` + `components/FinanceView.tsx` (595 linhas)

**Status visual 2/5** - tabela densa mas paleta gritante.

**3 problemas mais urgentes**
1. Card "Ponto de Equilibrio" (linha 374) - `from-[#7c3aed1a] to-[#7c3aed05] border-[#7c3aed33]` + texto `#a78bfa` = **assinatura roxa total**
2. Tabela por produto (linha 433) com MC em `text-[#a78bfa]` - mesma cor lilas IA
3. Footer educacional (linha 458) com `<strong>` em `text-[#888888]` + formulas em `text-[#a78bfa]` - hierarquia confusa, paleta repetida

**3 melhorias rapidas (1-2h)**
- Card "Ponto de Equilibrio": trocar gradient roxo por `from-[hsl(var(--petrol-500)/0.18)] to-[hsl(var(--petrol-500)/0.04)] border-[hsl(var(--petrol-500)/0.30)]` + texto petrol-300
- Tabela MC: trocar `text-[#a78bfa]` por `text-[hsl(var(--petrol-300))]`
- Footer educacional: titulo em `.tag` uppercase mono ("FORMULAS USADAS"), formulas com nome em petrol-300 e sinal de igual em fog-300

**1 mudanca grande (6-8h)**
Reorganizar FinanceView em 3 zonas tipograficamente claras:
- Hero numero do mes (Fraunces 64px) + delta vs mes anterior (verde/vermelho)
- Grafico monthly em RevenueLineChart com petrol-500 + ember-500 (em vez de roxo)
- Tabela de transacoes com row-height 36px (Linear-style dense) + zebra `--t-table-stripe` (que ja existe mas nao esta sendo usado)

**Anti-IA check** FALHA - card roxo "Ponto de Equilibrio" = signal-cor SaaS template.

---

### 11. `app/crm/page.tsx`

**Status visual 3/5** - kanban semantica boa, paleta caotica.

**3 problemas mais urgentes**
1. STAGE_DOT (linha 18) com 5 cores tropicais sem regra (`#888/#3b82f6/#f59e0b/#10b981/#ef4444`)
2. STATUS_COLORS (linha 10-16) duplica logica de cor + adiciona background tonal - cria 10 valores hardcoded onde poderia ter 5
3. Sem grafico de funil visual - kanban com cards iguais

**3 melhorias rapidas (1-2h)**
- Padronizar STAGE_DOT em 5 niveis de petrol (petrol-200 / petrol-300 / petrol-400 / petrol-500 / petrol-600) + 1 ember pra "won"
- Adicionar contagem por stage como `.tag` font-mono uppercase ("03 . NEGOCIANDO . 5 leads")
- Avatar do lead: gerar inicial + cor de fundo deterministica (hash do nome) em vez de cinza padrao

**1 mudanca grande (6h)**
Adicionar funnel chart no topo (5 trapezios decrescentes de petrol-500 -> petrol-200) mostrando conversao stage-a-stage. Da visao agregada que hoje falta.

**Anti-IA check** PARCIAL - estrutura kanban ok, paleta polui.

---

## Quick wins (8-10 fixes de 30min cada)

> Cada item abaixo move o ponteiro visual sem custo. Empilhados em uma tarde, mudam a percepcao do produto inteiro.

1. **Trocar "BVaz Hub" pra "Hayzer" no Sidebar.tsx:112 + TopBar.tsx:46** (5min, fix-it-now critico)
2. **Apagar a linha de gradient roxo->azul em TopBar.tsx:66-71** (3min, remove signal-cor de IA)
3. **Substituir `gradient-text` do h2 em DashboardView.tsx:104 por `text-foreground` + Fraunces** (10min)
4. **Substituir letra "B" do LoadingScreen em AppShell.tsx:34-52 por `<Image src="/logo-hayzer.png">`** (15min)
5. **Botao Salvar SettingsView.tsx:179 - trocar `bg-[#7c3aed]` por classe `btn-light`** (5min, ja existe utility)
6. **Trocar 3 cores roxas das tabs SettingsView.tsx:201 por `hsl(var(--petrol-500))` derivados** (10min)
7. **Apagar `gradient-text` da `globals.css:510-515` ou redefinir pra petrol** (10min, vira tema)
8. **Trocar `glow-purple` em globals.css:502 pra `glow-petrol` em todas as ocorrencias** (15min, find-replace global)
9. **Remover os 4 radial-gradients roxo/azul do body em globals.css:197-202 e deixar so `night-950` solido + grain sutil** (15min)
10. **Logo Sidebar.tsx:116-126 - trocar div com primeira letra accent pelo `<Image src="/logo-hayzer.png">` sm variant** (10min)

**Tempo total: ~1h45min, ganho visual: enorme.**

---

## Inspiracoes (referencias pra direcao visual)

### 1. Linear (https://linear.app) - **principal benchmark**
- Sidebar densa, section headers em SMALL CAPS uppercase, accent lateral (1.5px)
- Cards com border `rgba(255,255,255,0.06)` em vez de glow
- Tipografia: Inter no body, pesos 400/500/600 estritos, nada de gradient-text
- Empty states com ilustracao SVG simples + 1 acao primaria
- **Pra Hayzer**: copiar a logica de hierarquia (uppercase tags + body Geist + accent lateral petrol-300)
- Ref recente: https://linear.app/now/how-we-redesigned-the-linear-ui (redesign 2024 reduzindo noise)

### 2. Vercel (https://vercel.com/dashboard) - **comportamento e densidade**
- Tabelas com row 36-40px, zebra sutil, hover bg-foreground/2
- KBD command palette no topo (Cmd+K)
- Status dots com glow muito sutil (4px blur max)
- **Pra Hayzer**: copiar a paleta de status (verde-petrol = ok, ember = warning, vermelho = error)

### 3. Stripe Dashboard (https://dashboard.stripe.com) - **tipografia + confianca**
- Numeros enormes em tabular-nums display, delta inline (+12.4% verde)
- Sem glow, sem gradient, so peso tipografico
- **Pra Hayzer**: copiar a forma de mostrar "numero grande + sub-detalhe + delta" no Dashboard hero

### 4. Notion (https://notion.so) - **flexibilidade de cards**
- Cards sem cor de marca dominante, paleta neutra com 1 accent
- Empty states com ilustracao + copy parceiro ("E ai, vamos comecar?")
- **Pra Hayzer**: copiar o tom de empty state didatico-parceiro (alinhado com voz da marca)

### 5. Cron/Things (apps premium-handmade) - **anti-template**
- Detalhes obsessivos: avatar com 1px inner shadow, texto com smoothing antialiased forcado
- Animacao curta: 180ms ease-out, nunca 500ms+
- **Pra Hayzer**: copiar a obsessao com microdetalhes (border-radius nao uniforme, texto com tracking levemente negativo, etc)

**Anti-referencias** (NAO virar)
- Materio/Argon/CoreUI - templates Bootstrap admin (vibe Material 2018)
- shadcn/ui default puro sem customizacao (vibe "instalei e nao mexi")
- Tailwind UI marketing kits aplicados em dashboard (vibe template gratuito)

---

## Plano de ataque sugerido (7 semanas ate 04/07)

| Semana | Foco | Telas | Risco |
|---|---|---|---|
| **W2 (atual)** | Quick wins #1-10 + remapear globals.css (criar bloco `--dashboard-v2` que aplica petrol no dark) | Shell global | Baixo - so paleta |
| **W3** | Refatorar dashboard/shared.tsx (StatCard/Section/Panel) + DashboardView | DashboardView | Medio - mexer em muitos consumidores |
| **W4** | SettingsView + 8 sub-tabs com mesma logica (btn-light, tabs underline animado) | Settings | Baixo - ja modular |
| **W5** | Inventory + Products (CostPreview = peca-bandeira) | Operacao | Alto - arquivos gigantes |
| **W6** | Orders + Finance + CRM | Receita | Medio |
| **W7** | Portfolios + empty states + loading states em todas | Vitrine | Baixo |
| **W8 (launch)** | QA visual cruzado mobile + dark/light + a11y | Tudo | - |

---

## Auditoria anti-IA agregada

| Padrao banido | Onde aparece | Severidade |
|---|---|---|
| Gradient roxo `#7c3aed` -> lilas `#a78bfa` | 21 componentes, 70 hardcodes | **Critica** |
| Gradient text com fallback lilas | `globals.css:511`, `DashboardView.tsx:104` | **Critica** |
| Gradient roxo+azul no body | `globals.css:197-202` | **Critica** |
| Glow violeta em cards (`glow-purple`) | `globals.css:502`, varios consumidores | Alta |
| `shadow-2xl` exagerado | `AppShell DbErrorToast`, `Quick Access cards` | Media |
| 4-5 cores acento misturadas sem regra | `CostPreview`, `STAGE_DOT`, `originColors` | Media |
| Hardcodes `#1c1c1c/#2a2a2a/#888` | `inventory ItemRow`, `products` | Media |
| Cantos arredondados em TUDO (`rounded-2xl` default) | Universal | Baixa |
| Lucide default sem trato (24x24) | Universal | Baixa - resolver pos-launch |

**Veredito final**
O dashboard ja foi feito com cuidado tecnico (refatoracao DashboardView/SettingsView, density bem calibrada, dark mode pensado). Mas a paleta esta **5 anos atrasada em moda** (roxo Tailwind 2020) e em **conflito frontal com a landing v2**. O fix nao precisa ser refatoracao - precisa ser **um sweep de tokens + 10 quick wins + 5 redesigns cirurgicos**. Da pra fazer em 5 semanas, sobra W7-W8 pra polir.

---

## Sources/inspiracao web (2026)

- https://linear.app/now/how-we-redesigned-the-linear-ui - redesign Linear reducindo noise
- https://artofstyleframe.com/blog/dashboard-design-patterns-web-apps/ - padroes dashboard 2026
- https://octet.design/colors/user-interfaces/dashboard-ui-design/ - paletas SaaS modernas
- https://asappstudio.com/admin-dashboard-designs-2026/ - benchmarks 2026
