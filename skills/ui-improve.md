# /ui:improve

Melhora layout/UX mantendo funcionalidade intacta.

## INPUT
```
/ui:improve [componente ou rota] [problema visual ou UX]
```

## PROTOCOLO

### 1. LEITURA
- Ler apenas o componente/página indicada
- Verificar quais dados já estão disponíveis (não buscar mais)

### 2. REGRAS DE MODIFICAÇÃO
- Só alterar: classes Tailwind, estrutura JSX, responsividade
- Não tocar: lógica, handlers, chamadas ao service, tipos
- Usar variáveis CSS (`bg-background`, `text-foreground`, `border-border`)
- Dark mode: garantir que `dark:` funciona onde aplicável
- Mobile first: verificar sm/md/lg breakpoints

### 3. PADRÕES DE UI
- Espaçamento: `gap-4`, `p-4`, `space-y-4` (múltiplos de 4)
- Cards: `rounded-lg border bg-card p-4`
- Botões: reusar componentes de `components/ui/`
- Loading: skeleton ou spinner — não deixar em branco
- Empty state: sempre mostrar mensagem quando lista vazia

### 4. NÃO FAZER
- Não adicionar novas bibliotecas
- Não criar animações complexas
- Não alterar estrutura de dados
- Não mover arquivos

## SAÍDA
Listar: componente modificado + mudanças feitas (antes/depois se relevante).
