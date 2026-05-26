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
- 🟢 **Good Strategy Bad Strategy** — Richard Rumelt — sintetizado 17/05/2026 · 7 princípios
- 🟢 **7 Powers** — Hamilton Helmer — sintetizado 26/05/2026 · 5 princípios
- 🔵 **Lean Strategy** — Wickman — execução estratégica em PME
- 🔵 **The Hard Thing About Hard Things** — Ben Horowitz — decisão sob incerteza

### Carla (Copy)
- 🟢 **Ogilvy on Advertising** — David Ogilvy — sintetizado 17/05/2026 · 7 princípios
- 🟢 **Made to Stick** — Heath Brothers — sintetizado 26/05/2026 · 5 princípios
- 🔵 **The Boron Letters** — Gary Halbert — copywriting direto (vendas reais)
- 🔵 **Copy Hackers vol 1-4** — Joanna Wiebe — copy moderno SaaS

### Marcos (Marketing)
- 🟢 **Hooked** — Nir Eyal — sintetizado 17/05/2026 · 6 princípios (ver agent file)
- 🟢 **Influence** — Robert Cialdini — sintetizado 26/05/2026 · 5 princípios
- 🔵 **Traction** — Gabriel Weinberg + DuckDuckGo — 19 canais de aquisição
- 🔵 **Hacking Growth** — Sean Ellis — growth experiments framework

### Sofia (CS)
- 🟢 **The Effortless Experience** — Matt Dixon — sintetizado 17/05/2026 · 7 princípios
- 🟢 **Customer Success** — Nick Mehta (Gainsight) — sintetizado 26/05/2026 · 5 princípios
- 🔵 **Never Split the Difference** — Chris Voss — negociação tática

### Diego (Design)
- 🟢 **Refactoring UI** — Adam Wathan + Steve Schoger — sintetizado 17/05/2026 · 6 princípios
- 🟢 **The Design of Everyday Things** — Don Norman — sintetizado 26/05/2026 · 5 princípios
- 🔵 **Don't Make Me Think** — Steve Krug — próxima leitura
- 🔵 **Atomic Design** — Brad Frost — sistema escalável

### Felipe (Frontend)
- 🟢 **Patterns.dev** — Lydia Hallie + Addy Osmani — sintetizado 17/05/2026 · 7 princípios
- 🟢 **Vercel Changelog mensal** — vercel.com/changelog — sintetizado 26/05/2026 · 5 princípios
- 🔵 **React docs oficiais** — react.dev — releitura trimestral
- 🔵 **Next.js docs App Router** — nextjs.org/docs — atualização semestral

### Bruna (Backend)
- 🟡 **Designing Data-Intensive Applications** — Martin Kleppmann — em andamento · Cap 1 🟢 + Cap 2 🟢 (26/05) · 12 princípios
- 🔵 **Supabase docs** — supabase.com/docs — releitura trimestral
- 🔵 **PostgreSQL docs** — postgresql.org/docs — extensions, performance

### Otávio (Security)
- 🟢 **OWASP Top 10 anual** — owasp.org/Top10 — sintetizado 17/05/2026 · 10 categorias
- 🟢 **The Web Application Hacker's Handbook** — Dafydd Stuttard — sintetizado 26/05/2026 · 5 princípios
- 🔵 **The Tangled Web** — Michal Zalewski — browser security profundo
- 🔵 **OWASP Cheat Sheets (Auth + Session)** — próxima leitura

### Paulo (Financial)
- 🟢 **Stripe Press** — press.stripe.com — sintetizado 17/05/2026 · 7 princípios
- 🟢 **PCI DSS oficial** — pcisecuritystandards.org — sintetizado 26/05/2026 · 5 princípios
- 🟡 **MP Brazil Marketplace docs** — em leitura
- 🔵 **Webhook patterns** — diversos blogs Stripe + MP

### Ricardo (DevOps)
- 🟢 **The Phoenix Project** — Gene Kim — sintetizado 17/05/2026 · incluído em Accelerate
- 🟢 **Accelerate** — Nicole Forsgren — sintetizado 17/05/2026 · 9 princípios (P1-P9)
- 🟢 **The DevOps Handbook** — Gene Kim et al. — sintetizado 26/05/2026 · 5 princípios (P10-P14)
- 🔵 **Site Reliability Engineering** — Google — próxima leitura

### Lia (Docs)
- 🟢 **Docs for Developers** — Jared Bhatti — sintetizado 17/05/2026 · 7 princípios
- 🟢 **Every Page Is Page One** — Mark Baker — sintetizado 26/05/2026 · 5 princípios
- 🔵 **Diátaxis** — Daniele Procida — diataxis.fr · próxima leitura
- 🔵 **Anthropic Changelog mensal** — anthropic.com/news · claude.ai/changelog — 1a segunda do mes · `studies/anthropic-changelog.md`

### Júlia (QA)
- 🟢 **Lessons Learned in Software Testing** — Kaner, Bach, Pettichord — sintetizado 17/05/2026 · 7 heurísticas
- 🟢 **Agile Testing** — Lisa Crispin + Janet Gregory — sintetizado 26/05/2026 · 5 heurísticas
- 🔵 **Explore It!** — Elisabeth Hendrickson — próxima leitura
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
- 2026-05-26: Rodada semanal G7 completa — 12 agentes · 12 livros sintetizados · 60 novos princípios adicionados. Status de todos os livros já lidos atualizado para 🟢. Branch: study/g7-weekly-2026-05-26.
