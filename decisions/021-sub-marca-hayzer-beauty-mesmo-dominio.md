# ADR-021 — Sub-marca Hayzer Beauty no mesmo domínio (arquitetura "tela seletora")

**Status**: Aceito — schema base aplicado em prod 20/05/2026; implementação visual na Onda 2 (a partir de 05/07/2026)
**Data**: 2026-05-20
**Autor**: CEO Gabriel Vaz (articulado após print Humanos Fora da Curva)
**Owner execução**: Diego (identidade visual) + Felipe (frontend) + Bruna (backend) — Onda 2
**Custo de reversão**: MÉDIO — schema `vertical_type` já em prod (DROP exige migration); identidade visual ainda não implementada (reversão trivial antes de Onda 2)

---

## Contexto

Em 20/05/2026, a sessão de briefing Hayzer Beauty mapeou o ecossistema Ybera Paris:

- TAM estimado: R$ 4,7M/ano (gestoras BR)
- ARPU alvo: R$ 197/mês por gestora
- Público: 90% mulheres, mercado premium, identidade estética própria (linguagem, cores, aspirações distintas do maker 3D)
- Produto core: Mini-Academy por gestora (cada gestora tem sub-Academy próprio com método, videoaulas, branding white-label)

O CEO articulou o posicionamento após ver o modelo Humanos Fora da Curva: uma marca-mãe que abriga produtos com identidades visuais distintas sob um único login e domínio.

A tensão: como ter identidade visual premium para um público feminino (preto+dourado, vocabulário de luxo) sem fragmentar a marca Hayzer nem criar dois produtos independentes com custos de infraestrutura separados?

Contexto do schema: ADR-016 já aplicou `vertical_type` ENUM em `projects` com valores `('maker', 'beauty')` e DEFAULT `'maker'`. A migration `supabase/migrations/20260519_add_vertical_type.sql` está em prod desde 20/05.

A decisão de posicionamento Beauty foi tomada como parte do Bloco 2 (decisões 6-8 de 20/05), formalizada em `strategy/decisoes-ceo-pendentes-2026-05-20.md` — Decisão 6 ("A modificado").

---

## Decisão

**Hayzer Beauty é uma sub-marca visível com identidade visual própria, operando no mesmo domínio `hayzer.com.br`.**

Arquitetura de entrada ("tela seletora"):

```
hayzer.com.br/login
      |
      v
[tela seletora de produto]
      |
      |-- Hayzer Maker --> paleta night/petrol/ember, vocabulário maker, dashboard Maker
      |
      |-- Hayzer Beauty --> paleta preto/dourado, vocabulário premium feminino, dashboard Beauty
```

Um login. Um domínio. Dois produtos com identidades visuais distintas.

O campo `vertical_type` no projeto do usuário determina qual experiência é carregada após a seleção.

**O que está pronto (Onda 1, antes de Onda 2):**
- Schema `vertical_type` em prod (ADR-016)
- Arquitetura técnica definida neste ADR

**O que é escopo exclusivo da Onda 2 (a partir de 05/07/2026):**
- Identidade visual Beauty: paleta preto+dourado, tipografia, tokens de tema (Diego + Carla, estimativa 8-12h)
- Tela seletora de produto (Felipe)
- Roteamento por `vertical_type` nos services (Bruna)
- Conteúdo Mini-Academy por gestora
- Pricing e Stripe para o produto Beauty

---

## Alternativas consideradas

| Alternativa | Razão para rejeitar |
|---|---|
| **Domínio separado `hayzerbeauty.com.br`** | Custo de registro + renovação. Fragmenta SEO (duas propriedades concorrentes ao invés de uma autoridade). Exige infraestrutura duplicada (Vercel project, Supabase projeto ou schema separado, env vars duplicadas). Duas bases de código para manter. Descartado: custo operacional supera benefício percebido de separação. |
| **Sem brand própria ("Hayzer pra Beauty")** | Público gestora Ybera é premium estético. Aceita pagar R$ 197/mês porque enxerga valor de marca. Reutilizar visual maker (night/petrol/ember) em contexto de luxo feminino gera rejeição. O diferencial é exatamente a identidade premium, não só a funcionalidade. Descartado: menos apelo direto ao público-alvo. |
| **Produto completamente separado (outra empresa/CNPJ)** | Complexidade jurídica, contábil e operacional. Dois times, duas infras, dois suportes. Prematuro para Onda 2 com 5-15 gestoras iniciais. Descartado: escala de produto não justifica escala de estrutura. |

