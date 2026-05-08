# ADR 004 — Finanças Empresariais MVP (Ponto de Equilíbrio + Metas)

> **Status:** 📝 Especificação (aguardando implementação faseada)
> **Data:** 2026-05-08
> **Autor:** Solicitação do usuário (3dresolucaoo@gmail.com)

---

## Contexto

Hoje o módulo Finanças (`app/finance/page.tsx` + `components/FinanceView.tsx`) só registra transações soltas (receita / despesa) e mostra:
- Receita total, despesas, lucro, margem
- Evolução mensal, breakdown por categoria
- Lista filtravel de transações

**Falta o que importa pra um pequeno empresário/MEI saber se o negócio tá saudável:**
1. Separação **custo fixo vs variável** (não dá pra calcular ponto de equilíbrio sem isso)
2. **Margem de contribuição** por produto/serviço
3. **Ponto de equilíbrio** (break-even point) — quanto vender pra não dar prejuízo
4. **Metas de lucro** — quanto vender pra atingir lucro X
5. **Fluxo de caixa** + reserva de emergência (3-6 meses dos custos fixos)
6. **Separação pessoal/empresa** — pró-labore como categoria

---

## Decisão

Implementar como **funcionalidade nova** dentro de `app/finance/`, NÃO refatorar o que já existe.

### Princípios

- **Reaproveitar `transactions`** como fonte de verdade, mas adicionar campo discriminador `is_fixed: boolean` (ou nova categoria estruturada)
- **Não forçar reclassificação de tudo** — quem não preencher, sistema assume "variável" (fallback seguro)
- **Margem de contribuição por produto** — usar `Product` + `InventoryItem` que já existem (preço venda - custos variáveis)
- **Ponto de equilíbrio global** primeiro; per-projeto numa fase 2
- **Educacional**: cada métrica deve ter tooltip/explicação curta (usuário não precisa decorar fórmula)

---

## Estrutura de Custos — definição

### Custos Fixos (existem mesmo sem vender)
- DAS-MEI (R$ 82,05 a R$ 87,05 em 2026 — varia por atividade: comércio R$82,05 / serviços R$86,05 / comércio+serviços R$87,05)
- Aluguel
- Internet / energia base
- Salários (CLT, pró-labore fixo)
- Software / assinaturas (Vercel, Supabase, etc.)
- Equipamentos depreciados (impressora 3D, etc. — distribuir custo)

### Custos Variáveis (mudam com volume de vendas)
- Filamento / matéria-prima
- Comissões (afiliado, marketplace fee)
- Frete enviado
- Embalagens
- Taxa de pagamento (Stripe, MP — % por transação)
- Anúncios (parcialmente — grade gray, geralmente trato como variável)

### Despesas Variáveis (não confundir com Custo Variável)
- Impostos sobre venda (já incluso no DAS pra MEI)
- Comissão de vendedor
- Devolução / chargeback

---

## Fórmulas (em PT-BR pra UI)

### 1. Margem de Contribuição (MC) por unidade

```
MC = Preço de Venda − (Custos Variáveis + Despesas Variáveis)
```

**Exemplo:** Produto vendido por R$ 50, custo variável R$ 20 → MC = **R$ 30/un**

### 2. Margem de Contribuição em %

```
MC% = (MC / Preço de Venda) × 100
```

### 3. Ponto de Equilíbrio (em unidades) — **Break Even Point**

```
PE_unidades = Custo Fixo Total / Margem de Contribuição Unitária
```

**Exemplo:** Custos fixos R$ 1.000 / MC R$ 30 = **34 unidades** pra cobrir custos.

### 4. Ponto de Equilíbrio (em R$)

```
PE_reais = Custo Fixo Total / MC%
```

### 5. Meta de Vendas (Ponto de Equilíbrio Econômico)

Quanto vender pra atingir lucro desejado:

```
Meta = (Custo Fixo + Lucro Desejado) / MC unitária
```

**Exemplo:** (R$ 1.000 + R$ 500 lucro) / R$ 30 = **50 unidades** pra ter R$ 500 lucro.

### 6. Mark-up (precificação inversa)

```
Preço Sugerido = Custo Total × (1 + margem_desejada)
```

---

## UI proposta — `app/finance/`

### Tabs novas em `FinanceView`

```
[ Visão Geral ]  [ Custos Fixos ]  [ Ponto de Equilíbrio ]  [ Metas ]  [ Transações ]
```

### Tab "Custos Fixos"
- Lista de despesas recorrentes mensais
- Campos: nome, valor mensal, categoria (DAS, aluguel, software, ...), ativo desde
- Soma total = `Custo Fixo Mensal Total` (input pro break-even)
- Toggle "Considerar nos cálculos" por linha

### Tab "Ponto de Equilíbrio"
- Card destacado: **"Você precisa vender R$ X esse mês pra não ter prejuízo"**
- Card secundário: **"Hoje você está em XX% do ponto de equilíbrio"**
- Por produto (lista):
  - Produto · Preço · Custo variável · MC un · MC % · Quantas unidades pra break-even
- Gráfico simples: receita acumulada vs custo fixo (intersecção = breakeven)

### Tab "Metas"
- Input: lucro desejado mensal (R$)
- Cálculo: meta de vendas em R$ + em unidades por produto
- Comparativo com mês anterior
- "Faltam X unidades de Y" (gamificação leve)

### Tooltip educacional
Cada métrica tem `(?)` com explicação simples + fórmula. Ex:
> **Margem de Contribuição:** quanto sobra de cada venda depois de pagar os custos variáveis. Ex: vende R$50, custa R$20 → sobram R$30 pra cobrir aluguel/luz/etc.

