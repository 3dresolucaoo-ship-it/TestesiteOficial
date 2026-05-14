# ADR 010 — Foco Vertical Maker 3D na Landing Fase 1

> **Data**: 14/05/2026
> **Status**: Aceito
> **Decisores**: Gabriel (CEO) + Helena (Estratégia) — input de Marcos (marketing), Carla (copy) e external-researcher via mini-council
> **Custo de reversão**: MÉDIO — copy + form schema + componentes da landing; reverter custa 1 sprint de re-escrita, sem perda de domínio/marca

---

## Contexto

A landing pré-launch (alvo 04/07/2026) hoje fala simultaneamente com **3 verticais**:

1. **Maker 3D** (Rafael — persona oficial do brand brief)
2. **Loja de bairro** (varejo físico tradicional)
3. **Serviço sob demanda** (orçamentos, agendamento)

Esse posicionamento "tudo num lugar só pra qualquer micro-negócio" nasceu da arquitetura real do produto (estoque + checkout + financeiro + clientes integrados — ver `brand/BRIEF.md` § "Diferencial Real"). Tecnicamente o sistema serve as 3, mas comunicacionalmente está diluído.

### O que disparou a revisão

Mini-council convocado em 14/05/2026 com input externo (consultor crítico). Crítica central:

> "Quando você fala pra três pessoas diferentes ao mesmo tempo, nenhuma sente que você está falando com ela. Maker 3D, dono de mercadinho e prestador de serviço têm dores, vocabulário e canais completamente diferentes. A landing genérica vira ruído pros três."

### Sinais que reforçaram a crítica

- **Cliente alvo Fase 1 já é maker 3D**: brand brief tem Rafael (34 anos, loja de impressão 3D) como persona oficial — não há persona equivalente pras outras 2 verticais
- **Rede orgânica do CEO é 3D**: Héquison e Falconi (clientes-âncora pré-launch) são makers 3D — canal de distribuição inicial é 100% essa vertical
- **Fase 2 já tem demanda confirmada**: Ybera Paris (40k afiliados BR, R$ 200M/ano — ver `decisions/009-naming-hayzer.md` § Rodada 1) sinalizou interesse em vertical cabeleireira, mas é **Fase 2**, não Fase 1
- **Conversão de waitlist**: lead qualificado (maker 3D que se reconhece) vale 5-10x lead curioso genérico — densidade de canal > tamanho de funil

---

## Decisão

**Landing principal Fase 1 foca exclusivamente em maker 3D.**

### O que muda

1. **Copy reescrita** pra Rafael e similares (Carla está executando em paralelo)
2. **Tags "construído para"** apontam só pra maker 3D (lojas de impressão · estúdios maker · vendedores de marketplace)
3. **Features** ilustradas com cenários de impressão 3D (filamento, peça impressa, comissão de marketplace, fila de impressão)
4. **Comparativo** (`WhyDifferent.tsx`) mostra concorrentes na ótica do maker 3D — não na ótica do varejo geral
5. **Form de waitlist** etapa 2 ganha opções de segmento alinhadas a maker 3D + opção "Outro — qual?" pra capturar Ybera/serviços/varejo sem perder o sinal — Marcos desenhou o funil

### O que NÃO muda

