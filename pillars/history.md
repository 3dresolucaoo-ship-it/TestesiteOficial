# Pilares — Histórico de mudanças de score

> Formato: `data | pilar | score anterior → novo | razão | ação tomada`
> Criado em: 2026-06-01 (revisão semanal 26/05–01/06)

---

## 2026-06-01 — Revisão semanal (commits 26/05–01/06)

| Data | Pilar | Anterior → Novo | Razão | Commits |
|---|---|---|---|---|
| 01/06 | P11 Backend | 8.0 → **8.5** | Skeleton eternal fix em /crm /orders /production + auth timeout robusto + Server Actions golden path validado em SQL prod (lead.converted_order_id bidirecional) + D&D kanban Server Action | `2072be4` `5f0a1f4` `386ceb6` `9164f8a` |
| 01/06 | P12 Estratégia | 8.3 → **8.5** | ADR 031 ACCEPTED com evidência de prod. Decisão arquitetural Server Actions como path de writes. Meta 30d atingida. | `8baf7f4` |
| 01/06 | MÉDIA | 8.0 → **8.1** | Resultado dos dois movimentos acima | — |

---

## 2026-05-29 — Sessão Bloco 2 (plano focar-qualidade)

| Data | Pilar | Anterior → Novo | Razão | Commits |
|---|---|---|---|---|
| 29/05 | P5 Acessibilidade | 6.5 → **7.0** | Wizard 4 steps aria-modal + focus trap (tab loop + escape + initial focus) + 7 empty states P1 com role="status" | `1b7702f` |
| 29/05 | P7 Conversão | 6.5 → **6.8** | Wizard 4 steps reduz fricção primeira ação (CEO→meta→projeto). PostHog ativo. Funil real pendente medição em prod (Bloco 4). | `1b7702f` |
| 29/05 | MÉDIA | 7.9 → **8.0** | Resultado dos dois movimentos acima | — |

---

## 2026-05-20/21 — Operação noturna G7 (10 agentes paralelos)

| Data | Pilar | Anterior → Novo | Razão |
|---|---|---|---|
| 20-21/05 | P2 Anti-IA | 9.0 → **9.3** | Carla search-replace voce→tu em 17 arquivos. *(Nota: CEO reverteu pra voce em 26/05 — ver weekly-2026-06-01.md)* |
| 20-21/05 | P3 Segurança | 9.2 → **9.3** | ADRs 025+026 como specs documentadas |
| 20-21/05 | P4 Performance | 7.0 → **7.5** | LazyMotion + posthog lazy + requestIdleCallback (TBT -78% confirmado Lighthouse 29/05) + 36 PNGs→WebP |
| 20-21/05 | P7 Conversão | 6.5 → **7.0** | Wizard 788 linhas + empty states + landing spec v2. *(Nota: reajustado pra 6.5 base no cálculo Helena 29/05)* |
| 20-21/05 | P8 Retenção | 5.0 → **5.5** | Tela /customers V4 + customersService LTV (branch, não merged) |
| 20-21/05 | P12 Estratégia | 8.0 → **8.3** | INPI Hayzer LIVRE + MP OAuth root cause (ADR-027) + ADR-028 proposto |

---

## 2026-05-17 — Sessão Tier 1 segurança + V4.3 design

| Data | Pilar | Anterior → Novo | Razão |
|---|---|---|---|
| 17/05 | P1 Design | 8.5 → **9.0** | V4.3 + paleta HSL 8-10 shades (50 tokens petrol/fog/ember/night/sand) |
| 17/05 | P3 Segurança | 8.5 → **9.3** | Tier 1 100%: Zod APIs finance+payment + CSP report-only + rate-limit DB-based + API_RATE_LIMIT_SALT em prod |
| 17/05 | P9 Pagamento | 7.5 → **8.5** | Transaction atômica webhook (RPC process_webhook_atomic) + tabela webhook_events UNIQUE |

---

*Mantido por: Helena (estratégia consolida) · Sistema de monitoramento automático*
