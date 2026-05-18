# Comparativo de Gateways de Pagamento BR (AbacatePay vs Stripe vs Mercado Pago)

> **Autor**: Paulo (Financial Officer Sênior G7)
> **Data**: 2026-05-18
> **Trigger**: CEO Gabriel descobriu AbacatePay e perguntou se vale pivotar antes de finalizar Stripe Payment Link na Calc Pro (Decisão Helena Semana 3, 25-31/05).
> **Runway**: R$ 1.680 + 1 mês. Cada hora gasta em retrabalho é hora não vendendo Lifetime.
>
> **Veredito antecipado (TL;DR)**: NÃO pivotar pra AbacatePay no curto prazo. Manter Stripe Payment Link pra Calc Pro lançar 30/05. AVALIAR AbacatePay como provider COMPLEMENTAR na Onda 2 (recorrência mensal pós-validação) com PoC controlado. Detalhes nas seções 3 e 4.

---

## 0. Premissas (não negociáveis)

1. **Não é teoria, é dinheiro**: 1% de bug em pagamento = 100% de cliente perdido (filosofia Paulo).
2. **Idempotência é religião**: webhook signature antes de qualquer lógica + lock atômico (já implementado em `webhook_events`, fix 2026-05-18).
3. **Sandbox antes de prod**: nada de "vai dar certo, é gateway novo".
4. **Reconciliação diária**: prod precisa bater com extrato do gateway.
5. **Custo de pivotar > 0**: retrabalho não é grátis. Stripe Payment Link já tá spec pronto e CEO tá meio caminho.

---

## 1. Tabela mestra (taxas oficiais 2026-05-18)

> Todos os valores foram verificados nas páginas oficiais nesta data. Mudanças posteriores podem invalidar este doc.

### 1.1 Taxas por método de pagamento

| Método | AbacatePay | Stripe BR | Mercado Pago (Link) |
|---|---|---|---|
| **PIX único** | **R$ 0,80 fixo por transação** | **1,19% por PIX pago** (invite-only) | **0,99% por PIX** (D+0 imediato) |
| **PIX recorrente** | **R$ 0,80 fixo por parcela** | Não suportado em Subscriptions | Não suportado nativamente |
| **Cartão crédito à vista** | **3,5% + R$ 0,60** | **3,99% + R$ 0,39** (cartão BR) | **4,98%** (recebe na hora) ou **3,99%** (recebe em 30d) |
| **Cartão internacional** | Não documentado | **+ 2%** sobre 3,99% (total 5,99% + R$ 0,39) | Aceita, taxa similar BR |
| **Boleto bancário** | Aceita (taxa não publicada na home) | **R$ 3,45 por boleto pago** | Disponível no Link |
| **Cartão parcelado 12x** | 3,5% + R$ 0,60 por parcela | Sim, taxa idêntica à vista | **4,99% recebe na hora** ou escala até 12x |
| **Taxa de assinatura** | **Zero — usa taxa do método** | **+ 0,7% sobre volume** (Stripe Billing) | Não tem Billing nativo no Link |
| **Chargeback** | Não publicado | **R$ 55,00 por contestação recebida** | Política específica MP |
| **Saque pra conta bancária** | **R$ 0,80 (até 20/mês) → R$ 2,50 (21º+)** | Saída automática pra conta vinculada | Conta MP nativa, transferência grátis pra mesmo titular |

### 1.2 Tempo de recebimento (D+N)

| Gateway | PIX | Cartão à vista | Boleto |
|---|---|---|---|
| **AbacatePay** | D+0 (na hora, com saque manual via PIX) | Não documentado oficial (esperado D+30 padrão BR) | Após compensação (3 dias úteis) |
| **Stripe BR** | D+0 (na hora pro saldo Stripe) | D+30 a partir do pagamento (default), pode pedir D+2 | D+0 após compensação |
| **Mercado Pago** | **D+0 (na hora)** | **3,99% se aceitar D+30 ou 4,98% se quiser na hora** | Após compensação |

**Observação financeira**: Mercado Pago já paga você "na hora" se topar pagar 4,98% no cartão. Stripe te trava 30 dias por padrão. Pra runway curto, isso importa (capital de giro).

### 1.3 Disponibilidade histórica e estabilidade

