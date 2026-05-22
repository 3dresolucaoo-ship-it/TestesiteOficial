# Status Semanal — 2026-W21
> Sexta 22/05/2026 · 17h BRT · **5 semanas pro launch público (27/06)**
> Autora: Helena (Diretora de Estratégia G7)
> Revisão CEO: segunda 25/05 9h

---

## Progresso da Semana (Semana 2 Gantt vs Entregue)

### Itens planejados no Gantt Semana 2 (20-25/05): ~6/15 entregues (40%)

| Item | Owner | Status |
|---|---|---|
| Migration webhook_events + RPC process_webhook_atomic | Bruna | [x] feito (17/05) |
| Handler webhooks chama RPC atomic | Bruna | [x] feito (17/05) |
| CSP report-only header | Otávio | [x] feito (17/05) |
| Dependabot ativo | Otávio | [x] feito (18/05) |
| Zod APIs autenticadas finance + payment-configs | Otávio | [x] feito (17/05) |
| Paleta HSL 8-10 shades globals.css | Diego | [x] feito (17/05) |
| **V4.3 React — Fase 1 componentes (DashboardLayout etc)** | **Felipe** | **[ ] NAO feito** |
| V4.3 React — Fase 1 charts/donut/gauge | Felipe | [ ] NAO feito |
| V4.3 React — mobile drawer + animacoes | Felipe | [ ] NAO feito |
| V4.3 React — Fase 2 conecta services reais | Felipe | [ ] NAO feito |
| Deploy preview V4 React (CEO valida com dados reais) | Felipe | [ ] NAO feito |
| a11y audit V4 React (Axe + screen reader) | Julia | [ ] NAO feito |
| Rate-limit Upstash rotas publicas | Otavio | [ ] parcial (DB-based feito 17/05, Upstash nao) |
| Revisao semanal pillars #1 (CEO + Helena 9h) | CEO+Helena | [ ] NAO feito |
| 1o post LinkedIn "Hayzer em breve" | Marcos | [ ] NAO feito |

### O que foi entregue FORA do Gantt Semana 2 (trabalho real da semana)

**Features** (nao planejadas para esta semana, mas entregues):
- `feat(landing)` — Landing V2 completo: 6 sections novas com fotos reais CEO (PrinterShowcase, ProductPreview dots ember, WalletTransform, MakerBeforeAfter, CustomerProof, WhatsAppFlow com PNG real)
- `feat(golden-path#1)` — Lead→Pedido manual funcional: `leadsService.convertToOrder` + migration `20260520_leads_converted_order.sql` + botao "Converter em Pedido" + badge convertido no LeadCard
- `feat(empty-states)` — 4 empty states criticos (FP-01 projects, FP-02 finance, FP-03 production, FP-04 orders)
- `feat(store/P2.1)` — Lazy module loading + `useStoreModule` hook

**Performance**:
- `perf(landing)` — 12 PNGs v3 convertidos em 36 WebPs responsivos (-96% tamanho)
- `perf(landing)` — TBT fix tentativa: LazyMotion no Hero + posthog-js lazy + OnboardingController stub

**Bugs corrigidos**:
- `fix(landing)` — Remove pontos finais de headlines + em-dash + voce→tu (CEO cobrou)
- `fix(hero)` — Reverte LazyMotion que travou conteudo em opacity:0 em prod
- `fix(orders)` — Remove redeclaracao duplicada hoje/semanaISO/entreguesNoMes
- Commit `8a79f59` — LazyMotion do Hero causou regressao visual grave em prod (conteudo invisivel). Revertido no mesmo dia.

**Incidente desta semana**:
- `/customers` V4 foi commitado 2x (`f892597`, `9f0d29b`) e depois revertido (`840f45a`). Status atual do modulo `/customers` e incerto — precisa confirmacao se esta ou nao em prod.

**Docs/infra**:
- `docs(landing)` — CLAUDE.md atualizado com tabela componentes V2
- `monitoring` — error-scan 22/05
- Assets: fotos-maker v3-v6 + timelapses Bambu Lab adicionados a `public/`

---

## Pillar Scores (estado atual)

