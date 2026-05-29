# QA Mobile v2 — Hayzer Bloco 3.1
> Gerado por Sofia (CS) em 2026-05-29
> Contexto: Bloco 2 entregue — wizard 4 steps + 7 empty states + branch ember mergeada em main
> Soft launch: 11/06 · Launch publico: 27/06

---

## Setup antes de comecar

- Conectar no site real: **hayzer.com.br** (producao, nao localhost)
- Limpar cache do Safari/Chrome antes de abrir (Settings > Safari > Clear History)
- Testar nos dois modos: **modo claro** e **modo escuro**
- Dispositivos alvo: **iPhone 13 Safari** + **Galaxy mid-range Chrome** (audiencia maker BR)
- Conta de teste: criar conta nova do zero (nao usar conta existente — precisa ver o wizard)
- Tempo estimado total: **75-90 min** dividido em 2 blocos de ~45 min

---

## Bloco A — Landing publica (sem login)
> Objetivo: valida se o topo do funil nao perde usuario antes de chegar no cadastro

### Hero e performance
- [ ] Pagina carrega em menos de 3s no 4G real (iPhone com dados, nao Wi-Fi)
- [ ] Hero text e imagem aparecem sem layout shift (nao "pula" enquanto carrega)
- [ ] Foto real da Bambu A1 aparece (nao placeholder cinza)
- [ ] Fraunces (fonte editorial) carrega antes do primeiro scroll

### Navegacao e CTA
- [ ] Botao CTA principal responde no primeiro toque (sem delay de 300ms)
- [ ] Link WhatsApp / waitlist abre corretamente no celular
- [ ] Header nao some ao rolar (ou some de forma intencional — anotar o comportamento real)
- [ ] Scroll entre secoes: suave, sem jank visivel

### Calculadora (magnet principal)
- [ ] /calculadora abre sem recarregar pagina
- [ ] Campos de input aceitam teclado numerico no celular (nao teclado de texto)
- [ ] Resultado aparece sem freeze apos preencher
- [ ] Calculadora fecha e volta pra landing sem perder scroll position
- [ ] Nenhum elemento fica cortado horizontalmente (sem scroll lateral involuntario)

### Modo escuro
- [ ] Cores da landing nao quebram no dark mode (texto legivel, fundo correto)
- [ ] Nenhum texto branco sobre fundo branco (invisivel)
- [ ] Icones e SVGs visiveis nos dois modos

---

## Bloco B — First-Time Experience (Wizard Onboarding — Bloco 2 entregue)
> Este bloco e critico: 80% dos churns acontecem na 1a semana. O wizard e a porta de entrada.
> Confirmar com Bruna: migration `20260520_user_settings_onboarding.sql` aplicada em prod?

### Signup e disparo do wizard
- [ ] Criar conta nova via /login → wizard aparece logo apos autenticacao
- [ ] Wizard renderiza sobre o dashboard (portal z-index 9999) sem ver o fundo quebrando
- [ ] Em iPhone: painel sobe do rodape (bottom sheet), nao abre no centro
- [ ] Em Android Chrome: mesmo comportamento bottom sheet

### Step 0 — "Seu negocio de impressao, num lugar so"
- [ ] Headline em Fraunces italico aparece correto (nao fallback Georgia/serif generico)
- [ ] Texto "Bora ver como funciona" (CTA) visivel e tocavel sem zoom
- [ ] "Ja manjo, pular pro dashboard" (skip) tocavel e funciona — leva direto ao dashboard
- [ ] Progress dots: ponto 1 ativo (expandido), pontos 2/3/4 menores
- [ ] Botao Voltar INVISIVEL no step 0 (nao ocupa espaco clicavel)
- [ ] ESC fecha o wizard (desktop — skip no mobile nao tem ESC, anotar)

### Step 1 — "Pedido chegou no WhatsApp?"
- [ ] Animacao de transicao step 0→1: slide da direita, suave, sem flicker
- [ ] Botao Voltar aparece (step >= 1)
- [ ] Toque em Voltar volta pro step 0 com animacao inversa (slide da esquerda)
- [ ] "Ja sei, pular" funciona e leva direto ao dashboard

