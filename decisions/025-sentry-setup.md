# ADR-025 — Sentry setup: antecipação para pré-soft-launch + complementos LGPD/cost-guard

**Status**: PROPOSTO (aguarda aprovação CEO para aplicar)
**Data**: 2026-05-20 (madrugada hardwork)
**Owner**: Otávio (Security) + Ricardo (DevOps)
**Revisores**: Helena (Estratégia), Bruna (Backend)
**Substitui**: ADR-019 fica como referência histórica; este ADR é a versão executável.
**Janela aplicação proposta**: **02-06/06** (não 17/06)

---

## 1. Por que existir junto do ADR-019?

ADR-019 cobriu fundamento (PII scrubbing, Next 16 instrumentation, plano Developer, riscos). Faltou:

1. **Antecipação do cronograma**: 17/06 é tarde demais. Soft launch é 11-13/06, então **CEO+QA precisam ter Sentry capturando antes do soft launch**, não depois. Aplicar 02-06/06 dá 5-7 dias de calibração com tráfego real de waitlist+CEO testando, antes dos primeiros usuários reais (soft launch).
2. **Cost guard hard**: ADR-019 fala em upgrade trigger a 80% de quota, mas não tem **shutoff automático**. Sem isso, um loop de erro pode estourar 5.000 errors/mês em 1 hora e bloquear capture.
3. **LGPD scrub mais agressivo**: lista de campos a sanitizar em `event.extra` não estava enumerada. Faltou WhatsApp BR (formato comum em order/customer).
4. **Alerta operacional**: ADR-019 só prevê email. Precisamos do **Discord webhook** (já temos do ADR-020 — operação noturna) integrado pro Sentry.
5. **Wizard vs config manual**: ADR-019 fala em "aplicar arquivos preparados". Decidir agora: **wizard oficial** (`npx @sentry/wizard@latest -i nextjs`) é confiável em Next 16 ou montamos manual?

Este ADR resolve esses 5 gaps. ADR-019 vira contexto; **este vira o playbook de execução**.

---

## 2. Decisões consolidadas

### 2.1 Cronograma antecipado

| Data | Ação | Owner |
|---|---|---|
| **02/06 (seg)** | CEO cria conta Sentry (plano Developer free), New Project → Next.js, gera DSN + Auth Token | CEO |
| **02/06** | CEO seta 4 env vars no Vercel (todos ambientes) | CEO |
| **03/06 (ter)** | Ricardo aplica config (wizard ou manual — ver §2.5), commit + deploy preview | Ricardo |
| **03/06** | Smoke test: erro proposital em rota não usada → confirmar evento chega no Sentry | Ricardo + Otávio |
| **04/06 (qua)** | Aplicar `beforeSend` scrub com lista PII completa (§2.4) + cost guard (§2.3) | Otávio |
| **05/06 (qui)** | Configurar alertas Discord (§2.6) + Email digest | Ricardo |
| **06/06 (sex)** | Push → deploy prod → Sentry ativo em hayzer.com.br | Ricardo |
| **07-10/06** | Janela de calibração: ajustar falsos positivos antes do soft launch | Otávio |
| **11/06** | Soft launch com Sentry ativo + cost guard + scrub + alertas Discord | — |

**Por que antecipar de 17/06 → 02-06/06**:
- 17/06 = 4 dias depois do soft launch (11-13/06). Soft launch SEM observability é viajar no escuro.
- Quota plano Developer é 5.000 errors/mês. Em 5 dias de tráfego waitlist + CEO testando, gasta no máximo 50-200 errors. Não estoura.
- Calibração precisa de tráfego real. Sem usuários (1-10/06), tráfego = CEO+QA+bots. Suficiente pra remover falsos positivos.
- **Trade-off aceitável**: gastar ~300 errors em 5 dias de calibração vs descobrir bug crítico no soft launch sem capture.

### 2.2 Wizard vs config manual

**Decisão**: usar wizard oficial **`npx @sentry/wizard@latest -i nextjs`**.

