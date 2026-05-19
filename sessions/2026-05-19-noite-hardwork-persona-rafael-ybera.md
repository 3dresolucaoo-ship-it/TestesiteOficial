# Sessão 2026-05-19 — Operação Hardwork: Persona Rafael + Ybera Club + 3 Routines + Plano até 27/06

> Snapshot imutável. Sessão maratona (~10h+). Decisões críticas tomadas. Brief consolidado pra time G7 amanhã.

## 🎯 Tema da sessão

Triple-track: (1) fix dashboard quebrado + CSV /orders + Karpathy decisão, (2) pesquisa profunda Persona Rafael (5 agents paralelos), (3) modo hardwork + estudo Ybera Club ao vivo.

## ⏱️ Duração

~10h+ (manhã → noite). CEO trabalhou junto a sessão inteira.

## ✅ Entregas

1. **Fix dashboard "quebrado"** — classe `kpi-hero` removida de `CoverHero.tsx` (era ela aplicando fundo petrol sólido no cover inteiro)
2. **Fix /orders sem layout** — `import '../globals-v4.css'` adicionado em `app/orders/page.tsx` (CSS era scoped só ao /dashboard)
3. **CSV export real** em `/orders` — `handleExportCsv` implementado client-side com BOM UTF-8, escape correto, semicolon-separated (Excel BR)
4. **Karpathy skill EXCLUÍDA** — análise crítica concluiu que 21 memórias persistentes + CLAUDE.md já cobrem. Skill redundante removida de `.claude/skills/`
5. **Memória `feedback_escopo_cirurgico` salva** — padrão recorrente Felipe 18/05+19/05 (declara done sem validar)
6. **Decisão /orders pixel-perfect mockup**: DESCARTAR. ROI baixo pré-launch, ModuleShell funcional já cumpre
7. **Pesquisa profunda Persona Rafael** — 5 agents paralelos entregaram:
   - Sofia (UX Audit): conversão 3-6% atual, potencial 12-18%, 12 friction points
   - Marcos (Concorrência): 8 concorrentes mapeados (MakerFlow R$ 29.90, 3D Control R$ 39.99, ZoomCalc3D GRÁTIS = ameaça)
   - External-researcher (Mercado): TAM 150-400k donos BR / 22-120k comercializam, CAGR 18-22%
   - Joana (Comunidades): 14 comunidades + glossário 50+ termos + 5 dores + 5 desejos + quotes literais
   - Eu via Chrome MCP YouTube: 30+ canais BR maker mapeados, padrão linguístico capturado
8. **Síntese final** consolidada em `Contextos Projetos/02 - Frentes ativas/5i - Persona Rafael - SÍNTESE FINAL 2026-05-19.md` com brief Diego + Carla + Felipe
9. **Canvas Obsidian** "5d - HAYZER - Multi-vertical Arquitetura" com 11 cards + companheiro `.md`
10. **Decisões arquiteturais aprovadas pelo CEO**:
    - Hero copy híbrido B+C (gap WhatsApp + dor "quanto sobra")
    - Schema `vertical_type` + CSS multi-tema prep AGORA (~3h)
    - Calc Pro vira Freemium (compete com ZoomCalc3D grátis)
    - Hayzer = umbrella + sub-marcas (Hayzer Maker + Hayzer Beauty futuro)
    - Sem Héquison (vambora sem ele)
11. **3 Routines criadas via Chrome MCP** em `claude.ai/code/routines`:
    - `concorrencia-diaria-light` (diário 21h) `trig_01Rzym6XH1DFBkaLkPQE8ARb`
    - `concorrencia-semanal-deep` (terça 22h) `trig_018m8v3FW656PkVtgwz3huY8`
    - `comunidades-maker-semanal` (domingo 18:30) `trig_01RBHzDHiuVnbhW4mtwaEP3F`
12. **3 Routines com spec manual** pra CEO criar em 15min cada: `mercado-maker-mensal`, `waitlist-funnel-diario`, `anthropic-dev-tools-semanal` (em `automation/routines-specs-pending-2026-05-19.md`)
13. **Cronograma acelerado**: soft launch **11-13/06** (3 semanas beta real) + launch público **27/06** (1 semana antes do prazo 04/07)
14. **Ownership Matrix** documentada em `.claude/ownership-matrix.md` (13 agents G7 com escopo cravado, fases manhã/tarde/noite)
15. **Estudo Ybera Club ao vivo** via Chrome MCP (logada Heshiley Borges): home + Equipe Direta + Equipe Completa + Plano de Carreira (tiers Iniciante → Embaixadora Oceania R$ 15M). Análise crítica completa em `5j - Estudo Ybera Club ao vivo 2026-05-19.md`
16. **Memórias persistentes salvas (5 novas)**: modo hardwork ativo 19/05→27/06, validação visual obrigatória pré-deploy, brief persona Rafael consolidado, escopo cirúrgico, CNPJ Hayzer 55.515.732/0001-06 + lembrete INPI segunda
17. **CNPJ CEO verificado** via Receita Federal pública: MEI ativo, CNAE 7319-0/99 publicidade. Plano: desenquadrar MEI → ME antes 1ª venda Calc Pro (Sem 3). Adicionar 4 CNAEs

