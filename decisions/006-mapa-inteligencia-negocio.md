# ADR 006 — Mapa de Inteligência do Negócio (6 Pilares)

> **Status:** 📝 Especificação (aguardando implementação em ondas)
> **Data:** 2026-05-10
> **Autor:** Solicitação do usuário (3dresolucaoo@gmail.com)
> **Predecessores:** ADR 004 (finanças MVP), ADR 005 (catálogo evoluído)

---

## Contexto

O usuário pediu um conjunto de features de "inteligência de negócio" pra dar **controle, mapa, automação e guia** do negócio inteiro (3D printing + revenda + serviços). A solicitação inicial mencionou itens isolados (fornecedores, vendas dos últimos 6 meses, filamento mais vendido, baseline de seguidores, concorrentes).

A análise crítica revelou que:

1. **Esses itens não pertencem ao mesmo módulo** — têm cadências (diária/semanal/mensal/trimestral) e naturezas (operacional/estratégico) opostas. Forçar tudo num módulo "Inteligência" vira frankenstein.
2. **Schema atual é insuficiente** — `products` + `inventory` pensam em duas categorias estanques, mas o negócio vende objetos impressos, filamento direto, serviços, acessórios, possivelmente cursos/aluguel. Sem taxonomia de receita explícita, qualquer analytics mente.
3. **"Sexy e surpreendente"** exige insights que **mudam decisões**, não dashboards bonitos. Insights matadores exigem dados que **não existem hoje** (tempo de produção, atribuição de canal, movimentação histórica de estoque, LTV real).
4. **Construir tudo em paralelo é trap** — 6 features semi-prontas = nenhuma boa = volta ao "design genérico sem alma" que o usuário já reclamou.

---

## Decisão

Construir um **Mapa do Negócio em 6 Pilares**, em **ordem rígida e sequencial**, com massa crítica de dados garantida antes de cada pilar. O usuário aceitou explicitamente abrir mão da execução paralela em troca de qualidade por pilar.

### Os 6 pilares

| # | Pilar | Pergunta que responde | Cadência |
|---|---|---|---|
| 1 | 💰 **Mapa do Dinheiro** | "O que entra, sai, sobra, vai sobrar?" | Diária |
| 2 | ⏱️ **Mapa do Tempo** | "Onde meu tempo vai? Quanto vale minha hora?" | Diária |
| 3 | 👥 **Mapa dos Clientes** | "Quem volta, quem sumiu, quem vale ouro?" | Semanal |
| 4 | 📦 **Mapa do Estoque/Produção** | "O que falta, o que sobra, o que tá empacado?" | Diária |
| 5 | 📈 **Mapa do Crescimento** | "Onde estou vs onde quero chegar?" | Semanal |
| 6 | 🤖 **Guia / Copiloto** | "O que fazer HOJE com base nos dados?" | Diária |

Pilar 7 paralelo (low-priority): **Market Intel** (concorrentes + social baseline).

---

## Ordem rígida das ondas

A ordem foi escolhida por critérios objetivos:
- **(a) Dependências**: o que destrava o quê
- **(b) Dados existentes**: o que já dá pra fazer com schema atual
- **(c) Massa crítica baixa**: qual pilar gera valor com poucos dados

### Wave 0 — Fundação *(1 sessão)* ✅ 2026-05-10
Sem feature visível. Sem isso, qualquer pilar precisa ser refatorado depois.
- ✅ Migration `revenue_kind` em `products`: `'physical_print' | 'filament_resale' | 'service' | 'accessory' | 'digital' | 'rental'`
- ✅ ~~Migration `inventory_movements`~~ → **descoberta na execução**: tabela `movements` já existia no schema (com 0 linhas). Plano ajustado pra **estender** `movements` (adicionar `unit_cost`, `organization_id`, CHECK em type/reason alinhados com TS `MovementReason`) em vez de criar duplicada. Wave 3 popula.
- ✅ Migration `customers` consolidada (hoje cliente é só campo livre em orders) com partial UNIQUE em whatsapp + trigger updated_at + FK opcional em orders. Migração de dados (dedup) **não foi feita na Wave 0** — fica pra Wave 1 com UI "Importar de pedidos existentes" (UX > migration silenciosa).
- ✅ ADR 007 escrito (padrão "manual com lembrete forte")
- ✅ Todas as tabelas/colunas novas com `organization_id nullable` (preparando multi-tenant — ver ROADMAP "Escala")
- ⚠️ **Bonus**: descoberto que `lib/supabase/schema.sql` está stale (ex.: `products.id` real é `uuid`, não `text`). Documentado em `supabase/migrations/CLAUDE.md`. Antes de criar RPC nova, sempre conferir tipos no DB real.

### Wave 1 — Pilar 3 (Clientes) *(2-3 sessões)*
**Por que primeiro**: usa orders + leads que JÁ existem; massa crítica baixa (5+ clientes); efeito "uau" alto (você nunca viu isso consolidado).
- Tela "Mapa dos Clientes" com:
  - LTV por cliente
  - Top N por receita
  - "Sumiram há X dias" (potencial de recuperação)
  - Frequência média de compra
  - Detalhe do cliente (histórico de pedidos, valor total, ticket médio)

### Wave 2 — Suppliers + Pilar 1 evoluído *(3-4 sessões)*
**Por que junto**: suppliers destrava custo médio ponderado real → margem real → Pilar 1 vira verdade.
- Schema `suppliers` (nome, contato, MOQ, prazo, observações)
- Schema `supplier_prices` (time-series — preço observado por item, momento)
- FK `inventory.supplier_id` (nullable)
- Recalcular margem por produto com custo médio ponderado
- FinanceView ganha cards de "Mapa do Dinheiro" (lucro real, projeção de meta, alertas)