### Step 2 — "Vendeu uma peca? Filamento ja saiu do estoque"
- [ ] Transicao suave step 1→2
- [ ] Conteudo nao transborda a altura do painel (sem scroll interno no wizard)
- [ ] Bottom sheet nao cobre 100% da tela (deve aparecer ~8% do dashboard atras — `92dvh`)

### Step 3 — "No fim do mes, tu sabe o que sobrou" (ultimo step)
- [ ] CTA "Criar meu primeiro projeto" aparece com destaque visual (glow petrol)
- [ ] "Explorar o dashboard antes" (skip do ultimo step) funciona
- [ ] Toque em "Criar meu primeiro projeto" fecha wizard e leva pra dashboard sem freeze
- [ ] Apos fechar: wizard NAO reaparece ao recarregar pagina (onboarding_completed salvo)
- [ ] Apos fechar: wizard NAO reaparece em nova aba/sessao (persiste no Supabase)

### Recuperacao de erro do wizard
- [ ] Se Supabase estiver lento: wizard nao aparece (status 'unavailable') — dashboard abre normal
- [ ] Nao ha tela branca ou freeze durante loading do status de onboarding

---

## Bloco C — 14 modulos internos (vazio + com dados)
> Para cada modulo: testar COM dados (seeds de dev) e SEM dados (empty state)
> Empty state esperado: icone container petrol 12% + titulo + descricao maker BR + CTA primario
> Verificar: nenhum roxo visivel (paleta V4 = petrol/ember/fog — roxo foi removido)

### Criterios comuns para TODOS os modulos
Para cada rota abaixo, marcar:
- [ ] Empty state aparece quando nao ha dados (icone petrol, sem roxo)
- [ ] Lista/tabela vira cards em mobile (sem tabela horizontal que obriga scroll lateral)
- [ ] Toque em item individual abre detalhe sem lag perceptivel (< 300ms)
- [ ] Botao "criar / registrar" acessivel sem precisar dar zoom
- [ ] KPI row (hero + satellites) renderiza sem overflow em tela de 375px (iPhone SE/13 mini)
- [ ] Nenhum elemento cortado no eixo horizontal

### /dashboard
- [ ] KPIs carregam (nao ficam em skeleton eterno)
- [ ] Skeleton screen aparece durante loading e some quando dados chegam
- [ ] Acesso rapido aos modulos funciona no toque
- [ ] Criterios comuns acima

### /orders (pedidos)
- [ ] Empty state: "Sem pedido por enquanto" + icone ShoppingCart + botao "Registrar primeiro pedido"
- [ ] Modo "no-results" (filtro ativo sem resultado): aparece mensagem de filtro + botao "Limpar filtros"
- [ ] Badge de status (ATRASADOS em ember) visivelno mobile sem corte
- [ ] Filtros fecham ao tocar fora (nao ficam presos)
- [ ] Criterios comuns acima

### /customers (clientes)
- [ ] CustomersEmptyState aparece quando orders esta vazio (clientes sao derivados de orders)
- [ ] Modal de perfil de cliente abre em mobile sem sair da tela
- [ ] Tabs (todos/vip/recorrente/sumido) funcionam no toque
- [ ] Criterios comuns acima

### /crm (leads)
- [ ] LeadKanbanBoard: colunas do kanban nao exigem scroll lateral (adapta pra lista em mobile)
- [ ] LeadCard ocupa largura total em mobile
- [ ] Skeleton screen do crm aparece durante loading
- [ ] Criterios comuns acima

### /products (produtos)
- [ ] ProductEmptyState aparece
- [ ] ProductCard renderiza sem imagem cortada
- [ ] Filtros de produto funcionam no toque
- [ ] Criterios comuns acima

### /inventory (estoque)
- [ ] InventoryEmptyState aparece
- [ ] InventoryLowStockBanner (alerta estoque baixo) visivelno topo quando ha itens criticos
- [ ] InventoryKpiRow nao transborda em 375px
- [ ] Criterios comuns acima

