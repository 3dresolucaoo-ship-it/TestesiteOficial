# /stock:sync

Sincroniza e valida estoque — detecta inconsistências.

## INPUT
```
/stock:sync [project_id ou módulo]
```

## ARQUIVOS RELEVANTES
```
services/inventory.ts
app/inventory/page.tsx
lib/supabase/schema.sql  → tabelas inventory + movements
```

## PROTOCOLO

### 1. VALIDAR SCHEMA
Tabela `inventory`:
- [ ] `product_id` (FK → products)
- [ ] `project_id`
- [ ] `quantity` (não negativo)
- [ ] `reserved_quantity`

Tabela `movements`:
- [ ] `inventory_id` ou `product_id`
- [ ] `type` (in/out/adjustment)
- [ ] `quantity`
- [ ] `reference_id` (pedido/produção que originou)
- [ ] `project_id`

### 2. VALIDAR SERVICE
`services/inventory.ts` deve:
- [ ] Filtrar por `project_id` sempre
- [ ] Usar transação ao deduzir estoque (evitar race condition)
- [ ] Registrar `movements` a cada alteração
- [ ] Impedir `quantity < 0`

### 3. DETECTAR INCONSISTÊNCIAS
```sql
-- Verificar se soma de movements bate com quantity atual
SELECT i.product_id, i.quantity,
  COALESCE(SUM(CASE WHEN m.type='in' THEN m.quantity ELSE -m.quantity END), 0) as calculated
FROM inventory i
LEFT JOIN movements m ON m.product_id = i.product_id
WHERE i.project_id = '[project_id]'
GROUP BY i.product_id, i.quantity
HAVING i.quantity != calculated;
```

### 4. CORRIGIR
- Se service não registra movements → adicionar
- Se quantity pode ficar negativo → adicionar check
- Se falta project_id → adicionar filtro

## SAÍDA
```
SCHEMA: ✓/✗
SERVICE: ✓/✗
INCONSISTÊNCIAS: [lista ou "nenhuma"]
FIXES: [lista]
```
