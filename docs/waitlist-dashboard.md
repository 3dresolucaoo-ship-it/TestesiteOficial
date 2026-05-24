# Waitlist Dashboard — Hayzer

> Arquivo de digest diário do funil de waitlist. Append diário automatizado via rotina Ana-analytics.
> Mantém últimos 30 dias. Formato: mais recente no topo.

---

## WAITLIST DIGEST 24/05/2026

**STATUS: DADOS INDISPONIVEIS -- ACESSO DB BLOQUEADO**

Hoje: N/D leads (N/D completaram etapa 2 = N/D%)
Acumulado: N/D leads totais
Crescimento 7d: N/D% vs semana anterior

UTM source (24h):
- N/D (sem acesso ao banco nesta execucao)

Tempo medio step1->step2: N/D min

Top 3 UTMs acumulado:
1. N/D
2. N/D
3. N/D

Tendencia: N/D vs media 7d (media: N/D leads/dia)

Acao recomendada:
- Causa raiz: ambiente sandbox nao tem .env.local com credenciais Supabase (arquivo nao e commitado, por seguranca). Para reabilitar digest automatico, o agente precisa de SUPABASE_ACCESS_TOKEN configurado no ambiente de execucao ou as queries devem ser rodadas manualmente no Supabase Dashboard. Ver queries prontas em /g7-app/data/routine-output/waitlist-funnel-2026-05-24.json.

Schema real confirmado (para referencia futura):
- Tabela: waitlist_leads (migration 20260513_waitlist_leads.sql)
- Proxy "completou etapa 2" = score >= 50 (coluna 'step' nao existe)
- Colunas relevantes: utm_source, utm_medium, utm_campaign, segment, score, created_at, updated_at

---

