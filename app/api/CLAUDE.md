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
| `/api/checkout` | POST | ✅ OK |
| `/api/encomenda` | POST | ❌ insere em colunas inexistentes (B1) |
| `/api/payment-configs` | GET/POST/PATCH/DELETE | ✅ OK |
| `/api/integrations/mercadopago/connect` | GET | ✅ OK |
| `/api/integrations/mercadopago/callback` | GET | ✅ OK (precisa app Marketplace) |
| `/api/integrations/stripe/connect` | GET | ✅ OK (requer `STRIPE_CONNECT_CLIENT_ID` no env) |
| `/api/integrations/stripe/callback` | GET | ✅ OK — Stripe Connect Standard, troca code por access_token via `connect.stripe.com/oauth/token` |
| `/api/admin/reconcile-transactions` | POST | ✅ OK — cria transactions faltantes pra orders pagos legacy (idempotente) |
| `/api/finance/fixed-costs` | GET, POST | ✅ OK — lista/cria custos fixos por projeto |
| `/api/finance/fixed-costs/[id]` | PATCH, DELETE | ✅ OK — edita/remove um custo fixo |
| `/api/finance/profit-goal` | GET, PUT | ✅ OK — lê/upsert meta mensal por projeto |
| `/api/catalog/quote` | POST | ✅ OK — endpoint público, cria Lead via admin client; resolve dono via catalog.slug (Fase B) |
| `/api/webhooks/payment` | POST | ✅ OK — middleware libera (Otávio 17/05), MP signature obrigatória |
| `/api/webhooks/stripe` | POST | ✅ deletado em 2026-05-04 (substituído por `/api/webhooks/payment`) |
| `/api/content/sync` | POST | ✅ OK — auth + Zod + RLS server client (hardening Otávio 17/05) |

## Issues conhecidos

- ⚠️ Sem rate limiting nas rotas públicas (`/api/checkout`, `/api/encomenda`, `/api/catalog/quote`) — agendado Semana 2 ROADMAP
- ⚠️ Validação Zod incompleta — falta nas APIs autenticadas (`/api/finance/*`, `/api/payment-configs`) — agendado Semana 2
- ✅ ~~`/api/content/sync` usa `lib/supabaseClient` (browser) no server~~ — RESOLVIDO 2026-05-17 (Otávio): auth + Zod + RLS
- ✅ ~~`/api/webhooks/stripe` duplica lógica~~ — deletado 2026-05-04
- ⚠️ Sem header `X-Robots-Tag: noindex` nas rotas API

## Padrão pra criar rota nova

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { createServerClient } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // TODO: validar body com Zod
  const body = await req.json()

  const supabase = await createServerClient()
  // ... lógica
  return NextResponse.json({ success: true })
}
```

## Related

- `services/payments.ts` — abstração de provider
- `payments/{mercadopago,stripe}.ts` — implementações
- `decisions/001-mp-marketplace-vs-checkoutpro.md`
