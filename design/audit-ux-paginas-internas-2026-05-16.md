# Auditoria UX — Páginas Internas Hayzer
**Data**: 2026-05-16
**Auditora**: Sofia (CS Pleno G7)
**Perspectiva**: Rafael, 34 anos, maker 3D individual, primeiro acesso ao sistema

---

## Contexto da Avaliação

Rafael acabou de clicar no link "acesso antecipado" que recebeu no WhatsApp. Ele está com o celular em uma mão e filamento PLA na outra. Tem uma impressora rodando. Ele tem 5 minutos — talvez menos.

---

## Top 10 Friction Points — Primeiros 5 Minutos

### Crítico (mata o onboarding)

**FP-01 — Dashboard vazio não explica nada**
O `DashboardView` presume que o usuário já tem projetos, pedidos e transações. Quando `state.projects.length === 0`, a tela mostra seções com subtítulos técnicos ("Visão Financeira", "Performance Intelligence") e dados zerados (`R$ 0`, "Nenhum projeto ainda."). Rafael não entende o que fazer. Não há CTA, não há ordem de prioridade, não há "começa aqui".

**FP-02 — Nenhuma tela tem onboarding de primeira vez**
Não existe uma tela de boas-vindas, checklist de setup ou tour. O usuário cai direto no dashboard sem saber o que é "Projeto", por que precisa criar um antes de tudo, nem qual módulo usar primeiro. A dependência oculta é: `projeto obrigatório → inventário → produto → pedido`. Nenhuma tela ensina essa sequência.

**FP-03 — Empty state de Inventory e Products quebra com "Nenhum projeto encontrado"**
Tanto `/inventory` quanto `/products`, quando `projects.length === 0`, mostram apenas um ícone cinza e texto passivo. O usuário não sabe que precisa ir em `/projects` primeiro. Não há link, não há ação. É um beco sem saída.

**FP-04 — Formulário de Produto é intimidante demais para o primeiro cadastro**
O modal de "Novo Produto" tem 12 campos ativos imediatamente: Material (g/peça), Tempo de Impressão (h), Taxa de Falha (%), Custo de Energia (R$/h), Custo de Suporte, Margem Desejada, Filamento Utilizado, Preço de Venda, Modo de Venda (4 opções), variantes, imagem, observações. Rafael não sabe o custo de energia por hora da impressora dele. Ele desiste antes de salvar.

**FP-05 — Login ainda mostra "BVaz Hub" e letra "B" no avatar**
A tela de login (`app/login/page.tsx` linha 137) exibe "BVaz Hub v0.4" e o avatar é a letra "B" com gradiente. O rebranding para Hayzer não foi aplicado aqui. O usuário que veio de `hayzer.com.br` chega num sistema que se chama "BVaz Hub". Gera desconfiança imediata.

### Importante

**FP-06 — CRM usa "Lead" sem explicar o que é para o maker**
A página CRM tem uma aba "Pipeline" com status `new / contacted / negotiating / won / lost`. Um maker individual no WhatsApp não pensa em "leads". Ele pensa em "cliente novo", "cliente que perguntou o preço", "pedido fechado". O vocabulário é de startup SaaS, não de maker 3D.

**FP-07 — Financeiro não tem empty state funcional**
`FinanceView` tem duas abas: Visão Geral e Break-Even. Com zero transações, a aba "Visão Geral" mostra R$ 0 em todos os cards sem nenhuma orientação. A aba "Break-Even" provavelmente mostra formulário mas sem contexto de "preencha seus custos fixos mensais aqui". O Rafael não sabe que essa calculadora existe.

**FP-08 — Sidebar tem 14 itens de navegação sem agrupamento visual claro**
O maker olha para a sidebar e vê: Dashboard, Métricas, Projetos, Finanças, Vendas, CRM, Produtos, Estoque, Produção, Conteúdo, Decisões, Catálogos, Portfólios, Configurações. Quatorze itens. Sem hierarquia de "use isso primeiro". Sem destaque de qual é o módulo mais importante para ele.

**FP-09 — Formulário de Pedido pede "Projeto" como primeiro campo sem criar o contexto**
Em `/orders`, ao criar um novo pedido, o primeiro campo é "Projeto" (dropdown). Se o usuário tem um único projeto, isso é ruído. Se não tem nenhum, o dropdown está vazio e o botão "Criar Pedido" não funciona — mas nenhuma mensagem explica o motivo.