Razões:
- Wizard versão 6+ suporta Next 16 + App Router + Turbopack desde out/2025.
- Wizard gera os 4 arquivos certos (`instrumentation.ts`, `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`) + injeta `withSentryConfig` no `next.config.ts`.
- Wizard pergunta DSN, cria `.env.local`, gera example route `/sentry-example-page`.
- **Pós-wizard imediato**: Ricardo edita os configs gerados pra inserir `beforeSend` (§2.4) e `tracesSampleRate` (§2.7). Wizard inicializa com defaults que vazam PII — **NUNCA deixar default em prod**.

**Risco do wizard**: pode injetar source map upload de forma incompatível com `nodeMiddleware: true` no `next.config.ts`. Mitigação: Ricardo valida `npm run build` local antes de push.

### 2.3 Cost guard hard (não estava no ADR-019)

Sentry plano Developer = 5.000 errors/mês. Loop de erro (ex: throw em render React) pode estourar quota em horas. Proteção:

**Camada 1 — Client SDK rate-limit local**:
```typescript
// sentry.client.config.ts
Sentry.init({
  // ...
  maxBreadcrumbs: 50,
  // Sentry SDK já tem rate-limit nativo: 300 events/min por client.
  // Não precisamos adicionar nada — basta NÃO desativar.
})
```

**Camada 2 — Sentry Dashboard: Inbound Filters + Spike Protection**:
- Settings → Inbound Filters: ignorar erros de bots (`User-Agent` contém `bot|crawler|spider`)
- Settings → Spike Protection: **ATIVAR** (Sentry oferece grátis no Developer). Se taxa de erro exceder 5x a média histórica em 1h, Sentry para de aceitar eventos por 1h (gratuito).

**Camada 3 — Alerta interno se quota >70%**:
- Sentry Dashboard → Alerts → New Alert Rule
- Condição: "Quota usage exceeds 70%"
- Ação: Discord webhook + Email CEO + Otávio
- Threshold: avisar com folga pra decidir upgrade vs investigar bug ofensor.

**Camada 4 — Server SDK: filtro custom em `beforeSend`**:
```typescript
// sentry.server.config.ts
const errorCountThisMinute = new Map<string, number>()

Sentry.init({
  beforeSend(event, hint) {
    // Cost guard: max 30 eventos do mesmo error fingerprint por minuto
    const fp = event.fingerprint?.join(':') || event.exception?.values?.[0]?.type || 'unknown'
    const now = Math.floor(Date.now() / 60000)
    const key = `${fp}:${now}`
    const count = (errorCountThisMinute.get(key) || 0) + 1
    errorCountThisMinute.set(key, count)
    if (count > 30) return null // descarta — loop detectado

    // PII scrub abaixo (§2.4)
    return scrubEvent(event)
  }
})
```

### 2.4 PII scrub completo (LGPD)

Lista expandida vs ADR-019:

