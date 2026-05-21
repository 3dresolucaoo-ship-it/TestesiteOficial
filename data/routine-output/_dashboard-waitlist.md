# Dashboard Waitlist Hayzer
_Atualizado automaticamente todo dia_

---

## 2026-05-21

**STATUS: SEM ACESSO AO DB -- queries prontas para execucao manual**

O agente ana-analytics nao tem acesso ao Supabase neste contexto de execucao (MCP opera no processo principal do Claude Code, nao em subagentes). Queries validadas contra o schema real da tabela `waitlist_leads` (migration `20260513_waitlist_leads.sql`).

### Adaptacoes de schema

A tabela `waitlist_leads` NAO tem coluna `step` nem `step2_at`.
Etapa 2 e identificada por campos de qualificacao preenchidos: `segment`, `size`, `revenue_band`, `business_name`, `pain`.
Proxy de tempo step1->step2: `updated_at - created_at` (quando segment preenchido e updated_at > created_at).

### Queries para executar no Supabase Dashboard > SQL Editor

**Q1 -- Leads 24h por UTM source:**
```sql
SELECT 
  utm_source,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE segment IS NOT NULL 
    OR size IS NOT NULL 
    OR revenue_band IS NOT NULL 
    OR business_name IS NOT NULL) as completed_step_2
FROM waitlist_leads 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY utm_source
ORDER BY total DESC;
```

**Q2 -- Total acumulado:**
```sql
SELECT COUNT(*) as total_all_time FROM waitlist_leads;
```

**Q3 -- Crescimento 7 dias por dia:**
```sql
SELECT 
  DATE(created_at) as day,
  COUNT(*) as leads_day,
  COUNT(*) FILTER (WHERE segment IS NOT NULL 
    OR size IS NOT NULL 
    OR revenue_band IS NOT NULL 
    OR business_name IS NOT NULL) as completed_step_2
FROM waitlist_leads 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY day DESC;
```

**Q4 -- Tempo medio step1 -> step2 nas ultimas 24h (proxy via updated_at):**
```sql
SELECT 
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/60) 
    FILTER (WHERE segment IS NOT NULL AND updated_at > created_at) 
    as avg_minutes_to_step2
FROM waitlist_leads 
WHERE created_at > NOW() - INTERVAL '24 hours';
```

**Q5 -- Top 5 UTMs acumulado:**
```sql
SELECT utm_source, COUNT(*) as total
FROM waitlist_leads 
GROUP BY utm_source
ORDER BY total DESC
LIMIT 5;
```

**Q6 -- Media diaria ultimos 7 dias:**
```sql
SELECT ROUND(COUNT(*) / 7.0, 1) as avg_daily_7d
FROM waitlist_leads 
WHERE created_at > NOW() - INTERVAL '7 days';
```

### Como habilitar o digest automatico

Para que o digest rode sem intervencao manual, uma das opcoes abaixo:

1. **Executar via Claude Code principal** (com MCP Supabase ativo) chamando ana-analytics diretamente no processo principal, nao como subagente isolado.
2. **Adicionar .env.local** em `/home/user/TestesiteOficial/.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` -- nao commitar, ja esta no .gitignore.

---