**FP-10 — Nenhuma mensagem de erro amigável nos formulários de validação silenciosa**
Em `OrderForm`, a submissão falha silenciosamente se `clientName` ou `item` estão vazios (`if (!data.clientName.trim() || !data.item.trim()) return`). O usuário clica em "Criar Pedido" e nada acontece. Sem toast, sem mensagem inline, sem nada.

---

## Empty States Reformulados — 5 Telas Prioritárias

### 1. Dashboard — primeiro acesso (estado: sem projetos)

**Estado atual:**
Seções com título e sub-título técnicos aparecem mas populadas com zeros e textos "Nenhum projeto ainda." em fonte pequena cinza. Não há CTA.

**Estado sugerido:**
```
┌─────────────────────────────────────────────┐
│                                             │
│   [ícone: impressora 3D simples, stroke]    │
│                                             │
│   Bem-vindo ao Hayzer, Rafael               │
│                                             │
│   Vamos configurar seu negócio de           │
│   impressão 3D em 3 passos.                 │
│                                             │
│   ① Crie seu primeiro projeto              │
│      (ex: "Minha Ender 3", "Loja 3D")      │
│                                             │
│   ② Adicione um filamento ao estoque       │
│                                             │
│   ③ Cadastre o primeiro produto            │
│                                             │
│   [Criar meu primeiro projeto]             │
│                                             │
│   Ou: ver um tour rápido de 2 min →        │
│                                             │
└─────────────────────────────────────────────┘
```

Regras:
- Personalizar com o nome se disponível
- Botão primário leva direto a `/projects` com modal de criação já aberto
- Link "tour rápido" aciona um tooltip guiado (não vídeo)

---

### 2. Inventory — sem itens (estado: projeto existe mas estoque vazio)

**Estado atual:**
Ícone `Package` cinza 40px + texto "Nenhum item no estoque. Adicione o primeiro!" + botão "Adicionar Primeiro Item".
Funcional, mas genérico demais para o contexto maker 3D.

**Estado sugerido:**
```
┌─────────────────────────────────────────────┐
│                                             │
│   [ícone: carretel de filamento, stroke]    │
│                                             │
│   Seu estoque está vazio                    │
│                                             │
│   Comece adicionando o filamento que        │
│   você usa agora. Com ele registrado,       │
│   o Hayzer calcula automaticamente o        │
│   custo de cada peça que você imprime.      │
│                                             │
│   [Adicionar Filamento PLA]                │
│   [Adicionar outro item]                   │
│                                             │
│   O que posso cadastrar aqui?              │
│   Filamentos, equipamentos e qualquer      │
│   material que entra no custo da peça.     │
│                                             │
└─────────────────────────────────────────────┘
```

Regras:
- Botão primário abre o modal já com categoria "Filamento" pré-selecionada
- Texto explica o benefício concreto ("calcula automaticamente o custo")
- Reforça o vocabulário do maker (PLA, filamento, peça)

---

### 3. Products — sem produtos (estado: projeto e estoque existem)

**Estado atual:**
Ícone `Package` cinza + "Nenhum produto cadastrado ainda." + botão "Criar Primeiro Produto".
Não explica o que é um "produto" no contexto do sistema.

**Estado sugerido:**
```
┌─────────────────────────────────────────────┐
│                                             │
│   [ícone: cubo 3D impresso, stroke]         │
│                                             │
│   Cadastre o que você vende                 │
│                                             │
│   Um "produto" aqui é qualquer peça         │
│   que você imprime e vende — suporte        │
│   de celular, miniatura, peça técnica.      │
│                                             │
│   Ao cadastrar, o Hayzer calcula:           │
│   · Custo de impressão (material + energia) │
│   · Margem de lucro                         │
│   · Preço sugerido por marketplace          │
│                                             │
│   [Cadastrar meu primeiro produto]         │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 4. Orders/Vendas — sem pedidos

**Estado atual:**
Tabela vazia com "Nenhum pedido encontrado." centralizado em cinza. Sem ação, sem contexto.

**Estado sugerido:**
```
┌─────────────────────────────────────────────┐
│                                             │
│   [ícone: carrinho simples, stroke]         │
│                                             │
│   Sua primeira venda está esperando         │
│                                             │
│   Registre pedidos do WhatsApp,             │
│   Instagram ou Mercado Livre aqui.          │
│   O Hayzer conecta o pedido ao produto      │
│   e desconta o filamento do estoque.        │
│                                             │
│   [Registrar primeiro pedido]              │
│                                             │
│   Dica: se ainda não tem produto            │
│   cadastrado, crie um primeiro →           │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 5. CRM — sem leads (aba Pipeline vazia)