| Critério | AbacatePay | Stripe | Mercado Pago |
|---|---|---|---|
| **Anos no mercado** | **18 meses** (fundada 28/11/2024) | 14 anos (2010) | 22 anos (Argentina 2003, BR 2007) |
| **CNPJ** | 58.271.413/0001-90 (Purple Box Tecnologia LTDA, Ourinhos-SP) | Stripe Payments Brasil (filial BR de empresa US) | Mercado Pago Pagamentos LTDA (parte da MercadoLibre) |
| **Capital regulatório** | ME (pequeno porte) | Bilhões USD | Bilhões USD |
| **Incidente público documentado** | **SIM — 16-17/01/2026, 36h de downtime, post-mortem oficial** | Incidentes pontuais, status page transparente, raramente >2h | Incidentes pontuais, comunicação razoável |
| **Reclame Aqui** | 3 reclamações totais, **50% de resolução nos últimos 6 meses** | Não é o canal típico (Stripe não vende pra varejo BR) | Volume alto (mas é o gigante do BR), nota razoável |
| **Risco de falência/blacklist bancária** | **Mais alto** (fintech jovem, dependente de banco parceiro) | Baixíssimo | Baixíssimo |

### 1.4 API, SDK e developer experience

| Critério | AbacatePay | Stripe | Mercado Pago |
|---|---|---|---|
| **Qualidade docs** | Boa (docs.abacatepay.com) | **Padrão-ouro do mercado** | Razoável, fragmentada |
| **SDK Node/TS** | Sim (oficial) | Sim (oficial, maduro) | Sim (oficial) |
| **Webhook signature** | HMAC-SHA256 via `X-Webhook-Signature` (timingSafeEqual) | HMAC-SHA256 via `Stripe-Signature` (timestamp + secret, `stripe.webhooks.constructEvent`) | HMAC-SHA256 via `x-signature` |
| **Retry policy webhook** | **Não documentado publicamente** (Paulo desconfortável aqui) | 3 dias retry exponencial (5min → 30min → 2h → 5h → 10h → 12h × 3 dias) | Retry similar Stripe |
| **Idempotency key outbound** | Não documentado | **Sim, header `Idempotency-Key`** | Sim, header `X-Idempotency-Key` |
| **Sandbox/test mode** | Sim, modo `devMode` no payload | Sim, chave `sk_test_...` | Sim, credenciais sandbox |
| **Eventos webhook** | 13 tipos (checkout/payment/subscription completed/refunded/disputed) | 200+ tipos, granulares | ~30 tipos |
| **Aprovação cadastro** | **Pode levar até 72h, MEI/CNPJ recém-criado tem alta chance de reprovação** | Cadastro online, aprovação geralmente em horas-dias | Cadastro instantâneo (MercadoLibre account) |
| **Suporte humano** | Chat + WhatsApp (relato de reclamação: "responde em dias") | Email + Chat (24/7 em inglês, BR em português ok) | Chat + telefone (volume alto, fila) |
| **Comunidade indie hacker BR** | **Forte** (Daniel Limae construiu comunidade ativa) | Existe globalmente | Existe mas menos focada |

### 1.5 Marketplace / Split / Multi-tenant

> Crítico pra Onda 4 do Hayzer: maker vende no catálogo, Hayzer cobra 5-10% de comissão.

| Critério | AbacatePay | Stripe | Mercado Pago |
|---|---|---|---|
| **Split payment** | **Em desenvolvimento — NÃO existe ainda** | **Stripe Connect** (Standard/Express/Custom) | **Marketplace OAuth** (precisa app tipo Marketplace, não CheckoutPro) |
| **Multi-tenant OAuth** | Não documentado nativamente | **OAuth2 robusto, token não expira** (ADR-003) | OAuth2 com refresh ~6h (ADR-001) |
| **Plataforma cobra comissão automaticamente** | Aguardando launch da feature | `application_fee_amount` no PaymentIntent | `marketplace_fee` na Preference |
| **KYC do connected account** | Não aplicável (sem split) | Stripe hospeda (Standard/Express) | MP hospeda |

**Conclusão crítica**: AbacatePay **não cobre marketplace hoje**. Para Onda 4 do Hayzer (que é o modelo de receita escalável real), **a empresa precisa de Stripe Connect ou MP Marketplace de qualquer forma**. Adotar AbacatePay agora pra Calc Pro e depois ter que adicionar Stripe na Onda 4 = ter 2 providers pra manter (= mais bug surface, mais auditoria, mais fadiga operacional).

---

## 2. Crítica antes de recomendar (modo Paulo paranoico)

Pra ser justo com AbacatePay (porque o cheiro de novidade não pode embaçar análise técnica), vou listar primeiro o que **ele genuinamente faz melhor**:

### 2.1 Onde AbacatePay é objetivamente melhor

1. **Taxa PIX absurdamente menor**. R$ 0,80 fixo é imbatível pra ticket pequeno. Numa Calc Pro de R$ 37, isso é 2,16% efetivo. No Stripe (1,19%) seria R$ 0,44. No MP (0,99%) seria R$ 0,37.
   - **Wait** — a comparação real é: Stripe na Calc Pro custa R$ 0,44 + IOF/imposto, AbacatePay custa R$ 0,80. Pra ticket R$ 37, **Stripe é mais barato no PIX que AbacatePay**. O ganho da AbacatePay só aparece a partir de ticket ≥ R$ 67 (onde 1,19% > R$ 0,80).
   - Pra recorrência R$ 47-97/mês: R$ 0,80 (AbacatePay) vs R$ 0,56-1,15 (Stripe 1,19%). Empate técnico no fim do range.
