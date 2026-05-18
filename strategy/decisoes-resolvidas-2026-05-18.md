# Decisões resolvidas — 2026-05-18

> **Helena** · resposta às 4 decisões 🟡 abertas em `strategy/semana-3-plano-2026-05-25.md`
> Princípio aplicado: CEO é agressivo > conservador. 50/50 vai pra opção ambiciosa.

## Contexto consolidado

- **Runway**: R$ 1.680 + 1 mês. Meta mínima 5 × R$ 50 = R$ 250/mês (`memory/project_runway_hayzer.md:15`)
- **Pillars**: Conversão 5.0 e Retenção 5.0 são os únicos <6 (`pillars/SCORES.md:21-22`)
- **Calendário**: 7 semanas até launch 04/07. Semana 3 = 25-31/05. Semana 4 = 03-09/06 já reservada pra Wave 1 Customers (`ROADMAP.md:78`)
- **Automação**: 3 Routines ativas + 4ª (pr-review-bot Camada 3) entra em minutos
- **Dashboard V4.8**: Felipe converte 20-23/05, preview sex 24/05 (`decisions/014-dashboard-v4-aprovado-mvp.md`)

---

## Decisão 1 — Calculadora Pro paga (R$ 27-47) na Semana 3 ou Semana 4?

### Recomendação: **SIM, entra na Semana 3 (25-31/05)**

**Justificativa**: Critério runway + chain-link. A calculadora free já está em prod desde 15/05 com WhatsApp CTA capturando leads — toda semana sem versão paga é semana sem dado de willingness-to-pay. Semana 4 está 100% comprometida com Wave 1 Customers (`ROADMAP.md:78-83`), então "adiar pra Semana 4" na prática vira "adiar pra Semana 5+", queimando 2 semanas de validação de monetização antes do launch. Princípio Rumelt cap 7 (proximate objective): "R$ 250/mês em 90 dias" exige começar a vender em 25/05, não em junho.

**Risco identificado**: Felipe estará em conversão React do dashboard V4.8 (20-23/05) e polish (Semana 3 bloco A). Adicionar Calculadora Pro pode disputar foco dele. **Mitigação**: escopo da Pro é PDF export + histórico (localStorage) + multi-impressora — sem backend novo. Carla escreve copy, Paulo configura Stripe Payment Link (não checkout custom), Felipe gasta no máximo 6h em UI de paywall. Cabe.

**Crítica-da-crítica**: posso estar subestimando o risco de o público da free não ter atingido massa crítica ainda — se a calculadora free tem só ~30-100 usos/dia, lançar Pro agora vira validação com N estatisticamente fraco e CEO pode ler "ninguém quer pagar" quando na verdade o sinal é "ninguém ainda viu". Mitigação real: instrumentar evento "viu_paywall" + "clicou_comprar" antes do botão, separar do "comprou" — assim mede intent mesmo com volume baixo.

**Próxima ação se CEO aceitar**: Carla escreve copy do paywall + página de venda até qua 27/05. Paulo cria Stripe Payment Link R$ 37 (preço-âncora meio do range) até qua 27/05. Felipe implementa lógica de check + UI bloqueada qui-sex 28-29/05. Deploy preview sex 29/05 noite. Sofia + Marcos divulgam no grupo Beta WhatsApp sáb 30/05.

---

## Decisão 2 — Ritmo de revisão dos PRs (~30min/semana)

### Recomendação: **SIM, aceita o ritmo de 30min/semana — mas com gatilho de redução automática**

**Justificativa**: Critério ROI de tempo. Plano atual mostra ganho líquido de 1.5h/mês (3.5h manual → 2h revisão) + zero risco de esquecer ciclo. 30min/semana é menos que 1 reunião de squad e gera 4 outputs estruturados (2 PRs + 1 issue + propagação memória). Recusar isso é recusar alavancagem 3:1. Princípio chain-link: sistema de auto-revisão SÓ funciona se houver revisor humano confiável — sem CEO no loop, Routines viram ruído com ar de progresso.

**Risco identificado**: 30min é o número ideal no papel. Na prática, primeiro PR sempre demora mais (CEO vai querer ler tudo, comentar, ajustar). Semana 1-2 pode ser 60-90min reais. Se CEO não vê o ritmo cair pra 30min até semana 3, vai abandonar.

**Crítica-da-crítica**: posso estar otimista demais com "spot-check 5/60 princípios → 3/60". Se o primeiro estudo-g7 dominical sair com 1 princípio alucinado, CEO perde confiança e o ritmo NÃO cai — ele tem que ler tudo. Estou apostando em quality do primeiro output que ainda não rodou. Honesto: só sabemos depois de ter.

**Próxima ação se CEO aceitar**: bloqueia agora na agenda 3 slots recorrentes — Seg 9h-9h15 (pillars), Ter 9h-9h25 (estudo), Dia 1/mês 9h-9h15 (audit). Gatilho automático: se duas semanas seguidas o PR pillars sair sem mudanças relevantes, reduzir slot pra 5min. Helena monitora e avisa.

---

## Decisão 3 — Ordem 1-2-3 (Analytics+Retenção → Customers light → PWA/Mobile)?

### Recomendação: **SIM, confirma a ordem 1-2-3 — com uma troca de ESCOPO em Feature 1**

