# Golden Path #1 — Smoke Test Manual

**Bloco:** 3.3
**Fluxo:** lead → pedido → producao → finance
**Data:** 2026-05-29
**Responsavel QA:** Julia (G7)

---

## Setup

- Conta teste: criar conta nova via signup com email de teste (ex: hayzer.test+gp1@gmail.com)
  - REQUER OK DO CEO se usar email real — o signup dispara welcome email via Resend
  - Alternativa sem custo: usar conta existente de dev e apagar os dados apos o teste
- Aceitar o wizard de 4 etapas (feature/onboarding-wizard — confirmar se branch foi merged antes de rodar)
- Criar 1 projeto (nome sugerido: "Smoke Test GP1")
- Ter pelo menos 1 impressora configurada (Bambu ou Flashforge — necessario no Passo 3)

---

## Passo 1: Criar Lead (/crm)

1. Navegar para /crm
2. Confirmar que o skeleton aparece durante o carregamento (useStoreModule lazy)
3. Clicar em "Novo Lead"
4. Preencher:
   - Nome: "Cliente Teste GP1"
   - Contato: "11999990001" (numero sem mascara — testar extracao de whatsapp)
   - Source: WhatsApp
   - Status: Novo
   - Valor esperado: 150
   - Projeto: "Smoke Test GP1"
5. Salvar
6. Confirmar:
   - [ ] Lead aparece no kanban na coluna "Novo"
   - [ ] Lead aparece na view lista (alternar com toggle Kanban/Lista)
   - [ ] KPI "Leads Ativos" incrementa em 1
   - [ ] Lead NAO aparece em outro projeto (RLS multi-tenant)

---

## Passo 2: Converter Lead em Pedido (/crm)

1. No card do lead "Cliente Teste GP1", clicar no botao "Pedido" (icone ShoppingCart)
   - Botao visivel APENAS quando lead nao tem convertedOrderId ainda
2. Modal "Converter em Pedido" abre
3. Confirmar que os campos pre-preenchidos estao corretos:
   - Nome do lead e contato exibidos no bloco readonly
   - Valor pre-preenchido com 150 (herdado do lead)
4. Preencher:
   - Item: "Suporte Bambu A1 Mini"
   - Valor: 150
   - Status: "Pago" (opcao "paid" no select)
   - Data: hoje
5. Clicar "Criar Pedido"
6. Confirmar:
   - [ ] Modal fecha sem erro
   - [ ] Lead recebe badge verde "Pedido criado" (icone CheckCircle)
   - [ ] Botao "Pedido" some do card (convertedOrderId preenchido)
   - [ ] Lead muda status para "won" no kanban
   - [ ] Ir para /orders e confirmar pedido "Cliente Teste GP1 / Suporte Bambu A1 Mini" aparece
   - [ ] Campo source_lead_id preenchido (verificar no Supabase ou via Network tab: insert no orders deve ter source_lead_id = id do lead)

**Teste de idempotencia (edge case critico):**
- Tentar clicar "Pedido" novamente no mesmo lead (nao deve ser possivel — botao some)
- Se por acidente o botao ainda aparecer: clicar 2x rapido no "Criar Pedido" deve retornar alreadyConverted=true sem duplicar pedido no DB

---

## Passo 3: Mover Pedido para Producao (/orders → /production)

1. Navegar para /orders
2. Localizar o pedido "Cliente Teste GP1"
3. Abrir o pedido e clicar em "Adicionar a Fila" (ou via /production diretamente)
4. Em /production, clicar em "Adicionar"
5. No modal "Adicionar a Fila", preencher:
   - Vincular ao pedido: selecionar "Cliente Teste GP1 — Suporte Bambu A1 Mini"
   - Impressora: Bambu (ou a disponivel)
   - Horas estimadas: 4
   - Prioridade: 1
6. Salvar
7. Confirmar:
   - [ ] Item aparece na tab "Em andamento" em /production
   - [ ] KPI "Impressoes Ativas" incrementa em 1
   - [ ] Campo project_id do item de producao bate com o projeto "Smoke Test GP1"
     (derivedProjectId via orderProjectId — confirmar no Network que o insert tem project_id correto)
   - [ ] PrinterBoard exibe a impressora com o item alocado

**Iniciar impressao (side effect):**
8. No item de producao, mudar status para "Imprimindo" (via menu ou botao da impressora no PrinterBoard)
9. Confirmar:
   - [ ] Se houver produto com filamento vinculado: movimento de estoque "out" gerado automaticamente
   - [ ] Transacao de despesa "Filamento: ..." criada em /finance (side effect do changeStatus)
   - [ ] Se nao houver produto/filamento configurado: nenhum erro, status muda normalmente

---

## Passo 4: Finalizar Pedido (/production)

1. Em /production, localizar o item "Suporte Bambu A1 Mini"
2. Mudar status para "Concluido" (done)
3. Confirmar:
   - [ ] Item migra da tab "Em andamento" para tab "Finalizadas"
   - [ ] Item aparece com opacidade reduzida (estilo visual de done)