2. **PIX recorrente nativo**. Stripe Brasil **NÃO suporta** PIX em Subscriptions. Mercado Pago também não tem PIX recorrente nativo robusto. AbacatePay tem. Pra public maker 3D brasileiro (que prefere PIX > cartão), isso é diferencial real.
3. **Sem fee de assinatura adicional**. Stripe Billing cobra +0,7% sobre volume. AbacatePay não cobra. Em recorrência de R$ 97/mês, isso é R$ 0,68/mês economizado por assinante. Em 100 assinantes = R$ 68/mês.
4. **DX brasileira**. Docs em PT, comunidade indie hacker viva, suporte em PT-BR de gente que já desenvolveu SaaS no BR. Stripe BR é traduzido mas o atendimento técnico complicado vai pra US.
5. **Sem fee de chargeback abusivo**. Stripe cobra R$ 55 por chargeback recebido (R$ 110 se quiser disputar com IA). AbacatePay não publicou esse fee, presumivelmente menor.

### 2.2 Onde AbacatePay falha pro perfil Hayzer

1. **18 meses de vida + incidente de 36h em janeiro/2026**. Pra fintech, 36h de downtime é trauma. O post-mortem oficial admitiu "infraestrutura principal não podia ser recriada em outro ambiente sem reconstruir manualmente". Em janeiro/2026 (6 meses atrás), eles **não tinham replicação cross-cloud, não tinham infraestrutura como código, não tinham runbook de incidente**. Eles **prometeram** 16 ações de melhoria. Sem provas de que entregaram tudo.
   - Princípio Paulo: "cliente cobrado 2x = 30% churn em 48h". Em 36h de gateway fora, eu não consigo nem confirmar pagamento. Cliente paga PIX, espera acesso, não chega, manda chargeback ou abre Reclame Aqui. Cicatriz na marca.
2. **Reclame Aqui mostra padrão de saque bloqueado**. 3 reclamações é pouco em absoluto, mas o **padrão** (conta aprovada → bloqueada → saque travado) é o pesadelo. Em runway de R$ 1.680, ter R$ 2.000 travados em saque por 30 dias = projeto morto.
3. **Split payment não existe ainda**. Hayzer Onda 4 é marketplace de makers. Sem split, sem futuro escalável.
4. **MEI/CNPJ recém-criado pode ser reprovado**. Gabriel é PF + alguns dos primeiros customers Lifetime podem ser MEI recém-aberto (essa é literalmente a persona). Risco de fricção na ponta do cliente.
5. **Retry policy de webhook não documentado**. Stripe tem 3 dias de retry exponencial documentado. Eu sei exatamente o que esperar. AbacatePay não publicou. Em caso de Vercel-down 1h, eu não sei se vou receber o webhook depois ou se vai sumir.
6. **CNPJ pequeno (ME) em Ourinhos-SP**. Não é deal-breaker, mas é asset/passivo limitado. Bancos parceiros sumindo (como aconteceu com fintechs em 2024-2025) afeta empresa pequena mais que empresa grande.
7. **Validação de payload "evite Zod strict"**. A doc oficial recomenda **não validar** estrutura do payload com Zod. Isso é uma RED FLAG. O motivo dado é "pra acomodar mudanças futuras", mas o que isso revela é que **eles fazem breaking changes na estrutura do webhook sem versionar**. Stripe versiona (`apiVersion: '2026-03-25.dahlia'`). MP versiona. AbacatePay diz "deixa solto pra mim mudar".

### 2.3 Crítica da crítica (mantendo honestidade)

Posso estar pesando demais nos negativos do AbacatePay porque sou paranoico por natureza. Argumentos contrários honestos:

1. **18 meses + 1000 cadastros no 1º mês = tração real**, não é vaporware.
2. **Daniel Limae** (founder) tem perfil visível, comunidade engajada, post-mortem **público** e honesto sobre o incidente (a maioria das empresas esconde). Isso é positivo, não negativo.
3. **Indie hackers BR estão usando e gerando receita** com AbacatePay sem problemas relatados em massa.
4. **PIX recorrente** sozinho é diferencial técnico real que Stripe/MP não cobrem bem.
5. O **incidente de janeiro foi tratado de forma adulta**. Post-mortem detalhado, 16 ações documentadas, comunicação eventual (depois das 36h, sim, mas existiu). Empresas crescem aprendendo de crises.

**Mas** mesmo aceitando tudo isso, a equação de risco/benefício pra **este momento específico do Hayzer** (Calc Pro R$ 37 PIX único, 7 semanas pra launch, Stripe já em meio caminho) é:

