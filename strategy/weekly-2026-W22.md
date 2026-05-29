# Status Semanal Hayzer — 2026-W22
> **Sexta 29/05/2026 17h BRT** — 36 dias pro launch público (04/07) · 13 dias pro soft launch (11/06)
> Autora: Helena (Diretora de Estratégia G7) · Revisão CEO: segunda 02/06 09h

---

## ALERTA IMEDIATO

**O produto parou.** Semana 22 entregou zero código de feature. As automações noturnas estão rodando (PR Review Bot, smoke tests, digests), mas são ruído sem código por trás delas. Três alertas amarelos consecutivos nos smoke tests (27, 28 e 29/05) indicam degradação sem diagnóstico. Monitoramento de produção está cego há 7 dias por `VERCEL_API_TOKEN` expirado.

Soft launch é em 13 dias. Semana 3 não entregou nenhum dos 7 blocos planejados.

---

## 1. Progresso da semana

### Commits na main (22-29/05) — 1 commit total

| Hash | Data | Tipo | Descrição |
|------|------|------|-----------|
| 4de0641 | 23/05 | Infra/monitoramento | monitoring: error-scan 2026-05-24 |

**Classificação:** features novas: 0 | bugs corrigidos: 0 | refactor: 0 | docs/decisões: 0 | infra/monitoramento: 1

### Semana 3 planejada vs entregue

| Bloco | Responsável | Planejado | Entregue |
|-------|-------------|-----------|----------|
| A — Dashboard V4 React em prod | Felipe + Bruna | polish + empty states | 0% |
| B — Analytics funil (Vercel + PostHog) | Marcos + Felipe | instrumentação completa | 0% (PostHog ativo desde 20/05, Vercel Analytics: não confirmado) |
| C — Lighthouse + Axe audit + fix top 3 | Júlia + Felipe | audit + fix críticos | 0% |
| D — Email transacional D+1/D+3/D+7 | Sofia + Carla | 3 templates + wire-up | 0% |
| E — MP OAuth E2E | Paulo | se destravar até 25/05 | 0% (ainda bloqueado) |
| F — LGPD + Tier 2 Segurança | Otávio + Bruna | DELETE /api/me + BotID | 0% |
| G — Calculadora 3D Pro paga R$ 37 | Carla + Paulo + Felipe | paywall + Stripe Payment Link | 0% |

**Rodmap Semana 3: 0/7 blocos entregues (0%).**

---

## 2. Blockers identificados

### BLOCKER 1 — CRÍTICO: VERCEL_API_TOKEN expirado (7 dias)
**Issue #23** aberta em 22/05. Monitoramento de erros de produção não executa desde então. Erros novos em prod passam despercebidos. Próximo smoke test limpo requer token renovado.

**Impacto no launch:** qualquer bug surgido entre 22/05 e hoje em prod é invisível. Risco de descoberta tardia pré-soft launch.

**Ação:** CEO acessa vercel.com/account/tokens, gera novo token Full Account, adiciona como secret GitHub `VERCEL_API_TOKEN`. Custo: 2 minutos.

### BLOCKER 2 — CRÍTICO: Dashboard V4 React não entregue
Felipe não submeteu conversão React do V4.8 (estava no gantt de 20-24/05). Sem isso, blocos A, C e parte de B e D da Semana 3 ficam dependentes. O mockup HTML aprovado (ADR-014) existe, código React não.

**Impacto no launch:** toda a experiência interna do produto que o CEO vai mostrar no soft launch depende disso.

### BLOCKER 3 — ALTO: Smoke tests ALERTA AMARELO 3 dias consecutivos
PRs #62 (27/05), #68 (28/05) e #74 (29/05) todos com "ALERTA AMARELO". Sem `VERCEL_API_TOKEN`, o diagnóstico exato não foi feito. Degradação sem causa identificada.

**Impacto no launch:** se o yellow se tornar red antes do soft launch 11/06, a operação para.

