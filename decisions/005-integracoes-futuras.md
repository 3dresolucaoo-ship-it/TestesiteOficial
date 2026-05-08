# ADR 005 — Integrações Futuras (Catálogo · CRM · Fiscal · Métricas)

> **Status:** 📝 Backlog estruturado (não implementar agora)
> **Data:** 2026-05-08
> **Autor:** Solicitação do usuário (3dresolucaoo@gmail.com)

---

## Contexto

Usuário solicitou integração ponta-a-ponta da plataforma. Princípio explícito:

> *"o site todo é integrado, oque entra em finanças não é diferente de produtos, saca? ou métricas ou dashboard"*

A integração principal **já existe** em [core/flows/processOrder.ts](../core/flows/processOrder.ts) (order pago → transaction + inventory decrement + production task). Este ADR captura **integrações futuras** que ainda não existem.

---

## 🛒 1. Vitrine / Catálogo — modos de checkout

> Inspiração: https://3dresolucao.stoqui.shop/ (vitrine atual do usuário)

### Estado atual
- Catálogo público em `/catalogo/[slug]`
- Checkout via Mercado Pago (Preference)
- Checkout via Stripe (provider pronto, OAuth implementado)
- Não tem modo "combinar com vendedor" estruturado

### Modos propostos por produto

| Modo | Quando usar | UX |
|---|---|---|
| 🟢 **Comprar agora** | SKU fixo, sem variação (chaveiro padrão) | Botão "Comprar" → checkout Stripe/MP |
| 🟡 **Personalizar** | Variações simples (cor, tamanho) | Seletor → checkout |
| 🔵 **Solicitar orçamento** | Customizado, projeto, alta complexidade | Form estruturado (descrição, anexos, urgência) → cria **Lead** no CRM |
| 💬 **Falar com vendedor** | Botão flutuante sempre disponível (fallback) | WhatsApp deeplink com contexto pré-preenchido |

### Implicações de schema

```sql
-- Adicionar à tabela products
alter table products add column checkout_mode text not null default 'direct'
  check (checkout_mode in ('direct', 'variant', 'quote', 'contact_only'));

alter table products add column variants jsonb; -- [{name: "Cor", options: ["Roxo", "Verde"]}]
alter table products add column allows_custom boolean not null default false;
```

### Lead capture estruturado (orçamento)

Quando cliente clica "Solicitar orçamento":
- Form: nome, whatsapp, email, descrição, urgência, anexar referência
- Ao submeter → insere em `leads` com:
  - `origin = 'catalog_quote'`
  - `productId = <produto>` (referência cruzada)
  - `customFields = { description, urgency, referenceUrl }`
- Notifica vendedor (email + push) — não depender de ele estar online
- Cliente recebe email de confirmação ("orçamento recebido, respondemos em 24h")

---

## 📊 2. Métricas SEO + Funil do catálogo

### O que o usuário pediu

> *"métricas seo de quantas pessoas entrou tentou pagar ter os dados da pessoas ir direto pro crm"*

### Eventos a trackar (analytics próprio)

| Evento | Onde | Dado coletado |
|---|---|---|
| `catalog.view` | `/catalogo/[slug]` page load | slug, referrer, utm_*, fbclid, sessionId |
| `product.view` | abrir modal/página de produto | productId, slug |
| `checkout.start` | clicar "Comprar agora" | productId, value, mode |
| `checkout.abandoned` | sair sem completar | productId, step, timeElapsed |
| `checkout.completed` | webhook confirma pagamento | orderId, paymentMethod (card/pix/boleto) |
| `quote.requested` | submeter form de orçamento | productId, leadId |
| `whatsapp.clicked` | clicar botão WhatsApp | productId (se tiver), source |

### Schema sugerido

```sql
create table catalog_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade, -- merchant
  catalog_slug text,
  product_id uuid references products(id),
  event_type text not null,
  session_id text not null, -- cookie anônimo
  referrer text,
  utm_source text, utm_medium text, utm_campaign text, utm_content text,
  fbclid text, gclid text,
  user_agent text,
  ip_country text, -- não IP completo (LGPD)
  metadata jsonb,
  created_at timestamptz default now()
);

create index on catalog_events (user_id, catalog_slug, created_at);
create index on catalog_events (event_type, created_at);
```

### Dashboards derivados

- **Funil de conversão**: views → product views → checkout starts → completed (% em cada etapa)
- **Top produtos**: mais vistos, mais convertidos, abandonados
- **Tráfego por fonte**: orgânico, Instagram, Facebook, direto, affiliate
- **Mapa de calor temporal**: melhor horário/dia pra postar
- **Tracking UTM completo** — saber qual post do Insta gerou qual venda

### LGPD / Privacidade

- Cookie `session_id` anônimo (sem dados pessoais)
- IP só armazena país, não octetos
- Banner de cookies obrigatório (já há projeto de lei avançado)
- Direito ao esquecimento: endpoint `/api/privacy/delete?session=X`

---

## 🤝 3. CRM segmentado por canal

### O que o usuário pediu

