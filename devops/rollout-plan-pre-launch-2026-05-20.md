# Plano de Rollout Pre-Launch — Hayzer
**Referencia**: 2026-05-20 | Ricardo (DevOps)
**Launch publico**: 27/06/2026
**Janela pre-launch**: 6 semanas (20/05 -> 27/06)

ADRs relacionados: `decisions/016-rolling-releases-pre-launch.md` + `decisions/017-sentry-init-prod.md`

---

## Visao geral do cronograma

```
Hoje (20/05)     16/06           20/06           27/06
    |               |               |               |
    [===== dev ativo =====][Sentry][Rolling][LAUNCH]
    
Semana atual: feature dev + bugfix
Semana 20/05-15/06: desenvolvimento normal (deploy direto, sem Rolling ainda)
16/06: Sentry entra em producao (11 dias pre-launch)
20/06: Rolling Releases ativado (7 dias pre-launch)
27/06: Launch publico com observabilidade completa
```

---

## Feature 1: Sentry (error tracking + performance)

**Data de aplicacao**: 17/06/2026
**Responsavel**: Ricardo + CEO (env vars)
**Risco**: Baixo (reversivel em <10min)

### Pre-requisitos (CEO faz antes de 17/06)

- [ ] Criar conta gratuita em https://sentry.io (plano Developer)
- [ ] Criar projeto: "New Project" -> Next.js -> nome: `hayzer-prod`
- [ ] Copiar DSN (formato: `https://xxxxx@oYYYYY.ingest.us.sentry.io/ZZZZZ`)
- [ ] Criar Auth Token: Settings -> Auth Tokens -> Create Token
  - Escopos necessarios: `project:write`, `org:read`
- [ ] Setar 4 env vars no Vercel Dashboard (Settings -> Environment Variables):
  - `NEXT_PUBLIC_SENTRY_DSN`: todos os ambientes
  - `SENTRY_AUTH_TOKEN`: production + preview
  - `SENTRY_ORG`: production + preview (ex: `hayzer`)
  - `SENTRY_PROJECT`: production + preview (ex: `hayzer-prod`)

### Aplicacao (Ricardo em 17/06)

1. `npm install @sentry/nextjs@^10.53.1`
2. Copiar 4 arquivos de `_sentry-prepared/` para a raiz
3. Adicionar `withSentryConfig()` no `next.config.ts` (ver `_sentry-prepared/APPLY.md`)
4. `npm run build` local — confirmar zero erros
5. `tsc --noEmit` — confirmar zero erros TypeScript
6. Commit + push -> Vercel auto-deploy
7. Verificar no Sentry Dashboard: projeto recebendo eventos

### Verificacao pos-aplicacao (17/06)

- [ ] Sentry Dashboard: projeto aparece sem erros criticos
- [ ] Vercel: build passou sem erro
- [ ] Visitar `hayzer.com.br` e abrir DevTools -> Network: nenhum request para `sentry.io` falhou
  (requests vao para `/api/monitoring` pelo tunnel interno)
- [ ] Simular erro: abrir `hayzer.com.br/url-que-nao-existe` -> Sentry deve capturar 404
- [ ] Configurar 3 alertas de email (ver ADR-017 secao Alertas)

### Custo

Plano Developer (gratuito): 5.000 errors/mes, 10.000 performance units/mes.
Com 0 usuarios ainda: consumo estimado ate launch = < 100 events (testes proprios).
Sem custo adicional.

---

## Feature 2: Vercel Rolling Releases

**Data de aplicacao**: 20/06/2026
**Responsavel**: CEO (cria vercel.json) + Ricardo (verifica no Dashboard)
**Risco**: Baixo (reversivel removendo vercel.json)

### Pre-requisitos (verificar em 20/06)

- [ ] Sentry ja ativo (feature 1 aplicada em 17/06)
- [ ] Confirmar que plano Vercel suporta Rolling Releases
  (Dashboard -> Settings -> Deployments -> Rolling Releases)
- [ ] Checklist pre-launch: nenhum bug critico aberto no ROADMAP

### Aplicacao (CEO em 20/06)

Criar `vercel.json` na raiz do projeto com o conteudo abaixo.
**Otavio deve revisar antes do commit** (header de seguranca nao e alterado,
mas vercel.json pode sobrescrever configs existentes se mal formatado).

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

