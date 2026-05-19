# Sessão 2026-05-20 — Ybera Beauty ESTUDO COMPLETO + Helena briefing 05/07 + Pivot Maker

> Snapshot imutável. Sessão maratona (~8-10h). 4 docs Ybera + 2 pesquisas externas + briefing executivo Helena entregue. Pivot pra Maker confirmado.

## 🎯 Tema da sessão

Continuação 7 perguntas pendentes 19/05 + Ybera Club captura profunda + Beauty Academy + Brasil Influencer + Gestoras pesquisa + Briefing executivo 05/07 + Decisões 4-tarefas finais.

## ⏱️ Duração

~8-10h (longa, multi-pivot). CEO oscilou entre Ybera deep dive (3-4h) → Beauty briefing → pivot foco Maker.

## ✅ Entregas

### Bloco 1: 7 perguntas pendentes 19/05 RESOLVIDAS

1. **Hooks settings.json** — não resolvido (decisão CEO: aguardar Lia+Ricardo Fase 1 hardwork)
2. **Routine claude-quota-monitor** — CORTADA (Anthropic já alerta nativo, redundante)
3. **4 routines adicionais** — só nps-beta vale (criar 12/06 pós soft launch); 3 outras cortadas
4. **Ybera Club estudo continuar** — ✅ RESOLVIDO HOJE (10+ frentes capturadas)
5. **3 routines spec manual** — ✅ TODAS 3 CRIADAS HOJE via Chrome MCP:
   - `waitlist-funnel-diario` (trig_01FYkwcEbHXPMtXEVroi44XP) daily 8h BRT
   - `production-smoke-test` (trig_01WeoXnef3uwyNbGnRLgcEvd) daily 6h BRT
   - `supabase-rls-policy-audit` (trig_01N2VJa4My5NFVPbiVmvi4Bt) weekly seg 9h BRT
6. **Matar waitlist-weekly-digest** — esperar 2 semanas pós funnel-diario validar
7. **Verificar conectores 3 routines** — ✅ RESOLVIDO HOJE
   - concorrencia-diaria-light: OK
   - concorrencia-semanal-deep: OK
   - **comunidades-maker-semanal: BUG REAL** (só Google Drive) → CORRIGIDO via Chrome MCP (5 conectores agora)

### Bloco 2: Ybera Club captura PROFUNDA (cobrança CEO)

CEO cobrou "15 telas só nos títulos = ZERO valor". Refiz tudo com drilldown:

1. **Plano Carreira** — R$ 4.105,18 acumulado (41.05% pra Bronze), 12 níveis até Oceania R$ 15 milhões
2. **/settings 5 tabs** — Idioma, 2FA (Google Auth only), API Integração, Pixel FB, **Token B2c Pass 10min compra**
3. **/user/edit/1-6** — Dados (CNPJ 59.366.459/0001-56), Endereço (CEP 86084-140 Londrina), Redes (IG @heshiley_borges), **2 senhas separadas** (acesso + financeira), Financeiro, Contrato pendente assinatura
4. **Equipe Direta** — 2 afiliadas Heshiley (Leticia Antunes Maringá-PR + Polyana Roque BH-MG) **ambas zeradas 6 meses**
5. **Equipe Completa** — limite 20 indicações (7 usadas), roles Gestor vs Influenciador, Exportar CSV
6. **Links Indicação** — 2 modais: Link Loja `ybera.com?parceiro=19985` + Influencer `/register/Heshiley`
7. **Metas modal** — Adicionar Meta com Data/Hora/Valor/Descrição (SEM campo prêmio em metas pessoais)
8. **Loja Interna /catalog** — 8 sub-brands (Spa Pet, Acquafit, Tella Coco, Fashion Gold, Black Diva, Ybera Paris, Brasil Influencer, Black November). Combo 100Tímetros = mais vendido Heshiley (4x)
9. **Dashboard BI drilldown** — Sugestão IA com **BUG** (link `/null` 404), Top 8 produtos (3 BRINDES), ranking clientes (Bianca + Bruna), Vendas por região (só Paraná R$ 1K)
10. **Desbloqueio /unlocking-balance** — TELA QUE EU TINHA MARCADO VAZIA. Era PROFUNDA: Saldo Bloqueado R$ 124,12 + Desbloqueado R$ 157,32, calendário diário 4-cor (Automático/Crédito/Débito), tabs Abr/Mai/Jun