**Estado atual:**
Colunas kanban com "Sem leads" em texto cinza dentro de borda pontilhada. Não explica o que um "lead" é para o maker.

**Estado sugerido:**
```
┌─────────────────────────────────────────────┐
│                                             │
│   [ícone: pessoa com seta, stroke]          │
│                                             │
│   Sem contatos no funil ainda               │
│                                             │
│   Cada vez que alguém perguntar o           │
│   preço no WhatsApp ou Instagram,           │
│   adicione aqui como "Novo contato".        │
│   O Hayzer te ajuda a não esquecer          │
│   nenhum cliente em potencial.              │
│                                             │
│   [Adicionar primeiro contato]             │
│                                             │
└─────────────────────────────────────────────┘
```

Nota de copy para Carla: substituir "Lead" por "Contato" ou "Cliente em potencial" em toda a interface do CRM. "Lead" é jargão de marketing que o Rafael do chão de fábrica não usa.

---

## Banco de Erros Reformulados

### Erros de sistema

| Situação | Mensagem atual | Mensagem sugerida |
|---|---|---|
| Upload falha (inventory) | `Erro ao enviar: [msg técnica do Supabase]` | "Não conseguimos enviar a foto agora. Tente de novo ou pule — você pode adicionar depois." |
| Supabase não configurado | "Supabase não configurado — upload indisponível." | "Upload de foto temporariamente indisponível. Continue sem foto por enquanto." |
| dbError no banner de products | Exibe mensagem bruta de erro | "Algo deu errado ao carregar seus produtos. Recarregue a página — já fomos avisados." |
| Imagem > 5MB | "Imagem muito grande. Máximo 5 MB." | "Essa foto é grande demais (máximo 5 MB). Tente comprimir ou usar outra." |
| Arquivo não é imagem | "Selecione uma imagem (JPG, PNG, WebP…)" | "Esse arquivo não é uma foto. Selecione uma imagem JPG, PNG ou WebP." |

### Erros de formulário (validação silenciosa — crítico)

| Situação | Comportamento atual | Comportamento sugerido |
|---|---|---|
| Criação de pedido com campos vazios | Botão "Criar Pedido" não faz nada | Mostrar mensagem inline: "Nome do cliente é obrigatório" abaixo do campo + destaque em vermelho |
| Criação de inventário sem nome | `if (!data.name.trim()) return` — silencioso | Mensagem: "Como você quer chamar esse item?" |
| Criação de produto sem nome | `if (!data.name.trim()) return` — silencioso | Mensagem: "Qual é o nome do produto?" |
| Lead sem nome | `if (!data.name.trim()) return` — silencioso | Mensagem: "Como você quer identificar esse contato?" |
| Projeto selecionado mas dropdown vazio (sem projetos) | Dropdown vazio, form "funciona" mas não salva | Mensagem antes do form: "Crie um projeto primeiro para continuar." com link direto |

### Erros de autenticação (login)

| Situação | Mensagem atual | Avaliação |
|---|---|---|
| Email/senha errados | "E-mail ou senha incorretos." | Boa — manter |
| Email não confirmado | "Confirme seu e-mail antes de entrar." | Boa — adicionar link "reenviar confirmação" |
| Erro genérico | Exibe `msg` bruta do Supabase | Substituir por: "Não conseguimos entrar agora. Verifique sua conexão e tente de novo." |

### Erros de rede

| Situação | Mensagem sugerida |
|---|---|
| Falha ao salvar (qualquer form) | "Não conseguimos salvar. Confira sua conexão — seus dados não foram perdidos." |
| Timeout em listagem | "Demoramos para carregar. Tente recarregar a página." |
| Erro 500 genérico | "Algo deu errado do nosso lado. Já avisamos a equipe. Tente novamente em alguns minutos." |

---

## Onboarding Sugerido — Fluxo de Primeira Experiência

### Premissas
- Usuário acabou de confirmar o email e acessar pela primeira vez
- Rafael tem uma impressora rodando, não tem 10 minutos para tutorial
- Meta: chegar em "primeira vitória visível" em menos de 2 minutos

