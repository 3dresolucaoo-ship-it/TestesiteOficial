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
- 🔵 **Good Strategy Bad Strategy** — Richard Rumelt — diagnose+guiding policy+coherent action
- 🔵 **7 Powers** — Hamilton Helmer — moats reais vs vagos
- 🔵 **Lean Strategy** — Wickman — execução estratégica em PME
- 🔵 **The Hard Thing About Hard Things** — Ben Horowitz — decisão sob incerteza

### Carla (Copy)
- 🔵 **Ogilvy on Advertising** — David Ogilvy — fundamentos imortais
- 🔵 **Made to Stick** — Heath Brothers — SUCCESs framework (sticky ideas)
- 🔵 **The Boron Letters** — Gary Halbert — copywriting direto (vendas reais)
- 🔵 **Copy Hackers vol 1-4** — Joanna Wiebe — copy moderno SaaS

### Marcos (Marketing)
- 🔵 **Hooked** — Nir Eyal — habit-forming products (já citado várias vezes)
- 🔵 **Influence** — Robert Cialdini — 6 princípios de persuasão
- 🔵 **Traction** — Gabriel Weinberg + DuckDuckGo — 19 canais de aquisição
- 🔵 **Hacking Growth** — Sean Ellis — growth experiments framework

### Sofia (CS)
- 🔵 **The Effortless Experience** — Matt Dixon — reduzir esforço > deliciar
- 🔵 **Customer Success** — Nick Mehta (Gainsight) — playbook B2B
- 🔵 **Never Split the Difference** — Chris Voss — negociação tática

### Diego (Design)
- 🔵 **The Design of Everyday Things** — Don Norman — affordances + signifiers
- 🔵 **Refactoring UI** — Adam Wathan + Steve Schoger — visual hierarchy prática
- 🔵 **Atomic Design** — Brad Frost — sistema escalável
- 🔵 **Hooked** (compartilhado com Marcos)

### Felipe (Frontend)
- 🔵 **Patterns.dev** — Lydia Hallie + Addy Osmani — patterns modernos JS
- 🔵 **Vercel Changelog mensal** — vercel.com/changelog — novidades plataforma
- 🔵 **React docs oficiais** — react.dev — releitura trimestral
- 🔵 **Next.js docs App Router** — nextjs.org/docs — atualização semestral

### Bruna (Backend)
- 🔵 **Designing Data-Intensive Applications** — Martin Kleppmann — capítulo/mês
- 🔵 **Supabase docs** — supabase.com/docs — releitura trimestral
- 🔵 **PostgreSQL docs** — postgresql.org/docs — extensions, performance

### Otávio (Security)
- 🔵 **OWASP Top 10 anual** — owasp.org/Top10 — releitura todo Janeiro
- 🔵 **The Web Application Hacker's Handbook** — Dafydd Stuttard — capítulo/mês
- 🔵 **The Tangled Web** — Michal Zalewski — browser security profundo

### Paulo (Financial)
- 🔵 **Stripe Press** — press.stripe.com — livros gratuitos (Get Together, etc)
- 🔵 **PCI DSS oficial** — pcisecuritystandards.org — releitura anual
- 🔵 **MP Brazil Marketplace docs** — atualização trimestral
- 🔵 **Webhook patterns** — diversos blogs Stripe + MP

### Ricardo (DevOps)
- 🔵 **Vercel docs mensal** — vercel.com/docs — atualização constante
- 🔵 **The Phoenix Project** — Gene Kim — DevOps narrative
- 🔵 **Accelerate** — Nicole Forsgren — 4 keys metrics

### Lia (Docs)
- 🔵 **Docs for Developers** — Jared Bhatti — write the docs framework
- 🔵 **Every Page Is Page One** — Mark Baker — topic-based
- 🔵 **Style guide Microsoft + Google** — atualização semestral

### Júlia (QA)
- 🔵 **Lessons Learned in Software Testing** — Kaner, Bach, Pettichord
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
