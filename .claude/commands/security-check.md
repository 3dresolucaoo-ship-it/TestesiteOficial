---
description: "Roda checklist Tier 1 de segurança do BVaz (Otávio). Use antes de deploy importante, antes de mexer em auth/pagamento/dados sensíveis, ou pra auditoria pré-launch."
allowed-tools: Task, Read, Glob, Grep, Bash
---

# /security:check — Auditoria de Segurança Tier 1

Você ativou auditoria de segurança da G7.

## Escopo
$ARGUMENTS

## Fluxo

### Otávio — Auditoria Tier 1
Chama **otavio-security** com brief:
"Audita segurança Tier 1 em: $ARGUMENTS

Aplique o checklist completo Tier 1:

### Identidade e Sessão
- [ ] HTTPS forçado
- [ ] HSTS header
- [ ] Cookies httpOnly + Secure + SameSite
- [ ] CSRF protegido
- [ ] Auth + rate limit no login

### Dados
- [ ] RLS em toda tabela
- [ ] project_id filter em toda query
- [ ] user_id em toda tabela
- [ ] Backup automático Supabase Pro

### Input/Output
- [ ] Zod valida toda entrada externa
- [ ] Sanitização de string user-input
- [ ] Erro genérico no login (anti-enumeração)
- [ ] Sem dado sensível em URL

### Rate Limit
- [ ] Global no edge
- [ ] Por user em endpoints sensíveis
- [ ] Por IP em endpoints públicos

### Pagamento
- [ ] Webhook signature verificada
- [ ] Idempotência (chave única)
- [ ] Retry policy + timeout
- [ ] Cobrança duplicada IMPOSSÍVEL

### Headers
- [ ] HSTS
- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] Referrer-Policy
- [ ] Permissions-Policy

### LGPD
- [ ] Política de Privacidade
- [ ] Termos de Uso
- [ ] Checkbox consentimento
- [ ] Direito de deleção
- [ ] Bot detection

### Segredos
- [ ] .env no .gitignore
- [ ] Env vars no Vercel
- [ ] Service role SOMENTE server-side
- [ ] Sem credencial em log

### Ambientes
- [ ] Prod + Staging separados

Reporte problemas com prioridade:
🔴 Crítico (bloqueia deploy)
🟡 Importante (resolver antes do launch)
🟢 Nice-to-have (Tier 2/3)

Para cada item: descrição + reprodução + correção sugerida."

## Saída final pro CEO
```
## Auditoria Tier 1 — <escopo>

### 🔴 Críticos (BLOQUEIA DEPLOY)
1. <item> · onde: <arquivo> · correção: <ação>

### 🟡 Importantes (resolver antes do launch)
1. <item>

### 🟢 Nice-to-have (Tier 2/3 pós-launch)
1. <item>

### ✅ O que está OK
- <item>

### 🚦 Veredito
- 🟢 Liberado pra deploy
- 🟡 Liberado com ressalvas (resolver críticos antes)
- 🔴 BLOQUEADO (resolver críticos)

### Próximas ações
1. <ação>
```

## Não pular
Otávio é gatekeeper. Se ele bloqueia, não passa. Esse é o trabalho dele.
