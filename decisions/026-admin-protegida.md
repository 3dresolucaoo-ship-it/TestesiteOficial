# ADR-026 — Tela /admin protegida: auth multi-camada, audit log, email massa, gerência waitlist

**Status**: PROPOSTO (aguarda aprovação CEO em PONTOS CRÍTICOS — ver §11)
**Data**: 2026-05-20 (madrugada hardwork)
**Owner**: Otávio (Security) — proposta de spec; **CEO aprova access control antes de implementar**
**Revisores**: Bruna (Backend), Helena (Estratégia)
**Implementação proposta**: Wave 1 pós-launch (28/06–04/07) OU emergencial pré-launch (02-08/06) se priorizar email massa

**Memória CEO citada**: "access control NUNCA é decisão autônoma" — Otávio PROPÕE, CEO aprova explícito antes de implementar. Este ADR cumpre essa regra.

---

## 1. Problema

Hoje (20/05/2026) Hayzer não tem **tela de administração**. CEO precisa de 4 capacidades antes do launch público 27/06:

1. **Audit log**: visualizar ações sensíveis (login admin, mudança de role, deletar lead, refund, alteração payment config). Hoje = zero rastreabilidade.
2. **Email massa pra waitlist**: hoje, 250+ leads na waitlist e cresce. Precisa disparar 1) anúncio soft launch (~10/06), 2) anúncio launch (~26/06), 3) re-engajamento (D+7 D+30 etc). Sem tela = fazer via SQL direto + Resend cURL = inviável.
3. **Lista waitlist segmentada**: ver inscritos, filtrar por interesse declarado (maker/beauty), segmento, status (active/converted/unsubscribed), data inscrição.
4. **Visão geral operacional**: nº pedidos hoje, nº webhooks falhados nas últimas 24h, MRR atual, usuários ativos. Hoje = abrir Supabase Dashboard manualmente.

Sem tela = CEO depende de Otávio/Bruna/Lia rodando SQL ad-hoc. Não escala. Aumenta risco de erro humano (DELETE FROM waitlist_leads sem WHERE = dia ruim).

---

## 2. Princípios de design

Antes de spec, princípios não-negociáveis:

1. **Defesa em camadas**: 3 níveis de check (middleware + RLS + service-level). Falha de 1 não compromete.
2. **Role via DB, NUNCA env var**: `ADMIN_PASSWORD` em `.env` = teatro. Qualquer leak (logs, GitHub, screenshot) = comprometimento. **Apenas `profiles.role = 'admin'` no Supabase**.
3. **Audit-log primeiro, feature depois**: implementar tabela `audit_logs` ANTES de tela `/admin`. Toda ação em `/admin` é logada. Sem log = sem feature.
4. **Princípio do mínimo privilégio**: admin ≠ superuser. Email massa precisa de **dupla confirmação** + rate limit. Ler waitlist ≠ deletar waitlist (2 escopos).
5. **LGPD-aware**: ações de admin sobre dados de usuário (leitura de waitlist, deletar lead, exportar) são **bases legais distintas** — logadas + justificadas.
6. **Fail-secure**: se a checagem de role falhar (erro DB), nega acesso. NUNCA fail-open.
7. **Idempotência em ações destrutivas**: deletar lead, anular pedido, refund = idempotente + reversível (`deleted_at` em vez de DELETE).

---

## 3. Modelo de dados

### 3.1 Tabela `profiles` (já existe)

`lib/supabase/schema.sql:5-10`:
```sql
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text        NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**Decisão**: usar `profiles.role IN ('user', 'admin', 'super_admin')`.

- `user` — usuário comum (default — TODA conta nova é user)
- `admin` — pode ler waitlist, ver audit_logs, listar pedidos de qualquer user (suporte). Não pode deletar conta, nem alterar role de outros, nem disparar email massa sem aprovação CEO.
- `super_admin` — pode tudo o que admin pode + disparar email massa + alterar role de outros + soft-delete waitlist_leads. **Inicialmente, apenas CEO (`3dresolucaoo@gmail.com`)**.

**Migration necessária**: `20260601_role_check_constraint.sql`:
```sql
-- Adiciona CHECK no role + seed CEO como super_admin
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'admin', 'super_admin'));

