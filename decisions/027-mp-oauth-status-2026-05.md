# ADR 027 — Status MP OAuth Marketplace + Estrategia PIX pre-launch 27/06

> **Status**: proposed (aguarda decisao CEO sobre opcao B vs D, ver secao 8)
> **Data**: 2026-05-20 (sessao noturna hardwork)
> **Autor**: Paulo (Financial Officer Senior G7)
> **Custo de reversao**: medio (opcao A/D: baixo · opcao B: medio · opcao C: alto)
> **Trigger**: bloqueio MP OAuth Marketplace persiste desde 07/05. Launch publico em 38 dias (27/06). Stripe Connect cobre cartao, mas Pix nativo MP segue sem caminho.
> **Substitui**: nada (estende ADR-001)
> **Relacionado**: ADR-001 (Marketplace vs CheckoutPro), ADR-003 (Stripe Connect Standard), comparativo `payments/comparativo-gateways-br-2026-05-18.md`

---

## TL;DR (3 linhas)

1. Bloqueio nao e bug de MP nem outage — e que o app no painel MP foi criado como CheckoutPro, nao como Marketplace. Esse e o root cause original (ADR-001) que continua nao resolvido em 13 dias uteis.
2. Stripe Connect (ja em prod) cobre cartao + Pix do Stripe BR (invite-only). PIX nativo MP (0,99%, D+0) segue inacessivel sem refazer o app.
3. **Recomendacao Paulo**: opcao D (lancar 27/06 SEM Pix-MP nativo, com Stripe Connect + cartao + Pix-Stripe se aprovar invite) + iniciar opcao B em paralelo como Plano B controlado (PoC isolado, single-account G7). Marketplace MP completo so apos launch (Onda 5, ~Q4 2026).

---

## 1. Investigacao tecnica (estado real do codigo)

### 1.1 O que existe hoje no repo

| Componente | Caminho | Status |
|---|---|---|
| OAuth init | `app/api/integrations/mercadopago/connect/route.ts` | OK — cookie state CSRF + redirect MP |
| OAuth callback | `app/api/integrations/mercadopago/callback/route.ts` | OK — troca code por token + `upsertOAuthConfig` |
| Token refresh | `services/mpTokenRefresh.ts` | OK — refresh 5 min antes de expirar, persiste em `payment_configs` |
| Config service | `services/paymentConfig.ts` (linha 169-186) | OK — cache 60s + auto-refresh dentro de `getActiveConfig` |
| Provider impl | `payments/mercadopago.ts` | OK — Preference API + HMAC signature `x-signature` |
| Webhook handler | `app/api/webhooks/payment/route.ts` | OK — RPC atomica `process_webhook_atomic` (fix 18/05) |
| Idempotencia | tabela `webhook_events` UNIQUE(provider, event_id) | OK — migration `20260518_webhook_events.sql` aplicada |

**Veredito**: codigo **esta tecnicamente correto**. Nao tem bug de implementacao, nao tem race condition, signature obrigatoria, idempotencia atomica. Otavio + Bruna ja blindaram em 17-18/05.

### 1.2 Root cause do bloqueio (confirmado 20/05)

Da ADR-001 (28/04/2026, linha 50):

> Pendente:
> - Criar app **Marketplace** no MP Developer Portal (atual `1122266758341703` e CheckoutPro)
> - Configurar redirect URI no novo app
> - Atualizar `MP_CLIENT_ID` e `MP_CLIENT_SECRET` no Vercel

O app `1122266758341703` no painel MP foi cadastrado como tipo "Checkout Pro" e **MP nao permite mudar o tipo via UI depois de criado**. Pra virar Marketplace e necessario:

1. Criar app NOVO no painel MP escolhendo "Marketplace" no wizard inicial
2. Coletar `client_id` + `client_secret` novos
3. Configurar `redirect_uri` exato: `https://hayzer.com.br/api/integrations/mercadopago/callback`
4. Trocar env vars Vercel `MP_CLIENT_ID` + `MP_CLIENT_SECRET`
5. Aprovar permissoes de marketplace_fee no painel (KYC adicional MP pode pedir documentos)

O `[mp/callback]` log de 07/05 que CEO mencionou foi:

> `token_exchange_failed` ou `invalid_client` retornado pelo `/oauth/token` MP, pois um app CheckoutPro **nao tem o escopo OAuth Marketplace habilitado**. MP nao explica isso na mensagem de erro — so retorna 400 generico.

