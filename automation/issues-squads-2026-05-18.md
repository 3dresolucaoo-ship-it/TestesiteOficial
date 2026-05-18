# Issues pra criar no GitHub — 4 decisões Helena propagadas pros squads

> **Origem**: Helena 18/05 (`strategy/decisoes-resolvidas-2026-05-18.md`)
> **Status**: CEO aprovou propagar (18/05 madrugada).
> **Como criar**: ou (a) CEO cria via UI no github.com/3dresolucaoo-ship-it/TestesiteOficial/issues, ou (b) eu crio quando gh CLI estiver instalado (`winget install GitHub.cli` em PowerShell).

---

## Issue 1 — Calculadora 3D Pro paga R$ 37 (Semana 3)

**Title**: `feat(calculadora-pro): paywall R$ 37 + PDF export + histórico + multi-impressora (Semana 3)`

**Assignees**: Carla (copy), Paulo (Stripe Payment Link), Felipe (paywall + lógica)

**Labels**: `feature`, `monetization`, `semana-3`, `decision-helena`

**Body**:
```markdown
## Decisão Helena 18/05
Calculadora 3D Pro paga entra na Semana 3 (25-31/05) — substitui o "lead magnet Planilha 7 métricas" como gatilho de captura no funil. Razão: validar willingness-to-pay com público que JÁ usa a free, com 6 semanas pra ajustar antes do launch 04/07.

## Escopo
- **Preço**: R$ 37 (preço-âncora meio do range R$ 27-47)
- **Diferenciais Pro vs Free**:
  - [ ] Export PDF (planilha pronta pra cliente)
  - [ ] Histórico de cálculos (localStorage, sem backend novo)
  - [ ] Multi-impressora (cadastra 3-5 impressoras + alterna)
- **Sem backend novo**: Stripe Payment Link + check via cookie/localStorage. Não cria conta, não cria order.

## Cronograma
| Quando | Quem | O quê |
|---|---|---|
| Qua 27/05 | Carla | Copy paywall + página de venda |
| Qua 27/05 | Paulo | Stripe Payment Link R$ 37 ativo |
| Qui-Sex 28-29/05 | Felipe | Lógica check + UI bloqueada (max 6h) |
| Sex 29/05 noite | Felipe | Deploy preview |
| Sáb 30/05 | Sofia + Marcos | Divulgar grupo Beta WhatsApp |

## Risco
Calculadora free pode ter volume baixo (<30 usos/dia). Mitigação: instrumentar evento `viu_paywall_calc_pro` + `clicou_comprar_calc_pro` separados de `comprou` pra medir intent mesmo com N baixo.

## Doc completo
- `strategy/decisoes-resolvidas-2026-05-18.md` § Decisão 1
- `strategy/semana-3-plano-2026-05-25.md` § Bloco E
```

---

## Issue 2 — Ritmo de revisão PRs Routines (30min/semana + gatilho redução automática)

**Title**: `process(routines): ritmo 30min/semana revisão + gatilho redução automática se 2 sem sem mudança`

**Assignees**: Helena (monitora gatilho), CEO (revisor)

**Labels**: `process`, `routines`, `decision-helena`

**Body**:
```markdown
## Decisão Helena 18/05
Aceito ritmo 30min/semana revisando PRs de Routine (pillars-review-semanal seg, estudo-g7-semanal ter, audit-mensal dia 1) — ROI 3:1 sobre fazer manual (3.5h/mês → 2h revisão = ganho 1.5h/mês + zero esquecimento).

## Gatilho de redução automática
- Se 2 semanas seguidas o PR `pillars-review-semanal` sair sem mudanças relevantes → reduzir slot CEO de 15min pra 5min.
- Mesmo gatilho pra `estudo-g7-semanal` (de 25min pra 10min).
- Helena monitora e avisa CEO.

## Bloqueios na agenda CEO
- Seg 9h-9h15: revisar PR `pillars-review-semanal`
- Ter 9h-9h25: revisar PR `estudo-g7-semanal` (spot-check 5/60 princípios)
- Dia 1/mês 9h-9h15: revisar Issue `audit-mensal`

## Doc completo
`strategy/decisoes-resolvidas-2026-05-18.md` § Decisão 2
```

---

## Issue 3 — Ordem features 1-2-3 + troca de escopo Feature 1 (Calc Pro vira upsell)