-- Seed CEO (CEO precisa estar logado pelo menos 1x antes pra ter profile row)
UPDATE profiles
SET role = 'super_admin'
WHERE id = (SELECT id FROM auth.users WHERE email = '3dresolucaoo@gmail.com' LIMIT 1);

-- Comment de doc
COMMENT ON COLUMN profiles.role IS
  'Auth role. user=default, admin=suporte+leitura admin, super_admin=full+email massa. CEO somente.';
```

**Inconsistência atual a resolver**: waitlist policies (`20260513_waitlist_leads.sql:108-122`) usam `auth.users.raw_app_meta_data->>'is_admin'`, **NÃO** `profiles.role`. Esses 2 caminhos NÃO são compatíveis hoje. Decisão:

- **Migrar policies do waitlist pra `profiles.role`** (consistência) — migration `20260601_waitlist_policies_use_profiles_role.sql`. Único caminho. Elimina drift.

### 3.2 Tabela `audit_logs` (NOVA)

```sql
-- supabase/migrations/20260601_audit_logs.sql

CREATE TABLE IF NOT EXISTS audit_logs (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  -- actor: quem executou (admin id). NULL se sistema (webhook).
  actor_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role   text        NOT NULL DEFAULT 'system',  -- user|admin|super_admin|system
  action       text        NOT NULL,                   -- ex: 'waitlist.email_blast', 'order.refund', 'profile.role_change'
  target_type  text,                                   -- ex: 'waitlist_lead', 'order', 'profile', 'payment_config'
  target_id    text,                                   -- ID da row alvo (text aceita uuid ou text PK)
  metadata     jsonb       NOT NULL DEFAULT '{}',      -- before/after, ip_hash, justification, etc
  ip_hash      text,                                   -- SHA-256(IP + salt) — LGPD-friendly
  user_agent   text,                                   -- truncado em 500 chars
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_actor_id_idx    ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS audit_logs_target_idx      ON audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx      ON audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx  ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- SELECT: APENAS admin/super_admin
CREATE POLICY "audit_logs_admin_select" ON audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
    )
  );

-- INSERT: APENAS service_role (escrita feita via services/auditLog.ts com admin client)
-- (sem policy de INSERT pra authenticated = bloqueia)

-- UPDATE/DELETE: NENHUM — audit log é append-only por princípio
-- (sem policy = bloqueia mesmo pra service_role exceto via SQL direto no Supabase Dashboard)

COMMENT ON TABLE audit_logs IS
  'Append-only audit log. SELECT só admin via RLS. INSERT só via service_role (helper services/auditLog.ts). UPDATE/DELETE proibido (ZERO policies — só SQL Editor manual em incidente).';
```

**Por que `actor_id` separado de `user_id`?**
- `user_id` = quem foi afetado pela ação (ex: lead que foi deletado, order que foi alterado)
- `actor_id` = quem executou a ação (ex: admin que clicou em deletar)
- Em muitos casos são iguais (user editando próprio profile). Em ações admin, são diferentes.
- Pra LGPD: precisamos saber QUEM acessou dados de QUEM, separadamente.

**Por que ip_hash em vez de IP cru?**
- Mesma decisão do waitlist (`waitlistRateLimit.ts`): SHA-256(IP + `WAITLIST_IP_SALT`). LGPD prefere hash quando finalidade é correlação interna, não rastreamento.

### 3.3 Tabela `email_blasts` (NOVA — pra email massa)

```sql
-- supabase/migrations/20260601_email_blasts.sql

CREATE TABLE IF NOT EXISTS email_blasts (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  subject         text        NOT NULL,
  template_id     text        NOT NULL,  -- ex: 'soft_launch_announce', 'launch_announce', 're_engagement_d7'
  segment_filter  jsonb       NOT NULL DEFAULT '{}',  -- ex: {"vertical": "maker", "status": "active"}
  estimated_count integer     NOT NULL DEFAULT 0,
  sent_count      integer     NOT NULL DEFAULT 0,
  failed_count    integer     NOT NULL DEFAULT 0,
  status          text        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirming', 'sending', 'sent', 'failed', 'aborted')),
  scheduled_at    timestamptz,
  started_at      timestamptz,
  completed_at    timestamptz,
  metadata        jsonb       NOT NULL DEFAULT '{}',  -- preview html, etc
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_blasts_status_idx     ON email_blasts(status);
CREATE INDEX IF NOT EXISTS email_blasts_created_at_idx ON email_blasts(created_at DESC);
CREATE INDEX IF NOT EXISTS email_blasts_actor_id_idx   ON email_blasts(actor_id);

ALTER TABLE email_blasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_blasts_admin_select" ON email_blasts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
    )
  );