- **Ganho de pivotar**: R$ 0,80 - R$ 0,44 = -R$ 0,36 por venda PIX (eu PIORARIA na Calc Pro a R$ 37) + DX brasileira marginal.
- **Custo de pivotar**: 6-8h Paulo + Felipe spec novo + retrabalho de Carla na copy ("pague com Stripe" vira "pague com AbacatePay") + perda de 1 semana se conta AbacatePay atrasar aprovação + risco de incidente em janela de launch.

**Não passa no teste de oportunidade.**

---

## 3. Simulação real de fluxo Hayzer

### Cenário A — Calc Pro R$ 37 PIX único (Semana 3, 25-31/05)

| Métrica | Stripe Payment Link | Mercado Pago Link | AbacatePay |
|---|---|---|---|
| **Custo PIX** | R$ 0,44 (1,19%) | R$ 0,37 (0,99%) | **R$ 0,80 fixo** |
| **Custo cartão (1x)** | R$ 1,87 (3,99% + R$ 0,39) | R$ 1,84 (4,98% na hora) ou R$ 1,87 (3,99% em 30d) | **R$ 1,90 (3,5% + R$ 0,60)** |
| **Receita líquida PIX** | R$ 36,56 | **R$ 36,63** | R$ 36,20 |
| **Receita líquida cartão** | R$ 35,13 | R$ 35,16 ou R$ 35,13 | R$ 35,10 |
| **Setup tempo** | **Pronto, spec em `payments/calc-pro-integration-spec.md`** | Reaproveita OAuth existente (mas ADR-001 bloqueio CheckoutPro) | Cadastrar, KYC 1-72h, integrar do zero |
| **Webhook signature** | `Stripe-Signature` (já dominado, ADR-007 padrão Paulo) | `x-signature` (já implementado em `webhook-test-curls.md`) | `X-Webhook-Signature` HMAC-SHA256 (novo) |
| **Idempotência** | `webhook_events.UNIQUE (provider, event_id)` (já implementado) | Idem | Precisa reusar `webhook_events` |
| **Risco operacional** | **Baixo** — gateway maduro, 14 anos | Baixo, 22 anos | **Médio** — 18 meses, 36h downtime janeiro/2026 |
| **Atrito cliente** | Email obrigatório + Stripe redirect → checkout | Email + MP redirect → checkout | Email + AbacatePay redirect → checkout |

**Vencedor Cenário A**: **Mercado Pago Link** em economia bruta (R$ 36,63 vs R$ 36,56 vs R$ 36,20), mas a diferença é **R$ 0,07-0,43 por venda**. Numa meta de 5-30 vendas/mês = R$ 0,35-12,90/mês de diferença. **Negligível pra atrapalhar decisão**.

**Vencedor por critério "tempo até deploy"**: **Stripe Payment Link**. Spec pronto, CEO conhece o dashboard, Felipe entende o pattern. Outras opções custam 6-12h adicionais de dev.

**Decisão Cenário A**: **Stripe Payment Link**, conforme já planejado.

### Cenário B — Assinatura recorrente R$ 47-97/mês (Pós-launch, Onda 2)

| Métrica (R$ 97/mês × 12 = R$ 1.164/ano) | Stripe Subscriptions | Mercado Pago Recorrente | AbacatePay Assinaturas |
|---|---|---|---|
| **Taxa cartão crédito** | 3,99% + R$ 0,39 = R$ 4,26/mês | ~4,98% (recebe na hora) = R$ 4,83 | **3,5% + R$ 0,60 = R$ 3,99/mês** |
| **Fee assinatura adicional** | **+ 0,7% Stripe Billing = +R$ 0,68/mês** | Não tem Billing nativo | **Zero** |
| **Custo total mensal** | R$ 4,94/mês = **R$ 59,28/ano** | R$ 4,83/mês = R$ 57,96/ano | **R$ 3,99/mês = R$ 47,88/ano** |
| **Receita líquida ano** | R$ 1.104,72 | R$ 1.106,04 | **R$ 1.116,12** |
| **PIX recorrente** | **NÃO suportado** | Não nativo robusto | **SIM (R$ 0,80/mês)** |
| **Custo PIX recorrente ano** | Indisponível | Indisponível | **R$ 9,60/ano = receita líquida R$ 1.154,40** |
| **Dunning automático (cartão recusado)** | **Smart Retries automático + email** | Manual (você implementa) | **Não documentado em detalhe** |
| **Billing portal cliente** | **Sim, hospedado pelo Stripe** | Não tem nativo | Não documentado |
| **Trial period** | **Sim, configurável (7/14/30d)** | Manual | Não documentado |
| **Pause/resume** | **Sim, API nativa** | Manual | Não documentado |
| **Webhook eventos recorrência** | **20+ eventos** (`invoice.payment_failed`, `customer.subscription.deleted` etc.) | ~5 eventos | 13 eventos total |
| **Refund proporcional** | **Sim, automático** | Manual | Não documentado |
| **Risco de churn por bug** | **Baixíssimo** (Stripe é referência mundial) | Médio (você gerencia muito) | **Alto** (gateway jovem em recorrência) |

