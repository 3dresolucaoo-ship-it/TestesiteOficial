# PADRÕES INTERNOS

## Naming conventions
- Arquivos: kebab-case (`product-card.tsx`, `orders-service.ts`)
- Componentes: PascalCase (`ProductCard`, `OrdersTable`)
- Services: camelCase functions (`getOrders`, `createOrder`)
- DB columns: snake_case (`project_id`, `created_at`)
- Env vars: SCREAMING_SNAKE (`NEXT_PUBLIC_SUPABASE_URL`)

## Estrutura de um Service
```ts
// services/[modulo].ts
import { supabase } from '@/lib/supabaseClient'

export async function getItems(projectId: string) {
  const { data, error } = await supabase
    .from('table')
    .select('*')
    .eq('project_id', projectId)
  if (error) throw error
  return data
}
```

## Estrutura de página (App Router)
```ts
// app/[rota]/page.tsx
import { getUser } from '@/lib/getUser'

export default async function Page() {
  const user = await getUser()
  // fetch data server-side
  return <ClientComponent initialData={data} />
}
```

## Estrutura de componente
```ts
// components/[modulo]/ComponentName.tsx
'use client'
interface Props { ... }
export function ComponentName({ ... }: Props) { ... }
```

## Padrão de erro
```ts
import { serviceError } from '@/lib/serviceError'
try { ... } catch (e) { throw serviceError(e) }
```

## Conexão página → dados
1. `page.tsx` (server) busca dados via service
2. Passa como `initialData` para componente client
3. Componente usa store local ou SWR para updates

## Tailwind
- Usar variáveis CSS para cores (`bg-background`, `text-foreground`)
- Dark mode via classe `dark:` — tema já configurado
- Não usar valores hardcoded de cor (`bg-white` → `bg-background`)