### Fluxo (3 telas + 1 estado de vitória)

**Tela 1 — Boas-vindas (1 tela, fullscreen)**
```
Logo Hayzer

"Olá! Vamos configurar seu negócio de impressão 3D."

[1 campo único]
Como você chama seu negócio (ou coloca seu nome mesmo):
[ campo: ex. "Rafael 3D" ou "Minha Impressora"          ]

[Continuar →]

Isso leva 2 minutos.
```

Regra: campo único, pré-populado com email do usuário para não assustar.

---

**Tela 2 — Setup mínimo (filamento principal)**
```
"Qual filamento você usa mais?"

[Tipo]     [Cor]        [Custo por kg]
[ PLA v ]  [ Branco   ] [ R$ _____   ]

Não sabe o custo agora? Use R$ 80 — ajuste depois.

[Pular por agora]    [Salvar e continuar →]
```

Regra: 3 campos. O sistema cria automaticamente: um Projeto com o nome da Tela 1, e um item de inventário "Filamento PLA Branco" com os dados fornecidos.

---

**Tela 3 — Primeira vitória: calcule sua primeira peça**
```
"Qual peça você mais vende?"

[Nome da peça]          [Tempo de impressão]
[ ex: Suporte celular ] [ ____ horas        ]

[Margem desejada]
[ 40% v ] — sugestão para maker iniciante

[Ver quanto cobrar →]
```

Ao clicar: o sistema mostra instantaneamente o preço sugerido com a calculadora interna. **Esse é o momento "uau"** — Rafael vê um número concreto em 30 segundos.

---

**Estado de vitória (não é tela separada — é banner no dashboard)**
```
"Seu preço sugerido para [nome da peça]: R$ [X]

Baseado em: filamento [Y] + [Z]h de impressão + [margem]% margem.

[Ver como cheguei nesse valor]    [Cadastrar mais produtos]"
```

Essa é a primeira vitória visível: um número real, que o Rafael pode usar agora.

---

**Tour opcional (não obrigatório)**
Após o onboarding, um banner discreto no dashboard:
```
"Quer conhecer o resto do sistema? [Tour de 2 min →]"
```
Pode dispensar para sempre com um X.

---

## Tooltips e Ajuda Contextual — Gaps Identificados

Os gaps abaixo aparecem quando o usuário fica mais de 10 segundos parado na tela sem ação.

| Tela | Campo/Situação | Tooltip sugerido (max 15 palavras) |
|---|---|---|
| `/products` — form | Campo "Taxa de Falha (%)" | "Quantas peças você joga fora? 10% é uma boa estimativa inicial." |
| `/products` — form | Campo "Custo de Energia (R$/h)" | "Impressora Ender: ~R$ 0,40/h. Bambu: ~R$ 0,60/h." |
| `/products` — form | Campo "Modo de Venda" | "Para começar, escolha 'Comprar agora'. Mude depois se quiser." |
| `/inventory` — form | Campo "SKU" | "Código interno opcional. Pode deixar em branco." |
| `/inventory` — form | Campo "Alerta Mínimo" | "Quantidade mínima antes de você ser avisado para repor." |
| `/orders` — form | Campo "Origem" | "De onde veio esse cliente? Ajuda a saber qual canal traz mais vendas." |
| `/crm` — kanban | Coluna "Negociando" | "Aqui ficam os clientes que pediram orçamento mas ainda não fecharam." |
| `/finance` — aba Break-Even | Qualquer campo vazio | "Preencha seus custos fixos mensais (aluguel, energia, plataformas) para saber sua meta de faturamento." |
| `/dashboard` | Seção "Performance Intelligence" vazia | "Essa seção fica viva quando você registrar seus primeiros pedidos." |

Regra de implementação: tooltip via `setTimeout` de 10s, dismiss por clique fora. Salvar dismiss em `localStorage` com chave `hayzer.tooltip.[id].dismissed`.

---

## Mobile Audit

### Metodologia
Avaliado com base no código: breakpoints `sm:`, `hidden sm:`, `sm:hidden`, layout de grid mobile vs desktop.

### Telas com suporte mobile declarado

