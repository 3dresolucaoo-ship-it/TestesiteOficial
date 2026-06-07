# Waitlist Digest Semanal — 2026-06-07

> Gerado automaticamente · Revisão CEO toda segunda-feira cedo
> Dados: Supabase `waitlist_leads` · Período: até 2026-06-07 18h BRT

---

## Resumo Executivo

| Métrica | Valor |
|---|---|
| Total de leads na waitlist | **3** |
| Novos últimos 7 dias | **0** |
| Completaram email confirmado (step2) | **0 de 3** |
| Taxa conversão step1 → step2 | **0.0%** |
| Status predominante | `new` (100%) |

> ⚠️ Volume ainda em fase pré-lançamento. Soft launch interno marcado pra **13/06** — semana que vem.

---

## Top UTM Sources

> Nenhum registro com `utm_source` preenchido — todos os leads vieram por tráfego direto ou orgânico sem rastreamento de campanha.

| Posição | Fonte | Total |
|---|---|---|
| — | (sem dados UTM) | — |

**Ação:** Garantir que os links de convite do WhatsApp Beta e qualquer post nas redes use UTM parametrizado (`?utm_source=whatsapp&utm_medium=beta&utm_campaign=soft-launch`).

---

## Top Segmentos

> Campo `segment` vazio em todos os 3 leads — nenhum completou o step de perfil do negócio.

| Posição | Segmento | Total |
|---|---|---|
| — | (campo não preenchido) | — |

**Hipótese:** Os leads entraram via step1 (e-mail) mas não avançaram para o formulário de qualificação. Correlaciona com taxa de confirmação 0%.

---

## Top Estados

| Posição | Estado (ip_region) | Total |
|---|---|---|
| 1 | PR (Paraná) | 3 |

> Todos os leads são geograficamente de Londrina/PR — consistente com a rede pessoal do CEO durante fase pré-launch.

---

## 10 Leads Mais Recentes (anonimizados)

| # | Primeiro Nome | Cidade | Segmento | Data Entrada |
|---|---|---|---|---|
| 1 | Gabriel | Londrina | — | 2026-05-23 |
| 2 | Auditor¹ | Londrina | — | 2026-05-20 |
| 3 | Gabriel | Londrina | — | 2026-05-15 |

> ¹ "Auditor" pode ser lead de teste interno — verificar se e-mail corresponde a conta do CEO.

*(Apenas 3 leads no total — todos exibidos acima.)*

---

## Análise de Qualidade dos Dados

| Campo | Status |
|---|---|
| `name` | ✅ Preenchido nos 3 leads |
| `ip_city` / `ip_region` | ✅ Capturado via geolocalização |
| `email_confirmed` | ❌ 0 de 3 confirmaram e-mail |
| `segment` | ❌ Não preenchido em nenhum |
| `utm_source` | ❌ Sem dados de campanha |
| `whatsapp` | Não auditado neste digest |
| `converted_at` | ❌ 0 conversões para usuário pago |

---

## 🚨 ALERTAS

### ALERTA CRÍTICO: Taxa de confirmação de e-mail em 0%

Taxa atual: **0.0%** — muito abaixo do threshold mínimo de 40%.

**Diagnóstico possível:**
1. E-mail de confirmação caindo em spam (verificar deliverability via Resend/SendGrid)
2. Fluxo de confirmação com bug (link quebrado, redirect errado pós-confirm)
3. Leads são todos testes internos sem intenção de confirmar

**Ação imediata:**
- Testar fluxo completo de confirmação em prod (cadastro → e-mail → clique → redirect)
- Checar logs Supabase Auth de e-mails enviados
- Validar template de e-mail de confirmação em mobile

### ALERTA: 0 leads novos na última semana

A waitlist está parada há 15 dias (último lead: 23/05). Com soft launch em **13/06 (6 dias)**, é necessário reativar a captação antes da data.

**Ação:**
- Usar texto do Post #1 do Marcos para grupo WhatsApp Beta
- Conferir se landing `hayzer.com.br` está convertendo (form de waitlist funcionando)

---

## Contexto Histórico

```
Semana anterior: n/a (primeiro digest gerado)
Baseline pré-launch: 3 leads (todos testes/rede pessoal)
Meta soft launch 13/06: 5–10 makers do grupo WhatsApp Beta
```

---

## Próximos Passos Recomendados

1. **Hoje (07/06)**: Testar fluxo de confirmação de e-mail end-to-end em prod
2. **08/06**: Disparar convites WhatsApp Beta com link UTM rastreado
3. **13/06**: Soft launch — meta captar 5–10 leads qualificados na semana
4. **Próximo digest**: 14/06 (pós soft-launch) — primeira leitura real de conversão

---

*Digest gerado por: sistema automático Hayzer · Dados: Supabase prod `sqyrkisnllrgylnxwudu`*
*Campos sem equivalente na tabela: `step`, `step2_completed`, `cidade` (nativo) → substituídos por `email_confirmed`, `ip_city`, `ip_region`*