**Análise Cenário B**: AbacatePay tem o **menor custo bruto** (R$ 47,88/ano vs R$ 59,28). Pra 100 assinantes a R$ 97/mês = **R$ 1.140/ano economizado**. **Não é negligível.**

**MAS** o que Stripe Billing entrega que AbacatePay não documenta:
- **Smart Retries**: cartão recusado → tenta de novo em 1, 3, 7 dias automaticamente. ~30% das cobranças falhas se recuperam. Sem isso, churn forçado dispara.
- **Customer Portal**: cliente cancela/atualiza cartão/troca plano sozinho. Sem isso, é ticket de suporte (Sofia gasta tempo).
- **Failed payment emails**: Stripe envia automaticamente sequência ao cliente. Sem isso, Carla escreve do zero.

**Cálculo honesto do "ganho" AbacatePay em recorrência**:
- Economia bruta: R$ 1.140/ano (com 100 assinantes).
- **Custo escondido sem Smart Retries**: se sem dunning automático ~10% dos cartões falham e não recuperam, isso é R$ 11.640/ano em receita perdida (10% de R$ 116.400). Stripe recuperaria ~30% = R$ 3.492. AbacatePay sem provar dunning = R$ 0 recuperado.
- **Líquido real**: R$ 1.140 (economia) - R$ 3.492 (churn forçado não-recuperado) = **PERDA de R$ 2.352/ano** se AbacatePay não tiver dunning maduro.

**Vencedor Cenário B**: **Stripe** **se a recorrência for cartão dominante**. **AbacatePay** **se PIX recorrente for >50% do volume** (maker BR pode preferir PIX, então isso pode ser real).

**Decisão Cenário B**: **PoC AbacatePay na Onda 2 com hypothesis test** (50 clientes em PIX recorrente vs Stripe cartão recorrente, 3 meses, medir LTV líquido + reclamações). Não decidir agora.

### Cenário C — Marketplace (Onda 4, futuro)

> Hayzer cobra 5-10% de comissão do maker que vende no catálogo.

| Funcionalidade | Stripe Connect | Mercado Pago Marketplace | AbacatePay |
|---|---|---|---|
| **Split payment funcional** | **Sim (3 tipos: Standard/Express/Custom)** | **Sim (com app tipo Marketplace — ADR-001)** | **NÃO existe** (em desenvolvimento) |
| **OAuth conexão maker** | **Sim, token não expira** | **Sim, refresh 6h (implementado)** | Não documentado |
| **Comissão automática** | `application_fee_amount` | `marketplace_fee` | N/A |
| **KYC connected account** | Stripe hospeda | MP hospeda | N/A |
| **Onboarding maker** | UX premium, Express + onboarding hosted | UX MP padrão | N/A |
| **Custo da plataforma** | 0,25% no Standard (Stripe Tax opcional) | Sem fee extra além das taxas normais | N/A |
| **Já implementado no Hayzer** | **Sim** (ADR-003) — falta env var | **Sim** (ADR-001) — bloqueio CheckoutPro precisa virar Marketplace | N/A |

**Vencedor Cenário C**: **Stripe Connect** (já implementado, token não expira, padrão mundial) ou **MP Marketplace** (após desbloqueio CheckoutPro). **AbacatePay sai do páreo**.

**Decisão Cenário C**: Manter Stripe Connect como provider principal de marketplace. MP Marketplace como secundário se desbloqueio acontecer.

---

## 4. Recomendação concreta (veredito Paulo)

### Pergunta CEO: Migrar Stripe Payment Link Calc Pro pra AbacatePay AGORA?

**RESPOSTA: NÃO.**

### Pergunta CEO: Avaliar AbacatePay como alternativa pro futuro?

**RESPOSTA: SIM, mas com timing controlado (Onda 2 pós-launch).**

### Detalhamento da recomendação

#### 4.1 Calculadora Pro lançamento (Semana 3, 25-31/05) → **Manter Stripe Payment Link**

**Razões**:

1. **Spec pronto, dev pronto pra começar**. `payments/calc-pro-integration-spec.md` tem 506 linhas. CEO segue checklist de 11 minutos. Felipe implementa em 4h. Migrar pra AbacatePay = começar do zero, custar 6-8h adicionais + risco de KYC atrasar 1-72h. Numa janela de 7 dias, isso é 10-20% do tempo total queimado em retrabalho.

2. **Economia financeira é negativa ou negligível pra ticket R$ 37**. Stripe = R$ 0,44 PIX. AbacatePay = R$ 0,80 PIX. **AbacatePay é R$ 0,36 mais caro por venda** em ticket pequeno. Mesmo em 100 vendas/mês isso é R$ 36/mês a MAIS, não a menos.

