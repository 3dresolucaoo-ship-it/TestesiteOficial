# ADR 011 — Service Role no insert público da waitlist (RLS+RETURNING)

> **Data**: 15/05/2026
> **Status**: Aceito
> **Decisor**: Gabriel (CEO)
> **Custo de reversão**: BAIXO — reverter requer criar policy SELECT anon ou usar `.insert()` sem `.select()`

---

## Contexto

Form público de waitlist (`/`) usa Server Action que chama `services/waitlist.ts → addLeadStep1` pra inserir lead novo. Originalmente usava `createServerClient()` (cookie-based, RLS).

### Sintoma

Em produção, o form retornava genericamente:
> "Não foi possível concluir agora. Tenta de novo em instantes."

Logs Vercel mostravam apenas:
```
POST / 200 error [waitlistRateLimit] unexpec...
```

Logs Postgres revelaram o erro real:
```
ERROR: new row violates row-level security policy for table "waitlist_leads"
```

### Investigação

Confirmei via `SET LOCAL role anon` + INSERT direto no Supabase MCP:

```sql
-- Cenário A (sem RETURNING): FUNCIONA
SET LOCAL role anon;
INSERT INTO waitlist_leads (email, name, consent_lgpd, consent_at)
VALUES (...);
-- ✅ Sucesso

-- Cenário B (com RETURNING): FALHA
SET LOCAL role anon;
INSERT INTO waitlist_leads (...)
VALUES (...) RETURNING id, email;
-- ❌ ERROR: new row violates row-level security policy
```

### Causa raiz

`supabase-js` faz:
```ts
await supabase.from('waitlist_leads').insert(...).select('id, email').single()
```

Que vira `INSERT ... RETURNING id, email` no Postgres. **O `RETURNING` precisa de policy SELECT** pra retornar a linha inserida — mesmo que a linha foi acabou de criar.

A tabela `waitlist_leads` tinha:
- `waitlist_public_insert` (PERMISSIVE, INSERT, anon+authenticated, `WITH CHECK true`) ✅
- `waitlist_admin_select` (PERMISSIVE, SELECT, **só admin via `is_admin=true`**) ❌
- `waitlist_admin_update` (admin)
- `waitlist_admin_delete` (admin)

Anon podia INSERT mas não SELECT — então RETURNING violava RLS, mesmo na linha recém-inserida.

### Variável adicional

`SUPABASE_SERVICE_ROLE_KEY` **não estava setada no Vercel** (só tinha `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `NEXT_PUBLIC_SUPABASE_URL`). Isso fazia `getSupabaseAdmin()` lançar exception em `waitlistRateLimit.ts:countRecentLeadsByIpHash`, gerando o log misterioso `[waitlistRateLimit] unexpec...`.

---

## Decisão

**`addLeadStep1` e `updateLeadStep2` usam `getSupabaseAdmin()` (service_role, bypass RLS).**

### Justificativa

Server Action **já valida tudo antes de chamar** o service:
1. Honeypot (campo `website` invisível)
2. Time-check (≥ 2.5s entre render e submit)
3. Rate-limit por IP hash (3 leads/24h)
4. Zod schema (email válido, nome obrigatório, LGPD aceito)

O service_role só é alcançado depois desses 4 guards. Risco de abuso = mesmo que com policy RLS, mas sem o overhead de RETURNING falhando.

### O que não fizemos (alternativas descartadas)

#### A) Adicionar policy SELECT pra anon
```sql
CREATE POLICY waitlist_anon_select ON waitlist_leads
  FOR SELECT TO anon
  USING (false);  -- ou USING (created_at > now() - interval '5 seconds')
```
**Problema**: `false` impede RETURNING também (mesma RLS violation). E `USING (created_at > ...)` é hack frágil.

#### B) Não usar `.select()` no insert
```ts
await supabase.from('waitlist_leads').insert(...)
// sem .select() → sem RETURNING → INSERT puro funciona
```
**Problema**: precisamos do `data.id` retornado pra setar cookie `waitlist_lead_id` e linkar etapa 2. Sem ID, perdemos qualificação opcional.

#### C) Gerar UUID client-side antes do insert
**Problema**: precisaria expor `gen_random_uuid()` no cliente, e ainda precisaríamos validar uniqueness. Complica fluxo.

---

## Implementação

### Arquivos tocados (commit `fccd49f`)

- `services/waitlist.ts`:
  ```ts
  import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
  
  export async function addLeadStep1(...) {
    const supabase = getSupabaseAdmin()  // era: await createServerClient()
    // ... rest unchanged
  }
  
  export async function updateLeadStep2(...) {
    const supabase = getSupabaseAdmin()  // idem
    // ... rest unchanged
  }
  ```

- Vercel env vars: adicionada `SUPABASE_SERVICE_ROLE_KEY` (estava ausente)

### Validação

Teste fim-a-fim em prod (15/05/2026 03:12 BRT):
- ✅ Form submeteu sem erro
- ✅ Lead salvo: `teste-final@hayzer-test.com` no DB
- ✅ Redirect `/waitlist/obrigado` rolou
- ✅ WhatsApp CTA renderizou
- ✅ Email Resend tentou enviar (falhou só pq domain pending verify — graceful, lead persistiu)

---

## Consequências

### Positivas
- Form funciona em prod
- `waitlistRateLimit` também volta a funcionar (mesma env var resolveu)
- Pattern claro pra futuros forms públicos: **insert público + service_role** é OK quando validação rola na Server Action

### Negativas / aceitas
- Service_role bypass RLS — qualquer bug no service vira data leak. **Mitigação**: code review + Zod + Server Action é o único path; client não chama direto.
- `lib/supabaseAdmin.ts` agora é dependência crítica do flow público — se `SUPABASE_SERVICE_ROLE_KEY` cair, waitlist quebra. **Mitigação**: env var documentada em `.env.example`, sem fallback (fail-fast).

---

## Pattern reutilizável (pra outros forms públicos no futuro)

Quando tiver formulário sem auth (login, contato, etc) que precisa **INSERT + dados retornados** (id, etc):

1. **Server Action** valida tudo:
   - Bot guards (honeypot, time-check, rate-limit)
   - Zod schema
2. **Service** usa `getSupabaseAdmin()` (não `createServerClient`)
3. **Policy RLS** pode ter só INSERT pra `anon` (sem SELECT)
4. **Audit log**: considerar tabela `public_form_log` se volume justificar

---

## Relacionados

- `services/waitlist.ts` — implementação
- `services/waitlistRateLimit.ts` — depende de service_role pra count cross-IP
- `lib/supabaseAdmin.ts` — wrapper service_role
- `supabase/migrations/20260513_waitlist_leads.sql` — schema + policies originais
- `app/waitlist/actions.ts` — Server Action que chama o service
- ADR-010 — Foco vertical maker 3D (contexto do form atual)
