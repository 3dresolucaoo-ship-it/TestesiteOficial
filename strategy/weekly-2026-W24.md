# Status Semanal — 2026-W24

**Sexta 12/06/2026 · 17h BRT**
**Soft launch: AMANHÃ 13/06 · Launch público: 27/06 (15 dias)**
**Autora**: Helena (Diretora de Estratégia G7)

> STATUS DE ALERTA. Leitura obrigatória antes de qualquer ação hoje à noite.

---

## 1. Progresso da semana (commits classificados)

Apenas **3 commits** em main nos últimos 7 dias. Volume baixo — semana focada em segurança.

| Hash | Data | Tipo | Descrição |
|---|---|---|---|
| `78bac11` | 06/06 | **BUG CRÍTICO** (security) | Hardening OWASP — SEC-0 price-shopping fechado, SEC-4 cron fail-closed, catálogo público com admin client, migration 20260606 |
| `9a06284` | 06/06 | doc/decisão | ADR-034 — plano mestre launch + status auditoria OWASP (fonte permanente do plano) |
| `07cc8c0` | 10/06 | infra/monitoring | Error-scan 12/06 — 21º dia consecutivo sem `VERCEL_API_TOKEN` |

**Classificação**: 1 fix de segurança crítica, 1 ADR, 1 log de monitoramento. Zero features novas entregues na semana.

### Contexto: o que a semana fez de real

O commit `78bac11` foi o mais importante do ciclo. A auditoria OWASP de 4 camadas (3 auditores + red team) encontrou um vetor que as auditorias anteriores perderam: **price-shopping cross-merchant** — atacante podia trocar o `productId` na URL e comprar produto caro pelo preço de barato, ou poluir pedido de outro maker. Corrigido em checkout, encomenda, catálogo e webhook. Isso estava em prod. Correto fechar antes do soft launch.

---

## 2. Progresso no roadmap

**Fase ativa**: Semana 5 do ROADMAP (10-16/06 — Admin Completo), com pendências críticas da Semana 4 ainda abertas.

### Itens planejados para a semana (Semana 5 ROADMAP)
- [ ] Rota `/admin` protegida (flag is_admin)
- [ ] Lista de usuários com filtros
- [ ] Perfil individual de user + ações
- [ ] Lista de waitlist com export CSV
- [ ] Métricas: signups, conversão, MRR, churn
- [ ] Tabela `audit_log` + helper `services/auditLog.ts`
- [ ] Email em massa por segmento

**Entregues esta semana**: 0 de 7 itens do ROADMAP Semana 5. O foco foi na auditoria de segurança (correto dado o soft launch).

### O que realmente importa pro launch (ADR-034, tarefas 5-9)
- [ ] **Task 5** — Golden path ponta-a-ponta: `createOrder` chamar `processNewOrder` (produção + estoque + financeiro numa ação) — **PRÓXIMA AÇÃO, não entregue**
- [ ] Task 6 — SW v2 (mata landing branca, remove hotfix CSS)
- [ ] Task 7 — Google login OAuth
- [ ] Task 8 — Mini-tela admin "Founding Makers"
- [ ] **Task 9** — Ações CEO: rotacionar service_role, leaked password, Stripe sandbox, Discord/Sentry DSN, Google OAuth config, INPI, convidar fundadores

**Estimativa**: ~15-20% das pendências pré-launch entregues esta semana (apenas segurança crítica fechada).

---

## 3. Blockers

### BLOCKER 1 — CRÍTICO · Golden path ponta-a-ponta não existe
**Impacto**: O soft launch amanhã (13/06) está posicionado como "o único SaaS onde pedido vira produção, baixa estoque e lança no financeiro sozinho." Esse fluxo (`createOrder` → `processNewOrder`) não está implementado. Task 5 do ADR-034 está na fila mas não foi executada. Se o CEO demonstrar o produto para os 3-5 founding makers amanhã sem esse fluxo, o diferencial central não existe na prática. Decisão necessária: adia demonstração do golden path ou executa Task 5 hoje à noite.

### BLOCKER 2 — CRÍTICO · Monitoramento zerado há 21 dias
**Impacto**: `VERCEL_API_TOKEN` ausente desde 22/05. Issue #23 aberta com 21 comentários sem resolução. O Sentry DSN também não está configurado em prod (confirmado via Sentry MCP — projeto `hayzer-prod` existe mas zero eventos). O produto entra em soft launch amanhã **sem nenhuma cobertura de monitoramento**. Erros nos 13 Server Actions deployados em 01-03/06 (Orders, Leads, CRM, Inventory, Finance, Production, Products) não estão sendo capturados. Ação: 10 minutos para resolver — ver issue #23.

### BLOCKER 3 — CRÍTICO · Migration `20260606_security_hardening_owasp.sql` status incerto
**Impacto**: O commit `78bac11` indica que a migration foi "aplicada via MCP" mas o arquivo está no repo como documentação. ADR-034 diz "NÃO rodar `supabase db push` (duplicaria)." O status real em prod precisa de confirmação antes do soft launch — se não foi aplicada, os grants de segurança (anon sem acesso a estoque/produtos, `process_webhook_atomic` só para service_role) não estão ativos.

### BLOCKER 4 — CRÍTICO · Funil waitlist morto
**Impacto**: Routines de monitoramento mostram que o último lead real foi em 23/05 — **19 dias sem conversão**. Total acumulado: 3 leads (2 reais + 1 teste QA). Taxa de qualificação etapa 2: 0%. UTM tracking: 100% nulo (bug no formulário — params UTM não chegam ao Supabase). Email sequence: 0 emails confirmados. O soft launch vai precisar de abordagem ativa (WhatsApp direto) em vez de depender do funil orgânico.