3. **Risco de incidente em janela de launch é inaceitável**. AbacatePay teve 36h de downtime em janeiro/2026. Em 7 semanas pré-launch, eu não consigo absorver 36h sem comunicação se acontecer de novo. Stripe pode cair também, mas o histórico estatístico é favorável.

4. **CEO já conhece o dashboard Stripe**. AbacatePay = nova plataforma pra aprender. Em runway curto, cada hora de CEO em treinamento é hora não-vendendo.

5. **Não-pivotar é zero-risco-extra**. Manter Stripe = continuar com plano homologado por Helena (Decisão 1, 18/05). Pivotar = novo escopo, nova superfície de bug, nova decisão pra revisitar.

#### 4.2 Recorrência mensal (Onda 2, pós-launch)

**Hypothesis test controlado** com AbacatePay como **segundo provider opcional** (não substituir Stripe):

- **Quando**: 2 semanas após primeiro Lifetime vendido, ou 30 dias após launch (~04/08/2026).
- **Como**: Adicionar AbacatePay no `payments/` como provider alternativo (similar a Stripe + MP). Oferecer ao cliente "Pagar com cartão (Stripe)" OU "Pagar com PIX recorrente (AbacatePay)" no checkout de assinatura.
- **Métricas a coletar**:
  - Conversion rate (% que escolhe PIX vs cartão)
  - Churn rate por método (PIX é mais "esquecível" que cartão? Ou mais aderente porque maker já tá acostumado?)
  - Customer support tickets por método
  - Incidentes operacionais AbacatePay nos 90 dias
- **Critério de promoção AbacatePay pra provider principal de recorrência**: ≥30% dos novos assinantes escolhem PIX recorrente + churn ≤Stripe + zero incidente >2h em 90 dias.
- **Critério de descontinuação**: ≥1 incidente AbacatePay >4h OR ≥2 reclamações de cliente Hayzer por mês OR conta bloqueada/saque travado.

#### 4.3 Marketplace (Onda 4) → **Manter Stripe Connect + MP Marketplace**

- AbacatePay não tem split payment. Não precisa nem ser cogitado.
- Reusa código e padrão OAuth já implementado.

---

## 5. Custo de pivotar vs custo de não pivotar (cálculo direto)

### Custo de pivotar AGORA (mudar Calc Pro pra AbacatePay)

| Item | Custo |
|---|---|
| Paulo refazer spec (`calc-pro-abacatepay-integration-spec.md`) | 3h |
| Felipe estudar webhook AbacatePay + implementar handler novo | 4-6h |
| Felipe refazer paywall UI (URL diferente, copy "pagar com AbacatePay") | 1h |
| Carla refazer copy (página venda, paywall, email) | 1h |
| CEO criar conta AbacatePay + KYC + esperar aprovação | 1-72h (incerto) |
| Risco: KYC reprovado (MEI recém-aberto / PF) | 0-100% (incerto) |
| Risco: AbacatePay com incidente em janela de launch | 0-3% (baseado em histórico) |
| **Total tempo G7** | **9-11h G7 + 1-72h de espera CEO** |
| **Total risco financeiro adicional** | **R$ 36/mês a mais em PIX (vs Stripe na Calc Pro R$ 37)** |
| **Ganho** | **DX brasileira marginal + PIX recorrente futuro (mas não precisa agora)** |

### Custo de NÃO pivotar (manter Stripe)

| Item | Custo |
|---|---|
| Implementação Stripe Payment Link | **Pronto, spec aprovado** |
| Taxa PIX por venda R$ 37 | R$ 0,44 (vs R$ 0,80 AbacatePay = ECONOMIA de R$ 0,36) |
| Taxa cartão por venda R$ 37 | R$ 1,87 (vs R$ 1,90 AbacatePay = empate) |
| Risco de incidente Stripe em janela de launch | <1% (status page transparente, SLA conhecido) |
| **Total custo extra de manter Stripe** | **R$ 0 — economiza R$ 36/mês vs AbacatePay** |

### Conclusão financeira

**Não pivotar é estritamente superior** pro caso Calc Pro R$ 37:
- Economiza R$ 36/mês em taxa
- Economiza 9-11h G7
- Economiza 1-72h espera CEO
- Reduz risco operacional

**Pivotar é hipoteticamente superior** pro caso assinatura recorrente alto-volume com PIX dominante, **mas isso ainda não existe**. Avaliar quando existir.

---

## 6. Próximas ações concretas (Paulo declara)

### Imediato (esta semana)