| Pilar | Score | Meta 30d | Tendencia |
|---|---|---|---|
| Design (UI/UX) | 9.0 | 9.5 | estavel |
| Anti-IA | 9.0 | 9.5 | estavel |
| Seguranca | 9.2 | 9.5 | estavel |
| Performance | 7.0 | 8.0 | travado (TBT 3.6s nao resolvido) |
| Acessibilidade | 6.5 | 8.0 | sem movimento |
| Mobile | 7.5 | 8.5 | sem movimento |
| Conversao | 6.5 | 7.5 | estavel (PostHog ativo) |
| Retencao | 5.0 | 6.5 | sem movimento |
| Pagamento | 8.5 | 9.0 | estavel |
| Documentacao | 8.5 | 9.0 | estavel |
| Backend | 8.0 | 8.5 | estavel |
| Estrategia | 8.0 | 8.5 | estavel |
| **MEDIA** | **7.7** | **8.0** | estavel |

Pilares sem nenhum movimento esta semana e com meta 30d distante: Acessibilidade (6.5→8.0) e Retencao (5.0→6.5). Esses dois nao vao se mover sozinhos.

---

## Blockers

### 1. Felipe/V4 React — CRITICO (impacto direto no launch)

**Problema**: Todos os 5 itens Felipe do Gantt Semana 2 nao foram entregues. O dashboard V4 continua sendo o HTML mockup em `mockups/dashboard/v4-hibrido.html`. Nao existe React em prod. O CEO nao conseguiu validar dados reais no preview (etapa obrigatoria antes de avanar).

**O que foi entregue**: `OnboardingController stub para desbloquear build` — uma casca vazia que nao e a conversao real.

**Impacto no launch**: sem V4 React, os modulos do dashboard continuam desconectados entre si. O golden path real (lead→pedido→producao→estoque→financeiro) nao funciona de ponta a ponta. Semana 3 assume que Semana 2 Felix entregou o preview — isso nao aconteceu.

**Acao necessaria**: Felipe precisa de uma sessao dedicada so para V4 React conversao, sem tarefas laterais. Sugestao: proxima operacao noturna sab-dom com Felipe como unico agente (sem concorrencia de contexto).

### 2. TBT 3.6s — CRITICO (performance pub)

**Problema**: TBT em prod continua 3.6s. A tentativa de fix com LazyMotion causou regressao (conteudo invisivel, revertido no mesmo dia `8a79f59`). Sem solucao alternativa aplicada esta semana.

**Impacto no launch**: Google Core Web Vitals fora do verde afeta ranking SEO + percepcao do maker que abre o site no celular pela primeira vez.

**Sem fix ha**: a issue existe desde antes de 20/05. Ja passou 7+ dias sem progresso real.

### 3. MP OAuth bloqueado — MODERADO (workaround ativo)

**Problema**: painel MP `dx-panel-front-applications` quebrado desde 07/05 (15 dias). Bug global do MP.

**Impacto**: nao consigo ativar credenciais produtivas MP. Stripe Connect esta cobrindo.

**Status**: nao e bloqueador de launch desde que Stripe Connect funcione. Adia pra Semana 5 sem culpa (ja documentado ADR-027).

### 4. QA Mobile — CRITICO para soft launch 11/06

**Problema**: zero feito. Checklist existe em `sessions/2026-05-20-checklist-qa-mobile.md` mas nenhuma sessao de QA foi executada.

**Impacto**: CEO testa no celular. Se QA mobile nao rodar antes do soft launch 11/06, bugs visuais vao aparecer na frente dos primeiros makers.

**Prazo real**: precisa comecar ate 28/05 (semana 3) para ter tempo de fix antes de 11/06.

### 5. Onboarding Wizard — MODERADO

**Problema**: Carla entregou copy em `brand/onboarding-copy-2026-05-20.md`. Felipe nao codou.

**Impacto**: first-time experience zero. Maker que entra nao sabe o que fazer.

### 6. INPI reverificacao — FINANCEIRO (deadline 13/06)

**Problema**: reverificacao pePI INPI pendente antes de pagar R$ 880 GRU. Arquivo `decisions/pending-inpi-busca-profunda-pre-pagamento.md` descreve a tarefa. Nenhuma acao tomada desde 18/05.

**Impacto**: pagar R$ 880 sem reverificar = risco de colisao descoberta pos-pagamento. Deadline e 13/06.

**Acao necessaria CEO**: agendar rodada external-researcher ate 05/06 (1 semana de folga antes do deadline).

### 7. /customers revert — STATUS INDEFINIDO

**Problema**: modulo `/customers` V4 foi commitado e revertido na mesma sessao (20/05). Status atual em prod e desconhecido sem teste manual.

**Impacto**: Semana 4 do ROADMAP assume `/customers` como entrega. Se o modulo foi revertido e precisa ser reconstruido, Semana 4 esta em risco.

---

## Plano Semana 3 (25-31/05)

Do ROADMAP Semana 3 e do plano `strategy/semana-3-plano-2026-05-25.md`:

