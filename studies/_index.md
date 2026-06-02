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
- 🟢 **Good Strategy Bad Strategy** — Richard Rumelt — diagnose+guiding policy+coherent action · sintetizado 2026-06-02
- 🔵 **7 Powers** — Hamilton Helmer — moats reais vs vagos
- 🔵 **Lean Strategy** — Wickman — execução estratégica em PME
- 🔵 **The Hard Thing About Hard Things** — Ben Horowitz — decisão sob incerteza

### Carla (Copy)
- 🟢 **Ogilvy on Advertising** — David Ogilvy — fundamentos imortais · sintetizado 2026-06-02
- 🔵 **Made to Stick** — Heath Brothers — SUCCESs framework (sticky ideas)
- 🔵 **The Boron Letters** — Gary Halbert — copywriting direto (vendas reais)
- 🔵 **Copy Hackers vol 1-4** — Joanna Wiebe — copy moderno SaaS

### Marcos (Marketing)
- 🟢 **Hooked** — Nir Eyal — habit-forming products · sintetizado 2026-06-02
- 🔵 **Influence** — Robert Cialdini — 6 princípios de persuasão
- 🔵 **Traction** — Gabriel Weinberg + DuckDuckGo — 19 canais de aquisição
- 🔵 **Hacking Growth** — Sean Ellis — growth experiments framework

### Sofia (CS)
- 🟢 **The Effortless Experience** — Matt Dixon — reduzir esforço > deliciar · sintetizado 2026-06-02
- 🔵 **Customer Success** — Nick Mehta (Gainsight) — playbook B2B
- 🔵 **Never Split the Difference** — Chris Voss — negociação tática

### Diego (Design)
- 🟢 **The Design of Everyday Things** — Don Norman — affordances + signifiers · sintetizado 2026-06-02
- 🔵 **Refactoring UI** — Adam Wathan + Steve Schoger — visual hierarchy prática
- 🔵 **Atomic Design** — Brad Frost — sistema escalável
- 🔵 **Hooked** (compartilhado com Marcos)

### Felipe (Frontend)
- 🟢 **Patterns.dev** — Lydia Hallie + Addy Osmani — patterns modernos JS · sintetizado 2026-06-02
- 🔵 **Vercel Changelog mensal** — vercel.com/changelog — novidades plataforma
- 🔵 **React docs oficiais** — react.dev — releitura trimestral
- 🔵 **Next.js docs App Router** — nextjs.org/docs — atualização semestral

### Bruna (Backend)
- 🟢 **Designing Data-Intensive Applications** — Martin Kleppmann — capítulo/mês · sintetizado 2026-06-02
- 🔵 **Supabase docs** — supabase.com/docs — releitura trimestral
- 🔵 **PostgreSQL docs** — postgresql.org/docs — extensions, performance

### Otávio (Security)
- 🟢 **OWASP Top 10 anual** — owasp.org/Top10 — releitura todo Janeiro · sintetizado 2026-06-02
- 🔵 **The Web Application Hacker's Handbook** — Dafydd Stuttard — capítulo/mês
- 🔵 **The Tangled Web** — Michal Zalewski — browser security profundo

### Paulo (Financial)
- 🟢 **Stripe Press / Get Together** — Bailey Richardson + Kevin Huynh — comunidade + payments · sintetizado 2026-06-02
- 🔵 **PCI DSS oficial** — pcisecuritystandards.org — releitura anual
- 🔵 **MP Brazil Marketplace docs** — atualização trimestral
- 🔵 **Webhook patterns** — diversos blogs Stripe + MP

### Ricardo (DevOps)
- 🔵 **Vercel docs mensal** — vercel.com/docs — atualização constante
- 🟢 **The Phoenix Project** — Gene Kim — DevOps narrative · sintetizado 2026-06-02
- 🔵 **Accelerate** — Nicole Forsgren — 4 keys metrics

### Lia (Docs)
- 🟢 **Docs for Developers** — Jared Bhatti — write the docs framework · sintetizado 2026-06-02
- 🔵 **Every Page Is Page One** — Mark Baker — topic-based
- 🔵 **Style guide Microsoft + Google** — atualização semestral
- 🔵 **Anthropic Changelog mensal** — anthropic.com/news · claude.ai/changelog — 1a segunda do mes · `studies/anthropic-changelog.md`

### Júlia (QA)
- 🟢 **Lessons Learned in Software Testing** — Kaner, Bach, Pettichord · sintetizado 2026-06-02
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
- 2026-06-02: primeira rodada semanal completa — 12 agentes processados, 60 princípios adicionados. Arquivos `.claude/agents/*.md` criados (nao existiam antes). Livros sintetizados: Good Strategy Bad Strategy (Helena), Ogilvy on Advertising (Carla), Hooked (Marcos), The Effortless Experience (Sofia), The Design of Everyday Things (Diego), Patterns.dev (Felipe), Designing Data-Intensive Applications (Bruna), OWASP Top 10 (Otávio), Stripe Press/Get Together (Paulo), The Phoenix Project (Ricardo), Docs for Developers (Lia), Lessons Learned in Software Testing (Julia).
