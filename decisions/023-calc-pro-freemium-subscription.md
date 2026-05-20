# ADR 023 — Calculadora Pro: troca de Lifetime R$ 37 por Freemium SaaS Subscription

> **Data**: 2026-05-20
> **Status**: Aceito (aguarda execução do CEO no Stripe Dashboard + Vercel)
> **Decisor**: Gabriel (CEO) — input de Helena (estratégia) + Paulo (financeiro) + Felipe (frontend, em paralelo)
> **Custo de reversão**: MÉDIO — backend novo isolado em `calc_pro_subscriptions` (tabela nova, não toca catálogo) + UI da `/calculadora` precisa retroceder. Stripe Price antigo pode ser reativado em <5 min. Compras lifetime já realizadas (se houver) ficam grandfathered.
> **Substitui**: parte da `payments/calc-pro-integration-spec.md` referente a Payment Link único de R$ 37 lifetime (essa decisão suspende o modelo lifetime — não deleta o spec antigo, deixa como histórico).

---

## Contexto

A Calculadora Pro era a primeira aposta de receita do Hayzer pré-launch (Semana 3, 25-31/05/2026) com modelo de pagamento único:

- **Preço**: R$ 37 BRL via Stripe Payment Link
- **Promessa**: lifetime (paga uma vez, usa pra sempre, sem mensalidade)
- **Mecânica**: cliente compra, recebe acesso por email, sem login

O modelo foi escolhido em 18/05 (decisão Helena) por reduzir fricção: pagamento único é mais fácil de vender do que mensalidade pra maker 3D BR que ainda não confia 100% no produto. Pagamento único também elimina churn por design.

### O que disparou a revisão

Em 20/05/2026 o CEO comparou o modelo lifetime com o estado real do mercado de calculadoras 3D BR:

- **ZoomCalc3D** (concorrente direto): grátis e capturou share relevante de maker BR. Posicionamento de utilidade pública.
- **Volume real esperado**: mesmo otimista, modelo lifetime gera R$ 37 × N compras. Se N = 200 em 6 meses, faz R$ 7.400. Não cobre custo de manutenção sustentada da feature (PDF, histórico, perfis de impressora) que precisa evoluir.
- **Lock-in zero**: cliente lifetime que cancela não tem custo. Não tem retorno recorrente, não tem indicador de saúde do produto. CAC pago uma vez, LTV finito e baixo.
- **Custo Stripe BR**: 3.99% + R$ 0.39 + IOF 3.5% = ~7.88% de carga total. Em R$ 37, isso é R$ 2.92 de fee = 8% net. Em transação recorrente o custo é igual, mas dilui no LTV.
- **Sinal de SaaS pra investidor/parceiro futuro**: Hayzer principal é SaaS recorrente. Ter um produto satélite lifetime no portfólio confunde a tese ("eles vendem one-time ou recorrente?").

CEO decidiu: **trocar lifetime por subscription mensal**. Modelo freemium SaaS clássico.

---

## Decisão

**Calculadora Pro passa a ser SaaS subscription mensal, com tier grátis sustentável e Pro paywall.**

### Tier Grátis (sustentável, não trial)
- 5 cálculos por dia (limite por usuário/email/IP)
- Cálculo de custo (filamento + luz) + preço sugerido
- Slider visual de margem
- Watermark "feito com Hayzer" no rodapé do PDF
- Suficiente pra maker hobbyista — não força upgrade artificialmente

### Tier Pro (subscription mensal recorrente)
- **Preço sugerido**: R$ 19 / mês (justificativa na seção "Preço recomendado")
- **Trial**: 7 dias com cartão (reduz fricção sem dar grátis indefinido)
- **Cobrança**: Stripe Subscription, cartão BR + PIX recorrente quando suportado
- **Cancelamento**: a qualquer momento via Stripe Customer Portal (LGPD-compliant)
- **Conteúdo**: cálculos ilimitados, PDF profissional sem watermark, histórico, multi-impressora, USD/EUR, suporte prioritário

