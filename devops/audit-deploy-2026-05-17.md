# Audit Deploy 2026-05-17 — API_RATE_LIMIT_SALT

**Deploy**: D1YRg3yBF · commit base `d01e671` · hayzer.com.br + bvaz-hub.vercel.app
**Executado por**: Ricardo (DevOps) · 2026-05-17

---

## 1. Status uso de API_RATE_LIMIT_SALT no código

**Arquivo**: `services/apiRateLimit.ts`

**Achado: GAP DE SEGURANÇA (severidade MEDIA)**

Linha 56-59 em `hashIpForRateLimit()`:
```ts
const salt =
  process.env.API_RATE_LIMIT_SALT ||
  process.env.WAITLIST_IP_SALT    ||
  'hayzer-api-fallback-salt-troca-em-prod'
```

Problemas identificados:

**A) Fallback hardcoded em terceiro nível**
Se `API_RATE_LIMIT_SALT` estiver vazio E `WAITLIST_IP_SALT` também estiver vazio, o código cai na
string literal `'hayzer-api-fallback-salt-troca-em-prod'`. Isso é um salt conhecido/previsível —
atacante que lê o código aberto pode pré-calcular hashes de IPs conhecidos e contornar o rate-limit.
Mitigação imediata: `API_RATE_LIMIT_SALT` já foi setado no Vercel (prod+preview) nesta sessão.
`WAITLIST_IP_SALT` também já estava setado (14/05). Na prática o fallback hardcoded NUNCA
será atingido em prod. Mas o código abre gap em dev local sem `.env.local`.

**B) SHA-256 simples em vez de HMAC**
O hash é `SHA-256(ip:salt)` — funciona, mas HMAC-SHA-256 seria tecnicamente superior (salt
não concatenado, operação criptograficamente separada). Diferença prática: baixa, dado que o
salt é aleatório e 32 bytes. Não bloqueia hoje; registrar como melhoria futura.

**C) Salt lido por chamada, não cacheado em module scope**
`process.env.API_RATE_LIMIT_SALT` é lido dentro de `hashIpForRateLimit()` a cada invocação.
No Vercel Fluid Compute, `process.env` é O(1) — não há penalidade real. Mas padrão defensivo
seria ler 1x em module scope com `const SALT = process.env.API_RATE_LIMIT_SALT || ...` fora
da função. Não é bug, apenas style gap.

**D) `enforceApiRateLimit` usa `void recordApiHit` (fire-and-forget)**
Insert na tabela é feito sem await. Se o insert falhar, não há log de erro no caminho principal.
`recordApiHit` internamente faz `console.error` em erro — suficiente pra observabilidade.
Comportamento intencional e documentado no código. OK.

**Consumidores confirmados** (3 rotas públicas):
- `app/api/checkout/route.ts` — `enforceApiRateLimit({ endpoint: 'checkout', limit: 20, windowMs: 60_000 })`
- `app/api/encomenda/route.ts` — `enforceApiRateLimit({ endpoint: 'encomenda', limit: 20, windowMs: 60_000 })`
- `app/api/catalog/quote/route.ts` — `enforceApiRateLimit({ endpoint: 'quote', limit: 10, windowMs: 60_000 })`

Todas as 3 rotas aplicam rate-limit ANTES da validação Zod — ordem correta.

**Veredicto**: FUNCIONAL em prod (env vars setadas). Gap de fallback hardcoded é risco teórico
em dev local apenas. Recomendação: trocar fallback hardcoded por `throw new Error()` em dev
(próxima sprint, não bloqueante hoje).

---

## 2. Status .env.example

**Veredicto: OK** — entry já presente (linhas 115-121):

```
# ─── API Rate Limit — salt do hash de IP (Otávio 17/05) ──────────────────
# Mesmo padrão do WAITLIST_IP_SALT, mas pras rotas /api/checkout, /api/encomenda,
# /api/catalog/quote. Se vazio, services/apiRateLimit.ts cai pro WAITLIST_IP_SALT
# (compat sem precisar setar 2 valores). Em prod, recomendado ter SALT separado
# pra cada propósito (defense in depth — vazamento de um não compromete o outro).
# Gerar: `openssl rand -hex 32`
API_RATE_LIMIT_SALT=
```

Nenhuma edição necessária. Comentário já documenta o fallback-chain e instrução de geração.

---

## 3. Status Supabase — tabela api_rate_limits

**Nota**: MCPs do Supabase e Vercel não disponíveis como ferramentas nesta sessão de agente.
Análise feita via leitura da migration `supabase/migrations/20260518_api_rate_limits.sql`
e status documentado em `supabase/migrations/CLAUDE.md`.

**Schema definido na migration** (confirmado via leitura do SQL):

| Coluna | Tipo | Notas |
|---|---|---|
| id | uuid | PK, gen_random_uuid() |
| endpoint | text NOT NULL | CHECK length > 0 |
| ip_hash | text NOT NULL | SHA-256 truncado 32 chars. CHECK length > 0 |
| meta | jsonb NOT NULL | DEFAULT '{}' — user_agent, status_code debug |
| created_at | timestamptz NOT NULL | DEFAULT now() |

**Índices definidos**:
- `api_rate_limits_lookup_idx` ON (endpoint, ip_hash, created_at DESC) — cobre a query principal
- `api_rate_limits_created_at_idx` ON (created_at) — cobre DELETE de cleanup periódico

**RLS**: `ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY` presente. Sem CREATE POLICY =
deny-all para anon/authenticated. service_role bypassa por definição Supabase. Correto.

