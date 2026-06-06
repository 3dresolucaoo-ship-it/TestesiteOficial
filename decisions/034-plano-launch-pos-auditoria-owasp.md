# ADR 034 — Plano Mestre de Launch + Auditoria OWASP (pós-pesquisa competitiva)

**Data**: 2026-06-06
**Status**: EM EXECUÇÃO (Onda 0 segurança crítica concluída)
**Contexto**: CEO pediu "planejar tudo o que falta" pro launch. Gatilho: concorrente Cordeiro Flow com Google login. Fizemos inteligência competitiva profunda + auditoria OWASP de 4 camadas antes de executar.

> ⚠️ Este doc é a FONTE PERMANENTE do plano (o original vivia em `.claude/plans/`, temporário). Próxima sessão começa lendo daqui.

---

## ✅ STATUS DE EXECUÇÃO (atualizar a cada sessão)

### CONCLUÍDO 06/06 — Segurança crítica fechada e VALIDADA em prod (commit `78bac11` em main + migration `security_hardening_owasp_20260606` aplicada)

| Task | Item | Status | Prova |
|---|---|---|---|
| 1 | Catálogo público: admin client + scrub custo/margem | ✅ prod | margem real não vaza no payload (`tem_030: false`); catálogo renderiza |
| 2 | Migration hardening (funções + policies + profiles.role) | ✅ prod | anon vê 0 estoque/0 produtos (era 2/2); process_webhook_atomic só service_role |
| 3 | SEC-0 checkout/encomenda/webhook amarrar produto ao merchant | ✅ prod | price-shopping fechado (4 arquivos) |
| 4 | SEC-4 CRON fail-closed | ✅ prod | sem secret = 401 |

**Validação dinâmica (impersonando anon em prod):** estoque 2→0, produtos 2→0, `process_webhook_atomic` grants `{postgres, service_role}` (anon/authenticated removidos), `create_catalog_lead` mantém anon (by design). Catálogo `catalago-teste` renderiza antes E depois da migration.

### PENDENTE — próximas tasks (ordem)

| Task | Item | Bloqueia? |
|---|---|---|
| 5 | **0.1 Golden path** — `createOrder` chamar `processNewOrder` (produção+estoque+financeiro numa ação). PRÓXIMA AÇÃO. | Soft (é o coração do "ponta-a-ponta") |
| 6 | 0.2 SW v2 — migrar `/sw.js`→`/sw-v2.js` (mata landing branca de raiz, remove hotfix CSS) | Não (hotfix CSS cobre) |
| 7 | 0.3 Google login OAuth | Não (paridade) |
| 8 | 0.4 Mini-tela admin "Founding Makers" (só após SEC-2 ✅ feito) — guard isAdminEmail | Não |
| 9 | CEO: rotacionar service_role + leaked password (painel) + Stripe sandbox + Discord/Sentry DSN + Google OAuth config + INPI + convidar fundadores | Soft (humano) |

**SEC restantes (não bloqueiam soft, antes do público 27/06):** SEC-6 getClientIp robusto, SEC-7 erro genérico/info leak, SEC-8 CHECK value≥0 no DB, CSP enforcing, SEC-3 rotação chave (CEO), SEC-5 leaked password (CEO), LGPD termos/operador, Sentry ativo.

**Nota técnica**: arquivo `supabase/migrations/20260606_security_hardening_owasp.sql` está no repo (doc) MAS foi aplicado via MCP `apply_migration` (nome `security_hardening_owasp_20260606`). Não rodar `supabase db push` (duplicaria). Scrub do catálogo deixa chaves zeradas no payload — melhoria Onda 2: DTO público dedicado.

---

## Mercado competitivo (10+ players BR — pesquisa 06/06)

- **Ameaças altas**: 3D Control (R$39,99, SEO forte), Smart3D (R$34,90 + dono +100k seguidores = distribuição), Vultrix 3D (beta, slicer import + gamificação + IA).
- **Médias**: Cordeiro Flow (R$19,90+free, Google login), AppCustos3D (slicer import, roda WordPress), PrintWorks3D (R$4,99+free com AdSense).
- **Baixas**: MakerOS, ZoomCalc3D (grátis local), Precifi3D, PrintCalc.

**5 verdades:** (1) slicer import não é fosso — cobrança de entrada (1-3 dias); (2) competir em preço é suicídio; (3) perigo real é DISTRIBUIÇÃO (fosso = canal @Gavriel); (4) prova social real é whitespace; (5) multi-vertical Ybera é whitespace.

## Estratégia de launch (decisões do CEO)

- **Posicionamento cravado**: "Ponta-a-ponta de verdade" — único onde pedido vira produção, baixa estoque e lança no financeiro sozinho.
- **13/06 = "Círculo de Fundadores"**: 3-5 makers (não 10), frame de co-construção, beta grátis até 27/06 com data de virada cravada, data CONDICIONAL ao golden path passar (senão adia 18/06 — contingência ADR-029).
- **Diferenciação rumo a 27/06**: golden path (pré) + slicer import como bandeira (pós) + visual premium + audiência @Gavriel. NÃO competir em preço.

## ONDA 1 — Diferenciação (13→27/06)
1. **Slicer import** (.gcode/.3mf) — bandeira "ponta-a-ponta começa no arrastar". 2-3 dias.
2. **Billing/freemium** — Stripe subscription greenfield. Pra cobrar no 27/06. Preço ~R$29-39 (validar com beta; NÃO brigar com R$4,99).
3. **PDF de orçamento** — dado já existe (QuoteModal→Lead). 1 dia.
4. **Prova social real** — depoimento founding makers (nome+foto+@).
5. V4 em /content + /decisions.

## ONDA 2 — Backlog pós-público
Mixer de cores · trilhas/videoaulas · i18n · WhatsApp automático · Onda C cache · DELETE_ORDER side effects · Lighthouse interno · vertical Ybera/Beauty.

## Princípio (regra da casa)
**Foco vence pulverização.** Onda 0 (estabilizar) vira brasa antes da Onda 1. Não acender 5 fogueiras a 9 dias do launch.

## Calibração de risco (red team)
- **Soft (5 conhecidos)**: SEC-0 + SEC-1 + SEC-4 ✅ feito = risco BAIXO, GO. Demais vetores precisam de atacante ativo de internet.
- **Público (internet)**: fechar SEC-5/6/7/8 + CSP + LGPD + Sentry + advogado revisa termos.

## Refs
- Auditoria completa: `sessions/2026-06-06-auditoria-owasp-seguranca-launch.md`
- Migration: `supabase/migrations/20260606_security_hardening_owasp.sql`
- Inteligência competitiva: pesquisa nesta sessão (3 analistas + red team)
