# app/api/ — Rotas API (Route Handlers)

> Server-only. Nunca importadas de client components.

## Convenções

- **Auth**: usar `getUser()` de `@/lib/auth` no início de rotas autenticadas
- **DB**: usar `createServerClient()` (RLS) por padrão; só usar `getSupabaseAdmin()` em webhooks ou rotas com `merchant_id` explícito
- **Validação**: hoje manual; **TODO** padronizar com Zod
- **Erros**: sempre retornar JSON com `{ error: string }` + status code
- **Webhooks**: ler raw body com `Buffer.from(await req.arrayBuffer())` — necessário pra signature verification
- **Idempotência**: webhooks devem aceitar reentrada (usar UNIQUE no DB pra dedupe)
- **`merchantId`** em webhooks vem da URL (`?merchant=<uuid>`), nunca do body (anti-spoofing)

## Rotas

| Rota | Método | Status |
|---|---|---|
| `/api/checkout` | POST | ✅ OK — Zod + rate-limit 20/min (Otávio 17/05) |
| `/api/encomenda` | POST | ❌ insere em colunas inexistentes (B1) — mas já com Zod + rate-limit 20/min |
| `/api/payment-configs` | GET/POST/PATCH/DELETE | ✅ OK — Zod discriminated union por provider (Otávio 17/05) |
| `/api/integrations/mercadopago/connect` | GET | ✅ OK |
| `/api/integrations/mercadopago/callback` | GET | ✅ OK (precisa app Marketplace) |
| `/api/integrations/stripe/connect` | GET | ✅ OK (requer `STRIPE_CONNECT_CLIENT_ID` no env) |
| `/api/integrations/stripe/callback` | GET | ✅ OK — Stripe Connect Standard, troca code por access_token via `connect.stripe.com/oauth/token` |
| `/api/admin/reconcile-transactions` | POST | ✅ OK — cria transactions faltantes pra orders pagos legacy (idempotente) |
| `/api/finance/fixed-costs` | GET, POST | ✅ OK — Zod (Otávio 17/05) |
| `/api/finance/fixed-costs/[id]` | PATCH, DELETE | ✅ OK — Zod (Otávio 17/05) |
| `/api/finance/profit-goal` | GET, PUT | ✅ OK — Zod (Otávio 17/05) |
| `/api/catalog/quote` | POST | ✅ OK — endpoint público, Zod + rate-limit 10/min (Otávio 17/05). Cria Lead via admin client; resolve dono via catalog.slug (Fase B) |
| `/api/webhooks/payment` | POST | ✅ OK — middleware libera (Otávio 17/05), MP signature obrigatória. **`?merchant=calc-pro`** roteado pra handler de Calc Pro Subscription (Paulo 20/05, ADR-023) — eventos `customer.subscription.*` + `invoice.{paid,payment_failed}`, idempotencia via `webhook_events` |
| `/api/webhooks/stripe` | POST | ✅ deletado em 2026-05-04 (substituído por `/api/webhooks/payment`) |
| `/api/content/sync` | POST | ✅ OK — auth + Zod + RLS server client (hardening Otávio 17/05) |
| `/api/calc-pro/status` | GET | ✅ Paulo 20/05 — auth obrigatorio, retorna `{ active, status, trial_end, period_end, cancel_at_period_end }` da subscription do user logado (RLS calc_pro_sub_select_own). Fail-CLOSED em erro (active=false) |

## Issues conhecidos

- ✅ ~~Sem rate limiting nas rotas públicas (`/api/checkout`, `/api/encomenda`, `/api/catalog/quote`)~~ — RESOLVIDO 2026-05-17 (Otávio): `services/apiRateLimit.ts` + migration `20260518_api_rate_limits.sql`. DB-based fail-OPEN, mesmo padrão SHA-256(IP+salt) do waitlist. Limites: checkout/encomenda 20/min, quote 10/min. Pós-launch trocar pra Upstash Redis quando passar de 5k req/dia.
- ✅ ~~Validação Zod incompleta — falta nas APIs autenticadas (`/api/finance/*`, `/api/payment-configs`)~~ — RESOLVIDO 2026-05-17 (Otávio): `fixedCostCreateSchema`/`fixedCostPatchSchema`/`profitGoalSchema`/`paymentConfigSchema` (discriminated union) em `services/apiSchemas.ts`. Bloqueia XSS, oversize, NaN/Infinity em amounts.
- ✅ ~~`/api/content/sync` usa `lib/supabaseClient` (browser) no server~~ — RESOLVIDO 2026-05-17 (Otávio): auth + Zod + RLS
- ✅ ~~`/api/webhooks/stripe` duplica lógica~~ — deletado 2026-05-04
- ⚠️ Sem header `X-Robots-Tag: noindex` nas rotas API
- 📌 **CSP report-only ativado 2026-05-17** (`next.config.ts`): cobre Vercel scripts, fonts.googleapis, *.supabase.co, api.mercadopago.com, api.stripe.com, js.stripe.com. Modo report-only por 2-4 semanas pra observar violações no DevTools antes de promover pra enforcing.

## Padrão pra criar rota nova

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { createServerClient } from '@/lib/supabaseServer'
import { mySchema, zodErrorToPtBr } from '@/services/apiSchemas'
// PÚBLICA? adiciona:
// import { enforceApiRateLimit, getClientIp } from '@/services/apiRateLimit'

export async function POST(req: NextRequest) {
  // 1. Auth (se autenticada)
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 1.b Rate-limit (se PÚBLICA) — fail-OPEN se DB cair
  // const rl = await enforceApiRateLimit({ endpoint: 'minha-rota', ip: getClientIp(req), limit: 20, windowMs: 60_000 })
  // if (!rl.allowed) return NextResponse.json({ error: '...' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } })

  // 2. Validação Zod
  let rawBody: unknown
  try { rawBody = await req.json() } catch {
    return NextResponse.json({ error: 'Body inválido (JSON esperado)' }, { status: 400 })
  }
  const parsed = mySchema.safeParse(rawBody)
  if (!parsed.success) {
    const { message, fields } = zodErrorToPtBr(parsed.error)
    return NextResponse.json({ error: message, fields }, { status: 400 })
  }
  const data = parsed.data

  // 3. Lógica
  const supabase = await createServerClient()
  // ...
  return NextResponse.json({ success: true })
}
```

## Related

- `services/payments.ts` — abstração de provider
- `payments/{mercadopago,stripe}.ts` — implementações
- `decisions/001-mp-marketplace-vs-checkoutpro.md`
