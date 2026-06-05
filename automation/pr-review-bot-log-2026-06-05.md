# Log PR Review Bot — 05/06/2026 tarde

Ciclo automatico de revisao de PRs. Executado ~16h BRT (19h UTC).

## PRs vistos

- 29 PRs abertos no total
- 5 nao-draft (candidatos ativos): #115, #51, #50, #49, #48
- 24 drafts Routine (`claude/*`, `study/*`) — processados apenas no Passo 3

## Acoes executadas

### Passo 2 — Revisao (nao-draft)

**0 PRs comentados** — todos 5 nao-draft ja tinham comentario do bot (replay protection)
- #115, #51, #50, #49, #48: skipped

**0 PRs auto-merged** — tipo Dependabot; nao elegivel

### Passo 3 — Deadline 48h

**6 PRs fechados por timeout (>72h, sem /extend):**
- #101 `feat(g7): rotina concorrencia-diaria 2026-06-02` — criado 02/06 00:09 (~85h) — tinha label
- #102 `monitoring: error-scan 2026-06-02` — criado 02/06 01:08 (~85h) — tinha label
- #104 `ops: smoke test diario 02/06` — criado 02/06 09:10 (~81h) — tinha label
- #105 `chore(automation): log PR Review Bot 2026-06-02 manha` — criado 02/06 11:08 (~80h) — sem label (caiu pelas frestas)
- #106 `chore: digest waitlist diario 2026-06-02` — criado 02/06 11:12 (~80h) — sem label (caiu pelas frestas)
- #107 `study: G7 semanal 2026-06-02` — criado 02/06 12:20 (~79h) — tinha label (aviso ciclo 04/06 tarde)

**4 PRs avisados >48h (label `auto-close-em-24h` + comentario):**
- #108 `chore(automation): log PR Review Bot 2026-06-02 manha` — criado 02/06 19:11 (~72h — borda)
- #109 `chore(research): rotina concorrencia maker 3D BR 2026-06-03` — criado 03/06 00:12 (~67h)
- #110 `monitoring: error-scan 2026-06-03` — criado 03/06 01:08 (~66h)
- #111 `research: pesquisa competitiva semanal maker 3D BR` — criado 03/06 01:18 (~66h)

## PRs Dependabot pendentes (aguardam revisao humana)

| PR | Pacote | Risco | Recomendacao |
|---|---|---|---|
| #115 | patches group (next 16.2.7, react 19.2.7, @supabase/ssr 0.10.3, resend 6.12.4) | Medio | Merge com leitura rapida |
| #51 | posthog-js 1.374.2→1.376.0 | Medio | Merge com leitura rapida |
| #50 | @hookform/resolvers 5.2.2→5.4.0 | Medio | Merge com leitura rapida |
| #49 | framer-motion 12.39.0→12.40.0 | Medio | Merge com leitura rapida |
| #48 | @types/node v20→v25 | Alto | Merge com revisao detalhada — rodar `tsc --noEmit` antes |

## Nota operacional

PRs 105 e 106 (criados 02/06 manha) nao receberam aviso de 48h nos ciclos anteriores — provavelmente abertos poucos minutos antes do corte do ciclo 02/06 manha e nao alcancados. Fechados diretamente por >72h neste ciclo.