```typescript
const PII_PATTERNS = [
  // Email (qualquer formato)
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // CPF (com e sem máscara)
  /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,
  // CNPJ (com e sem máscara)
  /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g,
  // WhatsApp BR (5511999999999, +5511999999999, 11 99999-9999)
  /\b(\+?55)?\s?\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b/g,
  // Cartão de crédito
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  // CEP (8 dígitos — pode vazar endereço)
  /\b\d{5}-?\d{3}\b/g,
]

const PII_KEYS_BLOCKED = [
  // Nunca enviar valor desses campos, mesmo se passar pelo regex
  'email', 'cpf', 'cnpj', 'whatsapp', 'phone', 'telefone',
  'cep', 'endereco', 'address', 'cardNumber', 'card_number',
  'password', 'senha', 'token', 'apiKey', 'api_key',
  'access_token', 'refresh_token', 'authorization',
  'client_name', 'customer_whatsapp', 'customer_email',
]

function scrubEvent(event: Sentry.Event): Sentry.Event {
  // 1. Regex scrub em string fields
  const stringFields = [
    event.message,
    event.request?.url,
    typeof event.request?.data === 'string' ? event.request.data : null,
  ]
  // ... aplica scrubPii em cada

  // 2. Key-based scrub em event.extra, event.tags, event.contexts
  function scrubObject(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) {
      if (PII_KEYS_BLOCKED.includes(k.toLowerCase())) {
        result[k] = '[REDACTED]'
      } else if (typeof v === 'string') {
        result[k] = scrubPii(v)
      } else if (v && typeof v === 'object' && !Array.isArray(v)) {
        result[k] = scrubObject(v as Record<string, unknown>)
      } else {
        result[k] = v
      }
    }
    return result
  }

  if (event.extra) event.extra = scrubObject(event.extra)
  if (event.tags) event.tags = scrubObject(event.tags) as Record<string, string | number | boolean | null>
  if (event.contexts) event.contexts = scrubObject(event.contexts) as never

  // 3. Stacktrace local variables (Sentry SDK envia opcional)
  // Force: send_default_pii=false já cobre, mas reforço:
  if (event.exception?.values) {
    event.exception.values.forEach(exc => {
      exc.stacktrace?.frames?.forEach(frame => {
        if (frame.vars) frame.vars = {} // zerar locals — código vaza email/cpf
      })
    })
  }

  return event
}
```

**O que PODE ir pro Sentry (não é PII)**:
- `user_id` (uuid) — **OK** pra correlacionar erros, não revela identidade fora do Supabase
- `project_id` (text) — **OK**
- `order_id`, `payment_id` — **OK** (são opacos sem dump do DB)
- Stacktrace de código (arquivo, linha) — **OK**
- Rota acessada (`/orders`, `/finance`) — **OK**, sem query string

**O que NUNCA pode ir**:
- `email`, `cpf`, `cnpj`, `whatsapp`, nome cliente, endereço, valor exato de pedido (>R$ 100 = sinal de pagamento real, dado sensível)
- Conteúdo de body POST de `/api/checkout`, `/api/encomenda`, `/api/waitlist` — TODOS contêm PII
- Cookies, headers `Authorization`, `Cookie`, `X-API-Key`

**Validação pré-launch**: enviar evento de teste com payload contendo email+CPF+whatsapp falsos. Conferir no Sentry Dashboard que apareceram como `[PII_REDACTED]`. Se aparecer cru = BUG, voltar pro `scrubEvent`.

### 2.5 Source maps

Source maps são uploaded pro Sentry pra stack trace legível, mas **NÃO ficam expostos no browser** (`hideSourceMaps: true` é default no `withSentryConfig`). Confirmar:

```typescript
// next.config.ts (após withSentryConfig)
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  hideSourceMaps: true,  // OBRIGATÓRIO
  disableLogger: true,
  widenClientFileUpload: true,
}
```

**Validação manual pós-deploy**: abrir DevTools em hayzer.com.br → Sources → confirmar que arquivos `.tsx` aparecem minificados, sem source map inline. Se aparecer código fonte, **rollback imediato** (revert deploy via Vercel Dashboard).

### 2.6 Alertas — integração Discord (ADR-020)

ADR-020 já configurou Discord webhook pra operação noturna. Reaproveitar:

**Sentry Dashboard → Alerts → Create Alert**:

| Alerta | Condição | Threshold | Canal | Frequência |
|---|---|---|---|---|
| Novo issue | Issue nunca visto antes | Imediato | Discord #hayzer-alerts + Email CEO | Imediato |
| Erro spike | Erro ocorre >10x em 5min | 10 ocorrências | Discord #hayzer-alerts | A cada disparo |
| Quota uso 70% | `quota_usage > 70%` | Mensal | Discord + Email CEO+Otávio | 1x quando cruzar |
| Quota uso 90% | `quota_usage > 90%` | Mensal | Discord + Email CEO+Otávio+Ricardo + SMS CEO se possível | 1x quando cruzar |
| Webhook signature inválida | Tag `error_type:webhook_signature_invalid` | Imediato | Discord #hayzer-alerts + Email Paulo+Otávio | Imediato |
| RLS violation | Tag `error_type:rls_violation` | Imediato | Discord + Email Otávio+Bruna | Imediato |
| LCP regressão | LCP > 4s em >5% sessões | Semanal | Email Felipe | Digest semanal |