1. **Bloco A — V4 React em prod com dados reais** (Felipe prioridade absoluta)
   - Deploy preview CEO valida ate sex 29/05 — nao pode atrasar mais
   - Bruna conecta services remanescentes se Felipe travar em integracao

2. **Bloco B — PostHog + Vercel Analytics** (Marcos + Felipe)
   - PostHog ja esta ativo em prod (events landing). Falta: eventos internos modulos + Vercel Analytics
   - 1 dia de setup — nao pode pular: pilar Conversao (6.5) nao sobe sem dado

3. **Bloco C — Lighthouse + Axe audit top 3** (Julia + Felipe)
   - Julia nao entregou a11y esta semana. Semana 3 e o segundo prazo. Se nao sair ate 31/05, pilares 4+5 ficam travados pra sempre antes do launch.

4. **Bloco D — Email D+1/D+3/D+7** (Sofia + Carla)
   - Templates Carla: definir ate qua 27/05
   - Wire-up: Bruna configura pg_cron ou trigger Supabase ate sex 29/05

5. **QA Mobile — iniciar ja** (CEO + Diego + Felipe)
   - Nao esta no ROADMAP Semana 3 mas e CRITICO pra soft launch 11/06
   - Sugestao: CEO dedica 2h sab 30/05 testando iPhone + Android com checklist

---

## Decisoes Pendentes CEO

| # | Decisao | Deadline | Status |
|---|---|---|---|
| 1 | INPI: pagar PIX GRU R$ 880 classe 35+42 APOS reverificacao pePI | 13/06 | Reverificacao pendente (extrenal-researcher) |
| 2 | CNPJ MEI→ME: desenquadrar antes 1a venda paga Hayzer | Antes Calc Pro ou assinatura paga | Sem acao desde 20/05 |
| 3 | Beauty Decisao 7: cobranca R$ 197 unico vs 3 tiers vs combo gestora-mae | 28/06 (briefing Beauty) | CEO quer pensar mais |

---

## Alertas

### ALERTA 1 — TBT 3.6s ha 7+ dias sem progresso real

O fix tentado na semana (LazyMotion Hero) causou regressao visual e foi revertido. Nao existe plano B documentado ativo. Esse e o bug de performance mais visivel em prod e nao pode entrar no launch publico 27/06 assim.

Recomendacao: dedicar 1 sessao Bruna + Felipe especificamente para diagnostico WaitlistForm Zod + Hero motion — os dois candidatos identificados. Prazo maximo: 31/05.

### ALERTA 2 — Felipe sem nenhuma entrega do Gantt Semana 2

Todos os 5 itens Felipe (V4 React) nao foram entregues na semana programada. Isso nao e falha do agente — e sinal de que o modelo de "Felipe faz V4 React em paralelo com tudo mais" nao esta funcionando. As operacoes noturnas desta semana foram dominadas por landing e golden path (trabalho de alto valor mas nao era o que o Gantt pedia).

A conversao V4 React e o item de maior impacto estrutural no produto. Se nao entrar em prod ate sex 29/05, a janela de polish pre-soft-launch (11/06) some.

### ALERTA 3 — Revisao semanal Pillars #1 nao aconteceu

Estava no Gantt SEX 24/05. Nao foi feita. O sistema de pillars depende de revisao semanal CEO+Helena pra funcionar (CEO disse "nunca se acomodar"). Sem revisao = scores ficam congelados e perdem credibilidade.

---

## Nota de Helena

A semana produziu trabalho real e de qualidade: landing V2 com fotos autenticas, golden path #1 funcional, 4 empty states, -96% otimizacao assets. O produto ficou mais apresentavel. O problema e que o trabalho entregue nao e o trabalho que desbloqueia o launch.

O V4 React continua sendo HTML mockup. O CEO nao validou dados reais em preview. QA mobile nao comecou. TBT em prod nao tem solucao. Esses quatro itens sao os que travam o launch de 27/06 — nao os que foram entregues esta semana.

Semana 3 precisa ser diferente em disciplina: Felipe faz so V4 React ate ter preview funcionando com dados reais do CEO. Nada mais. O modelo de "aproveitar o embalo e entregar tudo" esta consumindo bandwidth onde nao deveria esta semana.

O ritmo atual (60-65% do produto pronto, assessment CEO 20/05) compativel com launch em 5 semanas so se as proximas 2 semanas entregarem o nucleo tecnico (V4 React + servicos conectados + mobile QA). Caso contrario, a data de 27/06 precisa de revisao honesta na proxima reuniao segunda 9h.