**Justificativa**: Critério chain-link puro. Conversão 5.0 e Retenção 5.0 são os 2 elos mais fracos do produto (`pillars/SCORES.md:21-22`). Atacar isso primeiro é onde investimento rende mais. Wave 1 Customers em 2º faz sentido porque depende de ter waitlist com massa (gerada pelos canais Marcos pós-Semana 3) — não adianta build admin pra waitlist vazia. PWA em 3º porque é polish, não bloqueador de launch (manifest+SW já estão em prod desde 16/05).

**Troca de escopo na Feature 1**: substituir "lead magnet Planilha 7 métricas" por **"upsell Calculadora Pro embedded no funil"**. Razão: lead magnet gratuito alimenta lista mas não testa monetização. Se Decisão 1 = SIM (Calculadora Pro entra Semana 3), a Pro vira o próprio lead magnet pago — economiza 1 esforço Carla+Marcos e dobra como teste de willingness-to-pay. Lista cresce IGUAL, mas com dado de quanto pessoa paga.

**Risco identificado**: ordem 1-2-3 deixa Wave 1 Customers pra Semana 4-5. Se algum cliente Lifetime/Pro pagar nas próximas 2 semanas e pedir "onde vejo meus clientes?", não tem tela. Risco real porque a Calculadora Pro precisa de histórico, e histórico é meio-caminho pra customers.

**Crítica-da-crítica**: estou tratando Conversão e Retenção como problemas resolvíveis com instrumentação + email sequence, mas o problema raiz pode ser **proposta de valor**. Se hero copy + posicionamento ainda confundem maker 3D, nenhum analytics vai mostrar conversão melhor — só vai dar evidência de que a landing não converte, sem dizer por quê. Marcos precisa entrar no time da Feature 1 não só pra analytics, mas pra revisar hero copy + 3 variantes A/B com hipótese clara antes do dado chegar.

**Próxima ação se CEO aceitar**: Marcos lidera Feature 1 (analytics + 3 hipóteses de hero copy testáveis). Sofia escreve sequência D+1/D+3/D+7. Felipe instrumenta PostHog free segunda 25/05. Wave 1 Customers light fica pra Semana 4 conforme `ROADMAP.md:78` (sem mudança). PWA polish pra Semana 6 (conforme `ROADMAP.md:94`).

---

## Decisão 4 — Deadline PR de Routine: "48h ou fecha" vs "7 dias ou fecha"?

### Recomendação: **48h ou fecha** (com escape hatch de 1 extensão)

**Justificativa**: Critério higiene de sistema. Princípio Rumelt cap 9 (chain-link): sistema de auto-revisão é tão forte quanto o elo mais lento — sem deadline duro, fica acumulando entropia. 48h força disciplina no CEO E gera fast feedback pra calibrar as Routines (se PR seg não foi revisado até qua, próximo seg já está aberto = conflito). 7 dias é meia-medida que parece compassiva mas na prática vira "deixa pra próxima semana", e quando você lembra tem 3 PRs abertos. Mindset agressivo (princípio CEO 2026-05-18) bate com 48h.

**Escape hatch (importante)**: CEO pode estender 1× por PR pra 96h (4 dias) comentando `/extend` no PR. Sem extensão = fecha automático. Cobre viagem, doença, dia caótico, sem virar regra flácida.

**Risco identificado**: 48h pode disparar fechamento de PR útil só porque CEO teve uma sexta corrida. Princípios bons da Routine estudo-g7 viram lixo. Mitigação: a Routine roda toda semana de novo, então perder 1 ciclo não destrói memória — só atrasa propagação 7 dias. Custo real é baixo.

**Crítica-da-crítica**: estou supondo que CEO vai querer disciplina dura agora. Mas runway está apertado e CEO está em modo "vender Lifetime, vender Calculadora Pro" — a atenção dele vai pra cliente que paga, não pra revisar PR de Routine. 48h pode ser sadismo de processo numa hora em que sobrevivência > higiene. Honesto: se eu fosse CEO de mim mesma, semana 1-2 talvez fizesse 96h e endurecia pra 48h só depois de validar primeiro Lifetime vendido. Não vou mudar minha recomendação, mas registro que CEO pode legitimamente escolher 96h pelos próximos 30 dias.

**Próxima ação se CEO aceitar**: configurar `pr-review-bot` Routine (4ª) com regra: PR aberto >48h sem review/merge → bot comenta menção @Gabriel + adiciona label `auto-close-em-24h`. PR aberto >72h → bot fecha com mensagem padrão "Fechado por timeout. Routine roda de novo em <X dias>." Comando `/extend` no PR estende prazo +48h, máximo 1× por PR. Ricardo implementa o bot até seg 25/05.

---

## Bloco copiável (pra acelerar fluxo do CEO)

```
1. Calculadora Pro: SIM, entra Semana 3 (25-31/05). Carla copy + Paulo Stripe Link + Felipe paywall 6h.
2. Ritmo PR Routines: SIM, 30min/semana com gatilho redução automática se 2 semanas sem mudança.
3. Ordem features: 1-2-3 OK, MAS Feature 1 troca lead magnet pela Calculadora Pro como upsell. Marcos lidera hero copy A/B.
4. Deadline PR: 48h ou fecha, com /extend uma vez (+48h). Ricardo implementa pr-review-bot até 25/05.
```

---

## Arquivos consultados

- [strategy/semana-3-plano-2026-05-25.md](semana-3-plano-2026-05-25.md) (4 decisões abertas)
- [pillars/SCORES.md](../pillars/SCORES.md) (pilares 7 e 8 em 5.0)
- [ROADMAP.md](../ROADMAP.md) (linhas 78-99, Semanas 4-6)
- `memory/project_runway_hayzer.md` (meta R$ 250/mês — memória CEO local)