4. Navegar para /orders
5. Confirmar:
   - [ ] Pedido "Cliente Teste GP1" ainda aparece (production.done NAO atualiza status do pedido automaticamente — confirmar comportamento esperado)
   - Nota: o fluxo atual nao tem atualizacao automatica orders.status → "delivered" ao concluir producao. Isso e gap de integracao documentado abaixo.

---

## Passo 5: Verificar Finance (/finance)

1. Navegar para /finance
2. Confirmar:
   - [ ] Se o status "Imprimindo" foi acionado no Passo 3 com produto+filamento configurados: transacao de despesa de filamento aparece
   - [ ] Transacao tem project_id = "Smoke Test GP1" (multi-tenant correto)
   - [ ] Valor da despesa bate com o calculo: (gramas_base * (1 + taxa_falha)) * custo_por_grama
3. Observar:
   - [ ] NAO deve haver transacao de receita automatica ao criar o pedido (a receita financeira do pedido nao e criada automaticamente — isso e um gap de integracao)
   - Se aparecer uma transacao de receita automatica: registrar como achado inesperado

---

## Checkpoints

- [ ] Lead criado RLS-isolado (so seu user ve — abrir em aba anonima ou outro usuario confirma)
- [ ] Pedido cross-referenced lead via source_lead_id (verificar no Network tab: insert orders contem source_lead_id)
- [ ] Producao tem project_id (multi-tenant) — derivado via orderProjectId no handleCreate
- [ ] Finance transaction tem project_id (transacao de filamento, se gerada)
- [ ] Sentry sem erros durante o fluxo (Sentry previsto para 17/06 — marcar como "nao aplicavel" se nao estiver ativo)
- [ ] PostHog dispara events: lead_created, lead_converted, order_created, production_started, production_completed
  - Abrir PostHog Live Events durante o fluxo e confirmar cada evento
  - Se eventos nao aparecerem: verificar se posthog esta ativo em prod (env NEXT_PUBLIC_POSTHOG_KEY)

---

## Gaps de integracao identificados (nao sao bugs do smoke, sao lacunas de produto)

1. **Producao concluida NAO atualiza status do pedido:** ao marcar item como "done" em /production, o pedido em /orders permanece no status original (ex: "paid"). Nao ha callback ou trigger que mude orders.status para "delivered". O smoke test CONFIRMA esse comportamento — nao e um bug novo, e gap conhecido.

2. **Pedido pago NAO gera transacao de receita automaticamente:** ao converter lead com status="paid", nenhuma transacao financeira de receita e criada. O usuario precisa lancar manualmente em /finance. Confirmar se isso e intencional ou gap de produto.

3. **Producao criada sem orderId vinculado:** o form de producao permite criar item sem selecionar pedido (orderId opcional). Nesse caso, project_id e derivado do filtro ativo ou do primeiro projeto — comportamento pode surpreender usuario. Observar durante o teste.

---

## Riscos tecnicos a observar

**Risco 1 — project_id nulo em producao (MEDIO)**
O campo `project_id` em producao e derivado indiretamente via `orderProjectId(data.orderId)`. Se o pedido nao for encontrado no state local no momento do handleCreate (race condition com lazy load do store), `derivedProjectId` pode ficar vazio string `''`. O `toDB` persiste `p.projectId || null`, entao o insert vai para o DB com `project_id = null`. Isso quebra o filtro multi-tenant em `productionService.getAll` quando `projectId` e passado. Verificar no Network tab o payload do insert em production.

**Risco 2 — convertToOrder sem finance trigger (BAIXO/MEDIO)**
`leadsService.convertToOrder` e atomico (insert order + update lead), mas nao dispara nenhum side effect de finance. Se o pedido for criado com status="paid", o usuario espera ver uma entrada de receita em /finance, mas ela nao existe. Nao e bug tecnico, mas e gap de UX que pode confundir no soft launch (11/06). Documentar feedback do CEO ao testar.

---

## Autorizacao necessaria do CEO

**SIM — criar conta nova via signup requer OK:**
O signup dispara email de boas-vindas via Resend (services/email.ts, template welcome HTML+texto). Usar email real consome quota Resend e cria registro real no Supabase Auth. Alternativas sem OK:
- Usar conta dev ja existente + limpar dados manualmente apos teste
- Usar Supabase Studio para criar usuario direto (bypassando o wizard e o email)

**NAO requer OK:**
- Criar lead, pedido, item de producao e transacao em conta de dev existente
- Deletar os registros apos o smoke (DELETE via UI ou Supabase Studio)

---

## Recomendacao

Segurar release de Bloco 3.3 ate confirmar:
1. project_id nao fica nulo no insert de producao (Risco 1)
2. PostHog disparando os 5 eventos do golden path

Os gaps de integracao (finance sem receita automatica, production sem callback para orders) sao conhecidos e nao bloqueiam — desde que documentados para o CEO antes do soft launch 11/06.
