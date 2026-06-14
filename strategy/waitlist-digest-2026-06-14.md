# Waitlist Digest — 2026-06-14

> Gerado automaticamente · Supabase `waitlist_leads` · Revisão CEO: toda segunda 9h

---

## Resumo Executivo

| Métrica | Valor |
|---|---|
| Total de leads na waitlist | **3** |
| Novos últimos 7 dias | **0** |
| Confirmaram e-mail (step2) | **0 de 3** |
| Taxa conversão step1 → step2 | **0.0%** 🚨 |
| Status predominante | `new` (3/3) |

**Contexto**: Base ainda em fase de testes pré-soft-launch (13/06). Todos os 3 leads têm status `new` e nenhum confirmou e-mail — indica que o flow de confirmação ainda não foi ativado / testado em produção.

---

## Top 3 UTM Source

> (campo sem dados preenchidos — todos os registros com `utm_source = NULL`)

| Posição | Fonte | Total |
|---|---|---|
| — | *(sem dados)* | — |

**Nota**: O campo `utm_source` existe na tabela mas nenhum dos 3 leads possui valor. Verificar se o tracking está sendo enviado corretamente no formulário da landing (`/` e `/waitlist`).

---

## Top 3 Segmentos

> (campo sem dados preenchidos — todos os registros com `segment = NULL`)

| Posição | Segmento | Total |
|---|---|---|
| — | *(sem dados)* | — |

**Nota**: O campo `segment` existe mas não foi preenchido. Confirmar se o step2 do wizard coletava segmento e por que não chegou ao DB.

---

## Top 3 Estados (por IP)

| Posição | Estado (ip_region) | Total |
|---|---|---|
| 1º | PR — Paraná | 3 |

> Campos `estado` e `cidade` não existem como colunas diretas; usando `ip_region` e `ip_city` como equivalentes geográficos.

---

## 10 Leads Mais Recentes

> Dados anonimizados: primeiro nome + cidade. E-mail, telefone e sobrenome omitidos.

| # | Primeiro Nome | Cidade | Segmento | Entrada |
|---|---|---|---|---|
| 1 | Gabriel | Londrina | — | 2026-05-23 |
| 2 | Auditor | Londrina | — | 2026-05-20 |
| 3 | Gabriel | Londrina | — | 2026-05-15 |

> Total: 3 registros (base completa exibida).

---

## Notas de Schema

Campos solicitados que **não existem** na tabela e substituições adotadas:

| Campo Solicitado | Status | Substituto Usado |
|---|---|---|
| `step` | ❌ não existe | `email_confirmed` (boolean) |
| `step2_completed` | ❌ não existe | `email_confirmed` (boolean) |
| `estado` | ❌ não existe | `ip_region` |
| `cidade` | ❌ não existe | `ip_city` |

Campos existentes com dados zerados nesta semana: `utm_source`, `utm_medium`, `utm_campaign`, `segment`, `pain`, `revenue_band`.

---

## 🚨 ALERTAS

### ALERTA CRÍTICO: Taxa de conversão step1 → step2 em 0.0%

Taxa atual: **0.0%** · Threshold mínimo: **40%**

Nenhum dos 3 leads confirmou o e-mail (`email_confirmed = false` em todos).

**Ações recomendadas:**
1. Verificar se o e-mail de confirmação está sendo disparado (Supabase Auth → Email Templates)
2. Checar logs do cron `email-sequence` — pode estar silencioso em erro
3. Revisar copy do e-mail de confirmação (assunto pode estar caindo em spam)
4. Testar o flow completo: cadastro → recebimento do e-mail → clique no link → `email_confirmed_at` preenchido
5. Avaliar simplificação: remover confirmação obrigatória e deixar apenas campo `status = 'confirmed'` via webhook ou redirect

### ALERTA CRESCIMENTO: 0 novos leads nos últimos 7 dias

Soft launch foi **13/06** (ontem). Nenhum lead novo captado na semana pré-launch.

**Ações recomendadas:**
1. Verificar se formulário da landing está funcional em prod (POST `/api/waitlist`)
2. Confirmar que PostHog está capturando evento `waitlist_submit`
3. Checar se link de divulgação no grupo WhatsApp Beta foi enviado (tarefa CEO pendente)

---

## Histórico de Crescimento (últimas entradas)

```
2026-05-15  +1 lead  (Gabriel, Londrina)
2026-05-20  +1 lead  (Auditor, Londrina)
2026-05-23  +1 lead  (Gabriel, Londrina)
2026-06-14  +0 leads (digest desta semana)
```

---

*Próximo digest: 2026-06-21 · Gerado por sistema de digest automatizado · hayzer.com.br*