-- INSERT/UPDATE/DELETE: apenas service_role (rotas API admin)
-- (sem policy = bloqueia tudo via cliente normal)

COMMENT ON TABLE email_blasts IS
  'Histórico de envios em massa. Cada blast: draft→confirming→sending→sent. Rate-limit aplicado no service: max 1 blast/dia.';
```

---

## 4. Arquitetura de acesso (defesa em camadas)

### Camada 1 — Middleware (`middleware.ts`)

Adicionar bloco antes do `redirect → /login`:

```typescript
// middleware.ts (depois da checagem de sessão atual)

// Bloqueio de /admin/* pra não-admins
if (request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/api/admin')) {

  if (!user) {
    // sem user logado = mesma resposta de qualquer rota privada
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Checa role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Fail-secure: se erro ou role inválido, redireciona pra 404 (não /login — não revela existência de /admin)
  if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
    const url = request.nextUrl.clone()
    url.pathname = '/404'
    return NextResponse.rewrite(url)  // rewrite preserva URL no browser, 404 server-side
  }
}
```

**Por que rewrite pra /404 em vez de /login?**
- Defense em profundidade: não revela que `/admin` existe.
- Atacante que tenta `/admin` recebe a mesma resposta de `/qualquer-coisa-inexistente`. **Security through obscurity NÃO é defesa, mas reduz superfície de reconhecimento.**

### Camada 2 — RLS (Row Level Security)

Já coberto em §3.2 (audit_logs) e §3.3 (email_blasts). Toda tabela administrativa tem policy `IN ('admin', 'super_admin')`.

**Adicional para `waitlist_leads`** (migration §3.1):
```sql
-- 20260601_waitlist_policies_use_profiles_role.sql

-- Substitui policies antigas que usam raw_app_meta_data
DROP POLICY IF EXISTS "waitlist_admin_select" ON public.waitlist_leads;
CREATE POLICY "waitlist_admin_select" ON public.waitlist_leads
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- Idem pra update + delete
-- ...
```

### Camada 3 — Service-level (defesa adicional em código)

`services/adminGuard.ts` (NOVO):

```typescript
import { requireUserId } from '@/lib/getUser'
import { createServerClient } from '@/lib/supabase/server'
import { serviceError } from '@/lib/serviceError'

export type AdminRole = 'admin' | 'super_admin'

/**
 * Garante que o usuário logado tem role admin ou super_admin.
 * Lança erro com mensagem PT-BR caso contrário.
 * USAR EM TODA ROTA /api/admin/* + Server Action de /admin/*.
 */
