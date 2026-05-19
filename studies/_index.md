# Estudos G7 — Curadoria mestre

> Sistema de aprendizado contínuo. Cada agente lê 1 livro/ref/mês da sua área e sintetiza 5 princípios acionáveis. Princípios viram parte da `## Memória ativa` do agente.

**Criado**: 2026-05-16 · **Próxima atualização**: 16/06/2026 · **Dono**: Claude principal (sintetiza), CEO Gabriel (valida)

---

## Como funciona

1. Cada agente tem 3-5 livros core na pasta `studies/<agente>/`
2. 1x/semana (domingo 19h por padrão), agente lê 1 capítulo/livro
3. Extrai 5 princípios acionáveis no formato: "**Quando X, faça Y, porque Z.** (Livro · Cap · Data leitura)"
4. Princípios viram entrada na `## Memória ativa` do agente
5. Status do livro: `🔵 não lido` → `🟡 em leitura` → `🟢 sintetizado`

## Validação mensal (CEO)

1x/mês CEO escolhe 5 princípios aleatórios da memória de qualquer agente e marca:
- ✅ útil (manter)
- ❌ inútil (remover)
- ⚠️ errado (corrigir + revisar fonte)

Sistema aprende a separar sinal de ruído. Princípios com 3+ ⚠️ saem da memória.

---

## Curadoria por agente

### Helena (Estratégia)
- 🟢 **Good Strategy Bad Strategy** — Richard Rumelt — diagnose+guiding policy+coherent action · sintetizado 17/05/2026 (7 princípios)
- 🟡 **7 Powers** — Hamilton Helmer — moats reais vs vagos · **em leitura 2026-05-19** (5 princípios adicionados)
- 🔵 **Lean Strategy** — Wickman — execução estratégica em PME
- 🔵 **The Hard Thing About Hard Things** — Ben Horowitz — decisão sob incerteza

### Carla (Copy)
- 🟢 **Ogilvy on Advertising** — David Ogilvy — fundamentos imortais · sintetizado 17/05/2026 (7 princípios)
- 🟡 **Made to Stick** — Heath Brothers — SUCCESs framework (sticky ideas) · **em leitura 2026-05-19** (5 princípios adicionados)
- 🔵 **The Boron Letters** — Gary Halbert — copywriting direto (vendas reais)
- 🔵 **Copy Hackers vol 1-4** — Joanna Wiebe — copy moderno SaaS

### Marcos (Marketing)
- 🟢 **Hooked** — Nir Eyal — habit-forming products · sintetizado 17/05/2026 (6 princípios)
- 🟡 **Influence** — Robert Cialdini — 6 princípios de persuasão · **em leitura 2026-05-19** (5 princípios adicionados)
- 🔵 **Traction** — Gabriel Weinberg + DuckDuckGo — 19 canais de aquisição
- 🔵 **Hacking Growth** — Sean Ellis — growth experiments framework

### Sofia (CS)
- 🟢 **The Effortless Experience** — Matt Dixon — reduzir esforço > deliciar · sintetizado 17/05/2026 (7 princípios)
- 🟡 **Customer Success** — Nick Mehta (Gainsight) — playbook B2B · **em leitura 2026-05-19** (5 princípios adicionados)
- 🔵 **Never Split the Difference** — Chris Voss — negociação tática

### Diego (Design)
- 🟡 **The Design of Everyday Things** — Don Norman — affordances + signifiers · **em leitura 2026-05-19** (5 princípios adicionados)
- 🟢 **Refactoring UI** — Adam Wathan + Steve Schoger — visual hierarchy prática · sintetizado 17/05/2026 (6 princípios)
- 🔵 **Atomic Design** — Brad Frost — sistema escalável
- 🔵 **Hooked** (compartilhado com Marcos)

