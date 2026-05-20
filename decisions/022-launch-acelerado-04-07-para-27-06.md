# ADR-022 — Launch público acelerado: de 04/07 para 27/06/2026

**Status**: Aceito — em execução desde 19/05/2026
**Data**: 2026-05-19
**Autor**: CEO Gabriel Vaz (decisão de ativação do modo hardwork)
**Owner execução**: Claude + time G7 (13 agents, 3 fases/dia)
**Custo de reversão**: BAIXO até 11/06 (soft launch); ALTO após soft launch (comprometimento público com beta testadores)

---

## Contexto

O launch público do Hayzer estava marcado para **04/07/2026 (sexta-feira)**, data definida no ROADMAP original. Em 19/05/2026, o CEO ativou o modo hardwork — operação intensificada com 13 agents G7 em 3 fases/dia (manhã/tarde/noite), incluindo operação noturna 22h-7h BRT de segunda a sexta.

Dois fatores tornaram a aceleração de 1 semana possível e desejável:

**Fator 1 — Capacidade operacional**: com 13 agents G7 em paralelo e operação noturna, a velocidade de entrega aumentou substancialmente. O ROADMAP original foi desenhado para operação convencional (CEO + Claude em sessões diurnas). A capacidade extra de ~40-50h de trabalho de agents/semana reduz o buffer necessário.

**Fator 2 — Brasil 3D Fest**: evento presencial em São Paulo, **19-21/06/2026**, 8 dias antes do novo launch. O público do evento é exatamente a persona Rafael (makers 3D, lojistas de impressão, entusiastas). Uma landing ativa e waitlist em movimento na semana do evento cria oportunidade orgânica de divulgação presencial sem custo adicional.

Manter 04/07 significaria perder essa janela com o público mais qualificado do calendário maker BR de 2026.

---

## Decisão

**Launch público acelerado para 27/06/2026 (sexta-feira)**, com:

- **Soft launch**: 11-13/06/2026 com 20-30 beta testadores selecionados
- **Brasil 3D Fest**: 19-21/06/2026 — CEO presente, landing ativa, waitlist como CTA
- **Launch público**: 27/06/2026

Cláusula de escape: se o launch 27/06 resultar em bug crítico não resolvido em 24h, o briefing G7 Beauty (originalmente 28/06) vai automaticamente para 05/07/2026 e a Onda 2 Beauty não é iniciada até estabilização do Maker.

O modo hardwork (19/05-27/06) é o mecanismo operacional que viabiliza a aceleração. Configuração detalhada em `automation/operacao-noturna-config.md`.

---

## Alternativas consideradas

| Alternativa | Razão para rejeitar |
|---|---|
| **Manter 04/07** | Perde Brasil 3D Fest (19-21/06) como janela de divulgação com público qualificado. Com capacidade operacional aumentada (hardwork + operação noturna), a folga adicional de 1 semana não gera valor proporcional. Manteria momentum mais baixo no período pré-launch. |
| **Adiantar para 11/07** | Mais folga ainda, mas perde 2 semanas de momentum pós-Brasil 3D Fest. Janela de energia pós-evento seria desperdiçada. Descartado por não adicionar capacidade real, apenas atrasar. |
| **Adiantar para 20/06 (durante Brasil 3D Fest)** | Risco alto: launch durante evento presencial = CEO dividido entre networking e suporte a incidentes. Soft launch ainda em curso. Descartado: acumular dois eventos críticos na mesma semana é anti-padrão de launch. |

---

## Consequências

### Positivas
- 7 dias a mais de operação hardwork convertidos em velocidade de entrega, não em folga
- Brasil 3D Fest (19-21/06) como amplificador orgânico: CEO pode apresentar Hayzer pessoalmente ao público mais qualificado do ano
- Soft launch (11-13/06) com 20-30 beta testadores tem 2 semanas inteiras para absorver feedback antes do launch público
- Deadline antecipado aumenta foco: qualquer feature fora do escopo MVP é cortada sem debate
- 27/06 (sexta): timing de launch favorável (final de semana para repercutir nas comunidades maker)

