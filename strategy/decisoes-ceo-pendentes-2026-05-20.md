# 8 Decisões CEO Pendentes — Matéria de Apoio
## Consolidação Helena + Claude · 2026-05-20

> **STATUS 20/05 23h**: Bloco 1 (decisões 1-5) RESPONDIDO. Bloco 2 (decisões 6-8): 6 e 8 respondidas, 7 pendente.
>
> Bloco 1 (Operação Noturna · 5 decisões) = origem 19/05.
> Bloco 2 (Hayzer Beauty · 3 decisões) = origem 20/05, deadline 28/06 ou 05/07.

---

## ✅ RESUMO DAS DECISÕES TOMADAS (20/05)

| # | Decisão | Caminho final |
|---|---|---|
| 1 | Data ativação Op Noturna | **B · sexta 22/05 22h BRT** |
| 2 | Canal alerta crítico | **C · Discord webhook** (servidor "Hayzer Ops" criado, 2 canais + 2 webhooks ativos) |
| 3 | Noites/sem | **B · 5/7** (seg-sex) |
| 4 | Limite consumo | **2 agents/noite máximo** (cabe na quota Max 5x sem estourar, sem cap monetário pq plano Max não cobra por token) |
| 5 | Agents piloto 1ª noite | **Bruna + Lia** (Otávio cortado — Tier 1 e Tier 2 fechados) |
| 6 | Posicionamento Beauty | **A modificado** · sub-marca "Hayzer Beauty" COM identidade própria, MESMO domínio `hayzer.com.br`, arquitetura tipo Humanos Fora da Curva (login único + tela seletora de produto) |
| 7 | Cobrança Beauty ano 1 | **PENDENTE** · CEO vai pensar mais. Considerar estratégia rede Ybera (gestora-mãe + gestoras + afiliadas = combo time inteiro?) |
| 8 | Quando briefar G7 Beauty | **B · 28/06 14h** com cláusula escape: se launch 27/06 quebrar bug crítico, vai automático pra 05/07 |

---

---

# BLOCO 1 · Operação Noturna (5 decisões)

Contexto macro: CEO ativou modo hardwork 19/05→27/06. Operação noturna = 13 agents G7 trabalhando enquanto CEO dorme (1h-7h madrugada), com digest matinal. Memória `feedback_modo_trabalho_noturno_enquanto_ceo_dorme` define escopo: pesquisa + auditoria + build + refactor. PROIBIDO: deploy prod, migration prod, decisão estratégica.

## Decisão 1 · Data de ativação

**Pergunta**: começar HOJE (20-21/05) ou aguardar 22/05?

| Caminho | Prós | Contras |
|---|---|---|
| **A · Hoje 21/05 noite** | Ganha 1 noite extra de produção. Modo hardwork já está ativo, momentum existe. | Pode ser apressado se infra (memória persistente, logging) ainda tem gaps. |
| **B · 22/05 (sexta)** | 1 dia pra calibrar threshold tokens + setup completo. Fim de semana = teste em volume controlado. | Perde 1 noite. CEO já estava pronto pra começar. |

**Recomendação Helena**: **A (hoje 21/05 noite)** — momentum é mais valioso que perfeição. Se algo falhar, corrige na sexta antes do fim de semana.

**Tua resposta**: [ A ] [ B ] [ ___ ]

---

## Decisão 2 · Canal de alerta crítico

**Pergunta**: como te acordar se algo crítico acontecer durante a noite?

Critério "crítico" = build production quebrou + algo que afeta o launch 27/06.

| Caminho | Prós | Contras |
|---|---|---|
| **A · Gmail** | Zero setup. Já recebe email padrão. | Latência alta (notif celular pode demorar). Pode misturar com spam. |
| **B · SMS Twilio** | Latência baixa. Notificação física. | Custo R$ 0,15/SMS BR + setup Twilio (~30min). Conta nova. |
| **C · Discord webhook** | Grátis. Push notification mobile via app Discord. Latência baixa. Threading. | Precisa app Discord aberto/ativo. |
| **D · Telegram bot** | Grátis. Push mobile nativo. Latência baixa. Simples API. | Setup bot (10min). Mais conta. |

**Recomendação Helena**: **C (Discord webhook)** — gratuito, latência baixa, e tu já usa Discord. Fallback Gmail pra duplicação se Discord travar.

**Tua resposta**: [ A ] [ B ] [ C ] [ D ] [ ___ ]

---

## Decisão 3 · Quantas noites por semana

**Pergunta**: operação noturna roda quantas noites/sem até 27/06?

