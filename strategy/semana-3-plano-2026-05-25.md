# Planejamento Estratégico Semana 3 — 25-31/05/2026

> **Autor**: Helena (Diretora de Estratégia G7)
> **Data**: 2026-05-17
> **Contexto**: pós-automação 24/7 + dashboard V4.8 aprovado MVP

## Resumo

Como reorganizar a Semana 3 considerando que 3 Routines Claude Code passam a rodar 24/7 a partir de 18/05, destravando tempo do CEO e mudando o gargalo do projeto.

## Contexto relevante

- **Automação ativa 18/05**: pillars-review-semanal (seg 9h), estudo-g7-semanal (ter 9h), audit-mensal (dia 1, 9h) — ADR-015 aplicado. Total ~9 runs/mês de 450 disponíveis no Max.
- **Dashboard V4.8 MVP aprovado** (ADR-014). Felipe converte React 20-23/05; deploy preview sex 24/05 com dados reais do CEO.
- **Runway pessoal CEO**: R$ 1.680 investidos + 1 mês full-time. Mindset reposicionado pra investidor. Meta mínima sobrevivência: 5 clientes × R$ 50 = R$ 250/mês. Sem caixa pra contratar — toda Semana 3 sai do par CEO+G7.
- **Pillars média atual 7.4** com pilares Conversão (5.0) e Retenção (5.0) como elos mais fracos pré-launch — exatamente os que destravam quando dashboard React entra em prod e podemos medir funil real.
- **7 semanas restantes** pro launch 04/07. Semana 3 é a primeira sem "esperar manualmente" — a automação fez isso virar passado.

---

## 1) Roadmap atualizado pra Semana 3 (25-31/05)

### Antes
Semana 3 estava listada como "LGPD + Email + MP Marketplace" — bloco fraco porque a maior parte do LGPD/email já fechou na Semana 1.

### Depois (automação destrava)

| Bloco | Owner | Justificativa |
|---|---|---|
| **A. Dashboard V4.8 React em prod com dados reais** | Felipe + Bruna | Sex 24/05 deploy preview; Semana 3 = polish + bugs reais + onboarding empty states. Conecta `services/finance.ts` + `orders.ts` reais. |
| **B. Analytics de funil instalado** (Vercel Analytics + PostHog free) | Marcos + Felipe | Pilar Conversão 5.0 → 6.5. Sem dado real, não tem o que decidir. 1 dia de setup destrava 90 dias de leitura. |
| **C. Lighthouse + Axe audit + fix top 3** | Júlia + Felipe | Pilares Performance 6.5 e Acessibilidade 6.5 saem do "Fortalecer". Bate na meta 30d (8.0 média). |
| **D. Email transacional sequência D+1, D+3, D+7** | Sofia + Carla | Pilar Retenção 5.0 → 6.5. Variable reward Hooked. Sem custo extra (Resend free tier suporta). |
| **E. MP OAuth E2E** se bug do painel MP destravar até 25/05 | Paulo | Se ainda travado, **adiar pra Semana 5** sem culpa. Stripe Connect já cobre — não é bloqueador de launch. |
| **F. Endpoint DELETE /api/me + Vercel BotID Challenge** | Otávio + Bruna | Itens pequenos (2-3h cada). Fecha LGPD + Tier 1. |
| **G. Calculadora 3D Pro paga R$ 27-47** | Carla + Paulo + Felipe | Estratégia recuperação runway. Primeira monetização real antes do launch. Calculadora atual já tem WhatsApp CTA — versão Pro adiciona PDF + histórico + multi-impressora. |

**🟡 DECISÃO CEO**: bloco G (Calculadora Pro paga) entra na Semana 3 ou espera Semana 4? Meu voto: **entra**. Razão: validar willingness-to-pay com público que JÁ usa a free, com 6 semanas pra ajustar antes do launch.

---

## 2) Como o CEO usa as Routines nas próximas 2 semanas