### Negativas e riscos
- **Hard cap de tempo**: 5 semanas de trabalho intenso (19/05-27/06) sem buffer. Se uma feature crítica travar por mais de 3-4 dias, impacta o launch diretamente. Mitigação: ROADMAP define MVP estrito; features fora do MVP são arquivadas, não renegociadas.
- **Fadiga operacional**: CEO e agents operam em intensidade máxima por 5 semanas consecutivas. Risco de qualidade cair na semana 4-5. Mitigação: operação noturna usa agents (não CEO); CEO mantém fins de semana livres (operação noturna pausa sábado e domingo).
- **Soft launch comprimido**: com launch público em 27/06, o soft launch (11-13/06) tem apenas 2 semanas de buffer para corrigir bugs identificados pelos beta testadores. Mitigação: beta testadores selecionados são próximos do CEO (Héquison, Falconi) e têm perfil de early adopter tolerante a instabilidades.
- **Beauty fica em espera**: Onda 2 só começa após 27/06 (ou 05/07 pela cláusula de escape). Heshiley e potenciais gestoras aguardam. Sem impacto real (produto Beauty não prometido publicamente ainda).

### Reversibilidade

- **Antes de 11/06 (soft launch)**: reversão trivial. Basta comunicar internamente que volta para 04/07. Nenhum comprometimento público feito.
- **Após soft launch (11-13/06)**: reversão custosa. Beta testadores foram convidados e têm expectativa de launch em 27/06. Mudar a data exigiria comunicação explicando o adiamento.
- **Após Brasil 3D Fest (21/06)**: reversão de alto custo reputacional. CEO terá apresentado Hayzer presencialmente como "lançando semana que vem".

---

## Cronograma executivo

| Data | Marco |
|---|---|
| 19/05/2026 | Hardwork ativado, agents G7 em 3 fases/dia |
| 22/05/2026 | Operação noturna iniciada (Bruna + Lia, 22h-7h BRT) |
| 11-13/06/2026 | Soft launch: 20-30 beta testadores selecionados |
| 19-21/06/2026 | Brasil 3D Fest em São Paulo (CEO presente) |
| 27/06/2026 | **Launch público Hayzer Maker** |
| 28/06 ou 05/07/2026 | Briefing G7 Beauty (Onda 2 inicia) |

---

## Quando revisitar

- **Se bug crítico bloquear launch em 27/06**: cláusula de escape ativa automaticamente (Beauty para 05/07, launch Maker postergado para data a definir)
- **Se ritmo hardwork não sustentar**: CEO ou Claude pode desacelerar para 04/07 a qualquer momento antes de 11/06 sem custo
- **30 dias pós-launch (27/07/2026)**: revisão de métricas de launch (conversão waitlist, NPS beta, bugs criticos pós-prod) para calibrar ritmo da Onda 2

---

## Arquivos relacionados

- `automation/operacao-noturna-config.md` — configuração da operação noturna que viabiliza a aceleração
- `strategy/decisoes-ceo-pendentes-2026-05-20.md` — Decisão 8 (Beauty briefing 28/06 com cláusula escape 05/07)
- `ROADMAP.md` — marcos de launch e fases do projeto
- `decisions/020-discord-webhooks-operacao-noturna.md` — canal de alerta da operação noturna (suporte ao hardwork)
- `decisions/021-sub-marca-hayzer-beauty-mesmo-dominio.md` — Beauty (Onda 2) depende deste launch como pré-condição
- `decisions/015-automacao-24-7.md` — Claude Code Routines que sustentam a operação 24/7 durante hardwork
- `decisions/010-foco-vertical-maker-3d.md` — launch é Maker exclusivamente; Beauty não entra em 27/06
