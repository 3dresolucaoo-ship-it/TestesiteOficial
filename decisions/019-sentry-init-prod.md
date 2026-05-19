# ADR-019 — Sentry: inicializacao em producao (error tracking + performance + LGPD)

**Status**: Proposto (aguarda aprovacao CEO para aplicar)
**Data**: 2026-05-20
**Owner**: Ricardo (DevOps) + Otavio (Seguranca)
**Revisores**: Helena (Estrategia), Bruna (Backend)
**Data alvo de aplicacao**: Semana de 16/06/2026 (11 dias pre-launch)

---

## Contexto

Hayzer nao tem observabilidade de erros em producao hoje. Se algo quebra
em `hayzer.com.br`, o CEO descobre por usuario reclamando (ou nao descobre).
Isso viola o Principio P4 (MTTR importa mais que MTBF) e o Principio P7
(feedback deve ser amplificado, nao suprimido).

Sentry e o padrao de mercado para error tracking em aplicacoes Next.js.
Versao `@sentry/nextjs@10.53.1` suporta Next 16 explicitamente
(`"next": "^13.2.0 || ^14.0 || ^15.0.0-rc.0 || ^16.0.0-0"`).

LGPD (Lei 13.709/2018) exige que dados pessoais nao sejam enviados a
terceiros sem consentimento ou base legal adequada. Eventos de erro podem
conter PII (email, telefone, CPF) em stacktraces ou request bodies.
A configuracao aqui garante scrubbing antes do envio.

---

## Decisao

Instalar `@sentry/nextjs@^10.53.1` com:
- Error tracking: todos os erros nao-tratados em client, server e edge
- Performance monitoring: 10% de amostragem em producao (custo-beneficio)
- Session Replay: 0% em producao (dado sensivel, aguarda decisao futura sobre LGPD consent)
- PII scrubbing: ativo por padrao via `sendDefaultPii: false` + `beforeSend` hook
- Ambiente separado: tracking so em `NODE_ENV === 'production'`

---

## Arquitetura de inicializacao (Next.js 16 App Router)

Next.js 16 usa o padrao `instrumentation.ts` (Turbopack-compatible) para
inicializacao de telemetria. O arquivo `instrumentation.ts` na raiz do projeto
exporta `register()` que e chamado uma vez no startup do servidor.

### Arquivos necessarios

```
raiz-do-projeto/
  instrumentation.ts          <- chamado pelo Next.js no startup (server + edge)
  sentry.client.config.ts     <- inicializa SDK no browser (carregado via next.config)
  sentry.server.config.ts     <- inicializa SDK no Node.js runtime
  sentry.edge.config.ts       <- inicializa SDK no Edge runtime (middleware)
```

**Importante:** `next.config.ts` precisa de wrapper `withSentryConfig()` para:
1. Injetar o SDK automaticamente em cada pagina (auto-instrumentation)
2. Fazer upload de sourcemaps para o Sentry (stack traces legíveis)
3. Tree-shaking de features nao usadas

O wrapper **nao deve ser aplicado agora** (restricao desta tarefa). Fica
documentado aqui para quando o CEO aprovar a aplicacao.

---

## Configuracao de PII scrubbing (LGPD)

### Regra geral (sendDefaultPii: false)
Por padrao, `@sentry/nextjs` nao envia headers de request (que podem conter
tokens/cookies) nem dados de usuario (IP, email). `sendDefaultPii: false`
mantem esse comportamento conservador.

### Hook beforeSend (scrubbing adicional)
Eventos de erro podem conter PII em:
- `event.request.data` (body de POST com email, CPF, telefone)
- `event.extra` (dados extras adicionados manualmente)
- Mensagens de erro custom que incluem dados de usuario

Funcao de scrubbing a aplicar:

