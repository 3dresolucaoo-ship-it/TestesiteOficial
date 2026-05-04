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
| `/api/webhooks/payment` | POST | ❌ depende B1 |
| `/api/webhooks/stripe` | POST | ✅ deletado em 2026-05-04 (substituído por `/api/webhooks/payment`) |
| `/api/content/sync` | POST | ⚠️ usa client browser — refatorar |

## Issues conhecidos

- ❌ Sem rate limiting em rotas públicas
- ❌ Sem validação Zod
- ❌ `/api/content/sync` usa `lib/supabaseClient` (browser) no server — não filtra `user_id`
- ❌ `/api/webhooks/stripe` duplica lógica de `payments/stripe.ts`
- ⚠️ Sem header `X-Robots-Tag: noindex`

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
