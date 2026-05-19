# Hayzer Beauty — Briefing Executivo (reunião 05/07)

> Helena, Diretora de Estratégia G7. Síntese de 7 docs master (5j-2, 5k, 5l, 5m, 5n, 2 research). Tom decisivo. 1 página.
> Tempo leitura: 6-7min · Zero dado inventado · Sem em-dash

---

## Tese central (3 linhas)

Hayzer Beauty é o primeiro SaaS multinível-genérico de beleza no BR que dá pra gestora de afiliadas tudo num lugar só: gestão de rede + LMS white-label + multi-canal de venda + gamificação algorítmica. Existe porque as ~500 gestoras de Ybera, Hinode, Natura e similares vivem hoje em 5 ferramentas que não conversam (Hotmart pra curso, Canva pra campanha, Excel pra meta, WhatsApp pra suporte, app da marca pra venda). Hayzer Beauty resolve com 1 conta. Heshiley (esposa CEO, gestora Ybera ativa) é beta tester #1.

---

## Mercado (números cravados)

- Ybera Paris isolada: **R$ 550M faturamento/ano · 40.000 afiliadas BR · ~500 gestoras ativas · 11 países**
- Brasil Influencer (evento Ybera): **700 → 12.000 pessoas em 3 anos (17x)**, 5 tiers ingresso R$ 447 a R$ 1.720+
- **Top 2 gestoras (Marla 274k IG + Erica 1.6M total) sem curso próprio** = gap verificado por dado
- Caso análogo monetizado: Mari Ribeiro, 40k seguidores, 2 cursos Hotmart vivos
- Beauty Fair BR: 200k profissionais B2B/ano (validação de mercado adjacente)
- **ARPU alvo**: R$ 197/mês por gestora · payback 1 mês · LTV 12 meses = R$ 2.364
- **TAM imediato BR**: ~2.000 gestoras de marcas top-5 multinível beleza (Ybera, Hinode, Natura, Avon, Mary Kay rivais menores) · TAM × ARPU = R$ 4.7M/ano só penetração 100%
- **Meta realista 12 meses**: 50 gestoras pagantes = R$ 118k ARR

---

## Top 5 features (priorizadas por valor × custo)

1. **Mini-Academy por gestora** com URL `/academy/[username]`: studio drag-drop, access control 3-tier (aberto/cohort/paid), live agendada in-app, marketplace inter-gestoras. Gap real e defensável. Ybera Academy oficial é one-size-fits-all, gestora não tem voz própria.

2. **Dashboard BI com sugestão IA contextual** (produto + região + dia + hora) ligado a deep-link funcional. Ybera tem mas com bug `/null` 404. Hayzer entrega dia 1 com link que funciona, comparativo período anterior e forecast de fim de mês.

3. **Multi-canal nativo de venda** (Marca mãe + TikTok Shop + Shopee + WhatsApp + Instagram DM). Ybera cobre 3, Hayzer cobre 5. WhatsApp + IG DM é o gap que o Rafael (persona Maker) e a Heshiley (persona Beauty) compartilham.

4. **Criador de campanhas in-app com metas algorítmicas** (proporcional ao histórico da afiliada, não tabela fixa). Gestora monta em 5min, templates Canva-like, push automático nos 50/75/90%, medalha física opt-in pra top 5 com qualifier 3+ meses.

5. **Calendário desbloqueio diário 4-cor + 2 senhas separadas** (acesso + financeira) + token compra com expiração 10min. Replica o que Ybera tem de forte no financeiro + automatiza via API SEFAZ (Ybera ainda faz aprovação manual).

Cortei do top 5: sistema RPG 12 níveis (entra como camada visual em cima do dashboard, não feature isolada), insights IG nativos (entra dentro do dashboard BI), evento próprio (Fase 3, longo prazo).

---

## Modelo de monetização

**Gestora paga, afiliada usa grátis.** Override Ybera vem da marca, não da afiliada, então cobrar afiliada quebraria o modelo dela. Gestora paga porque ganha rede mais ativa + monetiza Academy própria.

| Cenário | Preço/mês | Quem paga | Justificativa | Risco |
|---|---|---|---|---|
| Genérico | R$ 97 | Gestora pequena (até 10 afiliadas) | Entrada barata, escala em volume | ARPU baixo, margem apertada |
| **Especialista** | **R$ 197** ⭐ | Gestora ativa (10-50 afiliadas) | Sweet spot: paga 1 venda do mês cobre | Recomendado |
| Premium | R$ 497 | Gestora topo (50+ afiliadas) | Inclui marketplace inter-gestoras + analytics avançado | Discovery mais lenta |