export async function requireAdminRole(
  minRole: AdminRole = 'admin'
): Promise<{ userId: string; role: AdminRole }> {
  const userId = await requireUserId()
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) serviceError('adminGuard.requireAdminRole', error)
  if (!data) throw new Error('Perfil não encontrado.')

  const role = data.role as AdminRole | 'user'

  if (minRole === 'super_admin' && role !== 'super_admin') {
    throw new Error('Permissão insuficiente. Requer super_admin.')
  }
  if (minRole === 'admin' && !['admin', 'super_admin'].includes(role)) {
    throw new Error('Permissão insuficiente.')
  }

  return { userId, role: role as AdminRole }
}
```

**Uso obrigatório**:
- Rota `/api/admin/*`: `const { userId, role } = await requireAdminRole('admin')` no topo
- Server Action `/admin/*`: idem
- Listar waitlist: `await requireAdminRole('admin')`
- Disparar blast: `await requireAdminRole('super_admin')`
- Alterar role: `await requireAdminRole('super_admin')`

**Por que checar role no service mesmo com middleware + RLS?**
- Middleware pode ser bypassado se um dev novo esquecer de adicionar matcher
- RLS protege a tabela mas não bloqueia operação cross-table (ex: admin tentando ler tabela X via JOIN sem policy)
- **Princípio do "log everything"**: chamar `requireAdminRole` aciona audit log (§5) sem o dev precisar lembrar de logar manualmente

---

## 5. Helper `services/auditLog.ts`

```typescript
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { headers } from 'next/headers'
import { createHash } from 'crypto'

const AUDIT_IP_SALT = process.env.AUDIT_IP_SALT || process.env.WAITLIST_IP_SALT
// Reaproveita salt do waitlist se AUDIT_IP_SALT ausente — uma var a menos pra setar.

export type AuditAction =
  | 'auth.login'
  | 'auth.logout'
  | 'auth.failed'
  | 'waitlist.email_blast'
  | 'waitlist.lead_delete'
  | 'waitlist.export'
  | 'order.refund'
  | 'order.delete'
  | 'order.status_change'
  | 'payment_config.upsert'
  | 'payment_config.delete'
  | 'payment_config.activate'
  | 'profile.role_change'
  | 'webhook.received'
  | 'webhook.signature_invalid'
  | 'admin.dashboard_view'

export interface AuditLogInput {
  actorId: string | null
  actorRole?: 'user' | 'admin' | 'super_admin' | 'system'
  action: AuditAction
  targetType?: string
  targetId?: string
  metadata?: Record<string, unknown>
  userId?: string | null  // afetado pela ação
}

/**
 * Append-only audit log writer. Usa service_role.
 * Falha silenciosa (console.error) — NÃO bloqueia operação principal.
 * Justificativa: melhor falhar log do que bloquear feature por erro de log.
 */
export async function logAction(input: AuditLogInput): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()
    const hdrs = await headers()

    const ip = getClientIp(hdrs)
    const ipHash = ip ? createHash('sha256').update(ip + AUDIT_IP_SALT).digest('hex') : null
    const userAgent = hdrs.get('user-agent')?.slice(0, 500) || null

    const { error } = await supabase.from('audit_logs').insert({
      user_id: input.userId ?? null,
      actor_id: input.actorId,
      actor_role: input.actorRole ?? 'user',
      action: input.action,
      target_type: input.targetType ?? null,
      target_id: input.targetId ?? null,
      metadata: input.metadata ?? {},
      ip_hash: ipHash,
      user_agent: userAgent,
    })

    if (error) console.error('[auditLog] failed:', error)
  } catch (err) {
    console.error('[auditLog] unexpected:', err)
  }
}

