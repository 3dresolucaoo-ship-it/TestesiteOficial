# /feature:create

Cria feature completa: DB + Service + UI + integração.

## INPUT
```
/feature:create [nome] [módulo] [descrição breve]
```

## PROTOCOLO (executar em ordem)

### 1. LEITURA MÍNIMA
Ler apenas:
- `lib/types.ts` → tipos existentes
- `lib/supabase/schema.sql` → tabelas existentes
- `services/[módulo].ts` → padrão do service do módulo

### 2. DB (se nova tabela/coluna)
- Verificar se tabela já existe no schema
- Criar migration SQL mínima
- Garantir: `project_id`, `user_id`, `created_at`, RLS policy

### 3. SERVICE
Criar/estender `services/[módulo].ts`:
- Função get com filtro `project_id`
- Função create/update com validação
- Função delete (soft delete se possível)
- Tipagem em `lib/types.ts`

### 4. UI
- Criar `components/[módulo]/[Feature]View.tsx`
- Conectar à página existente em `app/[rota]/page.tsx`
- Seguir padrões de `_standards.md`
- Reusar componentes existentes em `components/`

### 5. INTEGRAÇÃO
- Verificar se afeta outros módulos (estoque ↔ produção ↔ financeiro)
- Atualizar store em `lib/store.tsx` se necessário
- Checar project_id em todos os fluxos

## CHECKLIST ANTES DE FINALIZAR
- [ ] project_id presente em toda query
- [ ] Tipos exportados em lib/types.ts
- [ ] Sem dados hardcoded
- [ ] Sem console.log residual
- [ ] Componente usa variáveis CSS (não cores fixas)

## SAÍDA
Listar apenas: arquivos criados/modificados + o que cada um faz.