---

## Preço recomendado: R$ 19/mês

### Justificativa

O preço foi escolhido com base em três vetores: (1) referência de mercado BR — ZoomCalc3D é grátis, então o Pro precisa entregar valor evidente acima do gratuito sem se posicionar como ferramenta cara; (2) ticket psicológico maker — R$ 19 entra na faixa de "compra por impulso individual sem precisar autorizar com parceiro/contador"; (3) viabilidade unitária — após Stripe fee 3.99% + R$ 0.39 + IOF 3.5%, ficam aproximadamente R$ 16,55 líquidos por assinatura, com margem suficiente pra cobrir custo de infraestrutura proporcional.

Alternativas avaliadas: R$ 29/mês ficaria competitivo com Nuvemshop básico mas exigiria onboarding mais sofisticado pra justificar; R$ 39/mês entraria em território de ERP enxuto (Bling Mini R$ 30) e quebraria a régua de "ferramenta única" da calculadora. R$ 19 é o ponto de equilíbrio entre conversão e LTV mínimo defensável.

### Janela de teste
- 60 dias após launch (27/06/2026)
- KPI primário: taxa free → trial ≥ 4% e trial → paid ≥ 30%
- Se ambos baterem, manter R$ 19. Se trial → paid abaixo, **subir** pra R$ 29 (cliente que paga R$ 19 fácil tende a pagar R$ 29 também — preço não é a alavanca quando conversão de trial está fraca, é a percepção de valor)

---

## Alternativas consideradas

### A) Subscription mensal R$ 19 + Trial 7d ✅ ESCOLHIDA
- **Prós**: LTV recorrente, churn como sinal de saúde, alinhamento com Hayzer principal (SaaS), barreira de entrada baixa (R$ 19 + trial), Customer Portal já resolve cancelamento LGPD.
- **Contras**: requer login real (não dá pra fazer subscription anônima por email — Stripe exige `customer.id`), aumenta complexidade do MVP em ~3-4h de backend. Risco de "ah, mais uma mensalidade" no maker BR — mitigado pelo trial.

### B) Manter Lifetime R$ 37
- **Prós**: simples, modelo já documentado, fricção menor de venda inicial.
- **Contras**: LTV finito, sem sinal de saúde, desalinhado com tese SaaS Hayzer, custo de feature evolutiva não cobre. **Razão de rejeição**: CEO afirmou que prefere errar pra cima em ambição de modelo do que errar pra baixo e ter que migrar 6 meses depois (custo de migração lifetime → subscription é alto — clientes lifetime resistem).

### C) Freemium puro sem Pro (calculadora 100% grátis + ads/upsell pro SaaS Hayzer)
- **Prós**: zero fricção de venda, máximo top-of-funnel, calculadora vira lead magnet pro produto principal.
- **Contras**: receita zero direta, dependência total do funil pro SaaS principal converter, sem aprendizado de pricing. **Razão de rejeição**: timing — Hayzer principal ainda não lançou (27/06). Calculadora precisa rodar como produto independente pra validar willingness-to-pay antes do produto principal. Volta a ser opção se Pro converter mal por 60 dias.

### D) Subscription anual com desconto (R$ 19/mês ou R$ 197/ano)
- **Prós**: melhora LTV upfront, reduz churn mensal natural.
- **Contras**: complexidade dobrada no MVP (2 prices), confunde decisão do cliente. **Razão de rejeição**: postergar pra v1.1 — quando volume validar que mensal funciona, adicionar anual como upgrade-in-place.

---

## Consequências

### Positivas (esperadas)
- **MRR recorrente desde dia 1**: cada Pro assinante vira pedaço estável de receita
- **Sinal de saúde via churn**: se cliente cancela em 1 mês, sabemos que produto não retém — corrigimos. Lifetime esconde esse sinal.
- **Alinhamento de tese**: Hayzer todo passa a ser SaaS recorrente — calculadora + produto principal compartilham mesma narrativa
- **Customer Portal nativo**: Stripe cuida de cancelamento, mudança de cartão, faturas — zero código nosso pra LGPD
- **Trial 7d reduz objeção de compra**: cliente experimenta antes de pagar, gera senso de propriedade ("já é meu, não vou cancelar")