function getClientIp(hdrs: Headers): string | null {
  return (
    hdrs.get('x-forwarded-for')?.split(',')[0].trim() ||
    hdrs.get('x-real-ip') ||
    null
  )
}
```

**Chamadas obrigatórias** (Otávio orienta Bruna a inserir):
- `app/api/auth/*` callbacks → `logAction({ action: 'auth.login', actorId: userId })`
- `app/api/webhooks/payment/route.ts` → `logAction({ action: 'webhook.received', actorRole: 'system' })`
- `app/api/payment-configs/route.ts` POST/DELETE → `logAction({ action: 'payment_config.upsert' })`
- Todas as rotas `/api/admin/*` → `logAction` no início
- `services/orders.ts.refund()` (a criar) → `logAction({ action: 'order.refund' })`

---

## 6. Rate limit dedicado pra `/api/admin/*`

Reaproveitar `services/apiRateLimit.ts` (já existe — Tier 1 fechado em 17/05). Aplicar em rotas admin:

| Rota | Limite | Janela | Razão |
|---|---|---|---|
| `POST /api/admin/email/blast` | 1/dia/super_admin | 24h | Cost guard Resend + LGPD: 1 blast/dia é o máximo razoável |
| `POST /api/admin/email/blast/confirm` | 3/h | 1h | Confirmação dupla — não escala mas evita typo dupla |
| `GET /api/admin/waitlist` | 60/min | 1min | Leitura admin frequente, sem impacto |
| `DELETE /api/admin/waitlist/:id` | 20/min | 1min | Limite razoável de "deletar manualmente" |
| `GET /api/admin/audit-logs` | 60/min | 1min | Leitura — sem impacto |
| `POST /api/admin/profile/role` | 5/h | 1h | Promoção de role é raríssimo — limite baixo expõe abuso |

Implementação: 1 linha em cada handler:
```typescript
const rateLimitResult = await enforceApiRateLimit(req, 'admin.email_blast', 1, 24 * 60 * 60 * 1000)
if (!rateLimitResult.ok) return rateLimitResult.response
```

---

## 7. Email massa: fluxo completo

### 7.1 UI `/admin/email/new`

1. Admin escolhe template (`soft_launch_announce`, `launch_announce`, `re_engagement_d7`, `custom`)
2. Filtros: `vertical IN ('maker', 'beauty', null)`, `status IN ('active', 'converted', 'unsubscribed')`, `segment IN (...)`
3. Preview com 1 lead aleatório do segmento (renderiza HTML)
4. Mostra **count estimado** + **custo Resend estimado** ($0.00 dentro do free tier de 3k/mês, $0.001/email após)
5. Botão "Salvar como rascunho" → cria row em `email_blasts` com status `'draft'`
6. Botão "Pré-enviar" → status `'confirming'`, gera token de confirmação único, envia email DE CONFIRMAÇÃO pro super_admin com link `/admin/email/blast/:id/confirm?token=xxx`
7. Super_admin clica no link de confirmação → status `'sending'` + dispara o blast assincronamente
8. Background job (cron Vercel ou Supabase pg_cron) pega o blast `'sending'`, divide em batches de 100, envia via Resend, atualiza `sent_count` / `failed_count`
9. Quando terminar → status `'sent'`, log final em `audit_logs`

### 7.2 Por que dupla confirmação?

- Email massa é IRREVERSÍVEL. Se mandar errado pra 500 pessoas, dia ruim, possível ban Resend.
- 2 cliques + token único + delay de ~30s entre criar e confirmar dá chance de cancelar.
- Token expira em 1h.
- Cancelar = status `'aborted'`, log no audit.

### 7.3 Anti-bounce + LGPD

- Toda email massa **DEVE incluir link de unsubscribe** (`/api/waitlist/unsubscribe?token=xxx`).
- Token = HMAC(email + secret) — não dá pra forjar, dá pra revogar.
- Resend já trata bounce automaticamente — marca `status = 'bounced'` no waitlist_leads.
- LGPD Art. 9 (consentimento): waitlist já tem checkbox de consent (`components/landing/WaitlistForm.tsx`). OK.

### 7.4 Templates HTML

Reaproveitar wrapper de `services/email.ts`. Criar `services/emailTemplates/` com 1 arquivo por template:

- `soft_launch_announce.ts` (renderHtml + renderText)
- `launch_announce.ts`
- `re_engagement_d7.ts`
- `re_engagement_d30.ts`
- `custom.ts` (recebe HTML cru do admin — sanitizar via DOMPurify server-side antes)

---

## 8. UI `/admin` — estrutura proposta

Sidebar minimal, paleta Hayzer (petrol + ember). Componente `<AdminShell>`:

```
/admin                       — overview (cards de KPI)
/admin/waitlist              — lista paginada
/admin/waitlist/:id          — detalhe + audit log do lead
/admin/email                 — lista de blasts (histórico)
/admin/email/new             — criar blast (UI §7.1)
/admin/email/:id             — detalhe + status
/admin/audit-logs            — feed de audit logs (paginado, filtros)
/admin/users                 — lista usuários (só super_admin)
/admin/users/:id             — alterar role (só super_admin, audit log obrigatório)
```

KPIs do overview (carrega via Server Component, RSC):

- Pedidos hoje (count + soma valor)
- Webhooks falhados últimas 24h (count `audit_logs.action = 'webhook.signature_invalid'`)
- Waitlist total (count + delta últimas 24h)
- MRR atual (se já houver pagamento ativo)
- Última 5 ações admin (audit_logs preview)

**Não fazer dashboard rico pra MVP**: 4 KPIs + 1 tabela "última atividade". Detalhes ficam nas sub-páginas.

---

## 9. Cronograma proposto

**Opção A — Wave 1 pós-launch (28/06–04/07)**:
- Janela de 1 semana, sem pressão.
- Email massa pré-launch (anúncio soft launch + anúncio launch) feito **manualmente via cURL Resend** com SQL prévio pra pegar lista. Aceitável pra 2 disparos.
- Risco: se webhook explodir pré-launch, CEO não tem audit log pra investigar.

**Opção B — Emergencial pré-launch (02-08/06)**:
- Janela de 7 dias, paralelo a Sentry setup (ADR-025).
- Email massa **pronta pra soft launch 11-13/06**.
- Audit log **ativo durante soft launch** = telemetria de incidentes.
- Custo: ~12-15h de Bruna + Felipe (UI mínimo).

**Recomendação Otávio**: **Opção B** — audit log + email massa pré-launch valem 15h de esforço. Email manual via cURL é arriscado (typo no segment filter = 1k emails errados).

---

## 10. Riscos e mitigações

**R1 — Super_admin perde acesso por erro de role**
Risco: alguém roda `UPDATE profiles SET role = 'user' WHERE id = CEO_id` por engano.
Mitigação:
- Constraint SQL: `CHECK ((SELECT count(*) FROM profiles WHERE role = 'super_admin') >= 1)` em trigger BEFORE UPDATE
- Seed automático CEO super_admin a cada deploy (idempotente)
- Acesso de break-glass via Supabase SQL Editor (sempre disponível pro owner do projeto)

**R2 — Token de confirmação de blast vazado em log**
Risco: link de confirmação aparece em log do Vercel.
Mitigação: token tem TTL 1h + uso único (DELETE após click). Se vazar, janela curta. Logar apenas hash do token, não o token cru.

**R3 — Email blast em loop por bug em background job**
Risco: job retentar batch com falha sem max attempts → 10x emails pro mesmo destinatário.
Mitigação:
- UNIQUE constraint em `email_blasts_sent (blast_id, recipient_email)` — bloqueia duplicate
- Max attempts = 3 por batch
- Cost guard global: nunca envia mais de `estimated_count * 1.1` emails (10% margem pra retry)

**R4 — RLS bypass via JOIN não-protegido**
Risco: dev novo escreve query `SELECT * FROM waitlist_leads JOIN audit_logs ON ...` que retorna dados sem filtro.
Mitigação:
- TODA rota admin chama `requireAdminRole()` no topo (camada 3)
- ESLint custom rule: warn se rota em `/app/api/admin/*` não importar `adminGuard.ts` (Tier 3, pós-launch)

**R5 — Audit log cresce ilimitado**
Risco: 6 meses depois, `audit_logs` com 10M rows = query lenta.
Mitigação:
- pg_cron job mensal: archive logs >180 dias pra `audit_logs_archive` (mesma estrutura)
- Tier 2 após 90 dias de prod.

**R6 — LGPD: titular pede acesso ou deleção dos seus audit logs**
Risco: usuário pede "quero ver tudo que vocês têm sobre mim" — audit_logs entram nessa.
Mitigação: rota `GET /api/me/audit-trail` (pós-launch) que retorna `audit_logs WHERE user_id = current_user`. Limita acesso ao próprio rastro. Não ao de terceiros.

---

## 11. O que precisa de aprovação CEO EXPLÍCITA (memória citada)

**Otávio NÃO implementa nenhum desses sem CEO autorizar:**

1. **Modelo de role: 3 níveis (`user`, `admin`, `super_admin`)** — aceita? Alternativa: 2 níveis só (`user`, `admin`). Recomendação Otávio: 3 níveis = `super_admin` tem privilégio de email massa + role change, isolado de admin comum (suporte). Vale o custo de complexidade.

2. **Quem vira `admin` no launch?** — apenas CEO (`super_admin`)? CEO + Heshiley (suporte)? CEO + Helena? Otávio precisa nome+email pra seed inicial. Recomendação: APENAS CEO no launch. Outros virão sob demanda.

3. **Cronograma Opção A (pós-launch) ou Opção B (pré-launch emergencial)?** — Recomendação Otávio: B. Custo 15h Bruna+Felipe vs risco de webhook falhar no soft launch sem audit log = vale.

4. **Email massa: rate-limit 1/dia ou diferente?** — 1/dia é conservador. Alternativa: 3/dia. Recomendação Otávio: 1/dia até validar que conteúdo é bom. Pós-launch, revisar.

5. **Confirmação dupla por email (link com token)?** — alternativa: confirmação por digitação ("digite EXCLUIR pra confirmar"). Recomendação Otávio: link por email (cria delay forçado de 30s+).

6. **Domínio público de `/admin`?** — opções:
    - (a) `hayzer.com.br/admin` (URL pública)
    - (b) `admin.hayzer.com.br` (subdomínio dedicado)
    - (c) `hayzer.com.br/admin` mas SEM link nenhum em /, /login, sitemap — só acessável digitando
    Recomendação Otávio: **(c)** — sem subdomínio extra (custo), sem link público (reduz reconhecimento). Middleware rewrite pra /404 se não-admin = ataque genérico não descobre que /admin existe.

7. **Aprovação dos 3 conjuntos de migrations (audit_logs, email_blasts, role_check + waitlist policies migration)** — aplicar quando? Otávio sugere: aplicar tudo junto 02/06 (segunda), validar 03/06, começar UI 03-04/06.

---

## 12. O que Otávio executa SEM aprovação CEO (reversível, óbvio)

- [ ] Adicionar `AUDIT_IP_SALT` no `.env.example` (placeholder vazio)
- [ ] Criar este ADR (feito)
- [ ] Atualizar `pillars/SCORES.md` indicando que `/admin` é gap conhecido
- [ ] Mapear todas as rotas que devem chamar `logAction` (lista pra Bruna executar quando autorizar)
- [ ] Validar que `profiles.role = 'admin'` em waitlist policy NÃO está bloqueando ninguém hoje (deve não bloquear — sem admin = SELECT só via service_role hoje)

Otávio NÃO executa SEM CEO:
- Criar migrations
- Aplicar migrations
- Escrever `services/auditLog.ts` ou `services/adminGuard.ts`
- Tocar em `middleware.ts`
- Criar `app/admin/*`
- Criar `app/api/admin/*`
- Promover ninguém a `admin` ou `super_admin`

---

## 13. Verificação manual sugerida pós-implementação

1. Logar como user comum, tentar acessar `/admin` → recebe 404 (NÃO /login, NÃO 403)
2. Logar como user comum, tentar acessar `/api/admin/waitlist` direto via curl → 404 (sem revelar existência)
3. Logar como CEO (super_admin), acessar `/admin` → entra
4. CEO tenta promover a si mesmo a `user` → trigger bloqueia (constraint R1)
5. CEO cria blast → status `draft` → confirma → recebe email com link → clica → status `sending` → background job dispara → após 5min status `sent` + audit log preenchido
6. CEO acessa `/admin/audit-logs` → vê log do próprio blast
7. CEO cria 2º blast no mesmo dia → bloqueado por rate limit (1/dia)
8. Dev junior tenta query SQL `SELECT * FROM audit_logs` direto via supabase-js no cliente → bloqueado por RLS
9. Atacante envia POST direto pra `/api/admin/profile/role` com user comum → bloqueado em middleware (rewrite 404) + bloqueado em `requireAdminRole` (defesa em profundidade)
10. Confirmar que rate limit não está fail-OPEN: simular DB down → admin tenta blast → recusa (fail-secure pra ações destrutivas)

---

## 14. Referências

- ADR-019 / ADR-025: Sentry (observability complementa audit log)
- ADR-020: Discord webhooks (mesmo canal pra alertas admin)
- `lib/supabase/schema.sql:5-10` — profiles.role existente
- `supabase/migrations/20260513_waitlist_leads.sql:108-156` — policies admin atuais (a migrar)
- `services/apiRateLimit.ts` — rate-limit reaproveitado
- `services/waitlistRateLimit.ts` — padrão de SHA-256(IP + salt) reaproveitado
- OWASP A01:2025 — Broken Access Control (3 camadas)
- OWASP A09:2025 — Logging Failures (audit log resolve)
- LGPD Art. 6 (finalidade) + Art. 18 (direitos titular) + Art. 46 (segurança)
