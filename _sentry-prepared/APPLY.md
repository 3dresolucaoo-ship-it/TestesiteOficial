# Como aplicar os configs Sentry (passo-a-passo para 17/06/2026)

**Prerequisito**: CEO criou conta Sentry e setou as 4 env vars no Vercel (ver ADR-017).

## Passo 1 — Instalar o pacote

```bash
npm install @sentry/nextjs@^10.53.1
```

## Passo 2 — Copiar arquivos para a raiz

```bash
# Da raiz do projeto:
cp _sentry-prepared/instrumentation.ts ./instrumentation.ts
cp _sentry-prepared/sentry.client.config.ts ./sentry.client.config.ts
cp _sentry-prepared/sentry.server.config.ts ./sentry.server.config.ts
cp _sentry-prepared/sentry.edge.config.ts ./sentry.edge.config.ts
```

## Passo 3 — Atualizar next.config.ts

Adicionar o wrapper `withSentryConfig` em torno do `nextConfig` existente.

**ANTES (next.config.ts atual):**
```typescript
export default nextConfig;
```

**DEPOIS:**
```typescript
import { withSentryConfig } from "@sentry/nextjs";

export default withSentryConfig(nextConfig, {
  // Org e projeto no Sentry (deve bater com env vars SENTRY_ORG e SENTRY_PROJECT)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token para upload de sourcemaps no CI
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Ocultar sourcemaps do bundle publico (codigo-fonte nao exposto no browser)
  hideSourceMaps: true,

  // Silenciar logs do Sentry no terminal de build (menos ruido)
  silent: true,

  // Auto-instrumentacao das rotas Next.js (captura erros automaticamente)
  autoInstrumentServerFunctions: true,
  autoInstrumentAppDirectory: true,

  // Tree-shaking: remover features nao usadas do bundle client
  disableLogger: true,

  // Tunnel route: evita que ad-blockers bloqueiem eventos Sentry
  // Cria /api/monitoring como proxy local
  tunnelRoute: "/api/monitoring",
});
```

**IMPORTANTE:** `tunnelRoute` cria automaticamente `app/api/monitoring/route.ts`.
Verificar apos o build que essa rota existe e nao conflita com rotas existentes.

## Passo 4 — Verificar build local

```bash
npm run build
```

Esperar: build completo sem erros TypeScript.
O Sentry vai tentar fazer upload de sourcemaps durante o build.
Se falhar por SENTRY_AUTH_TOKEN: verificar que a env var esta setada localmente em .env.local.

## Passo 5 — Commit e push

```bash
git add instrumentation.ts sentry.client.config.ts sentry.server.config.ts sentry.edge.config.ts next.config.ts package.json package-lock.json
git commit -m "feat: Sentry error tracking + performance monitoring (ADR-017)"
```

## Passo 6 — Verificar no Sentry Dashboard

1. Abrir https://sentry.io -> projeto hayzer-prod
2. Issues: deve aparecer vazio (sem erros em producao = bom sinal)
3. Performance: apos primeira visita ao site em producao, deve aparecer 1 transaction
4. Ir em Settings -> Projects -> hayzer-prod -> Client Keys: confirmar DSN bate com env var

## Passo 7 — Configurar alertas (Sentry Dashboard)

1. Alerts -> Create Alert -> Issue Alert:
   - "New issue": email CEO + Ricardo, imediato
2. Alerts -> Create Alert -> Issue Alert:
   - "Issue frequency > 10 in 1h": email CEO + Ricardo
3. Alerts -> Create Alert -> Metric Alert:
   - Performance: p95 LCP > 4000ms -> email Ricardo

---

**Rollback se der ruim:**
1. Remover o wrapper `withSentryConfig()` do next.config.ts (voltar ao `export default nextConfig`)
2. Remover import `@sentry/nextjs` do next.config.ts
3. O resto dos arquivos (instrumentation.ts, etc) pode ficar — sem o wrapper, nao sao carregados
4. `npm run build` -> commit -> push
5. Tempo total: < 10 minutos