### Custo/benefício honesto

**Custo de tempo CEO**:
- Segunda 9h-9h15: revisar PR `pillars-review-semanal` (15min)
- Terça 9h15-9h25: revisar PR `estudo-g7-semanal` spot-check 5/60 princípios (10min)
- Dia 1/mês 9h-9h15: revisar Issue `audit-mensal` (15min)
- **Total semanal**: 25-30min. Mensal: ~2h.

**Benefício mensurável**:
- Antes: CEO rodava `/audit-mensal` (~1h), `/study` (~2h dominical), `/pillars-review` (~30min seg). Total ~3.5h/mês manual.
- Depois: 2h/mês revisando PRs prontos.
- **Ganho líquido**: ~1.5h/mês + zero risco de esquecer ciclo.

### Vale a pena? Sim, com 2 ajustes

1. **Reunião segunda 9h CEO+Helena**: passar de 60min pra 30min. PR já chega digerido, foco vira "o que faz essa semana" não "o que aconteceu".
2. **Buffer terça 9h-9h30**: bloqueio na agenda do CEO. Sem isso, PR acumula.

### Roteiro de revisão (2 semanas de exemplo)

**Semana 18-24/05** (primeira execução):
- Seg 18/05 9h: 1ª execução Routine pillars. CEO revisa, comenta no PR, merge.
- Ter 19/05 9h: 1ª execução Routine estudo G7. **Esta merece atenção dobrada** — primeiro output define padrão. CEO valida 5 princípios aleatórios contra livro real (anti-alucinação).

**Semana 25-31/05** (segunda execução):
- Seg 25/05 9h: 2ª pillars. Se padrão idêntico, CEO pode reduzir revisão pra 5min.
- Ter 26/05 9h: 2ª estudo G7. Spot-check 3/60 (não 5/60). Confiança gradual.

**🟡 DECISÃO CEO**: aceita esse ritmo de 30min/semana?

---

## 3) Próximas 3 features prioritárias pra launch 04/07/2026

### Feature 1 (Semana 3-4) — **Funil mensurável + retenção mínima viável**

**O que**: Vercel Analytics + PostHog free + sequência email D+1/D+3/D+7 + lead magnet "Planilha 7 métricas maker 3D".

**Por quê é a 1ª**: pilares 7 e 8 (Conversão 5.0, Retenção 5.0) são os ÚNICOS abaixo de 6 hoje. Princípio chain-link (Rumelt cap 9): elo mais fraco é onde o investimento rende mais. Sem isso, launch 04/07 é cego.

**Quem**: Marcos (analytics) + Sofia (email sequência) + Carla (copy do lead magnet) + Felipe (instrumentação).

### Feature 2 (Semana 4-5) — **Wave 1 Customers (light) + admin lite**

**O que**: tela `/customers` com lista + perfil + métrica "sumiu há X dias" + admin lite (lista waitlist + export CSV).

**Por quê é a 2ª**: Wave 1 já estava no ROADMAP. Admin lite vira urgente porque waitlist começa a encher pós-Marcos canais maker 3D. Sem admin, CEO não consegue convidar primeiros 50-100 pro soft launch (Semana 7).

**Quem**: Bruna (customers service) + Felipe (telas) + Otávio (audit_log).

**Escopo cortado**: Wave 1 full estava 1 semana inteira. Versão light (sem dashboard widgets dedicados) cabe em 4 dias.

### Feature 3 (Semana 6) — **PWA + Mobile audit + onboarding 3 passos polido**

**O que**: PWA já tem setup. Falta: ícones definitivos + offline fallback testado + audit mobile em devices reais + onboarding integrado ao dashboard React.

**Por quê é a 3ª**: maker 3D testa no celular entre impressões. Pilar Mobile 7.0 → 8.5 (meta 30d).