- [ ] **CEO**: Continuar Stripe Payment Link conforme `payments/calc-pro-integration-spec.md`. Não pivotar.
- [ ] **CEO** (opcional, paralelo): Criar conta AbacatePay com PF (CPF Gabriel) **só pra começar o KYC** — não bloqueia nada, só destrava se decidirmos PoC na Onda 2. Custa 5 minutos, KYC roda em background. (Se reprovado por ser PF não-PJ, registramos e seguimos.)
- [ ] **Paulo**: Atualizar `decisions/005-integracoes-futuras.md` com nota "AbacatePay avaliado como possível provider de PIX recorrente na Onda 2 — Hypothesis test pendente de critério H1: ≥1 Lifetime vendido."

### Onda 2 (pós-launch, ~04/08/2026)

- [ ] **Paulo + Felipe**: Implementar AbacatePay como segundo provider em `payments/abacatepay.ts`. Reusar abstração existente.
- [ ] **Paulo**: Definir métricas do hypothesis test (planilha simples Google Sheets, atualizada semanal).
- [ ] **Sofia**: Acompanhar tickets de suporte por gateway nas primeiras 8 semanas.

### Onda 4 (Marketplace, ~Q4 2026)

- [ ] **Paulo**: Reavaliar AbacatePay split payment. Se feature lançou e está estável >90 dias, considerar substituir MP Marketplace pelo AbacatePay (Stripe Connect continua como provider gringo/cartão).

---

## 7. Critério de re-avaliação (quando voltar nesse doc)

Este documento deve ser revisitado SE:

1. AbacatePay anunciar split payment release **E** ter ≥6 meses estável.
2. Stripe anunciar PIX em Subscriptions BR (resolveria o gap de PIX recorrente).
3. Hayzer ter ≥50 assinantes mensais e churn forçado >5% (sinal de que dunning Stripe Smart Retries não é suficiente).
4. AbacatePay tiver outro incidente >4h em 12 meses (sinal de instabilidade crônica).
5. Mudança regulatória BACEN que afete fintechs pequenas (capital mínimo, exigências de PCI DSS extras).

**Próxima revisão automática**: 2026-08-04 (1 mês pós-launch). Helena marca na agenda.

---

## 8. Riscos identificados (com mitigação)

| Risco | Probabilidade | Severidade | Mitigação |
|---|---|---|---|
| Stripe negar PIX (invite-only) | Médio | Médio | Plano B: usar só cartão na Calc Pro v1, PIX vem depois quando aprovado. Plano B': usar AbacatePay SÓ pra PIX (Stripe pro cartão) — multi-provider. |
| AbacatePay ter incidente >12h na janela de launch | Baixo (~3%) | Alto se acontecer | Não pivotar = risco zero. PoC na Onda 2 = exposição limitada. |
| Cliente Hayzer reclamar de UX Stripe ("preferia pagar PIX direto") | Baixo (PIX existe no Stripe Payment Link) | Baixo | Carla destaca PIX na página venda. Cliente vê "pague com PIX" no Stripe checkout. |
| Stripe Brasil aumentar taxa em 2026-2027 | Médio | Médio | AbacatePay é alternativa pré-mapeada — não precisa correr atrás. |
| AbacatePay falir / ser blacklistado por banco parceiro | Baixo-médio | Alto pra quem tá nele | Não estar nele = risco zero. |

---

## 9. Sources (fontes consultadas 2026-05-18)

