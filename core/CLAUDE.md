# core/ — Domain Logic

> Lógica de domínio pura: types, engines de cálculo, integrações externas.
> Sem dependência de React, Supabase, Next.js. **Testável em isolamento** (quando tivermos testes).

## Convenções

- Exportar **types** em `<dominio>/types.ts`
- Exportar **engines** (cálculos puros) em `<dominio>/engine.ts` ou `<dominio>/<feature>Engine.ts`
- Funções **stateless** — sem singleton, sem `let _state`
- Recebe dados como parâmetro, retorna resultado

## Estrutura

| Subpasta | Propósito | Status |
|---|---|---|
| `admin/` | `AdminConfig` + defaults | ✅ |
| `analytics/` | engines de cálculo (finance, content, production) | ✅ |
| `catalog/` | types de catálogo (templates) | ✅ |
| `crm/` | types CRM (Lead, Affiliate, stages) | ✅ |
| `finance/` | types + engine + invoice (não usado) | ⚠️ `invoice.ts` é dead code |
| `flows/` | orquestração `processOrder` (UI + admin) | ✅ |
| `integrations/` | adapters externos (Stripe, Bling, IG, YT) | ⚠️ vários stubs vazios |
| `inventory/` | types inventory + filament_uso | ✅ |
| `operations/` | `costCalculator` (cálculo de custo de impressão) | ✅ |
| `portfolio/` | types portfolio | ✅ (mas tabelas no DB não existem) |
| `products/` | types Product (template de impressão 3D) | ✅ |
| `shared/` | types compartilhados (`ProjectType`, `ProjectModule`) | ✅ |

## Issues conhecidos

- ❌ `core/finance/invoice.ts` — não importado em lugar nenhum (dead code)
- ❌ `core/integrations/stripe.ts` — legado, substituído por `payments/stripe.ts`
- ❌ `core/integrations/blingAdapter.ts` — stub vazio (todas funções retornam mensagem "em breve")
- ❌ `core/integrations/instagramAdapter.ts` — stub vazio
- ❌ `core/integrations/youtubeAdapter.ts` — stub vazio (importado em SettingsView mas não funcional)

## Padrão de novo engine

```ts
// core/<dominio>/<feature>Engine.ts
import type { ... } from '@/lib/types'

export interface FeatureResult { ... }

export function calcFeature(input: ...): FeatureResult {
  // pure computation, sem side-effects
}
```

## Related

- `services/` — usa engines pra calcular antes de persistir
- `lib/types.ts` — re-exporta tipos de `core/*/types.ts`
- `ROADMAP.md` § "Limpar código morto"