> *"CRM separação ne no crm, seria bem interessante, tipo crm de facebook, somente facebook ou todos tambem"*

### Estado atual
- Tabela `leads` com campo `origin` (string livre)
- Sem agrupamento por canal nativo

### Proposta

Adicionar **canais nativos** com tipagem:

```ts
type LeadChannel =
  | 'instagram'
  | 'facebook'
  | 'whatsapp'
  | 'catalog_quote'
  | 'catalog_checkout'
  | 'tiktok'
  | 'email'
  | 'manual'
  | 'affiliate'
  | 'organic'
```

### Visualizações necessárias

- **CRM filtrado por canal** (tab horizontal: "Todos", "Instagram", "Facebook", "Catálogo", "WhatsApp")
- **Comparativo cross-canal**: quantos leads cada canal trouxe, qual canal converte mais, ticket médio por canal
- **Funil por canal**: novo → contatado → proposta → fechado / perdido
- **Atribuição multi-touch**: lead viu Instagram + visitou catálogo + fechou WhatsApp → atribuir parcial a cada (default first-touch)

### Integração com pagamento

Por que isso é crítico: hoje quando alguém compra pelo checkout, o lead é "perdido" do CRM. Precisa **manter o lead vivo** mesmo após compra, marcando como `won` mas guardando histórico:

- Que canal trouxe ele (atribuição)
- Quanto tempo do primeiro contato até fechar (sales cycle)
- Como pagou (cartão / pix / boleto)
- LTV (lifetime value — somar todas compras desse cliente)

### Schema additions

```sql
alter table leads add column channel text;
alter table leads add column first_touch_at timestamptz;
alter table leads add column converted_at timestamptz;
alter table leads add column ltv numeric(10,2) default 0;

-- Vincular leads a customers (tabela nova)
create table customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  whatsapp text,
  email text,
  name text,
  cpf_cnpj text, -- opcional
  total_orders int default 0,
  ltv numeric(10,2) default 0,
  first_order_at timestamptz,
  last_order_at timestamptz,
  preferred_payment_method text, -- 'card' | 'pix' | 'boleto'
  channels text[], -- ['instagram', 'whatsapp']
  unique (user_id, whatsapp)
);

-- Vincular orders a customers
alter table orders add column customer_id uuid references customers(id);
alter table leads   add column customer_id uuid references customers(id);
```

---

## 🧾 4. Emissão automática de Nota Fiscal (Bling)

### O que o usuário pediu

> *"qunado a pessoa pagar ja ser integrado depois com nota fiscal do bling memso"*

### Fluxo proposto

```
Order pago (webhook MP/Stripe)
  → processNewOrderAdmin (já existe)
    → cria transaction (já)
    → cria production task (já)
    → 🆕 emite NF-e/NFS-e via Bling API
    → 🆕 anexa pdf da nota ao order
    → 🆕 envia nota por email pro cliente
```

### Implementação técnica

- OAuth Bling no padrão de `services/paymentConfig.ts` (mesma tabela `payment_configs`, novo provider `'bling'`)
- Service `services/blingNFe.ts` com `emitNFe(order, customer)`
- Adicionar coluna `orders.invoice_id` + `orders.invoice_url`
- Falha não-fatal: se Bling falhar, order é committed, log de erro, admin reemite manualmente
- Tab "Notas Fiscais" no módulo Financeiro com listagem + reemissão

### Considerações fiscais

- **MEI:** geralmente não precisa emitir NF pra PF (B2C), só pra PJ. Mas algumas prefeituras exigem NFS-e.
- **ME:** obrigatório emitir NF em toda venda
- **Determinar com base no perfil fiscal do usuário** (ver § 5)

---

## 🏛️ 5. Perfil Fiscal — MEI / ME / EPP / PF Autônomo

### O que o usuário pediu

> *"como vamos ponhar mei me, e etc no app tmb, dava ja direto nao sei como vou fazer isso mas integra tmb o cnpj da pessoa"*

### Estado atual
- Sem campo de tipo de empresa
- Sem CNPJ vinculado
- Sem cálculo de impostos

### Proposta — onboarding fiscal

Tab nova em **Settings → Empresa**:

```ts
type CompanyType =
  | 'pf'            // Pessoa Física Autônoma
  | 'mei'           // Microempreendedor Individual
  | 'me_simples'    // ME Simples Nacional
  | 'me_lucro_pres' // ME Lucro Presumido
  | 'epp'           // Empresa Pequeno Porte
  | 'ltda'          // LTDA Lucro Real

interface CompanyProfile {
  type: CompanyType
  cnpj?: string             // formato: 00.000.000/0000-00
  cpf?: string              // se PF
  razaoSocial?: string
  nomeFantasia?: string
  cnae: string              // ex: "3299-0/02"
  inscricaoEstadual?: string
  inscricaoMunicipal?: string
  regime: 'simples' | 'presumido' | 'real' | 'mei' | 'autonomo'
  optanteMEI: boolean
  ramo: 'comercio' | 'industria' | 'servicos' | 'comercio_servicos'
}
```

### Implicações automáticas

Sabendo o tipo, o app pode:

