# /catalog:improve

Melhora catálogo público — performance, UX e conversão.

## INPUT
```
/catalog:improve [slug ou problema específico]
```

## ARQUIVOS RELEVANTES
```
app/catalogo/[slug]/page.tsx    → página principal
app/catalogs/page.tsx           → listagem
services/catalogs.ts            → queries
components/                     → componentes visuais
```

## PROTOCOLO

### 1. LEITURA MÍNIMA
Ler apenas: `app/catalogo/[slug]/page.tsx` + `services/catalogs.ts`

### 2. CHECKLIST DE QUALIDADE
- [ ] Imagens com `next/image` (width/height definidos)?
- [ ] Loading state no carregamento de produtos?
- [ ] Empty state quando catálogo vazio?
- [ ] SEO: `metadata` exportado na página?
- [ ] Slug único por projeto (filtro `project_id`)?
- [ ] Preço formatado corretamente (BRL)?
- [ ] Botão de contato/WhatsApp presente?
- [ ] Mobile responsivo?

### 3. PERFORMANCE
- Dados buscados server-side (não client fetch)?
- Imagens otimizadas?
- Não buscar produtos todos de uma vez se lista grande → paginar

### 4. CONVERSÃO
- CTA claro em cada produto
- Informações essenciais visíveis sem scroll
- Formulário de contato ou link direto

## SAÍDA
Lista de melhorias feitas + métricas esperadas (se aplicável).
