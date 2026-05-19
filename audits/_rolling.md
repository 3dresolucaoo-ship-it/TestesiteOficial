# Rolling Summary — Últimos 90 dias

> Resumo dos últimos audits. Mantém os 3 mais recentes; arquiva o resto em `audits/<data>.md`.
> Atualizado automaticamente pelo `/audit-mensal`.

---

## 📅 Audits arquivados

| Data | Arquivo | Bugs críticos | Itens cleanup |
|---|---|---|---|
| 2026-05-04 | `audits/2026-05-04.md` | 6 | 10+ |

---

## 📈 Tendência

> Atualizar quando tiver 2+ audits.

- _Sem dados suficientes ainda — primeiro audit em 2026-05-04._

---

## 🎯 Itens recorrentes (aparecem em múltiplos audits)

> Sinaliza dívida técnica que não está sendo resolvida.

- _A preencher conforme audits forem rodando._

---

## ✅ Itens resolvidos entre audits

> Quando um item de audit anterior some no novo audit, registrar aqui.

- _A preencher._

---

## 📋 Historico de sessoes (pre-20/05/2026)

> Movido do CLAUDE.md raiz em 2026-05-20 por Lia (limpeza Status Rapido).
> Consulte os arquivos de sessao em `sessions/` para detalhe completo.

### Semana de 14-16/05

- Rebranding Hayzer (ADR-009): dominio `hayzer.com.br`, 11 arquivos atualizados
- Seguranca Tier 1 completa: HSTS, honeypot, rate-limit, WAITLIST_IP_SALT
- Logo H+raizes PNG implementado (ADR-013)
- Foco vertical maker 3D (ADR-010): landing fala so com Rafael
- Resend configurado us-east-1 verified, RESEND_API_KEY rotacionada v2
- Calculadora 3D Fase 1 em prod (`/calculadora`): gross-up correto 5 marketplaces
- Bug RLS waitlist corrigido (commit `fccd49f`, ADR-011, service_role no insert)
- PWA setup: manifest.ts + Service Worker + offline.html
- Refactor orders.tsx 695→420 linhas
- Sistema Aprendizado Continuo G7: `studies/_index.md`, piloto carla-copy
- Landing v2: paleta night+petrol+ember, Fraunces serif, grain SVG

### Semana de 17-19/05

- Dashboard V4.8 aprovado CEO (ADR-014): 8 iteracoes em 1 dia
- 3 mockups arquiteturais em prod (V1/V2/V3), Felipe converte React 20/05
- Visual Library: 9 componentes + showcase `/library` (ver `components/visual-library/CLAUDE.md`)
- ModuleShell V4 reutilizavel: `components/dashboard/v4/ModuleShell.tsx`
- Seguranca: API_RATE_LIMIT_SALT setado, 2 migrations prod (webhook_events + api_rate_limits)
- Sistema PRs Camadas 1+2+3 ativo (ADR-015)
- 7 Routines ativas em prod (ver `automation/CLAUDE.md`)
- Skill /council reforcada com 5 etapas
- Helena resolveu 4 decisoes CEO (doc: `strategy/decisoes-resolvidas-2026-05-18.md`)
- INPI: pesquisa pePI ao vivo, HAIZER classe 35 bloqueado, classe 42 livre (ADR-012)
- 2 agentes G7 novos: ana-analytics + joana-community (total: 17)
- Hardwork ativado: launch acelerado 27/06, 13 agents em 3 fases
- 3 Routines novas via Chrome MCP: concorrencia-diaria-light, concorrencia-semanal-deep, comunidades-maker-semanal
- Bugs corrigidos: kpi-hero CoverHero, /orders sem layout, CSV export