---

## Consequências

### Positivas
- Uma codebase, um domínio, um Supabase: custo de manutenção é o de um produto
- SEO concentrado em `hayzer.com.br` (autoridade de domínio cresce junto)
- Mesmo auth (Supabase Auth + RLS): usuario Beauty e Maker compartilham a mesma tabela `auth.users`, isolados por `project_id` + `vertical_type`
- Escalável: adicionar Vertical 3 (ex: alimentação, serviços) exige apenas `ALTER TYPE public.vertical_type ADD VALUE 'nova_vertical'` + CSS + tela seletora atualizada
- Identidade visual premium para Beauty sem comprometer identidade maker (paletas separadas, sem mistura)
- Schema `vertical_type` ja em prod: Onda 2 não exige migration de schema, apenas services e CSS

### Negativas e riscos
- **Custo Diego + Carla na Onda 2**: estimativa 8-12h de trabalho criativo para identidade Beauty. Risco se prazo Onda 2 apertar.
- **Complexidade da tela seletora**: se usuario tiver projetos em duas verticais (improvável mas possível), a UX da seletora precisa tratar esse caso.
- **Risco de contaminação visual**: se tokens de tema (CSS custom properties) não forem isolados corretamente por `vertical_type`, uma sessão Beauty pode carregar assets Maker. Mitigação: Felipe deve usar prefixo `--maker-*` e `--beauty-*` explícitos nos tokens.
- **Percepção de marca diluída**: usuário que conhece Hayzer como "sistema maker 3D" pode estranhar ao ver Beauty no mesmo login. Mitigação: tela seletora é o filtro natural; cada vertical tem copy e visual próprios.

### Reversibilidade

- **Schema**: DROP COLUMN `vertical_type` + DROP TYPE `vertical_type` reverte em segundos (sem dado de usuario no campo ainda). Custo baixo até Onda 2 começar a usar o campo nos services.
- **Identidade visual Beauty**: antes de Onda 2 implementar, reversão é trivial (arquivos CSS/tokens ainda não existem). Após Onda 2, reverter exige apagar assets e rota de seleção.
- **Arquitetura de domínio**: reverter para domínio separado após Onda 2 implantada exige migração de usuarios e redirecionamentos. Custo alto se já houver gestoras ativas.

---

## Quando revisitar

- **28/06 ou 05/07/2026**: briefing G7 Beauty — detalhar arquitetura da tela seletora e confirmar escopo Diego + Carla
- **Se Beauty atingir mais de 50 gestoras ativas**: avaliar se subdomínio `beauty.hayzer.com.br` faz sentido por SEO (landing dedicada) mantendo o login unificado
- **Se surgir Vertical 3**: reavaliar se tela seletora escala pra 3+ opções ou se a UX pede redesign

---

## Arquivos relacionados

- `decisions/016-multi-vertical-schema.md` — ADR que aplicou `vertical_type` ENUM em `projects` (schema base desta decisão)
- `supabase/migrations/20260519_add_vertical_type.sql` — migration já em prod que habilita o campo
- `strategy/briefing-hayzer-beauty-05-07-executivo.md` — briefing executivo Beauty (TAM, ARPU, personas, produto core)
- `strategy/decisoes-ceo-pendentes-2026-05-20.md` — Decisão 6 (posicionamento Beauty) e Decisão 8 (data do briefing G7)
- `decisions/010-foco-vertical-maker-3d.md` — ADR que formalizou Maker como Vertical 1; Beauty é Vertical 2
- `decisions/009-naming-hayzer.md` — nome Hayzer é neutro (sem "3D" ou "Beauty"), habilita sub-marcas sem rebrand
- `decisions/022-launch-acelerado-04-07-para-27-06.md` — launch Maker em 27/06; Beauty entra Onda 2 (05/07+)
