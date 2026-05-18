# Hayzer — Histórico de Movimentos por Pilar

> Cada linha = uma mudança confirmada (score subiu ou caiu) com evidência concreta.
> Propostas não confirmadas ficam no relatório semanal, não aqui.

---

## Formato

`YYYY-MM-DD | Pilar | Anterior → Novo | Commit(s) | Razão | Owner`

---

## 2026-05

| Data | # | Pilar | Anterior | Novo | Delta | Commit | Evidência | Owner |
|---|---|---|---|---|---|---|---|---|
| 2026-05-17 | — | Sistema criado | — | baseline 6.9 | — | `3a52c94` | Primeira versão do SCORES.md | Helena |
| 2026-05-17 | 9 | Pagamento | 7.5 | **8.5** | +1.0 | `38b517e` | RPC `process_webhook_atomic` + tabela `webhook_events` UNIQUE + migration prod | Paulo + Bruna |
| 2026-05-17 | 1 | Design | 7.5 | 8.5 | +1.0 | `c019409` | V4.4–V4.8: warm light, glow petrol, raízes marrom, ambient cocoa — CEO recalibrou honesto | Diego |
| 2026-05-17 | 2 | Anti-IA | 7.5 | 8.5 | +1.0 | `c019409` | Paleta humanizada, fix PT-BR coloquial, ícone raíz — CEO calibrou (9.0 seria vanity antes React) | Carla + Diego |
| 2026-05-17 | 1 | Design | 8.5 | **9.0** | +0.5 | `37a6a12` | Paleta HSL 75 tokens Diego: 50 lineares (petrol/fog/ember/night/sand) + 25 matrix sand 5×5 | Diego |
| 2026-05-17 | 3 | Segurança | 7.0 | **8.5** | +1.5 | `ea794ec` | Tier 1 fechado: Zod 4 schemas, CSP report-only, rate-limit DB-based 3 endpoints, 2 migrations prod | Otávio |
| 2026-05-17 | — | MÉDIA | 6.9 | **7.3** | +0.4 | `86c6aae` | Recálculo pós-movimentos do dia | Helena |

---

## Pendentes de validação CEO (score proposto, não confirmado)

| Proposta | Pilar | Score atual | Proposto | Condição para confirmar |
|---|---|---|---|---|
| Anti-IA 9.0 | 2 | 8.5 | 9.0 | Felipe converte React com SVG autoral + tracking variado preservados (20/05+) |
| Documentação 8.5 | 10 | 8.0 | 8.5 | CEO valida ADR-014/015 + routines-specs + changelog Anthropic como evidência suficiente |
| Estratégia 8.0 | 12 | 7.5 | 8.0 | CEO valida ADRs + roadmap atualizado + chain-link analysis feito |

---

*Atualizado em: 2026-05-18 (revisão semanal inaugural)*
