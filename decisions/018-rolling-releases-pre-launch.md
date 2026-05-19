# ADR-018 — Vercel Rolling Releases: configuracao pre-launch Hayzer

**Status**: Proposto (aguarda aprovacao CEO para aplicar em 20/06/2026)
**Data**: 2026-05-20
**Owner**: Ricardo (DevOps)
**Revisores**: Helena (Estrategia), Otavio (Seguranca)

---

## Contexto

Hayzer vai a launch publico em 27/06/2026. Qualquer deploy que quebre
producao nessa janela causa dano de reputacao direto (waitlist assistindo,
primeiros usuarios ativos). O risco concentrado num "big bang deploy" e
alto demais para esse momento.

Vercel Rolling Releases entrou em GA em junho/2025 para todos os planos
(incluindo Hobby e Pro). O recurso permite rotear uma porcentagem do
trafego para o novo deployment enquanto o antigo permanece ativo, com
rollback automatico baseado em threshold de erro.

Hayzer esta em zero usuarios reais ainda (waitlist phase). Isso significa
que Rolling Releases pode ser configurado e testado sem risco real agora,
e ja estara calibrado para a semana de launch.

---

## Decisao

Ativar Rolling Releases no projeto Hayzer no Vercel em **20/06/2026**
(7 dias antes do launch publico), com perfil canary conservador.

### Configuracao tecnica

Rolling Releases e configurado via `vercel.json` na raiz do projeto.

**Arquivo `vercel.json` a criar na aplicacao de:**

```json
{
  "rollingReleases": {
    "enabled": true,
    "strategy": "canary",
    "phases": [
      {
        "percentage": 10,
        "durationMinutes": 30,
        "errorThresholdPercent": 2
      },
      {
        "percentage": 50,
        "durationMinutes": 30,
        "errorThresholdPercent": 2
      },
      {
        "percentage": 100
      }
    ]
  }
}
```

**Logica do fluxo:**
1. Deploy novo entra: 10% do trafego roteado para ele por 30 minutos
2. Se taxa de erro >= 2% nessa janela: rollback automatico para deployment anterior
3. Se OK: promove para 50% por mais 30 minutos
4. Se OK: promove para 100% (deployment completo)
5. Tempo total de rollout: ~1 hora por deploy

**Threshold de erro de 2%:** Conservador para launch. Baseline atual Hayzer e zero (sem
usuarios), entao qualquer erro novo e sinal forte. Revisar para 5% apos 30 dias
de producao estabilizada com usuarios reais.

### O que nao e coberto

Rolling Releases controla trafego HTTP. Nao afeta:
- Migrations de banco de dados (Supabase): devem ser backward-compatible antes do deploy
- Webhooks Stripe/MP: chegam no deployment ativo, nao no canary
- Cron jobs Vercel: rodam no deployment atual (100%)

**Regra de ouro para migrations enquanto Rolling Releases ativo:**
Toda migration deve ser additive-only (nunca DROP ou RENAME de coluna em uso).
Se precisar RENAME: adicionar coluna nova + copiar dados + remover antiga em 3 deploys
separados (expand-contract pattern).

---

## Alternativas consideradas

| Alternativa | Razao para rejeitar |
|---|---|
| Deploy direto 100% (situacao atual) | Sem rollback automatico baseado em metricas. Depende de alguem monitorar manualmente. |
| Feature flags apenas | Controla visibilidade da feature, nao o runtime do servidor. Complementar, nao substituto. |
| Blue-green deployment | Requer duas instancias identicas pagas. Vercel Rolling e mais simples e gratis no plano atual. |
| Rollout gradual manual via Vercel Dashboard | Manual = dependente de pessoa disponivel 24/7. Rolling automatizado e mais seguro. |

---

## Riscos e mitigacoes

**R1 — Sessao de usuario dividida entre deployments**
Risco: usuario inicia sessao no canary (10%) e requisicao seguinte cai no stable (90%).
Mitigacao: autenticacao Hayzer usa Supabase (JWT stateless), sem session-affinity
necessaria. Qualquer deployment valida o mesmo JWT. Risco real: zero.

**R2 — Migration nao compativel aplicada antes do rollout terminar**
Risco: nova coluna NOT NULL sem default aplicada enquanto deployment antigo ainda
roda (90% do trafego) e tenta fazer INSERT sem essa coluna.
Mitigacao: checklist pre-deploy obrigatorio (ver secao "Processo de deploy").
Toda migration deve passar por Paulo + Bruna antes de aplicar.