| Tela | Mobile score | Observação |
|---|---|---|
| `/inventory` | 7/10 | Layout mobile existe (`sm:hidden` e layout alternativo). KPIs em grid 2 colunas. Filtros em `flex-wrap`. Problema: barra de filtros com 6+ controles empilhados causa scroll horizontal em telas pequenas. Botão "Entrada/Saída" some no mobile (hover-only no desktop card). |
| `/orders` | 7/10 | Cards mobile distintos do desktop (correto). Empty state mobile mostra "Nenhum pedido encontrado." sem ação. Filtro de projeto é dropdown separado do filtro de status — dois controles em sequência sem label contextual. |
| `/products` | 5/10 | Grid `grid-cols-2` no mobile para catálogo — ok. Mas o form de produto tem 12 campos em scroll vertical longo. Em tela pequena é 12 telas de scroll. Taxa de Falha e Custo de Energia em grid 2 colunas com inputs numéricos ficam apertados. |
| `/crm` | 4/10 | Kanban com `min-w-max` e `overflow-x-auto` força scroll horizontal em mobile. Colunas de 64 (w-64) passam da tela. Não há fallback mobile para o kanban. A aba Lista funciona melhor, mas o default é kanban. |
| `/dashboard` | 6/10 | Grid `grid-cols-2 lg:grid-cols-4` nas stat cards — funciona. Chart de receita provavelmente estoura em telas muito pequenas (não há `max-w` explícito no SVG). Seção "Quick Access" em grid 2x2 funciona bem no mobile. |
| `/finance` | Não auditado em código (componente separado) | Assumindo risco moderado baseado no padrão das outras telas. |
| `/settings` | Não auditado em código (componente separado) | Idem. |

### Problemas críticos mobile

**M-01 — Kanban CRM quebra no mobile**
`w-64 shrink-0` nas colunas + `min-w-max` no container = scroll horizontal forçado. Em celular de 375px, o usuário vê metade da primeira coluna. O default deveria ser vista lista no mobile.
Correção sugerida: `useEffect(() => { if (window.innerWidth < 640) setView('list') }, [])` no load.

**M-02 — Formulário de produto longo demais em telas pequenas**
Sem paginação ou etapas, o form rola por aproximadamente 800px em mobile. O botão "Criar Produto" fica invisível sem rolar até o fim.
Correção sugerida: dividir o form em 2 etapas: "Informações básicas" (nome, preço, margem) e "Configuração técnica" (gramas, horas, energia, falha) com botão "Avançado" opcional.

**M-03 — Botões de ação no inventário (Entrada/Saída) são hover-only no desktop e somem no mobile**
No `ItemCard`, os botões ficam em `opacity-0 group-hover:opacity-100`. Em mobile não há hover. O maker não consegue registrar entrada ou saída sem abrir o menu de contexto — que também usa hover.
Correção sugerida: tornar os botões sempre visíveis no mobile (condicional por breakpoint).

**M-04 — Filtros de inventário em linha causam overflow em telas pequenas**
A barra de filtros (`flex items-center gap-2 flex-wrap`) tem: select de projeto, botões de categoria, toggle de view, select de sort, campo de busca. Em mobile, `flex-wrap` quebra em múltiplas linhas mas o layout fica desorganizado visualmente.
Correção sugerida: colapsar filtros em mobile num botão "Filtrar" que abre um sheet/drawer.

---

## Linguagem — Glossário de Adequação Maker 3D

O sistema usa termos de SaaS genérico em vários pontos. Abaixo o mapeamento de substituição prioritária:

| Termo atual | Termo maker 3D | Onde mudar |
|---|---|---|
| "Lead" | "Contato" ou "Cliente em potencial" | CRM: labels, badges, header, form |
| "Pipeline" | "Funil de vendas" ou "Clientes em negociação" | CRM: aba label |
| "Receita (transações)" | "O que entrou no mês" | Dashboard: label do StatCard |
| "Despesas" | "O que você gastou" | Dashboard: label do StatCard |
| "Custo de Produção" | "Custo de impressão" | Products, Orders: seção CostPreview |
| "Item / Pedido" | "O que foi pedido" | Orders: label do campo |
| "Motivo" (movimentação) | "Por que entrou/saiu" | Inventory: label do campo |
| "Sistema Operacional" | "Painel Hayzer" ou "Início" | Dashboard: h2 header |
| "Performance Intelligence" | "Como você está indo" | Dashboard: section title |
| "Suporte / Overhead" | "Outros custos por peça" | Products: CostPreview label |
| "Alerta Mínimo (qtd)" | "Me avisa quando tiver menos de (qtd)" | Inventory: field label |
| "Acesso restrito — BVaz Hub v0.4" | Remover ou: "Hayzer · acesso beta" | Login: rodapé |