## ❓ Perguntas CEO ainda NÃO respondidas (pra próxima sessão executar)

1. **Automatizar /clear + /rcs via hooks settings.json**: CEO perguntou se dá pra automatizar. Eu disse SIM (hooks SessionStart/UserPromptSubmit/Stop), mas NÃO configurei. **Próxima sessão: Lia + Ricardo configuram hooks na Fase 1 Foundation amanhã.**
2. **Routine `claude-quota-monitor`**: CEO perguntou "se bater limite API e aí?". Dei 4 camadas de solução. NÃO criei a Routine 7. **Próxima sessão: criar Routine 7 quota-monitor diário 7:30 com fallback 4 camadas.**
3. **Routines adicionais identificadas mas NÃO criadas**: `sentry-incident-alert`, `supabase-backup-snapshot` (diário 02h), `deploy-health-check` (4h), `google-search-console-weekly` (pós-launch), `nps-beta-feedback` (pós-soft-launch). **Próxima sessão: avaliar criar essas 4 agora ou aguardar gatilhos.**
4. **Estudo Ybera Club INCOMPLETO**: capturei home + equipe direta + equipe completa + plano de carreira. **Faltou capturar**: Insights Instagram, Dashboard BI, Minhas Metas detalhe, Metas da Equipe, Relatórios, Material de Apoio, Ybera Academy, Central de Ajuda, Sacar/Transferir/Extrato detalhe, Loja Interna, Ybera.com loja externa. **Próxima sessão (se CEO logado ainda): continuar via Chrome MCP em app.yberaclub.com.**
5. **3 Routines spec manual pendentes**: `mercado-maker-mensal`, `waitlist-funnel-diario`, `anthropic-dev-tools-semanal` — CEO cria copia/colando spec de `automation/routines-specs-pending-2026-05-19.md`. **Próxima sessão: verificar se CEO criou + validar trig IDs.**
6. **Decisão sobre matar `waitlist-weekly-digest`**: redundante com `waitlist-funnel-diario` nova. CEO não confirmou explicitamente. **Próxima sessão: confirmar com CEO + deletar a antiga se OK.**
7. **Conectores das 3 routines criadas**: aparecem só "Google Drive" no display. **Próxima sessão: CEO verificar via UI se Sentry/Stripe/Supabase/Vercel realmente sumiram + adicionar se faltar.**

## 🔴 Blockers / Pendências críticas

- **3 Routines restantes** (mercado-mensal, waitlist-funnel-diario, anthropic-dev-tools): CEO cria amanhã copia/colando spec
- **Conectores das 3 routines criadas**: aparecem só "Google Drive" no display. Verificar amanhã se Sentry/Stripe/Supabase/Vercel realmente sumiram
- **INPI pagamento**: CEO ainda não decidiu pagar R$ 440 classe 42. Deadline GRU 13/06. Lembrete persistente salvo pra segunda 25/05
- **Chrome MCP travou múltiplas vezes** em claude.ai (mojibake nos acentos, screenshot timeout) — confirma memória `feedback_chrome_mcp_claude_dashboard_trava`
- **Modo hardwork validação**: agents NÃO commitam direto. Eu commito após Helena revisar diff. Memória `feedback_validacao_visual_obrigatoria` ativa

## 📐 Decisões registradas (ADRs)

- Sem ADRs novos formais nesta sessão (focou em pesquisa + execução, não arquitetura). Lia vai criar amanhã na Fase 1: ADR-016 (Calc Freemium model) + ADR-017 (Hayzer multi-vertical umbrella)

## 📦 Commits

```
ef6099c auto: claude session changes
b8a39c9 auto: claude session changes
5222cbe auto: claude session changes
875313b auto: claude session changes
b8df616 auto: claude session changes
ff4346e auto: claude session changes
b46b55a auto: claude session changes
a4b81e8 auto: claude session changes
ea4141e auto: claude session changes
d3400db feat(dashboard): aplicar 3 ajustes Diego pra puxar glow da landing
```

10 commits. 5148 inserções, 381 deleções. 34 arquivos modificados.

## 🔐 Itens de segurança a lembrar