**R3 — Threshold de 2% muito sensivel, rollback desnecessario**
Risco: spike de erro de 3% por 2 minutos (ex: Supabase cold start) ativa rollback
automatico mesmo sem bug real.
Mitigacao: duracaoMinutes=30 ja suaviza spikes curtos. Se houver falso-positivo
documentado, revisar para 3% no proximo ajuste.

**R4 — Vercel Rolling nao disponivel no plano atual**
Risco: projeto Hayzer em plano Hobby que nao suporte Rolling Releases.
Mitigacao: Rolling Releases foi anunciado GA para todos os planos em junho/2025.
Verificar no Dashboard Vercel: Settings > Deployments > Rolling Releases.
Se indisponivel: escalar para plano Pro (custo: ~$20/mes) ou manter deploy direto
com rollback manual (fallback aceitavel pre-launch).

---

## Processo de deploy com Rolling Releases ativo

```
Checklist pre-deploy (Ricardo)
[ ] Build local passa (npm run build)
[ ] TypeScript sem erros (tsc --noEmit)
[ ] ESLint sem erros (eslint)
[ ] Migration aplicada? Se sim: e backward-compatible?
[ ] Preview branch testada manualmente (URL Vercel preview)
[ ] Julio (QA) aprovou? (Tier 1 features)
[ ] Otavio aprovou? (mudancas de seguranca)

Deploy
[ ] Push para main -> Vercel auto-deploy
[ ] Aguardar Fase 1 (10%, 30min): verificar Sentry + Vercel logs
[ ] Aguardar Fase 2 (50%, 30min): verificar Sentry + Vercel logs
[ ] Rollout completo (100%): declarar deploy concluido

Pos-deploy (primeiras 2h)
[ ] Sentry: zero novos erros criticos?
[ ] Vercel Analytics: bounce rate normal?
[ ] Funcionalidades criticas manuais: login, calculadora, waitlist
```

---

## Rollback plan

**Rollback automatico (Rolling Releases):**
Se threshold de 2% erro for atingido em qualquer fase: Vercel reverte para
deployment anterior automaticamente. Sem acao humana necessaria. Tempo: segundos.

**Rollback manual (se automatico falhar ou for necessario pos-100%):**
```bash
# Opção 1: CLI
vercel rollback <deployment-url-anterior> --token=$VERCEL_TOKEN

# Opção 2: Dashboard
# Vercel Dashboard -> Deployments -> clique no deploy anterior -> "Promote to Production"
```

Tempo de rollback manual: < 2 minutos (meta do Principio CEO-P1).

**URL do deployment anterior:** Sempre disponivel em Vercel Dashboard > Deployments.
Boa pratica: anotar URL do ultimo deploy estavel antes de cada push para main.

---

## Cronograma de aplicacao

| Data | Acao |
|---|---|
| 20/06/2026 | CEO cria `vercel.json` com config acima + commit + push |
| 20/06/2026 | Ricardo verifica no Dashboard que Rolling Release foi reconhecido |
| 20-26/06/2026 | Qualquer deploy nessa semana usa Rolling automaticamente |
| 27/06/2026 | Launch publico com Rolling Releases ja calibrado |
| 27/07/2026 | Revisao: ajustar threshold para 5% se baseline de erros normalizar |

**Por que 20/06 e nao antes?**
Rolling Releases com threshold de 2% durante fase de waitlist (zero usuarios)
pode gerar rollbacks por erros de exploracao propria do CEO (formularios de
teste, etc). Ativar 7 dias antes do launch e o equilibrio entre "ja calibrado"
e "nao interfere com desenvolvimento".

---

## Referencias

- Vercel Rolling Releases docs: https://vercel.com/docs/deployments/rolling-releases
- Vercel Blog GA announcement (junho/2025)
- ADR-relacionado: decisions/015-automacao-24-7.md (routines e automacao)
- ADR-019: decisions/019-sentry-init-prod.md (Sentry, complementar)
- Principio CEO-P1: Reversibilidade antes de perfeicao
- Principio P3: Deploy frequente reduz risco, nao aumenta (Accelerate, Forsgren)
- Principio P4: MTTR importa mais que MTBF (Phoenix Project, Kim)