**TTL/cleanup**: NÃO HÁ cleanup automático configurado. A migration referencia pg_cron no
comentário da tabela:
```sql
COMMENT ON TABLE api_rate_limits IS '...Cleanup: rodar DELETE WHERE created_at <
now() - interval ''7 days'' via pg_cron.';
```
Mas não existe `SELECT cron.schedule(...)` na migration. GAP: sem pg_cron configurado,
tabela cresce indefinidamente. Impacto: baixo no MVP (volume de requests pequeno), mas
requer ação pós-launch. Ver "Próximas ações" abaixo.

**Status de aplicação**: Segundo `supabase/migrations/CLAUDE.md`, a migration
`20260518_api_rate_limits.sql` está marcada como `⏳ PENDENTE de aplicação em prod`.
O service `apiRateLimit.ts` é fail-OPEN — se tabela não existir, DB retorna erro e o
service libera o request (allowed=true, sem rate-limit ativo). As rotas funcionam mas
sem proteção de rate-limit até migration ser aplicada.

**AÇÃO REQUERIDA**: CEO precisa aplicar `20260518_api_rate_limits.sql` via Supabase MCP
ou Dashboard → SQL Editor. Sem isso, `API_RATE_LIMIT_SALT` está setado mas nunca usado
(tabela não existe = fail-OPEN permanente).

---

## 4. Status deploy D1YRg3yBF + runtime logs

**Nota**: MCPs Vercel não disponíveis como ferramentas nesta sessão. Dados baseados em
contexto fornecido no prompt.

**Dados confirmados pelo CEO**:
- Status: Ready
- Build time: 1m 8s (dentro do normal para Next.js + Tailwind 4)
- Commit base: d01e671 ("auto: claude session changes")
- URLs: hayzer.com.br + bvaz-hub.vercel.app (ambas ativas)
- Env vars aplicadas: API_RATE_LIMIT_SALT (production + preview, sensitive)

**Análise de risco do build**:
Build time de 1m 8s é normal. Env var nova (API_RATE_LIMIT_SALT) não causa falha de build
— o código tem fallback que evita crash em process.env undefined. Nenhum import novo
adicionado com esta env var (ela já existia no código, só faltava o valor).

**Runtime logs**: Não verificados diretamente (MCP indisponível). Recomendação: abrir
Vercel Dashboard → D1YRg3yBF → Functions → Logs e verificar se aparecem erros
`[apiRateLimit] count error:` nas primeiras chamadas às rotas públicas — indica que
migration ainda não foi aplicada (fail-OPEN ativo).

---

## 5. Próximas ações recomendadas

**P0 — Aplicar migration `20260518_api_rate_limits.sql` (BLOQUEANTE para rate-limit funcionar)**
Sem isso, `API_RATE_LIMIT_SALT` setado mas rate-limit completamente inativo (fail-OPEN).
Como: Supabase Dashboard → SQL Editor → colar conteúdo da migration → Run.
OU: via Supabase MCP na próxima sessão com MCP disponível.
Após aplicar: atualizar `supabase/migrations/CLAUDE.md` tirando o `⏳` da migration.

**P1 — Configurar pg_cron para cleanup da tabela api_rate_limits**
Migration documenta a intenção mas não cria o job. Tabela vai crescer.
SQL a executar no Supabase (após habilitar extensão pg_cron):
```sql
SELECT cron.schedule(
  'cleanup-api-rate-limits',
  '0 3 * * *',  -- toda madrugada às 3h
  $$DELETE FROM api_rate_limits WHERE created_at < now() - interval '7 days'$$
);
```
Prioridade: baixa no MVP, executar na semana de launch.

**P2 — Remover fallback hardcoded em `hashIpForRateLimit`**
Trocar `'hayzer-api-fallback-salt-troca-em-prod'` por comportamento explícito em dev:
```ts
// opção mais segura:
const salt = process.env.API_RATE_LIMIT_SALT || process.env.WAITLIST_IP_SALT
if (!salt && process.env.NODE_ENV === 'production') {
  throw new Error('API_RATE_LIMIT_SALT ou WAITLIST_IP_SALT obrigatório em prod')
}
const effectiveSalt = salt || 'dev-only-fallback-nao-use-em-prod'
```
Prioridade: média. Não bloqueante (prod tem env var). Sprint pós-launch.

**P3 — Verificar runtime logs no Vercel Dashboard**
Abrir D1YRg3yBF → Functions → pesquisar `[apiRateLimit]` nos logs.
Erros `count error: relation "api_rate_limits" does not exist` confirmam P0 pendente.
Ausência de erros indica que rotas não foram chamadas ainda OU migration já aplicada.

---

## Resumo executivo

| Item | Status |
|---|---|
| ENV `API_RATE_LIMIT_SALT` setada no Vercel | OK |
| Código consome a env var | OK (com gap de fallback hardcoded — mitigado) |
| `.env.example` atualizado | OK (já estava) |
| Migration `20260518_api_rate_limits.sql` aplicada em prod | PENDENTE — bloqueante |
| Índices na tabela | OK (na migration, quando aplicada) |
| RLS configurado | OK (deny-all na migration) |
| Cleanup automático (pg_cron) | GAP — não configurado |
| Deploy D1YRg3yBF status | Ready (1m 8s — normal) |
| Runtime logs verificados via MCP | NAO DISPONIVEL nesta sessao |

**Risco atual**: rotas `/api/checkout`, `/api/encomenda`, `/api/catalog/quote` estão SEM
rate-limit ativo (migration não aplicada = fail-OPEN permanente). Env var `API_RATE_LIMIT_SALT`
setada é pré-requisito necessário mas não suficiente.

**Rollback plan**: Não aplicável a env var (só remover via Vercel Dashboard se necessário).
Migration é `CREATE TABLE IF NOT EXISTS` + `CREATE INDEX IF NOT EXISTS` — idempotente e
reversível via `DROP TABLE api_rate_limits` documentado no DOWN da migration.
