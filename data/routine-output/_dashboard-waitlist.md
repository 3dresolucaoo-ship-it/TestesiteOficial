# Dashboard Waitlist Hayzer
_Atualizado automaticamente todo dia_

---

## 2026-05-21

**STATUS: EXECUCAO BLOQUEADA -- sem acesso ao DB neste contexto**

Subagente `ana-analytics` nao tem credenciais Supabase disponíveis como env vars do shell neste contexto de execucao. As credenciais vivem no Vercel e no MCP Supabase configurado no Claude Code principal.

### Queries adaptadas para o schema real

A tabela `waitlist_leads` NAO tem coluna `step` nem `step2_at`. Etapa 2 e identificada por campos de qualificacao preenchidos.

**Q1 -- Leads 24h por UTM (adaptada):**
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

**Q3 -- Crescimento 7 dias:**
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

**Q4 -- Tempo medio step1 -> step2 (proxy via updated_at):**
```sql
SELECT 
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/60) 
    FILTER (WHERE segment IS NOT NULL AND updated_at > created_at) 
    as avg_minutes_to_step2
FROM waitlist_leads 
WHERE created_at > NOW() - INTERVAL '24 hours';
```

**Q5 -- Top UTMs acumulado:**
```sql
SELECT utm_source, COUNT(*) as total
FROM waitlist_leads 
GROUP BY utm_source
ORDER BY total DESC
LIMIT 5;
```

**Q6 -- Media diaria 7d:**
```sql
SELECT ROUND(COUNT(*) / 7.0, 1) as avg_daily_7d
FROM waitlist_leads 
WHERE created_at > NOW() - INTERVAL '7 days';
```

### Como executar

1. Abrir Supabase Dashboard > SQL Editor
2. Colar cada query acima
3. Executar com permissao service_role

OU rodar este digest via Claude Code principal (com MCP Supabase ativo no contexto correto).

---