**Title**: `roadmap: confirma ordem Feature 1 (Analytics+Retenção) → 2 (Wave 1 Customers light) → 3 (PWA/Mobile)`

**Assignees**: Marcos (lidera Feature 1 + analytics + hero copy A/B), Sofia (email sequence), Felipe (instrumentação), Bruna (Wave 1 services)

**Labels**: `roadmap`, `features`, `decision-helena`

**Body**:
```markdown
## Decisão Helena 18/05
- **Feature 1** (Semana 3-4): Analytics + Retenção. Pilares Conversão 5.0 e Retenção 5.0 são os ÚNICOS abaixo de 6 — atacar primeiro é onde investimento rende mais.
- **Feature 2** (Semana 4-5): Wave 1 Customers light (lista + perfil + métrica "sumiu há X dias") + admin lite (export CSV waitlist).
- **Feature 3** (Semana 6): PWA polish + Mobile audit + onboarding 3 passos.

## Troca de escopo Feature 1
**Substituir** "lead magnet Planilha 7 métricas" **por** "upsell Calculadora 3D Pro embedded no funil" (decisão Issue #1).

## Quem lidera o quê
- Marcos: analytics PostHog + hero copy A/B (3 variantes com hipótese clara antes do dado chegar)
- Sofia: sequência email D+1 / D+3 / D+7 (anti-IA, tom maker BR)
- Felipe: instrumentação técnica
- Bruna: customers service Semana 4

## Crítica (Helena assume)
Analytics + email sequence resolve Conversão e Retenção SE problema raiz não é proposta de valor. Marcos precisa revisar hero copy + 3 variantes A/B em paralelo — não só instrumentar.

## Doc completo
`strategy/decisoes-resolvidas-2026-05-18.md` § Decisão 3
```

---

## Issue 4 — Deadline PR Routines: 48h ou fecha (com escape `/extend`)

**Title**: `automation(pr-review-bot): regra deadline 48h + label auto-close + comando /extend`

**Assignees**: Ricardo (implementa no bot via prompt — já feito 18/05 madrugada ✅), CEO (testa fluxo)

**Labels**: `automation`, `policy`, `decision-helena`

**Body**:
```markdown
## Decisão Helena 18/05
PR de Routine aberto >48h sem revisão/merge → bot adiciona label `auto-close-em-24h` + comenta menção @Gabriel pedindo `/extend` ou fechará em 24h.
PR aberto >72h sem `/extend` → bot fecha com mensagem padrão.
Comando `/extend` em comentário estende prazo +48h, máximo 1× por PR.

## Status
- ✅ Implementado na pr-review-bot (trig_01HQv1i6JB221jTSH88N33Dn, ativa 18/05 madrugada)
- ⏳ Aguarda primeira execução real (hoje 8:05 BRT ou 16:05 BRT) pra validar fluxo

## Risco aceito
48h pode disparar fechamento se CEO tiver sexta corrida. Mitigação: Routine roda toda semana de novo, custo de perder 1 ciclo é baixo (atraso 7 dias na propagação de princípios pra memória dos agentes).

## Escape hatch
Helena registrou: CEO pode legitimamente escolher 96h por 30 dias até validar primeiro Lifetime vendido. Se preferir 96h, mudar no spec do bot.

## Doc completo
`strategy/decisoes-resolvidas-2026-05-18.md` § Decisão 4
`automation/pr-review-bot-spec.md`
```

---

## Como criar essas 4 issues

**Opção A — CEO via UI** (recomendado se gh CLI não instalado):
1. Abrir https://github.com/3dresolucaoo-ship-it/TestesiteOficial/issues/new
2. Copiar Title + Body de cada issue acima
3. Adicionar labels manualmente
4. Mencionar reviewers (@3dresolucaoo-ship-it pra todas)

**Opção B — Eu via gh CLI** (precisa instalar primeiro):
```powershell
# PowerShell admin:
winget install GitHub.cli
# depois:
gh auth login --hostname github.com --web
# depois eu (Claude) executo:
gh issue create --title "..." --body-file ./issue1.md --label "feature,semana-3"
```

**Opção C — API direta via curl** (precisa token GitHub):
```bash
curl -X POST https://api.github.com/repos/3dresolucaoo-ship-it/TestesiteOficial/issues \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d '{"title":"...","body":"...","labels":["..."]}'
```

CEO escolhe qual prefere.