Recomendação: lançar com **R$ 197 plano único** primeiro 6 meses. Quando hit 30 gestoras pagantes, fragmenta em 3 tiers acima.

---

## Caminho execução (3 fases)

- **Fase 1 — Briefing 05/07 → MVP 30/09**: arquitetura multi-vertical já prep no Hayzer (schema `vertical_type` confirmado). Construir os 5 features core com Heshiley validando semana a semana. Branding preto+dourado, naming "Hayzer Beauty" interno, marca pública NÃO mencionar Ybera (risco legal). Target: MVP fechado 30/09, 1 gestora pagando (Heshiley simbólico R$ 1).

- **Fase 2 — MVP 30/09 → Beta Q4 2026**: recrutar 5 gestoras beta da rede Heshiley. Preço Beta R$ 97 lifetime (early adopter). Iterar 60 dias. Target dezembro: 5 gestoras pagando, NPS 50+.

- **Fase 3 — Launch público Q1 2027**: campanha pra ~500 gestoras Ybera + ~1.500 multinível BR. Evento próprio digital "lançamento ao vivo no dashboard" estilo Brasil Influencer. Target Mar/2027: **50 gestoras pagantes R$ 197 = R$ 9.850 MRR**.

---

## 3 decisões CEO precisa tomar (antes de 05/07)

### 1. Posicionamento de marca
**Opção A**: "Hayzer Beauty" como sub-marca visível no marketing
**Opção B**: "Plataforma para gestoras de beleza multinível" como produto sem brand-mãe Hayzer

⭐ **Recomendo A**: aproveita SEO Hayzer + reduz custo de aquisição cruzando audiência Maker → Beauty (CEO + esposa = história orgânica).

### 2. Modelo de cobrança ano 1
**Opção A**: R$ 197 plano único
**Opção B**: 3 tiers desde dia 1 (R$ 97 / R$ 197 / R$ 497)

⭐ **Recomendo A**: simplifica venda no Beta, evita parálise de escolha, dá dado limpo de willingness-to-pay. Fragmenta só após 30 pagantes.

### 3. Quando briefar oficialmente G7
**Opção A**: 05/07 fechado
**Opção B**: Antecipar pra 28/06 14h (mesmo dia launch público Maker pela manhã)

⭐ **Recomendo B**: aproveita momentum do time, evita gap de 1 semana parado, Heshiley pode entrar como co-host (peso real).

---

## Riscos & mitigação

- **Risco jurídico Ybera**: se Hayzer Beauty mencionar "Ybera" no marketing público, Mary Kay-style cease-and-desist é provável. Mitigação: posicionamento "multinível beleza genérico" + Heshiley como caso de uso interno, nunca propaganda externa.
- **Risco Heshiley single point of failure**: se Heshiley sair da Ybera por qualquer motivo, perdemos beta tester #1 + validação interna. Mitigação: recrutar 2ª beta tester paralela até 30/09 (ex: top gestora Ybera receptiva).
- **Risco distração Maker**: G7 ainda em hardwork pra launch 27/06 Maker. Briefing Beauty 05/07 não pode virar feature creep no Hayzer Maker. Mitigação: regra firme "zero código Beauty antes de 30/09 estabilizar Maker pós-launch".

---

## Próxima ação concreta (próximos 7 dias)

CEO conversa com Heshiley **até 26/05** e confirma 3 coisas:
1. Ela topa ser beta tester #1 documentada
2. Ela aceita ser co-host da reunião 28/06 ou 05/07
3. Ela pode listar 5 gestoras Ybera potenciais beta da rede dela

Com sim nos 3, eu (Helena) abro **ADR-016 "Hayzer Beauty Fase 1"** e despacho:
- Diego → mood-board preto+dourado
- Bruna → schema `vertical_type=beauty`
- Carla → naming sub-marca em paralelo

---

**Fontes consultadas (7 docs master)**:
- `Contextos Projetos/02 - Frentes ativas/5j-2 - Estudo Ybera Club COMPLETO 2026-05-20.md`
- `Contextos Projetos/02 - Frentes ativas/5k - Ybera Club CAPTURA PROFUNDA 2026-05-20.md`
- `Contextos Projetos/02 - Frentes ativas/5l - Campanha Mobbr Corrida das Metas Ybera Run 2026-05-20.md`
- `Contextos Projetos/02 - Frentes ativas/5m - Ybera Academy LMS Estudo 2026-05-20.md`
- `Contextos Projetos/02 - Frentes ativas/5n - Brasil Influencer Evento Ybera 2026-05-20.md`
- `research/brasil-influencer-evento-anual-ybera-2026-05-20.md`
- `research/gestoras-ybera-academies-proprias-2026-05-20.md`
