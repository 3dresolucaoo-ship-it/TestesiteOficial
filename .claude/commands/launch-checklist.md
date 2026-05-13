---
description: "Checklist completo pré-lançamento do BVaz Hub. Roda todos os squads: Otávio (segurança Tier 1), Júlia (QA), Sofia (UX), Ricardo (DevOps), Paulo (pagamento), Lia (docs). Use na semana 7-8 antes do launch 04/07."
allowed-tools: Task, Read, Glob, Grep, Bash
---

# /launch:checklist — Pre-Launch Audit Completo

Auditoria total pré-lançamento. Dispara TODOS os squads relevantes em paralelo.

## Escopo
$ARGUMENTS (default: todo o produto)

## Fluxo (paralelo)

### 1. Otávio — Segurança Tier 1
Chama **otavio-security**: "Audita completa Tier 1 antes do launch 04/07/2026. Bloqueia se algum crítico aberto."

### 2. Júlia — QA Completa
Chama **julia-qa**: "Testa todos os fluxos críticos: signup, login, recuperar senha, captura waitlist, dashboard inicial, criar/editar customer, fluxo de pagamento (se aplicável). Mobile + desktop + dark mode."

### 3. Sofia — UX Audit
Chama **sofia-cs**: "Audita experiência do user novo. Foco: primeira visita, signup, primeiros 5 cliques, empty states, mensagens de erro. Imagina o Rafael (cliente alvo) chegando."

### 4. Ricardo — DevOps
Chama **ricardo-devops**: "Checklist pré-launch DevOps: domínio + DNS, HTTPS, HSTS preload, Sentry ativo, Vercel Analytics, Rolling Releases, env vars prod, webhooks prod, rollback testado, staging separado."

### 5. Paulo — Pagamento
Chama **paulo-financial**: "Valida fluxo de pagamento: Stripe + MP em prod, webhook signature verificada, idempotência testada, MP OAuth Marketplace resolvido (ou bloqueado oficial), reconciliação manual."

### 6. Lia — Docs
Chama **lia-docs**: "Confere que docs refletem realidade pós-launch: CLAUDE.md atualizados, ROADMAP marcado, ADRs criados pras decisões críticas da Fase 1, .env.example atualizado, README do projeto."

## Saída consolidada
```
# 🚀 PRE-LAUNCH AUDIT — <data> · launch 04/07/2026

## 🛡️ Segurança (Otávio)
- 🔴 Críticos: <lista> ← BLOQUEIA LAUNCH se algum
- 🟡 Importantes: <lista>
- ✅ Aprovados: <count>

## 🧪 QA (Júlia)
- 🔴 Bugs críticos: <lista>
- 🟡 Bugs importantes: <lista>

## 🤝 UX (Sofia)
- 🔴 Fricção crítica: <lista>
- 🟡 Melhorias: <lista>

## 🚀 DevOps (Ricardo)
- 🔴 Itens faltantes: <lista>
- ✅ Configurado: <lista>

## 💰 Pagamento (Paulo)
- 🔴 Bloqueios: <lista>
- ✅ Testado: <lista>

## 📚 Docs (Lia)
- Pendências: <lista>

---

## 🚦 VEREDITO FINAL

- 🟢 LANÇAR — todos os críticos resolvidos
- 🟡 LANÇAR COM RESSALVAS — críticos resolvidos, alguns importantes em backlog
- 🔴 SEGURAR — críticos abertos, listados acima

## Itens BLOQUEANTES (não lança até resolver)
1. <item>
2. <item>

## Plano de ação (se vermelho)
1. <ação> — responsável: <squad> — prazo: <data>
2. <ação> — responsável: <squad> — prazo: <data>
```

## Importante
- Este é o "gate final" antes do launch.
- Se vermelho/amarelo, ATRASA o launch. Não force.
- Se verde, deploya e celebra. 🎉