**Quem**: Diego (ícones + visual ajustes mobile) + Júlia (audit devices) + Felipe (integração) + Sofia (microcopy onboarding).

### O que NÃO entra na fila

- **Wave 2 (Suppliers)**: adia pra Fase 2 (jul-set).
- **MP Marketplace E2E**: bloqueado por bug deles. Stripe Connect cobre. Reagenda Semana 5 ou pós-launch.
- **Cursos/Lifetime Deal**: estratégia runway. Vira **paralelo** ao código, não código novo. Marcos + Carla + Paulo cuidam.

**🟡 DECISÃO CEO**: confirma ordem 1-2-3 acima?

---

## 4) Risco identificado — PR acumulando sem revisão

### Cenário ruim
Routine roda toda segunda + terça + dia 1. PR é criado. CEO viaja, fica doente, ou simplesmente esquece. Em 2 semanas, 4-6 PRs abertos. Conflito de merge entre eles. Confiança no sistema cai. CEO desliga as Routines.

### Mitigação em 3 camadas

**Camada 1 — Notificação ativa (setup imediato, custo zero)**
Cada Routine ao terminar cria PR + envia 1 mensagem Slack/Discord com link direto. GitHub Mobile no celular do CEO mostra notif push. Revisar PR vira tarefa de 2min no Uber, fila do mercado, etc.

**Camada 2 — Auto-stale com lembrete (após 1 ciclo)**
- PR aberto há 5 dias sem revisão → bot comenta "@Gabriel este PR está esperando há 5 dias. Quer mergear, fechar ou pedir mudança?"
- PR aberto há 10 dias → label `stale` automático + Helena avisa no CEO Command Center.
- PR aberto há 14 dias → Helena chama council automático (ADR-015 já prevê).

**Camada 3 — Deadline de revisão (regra dura)**
- Acordo CEO+Helena: PR de Routine **revisado em até 48h** ou **fechado sem merge**.
- Sem revisão = sem merge = sem propagação. Sistema não polui memória dos agentes.

**🟡 DECISÃO CEO**: aceita o acordo "48h ou fecha"?

### Risco secundário — Token quota Max

Routines consomem tokens da quota Max. CEO já viu "86% do limite semanal" uma vez. Se Semana 2-3 do Felipe converter React for token-pesada + 3 Routines rodando + sessões CEO normais, pode estourar.

**Mitigação**: na 1ª semana cheia das 3 Routines (18-24/05), Ricardo monitora consumo via dashboard Claude Code. Se passar de 60% até quarta, pausa estudo-g7-semanal (a mais cara) até virar a semana.

---

## Próxima ação concreta

**Helena — agora**: subir este plano pro CEO ler + propor reunião curta segunda 18/05 9h (após 1ª Routine pillars rodar) pra fechar:
1. Feature 1-2-3 ordem confirmada
2. Acordo "48h ou fecha PR de Routine"
3. Bloco G (Calculadora Pro paga) entra Semana 3 ou Semana 4

**Time G7 — Semana 2 (em curso)**: mantém gantt do ROADMAP linhas 36-66. Sem mudança aqui.

**CEO — segunda 18/05**: revisar PR `pillars-review-semanal` (1ª execução real). Output dessa revisão calibra confiança nas próximas 2 semanas.

---

## Arquivos citados

- [ROADMAP.md](../ROADMAP.md) — Semana 3 atual e Semana 2 detalhada
- [CEO_COMMAND.md](../CEO_COMMAND.md) — foco semana + status squads
- [pillars/SCORES.md](../pillars/SCORES.md) — pilares 7 e 8 em 5.0
- [decisions/014-dashboard-v4-aprovado-mvp.md](../decisions/014-dashboard-v4-aprovado-mvp.md) — gantt conversão React
- [decisions/015-automacao-24-7.md](../decisions/015-automacao-24-7.md) — 3 Routines configuradas
- [automation/routines-specs.md](../automation/routines-specs.md) — prompts detalhados
