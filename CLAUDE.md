# CONTEXTO DO PROJETO

Sistema SaaS multi-projeto (project_id). Next.js 16 + Supabase + Stripe + Vercel.

Módulos: vendas · estoque · produção · financeiro · dashboard · catálogo

**Contexto completo:** ler `skills/_ctx.md`
**Padrões de código:** ler `skills/_standards.md`

---

# REGRAS INVARIANTES

- Não recriar sistema — corrigir fluxos existentes
- `project_id` obrigatório em toda query ao DB
- Não misturar dados entre projetos
- RLS ativo em todas as tabelas

---

# MODO DE EXECUÇÃO

**Padrão: MODO RÁPIDO** (`skills/mode-fast.md`)
- Age direto, lê só o necessário, resposta curta
- Não explica antes de fazer
- Lista apenas arquivos alterados ao final

Para análise prévia: `/mode:analyze`

---

# SKILLS DISPONÍVEIS

## Core
| Skill | Arquivo | Uso |
|-------|---------|-----|
| `/bug:fix` | `skills/bug-fix.md` | Debug estruturado |
| `/feature:create` | `skills/feature-create.md` | Nova feature completa |
| `/ui:improve` | `skills/ui-improve.md` | Melhorar layout/UX |
| `/db:sync` | `skills/db-sync.md` | Validar/corrigir schema |
| `/deploy:check` | `skills/deploy-check.md` | Validar antes de deploy |

## Produto
| Skill | Arquivo | Uso |
|-------|---------|-----|
| `/catalog:improve` | `skills/catalog-improve.md` | Catálogo público |
| `/product:flow` | `skills/product-flow.md` | Fluxo produto→venda |
| `/stock:sync` | `skills/stock-sync.md` | Sincronizar estoque |
| `/sales:setup` | `skills/sales-setup.md` | Fluxo de vendas |

## Modo
| Skill | Arquivo | Uso |
|-------|---------|-----|
| `/mode:fast` | `skills/mode-fast.md` | Modo rápido (padrão) |
| `/mode:analyze` | `skills/mode-analyze.md` | Analisa antes de agir |

---

# REGRAS DE EFICIÊNCIA

- Ler `skills/_ctx.md` em vez de explorar o projeto
- Ler apenas arquivos do módulo solicitado
- Parar ao encontrar o erro — não continuar explorando
- Resposta curta: sem introdução, sem resumo final
- Ao usar skill: seguir o protocolo do arquivo exatamente