**Arquivo**: `Contextos Projetos/02 - Frentes ativas/5k - Ybera Club CAPTURA PROFUNDA 2026-05-20.md`

### Bloco 3: Campanha Mobbr "Corrida das Metas Ybera Run"

URL: https://mobbr.my.canva.site/corrida-das-metas

3 níveis gamificados:
- **Meta 01 ATIVAÇÃO**: R$ 2K fixo → Cupom oferta exclusiva
- **Meta 02 BÔNUS**: Proporcional histórico (algoritmo!) → Bônus dinheiro
- **Meta 03 DESTAQUE**: Superar histórico → 2x bônus
- **Top 5 ranking**: Medalha física dourada (qualifier 3+ meses)

INSIGHT: Mobbr = gestora topo. **Gestoras criam campanhas próprias paralelas** (não só oficiais Ybera). Hayzer Beauty deve ter "Criador de Campanhas in-app".

**Arquivo**: `Contextos Projetos/02 - Frentes ativas/5l - Campanha Mobbr Corrida das Metas Ybera Run 2026-05-20.md`

### Bloco 4: Ybera Academy LMS (academyb2c.com)

7 categorias descobertas + access control multi-tier (Aberto/Cohort/Role/Paid).

⭐ **INSIGHT GIGANTE CEO articulou**: "imagina cada gestora tendo seu Ybera Academy mostrando sua cultura construindo seu método de aulas". = **MINI-ACADEMY POR GESTORA** vira feature CORE Hayzer Beauty.

URL pattern revelador: `?unidade=academyb2c` = multi-tenant nativo. Mas dentro da Ybera é one-size pra todas afiliadas.

**Arquivo**: `Contextos Projetos/02 - Frentes ativas/5m - Ybera Academy LMS Estudo 2026-05-20.md`

### Bloco 5: Brasil Influencer (evento anual Ybera)

URL: brasilinfluencer.com

- Cresceu 17× em 3 anos (700 → 12.000 pessoas em 2025)
- 4ª edição: Espaço Vibra SP, 30-31/10/2025
- Mari Maria (22M IG), Erich Shibata, Gabriela Comazzetto (TikTok LAM)
- 5 tiers ingresso Bronze R$ 447 → Camarote (não público)
- Transmissão 11 países + replay 1 ano
- 5ª edição 2026 ainda NÃO anunciada

**NÃO é convenção fechada** — qualquer um compra. Afiliadas Ybera ganham apenas acesso antecipado (11 dias).

**Arquivos**:
- `Contextos Projetos/02 - Frentes ativas/5n - Brasil Influencer Evento Ybera 2026-05-20.md`
- `research/brasil-influencer-evento-anual-ybera-2026-05-20.md`

### Bloco 6: Pesquisa Gestoras Ybera + Gap mercado

- **~500 gestoras ativas** B2Club
- **Top 10 gestoras identificadas** (Erica Adaiane 288k+1.3M TikTok, Marla Honorato 274k, Lidy Almeida 162k+1M YouTube, etc)
- **GAP VERIFICADO**: Top 2 (Marla + Erica) SEM curso próprio = audiência massiva sem produto educacional
- **@mayracardicursos**: candidata #1 a verificar → CONFIRMADO HOJE = perfil deletado/falso positivo, NÃO é concorrente real
- **Caso análogo**: Mari Ribeiro (40k seguidores, 2 cursos Hotmart) prova nicho rentável

**Arquivo**: `research/gestoras-ybera-academies-proprias-2026-05-20.md`

### Bloco 7: Briefing Executivo Hayzer Beauty 05/07 (Helena)

⭐ **ENTREGA HELENA**: `strategy/briefing-hayzer-beauty-05-07-executivo.md`

- **Tese**: 1° SaaS multinível-genérico beleza BR que unifica 5 ferramentas
- **ARPU R$ 197/mês · LTV R$ 2.364 · TAM R$ 4.7M/ano (100% penetração)**
- **Meta 12 meses**: 50 gestoras = R$ 118k ARR
- **Top 5 features**: Mini-Academy por gestora + Dashboard BI com IA + Multi-canal nativo + Criador campanhas algorítmicas + Calendário desbloqueio 4-cor
- **3 fases**: MVP 30/09 → Beta Q4 2026 → Launch público Q1 2027 (50 gestoras = R$ 9.850 MRR)

