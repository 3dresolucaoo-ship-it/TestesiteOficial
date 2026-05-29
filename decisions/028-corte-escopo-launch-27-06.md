# ADR 028 — Corte de Escopo para Launch 27/06

> Status: PROPOSED (CEO precisa aceitar ou contrapropos)
> Data: 2026-05-21
> Autor: Helena (modo critico) · Registrado por: Lia

---

## Contexto

38 dias util ate launch publico 27/06. O escopo prometido internamente nao corresponde ao estado real do produto:

- **Produto interno (modulos)**: ~50% pronto
- **Integracao entre modulos** (golden path real do maker): ~30% pronto
- **Medio ponderado real**: ~60-65% pro usuario usar sem bug grave

O time G7 esta em operacao noturna paralela (10 agentes/noite), mas ha limites fisicos:

1. Cota Anthropic Max 5x pode bater com 4-5 agentes/noite operando pesado
2. Zero usuario real testando o produto ate 11/06 (sem beta feedback real)
3. Decisao CNPJ MEI→ME ainda pendente (bloqueia 1a venda paga)
4. Bugs criticos ainda abertos (TBT 3.6s, MP OAuth, Lighthouse so rodou em /)

Helena modo critico (digest 21/05): "38 dias e IRREAL pro escopo prometido."

O risco concreto: lançar em 27/06 com produto bonito-mas-quebrado. Churn no D+3 dos primeiros makers = reputacao danificada antes de ter tracaoo.

---

## Decisao proposta

Nao decidida. CEO precisa aceitar, rejeitar ou contrapropos.

**Proposta Helena**: reorganizar escopo em 3 categorias:

### MANTÉM (obrigatorio pro launch 27/06)

1. **Golden path end-to-end**: WhatsApp → lead → pedido → producao → financeiro (ao menos 1 fluxo funcionando sem quebrar)
2. **3 modulos ricos**: /orders, /customers, /finance (os mais usados no dia a dia do maker)
3. **Onboarding wizard 3 telas**: Felipe ja codou (branch feature/onboarding-wizard) — review + merge prioritario
4. **Performance TBT**: fix Bruna merged + Lighthouse confirmando TBT abaixo de 1.5s em prod
5. **Landing com PNGs reais**: Diego spec v2 com cliente mulher + maker antes/depois (feature/landing-v2-pngs-reais)

### POSTERGA (Wave 1 pos-launch — ate 25/07)

1. **8 modulos V4 restantes**: leads, inventory, products, production, content, decisions, catalogs, portfolios (hoje em shell V4 sem dados ricos)
2. **Tela /admin protegida**: audit log + email massa (ADR-026 spec pronta, implementacao pos-launch)
3. **Sentry em prod**: ADR-025 spec pronta, instalar 17/07 como planejado originalmente
4. **Sequencia email D+1/D+3/D+7**: Marcos planejo, Resend ainda nao configurado

### CORTA (fora do roadmap ate MRR estavel)

1. **Secao comparativa 43 logos concorrentes**: assets em public/landing/v3/, mas nenhum maker quer ver comparativo — quer ver o produto funcionando
2. **Catalogo publico polido**: bugs reais reportados, nao ha maker usando ainda, prioridade pos-traction
3. **Landing 9 timelapses animados**: high effort, low conversion impact pra fase de lancamento

---

## Alternativas consideradas

- **A: Manter escopo completo, lançar 27/06 assim mesmo** — risco alto de produto bonito-mas-quebrado. Churn D+3 mata reputacao com primeiros 50 makers. Descartada como default mas CEO pode escolher.
- **B: Adiar launch pra 27/07** — perde janela de lancamento hard trabalhada desde 19/05. Pressao psicologica no time. Descartada salvo situacao critica.
- **C: Esta proposta (corte cirurgico)** — lança menor, mais solido. Promete menos, entrega 100% do prometido.

---

## Consequencias

### Aceitar (optar pelo corte)

- Produto lanca menor, mas sem bug grave visivel
- Primeiros 50 makers tem experiencia completa nos 3 modulos-nucleo
- Churn potencial menor (expectativa alinhada com entrega)
- Time G7 concentra energia em qualidade, nao quantidade
- ADRs 025/026 viram planejamento pos-launch formal

### Negar (manter escopo)

- Launch 27/06 com 8 modulos em shell V4 sem riqueza de dados
- Golden path quebrado em algum ponto (30% integrado hoje)
- TBT pode nao ser resolvido sem tempo de QA real
- Risco: maker cadastra, usa 1 vez, nao volta (sem habito formado)

---

## Riscos nao-falados (modo critico Helena)

- **Sem usuario real ate 11/06**: feedback loop zero. Onboarding wizard entregue mas nao testado com maker real. Pode ter gap critico invisivel.
- **Cota Anthropic Max 5x**: 4-5 agentes/noite pesado pode bater teto em semana de sprint final. Se cair, perdemos 1 noite inteira de trabalho.
- **Decisao CNPJ MEI→ME pendente**: sem desenquadrar, 1a venda paga do Hayzer completo cria risco fiscal. Bloqueia onboarding pago.
- **Lighthouse nao rodou em rotas internas**: TBT 3.6s medido so na landing. Modules internos podem ter performance pior que a landing. Desconhecido.
- **Bruna TBT fix nao confirmado em prod**: estimativa -2.0 a -2.7s, mas nao medido. Pode ser menos.

---

## Proximo passo

**CEO assina ou contrapropo.**

Se aceitar: Helena reorganiza ROADMAP com 3 categorias acima. Felipe/Bruna recebem lista curta e priorizada. Proxima operacao noturna foca so em MANTÉM.

Se rejeitar: documentar razao aqui e ajustar ROADMAP pra sprint total.

Se contrapropos: ajustar lista MANTÉM/POSTERGA conforme criterio CEO.

---

## Quando revisitar

- Se TBT confirmado em prod abaixo de 1.5s → pode puxar 1 item de POSTERGA de volta
- Se cota Anthropic bater 21-25/06 → revisitar velocidade de execucao
- Se beta tester (11/06) reportar bug critico em modulo MANTÉM → parar tudo, corrigir antes de qualquer outra coisa
