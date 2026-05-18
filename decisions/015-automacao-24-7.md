# ADR 015 — Automação 24/7: Claude Code Routines (incluso no Max plan)

> **Data**: 17/05/2026 (domingo noite)
> **Status**: Implementada — 3 routines ativas em prod (2026-05-17 noite)
> **Decisor**: Gabriel (CEO)
> **Custo de reversão**: BAIXO — routines podem ser pausadas a qualquer momento

## Implementação (2026-05-17 noite)

Routines configuradas no dashboard `claude.ai/code/routines`. Repo: TestesiteOficial. Conectores: Supabase + Vercel. Permissão git push direto: OFF (cria PR sempre).

| Routine | Trigger ID | URL |
|---|---|---|
| `audit-mensal` | `trig_01DJwCxXJGSP3TLcifcyTqGw` | https://claude.ai/code/routines/trig_01DJwCxXJGSP3TLcifcyTqGw |
| `pillars-review-semanal` | `trig_01MC2qJxjr6ZC9VmyLSg4fz3` | https://claude.ai/code/routines/trig_01MC2qJxjr6ZC9VmyLSg4fz3 |
| `estudo-g7-semanal` | `trig_01AEL5ZnaF3Gu186Rinvdzuq` | https://claude.ai/code/routines/trig_01AEL5ZnaF3Gu186Rinvdzuq |

Próximas execuções agendadas: `pillars-review-semanal` roda amanhã 18/05 (segunda 9h BRT); `estudo-g7-semanal` roda 19/05 (terça 9h BRT); `audit-mensal` roda 01/06 (dia 1, 9h BRT).

---

---

## Contexto

CEO trouxe pergunta crítica 17/05:

> "Se meu computador desligar, ele simplesmente desliga e eu não consigo rodar mais.
> Você programou tarefa de estudar hoje no domingo, mas se não tiver aqui no
> computador falar pra você, não tem como. Tem algum jeito de você programar as
> tarefas, você ir lá e fazer, mesmo o meu computador não estando ligado?
> Faz sentido pagar VPS pra nosso momento? Ou existe alternativa pra você
> começar a não precisar tanto de mim aqui no computador?"

CEO **não quer gastar com API** (já paga R$ 588/mês no plano Max, considera caro).
Quer SEM custo adicional se possível.

---

## Descoberta crítica

**Claude Code Routines** existe desde 14/04/2026 (1 mês atrás) e está **INCLUSO NO MAX**:

- Cloud-hosted scheduled tasks rodando na infra Anthropic
- Computador do CEO pode ficar **desligado**
- **15 runs/dia incluídos no Max plan** (Pro: 5/dia, Team/Enterprise: 25/dia)
- Triggers: schedule (cron presets ou expressão custom, mínimo 1h), API call, GitHub events
- Conecta com Slack, GitHub, env vars, setup scripts
- **Maio 2026**: Anthropic adicionou "Dreaming" — agentes melhoram entre runs via memory curation automática

**Tradução prática**: tudo que CEO pediu funciona, sem gastar 1 centavo a mais do que já paga.

---

## Análise das 6 opções consideradas

| # | Opção | Custo adicional | Setup | Recomendação |
|---|---|---|---|---|
| **1** | **Claude Code Routines** ⭐ | **R$ 0** (já incluso Max) | 1-2h | ✅ FAZER AGORA |
| 2 | GitHub Actions + Claude Code Action | $10-30/mês (tokens API) | 2-3h | Só se ultrapassar 15 runs/dia |
| 3 | VPS DigitalOcean/Linode | R$ 30-100/mês (VPS + tokens) | 4-6h | Pré-launch NÃO; pós-launch talvez |
| 4 | Vercel Cron + Claude API | $5-20/mês (tokens) | 1-2h | Pós-launch pra jobs DO produto |
| 5 | Anthropic Claude Managed Agents | Enterprise (caro) | 4-8h | Empresa grande — não nosso caso |
| 6 | Não fazer nada | R$ 0 | 0 | Depende do laptop do CEO sempre |

**Vencedor claro**: opção 1 (Routines) — único que combina **zero custo extra + 24/7 + setup curto + dentro do que CEO já paga**.

---

## Por que R$ 588 (Max plan) já é EXCELENTE ROI

O plano Max do CEO inclui:

1. **Claude Code CLI ilimitado-na-prática** (5h-day quota generosa, já usa intensamente)
2. **Claude Code Routines** (15 runs/dia cloud, ANTES ele não usava)
3. **Acesso a Opus/Sonnet/Haiku** todos os modelos
4. **Memória persistente** entre sessões
5. **MCP integrations** (Supabase, Vercel, Chrome, etc — todos os que usa)

**Comparação honesta**: para rodar UM agente equivalente 24/7 via API pura, custaria:
- Sonnet 4: ~$3/M input + $15/M output
- Estimativa uso: 5-10M tokens/dia (Claude Code intenso)
- **API only**: R$ 1.500-3.000/mês
- **Max plan**: R$ 588/mês com benefícios acima

**R$ 588 não é caro — é PECHINCHA pro caso de uso atual.**

---

## Decisão proposta

### FASE 1 — AGORA (setup 1-2h, custo R$ 0)

**Configurar 3 Routines no Claude Code Routines (15 runs/dia disponíveis, usa só 3-4)**:

1. **Estudo G7 dominical** — toda terça 09:00 BRT (já que domingo só CEO testa)
   - Prompt: "Cada agente G7 lê próximo livro da lista em `studies/_index.md`. Extrai 5-7 princípios acionáveis. Atualiza `.claude/agents/<agente>.md > Memória ativa > Princípios da área`."
   - Trigger: cron `0 12 * * 2` (terça meio-dia UTC = 9h BRT)
   - Run/mês: 4

