# Digest Semanal da Waitlist — 2026-05-24

> Gerado automaticamente · Referência: semana 18/05 a 24/05/2026  
> Fonte: tabela `waitlist_leads` · Supabase projeto `sqyrkisnllrgylnxwudu`  
> **Não fazer auto-merge — aguardar validação CEO**

---

## Resumo Executivo

| Métrica | Valor |
|---|---|
| **Total de leads** | 3 |
| **Novos últimos 7 dias** | 2 |
| **Taxa conversão step1 → step2** | 100% (3/3 com WhatsApp preenchido) |
| **E-mails confirmados** | 0 (0%) |
| **Leads convertidos em usuário** | 0 |
| **Score médio** | 0.0 |
| **Mobile / Desktop** | 1 (33%) / 2 (67%) |

Base ainda em volume muito baixo (3 leads totais) — os percentuais devem ser lidos com cautela. Tudo aponta para leads da operação interna/teste de produção, não aquisição orgânica real ainda.

---

## Top 3 UTM Source

| UTM Source | Leads |
|---|---|
| *(sem dados)* | — |

Nenhum lead chegou com `utm_source` preenchido. **O tracking de aquisição não está sendo capturado** — ver seção Alertas.

---

## Top 3 Segmentos

| Segmento | Leads |
|---|---|
| *(sem dados)* | — |

Campo `segment` vazio em 100% dos leads. O form da waitlist não está coletando esse dado — ver seção Alertas.

---

## Top 3 Estados BR

| Estado | Leads |
|---|---|
| **PR (Paraná)** | 3 |

100% dos leads estão no PR (detectado via IP). Consistente com perfil maker brasileiro concentrado no Sul.

---

## 10 Leads Mais Recentes

*(Anonimizados: apenas primeiro nome + cidade)*

| # | Primeiro nome | Cidade | Data de entrada |
|---|---|---|---|
| 1 | Gabriel | Londrina/PR | 2026-05-23 |
| 2 | *(entrada interna)* | Londrina/PR | 2026-05-20 |
| 3 | Gabriel | Londrina/PR | 2026-05-15 |

> **Nota:** Lead #2 (inserido em 20/05, mesmo dia da sessão de hardwork) tem nome que sugere entrada de teste/monitoramento interno. Recomenda-se validar com o CEO se deve ser excluído do total ou mantido como lead válido.

---

## Alertas

### ⚠️ UTM source ausente em 100% dos leads

Nenhum lead chegou com UTM preenchido. Possíveis causas:
- Parâmetros UTM não estão sendo extraídos da URL no form da landing
- Leads entraram por acesso direto sem campanha ativa (esperado para volume de teste)

**Ação:** Antes do soft launch (11/06), verificar se `WaitlistForm` lê e persiste `utm_source/medium/campaign` da URL. Sem isso, todas as campanhas pagas e orgânicas do launch ficarão invisíveis.

---

### ⚠️ Campo `segment` zerado em 100%

O campo `segment` (ex: maker 3D / cosplay / brinde) está vazio em todos os leads. Se o form de step2 não coleta ou não persiste esse campo, perde-se uma das métricas mais valiosas de qualificação.

**Ação:** Verificar se o campo `segment` é exibido e salvo corretamente no step2 do `WaitlistForm`. Testar end-to-end antes do soft launch.

---

### ⚠️ Zero e-mails confirmados (`email_confirmed = false`)

Nenhum dos 3 leads confirmou o e-mail. O fluxo de double opt-in (link de confirmação) pode estar:
- Com e-mail de confirmação indo para spam
- Com `email_confirmed` não sendo atualizado via webhook/callback
- Ou simplesmente ainda não implementado de fato

**Ação:** Testar manualmente o fluxo completo: cadastro → receber e-mail → clicar link → verificar `email_confirmed = true` no DB.

---

### ⚠️ Score zerado em todos os leads

O campo `score` está 0.0 para todos. O sistema de lead scoring não está calculando ou sendo executado.

**Ação:** Verificar se há lógica de scoring implementada (service/trigger). Se ainda não existe, priorizar antes do launch público (27/06) para qualificar leads de beta.

---

### ℹ️ Volume baixo — 3 leads são dados de teste/soft-launch

Com apenas 3 leads no total, os percentuais deste digest refletem principalmente a fase de setup e não tráfego real. O digest se tornará operacionalmente relevante a partir de ~50 leads (pós soft launch 11/06).

---

## Próximos marcos para acompanhar

| Data | Marco |
|---|---|
| 11/06/2026 | Soft launch — início da aquisição real |
| 27/06/2026 | Launch público |
| 07/07/2026 | Primeiro digest pós-launch com volume significativo |

---

*Gerado por: sistema de digest semanal waitlist · Claude Code · hayzer.com.br*