### BLOCKER 4 — ALTO: Waitlist crescimento -50%
Dados do digest 27/05 (PR #64): 3 leads totais acumulados, 0 leads últimas 24h, crescimento 7d vs 7d anterior: -50%. Post LinkedIn da Semana 1 nunca foi ao ar. Grupo WhatsApp Beta: texto de Marcos pronto, CEO não postou.

**Impacto no launch:** soft launch sem fila de espera = produto sem usuários reais pra validar. Meta mínima (50 makers) impossível com ritmo atual.

### BLOCKER 5 — MÉDIO: MP OAuth bloqueado (22 dias)
Bug no painel MP desde 07/05. Stripe Connect cobre, mas a ausência de MP fecha um canal de pagamento que o maker BR usa mais. Sem estimativa de resolução do lado do MP.

**Impacto no launch:** aceitável no soft launch (Stripe cobre), mas precisa de status no início de junho.

### BLOCKER 6 — MÉDIO: TBT 3.6s em prod (9 dias sem fix)
Identificado na sessão de 20/05. Hero motion + WaitlistForm Zod no first paint. Nenhum commit de correção desde então.

**Impacto no launch:** Lighthouse score travado. Pilar Performance não sai de 7.0.

---

## 3. Plano próxima semana (01-06/06, Semana 4)

Semana 4 original do ROADMAP previa `/customers`. Dado o atraso, Semana 4 deve absorver o que Semana 3 não entregou. Ordem de prioridade:

1. **CEO — renova VERCEL_API_TOKEN** (segunda 01/06, 2min) — desbloqueia monitoring
2. **Felipe — Dashboard V4 React em prod** (segunda-terça 01-02/06) — entrega atrasada de Semana 2. Sem isso, soft launch não tem produto para mostrar
3. **Carla + Paulo — Calculadora Pro paywall** (terça-quarta 02-03/06) — primeira monetização real antes do launch. Stripe Payment Link R$ 37 + copy paywall
4. **Sofia + Carla — Email D+1/D+3/D+7** (quarta-quinta 03-04/06) — 3 templates + wire-up Resend. Pilar Retenção 5.0 precisa de movimento
5. **INPI reverificação pePI** (até 06/06) — external-researcher roda busca profunda (ver `decisions/pending-inpi-busca-profunda-pre-pagamento.md`). Deadline GRU 13/06 = 7 dias após a semana

**Fora da fila:** Clientes Wave 1, MP OAuth, Sentry, Lighthouse audit. Esses entram só depois de A-E acima fechados.

---

## 4. Decisões pendentes pro CEO

| # | Decisão | Origem | Deadline | Status |
|---|---------|--------|----------|--------|
| D-01 | **INPI PIX R$ 880** (classes 35+42) | `decisions/pending-inpi-busca-profunda-pre-pagamento.md` | 13/06/2026 | Reverificação pePI pendente antes do pagamento |
| D-02 | **CNPJ MEI→ME** | CLAUDE.md | Antes 1ª venda paga | Não iniciado |
| D-03 | **Cobrança Hayzer Beauty** (R$ 197 único vs tiers vs combo gestora-mãe) | `strategy/decisoes-ceo-pendentes-2026-05-20.md` — Decisão 7 | 28/06 (briefing G7) | Pendente desde 20/05 |
| D-04 | **Heshiley conversa** (3 perguntas: beta tester, co-host, 5 gestoras) | `strategy/decisoes-ceo-pendentes-2026-05-20.md` | 26/05 | VENCIDO — ação necessária |
| D-05 | **Soft launch 11/06 realista?** | CLAUDE.md | Esta semana | Dado o atraso da Semana 3, CEO precisa avaliar se a data se sustenta ou muda pra 18/06 |

---

## 5. Bugs críticos sem fechamento em 5+ dias

**Todos os itens abaixo estão em aberto no ROADMAP e sem commit de correção nos últimos 7+ dias:**

| Bug | Aberto em | Dias sem fix | Impacto |
|-----|-----------|-------------|---------|
| **TBT 3.6s** (Hero motion + WaitlistForm) | 20/05 | 9 dias | Lighthouse travado, Performance 7.0 |
| **MP OAuth painel quebrado** | 07/05 | 22 dias | Canal pagamento fechado |
| **VERCEL_API_TOKEN expirado** | 22/05 | 7 dias | Monitoring cego em prod |
| **Smoke tests ALERTA AMARELO** | 27/05 | 3 dias (3 consecutivos) | Degradação sem diagnóstico |

**TBT e VERCEL_API_TOKEN exigem ação antes de segunda-feira.** MP OAuth aguarda resolução externa (MP). Smoke test: diagnóstico depende do token renovado.

---

## 6. Estado dos PRs abertos

### Substantivos (não são logs de automação)
- **#64 DRAFT** — digest waitlist 27/05 (3 leads, crescimento -50%) — aguarda CEO revisar
- **#75 DRAFT** — digest waitlist 29/05 — aguarda CEO revisar

### Dependabot (5 PRs READY, automáticos)
- **#47-51** — bumps de dependências (framer-motion, @types/node, @hookform/resolvers, posthog-js, patches group)
- Todos elegíveis pra merge se CI verde

### Logs de automação (descartáveis, podem ser fechados)
- #63, #65, #70, #71, #76, #77 — logs do PR Review Bot
- #60, #66, #72 — pesquisa diária de concorrência
- #61, #67, #73 — error-scan diário
- #62, #68, #74 — smoke tests ALERTA AMARELO

**Observação:** o GitHub acumula 20+ PRs de automação esta semana. Isso é ruído que dilui o sinal de PRs reais. Considerar fechar os logs de automação sem código por decisão do CEO (ou configurar o bot pra não abrir PR pra logs operacionais).

---

## 7. Nota de Helena

Semana 22 foi a primeira semana sem entrega de código desde o início do projeto. Não por falta de automação, que está rodando, mas por ausência do código principal que as automações deveriam monitorar. O PR Review Bot fechou 13 PRs por timeout esta semana. O digest waitlist aponta 3 leads com crescimento negativo. O smoke test acende amarelo há 3 dias. Tudo isso aponta pro mesmo vácuo: o produto parou enquanto a infraestrutura ao redor dele continuou funcionando.

Com 13 dias pro soft launch, o caminho crítico é simples: VERCEL_API_TOKEN (2 minutos, CEO), Dashboard V4 React (Felipe, segunda-terça), e uma decisão honesta sobre se 11/06 é viável ou se precisa de 1 semana extra de buffer. O atraso não é catástrofe, mas ignorar ele é. Se a semana que vem entrar com o mesmo ritmo de zero commits de produto, o soft launch precisa ser revisto para 18/06 e o launch público para 11/07. Vale decidir agora, quando ainda há margem, do que ajustar no último momento.

A recomendação de Helena: segunda 9h, CEO e Felipe alinham entrega V4 React até quarta. Se não for possível até quarta, soft launch muda de data na mesma reunião.

---

*Gerado em: 2026-05-29 | Próxima revisão: segunda 02/06 09h (CEO + Helena)*
*Repositório: 3dresolucaoo-ship-it/TestesiteOficial | Branch: routine/status-weekly-2026-W22*
