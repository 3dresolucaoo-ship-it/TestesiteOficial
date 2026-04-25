# /product:flow

Valida e corrige fluxo completo de produto: criação → estoque → produção → venda.

## INPUT
```
/product:flow [product_id ou problema]
```

## FLUXO ESPERADO
```
Produto criado
  → Estoque inicial definido
    → Pedido recebido
      → Produção iniciada
        → Estoque deduzido
          → Financeiro registrado
            → Dashboard atualizado
```

## ARQUIVOS RELEVANTES
```
services/products.ts
services/orders.ts
services/inventory.ts
services/production.ts
services/finance.ts
lib/store.tsx
```

## PROTOCOLO

### 1. VALIDAR PRODUTO
- Existe em `products` com `project_id` correto?
- Tem `stock_quantity` definido?
- Tem preço definido?

### 2. VALIDAR PEDIDO → ESTOQUE
- Ao criar pedido: `inventory` é deduzido?
- `movements` registra a saída?
- Estoque não fica negativo?

### 3. VALIDAR PEDIDO → PRODUÇÃO
- Pedido cria item em `production`?
- Status inicial correto (`pending`)?
- `project_id` propagado?

### 4. VALIDAR PEDIDO → FINANCEIRO
- `transactions` criado ao confirmar pedido?
- Valor correto (preço × quantidade)?
- Tipo `income` definido?

### 5. DASHBOARD
- Totais batem com DB?
- Sem dados de outros projetos?

## SAÍDA
```
PRODUTO: [status]
ESTOQUE: [status]
PRODUÇÃO: [status]
FINANCEIRO: [status]
PROBLEMA ENCONTRADO: [se houver]
FIX: [arquivo:linha]
```
