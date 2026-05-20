# ADR-020 — Discord webhooks como canal de alerta da operação noturna

**Status**: Aceito — em produção desde 20/05/2026
**Data**: 2026-05-20
**Autor**: CEO Gabriel Vaz (decisão operacional, formalizada por Lia)
**Owner execução**: Claude (monitora) + CEO (recebe alertas)
**Custo de reversão**: BAIXO — trocar canal exige apenas atualizar as env vars + reconfigurar webhook destino

---

## Contexto

Modo hardwork ativado em 19/05/2026: Claude opera com 2 agents G7 em paralelo durante a janela 22h-7h BRT, segunda a sexta, até 27/06/2026. Com o CEO dormindo, era necessário um canal de alerta que atendesse a dois critérios opostos:

1. **Alta prioridade**: acordar o CEO imediatamente se algo crítico acontecer em prod (build quebrado, RLS violada, pagamento com erro)
2. **Baixa intrusão**: notificar silenciosamente o resultado das tarefas da noite para leitura matinal, sem interromper o sono

Nenhum canal único resolve os dois critérios com configuração diferenciada por mensagem, exceto ferramentas com suporte a canais distintos.

A decisão foi tomada como parte do Bloco 1 (decisões 1-5 da operação noturna, respondidas 20/05), formalizada no arquivo `strategy/decisoes-ceo-pendentes-2026-05-20.md` — Decisão 2.

---

## Decisão

Usar **Discord webhooks** com servidor "Hayzer Ops" criado pelo CEO em 20/05/2026, com dois canais de comportamento distinto:

| Canal | Uso | Notificação mobile |
|---|---|---|
| `#critico` | Incidentes que afetam prod ou o launch 27/06 | Som ALTO — acorda CEO |
| `#digest` | Resumo matinal da noite: commits, docs, agents concluidos | Silenciosa — lê de manha |

Critério estrito de `#critico` (apenas estes 6 casos):
1. Build prod (`hayzer.com.br`) retornou 500 nas ultimas 3 verificacoes
2. Migration aplicada em prod sem autorizacao CEO
3. Webhook signature invalidando pagamentos
4. RLS quebrada (acesso cross-tenant detectado)
5. Agent travado mais de 2h sem progresso, bloqueando o outro
6. Consumo Anthropic ultrapassou 80% da janela semanal Max

Tudo fora desses 6 casos vai pro `#digest`.

**Env vars em produção** (setadas 20/05, testadas com status 204 em ambos os webhooks):
- `DISCORD_WEBHOOK_CRITICO`
- `DISCORD_WEBHOOK_DIGEST`

---

## Alternativas consideradas

| Alternativa | Razão para rejeitar |
|---|---|
| **Gmail** | Latência alta: notificação mobile pode demorar minutos. Mistura com outros emails. Sem diferenciação urgente vs digest possível nativamente. |
| **SMS Twilio** | Custo R$ 0,15 por SMS enviado para BR + setup de conta Twilio (~30min). Para uma operação de 5 noites/semana com múltiplos eventos, custo cresce rapidamente. Conta nova a gerenciar. |
| **Telegram bot** | Gratuito, latência baixa, API simples. Porém exige criar bot (10min de setup), conta adicional, e o CEO já usa Discord. Duplicar apps sem ganho real. |
| **Slack** | CEO não usa Slack. Seria novo app só pra este fim. |

Discord foi escolhido por combinar: gratuito, push mobile nativo no app que o CEO ja usa, latência abaixo de 1 segundo, threading por canal, e configuração por webhook (sem bot, sem conta extra).

---

## Consequências

### Positivas
- Custo R$ 0/mês (Discord gratuito, webhooks inclusos)
- Latência menor que 1 segundo por mensagem
- Push mobile nativo via app Discord: `#critico` com som alto acorda CEO em qualquer horário
- `#digest` silencioso preserva o sono sem perder o log da noite
- Configuração cirúrgica: 2 env vars, sem SDK adicional, sem conta nova
- Auditável: historico de mensagens fica no Discord indefinidamente

### Negativas e riscos
- **Dependência de app ativo**: se o CEO desinstalar ou silenciar o Discord globalmente, os alertas criticos deixam de funcionar como esperado. Mitigação: CEO configurou notificação do canal `#critico` com som override no app.
- **Discord pode ter downtime**: improvável, mas se Discord cair, os alertas críticos não chegam. Mitigação: para incidentes de prod, o `production-smoke-test` routine (Grupo D, `automation/CLAUDE.md`) também gera Issue no GitHub como canal secundário.
- **Sem autenticação no webhook**: quem tiver a URL do webhook pode postar no canal. Mitigação: URL fica apenas em env vars, nunca em arquivo commitado.

### Reversibilidade

Alta. Trocar o canal de alerta exige apenas:
1. Criar novo webhook no canal destino (Discord, Slack, Telegram, ou outro)
2. Atualizar `DISCORD_WEBHOOK_CRITICO` e `DISCORD_WEBHOOK_DIGEST` nas env vars
3. Zero mudança de código se a interface de envio for abstraída

---

## Quando revisitar

- **Se Discord mudar política de webhooks gratuitos** (histórico: nunca restringiu, mas monitorar)
- **Se CEO trocar Discord por outra ferramenta** de comunicação principal
- **Se o numero de eventos nocturnos crescer** a ponto de o `#digest` ficar difícil de ler (considerar digest estruturado em arquivo ao invés de mensagem)
- **Revisão programada**: após 2 semanas de operação noturna (início 22/05), avaliar se critério dos 6 casos de `#critico` está calibrado ou gera ruído/silêncio excessivo

---

## Arquivos relacionados

- `automation/operacao-noturna-config.md` — configuração completa da operação noturna, incluindo regras de uso dos canais
- `.env.example` — `DISCORD_WEBHOOK_CRITICO` e `DISCORD_WEBHOOK_DIGEST` devem constar aqui (sem valores)
- `automation/CLAUDE.md` — status das routines, incluindo `production-smoke-test` (canal secundário de alerta)
- `decisions/015-automacao-24-7.md` — ADR que criou as Claude Code Routines (contexto de automação)
- `decisions/022-launch-acelerado-04-07-para-27-06.md` — launch 27/06 é o prazo que torna a operação noturna urgente