| Caminho | Prós | Contras |
|---|---|---|
| **A · 3/7 noites** (seg, qua, sex) | Sustentável. Manhãs alternadas livres pra debug. | Menos volume de trabalho. |
| **B · 5/7 noites** (seg-sex) | Mais volume. Fim de semana livre pra CEO descansar. | Pode acumular bugs pra revisar segunda. |
| **C · 7/7 noites** | Volume máximo. Aproveita janela 38 dias até launch. | Sem folga. Se algo der ruim no fim de semana, CEO não acompanha. |

**Recomendação Helena**: **B (5/7)** — seg-sex equilibra volume + revisão manhã + fim de semana de descompressão. Após 1 semana, reavalia.

**Tua resposta**: [ A ] [ B ] [ C ] [ ___ ]

---

## Decisão 4 · Threshold de tokens

**Pergunta**: limite de gasto por noite antes de pausar?

Contexto: 1 noite com 5 agents trabalhando 4-6h pode consumir 1-3M tokens (~R$ 30-90 dependendo do mix).

| Caminho | Prós | Contras |
|---|---|---|
| **A · R$ 30/noite cap** | Conservador. Force priorização. | Pode parar no meio de trabalho útil. |
| **B · R$ 50/noite cap** | Equilíbrio. Permite 5 agents em volume médio. | Risco mensal ~R$ 1.000 se 5 noites/sem. |
| **C · R$ 100/noite cap** | Máxima flexibilidade. | Risco mensal ~R$ 2.000. |
| **D · Sem cap** | Zero atrito. | Risco real de cobrança alta sem percepção. |

**Recomendação Helena**: **B (R$ 50/noite cap)** — força priorização sem matar momentum. Mensal ~R$ 1.000. Reavalia após 1 sem se está apertando ou folgando.

**Tua resposta**: [ A ] [ B ] [ C ] [ D ] [ ___ ]

---

## Decisão 5 · 3 agents piloto primeira noite

**Pergunta**: quais 3 agents G7 começam na primeira noite operação?

| Caminho | Prós | Contras |
|---|---|---|
| **A · Bruna (refactor) + Lia (docs) + Otávio (audit)** | Baixo risco. Trabalho não-visual, não-bloqueante. Bons pra calibrar processo. | Não entrega valor visível pro launch. |
| **B · Felipe (landing) + Diego (assets) + Carla (copy)** | Alto valor visível. Avança landing maker. | Maior risco de conflito (todos tocam landing). |
| **C · Ana (analytics) + Marcos (marketing) + Joana (community)** | Trabalho de pesquisa + planejamento. Não toca código. | Não acelera launch tech. |
| **D · Mix · Bruna + Diego + Lia** | 1 backend + 1 visual + 1 docs. Distribui risco. | Diego sem Write tool (limitação descoberta hoje). |

**Recomendação Helena**: **A (Bruna + Lia + Otávio)** — primeira noite = calibrar processo. Trabalho não-bloqueante. Se algo der ruim, fácil reverter. Segunda noite escala pra incluir Felipe se primeira foi ok.

**Tua resposta**: [ A ] [ B ] [ C ] [ D ] [ ___ ]

---

# BLOCO 2 · Hayzer Beauty (3 decisões)

Contexto macro: Sessão 20/05 capturou ecossistema Ybera 360° (Club + Academy + Brasil Influencer + gestoras). Briefing executivo Helena pronto em `strategy/briefing-hayzer-beauty-05-07-executivo.md`. ARPU R$ 197 · TAM R$ 4,7M/ano · meta 12m 50 gestoras = R$ 118k ARR. Reunião oficial G7 = 05/07. **Beauty ARQUIVADO até lá**, mas 3 decisões devem ser tomadas ANTES.

## Decisão 6 · Posicionamento Hayzer Beauty

**Pergunta**: sub-marca visível ou produto sem brand identity própria?

| Caminho | Prós | Contras |
|---|---|---|
| **A · Sub-marca visível "Hayzer Beauty"** | Identidade própria atrai mercado feminino premium. Marketing diferenciado. Domínio separado opcional (hayzerbeauty.com.br ou similar). Mesmo CNPJ. | Custo de criar identidade (paleta dourado+preto, logo variante, copy feminina). Risco de confundir Maker. |
| **B · Sem brand · "Hayzer pra Beauty"** | Custo zero de identidade. Reuse total do Maker. | Menos apelo. Gestora Ybera (público premium) pode rejeitar visual "maker 3D". |

**Recomendação Helena**: **A (sub-marca visível)** — público gestora Ybera é premium estética. Aceita pagar R$ 197/mês porque enxerga valor de marca. Sub-marca preserva Hayzer Maker (Rafael não confunde com produto feminino) e abre espaço pra Vertical 3, 4 futuras com mesma arquitetura. Custo identidade: ~8-12h Diego + Carla na Onda 2 (julho).