### /production (producao)
- [ ] ProductionEmptyState aparece
- [ ] PrinterBoard: cada impressora aparece como card (nao tabela horizontal)
- [ ] ElapsedTimer atualiza em tempo real no celular (nao para)
- [ ] Criterios comuns acima

### /finance (financeiro)
- [ ] Skeleton screen do finance aparece durante loading
- [ ] Tabs (Lancamentos / Custos Fixos / Break Even) funcionam no toque
- [ ] BreakEvenSection legivel em mobile (nao transborda)
- [ ] Alerta amber (margem < 15%) aparece se aplicavel
- [ ] Criterios comuns acima

### /content (conteudo)
- [ ] ContentEmptyState aparece
- [ ] Criterios comuns acima

### /decisions (decisoes)
- [ ] DecisionsEmptyState aparece
- [ ] Criterios comuns acima

### /catalogs (catalogos)
- [ ] CatalogsEmptyState aparece
- [ ] Criterios comuns acima

### /portfolios (portfolios)
- [ ] PortfoliosView renderiza sem overflow
- [ ] Criterios comuns acima

### /settings (configuracoes)
- [ ] Tabs de settings (8 abas) funcionam no toque em mobile
- [ ] Campos de formulario com teclado nao escondem o campo atras do teclado virtual
- [ ] Criterios comuns acima

### /catalogo/[slug] (publico — cliente final)
- [ ] FloatingWhatsApp aparece e e clicavel sem cobrir conteudo principal
- [ ] QuoteModal abre em mobile sem sair da viewport
- [ ] ProductCard com imagem carrega sem layout shift
- [ ] ListTemplate e MinimalTemplate renderizam correto em 375px

---

## Bloco D — Golden Path #1 (smoke test completo)
> Executar o fluxo end-to-end sem pular etapa. Este e o flow do maker no dia a dia.
> Referencia: doc 2026-05-29-golden-path-smoke-test.md (se existir) ou executar a sequencia abaixo

1. [ ] Criar conta nova
2. [ ] Wizard aparece → navegar pelos 4 steps → concluir com "Criar meu primeiro projeto"
3. [ ] Dashboard abre — KPIs visiveis
4. [ ] /crm → criar lead novo
5. [ ] Lead → converter em pedido (botao ConvertToOrderModal)
6. [ ] /orders → pedido aparece na lista
7. [ ] /production → impressao aparece na fila
8. [ ] /finance → lancamento de receita aparece
9. [ ] /inventory → verificar se item de estoque foi descontado (se produto tem filamento configurado)
10. [ ] /customers → cliente aparece derivado do pedido

Se qualquer etapa travar ou nao funcionar: reportar como P0.

---

## Como reportar bugs

Usar formato abaixo. Screenshots obrigatorios para P0.

```
Severidade: P0 / P1 / P2
Modulo: /orders (ou Landing, Wizard, etc)
Dispositivo: iPhone 13 Safari / Galaxy A34 Chrome
Descricao: o que aconteceu
Reproduzir: passo 1, passo 2, passo 3
Screenshot: [anexar]
```

**P0 — Bloqueador do soft launch 11/06**
Exemplos: wizard nao aparece, empty state com cor roxa (regressao), crash de rota, CTA que nao funciona, dado que nao salva.

**P1 — Importante mas nao bloqueia launch**
Exemplos: animacao travada, layout cortado em 1 dispositivo especifico, loading eterno em modulo secundario.

**P2 — Polimento**
Exemplos: texto desalinhado, espacamento estranho, feedback de erro generico.

---

## Notas tecnicas para o time apos QA

- Se wizard nao disparar: confirmar com Bruna que migration `20260520_user_settings_onboarding.sql` foi aplicada em prod
- Se empty states aparecerem com roxo: branch `feature/empty-states-p1` pode nao ter sido mergeada — verificar
- Se CRM kanban quebrar em mobile: `LeadKanbanBoard` nao tem fallback lista — Felipe priorizar antes do launch
- Se Fraunces nao carregar: validar `Highest` priority no Network tab prod (Next.js 16 preload)
- TBT ainda em 3.6s em prod — nao e bug deste QA, e debito tecnico (branch `feature/perf-tbt-fix` pendente merge)
