# /db:sync

Valida e corrige schema Supabase — sem perda de dados.

## INPUT
```
/db:sync [módulo ou tabela]
```

## PROTOCOLO

### 1. LEITURA
- Ler `lib/supabase/schema.sql`
- Ler `services/[módulo].ts` → colunas que o service espera
- Ler `lib/types.ts` → interface do tipo

### 2. VALIDAR CONSISTÊNCIA
Checklist por tabela:
- [ ] Coluna `project_id` presente e indexada?
- [ ] Coluna `user_id` presente?
- [ ] RLS policy criada para SELECT/INSERT/UPDATE/DELETE?
- [ ] Índices em colunas de filtro frequente?
- [ ] Foreign keys corretas?

### 3. DIVERGÊNCIAS COMUNS
- Service usa coluna que não existe → adicionar coluna
- Tipo errado (text vs uuid) → migration segura
- RLS faltando → criar policy
- Index faltando → CREATE INDEX CONCURRENTLY

### 4. GERAR SQL
```sql
-- Migration segura (sempre ADD, nunca DROP sem confirmação)
ALTER TABLE [tabela] ADD COLUMN IF NOT EXISTS [coluna] [tipo];
CREATE INDEX IF NOT EXISTS idx_[tabela]_[coluna] ON [tabela]([coluna]);

-- RLS policy padrão
CREATE POLICY "users_own_data" ON [tabela]
  FOR ALL USING (auth.uid() = user_id);
```

### 5. NUNCA
- DROP TABLE sem confirmação explícita
- DROP COLUMN sem confirmação
- Alterar tipo de coluna com dados existentes sem CAST seguro

## SAÍDA
```
TABELA: [nome]
PROBLEMAS: [lista]
SQL: [migration gerada]
```
