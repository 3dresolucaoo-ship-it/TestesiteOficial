# ModuleShell

Shell editorial V4 reutilizavel para todos os modulos do dashboard Hayzer.
Extrai o pattern visual do mockup `orders-v4-tom-novo.html` em um componente
que qualquer rota de modulo pode importar e usar sem refatorar sua estrutura.

## O que o ModuleShell renderiza

```
┌──────────────────────────────────────────────────────┐
│  [EYEBROW MONO]                     [CSV] [+ NOVO]  │  <- page-header
│  Titulo Fraunces 64px + "sufixo italic"              │
│  Frase viva com marcadores inline                    │
├──────────────┬───────────────┬───────────────────────┤
│  HERO KPI    │  SATELITE 1   │  SATELITE 2           │  <- kpi-row
│  (petrol glow│               │                       │
│  + raizes)   │               │                       │
├──────────────────────────────────────────────────────┤
│  [Todos 47] [Prod. 5] [Pago 8]    [Buscar...]       │  <- filter-bar
├──────────────────────────────────────────────────────┤
│                                                      │
│  {children}  — tabela, grid ou cards do modulo       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Instalacao

O ModuleShell ja esta exportado no barrel:

```ts
import { ModuleShell } from '@/components/dashboard/v4'
```

## Exemplo completo: /orders

```tsx
'use client'

import { useState, useCallback } from 'react'
import { ModuleShell }          from '@/components/dashboard/v4'
import { UnderlineMarker }      from '@/components/visual-library'
import { OrdersTable }          from './_components/OrdersTable'

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [query, setQuery]         = useState('')

  const handleNew = useCallback(() => {
    // abre modal ou redireciona
  }, [])

  const handleExport = useCallback(() => {
    // exporta CSV
  }, [])

  return (
    <ModuleShell
      eyebrow="MAIO · SEM 03 · 12 ABERTOS · 35 ENTREGUES NO MES"
      title="Pedidos"
      titleItalicSuffix="essa semana"
      livePhrase={
        <>
          <UnderlineMarker tone="ember">8 pra entregar ate sexta</UnderlineMarker>,
          {' '}3 atrasaram, 2 ja sairam do galpao.
        </>
      }
      primaryAction={{ label: 'Novo pedido', onClick: handleNew }}
      secondaryAction={{ label: 'Exportar CSV', onClick: handleExport }}
      heroKpi={{
        label:       'FATURADO · 7 DIAS',
        value:       'R$ 4.280',
        unit:        ',50',
        delta:       '+18% vs sem 02',
        description: '23 pedidos fechados, ticket medio R$ 186.',
      }}
      satelliteKpis={[
        {
          label:       'TICKET MEDIO',
          value:       'R$ 186,10',
          description: 'aumentou com produtos Bambu na vitrine.',
          tone:        'neutral',
        },
        {
          label:       'ATRASADOS',
          value:       '3',
          description: 'Helena, Falconi e Rafael esperando filamento.',
          alertText:   'resolver ate quinta',
          tone:        'red',
        },
      ]}
      tabs={[
        { id: 'all',      label: 'Todos',               count: 47, active: true },
        { id: 'prod',     label: 'Produzindo',           count: 5  },
        { id: 'waiting',  label: 'Aguardando pagamento', count: 2  },
        { id: 'paid',     label: 'Pago',                 count: 8  },
        { id: 'shipped',  label: 'Enviado',              count: 4  },
        { id: 'late',     label: 'Atrasados',            count: 3  },
      ]}
      onTabChange={setActiveTab}
      searchPlaceholder="Buscar pedido, cliente..."
      onSearch={setQuery}
    >
      <OrdersTable activeTab={activeTab} query={query} />
    </ModuleShell>
  )
}
```

## Props reference

| Prop | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `eyebrow` | `string` | sim | Texto mono uppercase. Ex: "MAIO · SEM 03 · 12 ABERTOS" |
| `title` | `string` | sim | Palavra principal em Fraunces 64px |
| `titleItalicSuffix` | `string` | nao | Sufixo italic com UnderlineMarker ember |
| `livePhrase` | `ReactNode` | nao | Frase contextual, aceita marcadores inline |
| `primaryAction` | `{ label, onClick, icon? }` | nao | Botao petrol (ex: "Novo pedido") |
| `secondaryAction` | `{ label, onClick, icon? }` | nao | Botao ghost (ex: "Exportar CSV") |
| `heroKpi` | `ModuleShellHeroKpi` | sim | Card destaque petrol glow |
| `satelliteKpis` | `ModuleShellSatelliteKpi[]` | sim | Cards secundarios (normalmente 2) |
| `tabs` | `ModuleShellTab[]` | sim | Tabs de filtro com contagem |
| `onTabChange` | `(id: string) => void` | sim | Callback quando tab muda |
| `searchPlaceholder` | `string` | nao | Placeholder do input de busca |
| `onSearch` | `(q: string) => void` | sim | Callback quando query muda |
| `children` | `ReactNode` | sim | Conteudo principal (tabela, grid...) |

### ModuleShellHeroKpi

| Campo | Tipo | Obrigatorio |
|---|---|---|
| `label` | `string` | sim |
| `value` | `string` | sim |
| `unit` | `string` | nao |
| `delta` | `string` | nao |
| `description` | `string` | nao |

### ModuleShellSatelliteKpi

| Campo | Tipo | Obrigatorio |
|---|---|---|
| `label` | `string` | sim |
| `value` | `string` | sim |
| `description` | `string` | nao |
| `alertText` | `string` | nao |
| `tone` | `'neutral' \| 'ember' \| 'red' \| 'petrol'` | nao (default: neutral) |

### ModuleShellTab

| Campo | Tipo |
|---|---|
| `id` | `string` |
| `label` | `string` |
| `count` | `number` |
| `active` | `boolean?` |

## Ordem de migracao sugerida

O ModuleShell depende das classes CSS ja presentes no `app/globals-v4.css`
(`.kpi-row`, `.kpi-card`, `.hero-petrol`, `.filter-bar`, `.filter-tab`, `.page-header`, etc.).
Certifique-se de que o modulo destino importa esse CSS antes de migrar.

Ordem recomendada:

1. `/orders` (modulo mais proximo do mockup, validacao visual imediata)
2. `/finance` (KPIs monetarios ja existem, ajuste de labels)
3. `/inventory` (tabs por categoria de material)
4. `/products` (tabs por tipo de produto)
5. `/crm` (tabs por estagio de funil)
6. `/decisions`, `/content`, `/catalogs`, `/portfolios`, `/settings`, `/metrics`

## Convencoes criticas

- Zero em-dash em `eyebrow` e `livePhrase` (usar virgula/dois-pontos/ponto)
- `primaryAction.onClick` e `onTabChange` devem ser `useCallback` no modulo pai
- `satelliteKpis` com 2 itens = grid 1.4fr 1fr 1fr (ideal do mockup)
- iOS: o `<input>` de busca ja tem `fontSize: 16` para evitar zoom automatico
- Dark mode: funciona via CSS vars do `globals-v4.css` (data-theme no html)