- **Nome Hayzer**: continua neutro/agnóstico (ver ADR-009) — habilita expansão futura sem rebrand
- **Produto técnico**: backend, schema, services continuam multi-vertical (project_id em toda query — regra global #1)
- **Brand brief**: Rafael continua persona, conceito "raiz do negócio" continua universal
- **Domínio principal**: `hayzer.com.br` continua sendo a landing-mãe

---

## Alternativas consideradas

### A) Foco exclusivo maker 3D ✅ ESCOLHIDA

- **Prós**: mensagem afiada, conversão maior, qualificação de lead, alinhamento com canal real (rede CEO), copy escrevível com profundidade real (Rafael é persona conhecida)
- **Contras**: TAM curto prazo menor (corta varejo + serviços), risco de lock-in de percepção ("ah, Hayzer é só pra impressão 3D")

### B) Manter amplo (3 verticais simultâneas)

- **Prós**: TAM maior teórico, mantém flexibilidade
- **Contras**: dilution confirmado pela crítica externa, ninguém se sente alvo, copy genérica vira "que ajuda" / "plataforma" / "solução" — banido pelo brand brief (`brand/BRIEF.md` § Tom)
- **Veredito**: descartada — TAM maior teórico não converte se a mensagem não engaja

### C) Promessa central única + prova-vertical

- Manter headline universal ("a raiz do seu negócio") + sub-headline e features ilustradas só com 3D
- **Prós**: meio-termo, preserva flex futura
- **Contras**: é a situação atual disfarçada — sem teste real de foco, não dá pra medir se foco funciona; copy fica em fricção permanente entre "universal" e "específico"
- **Veredito**: descartada — meio-termo não testa hipótese, posterga a decisão sem dado

---

## Consequências

### Positivas (esperadas)

- **Conversão maior**: lead que chega vê "isso é pra mim" em 3 segundos
- **Qualificação automática**: quem se cadastra é maker 3D ou similar — onboarding pós-launch mais fácil
- **Copy mais profunda**: Carla escreve com vocabulário real (filamento, fila de impressão, peça que falhou, comissão de marketplace) — diferencia de IA-slop genérico
- **Canal alinhado**: indicação orgânica via Héquison/Falconi reforça mensagem (eles falam com makers 3D)

### Negativas (aceitas)

- **TAM curto prazo menor**: leads de varejo e serviços que chegariam por SEO genérico não convertem agora
- **Lock-in de percepção**: mercado pode rotular Hayzer como "sistema pra impressora 3D" — difícil reverter rótulo depois
- **Risco de canibalizar interesse Ybera**: se cabeleireira chegar na landing e ver só 3D, sai sem se cadastrar

### Mitigações

- **Nome Hayzer neutro** (ADR-009) — não tem "3D" no nome, expansão futura não exige rebrand
- **Campo "outro segmento?" na etapa 2** do form — captura sinal de Ybera/varejo/serviços sem comprometer mensagem principal; opções incluem 3D variantes + "Estética/salão" + "Loja física" + "Serviço sob demanda" + "Outro — qual?"
- **Este ADR registra que foco é tático, não estratégico** — produto continua multi-vertical no código; landing é uma camada de aquisição, não a identidade do produto
- **Brand brief preserva universalidade** — "a raiz do seu negócio" funciona pra qualquer vertical, só não está sendo usado agora na landing pública

---

## Gatilho de expansão (pós-launch)

A landing principal **só volta a ser agnóstica** quando houver evidência real, não antes.

### Condições pra expandir

- **Após 04/07/2026** (lançamento Fase 1 estabilizado, mínimo 30 dias de operação)
- **2-3 verticais com tração orgânica confirmada** via:
  - Campo "outro segmento?" do form (volume + repetição de segmento) — KPI Marcos: ≥15% leads não-3D em 4 semanas
  - Leads vindos por indicação fora da rede 3D
  - Conversas qualificadas (não só interesse) com clientes não-3D

### O que fazer quando condição bater

1. **Criar rota dedicada**: `/cabeleireiras` (rota Next.js dentro do mesmo domínio) pra Ybera Paris — copy + features específicas, mesma marca
2. **Subdomínio só se virar squad/produto separado** (`cabeleireiras.hayzer.com.br`) — gatilho: time dedicado + roadmap próprio + pricing diferente
3. **Landing principal vira agnóstica** quando houver 3+ verticais ativas com tração — aí faz sentido voltar pra promessa universal porque o produto tem prova social de múltiplas verticais

### O que NÃO fazer

- ❌ Não voltar pra landing genérica antes de ter dado de tração em 2-3 verticais — vira loop
- ❌ Não criar `/maker-3d` agora (a landing principal já é isso) — duplicação inútil
- ❌ Não comprar domínio separado pra Ybera antes de ter time dedicado — custo de operação > benefício

---

## Arquivos afetados (executável)

Felipe (frontend) + Bruna (backend) + Carla (copy) executam em paralelo quando CEO aprovar:

| Arquivo | Mudança | Responsável |
|---|---|---|
| `components/landing/Hero.tsx` | Sub-headline + tag "construído para" → maker 3D | Carla escreve, Felipe implementa |
| `components/landing/Features.tsx` | 4 bodies das features → cenários 3D (filamento, peça que falhou, comissão marketplace, recompra de maker) | Carla + Felipe |
| `components/landing/WhyDifferent.tsx` | Headline + comparativo Bling/Conta Azul/Nuvemshop → ótica maker 3D | Carla + Felipe |
| `components/landing/WaitlistForm.tsx` | CTA principal → "Quero acesso antecipado" + sub-copy | Felipe |
| `services/waitlistSchema.ts` | Schema etapa 2 ganha `segment` enum com 7 opções (3D variants + estética + loja física + serviço outro + Outro:texto) | Bruna |
| `supabase/migrations/<nova>.sql` | ALTER TABLE waitlist_leads ADD COLUMN segment text, segment_other text | Bruna |
| `app/waitlist/actions.ts` | Server action persiste `segment` + `segment_other` | Bruna |
| `components/landing/Step2Form.tsx` | Adicionar select de segmento etapa 2 + microcopy | Felipe |
| `brand/BRIEF.md` § Cliente Alvo | Adicionar nota: "Landing Fase 1 fala só com Rafael (decisão ADR-010)" | Helena |

---

## Métricas de validação (30 dias pós-launch)

Critérios objetivos pra avaliar se a decisão funcionou:

- **Taxa de conversão visitante → lead**: alvo ≥ 8% (baseline landing genérica não testada, mas indústria SaaS BR fica em 2-4%)
- **% de leads autodeclarados maker 3D**: alvo ≥ 70% (alinhamento mensagem-audiência)
- **Volume de respostas "outro segmento?"**: medir distribuição — se 30%+ dos leads forem de outras verticais, sinal forte pra Fase 2
- **Custo por lead qualificado**: medir vs estimativa pré-foco
- **Taxa de abertura email sequência Resend**: ≥40% (Marcos KPI)

Se métricas abaixo do alvo em 30 dias → revisar via ADR novo (não reverter no escuro).

---

## Status

**Aceito** em 14/05/2026 por Gabriel (CEO) + Helena (Estratégia), com input de Marcos, Carla e external-researcher via mini-council.

Carla entregou copy (6 textos com versões A/B). Marcos desenhou funil completo + CTA + campo segmento. Felipe e Bruna entram quando CEO aprovar a copy final.

---

## Relacionados

- `decisions/009-naming-hayzer.md` — nome neutro Hayzer habilita esta decisão (sem "3D" no nome, expansão futura não exige rebrand)
- `decisions/008-time-g7.md` — mini-council pattern que validou a decisão
- `ROADMAP.md` § Fase 1 — lançamento 04/07/2026
- `brand/BRIEF.md` § Cliente Alvo — persona Rafael (mantida)
- `components/landing/CLAUDE.md` — status da landing
