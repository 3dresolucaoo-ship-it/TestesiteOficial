# PR Review Bot — Log 2026-05-21

**Hora**: 16h BRT  
**Ciclo**: tarde

---

## Resumo

| Metrica | Valor |
|---|---|
| PRs vistos | 13 |
| Candidatos (nao-draft) | 0 |
| Comentados | 0 |
| Auto-merged | 0 |
| Fechados por timeout | 2 |
| Avisos 48h enviados | 2 |
| Skipped | 13 |

---

## Detalhe

### Passo 1 — Candidatos
Todos os 13 PRs abertos possuem `isDraft=true`. Zero candidatos para avaliacao de risco (Passo 2).

### Passo 3 — Gestao de deadline 48h

| PR | Titulo | Idade | Acao |
|---|---|---|---|
| #1 | chore: log ciclo PR Review Bot 2026-05-18 | ~80h | **Fechado** (>72h, sem /extend) |
| #2 | pillars: revisao semanal 2026-05-18 (inaugural) | ~78h | **Fechado** (>72h, sem /extend) |
| #9 | monitoring: error-scan 2026-05-19 + pasta monitoring/ | ~66h | **Avisado** (>48h <72h, label auto-close-em-24h pendente) |
| #10 | study: G7 semanal 2026-05-19 — 12 agentes atualizados | ~55h | **Avisado** (>48h <72h, label auto-close-em-24h pendente) |

PRs #11–#20 com <48h de vida: sem acao necessaria.

### Observacao operacional
Label `auto-close-em-24h` nao pode ser adicionada via MCP disponivel neste ciclo — aviso textual nos comentarios serve como fallback. Proximo ciclo (08h 22/05) deve fechar #9 e #10 se nao houver `/extend`.