1. **Calcular DAS-MEI automático** (tabela 2026: R$82,05 / R$86,05 / R$87,05 conforme ramo)
2. **Alertar limite de faturamento**:
   - MEI: R$ 81.000/ano → "Você está em 67% (R$ 54k/R$ 81k)"
   - ME Simples: R$ 360.000 → idem
   - Sugerir migração ao chegar em 90%
3. **Determinar se precisa emitir NF** (varia por tipo + cliente PF/PJ)
4. **Calcular alíquota Simples Nacional** (anexos I-V, progressivo) automaticamente
5. **Pró-labore** como categoria de despesa (recomenda valor mínimo legal)
6. **Gerar relatório anual** pra contador (DEFIS, DASN-Simples)
7. **Lembrete de obrigações**: DAS dia 20, declaração anual janeiro/maio

### Schema

```sql
create table company_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade, -- null = global
  type text not null,
  cnpj text, cpf text,
  razao_social text, nome_fantasia text,
  cnae text not null,
  inscricao_estadual text, inscricao_municipal text,
  regime text not null,
  optante_mei boolean default false,
  ramo text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, project_id)
);
```

### Integrações úteis

- **Consulta CNPJ automática** — ao digitar CNPJ, preencher razão social, CNAE, etc. via API ReceitaWS / BrasilAPI
- **Validação CPF/CNPJ** (algoritmo) no client
- **Tabela CNAE** (lista oficial Receita Federal) — pré-cadastrada

---

## 💳 6. Métodos de pagamento por cliente

### O que o usuário pediu

> *"ter essas pessoas ali vendo como elas pagam se e cartao pix enfim"*

### Já existe no schema

Tabela `orders` tem `payment_status` mas falta `payment_method` estruturado.

### Proposta

```sql
alter table orders add column payment_method text
  check (payment_method in ('credit_card', 'debit_card', 'pix', 'boleto', 'cash', 'transfer', 'other'));

alter table orders add column payment_method_details jsonb;
-- ex: { brand: 'mastercard', last4: '1234', installments: 3 }
```

### Dashboards derivados

- **Distribuição de meios de pagamento** (pie chart no financeiro)
- **Ticket médio por método** (cartão > pix?)
- **Taxa de conversão por método** (qual passa, qual falha)
- **Customer profile**: "João sempre paga cartão 3x"

---

## 📋 7. Resumo do roadmap consolidado

> Quando promover pra ROADMAP.md, agrupar nessa ordem (precedência por dependência):

### Fase A — Fundação (próximas 2 semanas)
- [ ] Reconciliação `orders` ↔ `transactions` (script 1×)
- [ ] Adicionar labels claros no dashboard (operacional vs financeiro)
- [ ] Onda 2 do break-even (ADR 004)

### Fase B — Catálogo evoluído (1-2 meses)
- [ ] Modos de checkout por produto (`direct` / `variant` / `quote` / `contact_only`)
- [ ] Form estruturado de orçamento → Lead no CRM
- [ ] Botão WhatsApp flutuante com contexto

### Fase C — Métricas & SEO (1-2 meses)
- [ ] Schema `catalog_events`
- [ ] Tracking UTM/fbclid/gclid
- [ ] Funil de conversão dashboard
- [ ] Top produtos, melhor horário, tráfego por fonte

### Fase D — CRM segmentado (1 mês)
- [ ] Tipo `LeadChannel` + filtros por canal
- [ ] Tabela `customers` + dedup por whatsapp/email
- [ ] LTV automático
- [ ] Atribuição multi-touch (first-touch como default)

### Fase E — Fiscal (2-3 meses)
- [ ] Onboarding `company_profiles`
- [ ] Validador + consulta automática CNPJ
- [ ] Cálculo automático DAS-MEI
- [ ] Alertas de limite de faturamento
- [ ] Cálculo Simples Nacional progressivo

### Fase F — Bling NF-e (1 mês depois da Fase E)
- [ ] OAuth Bling em `payment_configs` (provider: `bling`)
- [ ] Emissão automática no webhook
- [ ] Tab "Notas Fiscais" no Financeiro
- [ ] Reemissão manual + reprocessamento

### Fase G — Pagamento estruturado
- [ ] Coluna `orders.payment_method` + dashboards de distribuição
- [ ] LTV por método
- [ ] Customer profile com método preferido

---

## Decisão consolidada

**Princípio:** todo dado novo entra **integrado por design**. Não criar tabelas isoladas — sempre vincular a `user_id`, `project_id`, e quando aplicável `customer_id` / `order_id` / `product_id`. **Foreign keys são obrigatórias, não opcionais.**

**Prioridade pra próximas sessões:**
1. Fase A (fundação) — alinha o que já existe
2. Fase B (catálogo) — abre canal de receita
3. Fase D (CRM) — fecha o loop venda-relacionamento

Fases C, E, F, G ficam disponíveis pra puxar quando o usuário pedir explicitamente.

---

## Status

- [x] ADR criado 2026-05-08
- [ ] Promover Fase A pra ROADMAP.md (próxima sessão)
- [ ] Validar prioridades com usuário antes de cada fase