Commit + push -> primeiro deploy com Rolling Releases ativo.

### Verificacao pos-aplicacao (20/06)

- [ ] Vercel Dashboard -> Deployments: proximo deploy mostra grafico de rollout (10% -> 50% -> 100%)
- [ ] Aguardar um deploy de teste (pode ser um commit de doc) e confirmar progressao das fases
- [ ] Sentry continua recebendo eventos durante o rollout

### Como o rollout funciona na pratica (para o CEO saber)

Quando Ricardo fizer push apos 20/06:
1. Vercel faz build do novo deployment
2. Novo deployment fica em standby: 10% do trafego vai pra ele
3. Vercel monitora taxa de erro por 30 minutos
4. Se >= 2% de erro: rollback automatico para o deployment anterior (sem acao humana)
5. Se OK: 50% por mais 30 minutos
6. Se OK: 100% (deploy completo)

Tempo total de deploy: ~1 hora (vs segundos hoje).
Tradeoff aceito: mais lento, mas muito mais seguro para o launch.

Para deploy urgente (ex: bug critico em producao):
Na UI do Vercel -> deployment ativo -> "Skip Rolling Release" -> promove imediatamente.

---

## Checklist pre-launch completo (semana 27/06)

### Semana de 16/06
- [ ] Sentry instalado e recebendo eventos
- [ ] Alertas de email configurados (CEO + Ricardo)
- [ ] Ultimo bug critico do ROADMAP resolvido

### Semana de 20/06
- [ ] vercel.json com Rolling Releases commitado
- [ ] Teste de rollout: 1 deploy de teste observado no Dashboard
- [ ] Rollback testado: `vercel rollback <url>` executado 1x para confirmar que funciona
- [ ] Dominio `hayzer.com.br` apontado corretamente (ja feito desde 14/05)
- [ ] HSTS ativo (ja feito)
- [ ] Vercel Bot Protection promovido de Log para On (ja estava em Log desde 14/05)

### Semana de 27/06 (launch)
- [ ] Webhooks Stripe/MP apontando para `hayzer.com.br` (verificar com Paulo)
- [ ] DNS email: SPF + DKIM + DMARC validados (Resend ja configurado)
- [ ] Primeiro deploy do dia via Rolling Releases (10% -> 50% -> 100%)
- [ ] Sentry aberto durante primeiras 2h pos-launch
- [ ] Vercel Analytics aberto durante primeiras 2h pos-launch
- [ ] SUPABASE_SERVICE_ROLE_KEY rotacionada (pré-launch trigger — ver decisao 18/05)

---

## Rollback geral (se tudo der errado no dia do launch)

1. **Sentry**: remover `withSentryConfig()` do next.config.ts -> commit -> push (10 min)
2. **Rolling Releases**: remover `vercel.json` -> commit -> push -> deploy imediato (5 min)
3. **Deploy imediato de emergencia**: Vercel Dashboard -> deployment anterior -> "Promote to Production"
   Tempo: < 2 minutos. Zero dependencia de CLI ou codigo.

**URL do ultimo deployment estavel**: sempre disponivel em Vercel Dashboard -> Deployments.
Ricardo vai anotar a URL antes de cada push importante na semana de launch.

---

## Metricas de sucesso (pos-launch D+7)

| Metrica | Fonte | Meta |
|---|---|---|
| Taxa de erro (Error Rate) | Sentry | < 2% |
| p95 LCP | Vercel Speed Insights + Sentry | < 3.5s |
| Deploys sem rollback | Vercel | >= 90% (Change Failure Rate < 10%) |
| MTTR (se incidente) | Sentry + Vercel logs | < 30 minutos |
| Events Sentry consumidos | Sentry Dashboard | < 4.000/mes (80% quota gratuita) |

Se Error Rate > 5% na primeira semana: parar novos deploys e investigar com Sentry + logs.
Se CFR > 15% (mais de 1 em 7 deploys precisa de rollback): auditar checklist pre-deploy.

---

**Owner deste plano**: Ricardo (DevOps)
**Revisao**: Helena (Estrategia) antes de aplicar Sentry (16/06)
**Aprovacao final**: CEO Gabriel
