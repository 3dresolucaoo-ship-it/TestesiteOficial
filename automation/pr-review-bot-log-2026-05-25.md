# PR Review Bot — Log 2026-05-25

## Ciclo tarde — 16h10 BRT (19:10 UTC)

### Resumo
- **PRs vistos**: 27 abertos (22 draft filtrados, 5 candidatos Dependabot)
- **PRs comentados**: 5 (Dependabot #47, #48, #49, #50, #51)
- **Auto-merged**: 0
- **Fechados por timeout**: 2 (#25, #26)
- **Avisos 48h adicionados**: 3 (#30, #31, #32)
- **Skipped (replay protection / draft / <30min)**: 22

### PRs Dependabot avaliados

| PR | Pacote | Risco | Recomendacao |
|---|---|---|---|
| #47 | patches group (supabase-js 2.103→2.106, ssr, geist, rhf, @types/react) | Alto | Revisao detalhada |
| #48 | @types/node v20→v25 (major) | Alto | Revisao detalhada |
| #49 | framer-motion 12.39→12.40 | Alto | Leitura rapida |
| #50 | @hookform/resolvers 5.2.2→5.4.0 | Alto | Leitura rapida |
| #51 | posthog-js 1.374.2→1.376.0 | Alto | Leitura rapida |

### Fechamentos por timeout

| PR | Titulo | Motivo |
|---|---|---|
| #25 | chore(metrics): digest diario waitlist 22/05 | >72h, aviso 24/05 11h BRT sem /extend |
| #26 | chore(automation): log PR Review Bot 2026-05-22 manha | >72h, aviso 24/05 11h BRT sem /extend |

### Avisos 48h adicionados

| PR | Titulo | Criado | Idade |
|---|---|---|---|
| #30 | ops: smoke test diario 23/05 | 2026-05-23T09:06Z | ~58h |
| #31 | feat(rituals): digest diario waitlist + dashboard metricas | 2026-05-23T11:04Z | ~56h |
| #32 | chore(automation): log PR Review Bot 2026-05-23 manha | 2026-05-23T11:08Z | ~56h |

### PRs aguardando grace (24h, sem /extend)

| PR | Aviso postado | Grace expira |
|---|---|---|
| #27 | 25/05 11h BRT (manhã) | 26/05 11h BRT |
| #29 | 25/05 11h BRT (manhã) | 26/05 11h BRT |
| #30 | 25/05 16h BRT (tarde) | 26/05 16h BRT |
| #31 | 25/05 16h BRT (tarde) | 26/05 16h BRT |
| #32 | 25/05 16h BRT (tarde) | 26/05 16h BRT |

### Notas operacionais

- PR #48 (@types/node v20→v25): major bump — recomendado rodar `tsc --noEmit` antes de merge
- PR #47 (supabase-js 2.103→2.106): 3 minor versions — verificar changelog @supabase/auth-js
- Labels `auto-close-em-24h` nao aplicadas (labels nao existem no repo — ver dependabot error em PRs #47-51)
- PR #28 (`routine/status-weekly-2026-W21`) e PR #39 (`routine/waitlist-digest-2026-05-24`): prefix `routine/` nao qualifica como Routine per spec — excluidos do deadline rule

---
_Gerado por PR Review Bot — claude/awesome-turing-AZNYd_
