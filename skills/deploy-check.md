# /deploy:check

Valida projeto antes de deploy — sem surpresas em produção.

## INPUT
```
/deploy:check
```

## PROTOCOLO

### 1. BUILD CHECK
```bash
npm run build
```
- Zero erros TypeScript?
- Zero erros de import?
- Todas as páginas geram sem erro?

### 2. ENV VARS CHECK
Verificar que existem em `.env.local`:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Verificar que estão no Vercel (não apenas local).

### 3. ROTAS CHECK
Verificar que rotas críticas existem e exportam default:
- `/` ou `/dashboard`
- `/login`
- `/api/webhooks/stripe`
- `/api/webhooks/payment`
- `/api/checkout`

### 4. SUPABASE CHECK
- RLS ativo nas tabelas principais?
- Funções de auth funcionando?
- `supabaseAdmin` usa SERVICE_ROLE_KEY (não ANON)?

### 5. STRIPE CHECK
- Webhook URL configurado no dashboard Stripe?
- Produto/preço existe no Stripe?

### 6. RED FLAGS
- `console.log` com dados sensíveis
- Hardcoded API keys no código
- `TODO` em fluxo crítico
- `any` em tipos de dados financeiros

## SAÍDA
```
BUILD: ✓/✗
ENV: ✓/✗ [lista faltando]
ROTAS: ✓/✗
BLOQUEADORES: [lista se houver]
STATUS: PRONTO / NÃO PRONTO
```