### AbacatePay
- [AbacatePay Home](https://www.abacatepay.com/) — taxas PIX R$ 0,80 fixo, sem mensalidade
- [AbacatePay Assinaturas](https://www.abacatepay.com/assinaturas) — PIX + cartão recorrente, ciclos semanal/mensal/semestral/anual
- [AbacatePay PIX](https://www.abacatepay.com/pix) — gateway PIX D+0
- [AbacatePay Cartão](https://www.abacatepay.com/card) — 3,5% + R$ 0,60 por parcela
- [AbacatePay Docs Webhooks](https://docs.abacatepay.com/pages/webhooks) — HMAC-SHA256 `X-Webhook-Signature`
- [AbacatePay Docs Subscriptions](https://docs.abacatepay.com/pages/subscriptions/create) — recorrência só cartão no Checkout (PIX recorrente via API)
- [AbacatePay Post-mortem 16-17/01/2026](https://www.abacatepay.com/blog/post-mortem-16-janeiro-2026) — 36h downtime, 16 ações de melhoria
- [Reclame Aqui AbacatePay](https://www.reclameaqui.com.br/empresa/purple-box-tecnologia-ltda/lista-reclamacoes/) — 3 reclamações, 50% resolução 6 meses
- [Reclamação Saque Bloqueado](https://www.reclameaqui.com.br/purple-box-tecnologia-ltda/problemas-com-saque-via-pix-alteracao-de-nome-de-usuario-e-saldo-retido-no-abacatepay_D4OWq2zgbooZULFd/)
- [Reclamação Bloqueio Checkout](https://www.reclameaqui.com.br/purple-box-tecnologia-ltda/bloqueio-indevido-de-checkout-e-dificuldade-de-saque-na-abacatepay_lIR57qGouM65oHhQ/)
- [Análise Jurídica NDM Advogados](https://ndmadvogados.com.br/artigo/caso-abacate-pay-analise-juridica/) — violação dever de informação BACEN
- [Análise Técnica CrazyStack](https://www.crazystack.com.br/2025-3/o-caso-da-abacate-pay)
- [CNPJ AbacatePay (Serasa)](https://empresas.serasaexperian.com.br/consulta-gratis/PURPLE-BOX-TECNOLOGIA-LTDA-ME-58271413000190) — fundada 28/11/2024
- [Cardmonitor: Fintech AbacatePay aposta em dados](https://cardmonitor.com.br/ccd/cardclipping/2026/01/fintech-abacatepay-aposta-em-dados-para-ir-alem-do-pix/)
- [Tabnews: Indie hacker tentou meses sem aprovação](https://www.tabnews.com.br/renant/00f8112a-cd5b-4b52-9eea-b1a4f140d8a1)

### Stripe
- [Stripe Pricing BR](https://stripe.com/br/pricing) — 3,99% + R$ 0,39 cartão BR, 1,19% PIX, R$ 3,45 boleto, R$ 55 chargeback
- [Stripe Local Payment Methods Pricing](https://stripe.com/pricing/local-payment-methods)
- [Stripe PIX Docs](https://docs.stripe.com/payments/pix) — invite-only BR
- [Stripe PIX Support Question](https://support.stripe.com/questions/how-to-enable-pix-as-a-payment-method-in-brazil?locale=pt-BR/) — requer 60 dias de processamento
- [Stripe Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)

### Mercado Pago
- [MP Link de Pagamento Prazos](https://www.mercadopago.com.br/blog/prazo-recebimento-link-de-pagamento) — 4,98% na hora, 3,99% em 30d
- [MP Custo PIX](https://www.mercadopago.com.br/ajuda/qual-o-custo-de-um-pix_21723) — 0,49% maquininha, 0,99% link
- [MP Tarifas Conta Digital](https://www.mercadopago.com.br/ajuda/taxas-conta-digital_21766)
- [MP Aceitar PIX](https://www.mercadopago.com.br/ferramentas-para-vender/aceitar-pix)
- [MP Marketplace OAuth Docs](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integration-configuration/integrate-with-marketplace)

### Comparativos
- [Wise Stripe vs MercadoPago](https://wise.com/br/blog/stripe-vs-mercadopago-empresas)
- [Capterra Comparativo](https://www.capterra.com.br/compare/123889/1029373/stripe/vs/mercado-pago)
- [Tabnews Alternativa a Stripe](https://www.tabnews.com.br/Yagasaki/alternativa-a-stripe)
- [Tabnews PITCH ChristoPy gateway](https://www.tabnews.com.br/ChristoPy/pitch-de-r-74k-em-transacoes-a-falencia-e-blacklist-nos-bancos-porque-criei-um-gateway-de-pagamentos)
- [DEV Community: Gateway SaaS](https://dev.to/rayantx/integre-gateway-de-pagamento-ao-seu-saas-como-funciona-quais-os-melhores-e-seus-beneficios-2k54)

---

## 10. Bloco copiável (CEO leva isso pra cabeça)

```
Veredito Paulo:

1. Calc Pro R$ 37 PIX (Semana 3): MANTER STRIPE PAYMENT LINK.
   Razão: Stripe é R$ 0,36 MAIS BARATO por venda PIX em ticket pequeno.
   Migrar custa 9-11h G7 + 1-72h espera KYC AbacatePay.

2. Recorrência mensal (Onda 2 pós-launch ~04/08): PoC AbacatePay 50/50
   Stripe (cartão) vs AbacatePay (PIX recorrente). Critério promoção:
   ≥30% escolhem PIX + churn ≤Stripe + zero incidente >2h em 90d.

3. Marketplace Onda 4: STRIPE CONNECT + MP MARKETPLACE.
   AbacatePay sem split = fora.

4. Ação opcional CEO esta semana: criar conta AbacatePay com PF, deixar
   KYC rodando em background. Custa 5min. Destrava PoC futuro sem
   ficar dependente de timing.

5. Próxima revisão: 04/08/2026 (1 mês pós-launch).
```

---

## Related

- `payments/calc-pro-integration-spec.md` (Stripe Payment Link spec atual)
- `decisions/001-mp-marketplace-vs-checkoutpro.md`
- `decisions/003-stripe-connect-standard.md`
- `decisions/005-integracoes-futuras.md`
- `strategy/decisoes-resolvidas-2026-05-18.md` (Decisão Helena 1)
- `services/paymentConfig.ts` (multi-provider abstração)
- `payments/CLAUDE.md` (convenções providers)