2. **Revisão pillars semanal** — toda segunda 09:00 BRT
   - Prompt: "Lê `pillars/SCORES.md`. Verifica se houve commits que sobem ou descem score de algum pilar. Gera relatório `pillars/weekly-YYYY-MM-DD.md` com mudanças. Avisa via GitHub Issue se algum pilar caiu."
   - Trigger: cron `0 12 * * 1` (segunda 9h BRT)
   - Run/mês: 4

3. **Audit mensal automático** — dia 1 do mês 06:00 BRT
   - Prompt: "Roda equivalente ao `/audit-mensal`. Gera `audits/YYYY-MM-DD.md` snapshot do projeto. Atualiza `audits/_rolling.md`. Identifica bugs novos pra `ROADMAP.md`. Avisa CEO via GitHub Issue."
   - Trigger: cron `0 9 1 * *` (dia 1 às 9h BRT)
   - Run/mês: 1

**Total runs/mês**: 9 (de 450 disponíveis — usa 2%)

### FASE 2 — PÓS-LAUNCH (jul/2026+)

Adicionar mais routines conforme necessidade:
- **Reconciliação diária Stripe/MP** — checar `payments.amount_total` vs `stripe.balance_transactions`
- **Alerta filamento crítico** — checar inventory low → notificar maker via WhatsApp/email
- **Insight semanal por maker** — Hooked P5 (variable reward email segunda 8h)
- **Code review automático em PRs** — Claude analisa todo PR aberto

### FASE 3 — MÉDIO PRAZO (6+ meses)

Avaliar se Routines (15 runs/dia) é suficiente ou migrar pra Managed Agents (enterprise).
Hoje: prematuro.

---

## Configuração técnica (FASE 1)

Setup via Claude Code Docs (https://code.claude.com/docs/en/web-scheduled-tasks):

```bash
# 1. Autenticar no Claude Code (CEO já tá)
claude login

# 2. Acessar dashboard Routines
# Vai em: https://code.claude.com → Routines

# 3. Criar routine 1 (Estudo G7)
# - Name: "estudo-g7-semanal"
# - Repository: 3dresolucaoo-ship-it/TestesiteOficial
# - Schedule: cron "0 12 * * 2" (terça 09h BRT)
# - Prompt: [como acima]
# - Connectors: GitHub
# - Allowed tools: Read, Write, Edit, Glob, Grep, Bash

# 4. Criar routine 2 (Pillars review) — mesma lógica
# 5. Criar routine 3 (Audit mensal) — mesma lógica
```

**Quem configura**: Ricardo (DevOps) — 1-2h.

---

## Riscos e cuidados

### 1. Tokens contam dentro da quota Max
- Cada routine consome tokens normalmente
- Max plan tem quota generosa mas não infinita
- **Mitigação**: routines curtas e específicas (não conversação longa)

### 2. Routines sem supervisão podem gerar conteúdo ruim
- Agente pode escrever besteira na memória se loop mal feito
- **Mitigação**: a) routine gera GitHub Issue ao terminar — CEO revisa antes de mergear mudanças críticas; b) validação amostral mensal (já no `pillars/SCORES.md`)

### 3. GitHub Actions free tier limitado
- Se um dia Routines deixar de ser suficiente, migrar pra Actions paga tokens
- **Hoje**: irrelevante, Routines basta

### 4. Mudança da Anthropic na quota Max
- Anthropic pode mudar limites do Max plan (já mudou em 2025)
- **Mitigação**: sempre opção 2 (GitHub Actions) ou 4 (Vercel Cron) como backup

### 5. Vendor lock-in
- Tudo na Anthropic = se mudar de provider, refaz tudo
- **Hoje**: aceitável, Claude é o melhor pro caso

---

## Justificativa

1. **Custo R$ 0** — usa o que CEO já paga
2. **Setup 1-2h** — não rouba semana inteira
3. **Reversível** — pausa qualquer routine no dashboard
4. **Anthropic-native** — sem terceiros, MCPs já configuradas funcionam
5. **Escalável** — 15 runs/dia chega pra muito; depois migra se precisar
6. **Resolve problema real do CEO** — sistema G7 deixa de depender de laptop ligado

---

## Próxima ação

- ✅ CEO autorizou e configurou 3 routines (2026-05-17 noite)
- [ ] Validar output da 1ª execução de `pillars-review-semanal` (18/05 amanhã)
- [ ] Validar output da 1ª execução de `estudo-g7-semanal` (19/05)
- [ ] Validar output da 1ª execução de `audit-mensal` (01/06)
- [ ] Ajustar prompts se preciso após 1ª rodada
- [ ] Documentar em `decisions/015-execucao.md` o que funcionou

---

## Relacionados

- `pillars/SCORES.md` — revisão semanal automática Beneficiária
- `studies/_index.md` — leituras G7 automatizadas
- `audits/_rolling.md` — audit mensal automatizado
- `.claude/agents/ricardo-devops.md` — owner do setup
- ADR-008 (G7) — time virtual que ganha "vida própria"

---

## Lições aprendidas (pré-decisão)

1. **Pesquisar antes de propor pagar** — eu ia sugerir VPS + API extra, mas Routines incluso no Max resolveu. **R$ 0 adicional em vez de R$ 30-100/mês economizados/ano = R$ 360-1200.**
2. **R$ 588/mês Max é PECHINCHA** quando você usa pesado — equivalente API seria R$ 1.500-3.000/mês.
3. **Anthropic move rápido** — Routines saiu 1 mês atrás, eu nem tinha registrado. Manter `studies/anthropic-changelog.md` mensal pra não perder features.
