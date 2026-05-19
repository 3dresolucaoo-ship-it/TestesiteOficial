# automation/ — Claude Code Routines

> O que mora aqui · status das routines · convencoes · issues

## O que tem aqui

- `routines-specs.md`: specs completas das routines criadas ate 18/05 (formato prompt + config)
- `routines-specs-pending-2026-05-19.md`: 3 specs manuais pendentes de criacao pelo CEO
- `pr-review-bot-spec.md`: spec detalhada da Routine de auto-revisao de PRs (Camada 3)
- `issues-squads-2026-05-18.md`: issues tecnicas por squad identificadas em 18/05

## Status atual das Routines (20/05/2026)

**Total ativas em prod: 13** (repo: `3dresolucaoo-ship-it/TestesiteOficial`)
**Quota**: ~109 runs/mes (~24% quota Max diaria de 15 runs/dia)

### Grupo A — Operacao base (5)

| Routine | Schedule | Trigger ID | Status |
|---|---|---|---|
| `audit-mensal` | 1x/mes | `trig_01DJwCxXJGSP3TLcifcyTqGw` | Ativa |
| `pillars-review-semanal` | segunda 9h BRT | `trig_01MC2qJxjr6ZC9VmyLSg4fz3` | Ativa |
| `estudo-g7-semanal` | terca 12h UTC | `trig_01AEL5ZnaF3Gu186Rinvdzuq` | Ativa |
| `pr-review-bot` | a cada 30min | `trig_01HQv1i6JB221jTSH88N33Dn` | Ativa |
| `status-semanal-helena` | sexta 17h BRT | `trig_014HjSvLPWCQxN7nSNNWoKGU` | Ativa |

### Grupo B — Monitoramento (2 + pendencias env var)

| Routine | Schedule | Trigger ID | Status |
|---|---|---|---|
| `waitlist-weekly-digest` | domingo 18h BRT | `trig_01JB2QGfrqfoYLnbtZc7V5Ry` | Ativa (aguardar validacao por `waitlist-funnel-diario` 2 semanas) |
| `vercel-logs-error-scan` | diario 22h BRT | `trig_0162e5SZs8NQMtzQZTRcdxvb` | Ativa (PENDENTE: setar `VERCEL_API_TOKEN` no dashboard) |

### Grupo C — Concorrencia (3, criadas 19/05)

| Routine | Schedule | Trigger ID | Status |
|---|---|---|---|
| `concorrencia-diaria-light` | diario 21h BRT | `trig_01Rzym6XH1DFBkaLkPQE8ARb` | Ativa |
| `concorrencia-semanal-deep` | terca 22h BRT | `trig_018m8v3FW656PkVtgwz3huY8` | Ativa |
| `comunidades-maker-semanal` | domingo 18:30 BRT | `trig_01RBHzDHiuVnbhW4mtwaEP3F` | Ativa (conectores CORRIGIDOS 20/05 — era so Google Drive, agora 5 conectores) |

### Grupo D — Monitoramento prod (3, criadas 20/05)

| Routine | Schedule | Trigger ID | Status |
|---|---|---|---|
| `waitlist-funnel-diario` | diario 8h BRT | `trig_01FYkwcEbHXPMtXEVroi44XP` | Ativa |
| `production-smoke-test` | diario 6h BRT | `trig_01WeoXnef3uwyNbGnRLgcEvd` | Ativa |
| `supabase-rls-policy-audit` | semanal segunda 9h | `trig_01N2VJa4My5NFVPbiVmvi4Bt` | Ativa |

## Sistema de revisao de PRs (Camadas 1+2+3)

- **Camada 1**: email GitHub (CEO watching repo) + push mobile opcional
- **Camada 2**: Claude verifica PRs pendentes no INICIO de cada sessao (memoria persistente)
- **Camada 3**: `pr-review-bot` auto-mergeia apenas PR de Routine + Baixo Risco + Whitelist + 30min espera + zero red flags

Arquivos fora da whitelist (`services/`, `app/`, `supabase/`, etc.) NUNCA auto-merge.
Deadline PR: 48h com escape `/extend` (+48h). Reversivel via `git revert`.
Spec completa: `pr-review-bot-spec.md`.

## Convencoes

- Toda nova Routine precisa spec em `routines-specs.md` ANTES de criar no dashboard
- Nome da Routine em `kebab-case`, descritivo, sem abreviacoes
- Trigger ID registrado aqui imediatamente apos criacao (nao confiar na memoria)
- Routines que precisam de env var: documentar qual env var e status no quadro acima
- Specs pendentes (CEO deve criar manualmente): `routines-specs-pending-2026-05-19.md`

## Issues conhecidos

- `VERCEL_API_TOKEN` ainda nao setado no dashboard para `vercel-logs-error-scan`
- `waitlist-weekly-digest` deve ser avaliada para desativacao apos 2 semanas de `waitlist-funnel-diario` (redundancia)

## Nao mexer sem avisar

- Trigger IDs: sao imutaveis apos criacao. Para mudar schedule, pausar e recriar
- Quota diaria: 15 runs/dia no plano Max. Hoje: ~7.3 runs/dia media. Margem: 7.7 runs/dia

## Ultima atualizacao

2026-05-20 · lia-docs