### Negativas (aceitas)
- **Complexidade técnica +3h**: precisa de tabela nova, RPC subscription state, handler de 5 eventos Stripe (vs 1 do Payment Link), página de status pra UI consultar
- **Login obrigatório**: calculadora grátis hoje é anônima. Pro vai exigir login pra atrelar `auth.users.id` ao `stripe_customer_id`. UX precisa cobrir.
- **Risco de "cancelei e perdi tudo"**: cliente que assinou e cancela perde histórico Pro. Mitigação: histórico fica no navegador local (não no DB) — cancelar Pro não apaga cálculos passados, só bloqueia features Pro.
- **Suporte pós-launch maior**: subscription gera tickets ("cobrei 2x", "cancelei e foi cobrado", "quero estornar mês 3"). Resolvido pelo Customer Portal + runbook Paulo.

### Mitigações
- **Compras lifetime existentes ficam grandfathered**: se algum cliente comprou pelo Payment Link antigo entre 18/05 e 20/05, mantém acesso lifetime sem cobrança. Tabela `calculadora_pro_purchases` (lifetime) permanece como fonte de verdade pra esses casos. `calc_pro_subscriptions` (nova) é tabela paralela.
- **Trial 7d com cartão**: cobra apenas se cliente não cancelar antes — Stripe trata. Reduz risco de "trial sem cartão = abuso".
- **Reconciliação diária Supabase ↔ Stripe**: query semanal pra confirmar que `subscriptions` no DB bate com `subscriptions ativas` no Stripe Dashboard.

---

## Plano de rollout (ordem obrigatória)

### Fase 0 — CEO faz no Stripe Dashboard (~10 min)
Documentado em `payments/setup-stripe-calc-pro.md`.

1. Criar **Product** `Hayzer Calc Pro`
2. Criar **Price** recurring `R$ 19 / month`
3. Criar **Checkout configuration** com `trial_period_days: 7`
4. Criar **Payment Link** novo (subscription mode)
5. Habilitar **Customer Portal** (Settings → Billing → Customer Portal)
6. Registrar **Webhook endpoint** novo (eventos `customer.subscription.*` + `invoice.*`)

### Fase 1 — CEO faz no Vercel Dashboard (~5 min)
1. Trocar `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_CALC_PRO` pelo novo Payment Link
2. Adicionar `STRIPE_CALC_PRO_PRICE_ID` (price_xxxx do passo 2)
3. Adicionar `STRIPE_CALC_PRO_WEBHOOK_SECRET` (whsec_xxx do passo 6)
4. Redeploy (use existing cache)

### Fase 2 — Bruna aplica migration via Supabase MCP
- `supabase/migrations/20260520_calc_pro_subscriptions.sql`
- Verificar RLS + indexes + UNIQUE em `stripe_subscription_id`

### Fase 3 — Paulo testa E2E em sandbox antes de promover pra live
1. Stripe Dashboard em modo Test
2. Cartão de teste `4242 4242 4242 4242`
3. Validar: subscription criada → webhook chega → row em `calc_pro_subscriptions` → trial_end correto
4. Validar: cancelamento via Customer Portal → webhook `customer.subscription.deleted` → row marcada `status='canceled'`
5. Validar: signature inválida → 401
6. Validar: webhook duplicado (Stripe "Resend" event) → 200 sem dobrar row

### Fase 4 — Promover Stripe Test → Live
1. Trocar `STRIPE_SECRET_KEY` test pelo live
2. Trocar `STRIPE_CALC_PRO_WEBHOOK_SECRET` test pelo live
3. Compra real R$ 0,50 (CEO estorna depois)
4. Confirma fluxo end-to-end em prod

---