**Tua resposta**: [ A ] [ B ] [ ___ ]

---

## Decisão 7 · Modelo de cobrança ano 1

**Pergunta**: preço único ou tiers múltiplos?

| Caminho | Prós | Contras |
|---|---|---|
| **A · R$ 197/mês único** | Simples. Sem fricção de decisão pra cliente. ARPU previsível. Caixa estável. | Não captura disposição de pagar das top gestoras (562k+ alcance combinado). |
| **B · 3 tiers · R$ 97/R$ 197/R$ 397** | Captura premium (gestoras grandes) + atrai pequenas (R$ 97). | Complexidade. Risco de canibalização (gestora média escolhe tier baixo). Suporte explica diferença. |

**Recomendação Helena**: **A (R$ 197 único, ano 1)** — primeira coorte = 5-15 gestoras. Sem dado de elasticidade de preço. Mantém simples no ano 1, evolui pra tiers no ano 2 quando tiver dados reais. Risco de subprecificar gestora premium é menor que risco de tier complexo confundir adoção inicial.

**Tua resposta**: [ A ] [ B ] [ ___ ]

---

## Decisão 8 · Quando briefar G7 Beauty

**Pergunta**: reunião oficial G7 dia 05/07 ou antecipar pra 28/06?

| Caminho | Prós | Contras |
|---|---|---|
| **A · 05/07 (segunda pós-launch)** | Launch Maker 27/06 dedicado 100%. Sem mistura de foco. 1 semana de descompressão. | Atraso execução Onda 2. Heshiley pode estar viajando início julho. |
| **B · 28/06 (sábado pós-launch)** | Heshiley disponível (final junho). Co-host viável. G7 entra em julho já com arquitetura definida. Onda 2 começa 1 sem antes. | CEO 1 dia após launch = cansado. Mistura comemoração launch + briefing novo produto. |

**Recomendação Helena**: **B (28/06 14h)** — se Heshiley for co-host (decisão pendente · ver "Pendências operacionais" no `feedback_proximas_acoes_sessao_21-05`), ela traz perspectiva gestora real ao briefing. Vale a fadiga. **PORÉM**: requer que tu converse com Heshiley até 26/05 confirmando 3 perguntas (beta tester #1, co-host briefing, listar 5 gestoras próximas). Se Heshiley NÃO topar, **fallback A (05/07)**.

**Tua resposta**: [ A ] [ B ] [ ___ ]

---

# Resumo executivo (recomendações Helena)

| # | Decisão | Recomendação |
|---|---|---|
| 1 | Data ativação Op Noturna | **A · hoje 21/05 noite** |
| 2 | Canal alerta crítico | **C · Discord webhook** |
| 3 | Noites/sem | **B · 5/7** (seg-sex) |
| 4 | Threshold tokens | **B · R$ 50/noite cap** |
| 5 | 3 agents piloto 1ª noite | **A · Bruna + Lia + Otávio** |
| 6 | Posicionamento Beauty | **A · sub-marca "Hayzer Beauty"** |
| 7 | Cobrança Beauty ano 1 | **A · R$ 197/mês único** |
| 8 | Quando briefar G7 Beauty | **B · 28/06 14h** (se Heshiley topar) |

**Como responder**: marca [X] na opção escolhida em cada decisão. Aceita "todas Helena recomendou" como atalho. Se discorda de algo, explica em 1 linha + escolha tua.

**Próximo passo** após tua decisão:
- Decisões 1-5: eu configuro operação noturna + dispara primeira noite hoje (se A).
- Decisão 6: eu reporto pra Diego/Carla na Onda 2 (5/7 ou 28/6).
- Decisão 7: eu instruo Paulo no setup Stripe.
- Decisão 8: tu agenda Heshiley conversa até 26/05.

---

## Pendências operacionais relacionadas (não são decisões, mas afetam Bloco 2)

- **INPI PIX R$ 440 classe 42** · deadline GRU 13/06. Lembrete persistente segunda 25/05 (busca pePI INPI ao vivo antes de pagar). NÃO pagar classe 35.
- **Contador**: MEI→ME desenquadramento antes Calc Pro Sem 3 (~5-10 dias, R$ 250-400 + R$ 200-300/mês). Aproveitar e perguntar sobre risco legal posicionamento Beauty.
- **Heshiley conversa até 26/05**: 3 perguntas (beta tester #1, co-host briefing, listar 5 gestoras próximas Ybera Paris).
- **4 PRs GitHub do pr-review-bot em Draft** (#1, #2, #9, #10) — marcar Ready se OK, fechar se obsoletos.
