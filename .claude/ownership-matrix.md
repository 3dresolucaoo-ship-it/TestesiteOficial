# Ownership Matrix — Operação Hardwork
## 2026-05-19 → 27/06 (launch público)

> Cada arquivo/recurso tem UM DONO. Outros agents pedem PR-style. Helena resolve conflitos. Claude (eu) faz lock manual antes de despachar.

---

## Matriz por recurso

| Recurso | Dono exclusivo | Pode ler | Proibido tocar |
|---|---|---|---|
| `app/page.tsx` + `components/landing/*` | **Felipe** | Carla (lê copy), Diego (referencia assets) | Todos os outros |
| `copy/landing-copy-2026-05-20.md` (novo) | **Carla** | Felipe (lê pra colar) | Todos os outros |
| `public/landing/v2/*` (assets) | **Diego** | Felipe (importa) | Todos os outros |
| `supabase/migrations/*` | **Bruna** | Todos (ler types gerados) | Todos os outros |
| `services/*.ts` | **Bruna** (cria) | Felipe (chama), Ana (instrumenta) | Outros tocar = volta pra Bruna |
| `app/globals-v4.css` | **Felipe** | Diego (sugere via markdown comment) | Todos os outros |
| `CLAUDE.md` raiz, `ROADMAP.md`, `decisions/*` | **Lia** | Helena (pode editar avisando) | Todos os outros |
| `next.config.ts`, `vercel.ts`, env vars | **Ricardo** | Otávio (pede mudança de header de segurança) | Todos os outros |
| `instrumentation.ts`, PostHog events | **Ana** | Felipe (instala SDK base) | Todos os outros |
| `app/dashboard/v4/onboarding/*` (novo) | **Sofia** | Felipe (consulta integrações) | NÃO TOCAR LANDING |
| `e2e/`, `tests/` | **Júlia** | Cada agent escreve teste do código DELE | Júlia revisa |
| `app/api/calc-pro/*`, Stripe Calc Freemium | **Paulo** | Bruna (services), Felipe (UI) | Todos os outros |
| `app/api/webhooks/payment/*` | **Paulo** + **Bruna** (RPC) | Otávio (revisa security) | Todos os outros |
| `brand/BRIEF.md` | **Carla** (copy) + **Diego** (visual) | Helena revisa, Lia documenta | Outros tocar = volta |
| `marketing/calendario-editorial.md` | **Marcos** | Joana (consulta), Carla (escreve copy posts) | Outros |
| `community/briefings/*` | **Joana** | Marcos (alinha estratégia) | Outros |
| `memory/*` (Claude persistente) | **Claude (eu)** | Ninguém | Ninguém edita |
| `~/.claude/agents/*` (agent definitions) | **Helena** (configurações) | Ninguém edita sem autorização | — |

---

## Regras de coordenação

### Antes de despachar agent
1. Claude verifica Ownership Matrix
2. Confirma que arquivos do escopo não estão sendo tocados por outro agent ativo
3. Despacha com prompt explícito: *"VOCÊ SÓ TOCA EM [lista exata]. Se precisar de outro arquivo, RETORNA pra mim antes de tocar"*
4. Aplica memória `feedback_escopo_cirurgico` em CADA prompt: *"ENTREGUE APENAS O ESCOPO DEFINIDO. Não adicione features adjacentes. Reporte oportunidades no fim, não implemente"*

### Quando agent encontra arquivo fora do escopo
1. Agent NÃO toca
2. Agent reporta a Claude
3. Claude decide: (a) expande escopo do agent atual ou (b) abre task novo pro dono daquele arquivo
4. Helena resolve conflito se houver dúvida

### Auto-commit policy
- Agents NÃO commitam direto no main
- Claude commita após:
  - Agent reportou conclusão
  - Helena revisou diff
  - CEO autorizou na digest (12h/18h/22h) OU é fix crítico bloqueante
- Mensagem de commit cita ownership (`feat(landing) Felipe: ...`)

### Conflito de fase
Fases sequenciais (manhã 8-12h → tarde 13-18h → noite 18-22h) evitam choque. Mas:
- Se Fase 1 atrasa, Fase 2 espera
- Helena pode rearranjar dependências em tempo real
- Ninguém começa Fase N+1 sem confirmação que Fase N está OK

---

## Squad map (13 agents ativos + 3 standby)

### Squad Foundation (Fase 1 manhã)
- **Bruna** (backend) — schema, services, migrations
- **Diego** (design) — assets visuais
- **Lia** (docs) — CLAUDE.md, ROADMAP, ADRs
- **Ricardo** (devops) — Rolling Releases, Sentry, deploy
- **Otávio** (security) — Tier 1

### Squad Build (Fase 2 tarde)
- **Carla** (copy) — landing copy refeita
- **Felipe** (frontend) — implementação landing
- **Sofia** (cs) — onboarding /dashboard
- **Ana** (analytics) — Vercel Analytics + PostHog
- **Paulo** (financial) — Calc Freemium + bug Paulo

### Squad Reach (Fase 3 noite)
- **Marcos** (marketing) — calendário + LinkedIn
- **Joana** (community) — briefing VIPs
- **Júlia** (qa) — revisão geral landing

### Standby
- **Helena** (estratégia) — revisa cada fase, reporta CEO 12h/18h/22h
- **critic-claude** / **critic-user** — só em `/council`
- **external-researcher** — já cumpriu hoje

---

## Histórico

- 2026-05-19 noite — Matrix criada na operação hardwork. CEO aprovou 13 agents em paralelo com ownership clara.
- Próxima revisão: 2026-05-26 (fim Sem 2) ou se houver conflito não previsto.
