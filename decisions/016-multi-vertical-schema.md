# ADR 016 — Schema multi-vertical: ENUM vertical_type em projects

> **Data**: 19/05/2026
> **Status**: Proposto (aguarda aprovacao CEO antes de aplicar em prod)
> **Decisores**: Bruna (Backend) + Helena (Estrategia, validar enquadramento)
> **Custo de reversao**: BAIXO. DROP COLUMN + DROP TYPE reverte em segundos. Zero dado de usuario perdido. Sem dependencia de servico ainda (Onda 2 e quando services usarao o campo).

---

## Contexto

CLAUDE.md (19/05/2026) registra decisao CEO:

> "Arquitetura multi-vertical CONFIRMADA: Hayzer = umbrella + sub-marcas
> (Hayzer Maker Vertical 1 + Hayzer Beauty Vertical 2 futuro).
> Schema vertical_type + CSS multi-tema prep AGORA (~3h Bruna+Felipe Fase 1)."

ADR 010 formalizou o foco Maker para Onda 1 (launch 04/07/2026).
ADR 014 aprovou dashboard V4.8 MVP.
Beauty foi briefado para Helena em 05/07/2026 (ver `strategy/briefing-hayzer-beauty-05-07-executivo.md`).

O problema: sem `vertical_type` no banco, quando Onda 2 chegar sera necessario:
(a) migration de schema, (b) backfill de dados, (c) atualizacao de services e CSS simultaneamente.
Fazer a migration de schema AGORA, com zero usuarios em prod, elimina o risco (b): backfill em producao com dados reais e sempre o cenario mais perigoso.

---

## Decisao

Adicionar `vertical_type` ENUM em `projects` na Onda 1, com DEFAULT `'maker'`.

Nao criar services, CSS multi-tema ou logica de negocio ainda. Apenas o schema.
Services e CSS sao escopo de Onda 2 (Felipe + Bruna, a partir de 05/07/2026).

---

## Por que agora e nao na Onda 2

| Criterio | Agora (Onda 1, zero usuarios) | Na Onda 2 (pos-launch, dados reais) |
|---|---|---|
| Backfill de dados | Trivial: DEFAULT 'maker' cobre tudo | Arriscado: UPDATE em producao com usuarios ativos |
| Downtime | Zero (ADD COLUMN e instantaneo) | Potencial lock em tabela grande |
| Complexidade | 1 migration simples | Migration + script de backfill + validacao + rollback |
| Custo de reversao | Segundos | Horas + risco de inconsistencia |

**Regra do Kleppmann aplicada (Principio 4, DDIA Cap. 1)**: o custo maior de um sistema de dados e a manutencao, nao a criacao. Projetar o schema pensando em 5 anos custa muito menos do que reescrever depois.

---

## O que esta migration FAZ

1. Cria `public.vertical_type` ENUM com valores `('maker', 'beauty')`
2. Adiciona `projects.vertical_type` NOT NULL DEFAULT 'maker'
3. Cria index `projects_vertical_type_idx` para queries futuras por vertical
4. Nao altera nenhuma RLS policy existente

## O que esta migration NAO FAZ (escopo Onda 2)

- Nao cria service `services/verticals.ts`
- Nao altera CSS nem tokens de tema
- Nao adiciona `vertical_type` em outras tabelas (orders, products, etc.)
- Nao cria logica de roteamento por vertical
- Nao habilita Beauty para nenhum usuario

---

## Tradeoffs

### ENUM vs text com CHECK

**ENUM escolhido** porque:
- Postgres valida valores invalidos automaticamente em nivel de tipo (mais seguro que CHECK)
- Storage menor (4 bytes vs text variavel)
- Adicionar valor e simples: `ALTER TYPE public.vertical_type ADD VALUE 'novo_valor'` (sem lock em Postgres 12+)

**Risco do ENUM**: remover um valor exige `CREATE TYPE ... AS ENUM` novo + migrar coluna. Para um sistema com 2 verticais previstas e roadmap claro, esse tradeoff e aceitavel.

### NOT NULL DEFAULT 'maker' vs NULL

**NOT NULL DEFAULT 'maker'** escolhido porque:
- NULL semanticamente significaria "vertical desconhecida", que nao existe no modelo de negocio
- DEFAULT garante que INSERT sem especificar vertical_type vai para 'maker' automaticamente
- Services futuros nao precisam tratar NULL

### Index agora vs index na Onda 2

**Index criado agora** porque o custo e zero (tabela vazia ou com poucos projetos) e elimina necessidade de `CREATE INDEX CONCURRENTLY` em producao com dados.

---

## RLS: nenhuma alteracao necessaria

`vertical_type` e um atributo de negocio do projeto, nao um mecanismo de isolamento.
O isolamento entre usuarios ja e garantido pelas policies existentes em `projects`:

```sql
-- Policies existentes (nao alteradas):
-- SELECT: user_id = auth.uid()
-- INSERT: user_id = auth.uid()
-- UPDATE: user_id = auth.uid()
-- DELETE: user_id = auth.uid()
```

Quando Onda 2 precisar de isolamento por vertical (ex: admin Beauty nao ve dados Maker de outro usuario), isso sera resolvido no service layer com `.eq('vertical_type', verticalType)`, nao via RLS adicional. RLS cobre o isolamento de usuario; service layer cobre o filtro de vertical.

---

## Plano de aplicacao

1. CEO revisa este ADR e a migration
2. CEO aplica via Supabase MCP: `apply_migration` com arquivo `20260519_add_vertical_type.sql`
3. Bruna atualiza `supabase/migrations/CLAUDE.md` com entrada da nova migration
4. Nenhuma alteracao de codigo necessaria (services nao usam o campo ainda)

**Quando aplicar**: antes do CSS multi-tema de Felipe (Fase 1 paralela, ~3h). Felipe precisa saber que o campo existe no banco para alinhar o token de tema com o valor do projeto.

---

## Adicionar nova vertical no futuro (Onda 3+)

```sql
-- Exemplo: adicionar vertical 'food' na Onda 3
ALTER TYPE public.vertical_type ADD VALUE 'food';
-- Sem lock, sem rebuild de index, sem downtime.
```

Nenhuma migration de schema adicional e necessaria para novas verticais, apenas o ADD VALUE acima + service/CSS correspondente.

---

## Relacionados

- `supabase/migrations/20260519_add_vertical_type.sql` — migration que este ADR cobre
- `decisions/010-foco-vertical-maker-3d.md` — ADR que formalizou foco Maker Onda 1
- `strategy/briefing-hayzer-beauty-05-07-executivo.md` — briefing Beauty (Onda 2)
- `CLAUDE.md` § "Arquitetura multi-vertical CONFIRMADA" — decisao CEO 19/05
- Felipe (Frontend) — CSS multi-tema usa vertical_type como seletor de tema
- Helena (Estrategia) — valida enquadramento Beauty antes de habilitar na Onda 2