```typescript
// Regex patterns para PII brasileiro
const PII_PATTERNS = [
  // Email
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // CPF (com e sem mascara)
  /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g,
  // Telefone BR (com e sem mascara)
  /(\+?55\s?)?(\(?\d{2}\)?\s?)[\d\s-]{8,10}/g,
  // Cartao de credito (PCI DSS)
  /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g,
];

function scrubPii(value: string): string {
  let result = value;
  PII_PATTERNS.forEach((pattern) => {
    result = result.replace(pattern, '[PII_REDACTED]');
  });
  return result;
}

function scrubEvent(event: SentryEvent): SentryEvent {
  // Scrub request body
  if (event.request?.data && typeof event.request.data === 'string') {
    event.request.data = scrubPii(event.request.data);
  }
  // Scrub mensagem de erro
  if (event.message) {
    event.message = scrubPii(event.message);
  }
  // Scrub URL (query params podem ter email)
  if (event.request?.url) {
    try {
      const url = new URL(event.request.url);
      url.searchParams.forEach((value, key) => {
        if (['email', 'cpf', 'telefone', 'phone'].includes(key.toLowerCase())) {
          url.searchParams.set(key, '[REDACTED]');
        }
      });
      event.request.url = url.toString();
    } catch {
      // URL invalida: ignora
    }
  }
  return event;
}
```

### Dados que SAO enviados (legais)
- Stacktrace (arquivo, linha, coluna) - anonimo, sem dados de usuario
- Breadcrumbs de navegacao (rotas visitadas sem dados pessoais)
- Tags de ambiente (production, versao do Next.js)
- Contagem de usuarios afetados por erro (sem identificacao individual)

---

## Configuracao de performance

**Amostragem em producao: 10%**
Sentry cobra por performance transactions. Com 10% de amostragem:
- 100 usuarios: 10 transactions amostradas
- 1.000 usuarios: 100 transactions
- Plano Hobby (gratuito): 10.000 performance units/mes

Para o launch (meta: 100-500 usuarios mes 1), 10% e mais que suficiente.
Nao estourar quota antes de ter dados relevantes.

**Metricas capturadas automaticamente:**
- Web Vitals (LCP, FCP, CLS, INP, TTFB) - complementa Vercel Analytics
- Server-side render time por rota
- Supabase query time (via fetch instrumentation)
- Edge middleware latencia

---

## Custo Sentry

| Plano | Preco | Errors/mes | Performance | Replay |
|---|---|---|---|---|
| **Developer (Free)** | **$0** | **5.000** | **10.000 units** | **50 sessions** |
| Team | $26/mes | 50.000 | 100.000 units | 500 sessions |
| Business | $80/mes | 100.000 | 500.000 units | 5.000 sessions |

**Recomendacao para Hayzer launch (ate 1.000 usuarios):**
Plano Developer (gratuito) e suficiente. 5.000 erros/mes = ~167 erros/dia.
Se Hayzer gerar mais de 167 erros unicos por dia, tem problema maior que cota.
Revisar plano apos 3 meses de producao estabilizada.

**Upgrade trigger:** se `used_errors / quota` > 80% em qualquer mes, migrar para Team.

---

## Env vars necessarias

```bash
# Sentry DSN — identificador publico do projeto (seguro em client)
NEXT_PUBLIC_SENTRY_DSN=https://[key]@o[org-id].ingest.us.sentry.io/[project-id]

# Auth token — para upload de sourcemaps no CI/CD (NAO expor no client)
SENTRY_AUTH_TOKEN=sntrys_...

# Org e projeto — para CLI e CI/CD
SENTRY_ORG=hayzer
SENTRY_PROJECT=hayzer-prod
```

**Onde obter:**
1. Criar conta em https://sentry.io (plano Developer, gratuito)
2. New Project -> Next.js
3. DSN: Settings -> Projects -> hayzer-prod -> Client Keys (DSN)
4. Auth Token: Settings -> Auth Tokens -> Create Token (escopo: project:write, org:read)

**Vercel env vars a setar (CEO faz via Dashboard ou `vercel env add`):**
- `NEXT_PUBLIC_SENTRY_DSN`: todos os ambientes (production + preview + development)
- `SENTRY_AUTH_TOKEN`: production + preview (necessario no build para sourcemaps)
- `SENTRY_ORG`: production + preview
- `SENTRY_PROJECT`: production + preview