**Discord webhook**: usar o mesmo URL `DISCORD_WEBHOOK_URL` já no Vercel (ADR-020). Sentry tem integração nativa Discord OAuth — preferir essa em vez de webhook genérico (parsing melhor das mensagens).

### 2.7 Sample rates (revisão final)

| Métrica | Dev | Soft launch (11-13/06) | Launch (27/06+) |
|---|---|---|---|
| `tracesSampleRate` (performance) | 1.0 | 0.5 (~tráfego baixo, queremos ver tudo) | 0.1 (quota) |
| `replaysSessionSampleRate` (replay) | 0 | 0 | 0 (LGPD: aguarda consent UI) |
| `replaysOnErrorSampleRate` | 0 | 0 | 0 |
| `profilesSampleRate` (CPU profiling) | 0 | 0 | 0 (custo extra) |

**Justificativa sample rate 0.5 no soft launch**:
- Tráfego estimado soft launch: 50-200 sessões/dia
- 0.5 = 25-100 transactions/dia = ~750-3000/mês
- Quota Developer: 10.000 performance units/mês = sobra
- Beneficio: vê 50% das sessões em detalhe pra detectar Web Vitals lentos antes do launch

Após launch público, baixar pra 0.1 (10%) preserva quota com 1.000+ usuários/mês.

### 2.8 Env vars finais

```bash
# Cliente (público — pode ir no bundle)
NEXT_PUBLIC_SENTRY_DSN=https://[key]@o[org].ingest.us.sentry.io/[proj]

# Server-only (NUNCA cliente)
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=hayzer
SENTRY_PROJECT=hayzer-prod
```

**Adicionar no `.env.example`** (sem valor, só placeholder).

**Decisão deliberada**: NÃO usar `ingest.de.sentry.io` (Alemanha/GDPR) por enquanto. Hayzer é BR + dados em Supabase US-East. Coerência: Sentry US-East também. Custo: zero. Migração futura possível se entrar em mercado UE.

---

## 3. Riscos extras (vs ADR-019)

**R5 — Wizard quebra `next.config.ts`**
Risco: `withSentryConfig` pode entrar em conflito com `experimental.nodeMiddleware: true` ou config de Tailwind 4.
Mitigação: Ricardo roda `npm run build` local após wizard. Se falhar, montar manual seguindo template `_sentry-prepared/` que ADR-019 mencionou.

**R6 — Cost guard `errorCountThisMinute` Map vaza memória no Vercel Fluid**
Risco: Map cresce sem TTL no edge runtime. Cada novo invocation = nova memória, mas Fluid compute reusa containers.
Mitigação: TTL agressivo — limpar Map a cada 5min via setInterval:
```typescript
setInterval(() => {
  const now = Math.floor(Date.now() / 60000)
  for (const key of errorCountThisMinute.keys()) {
    const [, ts] = key.split(':')
    if (now - Number(ts) > 5) errorCountThisMinute.delete(key)
  }
}, 60000)
```
Outras opções: usar `WeakMap` (não dá com string keys) ou redis (custo). Mapa com TTL é suficiente.

**R7 — Falsos positivos floodam Discord nos primeiros dias**
Risco: durante calibração (07-10/06), erros conhecidos (ex: ResizeObserver, NotFoundError do browser) podem disparar 100x alertas e fazer canal virar ruído.
Mitigação: lista `ignoreErrors` no SDK:
```typescript
ignoreErrors: [
  'ResizeObserver loop',
  'Non-Error promise rejection captured',
  'NotFoundError',
  'NetworkError',
  'AbortError',
  /^Loading chunk \d+ failed/, // chunk load durante deploy = normal
]
```