### Felipe (Frontend)
- 🟢 **Patterns.dev** — Lydia Hallie + Addy Osmani — patterns modernos JS · lido parcial 17/05/2026 (7 princípios)
- 🔵 **Vercel Changelog mensal** — vercel.com/changelog — novidades plataforma
- 🔵 **React docs oficiais** — react.dev — releitura trimestral
- 🟡 **Next.js docs App Router** — nextjs.org/docs — atualização semestral · **em leitura 2026-05-19** (5 princípios adicionados)

### Bruna (Backend)
- 🟡 **Designing Data-Intensive Applications** — Martin Kleppmann — capítulo/mês · Cap 1 sintetizado 17/05 (7 princípios) · **Cap 2 em leitura 2026-05-19** (5 princípios adicionados)
- 🔵 **Supabase docs** — supabase.com/docs — releitura trimestral
- 🔵 **PostgreSQL docs** — postgresql.org/docs — extensions, performance

### Otávio (Security)
- 🟢 **OWASP Top 10 anual** — owasp.org/Top10 — releitura todo Janeiro · sintetizado 17/05/2026 (10 categorias)
- 🟡 **The Web Application Hacker's Handbook** — Dafydd Stuttard — capítulo/mês · **em leitura 2026-05-19** (5 princípios adicionados)
- 🔵 **The Tangled Web** — Michal Zalewski — browser security profundo

### Paulo (Financial)
- 🟢 **Stripe Press** — press.stripe.com — livros gratuitos (Get Together, etc) · sintetizado 17/05/2026 (7 princípios)
- 🟡 **PCI DSS oficial** — pcisecuritystandards.org — releitura anual · **em leitura 2026-05-19** (5 princípios adicionados)
- 🔵 **MP Brazil Marketplace docs** — atualização trimestral
- 🔵 **Webhook patterns** — diversos blogs Stripe + MP

### Ricardo (DevOps)
- 🟢 **Vercel docs mensal** — vercel.com/docs — atualização constante
- 🟢 **The Phoenix Project** — Gene Kim — DevOps narrative · lido (resumo) 17/05/2026 (7 princípios)
- 🟢 **Accelerate** — Nicole Forsgren — 4 keys metrics · lido (resumo) 17/05/2026 (compartilhado)
- 🟡 **The DevOps Handbook** — Gene Kim et al. — Three Ways + deployment pipeline · **em leitura 2026-05-19** (5 princípios adicionados)

### Lia (Docs)
- 🟢 **Docs for Developers** — Jared Bhatti — write the docs framework · sintetizado 17/05/2026 (7 princípios)
- 🟡 **Diataxis** — Daniele Procida — diataxis.fr · **em leitura 2026-05-19** (5 princípios adicionados)
- 🔵 **Every Page Is Page One** — Mark Baker — topic-based
- 🔵 **Style guide Microsoft + Google** — atualização semestral
- 🔵 **Anthropic Changelog mensal** — anthropic.com/news · claude.ai/changelog — 1a segunda do mes · `studies/anthropic-changelog.md`

### Júlia (QA)
- 🟢 **Lessons Learned in Software Testing** — Kaner, Bach, Pettichord · lido parcial (web sources) 17/05/2026 (7 princípios)
- 🟡 **Explore It!** — Elisabeth Hendrickson — exploratory testing · **em leitura 2026-05-19** (5 princípios adicionados)
- 🔵 **Agile Testing** — Lisa Crispin + Janet Gregory
- 🔵 **Testing Web Apps with Playwright** — docs oficiais

---

## Stats

- **12 agentes ativos** com livros catalogados
- **~50 livros/refs no total** (média 4 por agente)
- **Meta**: 1 livro/mês/agente = ~144 leituras sintetizadas/ano
- **Atualização do _index**: trimestral (CEO + Claude validam curadoria)

## Histórico

- 2026-05-16: criado por Claude após CEO Gabriel pedir sistema de aprendizado contínuo
- 2026-05-17: Lia adicionou "Anthropic Changelog mensal" na curadoria + calendário de rastreio. Calendário 2026 — 1a segunda do mes: 01/06, 06/07, 03/08, 07/09, 05/10, 02/11, 07/12.