---

## Alertas recomendados (configurar no Sentry Dashboard)

| Condicao | Canal | Threshold |
|---|---|---|
| Novo erro (nunca visto antes) | Email CEO + Ricardo | Imediato |
| Erro ocorre >10x/hora | Email CEO + Ricardo | 10 ocorrencias |
| Performance: LCP > 4s em >5% das sessoes | Email Ricardo | Diario |
| Taxa de erro sobe >50% vs semana anterior | Email CEO + Ricardo | Semanal digest |

---

## Riscos e mitigacoes

**R1 — Dados PII vazando para Sentry apesar do scrubbing**
Risco: campo novo adicionado por Felipe/Bruna que contem CPF sem passar pelo hook.
Mitigacao: `beforeSend` scrub e aplicado a TODOS os eventos antes do envio.
Revisao trimestral do hook com Otavio.

**R2 — Sentry atrasar renderizacao do site**
Risco: SDK client adiciona ~40KB gzipped ao bundle. SDK server: zero overhead (nao vai pro bundle).
Mitigacao: Sentry usa lazy loading no browser. Impacto em LCP: < 50ms (benchmark oficial).
Monitorar via Vercel Speed Insights apos ativacao.

**R3 — Auth token vazado em repositorio publico**
Risco: `SENTRY_AUTH_TOKEN` exposto no `vercel.json` ou em commit.
Mitigacao: token SEMPRE via Vercel env vars (server-side). Nunca em arquivo commitado.
Verificar `.gitignore` inclui `.env.local` (ja inclui).

**R4 — Sourcemaps expostos em producao**
Risco: sourcemaps revelam codigo-fonte ao browser (inspecionar -> Sources).
Mitigacao: `withSentryConfig` oculta sourcemaps do build publico por padrao
(`hideSourceMaps: true`). Upload so para o Sentry via `SENTRY_AUTH_TOKEN`.

---

## Rollback plan

**Se Sentry causar problema pos-instalacao:**
1. Remover `withSentryConfig()` wrapper do `next.config.ts`
2. Remover import do Sentry no `instrumentation.ts`
3. Push -> novo deploy (sem Rolling Releases ativo ainda = deploy imediato)
4. Tempo: < 10 minutos

Sentry nao e invasivo na arquitetura: e um wrapper + 3 arquivos de config.
Remocao completa e cirurgica.

---

## Cronograma de aplicacao

| Data | Acao |
|---|---|
| Semana de 16/06 | CEO cria conta Sentry, obtem DSN + Auth Token |
| Semana de 16/06 | CEO seta env vars no Vercel (4 vars acima) |
| 17/06 | Ricardo aplica os 4 arquivos de config (de `_sentry-prepared/`) |
| 17/06 | Ricardo adiciona `withSentryConfig()` no `next.config.ts` |
| 17/06 | Push -> deploy -> verificar Sentry Dashboard recebendo eventos |
| 18/06 | Configurar alertas de email (CEO + Ricardo) |
| 27/06 | Launch publico com Sentry ativo e alertas configurados |

**Por que 17/06 e nao antes?**
Sentry em producao sem usuarios gera zero valor. A janela de 10 dias pre-launch
e suficiente para calibrar alertas e confirmar que nenhum falso positivo esta
sendo gerado. Ativar muito antes desperdicaria quota de errors no plano gratuito.

---

## Referencias

- @sentry/nextjs docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- LGPD Art. 6 (finalidade, necessidade, adequacao) + Art. 46 (seguranca)
- Sentry Data Processing Agreement: https://sentry.io/legal/dpa/
- Sentry Privacy: dados de eventos armazenados em US-East (AWS us-east-1)
  Alternativa EU: `ingest.de.sentry.io` para dado na Alemanha (GDPR-friendly)
- ADR-018: decisions/018-rolling-releases-pre-launch.md (Rolling Releases, complementar a este)
- Principio P4: MTTR > MTBF (Phoenix Project, Kim)
- Principio P7: Amplificar feedback, nao suprimir (Phoenix Project, Kim)