### Bloco 8: 4 decisões finais sessão

1. ✅ Beta tester #1 OFICIAL = **Heshiley** (memória salva)
2. ✅ Posicionamento GENÉRICO (risco legal Ybera) → mas Helena recomenda sub-marca "Hayzer Beauty" visível
3. ✅ @mayracardicursos NÃO existe (falso positivo)
4. ✅ FOCO REAL = Maker até 27/06 (Beauty volta 05/07 com 7 docs prontos)

## ❓ Perguntas/Decisões CEO ainda NÃO respondidas (próxima sessão)

### Helena pediu 3 decisões antes de 05/07
1. **Posicionamento Hayzer Beauty**: sub-marca visível (A) vs produto sem brand (B)? Helena recomenda A.
2. **Cobrança ano 1**: R$ 197 plano único (A) vs 3 tiers desde dia 1 (B)? Helena recomenda A.
3. **Quando briefar G7**: 05/07 fechado (A) vs antecipar 28/06 14h (B)? Helena recomenda B (Heshiley co-host).

### 5 decisões Helena Operação Noturna (sessão 19/05) ainda pendentes
1. Data ativação: hoje vs 22/05?
2. Canal "acordar CEO": Gmail vs SMS Twilio vs Discord vs Telegram?
3. Quantas noites/sem: 3/7 vs 5/7 vs 7/7?
4. Threshold tokens: R$ 50/noite cap?
5. 3 agents piloto primeira noite: Bruna refactor + Lia docs + Otávio audit?

### Pendência CEO conversar com Heshiley até 26/05
3 confirmações:
- Topa ser beta tester #1 documentada?
- Aceita co-host reunião 28/06 ou 05/07?
- Pode listar 5 gestoras Ybera potenciais beta?

## 🔴 Blockers / Pendências críticas

- **INPI**: pagar PIX R$ 440 classe 42 (deadline GRU 13/06) — lembrete persistente segunda 25/05
- **MEI → ME desenquadramento**: consultar contador esta semana (antes Calc Pro Sem 3)
- **Operação noturna**: aguarda 5 decisões CEO
- **Hardwork Fase 1 NÃO INICIADO**: Bruna+Diego+Lia+Ricardo+Otávio aguardando despacho
- **Felipe 8 quick wins landing maker**: brief pronto em `5i - Persona Rafael`, não iniciado
- **Validar com contador/advogado**: posicionamento "multinível genérico" vs marca específica (risco legal)

## 📐 Decisões registradas

Sessão produziu memórias persistentes ao invés de ADRs formais. Próxima sessão Lia formaliza:
- ADR-016 (Hayzer Beauty Fase 1) — Helena vai abrir após Heshiley confirmar 3 pontos
- ADR-017 (operação noturna) — depende 5 decisões CEO

## 📦 Commits

Auto-commits Claude session durante sessão (não verificados manualmente). Próxima sessão: verificar via `git log --oneline -20`.

## 🔐 Itens segurança

- Routine `supabase-rls-policy-audit` ATIVA (semanal segunda 9h)
- Routine `production-smoke-test` ATIVA (daily 6h BRT)
- Token Ybera (Heshiley) já capturado em arquivos. Verificar: tokens IG @heshiley_borges no `5k` (não expostos, só captura visual)
- comunidades-maker-semanal conectores CORRIGIDOS (5 conectores agora)

## 🚀 Próximas ações priorizadas (próxima sessão)

### Prioridade 1 — FOCO MAKER (27/06 = 5 semanas)
1. **Disparar Hardwork Fase 1 G7** (Bruna+Diego+Lia+Ricardo+Otávio, 5 agents paralelo)
2. **Despachar Felipe 8 quick wins landing maker** (Persona Rafael brief)
3. **Calc Pro freemium** (Paulo, decidido 19/05)
4. **5 decisões Helena Operação Noturna** (CEO decide)

### Prioridade 2 — Beauty (06/07 = 7 semanas)
1. **CEO conversa com Heshiley até 26/05** (3 perguntas)
2. **Helena abre ADR-016** após Heshiley confirmar
3. **3 decisões Helena Beauty** (posicionamento + cobrança + quando briefar)