### 1.3 Status pagina oficial MP (20/05, 23:50)

- [Mercado Pago Status](https://status.mercadopago.com/): OAuth = **Operational 100% uptime 90d**. Checkout Pro = 99.99% uptime. Marketplace API nao listada (e parte do Checkout Pro/Pagos).
- Ultimo incidente BR: 19/05 metodos cartao (resolvido em ~1h).
- **Nao ha incidente sistemico MP afetando OAuth Marketplace** — o problema e exclusivamente configuracao do nosso app.

### 1.4 Stripe Connect (alternativo ja em prod)

- ADR-003 implementado: `/api/integrations/stripe/connect` + callback
- Standard Connect: token nao expira, KYC hospedado Stripe, padrao mundial
- Cobre: cartao internacional, cartao BR (3,99% + R$ 0,39), Pix Stripe BR (1,19%, **invite-only**, pede 60d historico)
- Aplicacao Hayzer: Pix Stripe ainda nao aprovado (CEO nao pediu invite porque waitlist phase)

---

## 2. Premissas para a decisao (modo Paulo paranoico)

1. **Launch 27/06 em 38 dias**. Cada caminho consome tempo G7 + tempo CEO. Hardwork ativo nao significa "tempo infinito".
2. **Zero usuario pagante hoje**. Memoria `project_hayzer_sem_usuarios_ate_launch`: rotacao/downtime breve = zero impacto ate 04/07. **Hoje e o melhor dia da historia pra arriscar**.
3. **Maker BR prefere Pix**. Memoria persona Rafael: 28-42 anos, ticket medio R$ 80-150, ja vendeu pelo WhatsApp aceitando Pix manual. Pedir cartao em 1a compra = friction.
4. **Stripe Connect ja funciona**. Nao precisamos do MP pra lancar — precisamos do MP pra **maximizar conversao maker**.
5. **Stripe cobra 3,99% cartao, MP cobra 4,99% cartao + 0,99% Pix**. Em tickets pequenos R$ 50-100, **Stripe e MAIS CARO se a maioria pagar cartao** (3,99% > 0,99%). Mas se 70% dos clientes do MAKER (nao do Hayzer) preferem Pix, perder o Pix de 0,99% e perder 2-3% de margem do maker. Em R$ 100 = R$ 2-3/venda. Em 100 vendas/mes do maker = R$ 200-300/mes que o maker perde — **e isso vira insatisfacao com o Hayzer**.
6. **LGPD**: dado financeiro merece cuidado dobrado. Opcao B (caixa G7 -> repasse manual) cria obrigacao fiscal extra (passa pelo CNPJ Hayzer 55.515.732/0001-06). Contador do Gabriel precisa ratificar.
7. **Memoria CEO "Aceito sua sugestao literal"**: ADR propoe, CEO decide. Nao decido autonomamente entre B/C/D.

---

## 3. As 4 opcoes em detalhe

### Opcao A — Esperar MP destravar + Stripe Connect unico

**O que e**: manter status quo. Nao mexer no app MP. Stripe Connect cobre maker BR. Esperar MP "destravar" sem trigger ativo.

**Quem faz o que**:
- Nenhum trabalho G7 imediato
- Nenhuma comunicacao com cliente

**Numeros**:
- **Custo G7**: 0h
- **Custo CEO**: 0h
- **Custo financeiro mensal**: R$ 0 fixo
- **Custo perda margem maker** (estimado, 50 makers, ticket medio R$ 100, 50% prefeririam Pix): perda **R$ 300/mes por maker x 50 makers = R$ 15.000/mes em receita do MAKER** que vira churn (nao receita Hayzer direta, mas afeta retencao).
- **Prazo implementacao**: 0 dias
- **Impacto conversao maker BR**: **negativo medio** — maker olha checkout, ve so cartao, conclui "Hayzer nao funciona pra Pix" e cancela trial.

**Risco operacional**: **alto a medio-longo prazo**. O bloqueio nao se resolve sozinho. Ate alguem (CEO ou eu) criar o app Marketplace novo no painel MP, nada muda. "Esperar" e sinonimo de "decidir nao fazer nada".

**Veredito Paulo**: REJEITAR. Esta opcao so existe pra ficar registrado. Nao escolher esta.

### Opcao B — Pix direto MP via single-account (sem OAuth marketplace)

**O que e**: integrar API `payments` do MP usando UMA conta MP (a da G7 — Heshiley ou Gabriel CNPJ 55.515.732/0001-06) como recebedor central. Maker nao conecta a propria conta. Cliente do maker paga via Pix MP, dinheiro cai na conta G7. G7 repassa pro maker manualmente (planilha + Pix mensal) ou via Pix programado.

**Quem faz o que**:
- **Paulo**: documenta processo contabil (memoria do dinheiro G7 antes do repasse — passivo no balanco, nao receita), reconciliacao diaria gateway-x-DB
- **Bruna**: cria tabela `manual_payouts` (id, maker_id, period, amount_brl, status, payout_date), service `manualPayoutsService`
- **Felipe**: provider `payments/mercadopagoSingleAccount.ts` (cria pagamento PIX direto API, sem Preference) + tela `/admin/payouts` (lista maker, valor a repassar, botao "marcar como pago")
- **Otavio**: revisar que tabela tem RLS so admin, audit log de payout = obrigatorio
- **Carla**: copy explicando ao maker no checkout: "Voce recebe via Pix em ate 7 dias uteis"
- **Helena**: aprovar com contador do Gabriel (a obrigacao fiscal e G7 receber e repassar)

**Numeros**:
- **Custo G7**: 18-25h (Bruna 6h + Felipe 8h + Paulo 3h reconciliacao + Otavio 2h security + Carla 1h + Helena 2h alinhar contador)
- **Custo CEO**: 4-6h (alinhar contador, validar fluxo bancario, revisar 1a reconciliacao)
- **Custo financeiro fixo mensal**: contador R$ 200-400/mes adicional (declaracao de movimentacao extra)
- **Custo financeiro variavel**: 0,99% MP Pix + ~R$ 1-3 por Pix-out programado pra repassar (banco G7 pode cobrar tarifa)
- **Prazo implementacao**: 5-7 dias uteis (deploy ate 27/05) + 7 dias teste sandbox + 3 dias reconciliacao real = **15 dias** para ter em prod confiavel. Launch 27/06: cabe **com folga 22 dias**.
- **Impacto conversao maker BR**: **positivo medio** — maker tem Pix no checkout. Comunicar "voce recebe em 7 dias" cria atrito pequeno mas mantem Pix como opcao.

**Risco operacional**:
- **Alto**: dinheiro do maker fica em conta G7 ate repasse. Se G7 atrasar repasse, maker reclama no Reclame Aqui da G7. Risco operacional alto.
- **Fiscal**: G7 declara como receita-passagem (passivo), nao como receita propria. Contador precisa configurar plano de contas separado. **Se errar, Receita ve receita G7 inflada e cobra imposto sobre dinheiro que nao e nosso**.
- **Caixa**: G7 precisa ter capital de giro pra cobrir periodo entre receber Pix e fazer payout. Em 50 makers a R$ 100/dia em vendas = R$ 5.000/dia parado por ate 7 dias = R$ 35.000 em float. **Memoria runway R$ 1.680**: nao temos esse caixa hoje. Mitigacao: payout no dia seguinte (D+1), nao semanal.
- **LGPD/cadastro maker**: maker precisa enviar dados bancarios pro Hayzer (chave Pix, banco, agencia). Mais dado sensivel pra proteger.

**Veredito Paulo**: VIAVEL como **Plano B** (PoC controlado, single-account G7, **NAO** como solucao default). So expor pro maker se ele optar "quero receber via Pix" explicitamente.

### Opcao C — Trocar/adicionar provider alternativo (Asaas)

**O que e**: adicionar Asaas como 3o provider no abstract `payments/`. Asaas tem split payment funcional via API (cada maker = "subconta" Asaas com KYC proprio). Hayzer cobra comissao via split nativo. Pix Asaas: R$ 1,99 fixo. Cartao: 2,99% + R$ 0,49.

**Quem faz o que**:
- **Paulo**: spec novo provider, validar contrato Asaas (taxa, suporte, SLA)
- **Bruna**: schema `payment_configs` ja suporta novos providers (so add no CHECK constraint)
- **Felipe**: `payments/asaas.ts` + OAuth callback + tela onboarding maker
- **Carla**: copy nova "Conectar conta Asaas"
- **CEO**: criar conta Asaas G7 + KYC (1-7 dias) + assinar contrato split

**Numeros**:
- **Custo G7**: 30-45h (provider novo do zero, OAuth novo, webhook signature, idempotencia, testes E2E sandbox)
- **Custo CEO**: 6-12h (cadastro Asaas + KYC + contrato + decisao taxa split)
- **Custo financeiro fixo mensal**: R$ 0 (Asaas nao cobra mensalidade)
- **Custo financeiro variavel**: Pix R$ 1,99 fixo (vs MP 0,99% = R$ 0,99 em ticket R$ 100). Cartao 2,99% + R$ 0,49 (vs MP 4,99% = melhor pra Asaas em cartao). **Em ticket R$ 50**: Pix Asaas R$ 1,99 (3,98%) vs MP R$ 0,50 (0,99%). Asaas mais caro em ticket pequeno.
- **Prazo implementacao**: **18-25 dias** (provider novo = curva de aprendizado + sandbox + bug fix + reconciliacao). Launch 27/06: cabe **apertado, sem margem pra incidente**.
- **Impacto conversao maker BR**: **neutro a positivo** — Asaas e menos conhecido que MP mas tem reputacao boa em devs BR.

**Risco operacional**:
- **Medio**: 3o provider = 3a superficie de bug, 3a auditoria, 3a documentacao. Fadiga operacional permanente.
- **Vendor**: Asaas e CNPJ medio (nao bilhao USD como Stripe/MP). Estabilidade boa nos ultimos 3 anos mas nao infinita.
- **Re-trabalho marketplace**: depois que MP destravar, ainda vamos querer MP por causa de penetracao? Vamos manter Stripe + MP + Asaas? Triplo de manutencao.

**Veredito Paulo**: REJEITAR no contexto launch 27/06. **Avaliar pra Onda 5 (pos-launch ~Q4 2026)** se Pix-MP nao destravar em 90 dias. Asaas + Stripe seria stack mais barato que MP + Stripe em tickets > R$ 80, e Asaas tem split funcional ja hoje (vs MP que continua bloqueado).

### Opcao D — Launch 27/06 SEM Pix-MP, comunicar "Pix em breve"

**O que e**: aceitar Stripe Connect como unico path. Maker recebe via cartao (3,99% Stripe) ou Pix Stripe SE invite aprovar (1,19% Stripe). Pedir invite Pix Stripe pro Gabriel HOJE (custa 5 min). Comunicar transparente: "Hoje pagamos via Stripe (cartao + Pix). Mercado Pago direto em breve."

**Quem faz o que**:
- **CEO**: solicitar invite Pix Stripe BR no dashboard Stripe (memoria: empresa precisa 60d historico processamento — possivel travar)
- **Carla**: ajustar copy do onboarding: "Conecte sua conta Stripe pra receber via cartao + Pix"
- **Paulo**: monitorar reclamacao maker "queria MP" em 90 dias pos-launch — se >20% pedirem, ai sim acionar Opcao B ou C
- **Helena**: alinhar comunicacao publica (landing nao promete MP)

**Numeros**:
- **Custo G7**: 2-4h (copy + 1 setting + monitoring)
- **Custo CEO**: 0,5h (clicar pedir invite Stripe)
- **Custo financeiro mensal**: R$ 0
- **Custo perda margem maker** (se Stripe nao aprovar Pix em 30d): igual opcao A = ~R$ 15.000/mes em receita do maker (nao Hayzer)
- **Prazo implementacao**: 1-2 dias (so copy)
- **Impacto conversao maker BR**: **neutro a positivo** se Stripe Pix sair em 30d. **Negativo medio** se nao sair em 30d (Pix Stripe ainda invite-only no BR).

**Risco operacional**:
- **Baixo**: nao mexe em codigo financeiro. Reusa Stripe Connect em prod.
- **Reputacao**: maker pode escolher concorrente que ja tem MP. Mitigacao: nao prometer MP na landing, dar Stripe + cartao + Pix como vantagem (cartao internacional, parcelamento Stripe).
- **Fallback**: se 90 dias pos-launch maker exigir MP -> migrar pra Opcao B ou C de cabeca fria.

**Veredito Paulo**: VIAVEL. **Opcao default da recomendacao**. Risco mais baixo, custo G7 menor, mantem foco em hardwork das outras 8 prioridades (modulos internos, golden path, mobile QA, onboarding).

---

## 4. Comparativo direto (matriz de decisao)

| Criterio | A (Esperar) | B (Single-account) | C (Asaas) | D (Lancar sem MP) |
|---|---|---|---|---|
| **Custo G7 (horas)** | 0h | 18-25h | 30-45h | 2-4h |
| **Custo CEO (horas)** | 0h | 4-6h | 6-12h | 0,5h |
| **Risco operacional** | Alto (longo prazo) | Alto (caixa + fiscal) | Medio (3o provider) | Baixo |
| **Risco financeiro** | Perda receita maker | Caixa float R$ 35k/dia | Bloqueio KYC Asaas | Perda Pix-MP |
| **Prazo deploy** | 0d | 15d | 18-25d | 1-2d |
| **Cabe launch 27/06?** | Sim (nao faz nada) | Sim (folga 22d) | Apertado | Sim (sobra 36d) |
| **Conversao maker BR** | Negativa | Positiva media | Neutra-positiva | Neutra (se Pix Stripe aprovar) |
| **Impacto na marca G7** | Neutro | Risco Reclame Aqui se atrasar payout | Neutro | Honesto ("Pix em breve") |
| **LGPD** | Padrao | Mais dado financeiro maker | Mais dado financeiro maker | Padrao |
| **Reversibilidade** | Alta | Media (precisa migrar dado) | Baixa (3 providers) | Alta |

---

## 5. Recomendacao explicita

### 5.1 Caminho recomendado (modo Paulo paranoico + pragmatico)

**Adotar Opcao D como default pra launch 27/06**, **iniciar Opcao B em paralelo como Plano B controlado** (PoC isolado), **deixar Opcao C parqueada pra Onda 5**.

### 5.2 Por que D + B em paralelo (nao um ou outro)?

- **D resolve hoje**: launch 27/06 acontece sem bloqueador financeiro novo. Stripe Connect ja em prod. Custo G7 marginal. Foco fica nos 8 outros bloqueadores criticos (modulos internos 50% prontos, mobile QA zero, onboarding wizard zero, etc.).
- **B existe como rede**: se 30 dias pos-launch o feedback dos primeiros 10-20 makers Lifetime for "queria MP", a infraestrutura tecnica de B (tabela `manual_payouts`, service, fluxo de payout admin) ja esta 50% pronta — ativa em mais 5-7 dias.
- **B sem D = arriscado demais pre-launch**: 18-25h G7 + caixa float + risco Reclame Aqui em janela de launch = NAO. Lancar com 1 opcao funcionando (Stripe Connect) e melhor que tentar duas e nenhuma funcionar bem.
- **C nao cabe**: 30-45h G7 nas 5 semanas finais pre-launch desloca esforco crítico de outras 8 prioridades. Asaas vira Onda 5 se MP nao destravar em 90d.

### 5.3 Acoes concretas decorrentes

#### Imediato (sessao 21/05 ou proxima)
- [ ] **CEO** (5 min): solicitar invite Pix Stripe BR no [dashboard Stripe](https://dashboard.stripe.com/payments/pix). Memoria: Stripe pede 60d processamento previo — vamos descobrir.
- [ ] **CEO** (15 min): no painel MP (`https://www.mercadopago.com.br/developers/panel/app/`) **criar app NOVO tipo Marketplace** seguindo wizard (NAO mexer no app antigo `1122266758341703`). Reservar `client_id` + `client_secret` novos como "MP_MARKETPLACE_*" em arquivo local seguro. **Nao deployar ainda** — so reservar pra opcao B/B+ futuro.
- [ ] **Carla** (1h): copy de onboarding "Conecte Stripe pra receber via cartao + Pix" + tooltip "Mercado Pago em breve" no settings (sem prometer data).
- [ ] **Paulo** (30 min): adicionar metrica em `metrics/payment_provider_requests.json` (proxy): contar quantos makers pedirem MP em ticket de suporte. Threshold pra acionar opcao B: 5 pedidos em 30 dias pos-launch.

#### Pre-launch (ate 27/06)
- [ ] **Helena**: validar com contador G7 a possibilidade fiscal/contabil de receber-e-repassar (preparar pra opcao B se necessario). NAO IMPLEMENTAR ainda — so deixar OK por escrito do contador.
- [ ] **Paulo**: criar runbook `docs/runbooks/pagamento-incidente.md` (memoria estudo Stripe Press 17/05) com 4 cenarios: duplicate charge, refund failed, webhook nao chegou, gateway != DB. Bloqueante pre-launch.
- [ ] **Otavio**: revisar que Stripe webhook signature esta verificada em prod (ja ta no codigo, validar env var setada no Vercel).

#### Pos-launch (ate 27/07)
- [ ] **Paulo + Helena**: revisar metrica "makers pediram MP". Se >5, ativar opcao B com app Marketplace novo (ja reservado em 21/05). Se <5, nao mexer.
- [ ] **Paulo**: revisar este ADR em 27/07 (1 mes pos-launch).

---

## 6. Restricoes que respeitamos

| Restricao CEO | Como respeitamos |
|---|---|
| NAO mexer em `services/paymentConfig.ts` sem ADR | Este ADR cobre. Nao alteramos codigo agora. |
| ZERO mock em teste de pagamento | Opcao B exige sandbox MP real + reconciliacao gateway real. Opcao D usa Stripe sandbox real. |
| Idempotencia + webhook signature obrigatorios | Ja em prod via `process_webhook_atomic` + verificacao HMAC. Opcao B reusa o mesmo handler — nada inseguro. |
| LGPD: dado financeiro cuidado dobrado | Opcao B agrega risco (dados bancarios maker em DB) — por isso e Plano B, nao default. RLS so admin + audit log obrigatorio. |
| Memoria "Aceito sua sugestao literal" | Recomendo D + B paralelo. CEO decide. NAO implemento sem aprovacao. |
| Memoria "todo problema tem solucao" | Nao matei opcao MP. Mantive caminho aberto (opcao B + reserva app Marketplace novo) sem comprometer launch. |

---

## 7. Riscos e mitigacoes (caso D escolhida)

| Risco | Probabilidade | Severidade | Mitigacao |
|---|---|---|---|
| Stripe nao aprovar Pix em 30d | Media | Media | Comunicar "Pix em breve" na landing, nao prometer prazo. Ativar opcao B se >5 makers pedirem. |
| Maker desistir do Hayzer por nao ter MP | Baixa-media | Media | Vantagem competitiva Stripe: parcelamento + cartao internacional. Onboarding destaca isso. |
| Sentry vai ativar so 17/06 — se Stripe Connect quebrar entre agora e 17/06, descobrimos tarde | Baixa | Alta | Pedir Otavio antecipar Sentry init pra Stripe payments (custo: 1h, vale a pena). |
| Reconciliacao Stripe != DB | Baixa (RPC atomica desde 18/05) | Alta | Cron diaria `services/reconciliation.ts` — pos-launch. Bloqueante: 04/07. |
| Time gasta tempo discutindo MP quando podia codar modulos internos | Alta | Media | Este ADR fecha a discussao por 30d. Proxima revisao 27/07. |

---

## 8. Decisao CEO solicitada (sucinto)

**Pergunta unica pro CEO**:

> Aprovo D (lancar 27/06 com Stripe Connect + cartao + Pix-Stripe se aprovar invite) e iniciar B em paralelo como Plano B (reservar app MP Marketplace novo, contador alinhado, mas NAO implementar payout manual ate ter sinal de 5+ makers pedirem)? Sim / Nao / Outra opcao?

Se Sim:
- CEO: 2 acoes de 5+15 min (Stripe invite + criar app MP Marketplace novo)
- G7: 4h totais essa semana (Carla copy + Paulo metric + Helena contador)

Se Nao, alternativas:
- B direto agora: pre-launch fica apertado (18-25h G7), risco caixa, risco Reclame Aqui se atrasar payout. So aceitar se CEO tiver convicao forte que maker BR exige MP.
- C: nao cabe pre-launch. Pos-launch viavel.
- A (esperar): nao recomendado.

---

## 9. Critérios de re-avaliacao (quando voltar nesse ADR)

Revisar este documento SE:

1. **Stripe Pix BR aprovar** invite -> reduz urgencia de Opcao B.
2. **>=5 makers pos-launch pedirem MP** em 30 dias -> ativar Opcao B.
3. **MP anunciar mudanca de tipo de app via API** (improvavel — apuracao MP) -> destrava sem refazer.
4. **Asaas anunciar pricing PIX abaixo de R$ 0,99** -> Opcao C reabre.
5. **Reclamacao maker no Reclame Aqui G7** sobre payout atrasado -> revisar Opcao B inteira.
6. **Mudanca BACEN** que afete CNPJs ME (G7) recebendo-e-repassando -> opcao B vira inviavel.

Proxima revisao automatica: **2026-07-27** (1 mes pos-launch). Helena marca na agenda.

---

## 10. Sources

### Mercado Pago
- [MP Status](https://status.mercadopago.com/) — verificado 2026-05-20 23:50, OAuth Operational
- [MP Marketplace OAuth Docs](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integration-configuration/integrate-with-marketplace)
- [MP Integrar Checkout Em Marketplace](https://www.mercadopago.com.mx/developers/pt/docs/checkout-pro/how-tos/integrate-marketplace)
- [MP OAuth Token Reference](https://www.mercadopago.com.br/developers/pt/reference/authentication/oauth/_oauth_token/post)
- [MP OAuth Management](https://www.mercadopago.com.br/developers/en/docs/security/oauth/management)
- [MP OAuth Best Practices](https://www.mercadopago.com.ar/developers/en/docs/checkout-api-payments/additional-content/security/oauth/best-practices)
- [MP Create Split Configuration](https://www.mercadopago.com.ar/developers/en/docs/split-payments/integration-configuration/create-configuration)

### Stripe
- [Stripe Connect Multi-Tenant SaaS 2026](https://dev.to/diven_rastdus_c5af27d68f3/building-a-multi-tenant-saas-with-stripe-connect-in-2026-jjn)
- [Stripe Pix BR Docs](https://docs.stripe.com/payments/pix) — invite-only BR

### Asaas (opcao C)
- [Asaas API Pagamentos](https://www.asaas.com/api-de-pagamentos)
- [Asaas Split Pagamentos](https://docs.asaas.com/docs/split-de-pagamentos)
- [Asaas Pix Overview](https://docs.asaas.com/docs/pix-overview)
- [Asaas Precos e Taxas](https://www.asaas.com/precos-e-taxas)

### Internos
- ADR-001 — `decisions/001-mp-marketplace-vs-checkoutpro.md`
- ADR-003 — `decisions/003-stripe-connect-standard.md`
- ADR-005 — `decisions/005-integracoes-futuras.md`
- Comparativo gateways BR — `payments/comparativo-gateways-br-2026-05-18.md`
- Services payment config — `services/paymentConfig.ts`
- Provider MP — `payments/mercadopago.ts`
- Webhook handler — `app/api/webhooks/payment/route.ts`
- Memoria CEO sem usuarios ate launch — `memory/project_hayzer_sem_usuarios_ate_launch.md`

---

## 11. Bloco copiavel (CEO leva isso pra cabeca)

```
Veredito Paulo (ADR-027):

1. Bloqueio MP NAO e bug nem outage — app no painel MP foi criado como
   CheckoutPro, precisa criar app NOVO tipo Marketplace.
   Sem isso, MP OAuth nunca destrava.

2. Recomendacao: OPCAO D
   - Lancar 27/06 SO com Stripe Connect (ja em prod).
   - Pedir invite Pix Stripe BR (5 min CEO).
   - Comunicar "Pix MP em breve" sem prometer prazo.
   - Custo total: 2-4h G7, 0,5h CEO.

3. Plano B em paralelo (PoC controlado, NAO ativo):
   - CEO criar app MP Marketplace novo no painel (15 min, so reservar
     client_id + client_secret).
   - Helena alinhar contador G7 sobre receber-e-repassar (opcao B fiscal).
   - Bruna NAO implementa payout manual ainda.

4. Trigger pra ativar opcao B (single-account G7 + payout manual):
   >=5 makers pos-launch pedirem MP em 30 dias.

5. Opcao C (Asaas): parqueada pra Onda 5 (~Q4 2026).

6. Proxima revisao: 27/07/2026.

PERGUNTA UNICA CEO: aprova D + reservar B paralelo? Sim/Nao/Outra?
```

---

## Status

- [x] ADR criado 2026-05-20 (sessao noturna hardwork)
- [ ] CEO decide Sim/Nao na pergunta unica (secao 8)
- [ ] Se Sim: executar 4 acoes imediatas (secao 5.3)
- [ ] Revisao 2026-07-27
