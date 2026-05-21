# Protocolo Lighthouse -- Hayzer

> Gerado por Ana (Analytics) . 2026-05-21 . Modo hardwork noturno
> Lighthouse: 13.3.0 . Node: 24.15.0 . Prod: hayzer.com.br

---

## 1. Por que este protocolo existe

A landing tem TBT 3.6s medido em producao. Nenhuma rota interna autenticada foi medida sequer uma vez. Com launch 11/06 e usuario real testando no celular, rodar Lighthouse so na landing e como medir pressao de pneu so da roda dianteira esquerda: voce nao sabe se o carro vai virar.

---

## 2. URLs priorizadas

Ordenacao por criticidade para maker BR:

| Prioridade | URL | Justificativa |
|---|---|---|
| P0 | / | Ja medida. Baseline de referencia. TBT 3.6s. |
| P0 | /calculadora | Publica. Magnet eterno. Primeiro contato do maker. |
| P1 | /orders | Golden path 1. Rota mais rica em componentes V4. |
| P1 | /crm | Leads para conversao. Kanban LeadBoard. |
| P1 | /finance | Finance V4 com AbortController + lazy load. |
| P2 | /production | PrinterBoard + ElapsedTimer setInterval. |
| P2 | /inventory | 11 sub-componentes. Maior DOM do sistema. |
| P2 | /products | Menor risco, mas faz parte do baseline completo. |
| P3 | /dashboard | SSR + count-up animado ao mount. |
| P3 | /customers | Tela incompleta -- medir mesmo assim para baseline zero. |

Excluidas: /settings, /content, /decisions (menor frequencia no golden path).

---

## 3. O problema das rotas autenticadas

Problema central: Lighthouse CLI headless nao tem sessao Supabase. Ao acessar /orders, o middleware.ts redireciona para /login -- Lighthouse mede a tela de login, nao a rota real.

### A -- Cookie injection (RECOMENDADA para esta fase)

1. Login em hayzer.com.br no Chrome
2. DevTools -- Application -- Cookies -- hayzer.com.br
3. Copiar o par sb-*-auth-token
4. Colar em .env.lighthouse.local (nao commitado)

Limitacao: JWT expira em ~1h. CEO ou Bruna renovam antes de cada run.

### B -- Playwright login programatico (futura, pos-launch)

Custo ~2h Bruna. Prioridade Wave 1 pos-launch.

### C -- Desabilitar auth (DESCARTADA)

Risco de commitar sem auth. Nao usar.

Decisao desta fase: Abordagem A.

---

## 4. Throttling realista

| Perfil | Rede | CPU | Quando usar |
|---|---|---|---|
| mobile-br-realista | 4G 10Mbps, 40ms RTT | 4x slowdown | Default de TODAS as medicoes |
| mobile-br-pessimista | 3G 1.6Mbps, 300ms RTT | 6x slowdown | Rodada mensal + decisao de feature |
| desktop | Sem throttle | 1x | Referencia comparativa. Nunca e alvo. |

Flags CLI para mobile-br-realista:

    --throttling-method=simulate
    --throttling.rttMs=40
    --throttling.throughputKbps=10240
    --throttling.cpuSlowdownMultiplier=4
    --emulated-form-factor=mobile
---

## 5. Metas por rota

### Rotas publicas (/ e /calculadora)

| Metrica | Good | OK | Critico -- bloqueia deploy |
|---|---|---|---|
| LCP | menor 2.5s | menor 4.0s | maior 4.0s |
| TBT | menor 300ms | menor 600ms | maior 600ms |
| CLS | menor 0.10 | menor 0.25 | maior 0.25 |
| FCP | menor 1.8s | menor 3.0s | maior 3.0s |

Contexto atual: landing TBT 3.6s = zona critica. Se a regra ja existisse, o ultimo deploy nao teria ido pro ar.

### Rotas autenticadas (internas)

| Metrica | Good | OK | Investigar -- ticket Bruna |
|---|---|---|---|
| LCP | menor 3.0s | menor 5.0s | maior 5.0s |
| TBT | menor 400ms | menor 800ms | maior 800ms |
| CLS | menor 0.10 | menor 0.25 | maior 0.25 |
| FCP | menor 2.5s | menor 4.0s | maior 4.0s |

CLS acima de 0.1 em rota com skeleton = bug no layout shift pos-hidratacao, nao problema de carregamento.

---

## 6. Cadencia de medicao

| Fase | Frequencia | Trigger | Responsavel |
|---|---|---|---|
| Pre-launch (agora a 10/06) | 1x/semana -- sexta | Manual | CEO ou Bruna |
| Semana de launch (11-17/06) | A cada push a main | GitHub Action | CI |
| Pos-launch semana 1 (18-27/06) | Diario 8h BRT | Cron | CI |
| Pos-launch estaveis (pos-27/06) | 1x/semana | Cron | CI |
---