### Wave 3 — Pilar 4 (Estoque/Produção) *(2-3 sessões)*
- Popular `inventory_movements` em vendas/produção/compras
- Alertas de estoque baixo com previsão ("vai acabar em N dias")
- Capital parado (filamento sem venda há X dias)
- Fila de produção (jobs que ocupam tempo de impressora)

### Wave 4a — Pilar 2 (Tempo) com input manual *(2-3 sessões)*
- Campo `production_hours` em orders (input manual ao marcar como produzido)
- Captura de turno (`working_session`: start/end)
- Cálculo: lucro ÷ horas trabalhadas = "sua hora vale R$ X"
- "Hora paga por produto" (lucro do pedido ÷ horas que tomou)
- Ociosidade da impressora (tempo idle vs tempo em produção)

### Wave 4b — Integração Bambu Lab MQTT *(3-4 sessões)*
**Upgrade opcional** que substitui input manual de tempo de impressora.
- Conexão MQTT com impressora local (host:port + access code)
- Webhook quando job começa / termina
- Câmera/sensor stream (opcional)
- Status em tempo real

Wave 4b é separada porque (a) é épica própria, (b) só afeta usuários com Bambu Lab, (c) input manual da 4a continua sendo o fallback universal.

### Wave 5 — Pilar 5 (Crescimento) *(1-2 sessões)*
Agora dá porque os dados existem.
- Comparativos period-on-period (mês atual vs anterior, trimestre vs trimestre)
- Meta vs real (expandir `profit_goals` existente — ADR 004 Onda 3)
- Tendências de margem/receita (linhas históricas)
- "Oportunidades na mesa" (categoria com alta margem mas baixo volume)

### Wave 6 — Pilar 6 (Guia/Copiloto) *(3-4 sessões)*
A coroa. Engine de regras que cruza todos os pilares anteriores.
- Card "3 ações de maior alavancagem hoje"
- Alertas priorizados (estoque baixo, cliente sumindo, meta atrasada)
- Sugestões com cálculo embutido ("aumentar preço de X em Y%")
- **Só faz sentido se Waves 0-5 estão sólidas** — construir antes seria lixo bonito.

### Wave 7 — Market Intel *(1-2 sessões, low-priority)*
Pode ser feita em paralelo após Wave 3, ou nunca.
- `competitors` + `competitor_observations` (URL, preço observado, snapshot date)
- `social_snapshots` (platform, followers, engagement, captured_at, source manual|api)
- Lembrete forte se desatualizado >60 dias
- Migration path: começa manual; quando integração IG/YT (já no ROADMAP) ficar pronta, alimenta automático

---

## Total estimado

| Cenário | Wall-clock |
|---|---|
| 1 sessão/dia | ~3 semanas |
| 3-4 sessões/semana | ~5-6 semanas |
| 1-2 sessões/semana | ~3-4 meses |

Total de sessões: **17-23**.

---

## Riscos e mitigações

### Risco 1 — Wave 4 (Tempo) depende de disciplina do usuário
Input manual de horas todo dia é frágil. Se não virar hábito, Pilar 2 morre.
- **Mitigação**: Wave 4b (Bambu MQTT) substitui input manual quando ativa. Pra outras impressoras, padrão "manual com lembrete forte" (ADR 007).
- Usuário confirmou que cronometra tudo e vê valor pra esse público.

### Risco 2 — "Iterar com uso prático" não acontece
A proposta original do usuário foi "construo, uso, melhoro". Sem ritual, vira "construo e esqueço".
- **Mitigação**: ao fim de cada wave, **1 sessão de uso real** (5-10 min/dia por 3-5 dias) antes de partir pra próxima wave. Bloqueador explícito no ROADMAP.

### Risco 3 — Schema da Wave 0 erra a taxonomia
Se `revenue_kind` não cobrir todos os casos, refatoração depois é dolorosa.
- **Mitigação**: enum extensível (string + check constraint). Migration nova adiciona valor sem quebrar dados.

### Risco 4 — Pilar 6 (Copiloto) "alucina"
Se a engine de regras gerar sugestões erradas, perde credibilidade pra sempre.
- **Mitigação**: regras determinísticas (não LLM) na primeira versão. Cada sugestão mostra **o cálculo** que a gerou, em linguagem clara. Usuário pode dispensar com motivo.

### Risco 5 — Multi-tenant debt
ROADMAP prevê migrar pra `organization_id`. Tabelas novas devem nascer compatíveis.
- **Mitigação**: todas as 5+ tabelas novas (`suppliers`, `supplier_prices`, `customers`, `inventory_movements`, `competitors`, `competitor_observations`, `social_snapshots`) ganham coluna `organization_id uuid NULL` desde já. RLS atual continua via `user_id`; futura migration popula `organization_id`.

---

## O que está fora do escopo

- ❌ Refatorar finanças existentes (FinanceView, transactions). Wave 2 **estende**, não substitui.
- ❌ Mudar qualquer comportamento atual de `orders`/`products`/`inventory` que não seja aditivo.
- ❌ Construir UI sem dado real. Cada card de insight precisa funcionar com dados de produção do usuário.
- ❌ Implementar tudo de uma vez. Cada wave merge antes da próxima começar.

---

## Aceite explícito

Confirmado em conversa em 2026-05-10:
- Usuário aceitou ordem rígida 0→7
- Usuário confirmou disciplina pra cronometrar tempo (Wave 4a)
- Usuário pediu Wave 4b (Bambu MQTT) como upgrade
- Decisão de construir 1 wave por vez (não paralelo) confirmada