### Prioridade 3 — Operacional
1. **INPI PIX R$ 440** classe 42 (segunda 25/05, deadline 13/06)
2. **Contador**: MEI→ME desenquadramento + risco legal posicionamento
3. **Verificar GitHub PRs** (4 PRs abertos do pr-review-bot em Draft)

### Prioridade 4 — Ybera (DEFAULT pausado)
- Voltar apenas se descobrir algo crítico (ex: Ybera lança SaaS pra gestora)
- Pós-launch Maker (28-30/06): completar Material Apoio + Insights IG + Ybera.com pública + Sacar modais

## 👥 Agentes G7 envolvidos esta sessão

- **External-researcher** × 3: MCPs/skills novos 2026 + Gestoras Ybera + Brasil Influencer
- **Helena strategy** × 2: Plano operação noturna + Briefing executivo Hayzer Beauty 05/07
- **Lia, Bruna, Diego, Ricardo, Otávio, Carla, Felipe, Sofia, Ana, Paulo, Marcos, Joana, Júlia**: TODOS pendentes hardwork Fase 1 amanhã

## 🧠 Aprendizados da sessão

### Padrões CEO observados
- **CEO valoriza CAPTURA PROFUNDA** (não superficial): cobrou exaustivamente "fio por fio, unha por unha"
- **CEO pivota rápido**: Ybera deep dive → Beauty briefing → foco Maker em 1 sessão
- **CEO articula insights chave em conversa**: "imagina cada gestora tendo seu Ybera Academy" foi articulação dele que virou feature CORE
- **CEO pede paralelização**: external-researcher + Helena + Chrome MCP simultâneos sempre que possível
- **CEO confirma decisão com "1+2+3+4"**: prefere ordem clara enumerada

### Erros cometidos (não repetir)
1. **Marcar telas Ybera como "vazias" sem esperar JS load** — Loja Interna, Desbloqueio, etc tinham conteúdo rico após 3-5s. Sempre esperar lazy-load
2. **Captura superficial** (15 telas só títulos) — CEO cobrou. Sempre fio por fio: cada modal, sub-rota, filtro
3. **Mojibake no typing Chrome MCP** em campos com acentos PT-BR — sempre pivotar pra JS native setter
4. **External-researcher trouxe @mayracardicursos como "candidata"** sem verificar — foi falso positivo (perfil deletado/inexistente). Sempre cross-checar com Chrome MCP rápido antes de propor

### Sucessos (repetir)
1. **3 routines criadas via Chrome MCP** em sequência sem trava (claude.ai/code/routines funcionou com paciência + JS setter)
2. **Helena entregou briefing 1 página executivo** em 113s — pattern perfeito pra decisões grandes
3. **External-researcher 3 simultâneos** (MCPs + Gestoras + Brasil Influencer) entregaram em background sem competir contexto
4. **Salvar memória ANTES de pivotar tema** preserva trabalho (4 memórias novas salvas)

### Conhecimento técnico novo
- **academyb2c.com URL pattern `?unidade=X`** = multi-tenant nativo (escondido)
- **Chrome MCP typing acentos PT-BR** quebra → usar `nativeInputValueSetter.call(element, value)` + dispatchEvent input
- **Brasil Influencer 2025** transmitiu pra **11 países** + replay 1 ano (modelo híbrido)
- **Ybera Paris R$ 550M faturamento** + 40k afiliadas BR + 4k EUA crescendo 3x mais rápido

### Conhecimento de domínio
- **Heshiley = GESTORA Ybera Paris** (não afiliada base) — esposa CEO Gabriel Vaz
- **CNPJ Heshiley empresa**: 59.366.459/0001-56 (HESHILEY BORGES VAZ MEI)
- **CEP**: 86084-140 Londrina PR
- **Instagram**: @heshiley_borges
- **Comissão acumulada Ybera**: R$ 4.105,18 total (R$ 124,13 mês 05/26, +233.86%)
- **2 afiliadas inativas há 6 meses**: Leticia Antunes (Maringá PR) + Polyana Roque (BH MG)
- **Limite indicações Ybera**: 20 diretas (Heshiley usou 7)
- **15% comissão padrão** afiliada Ybera
- **Meta inicial R$ 10k/mês comissão** (= R$ 67k vendas/mês)
- **Teto top 20 gestoras**: R$ 300k/mês comissão