## 7. Triggers de alerta

### Bloqueia merge pra main (ativar apos semana de launch)
- LCP maior 4.0s em / ou /calculadora
- TBT maior 600ms em / ou /calculadora
- CLS maior 0.25 em qualquer rota

### Cria ticket para Bruna (nao bloqueia deploy)
- TBT maior 800ms em qualquer rota interna
- LCP maior 5.0s em qualquer rota interna
- FCP maior 4.0s em /orders ou /crm

### Alerta Ana no digest semanal
- Qualquer metrica que piorou mais de 20 por cento semana a semana

---

## 8. Scripts propostos

NAO executar ainda. Revisao Bruna antes de commitar. Arquivos em scripts/ aguardando revisao.

8.1 scripts/lighthouse-all.mjs -- criado junto com este protocolo (2026-05-21)

8.2 Adicionar ao package.json:
    lighthouse:all -- node scripts/lighthouse-all.mjs
    lighthouse:public -- LIGHTHOUSE_ONLY_PUBLIC=true node scripts/lighthouse-all.mjs

8.3 .env.lighthouse.local (NAO commitar):
    LIGHTHOUSE_SESSION_COOKIE=sb-<ref>-auth-token=<valor-devtools>
    LIGHTHOUSE_BASE_URL=https://hayzer.com.br

8.4 Adicionar ao .gitignore:
    .env.lighthouse.local
    audits/lighthouse/runs/
---

## 9. Integracao com PostHog e Vercel -- nao duplicar

| Ferramenta | Tipo | Quando usar |
|---|---|---|
| Lighthouse | Sintetico | Debug pre-lancamento, comparacao controlada |
| PostHog Web Vitals | Real User Monitoring | Pos-launch, maker BR real |
| Vercel Speed Insights | RUM simplificado | Dashboard rapido |

Leitura cruzada: se Lighthouse diz TBT 400ms mas PostHog P75 e 1.2s, o problema e variabilidade de carga (cold start Vercel ou latencia Supabase us-east-1 vs maker em SP). Diferenca maior que 2x = investigar cold start antes de otimizar codigo.

Regra: PostHog ja captura CLS/LCP/FID automaticamente. Ana le no PostHog. Nao criar evento custom para Web Vitals.

---

## 10. Baseline estimado (pre-medicao real)

Nao sao numeros medidos. Primeira rodada real (sex 24/05) substitui esta tabela.

| Rota | LCP estimado | TBT estimado | Risco principal |
|---|---|---|---|
| / | 3.5-4.5s | 3.6s (medido) | framer-motion + Zod WaitlistForm no first paint |
| /calculadora | 2.0-3.0s | 200-400ms | Componentes simples. Menor risco do sistema. |
| /orders | 3.0-5.0s | 500-1200ms | ModuleShell + useStoreModule + skeleton pos-hidratacao |
| /crm | 3.0-5.0s | 500-1000ms | Kanban board + multiplos LeadCard |
| /finance | 2.5-4.0s | 300-800ms | AbortController nao elimina TBT inicial |
| /production | 3.5-5.5s | 600-1500ms | ElapsedTimer setInterval comeca ao mount |
| /inventory | 4.0-6.0s | 800-2000ms | 11 sub-componentes, maior DOM do sistema |
| /dashboard | 3.0-5.0s | 400-900ms | count-up animado ao mount |

Hipotese principal: framer-motion nao tree-shakeado em rotas sem animacao pesada. Verificavel via next build --profile. Bruna confirma na primeira rodada.

---

## 11. O que NAO esta coberto

- Testes de carga (k6, Artillery) -- Wave 2 pos-launch
- Monitoramento de disponibilidade -- Ricardo configura pre-launch
- Sentry error tracking -- programado 17/06
- A/B de performance -- quando tiver volume real

---

## 12. Responsaveis e proximos passos

| Acao | Dono | Prazo |
|---|---|---|
| Adicionar .env.lighthouse.local e audits/lighthouse/runs/ ao .gitignore | Bruna | Antes de commitar scripts |
| Revisar e commitar scripts/lighthouse-all.mjs | Bruna | Semana 2 (22-26/05) |
| Adicionar entradas ao package.json | Bruna | Semana 2 (22-26/05) |
| Primeira rodada manual com cookie | CEO + Bruna | Sex 24/05 -- junto revisao Pillars |
| Interpretacao dos baseline reais | Ana | Imediatamente apos primeira rodada |
| GitHub Action semanal automatica | Ricardo | Semana 3 pre-launch |