---

## Recomendações Priorizadas

### Esforço Baixo — Alto Impacto (fazer antes do launch 04/07)

1. **Corrigir rebranding no login** — trocar "BVaz Hub" e letra "B" por Hayzer. Esforço: 30 min. Impacto: confiança imediata.

2. **Empty state de Dashboard (sem projetos) com CTA primário** — mostrar checklist de 3 passos + botão "Criar meu primeiro projeto". Esforço: 2-3h. Impacto: activation rate, reduz churn D1.

3. **Validação com feedback visual nos formulários** — adicionar mensagem inline e destaque vermelho nos campos obrigatórios vazios. Atualmente todos falham silenciosamente. Esforço: 2-3h em todos os forms. Impacto: evita frustração no primeiro uso.

4. **Empty state de Inventory com CTA "Adicionar Filamento PLA"** — pré-selecionar categoria no modal. Esforço: 1h. Impacto: maker entende o primeiro passo.

5. **Empty state de CRM substituindo "Lead" por "Contato"** — mudar vocabulário no empty state e badge. Esforço: 1h. Impacto: identidade com o maker.

6. **Fix mobile do kanban CRM** — default para lista em mobile. Esforço: 30 min. Impacto: CRM usável no celular.

### Esforço Médio — Alto Impacto (primeiras 2 semanas pós-launch)

7. **Botões Entrada/Saída sempre visíveis no mobile** no `ItemCard`. Esforço: 1-2h. Impacto: inventário usável no chão de fábrica.

8. **Form de Produto dividido em etapas** — básico (obrigatório) + avançado (opcional). Esforço: 4-6h. Impacto: taxa de conclusão do primeiro produto aumenta.

9. **Empty state de Orders com dica "Crie um produto primeiro"** quando não há produtos cadastrados. Esforço: 1h. Impacto: guia o fluxo correto.

10. **Substituição de vocabulário técnico** conforme glossário acima. Esforço: 3-4h espalhados. Impacto: identidade e compreensão para o maker.

### Esforço Alto — Impacto Estratégico (Onda 3 pós-launch)

11. **Onboarding de 3 telas** com criação automática de projeto e filamento. Esforço: 2-3 dias. Impacto: activation rate, time to first value.

12. **Tooltips contextuais** nos campos técnicos do form de produto. Esforço: 1 dia. Impacto: conclusão do form sem abandono.

13. **Collapsible mobile filter drawer** no inventário. Esforço: 1 dia. Impacto: usabilidade mobile do módulo mais visual.

---

## Métricas de Referência para Acompanhar

| Métrica | Meta | Como medir |
|---|---|---|
| Activation rate (completa setup em <24h) | >60% | % de usuários que têm projeto + 1 produto em 24h |
| Time to first value | <3 minutos | Tempo até ver o primeiro preço calculado |
| D1 retention | >50% | Voltou no dia 1 após cadastro |
| D7 retention | >30% | Voltou na primeira semana |
| Churn motivo mais citado | Identificar top 3 | Campo obrigatório no cancelamento |
| Taxa de conclusão do form de produto | Baseline | Funil: abriu modal → clicou salvar |

---

## Notas para Squads

**Para Carla (Copy):** Os empty states e tooltips acima são rascunho funcional. Passando para você afinar o tom maker BR autêntico. Prioridade: FP-06 (vocabulário CRM) e FP-02 (empty state dashboard). Evitar "nossa plataforma" e "usuário" — o Rafael é o maker.

**Para Diego (Designer):** Os empty states precisam de ilustração leve (stroke, monocromático, não fofo demais). Sugestão de estilo: ícone Phosphor Duotone já instalado no projeto pode servir de base. Prioridade visual: Dashboard vazio e Inventory vazio.

**Para Felipe (Frontend):** FP-10 (validação silenciosa) é a correção mais simples com maior impacto. FP-03 (empty states com link para criação de projeto) resolve o beco sem saída mais crítico. M-01 (kanban mobile) é 30 minutos.

**Para Julia (QA):** Testar especialmente: (1) fluxo sem projetos em todas as telas, (2) formulários com campos obrigatórios vazios, (3) todas as telas em viewport 375px.