- Schema `vertical_type` em `projects` ainda NÃO aplicado (Bruna faz Fase 1 amanhã)
- Migration `20260518_notifications_and_search.sql` JÁ aplicada (REVOKE/GRANT extras incluídos)
- `kpi-hero` class removida do CoverHero — validar visualmente em prod
- Auto-commit hook funcionando — não commita conscientemente, mas dispara automatico

## 🚀 Próximas ações (priorizadas)

1. **CEO cria 3 Routines restantes** copia/colando spec de `automation/routines-specs-pending-2026-05-19.md` (~15min)
2. **CEO verifica conectores** das 3 routines criadas (Sentry/Stripe/Supabase/Vercel) e adiciona se faltar
3. **Helena dispara Fase 1 Foundation amanhã 8h** (Bruna, Diego, Lia, Ricardo, Otávio)
4. **Helena dispara Fase 2 Build amanhã 13h** (Carla, Felipe, Sofia, Ana, Paulo)
5. **Helena dispara Fase 3 Reach amanhã 18h** (Marcos, Joana, Júlia)
6. **Eu reporto CEO** às 12h, 18h, 22h amanhã (digests cravados)
7. **Validar visualmente em prod** após cada Fase (Chrome MCP em hayzer.com.br)
8. **CEO decide INPI pagamento** classe 42 (segunda 25/05, lembrete persistente)
9. **CEO consulta contador** sobre desenquadrar MEI → ME (esta semana, sem urgência mas antes Calc Pro Sem 3)

## 👥 Agentes G7 envolvidos

- **Sofia** (ux/cs): UX Audit Landing — entregou 12 friction points priorizados
- **Marcos** (marketing): Concorrência maker BR — 8 concorrentes mapeados + posicionamento defensável
- **Joana** (community): 14 comunidades + glossário tribal + dores/desejos com quotes
- **External-researcher**: Mercado BR 2026 com 38 fontes verificadas
- **Helena** (estratégia): orquestração + síntese final brief
- **Lia** (docs): vai entrar amanhã Fase 1 (CLAUDE.md update + ADR-016 + ADR-017)
- **Felipe**: vai entrar amanhã Fase 2 (8 quick wins landing maker-focused)
- **Diego**: vai entrar amanhã Fase 1 (assets visuais maker)
- **Carla**: vai entrar amanhã Fase 2 (copy refeita persona Rafael)
- **Bruna**: vai entrar amanhã Fase 1 (schema vertical_type)
- **Ricardo, Otávio, Paulo, Ana, Júlia**: todos despachados nas fases amanhã

## 🧠 Aprendizados da sessão

### Padrões CEO observados

- **CEO odeia desperdício de R$/hora**: quase comprou novo domínio/marca/CNPJ pra Ybera SaaS. Eu identifiquei que Hayzer JÁ é multi-projeto. Economia: ~R$ 3-6k + 1 semana
- **CEO valoriza análise crítica HONESTA mais que opinião confirmatória**: pediu modo crítico 4+ vezes em decisões grandes. Quando recomendei "espera multi-tema set/2026", ele falou "vou lançar Beauty em seguida" e eu MUDEI minha posição. Honestidade > consistência
- **CEO quer transparência em erros**: quando errei parecer INPI 18/05, ele cobrou. Quando errei dashboard 19/05, ele cobrou. Resposta certa: admitir + corrigir + salvar memória
- **CEO tem fadiga emocional acumulada**: trabalha 8+ horas/dia. Risco de decisão ruim sob pressão. Solução: digests 3x/dia (12h, 18h, 22h) em vez de updates a toda hora
- **CEO usa Obsidian + canvas pra ENTENDER decisões**: pediu canvas visual da arquitetura. Texto longo não convence ele. Visual + tabelas = sim
- **CEO já tem CNPJ ativo** (55.515.732/0001-06) MAS é MEI com CNAE de publicidade. Precisa desenquadrar pra ME antes 1ª venda Hayzer (auto-propagação: Paulo + Lia)

### Erros cometidos (não repetir)

- **Não memorizei CNPJ do CEO que ele já mencionou várias vezes em sessões anteriores**. Falha grave de memória persistente. Corrigido: `project_empresa_cnpj.md` salvo com dados oficiais
- **Subdimensionei routines (3 inicialmente, depois 6+3 pós-launch)** — só percebi após CEO criticar
- **Subdimensionei agents G7 paralelo (8 inicialmente, são 17 no total)** — só após CEO apontar
- **Propus mexer em identidade Hayzer (verde petrol + raízes)** baseado em pergunta inicial dele sem antes auditar a landing pelos olhos de Rafael. Quase iniciei retrabalho de 100h. Salvo pela pesquisa profunda 5 agents que confirmou: ADICIONAR elementos maker, não REFAZER identidade
- **Chrome MCP em claude.ai trava — tentei 4 vezes** antes de pivotar pra spec manual. Memória `feedback_chrome_mcp_claude_dashboard_trava` reforçada (regra: 2 tentativas, depois pivot)
- **Não pensei em risco de quota Claude antes do CEO mencionar** — solução em 4 camadas adicionada (monitor + Helena failsafe + auto /rcs + tier de agents)