---

## Schema SQL (proposto — fase 2)

```sql
-- Custos fixos recorrentes
create table fixed_costs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade, -- null = global
  name text not null,
  category text not null, -- 'das', 'aluguel', 'salario', 'software', 'outro'
  monthly_value numeric(10,2) not null check (monthly_value >= 0),
  is_active boolean not null default true,
  active_since date not null default current_date,
  notes text,
  created_at timestamptz default now()
);

-- Metas de lucro
create table profit_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade, -- null = global
  month text not null, -- '2026-05'
  desired_profit numeric(10,2) not null,
  achieved_profit numeric(10,2), -- preencher no fim do mês
  created_at timestamptz default now(),
  unique(user_id, project_id, month)
);

-- RLS habilitado em ambas
alter table fixed_costs enable row level security;
alter table profit_goals enable row level security;
```

**Variáveis de margem:** `Product.salePrice - InventoryItem.costPrice` já existem — não precisa schema novo pro MVP.

---

## Plano faseado

### Fase 1 — Bug fix + estrutura ✅ próxima
- Investigar bug "Lucro > Receita" (mistura `transactions` com `orders × products`)
- Decidir: unificar fonte ou rotular claramente cada card

### Fase 2 — MVP Break-even (sem persistência)
- Tab "Ponto de Equilíbrio" usando custos fixos = soma de transactions com flag `is_fixed`
- Inferir custos variáveis dos produtos cadastrados
- Calcular tudo client-side, sem schema novo
- **Validação rápida com usuário antes de criar tabelas**

### Fase 3 — Schema dedicado
- Migration `fixed_costs` + `profit_goals`
- UI completa de cadastro
- Per-projeto

### Fase 4 — Educacional
- Tooltips com fórmulas
- Onboarding "configure seus custos fixos primeiro"
- Sugestões automáticas (DAS-MEI baseado em CNAE)

---

## Diferenças MEI / ME / CNPJ Pessoa Física (educacional — pra UI futura)

Documentado aqui pra orientar features de **categorização fiscal** e **dashboards adequados ao porte**.

### MEI — Microempreendedor Individual
- **Faturamento máximo:** R$ 81.000/ano (em 2026 — verificar se subiu)
- **DAS-MEI 2026:**
  - Comércio/Indústria: **R$ 82,05**
  - Serviços: **R$ 86,05**
  - Comércio + Serviços: **R$ 87,05**
- **Imposto:** valor fixo mensal (DAS), independente do faturamento
- **Funcionários:** máximo 1 empregado
- **Pode emitir:** NF-e e NFS-e
- **NÃO permitido:** algumas atividades (médicos, advogados, engenheiros)
- **Vantagens:** simplicidade, INSS incluso, custo baixo
- **Desvantagens:** limite de faturamento; depois precisa migrar pra ME

### ME — Microempresa
- **Faturamento:** R$ 81.000 a R$ 360.000/ano
- **Regime tributário:** Simples Nacional (mais comum) ou Lucro Presumido
- **Simples Nacional:** alíquota progressiva (4% a 15,5%) sobre receita
- **Permite:** mais funcionários, mais atividades, sócios
- **Obrigações:** contador (recomendado), DASN-Simples anual
- **Pró-labore:** sim, mas separado da pessoa física

### EPP — Empresa de Pequeno Porte
- **Faturamento:** R$ 360.000 a R$ 4,8 milhões/ano
- **Mesmo regime** do Simples Nacional, mas com alíquotas maiores

### Profissional Autônomo (Pessoa Física)
- Sem CNPJ
- **Imposto:** carnê-leão mensal + IRPF anual
- **INSS:** próprio (20% sobre o que ganha)
- Pode emitir RPA (Recibo de Pagamento Autônomo) ou NFP-e via prefeitura
- Não emite NF-e/NFS-e como empresa

### Implicações pra UI

- **Detectar tipo de empresa** no onboarding (campo no perfil/projeto)
- **DAS-MEI calculado automaticamente** baseado na atividade (CNAE)
- **Limite de faturamento** mostrado no dashboard ("Você está em 47% do limite MEI - R$ 38.000 / R$ 81.000")
- **Alerta** quando aproximar do teto (90%) — sugestão de migração pra ME
- **Pró-labore** como categoria de despesa (não confundir com lucro do dono)
- **Separação pessoal/empresa** sempre separada (cardholder do MEI confunde)
- **Reserva de emergência:** sugerir 3-6× o custo fixo mensal

### Padrão de boas práticas (organização básica)

1. **Conta bancária separada** — nunca misturar PF/PJ
2. **Registrar tudo** — toda venda e todo custo (mesmo o cafezinho do escritório)
3. **Pró-labore mensal fixo** — paga você mesmo "salário" antes do lucro
4. **Reserva** — 3 a 6 meses de custos fixos guardados
5. **Fluxo de caixa diário** — saldo + a receber + a pagar
6. **Revisão mensal** — fechar o mês, conferir margem

---

## Referências externas

- DAS-MEI: https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/
- Sebrae: https://sebrae.com.br/sites/PortalSebrae/sebraeaz/conheca-a-tabela-do-mei
- App Nu Empresas (sugestão pro usuário gerenciar DAS)

---

## Status

- [x] ADR criado 2026-05-08
- [ ] Bug "Lucro > Receita" investigado
- [ ] Fase 2 implementada (MVP break-even client-side)
- [ ] Fase 3 (schema dedicado)
- [ ] Fase 4 (UI educacional + onboarding fiscal)

> Quando começar implementação, mover itens correspondentes pra `ROADMAP.md` § "🟧 IMPORTANTES".