**R8 — CEO descobrir custo extra após Sentry**
Risco: plano Developer free mas com tráfego pesado pode forçar upgrade Team $26/mês mid-launch.
Mitigação: cost guard (§2.3) + alerta 70%+90% + decisão clara: **se quota estoura 2x consecutivos, upgrade Team imediato. Hayzer já está em runway curto, mas observability cega = risco maior que $26/mês.**

---

## 4. Validação pós-aplicação (checklist Ricardo + Otávio)

- [ ] `npm run build` local roda sem erro com `withSentryConfig`
- [ ] Deploy preview Vercel não quebra
- [ ] DevTools em preview → Sources → arquivos minificados, sem source map exposto
- [ ] Trigger erro proposital em `/sentry-example-page` → confirma evento no Sentry Dashboard em <30s
- [ ] Trigger erro com payload `{email: "teste@x.com", cpf: "111.222.333-44"}` → confirma `[PII_REDACTED]` no evento
- [ ] Spike Protection ATIVADA no Sentry Dashboard
- [ ] 6 alertas criados (§2.6)
- [ ] Integração Discord testada (postar evento de teste, confirma chegou no #hayzer-alerts)
- [ ] `ignoreErrors` carregando: trigger `ResizeObserver` proposital, confirma NÃO aparece no Dashboard
- [ ] LCP/FCP de hayzer.com.br não regrediu >100ms vs antes (Vercel Speed Insights)
- [ ] Quota usage no Dashboard começa em <100 erros após 5 dias de calibração

---

## 5. O que precisa de aprovação CEO explícita

1. **Aplicar 02-06/06 em vez de 17/06** — adianta 11 dias. Trade-off: quota + tempo de Ricardo. Recomendação: SIM.
2. **Plano Developer (grátis) é suficiente pro launch** — sim, mas autoriza upgrade automático Team $26/mês se quota estourar 2x. Recomendação: autorizar pra evitar perder eventos críticos por economia.
3. **Não habilitar Session Replay** — postura LGPD-friendly. Quando ativar (pós-launch), precisa UI de consent. Recomendação: confirmar.
4. **Integrar Discord webhook ADR-020 vs criar canal Sentry separado** — recomendo Discord (reaproveita infra). Confirmar.

---

## 6. Itens executáveis SEM aprovação CEO

Otávio pode executar AGORA, sem esperar CEO:

- [ ] Criar diretório `_sentry-prepared/` com 4 arquivos de config + `beforeSend` template + cost guard. Não plugar no app, fica como rascunho.
- [ ] Adicionar 4 env vars vazias no `.env.example` (sem valor, só placeholder)
- [ ] Adicionar bloco "Sentry env vars" em `app/CLAUDE.md` ou `services/CLAUDE.md` documentando o que cada var faz
- [ ] Reservar canal Discord `#hayzer-alerts` (verificar se já existe via ADR-020 ou criar)

Outras ações (instalar `@sentry/nextjs`, rodar wizard, modificar `next.config.ts`, push) **aguardam CEO autorizar §5**.

---

## 7. Referências

- ADR-019: `decisions/019-sentry-init-prod.md` (contexto fundador, não substituído — complementado)
- ADR-018: `decisions/018-rolling-releases-pre-launch.md` (rollback rápido)
- ADR-020: `decisions/020-discord-webhooks-operacao-noturna.md` (Discord infra)
- ADR-022: `decisions/022-launch-acelerado-04-07-para-27-06.md` (justificativa antecipar)
- Sentry Next.js: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Sentry Filtering: https://docs.sentry.io/platforms/javascript/configuration/filtering/
- Sentry Spike Protection: https://docs.sentry.io/product/accounts/quotas/spike-protection/
- LGPD Art. 6 (finalidade) + Art. 18 (direitos titular) + Art. 46 (segurança)
- OWASP A09:2025 — Security Logging/Alerting Failures
- OWASP A10:2025 — Mishandling of Exceptional Conditions
