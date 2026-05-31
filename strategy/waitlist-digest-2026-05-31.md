# Waitlist Digest — 2026-05-31

> Gerado automaticamente em 31/05/2026 · Fonte: tabela `waitlist_leads` · Próximo digest: 07/06/2026

---

## Resumo Executivo

| Métrica | Valor |
|---|---|
| Total de leads na base | **3** |
| Novos últimos 7 dias | **0** |
| Confirmaram e-mail (step 2) | **0 de 3** |
| Taxa conversão step1 → step2 | **0.0%** ⚠️ |
| Score médio | 0 |
| Status predominante | `new` (100%) |

**Situação geral**: base ainda em fase de seed. Os 3 leads são todos de Londrina/PR, com status `new` e score 0. Nenhum completou confirmação de e-mail. Não houve entrada nova na última semana.

---

## Top 3 UTM Source

> ⚠️ Campo não rastreado — `utm_source` nulo em 100% dos leads.

Nenhuma origem de tráfego registrada. Possíveis causas:
- Parâmetros UTM não sendo passados nos links de divulgação
- Formulário não capturando UTMs da URL
- Tráfego direto/orgânico sem campanha ativa

**Ação recomendada**: verificar se `utm_source` está sendo lido do `window.location.search` no formulário.

---

## Top 3 Segmentos

> ⚠️ Campo não preenchido — `segment` nulo em 100% dos leads.

Nenhum segmento registrado. Possíveis causas:
- Campo segment não existe no formulário atual (step 2 não mostrado)
- Leads saíram antes de completar o formulário completo

---

## Top 3 Estados (via IP)

| Estado | Leads |
|---|---|
| PR (Paraná) | 3 |

100% dos leads são do Paraná — consistente com o perfil do CEO (Londrina) e possível divulgação inicial em rede próxima.

---

## Leads Mais Recentes (anonimizados)

| # | Primeiro nome | Cidade | Segmento | Data entrada | Device |
|---|---|---|---|---|---|
| 1 | Gabriel | Londrina/PR | — | 23/05/2026 | mobile |
| 2 | ~~Auditor~~ ⚠️ | Londrina/PR | — | 20/05/2026 | desktop |
| 3 | Gabriel | Londrina/PR | — | 15/05/2026 | desktop |

> ⚠️ Lead #2 com nome "Auditor" é provável entrada de teste (data 20/05 coincide com sessão de auditoria). Recomendado excluir ou marcar `status = 'test'` para não contaminar métricas.

---

## Device Mix

| Device | Leads | % |
|---|---|---|
| desktop | 2 | 67% |
| mobile | 1 | 33% |

---

## 🚨 Alertas

### ALERTA 1 — CRÍTICO: Taxa de conversão 0% (threshold: 40%)

Taxa conversão step1 → step2 caiu para **0.0%** (0 de 3 leads confirmaram e-mail), muito abaixo do threshold de 40%.

**Ações imediatas:**
1. Verificar se e-mail de confirmação está sendo enviado (checar Supabase Auth logs / Edge Function de e-mail)
2. Checar se o link de confirmação na landing está funcionando
3. Testar fluxo completo com e-mail real: cadastro → recebimento do e-mail → clique no link
4. Se o e-mail não estiver chegando: verificar configuração SMTP/Resend no Supabase

### ALERTA 2 — ALTO: Nenhum lead novo nos últimos 7 dias

0 entradas na semana de 24/05 a 31/05. Com soft launch em **13/06** (13 dias), é urgente iniciar aquisição ativa.

**Ações imediatas:**
1. Postar no grupo WhatsApp Hayzer Beta (texto pronto com Marcos — pendente CEO)
2. Ativar PostHog para monitorar funil da landing
3. Compartilhar calc grátis como magnet de topo de funil

### ALERTA 3 — MÉDIO: UTM tracking não funcional

100% dos leads sem `utm_source`. Analytics de canal de aquisição cego.

**Ação**: adicionar captura de UTMs no submit do formulário da waitlist.

### ALERTA 4 — BAIXO: Lead de teste na base

Nome "Auditor" (20/05) provavelmente é entrada de teste. Recomendado marcar:
```sql
UPDATE waitlist_leads SET status = 'test' WHERE name ILIKE 'auditor%';
```

---

## Notas Técnicas

- Campo `step` / `step2_completed`: **não encontrado** — métrica de conversão usa `email_confirmed` como proxy
- Campo `estado`: **não encontrado** — substituído por `ip_region`
- Campo `cidade`: **não encontrado** — substituído por `ip_city`
- Campos `segment`, `size`, `revenue_band`, `pain`: existem na tabela mas todos nulos (step 2 não preenchido)
- Campos UTM (`utm_source`, `utm_medium`, `utm_campaign`): existem na tabela mas todos nulos

---

*Digest gerado pelo sistema automatizado · Hayzer — hayzer.com.br*