## Arquivos afetados

| Arquivo | Mudança | Status |
|---|---|---|
| `decisions/023-calc-pro-freemium-subscription.md` | Este ADR | Criado |
| `payments/setup-stripe-calc-pro.md` | Passo-a-passo CEO no Stripe Dashboard | Criado |
| `supabase/migrations/20260520_calc_pro_subscriptions.sql` | Tabela `calc_pro_subscriptions` + RLS + RPC | Criado (NÃO aplicado) |
| `services/calcProSubscription.ts` | Service layer (get/upsert/check active) | Criado |
| `payments/stripe.ts` | Adiciona `getCheckoutUrlSubscription` + `cancelSubscription` | Atualizado |
| `app/api/webhooks/payment/route.ts` | Adiciona suporte a eventos subscription | Atualizado |
| `app/api/calc-pro/status/route.ts` | GET retorna status da subscription do user logado | Criado |
| `.env.example` | Adiciona `STRIPE_CALC_PRO_PRICE_ID` + `STRIPE_CALC_PRO_WEBHOOK_SECRET` | Atualizado |

---

## Estimativa de custo Stripe (paranoia mode Paulo)

Para R$ 100 transacionados em assinatura recorrente no Brasil (cartão):

| Item | Valor |
|---|---|
| Stripe processing fee | 3.99% + R$ 0.39 = R$ 4,38 |
| IOF (cartão crédito BR) | 3.5% = R$ 3,50 |
| **Total fee** | **R$ 7,88 (7.88%)** |
| **Net recebido** | **R$ 92,12** |

Para R$ 19/mês especificamente:
- Stripe + IOF combinados: R$ 2,45
- Net por assinatura: ~R$ 16,55/mês
- Em 12 meses (1 cliente Pro): R$ 198,60 net

Comparação com lifetime R$ 37 anterior:
- Net por compra lifetime: R$ 37 - (R$ 1,87 stripe + R$ 1,30 IOF) = ~R$ 33,83 net
- Equivalente a ~2 meses de subscription Pro
- Mês 3 em diante, subscription **supera** lifetime em receita por cliente

Conclusão: **a partir do mês 3 da retenção média**, subscription bate lifetime. Se churn médio for menor que 33%/mês, modelo subscription é ganhador em todos os cenários.

---

## LGPD + Compliance

- **Cancelamento self-service**: Customer Portal Stripe permite cancelar a qualquer hora, requisito LGPD art. 18 (direito ao titular de cancelar tratamento de dados)
- **Recibo automático**: Stripe envia receipt PDF próprio após cada cobrança (cliente pode comprovar pagamento sem nos pedir)
- **Refund**: pedido em <7 dias = CEO estorna no Stripe Dashboard direto, no mesmo dia (política mantida do modelo lifetime)
- **Dados sensíveis nunca logados em chat/log**: `payment_intent_id`, `customer_id`, `subscription_id` nunca aparecem em chat de suporte público. Em logs internos, sempre máscara — `cus_1234...` em vez de string completa.
- **Webhook signature obrigatória**: rejeita evento sem `Stripe-Signature` válida ANTES de tocar DB. Sem isso, qualquer um forja "subscription criada".

---

## Status

**Aceito** em 20/05/2026 por Gabriel (CEO), input de Paulo (financeiro). Aguarda execução do CEO nas fases 0 e 1.

---

## Relacionados

- `payments/setup-stripe-calc-pro.md` — Passo-a-passo Stripe Dashboard + Vercel
- `payments/calc-pro-integration-spec.md` — Spec antigo (lifetime) — mantido como referência histórica
- `decisions/003-stripe-connect-standard.md` — padrão Stripe Connect (não se aplica aqui: Calc Pro é da platform account, não connected account)
- `supabase/migrations/20260518_webhook_events.sql` — tabela compartilhada de idempotência
- `services/calcProSubscription.ts` — service layer da subscription
- `ROADMAP.md` § Semana 3 — janela de lançamento Calc Pro