### BLOCKER 5 — ALTO · Bug auth-js getSession 20s sem resolução em 9+ dias
**Impacto**: Confirmado em prod via Chrome MCP em 03/06. `[Auth] getSession timed out — unblocking UI` aparece 5x antes da hidratação. Workaround estrutural (Server Actions cookie-based) foi implementado para writes, mas o cold-start de 20s no primeiro acesso ainda afeta a experiência dos founding makers. Tracking em [[hayzer-auth-bug-supabase-2106]]. Nenhum commit de correção nos últimos 9 dias.

### BLOCKER 6 — ALTO · INPI GRU com deadline hoje
**Impacto**: Pendência `decisions/pending-inpi-busca-profunda-pre-pagamento.md` — deadline das GRUs era **13/06** (amanhã/hoje). R$ 880 a pagar (R$ 440 classe 35 + R$ 440 classe 42). A reverificação no pePI INPI (checklist no arquivo pending) ainda não foi executada. Se o CEO não pagar até hoje, perde a janela e precisa de nova GRU. Risco financeiro direto.

---

## 4. Plano próxima semana (13-19/06)

Prioridade absoluta: **soft launch** acontece amanhã, semana que vem é de coleta de feedback e correções.

1. **Task 5 ADR-034** — Implementar golden path ponta-a-ponta (`createOrder` → `processNewOrder` com side effects produção + estoque + financeiro). Se não feito hoje, é a primeira coisa da semana que vem.
2. **VERCEL_API_TOKEN + Sentry DSN** — Configurar antes de qualquer sessão de usuário real. 10 minutos de ação CEO.
3. **Fix UTM tracking** — Formulário waitlist não captura params UTM. Bruna pode resolver em 1-2h. Sem isso, impossível medir aquisição dos founding makers.
4. **Task 7** — Google login OAuth (paridade competitiva com Cordeiro Flow — identificado na pesquisa 06/06 como diferença percebida pelos makers).
5. **Coleta estruturada de feedback 13-17/06** — Sofia prepara roteiro de entrevista pra sessão com os 3-5 founding makers. Foco: golden path, primeiro pedido, impressão geral.

---

## 5. Decisões pendentes pro CEO

1. **INPI GRU — pagar hoje ou amanhã** (deadline 13/06, R$ 880 PIX). Reverificar pePI INPI antes (15 min via external-researcher + `/council`). Arquivo: `decisions/pending-inpi-busca-profunda-pre-pagamento.md`.

2. **Soft launch 13/06 — escopo real do demo**: mostrar produto completo ou só calculadora + catálogo? Golden path ponta-a-ponta não está pronto (Task 5). Se demonstrar o diferencial central sem a feature funcionar, cria promessa falsa com founding makers. Opções: (a) adia golden path demo pra 18/06 e faz soft launch focado em calculadora + catálogo; (b) executa Task 5 hoje à noite antes do soft launch.

3. **VERCEL_API_TOKEN + Sentry DSN** — ação de 10 minutos pendente há 21 dias. Não tem decisão arquitetural, só ação manual. Configurar antes de dormir hoje.

4. **Migration 20260606** — confirmar se foi aplicada em prod. Se não foi, os vetores de segurança OWASP que foram "corrigidos" em `78bac11` podem não estar ativos no banco.

---

## 6. Alertas de bugs críticos

### BUG P0 — auth-js getSession 20s cold start (9 dias sem commit de correção)
Tracking: [[hayzer-auth-bug-supabase-2106]] · Encontrado: 03/06 · Última ação: workaround parcial (Server Actions) · Sem commit de correção definitiva nos últimos 9 dias. **Founding makers vão sentir isso amanhã.**

### BUG INFRA — VERCEL_API_TOKEN (21 dias consecutivos)
Issue #23 com 21 atualizações, sem resolução. 21 dias de monitoramento cego em prod.

### BUG SILENCIOSO — UTM tracking nulo (19+ dias)
Todos os leads têm `utm_source = NULL`. Aquisição dos founding makers será impossível de rastrear por canal se não for corrigido antes do soft launch.

---

## 7. Notas da Helena

Esta semana fez o certo: fechar a segurança crítica antes de abrir para usuários reais. O hardening OWASP de `78bac11` era obrigatório e foi bem executado. Não tem nada a questionar aí.

O que preocupa é o padrão que está se formando nas últimas 3 semanas: muita automação de rotinas gerando PRs e arquivos de monitoramento, poucos commits de produto entregue. De W22 pra W24 o número de PRs automáticos abertos (rotinas de smoke-test, intel competitiva, digest waitlist, PR review bot) dobrou — enquanto os commits em main ficaram em 3 esta semana. Isso não é problema de processo, é sintoma de bandwidth: as rotinas estão rodando, mas o produto central ainda tem gaps reais antes do soft launch.

O ponto mais crítico desta sexta: o soft launch é amanhã e o golden path que define o posicionamento ("ponta-a-ponta de verdade") não existe funcionalmente. Isso é uma escolha que o CEO precisa fazer hoje, com clareza, não às 23h depois de tentar implementar. A decisão de escopo do demo vale mais do que qualquer commit esta noite.

Dois números pra ficar na cabeça: 3 leads reais no funil (último há 19 dias) e 21 dias sem monitoramento ativo. O produto pode estar funcionando perfeitamente em prod e não sabemos — porque o token não foi configurado. Isso é o tipo de risco que não tem desculpa técnica.

---

*Helena · G7 Hayzer · Status gerado sexta 12/06/2026 17h BRT*