### Sucessos (repetir)

- **5 agents G7 em paralelo na pesquisa** entregaram material de qualidade superior ao que eu sozinho faria — Sofia (UX), Marcos (concorrência), External (mercado), Joana (comunidades), eu (YouTube). Padrão a manter pra próximas sessões grandes
- **Chrome MCP em sites que NÃO são claude.ai funcionou bem** (YouTube, hayzer.com.br, app.yberaclub.com). Trava só em claude.ai
- **Canvas Obsidian pra explicar arquitetura multi-vertical** funcionou — CEO confirmou "entendi"
- **Modo crítico antes de execução** evitou desperdício R$ 3-6k + 1 semana (insight de "Hayzer já é multi-projeto")
- **Ownership Matrix + fases sequenciais (manhã/tarde/noite)** = solução pra "agents pisarem em cima"
- **Pivotar pra spec manual quando Chrome MCP trava** ao invés de insistir = economia de contexto

### Conhecimento técnico novo

- **Routines no Anthropic**: vive em `claude.ai/code/routines`. Form tem Nome + Instruções + Repositório + Agendamento (Diário/A cada hora/Dias úteis/Semanal/Personalizado/Uma vez) + Conectores (default 5: Google Drive, Sentry, Stripe, Supabase, Vercel). Trig ID formato `trig_XX...`. Após criar, status "Ativo" + próxima execução visível. Quota Max plan = 15 execuções diárias incluídas
- **Receita Federal API pública** via `receitaws.com.br/v1/cnpj/<CNPJ>` retorna JSON com razão social, CNAE, opção MEI, situação. Sem auth, sem CAPTCHA
- **ZoomCalc3D existe e é GRÁTIS** (concorrente direto Calc Pro Hayzer R$ 37) com IA Gemini, multi-material, ROI/payback, CSV, WhatsApp. Lançada 2025-2026. Implicação: Calc Pro precisa virar ISCA Freemium
- **Padrão SaaS multi-vertical dominante**: umbrella + sub-marcas (Hubspot, Adobe, Salesforce, Microsoft). Não é Notion-style (1 marca pra tudo). Hayzer segue umbrella

### Conhecimento de domínio

- **Persona Rafael consolidada**: 28-42 anos, faixa densa 30-38, homem 80%+, interior SP/grande SP/capital Sul-Sudeste. Frustração não verbalizada: "não sei o que sobra de verdade no fim do mês". Sonho: "ser pequeno mas profissional". Paradoxo R$: investe R$ 8k hardware sem pestanejar, hesita em R$ 40/mês software
- **Gap competitivo defensável Hayzer**: nenhum dos 8 concorrentes integra WhatsApp ou DM Instagram (60-80% das vendas do Rafael). Janela competitiva: 6-8 meses
- **Mercado BR maker 3D 2026**: TAM 150-400k donos, 22-120k comercializam. CAGR 18-22%. Faturamento típico maker R$ 2-5k/mês com 1 máquina, ROI 3-6 meses
- **Top influenciadores maker BR**: Cotrim13D (562k YT/145k IG), 3D Geek Show Murilo (127k IG, melhor fit), 3D Print Academy Oswaldo (50k IG, audiência paga curso = early adopters)
- **Vocabulário tribal maker BR**: filamento, PLA, PETG, Bambu, Ender, AMS, bed, fila, layer, infill, marketplace, taxa Shopee, WhatsApp direto, chargeback, spaghetti (falha), warping. NUNCA usar: "renda fácil", "lucro garantido", "máquina de fazer dinheiro"
- **Ybera Club estrutura** (referência Hayzer Beauty futuro): sidebar Lojas + Financeiro + Rede + Performance + Suporte. Sistema RPG (Iniciante → Embaixadora Oceania R$ 15M). Limite 20 indicações diretas. Multi-nível com drill-down de sub-gestoras. Ativação mensal (Ativos/Inativos). Premiação progressiva (Meta 1 cupom → Meta 3 R$ 100). Sem IA, sem comunidade interna, visual datado = oportunidades pra Hayzer Beauty melhorar
- **Modelo cobrança Hayzer Beauty proposto**: Gestora paga assinatura (R$ 197-497/mês), afiliadas usam grátis sob gestora dela. Plano R$ 197 = até 10 afiliadas, R$ 297 = até 30, R$ 497 = ilimitado + features premium
