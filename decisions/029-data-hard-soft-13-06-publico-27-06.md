# ADR 029 — Data hard: soft launch 13/06 + launch público 27/06

> Status: ACCEPTED
> Data: 2026-05-29 (noite)
> Autor: CEO Gabriel · Crítico: Claude (Opus 4.7)
> Substitui: ADR 028 (PROPOSED, não decidida)

---

## Contexto

Em 29/05/2026, sessão de ~10h de trabalho noturno com squad G7 paralelo. Estado entrando:
- 9 dias parado no Hayzer (CEO focou Heshiley + cliente Edu)
- Confissão CEO em 20/05: produto 60-65% pra usuário real sem bug grave
- Data original soft launch 11/06 (13 dias) — inviável

Durante a sessão:
1. Pedido inicial: "plano modo crítico, por etapas, melhor forma".
2. Cravei plano com 6 etapas datadas (cenário A1 manter 11/06).
3. CEO contraproposta: "esquece data, foca qualidade".
4. Reescrevi plano em 6 blocos sem data dura.
5. Sessão executou: Bloco 1 a 90% commitado (Sentry, env, docs) + Bloco 2 a 100% commitado (onboarding wizard + 7 empty states + tu/voce).
6. CEO modo crítico final: **"sobre a data, precisa realmente ter data — seria bom para prazos, pra não ser infinito."**

## Decisão

**Manter filosofia de 6 blocos com critério de saída + adicionar data hard de fim:**

- **Soft launch interno (Bloco 4 abre): sábado 13/06/2026**
  - 15 dias = ~30 noites úteis a partir do 29/05
  - Convite a 5-10 makers do grupo WhatsApp Hayzer Beta
  - Bloco 1, 2, 3 fechados antes
- **Launch público (Bloco 6 abre): sábado 27/06/2026**
  - 14 dias entre soft e público pra Bloco 5 (polimento pós-feedback)
  - Mesma data do alvo original — agora viável pelos 10+ commits feitos em 29/05

## Por que essa decisão (modo crítico cravado)

### Por que data SIM (não "sem data")
1. **9 dias parado anteriores prova padrão**: sem prazo concreto, gravidade dos outros projetos atrai energia que devia ir pro motor #1. Próximos 30 dias podem virar 60 sem CEO perceber.
2. **Soft launch precisa de convite com data**: você não convida amigo pra "quando ficar pronto" — convida pra "dia 13/06 vou abrir, conta com vocês". Sem data, zero RSVP, zero feedback.
3. **Time G7 produz mais com prazo claro**: sessão de hoje proveu — 6 agents paralelos entregaram Bloco 2 em ~9 minutos porque cada um tinha escopo claro + critério de saída.
4. **CEO tem tendência declarada a pulverização** (perfil global lista isso): data hard é antídoto.

### Por que essas datas específicas (não outras)
1. **13/06 sábado** = pico de tráfego maker (eles olham conteúdo no fim de semana), menos ruído pra começar beta vs dia útil.
2. **27/06 sábado** = mantém alvo original, beneficia dos 10+ commits feitos em 29/05.
3. **14 dias entre soft e público** = espaço pra Bloco 5 sem aperto.
4. **30 noites úteis até soft** com ~6-8 noites de trabalho real = folga de ~22 noites pra imprevisto. Isso é folga REAL, não folga 2 noites como cenário A1 original que falhei.

### Trade-offs aceitos
- **Heshiley + Edu sentem o ritmo**: CEO precisa conversar esposa 30/05 explicando 29 dias de foco Hayzer + redução proporcional ajuda Ybera. Edu = 1h/semana fixa de call.
- **Bug grave próximo ao 13/06**: contingência = soft launch atrasa pra 18/06 sem cerimônia (renegociar explicitamente, não silenciosamente).
- **ADR 028 (Helena 21/05 "cortar escopo manter 27/06")**: superseded por esta. ADR 028 propunha cortar `/customers` + emails + V4 dos 8 módulos restantes. Decisão atual: manter escopo do plano focar-qualidade (Bloco 5 inclui email + V4 restantes + landing comparativa), só não amarrar todos eles ao 27/06 — o que ficar pronto entra, o que não ficar vai pós-launch.

## Janelas de tempo por bloco

| Bloco | Conteúdo | Janela | Fim de bloco |
|---|---|---|---|
| 1 Fundação | Env + Sentry + rebase + webhook + observabilidade | 29/05 → 03/06 | quarta 03/06 |
| 2 FTE | Onboarding wizard + 7 empty states + tu/voce | ✅ FECHADO 29/05 | quinta 30/05 (revisão visual) |
| 3 Qualidade real | QA mobile + Lighthouse + golden path | 30/05 → 10/06 | quarta 10/06 |
| Soft launch interno | Post grupo Beta + 5-10 makers | **🎯 13/06 sábado** | 13/06 → 17/06 |
| 4 Soft launch validação | Coleta feedback + Sentry watch | 13/06 → 17/06 | quarta 18/06 |
| 5 Polimento pós-feedback | Toast + V4 restantes + landing + email | 18/06 → 25/06 | quinta 25/06 |
| 6 Launch público | Smoke test final + lançamento | **🎯 27/06 sábado** | 27/06 |

## Critérios de Go/No-Go

### 13/06 manhã (Go/No-Go soft launch)
- [ ] Bloco 1 fechado (env + Sentry + observabilidade ativa em prod)
- [ ] Bloco 2 mergeado em main (wizard funcional + 7 empty states + tu/voce)
- [ ] Bloco 3 fechado (zero P0 mobile + Lighthouse > 75 + golden path passa)
- [ ] Migration onboarding aplicada em prod
- [ ] Stripe Connect testado em sandbox

**Se qualquer NO:** soft launch empurra pra quarta 18/06 (não negociar silenciosamente). Público mantém 27/06 (folga reduz).

### 26/06 23h (Go/No-Go público)
- [ ] Golden path #2 fim a fim passa em prod (signup → wizard → projeto → lead → pedido pago Stripe → produção → finance → email)
- [ ] Sentry sem P0 últimas 72h
- [ ] 5+ makers do soft launch sem bug grave aberto
- [ ] CEO se sente pronto

**Se qualquer NO:** empurra pra segunda 30/06 (sem cerimônia, comunicar aos 5-10 makers).

## Consequências

### Positivas
- CEO tem foco claro pelos próximos 29 dias
- Squad G7 tem escopo definido por bloco (sem 4 frentes simultâneas)
- 5-10 makers do beta sabem data exata pra reservar tempo
- Heshiley/Edu sabem que recuperam atenção do CEO em ~30 dias

### Negativas
- Heshiley sente redução de ajuda na operação Ybera (conversa franca obrigatória)
- Edu recebe entregas mínimas, sem polish extra (combinar 1h/semana fixa)
- Risco médio de bug grave no soft launch que force empurrar (mitigação: contingência 18/06)

## Decisões relacionadas

- ADR 028 (PROPOSED 21/05): "cortar escopo p/ manter 27/06" — **SUPERSEDED por esta**
- ADR 017: Sentry aplicar 17/06 — **ANTECIPADO** pra Bloco 1 (29/05-03/06), config já commitada
- ADR 024: calc grátis magnet eterno — **MANTIDA**
- ADR 009: naming Hayzer — **MANTIDA**
