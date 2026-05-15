# 👤 CEO Command Center — Hayzer

> Painel central do CEO. Abra primeiro toda manhã.
> Atualizado: **15/05/2026** (madrugada) · Próxima revisão: 15/05/2026 (manhã)

---

## 🎯 Foco da semana 2 (14-19/05/2026)

**Status semana 1 (13/05) — FECHADA**: ✅ Landing v2 ✅ Form 2 etapas ✅ waitlist_leads em prod ✅ LGPD ✅ Defesa Tier 1 ✅ Rebranding Hayzer ✅ Domínio próprio com SSL.

**Status sessão 14-15/05 (madrugada) — FECHOU 4 DOS 4 ITENS**:
1. ✅ **Logo Hayzer** implementada (H+raízes verde, mix-blend-screen)
2. ✅ **Resend + email confirmação** — código 100% pronto, env vars Vercel setadas, DNS propagado. Aguardando AWS SES verify final (1-24h sozinho). **Email vai sair próximo cadastro pós-verify.**
3. ⏳ **Marca INPI Hayzer** — não atacado nessa sessão. Próximo passo: gov.br/inpi, classes 35+42
4. ⏳ **Post LinkedIn anúncio** — Marcos + Carla, ~30min, próxima sessão

**Bônus sessão**:
- ✅ Foco vertical maker 3D (ADR-010) — copy reescrita, frase âncora, CTA novo
- ✅ Bug RLS waitlist diagnosticado e fixado (ADR-011) — form 100% funcional em prod
- ✅ WhatsApp CTA na tela /obrigado (testado fim-a-fim)
- ✅ Vercel Web Analytics + Speed Insights ativados (Marcos pediu)

**Pendências críticas pra rotacionar (5min)**:
- 🔴 `RESEND_API_KEY` e `SUPABASE_SERVICE_ROLE_KEY` foram expostas no chat. Quando lembrar: gera novas + atualiza Vercel env.

---

## 📦 Projeto único ativo

### 🔥 Hayzer (toda atenção)
- **Status**: Wave 0 em prod · Fase 1 em curso (rebrandeado em 14/05)
- **Data lançamento**: 04/07/2026 (~7 semanas)
- **URL produção**: https://hayzer.com.br (SSL automático Vercel)
- **URL Vercel default**: https://bvaz-hub.vercel.app (continua ativa até Onda 5 pós-launch)
- **Domínio**: Registro.br, exp 14/05/2028 (Gabriel Vaz)
- **Repo**: C:\Users\infin\OneDrive\Área de Trabalho\bvaz-hub (nome Git mantido até Onda 5)
- **Branch**: main

### ⏸️ Pausados
- Heshiley / Ybera Paris → começa set/2026 (pós-launch Hayzer). Research salvo (40k afiliados BR, R$ 200M/ano).
- VideoEdit → ideia, sem data

---

## 🚦 Status dos squads (G7)

| Squad | Status | Próxima ação |
|---|---|---|
| 🧠 Helena (Estratégia) | 🟢 Disponível | Validar landing wireframe |
| 🎨 Diego (Design) | 🟢 Disponível | Desenhar landing + design system |
| 💻 Felipe (Frontend) | 🟢 Disponível | Aguardando design |
| ⚙️ Bruna (Backend) | 🟢 Disponível | Criar tabela `waitlist_leads` |
| 🛡️ Otávio (Security) | ⏸️ Em standby | Tier 1 começa semana 2 |
| 📝 Carla (Copy) | 🟢 Disponível | Copy do hero |
| 🎯 Marcos (Marketing) | 🟢 Disponível | Plano de conteúdo semana 1 |
| 🧪 Júlia (QA) | ⏸️ Em standby | QA na sexta após Felipe |
| 🚀 Ricardo (DevOps) | ⏸️ Em standby | Deploy quando estável |
| 🤝 Sofia (CS) | 🟢 Disponível | Empty state + onboarding texto |
| 💰 Paulo (Financial) | ⏸️ Em standby | MP OAuth resolve semana 3 |
| 📚 Lia (Docs) | 🟢 Disponível | Atualiza CLAUDE.md após mudanças |

---

## 📅 Próximas ações (ordem)

### Hoje (13/05)
1. ✅ Setup completo (MCPs, skills, agents, brief, design system) — FEITO
2. ⏳ Reiniciar Claude Code (você) — pra MCPs ativarem
3. ⏳ Começar landing com `/design:component "Landing page hero + waitlist form"`

### Esta semana (até dom 19/05)
- [ ] Landing page (hero, features, social proof, CTA)
- [ ] Waitlist form (etapa 1: email/nome/whatsapp)
- [ ] Tela "obrigado" (etapa 2: form de qualificação opcional)
- [ ] Tabela `waitlist_leads` no Supabase + RLS
- [ ] Lead magnet definido + criado ("Planilha 7 métricas")
- [ ] Design system shadcn instalado e configurado

### Semana 2 (20-26/05)
- [ ] Otávio: Tier 1 — Zod, rate limit, HSTS, headers, idempotência

### Semana 3 (27/05-02/06)
- [ ] LGPD + email transacional (Resend) + MP OAuth Marketplace E2E

### Semana 4 (03-09/06)
- [ ] Wave 1 — Customers (telas + queries + dashboard)

### Semanas 5-8
- [ ] Admin completo · PWA · onboarding · QA · LAUNCH 04/07

---

## 📊 Métricas — onde estamos hoje

- **Waitlist atual**: 0 emails (começamos hoje)
- **Meta 04/07**: 100 emails qualificados
- **Dias até launch**: 52 dias
- **Sessões Claude essa semana**: ~86% do limite Pro semanal usado (cuidado)

---

## 🆘 Decisões pendentes do CEO

### 🟡 Pode esperar
- [ ] Paleta final: A (verde tech) ou B (azul profundo)? — decidir semana 1 quando ver landing
- [ ] Nome definitivo: BVaz Hub → outro? — decidir semana 5 ou pós-launch
- [ ] Tipografia: Geist confirmar ou testar Inter/Satoshi? — decidir semana 1 com landing
- [ ] Lead magnet: planilha 7 métricas OU calculadora LTV? — Marcos sugere

### 🔴 Crítico (decide essa semana)
- [ ] CTA principal: "Entrar na lista de espera" OU "Pedir acesso antecipado"? — A/B test ou escolher

---

## 💭 Aprendizados acumulados (vivo)

- Mover landing pra antes da segurança evita 14 dias de audiência perdida
- 86% do limite Claude num único dia = sessão atípica, não exagerar daqui
- Tier 1 de segurança é não-negociável (vs Tier 2/3 que pode pós-launch)
- Design system fixo antes de codar = velocidade depois
- Anti-IA é diferencial competitivo real (concorrentes têm cara de IA)

---

## ❓ Quando travar

- Não sei priorizar → revisita "Próximas ações" acima ou pergunta Helena
- Decisão grande → ativa `/council`
- Dúvida técnica → chama squad relevante (`bruna-backend`, `felipe-frontend`, etc.)
- Status semanal → roda `/team:status`

---

## 🔄 Como atualizar este arquivo

- Atualizo eu (Helena) toda segunda-feira de manhã
- Ou quando você (CEO) pedir "rola um status"
- Mantém `Foco da semana`, `Status squads`, `Próximas ações`, `Decisões pendentes`
