# Hayzer · Copy V4 dos módulos (Carla, 21/05/2026)

> Entregue na operação noturna 20-21/05 (modo hardwork). 11 módulos restantes pra migração V4. Padrão de referência: `/orders` (em prod).
>
> **Restrições aplicadas em 100% deste doc**:
> - ZERO em-dash (—) / en-dash (–). Substituídos por vírgula, dois-pontos, ponto, parênteses ou ponto-médio.
> - ZERO ponto final em headline Fraunces (`title` + `titleItalicSuffix`).
> - Tom maker BR: **tu** (não "você"), verbo 3ª pessoa ("tu sabe", "tu fez", "tu manda").
> - Linha editorial: parceiro + educador + provocador-leve.
> - Sem palavras-IA: aproveitar, robustez, elevamos, elegância, potencializar, plataforma, solução, completo.

---

## 📐 PADRÃO V4 (extraído de /orders)

```
<ModuleShell
  eyebrow="MES · SEM NN · X CONTEXTO · Y CONTEXTO"
  title="Nome curto"
  titleItalicSuffix="adjetivo/contexto curto"
  livePhrase={<frase humanizada condicional>}
  primaryAction={{ label: 'Novo X', icon: Plus }}
  secondaryAction={{ label: 'Ação secundária', icon: ... }}
  heroKpi={{ label: 'METRICA HERO', value: 'R$ ...', description: 'detalhe' }}
  satelliteKpis={[ ... ]}
/>
```

**Regras do eyebrow**:
- ALL CAPS, separador `·` (ponto médio, alt+0183), max 4 segmentos
- Inclui mês corrente + 1-3 KPIs curtos
- Nunca usar dígito sozinho (sempre com unidade: "4 ABERTOS", "12 ENTREGUES NO MES")

**Regras do title + suffix**:
- `title`: substantivo único, máx 12 chars (Fraunces 600 lê grande, cada char custa)
- `titleItalicSuffix`: 1-3 palavras italic, contextualiza sem ponto final
- NUNCA "completo", "total", "todos" no suffix (cara de admin)

**Regras do livePhrase**:
- Condicional ao estado dos dados (vazio / atenção / ritmo / pico)
- Vocabulário maker BR: filamento, fila, recompra, sumiu, atrasou, faltou
- Frase curta. Vírgula vence ponto. Verbo no presente.
- Quando vazio, sempre frase de convite (não vazio frio)

---

## 1. `/customers` (Clientes)

**Contexto**: módulo derivado do CRM + Orders. Lista clientes que compraram (status `paid`/`delivered`) ou viraram cliente (`leads.status === 'won'`). KPI principal: LTV / recompra / clientes que sumiram.

**Status**: JÁ EXISTE e JÁ ESTÁ MIGRADO V4 (feature/customers-v4, 2026-05-20). Carla revisa eyebrow + livePhrase pra alinhar com tom do `/orders`. Página atual já está com "tu" em 100% das strings (zero ocorrência de "você"). Refinar só headline e descriptions.

### Eyebrow
```
MAIO · 28 CLIENTES · 4 SUMIRAM HA 30D · LTV MEDIO R$ 340
```
Variações condicionais:
- Zero clientes: `MAIO · NENHUM CLIENTE AINDA · COMECE PELO PRIMEIRO PEDIDO`
- Sem sumidos: `MAIO · 28 CLIENTES · TODOS ATIVOS · LTV MEDIO R$ 340`

### Title hero
```
title="Clientes"
titleItalicSuffix="que voltam"
```

### LivePhrase (4 estados)

**Vazio** (`clientes.length === 0`):
> Ninguém comprou ainda. Tua primeira recompra começa no primeiro pedido pago.

**Ritmo OK** (zero sumidos, fluxo normal):
> 28 clientes ativos, 6 voltaram esse mês. Recompra de maker é ouro.

**Atenção** (1+ sumido há >30d):
> 4 clientes sumiram faz mais de 30 dias. Carlos, Bruna, Marcio, Paula estão esperando.

**Pico** (boom de recompra):
> 12 voltaram essa semana. Tá no ritmo certo, não solta.

### Tom esperado da página
- Card de cliente: nome em destaque, último pedido em itálico-soft, badge "voltou X vezes" em petrol, badge "sumiu Yd" em ember
- Sem "Lifetime Value" cru. Usar "Quanto já trouxe" ou "Total gasto contigo"
- Botão "Avisar que tá com saudade" (CTA recompra explícito, maker BR)
- Empty state: foto/SVG cliente conversando WhatsApp + frase "Aqui vão aparecer quem comprou contigo, com data do último contato e quanto cada um já trouxe."

### KPIs
```
heroKpi: { label: 'CLIENTES ATIVOS', value: '28', description: '6 voltaram esse mês.' }
sat1:    { label: 'TOTAL GASTO COM TIGO', value: 'R$ 9.520', description: 'desde o primeiro pedido.' }
sat2:    { label: 'SUMIRAM HA +30D', value: '4 clientes', alertText: 'recompra esperando' tone: 'ember' }
```

---

## 2. `/leads` (Leads · CRM tab pipeline standalone)

**Contexto**: hoje vive dentro de `/crm` como tab "pipeline". Se virar rota própria, copy idêntica à tab. Mantida aqui como referência caso CEO decida quebrar em duas rotas. CEO mencionou 18/05 que talvez separe.

### Eyebrow
```
MAIO · 12 NO PIPELINE · 3 QUENTES · 2 GANHOS NA SEMANA
```

### Title hero
```
title="Leads"
titleItalicSuffix="no funil"
```

### LivePhrase

**Vazio**:
> Nenhum lead ainda. Registra o primeiro contato que chegou.

**Ritmo OK**:
> 12 no pipeline, 3 esperando proposta. Resto tá fluindo.

**Atenção** (lead parado há +7d):
> 5 leads parados faz mais de uma semana. Carlos, Bruna esperam retorno.

**Pico**:
> 8 chegaram essa semana, 2 já fecharam. Tá rolando.

### Tom esperado
- Cada coluna do kanban tem cor semântica (novo=fog, qualificado=petrol, proposta=ember, ganho=petrol-forte, perdido=cinza)
- Drag-drop com feedback tátil
- Card lead: nome + origem (badge WhatsApp/Insta/indicação) + última atualização ("3d sem mexer")

### KPIs
```
heroKpi: { label: 'NO PIPELINE', value: '12 leads', description: 'R$ 8.420 potencial.' }
sat1:    { label: 'TAXA DE CONVERSAO', value: '34%', description: 'últimos 30 dias.' }
sat2:    { label: 'PARADOS HA +7D', value: '5 leads', alertText: 'precisando follow-up', tone: 'ember' }
```

---

## 3. `/inventory` (Estoque)

**Já tem hero V4 implementado** (`app/inventory/page.tsx:335`). Reviso aqui pra alinhar tom.

### Eyebrow atual (mantido)
```
MAIO · 14 ITENS · ESTOQUE OK
```
Quando há alerta:
```
MAIO · 14 ITENS · 3 ALERTAS
```

### Title hero
```
title="Estoque"
titleItalicSuffix="em tempo real"
```
(já está implementado, manter)

### LivePhrase

**Vazio** (`scopedItems.length === 0`):
> Estoque tá vazio. Cadastra teu primeiro filamento, o resto sai sozinho.

**Ritmo OK**:
> 14 itens cadastrados, R$ 2.340 parado. Maior fatia: PLA preto.

**Atenção** (baixo estoque):
> 3 itens chegando no fim. PLA branco com 80g, PETG laranja zerou.

**Pico** (boom de compra):
> Estoque cheio. R$ 4.120 em filamento, dá pra rodar 2 meses sem comprar.

### Tom esperado
- Já está afinado, ver `InventoryEmptyState.tsx` (já corrigido pra "tu")
- Movimentação (entrada/saída) usar verbos diretos: "Registrar entrada", "Dar baixa" (não "Lançar movimentação")

### KPIs
```
heroKpi: { label: 'VALOR PARADO', value: 'R$ 2.340', description: '14 itens, maior fatia PLA preto.' }
sat1:    { label: 'TOTAL DE ITENS', value: '14', description: 'em 4 categorias.' }
sat2:    { label: 'ESTOQUE BAIXO', value: '3 itens', alertText: 'reposição esperando', tone: 'ember' }
```

---

## 4. `/products` (Produtos)

**Já tem hero V4 implementado** (`app/products/page.tsx:219`). Reviso e refino.

### Eyebrow atual (mantido)
```
MAIO · 12 PRODUTOS · 8 COM VENDAS
```

### Title hero
```
title="Produtos"
titleItalicSuffix="no catalogo"
```
(já está, manter)

### LivePhrase

**Vazio** (`products.length === 0`):
> Catálogo tá vazio. Cadastra a primeira peça que tu vende.

**Ritmo OK**:
> 12 produtos, 8 vendendo. Suporte de celular puxa o caixa.

**Atenção** (margem baixa):
> 3 produtos com margem abaixo de 30%. Hora de revisar preço ou custo.

**Pico**:
> Margem média 58% essa semana. Acima do que dá pra cobrar em marketplace.

### Tom esperado
- Já bem afinado em empty state (já corrigido pra "tu")
- Sugestão Carla pro card: badge de margem com cor semântica (verde >50%, amber 30-50%, vermelho <30%)
- "Preço sugerido por canal" vira "Quanto cobrar em cada lugar" (label dropdown)

### KPIs (já implementados, manter)
```
heroKpi: { label: 'MELHOR MARGEM', value: '67%', description: 'Suporte celular (24 pedidos).' }
sat1:    { label: 'TOTAL PRODUTOS', value: '12', description: '4 projetos.' }
sat2:    { label: 'MAIS VENDIDO', value: 'Suporte cel', alertText: '24 pedidos', tone: 'petrol' }
```

---

## 5. `/production` (Operação · fila de impressão)

**Já tem hero V4 implementado** (`app/production/page.tsx:386`). Refino livePhrase.

### Eyebrow atual (mantido)
```
MAIO · 2 IMPRIMINDO · 5 NA FILA
```

### Title hero
```
title="Operacao"
titleItalicSuffix="ao vivo"
```
(já está, manter)

### LivePhrase atual:
> 2 impressoes ativas, 12.5h estimadas.

**Refinamento Carla** (4 estados):

**Vazio** (sem fila):
> Fila tá vazia. Próxima impressão entra quando tu marca pedido como produzir.

**Ritmo OK**:
> 2 imprimindo agora, 5 na fila. 12h até a próxima trocar.

**Atenção** (impressão atrasada / fila grande):
> 8 peças na fila, 2 atrasaram. PLA branco terminando, repõe antes que pare.

**Pico**:
> Galpão a todo vapor. 4 impressoras rodando, 18h de fila, R$ 1.840 pra entregar.

### Tom esperado
- Já tem `ProductionEmptyState` corrigido pra "tu"
- Status: "Em produção · agora" / "Próxima · em Xh" / "Finalizada · há Y min"
- Botões de ação: "Marcar pronta", "Pausar", "Refazer" (verbos diretos)

### KPIs
```
heroKpi: { label: 'IMPRESSOES ATIVAS', value: '2', description: '12h até a próxima trocar.' }
sat1:    { label: 'NA FILA', value: '5 peças', description: 'R$ 740 esperando.' }
sat2:    { label: 'TEMPO RESTANTE', value: '18h', alertText: 'duas impressoras livres em 4h', tone: 'petrol' }
```

---

## 6. `/finance` (Finanças)

**Já tem hero V4 implementado** (`components/FinanceView`). Refino livePhrase + tom dos sub-componentes.

### Eyebrow
```
MAIO · 23 LANCAMENTOS · R$ 4.820 LIQUIDO · MARGEM 42%
```

### Title hero
```
title="Financas"
titleItalicSuffix="esse mês"
```

### LivePhrase

**Vazio** (sem transação):
> Nenhuma transação esse mês. Cadastra pedido pago ou despesa que aparece aqui.

**Ritmo OK**:
> R$ 4.820 líquido, margem 42%. Tá batendo a meta de R$ 3.000.

**Atenção** (margem baixa <15%):
> Margem caiu pra 12%. Custo fixo comeu o lucro, hora de revisar.

**Pico**:
> R$ 7.340 líquido no mês, margem 51%. Melhor mês de 2026.

### Tom esperado
- Já tem `FinanceBreakEven` corrigido pra "tu"
- Card "Quanto tu quer levar pra casa" (já implementado) está perfeito
- Lançamentos: cor semântica (receita=petrol, despesa=ember), valor à direita em mono
- Custo fixo: lista compacta com toggle inline-edit

### KPIs
```
heroKpi: { label: 'LUCRO LIQUIDO MES', value: 'R$ 4.820', description: '23 lançamentos.', delta: '+12%' }
sat1:    { label: 'RECEITA', value: 'R$ 11.480', tone: 'petrol' }
sat2:    { label: 'DESPESAS', value: 'R$ 6.660' }
sat3:    { label: 'MARGEM', value: '42%', alertText: 'meta 35%', tone: 'petrol' }
```

---

## 7. `/content` (Conteúdo · marketing)

**Ainda não migrado pra V4**. Página atual é shell antigo com `[#7c3aed]` (roxo banido).

### Eyebrow
```
MAIO · 8 IDEIAS · 3 GRAVADOS · 12 POSTADOS
```

### Title hero
```
title="Conteudo"
titleItalicSuffix="que vende"
```

### LivePhrase

**Vazio** (`content.length === 0`):
> Nenhum post registrado. Anota a próxima ideia antes que ela suma na conversa.

**Ritmo OK**:
> 12 posts no ar, 8 ideias na fila. Reels do filamento puxou 2.400 views.

**Atenção** (muitas ideias paradas):
> 8 ideias paradas faz +14 dias. Tira do papel ou descarta, não deixa empilhar.

**Pico**:
> 4 posts viralizaram essa semana. 18 leads vieram de Instagram, 6 viraram pedido.

### Tom esperado
- Card de conteúdo: status badge (Ideia/Gravado/Postado) com cor + plataforma (Insta/YT/TikTok) + métricas (views/leads/vendas)
- Botão "Marcar Gravado" / "Marcar Postado" (verbo direto, não "Avançar status")
- Empty state já refinado em `ContentEmptyState.tsx` (corrigido pra "tu")
- "Ideia" em vez de "Conteúdo planejado" (palavra dura, simples, maker)

### KPIs
```
heroKpi: { label: 'POSTS NO AR', value: '12', description: '2.400 views totais.' }
sat1:    { label: 'IDEIAS NA FILA', value: '8', alertText: '8 paradas +14d', tone: 'ember' }
sat2:    { label: 'LEADS GERADOS', value: '18', description: '6 viraram pedido.' }
```

---

## 8. `/decisions` (Decisões · diário)

**Ainda não migrado pra V4**. Página atual usa `[#7c3aed]` (banido).

### Eyebrow
```
MAIO · 14 DECISOES · 11 ATIVAS · 3 DESCARTADAS
```

### Title hero
```
title="Decisões"
titleItalicSuffix="do mês"
```
(headline carrega acento; Fraunces renderiza limpo)

### LivePhrase

**Vazio**:
> Nenhuma decisão registrada. Anota a próxima escolha do negócio, fica pra história.

**Ritmo OK**:
> 11 decisões ativas esse mês. Reposicionamento de preço + parar PETG laranja foram as grandes.

**Atenção** (muitas descartadas):
> 6 descartadas em 30 dias. Vale revisitar o que não deu certo antes de tentar de novo.

**Pico**:
> Mês de muita escolha. 14 decisões registradas, 11 ainda em vigor.

### Tom esperado
- Card decisão: texto principal grande (substância > metadado), impacto em badge ("Alto"/"Médio"/"Baixo"), data em fog-50/40
- Action "Descartar" em vez de "Marcar como descartada"
- Empty state precisa criar: foto/SVG de caderno + frase "Aqui tu guarda as escolhas que mudaram teu negócio. Preço, fornecedor, produto novo, parada de produção. Histórico vira aprendizado."

### KPIs
```
heroKpi: { label: 'DECISOES ATIVAS', value: '11', description: 'desse mês.' }
sat1:    { label: 'TOTAL HISTORICO', value: '47', description: 'desde janeiro.' }
sat2:    { label: 'DESCARTADAS', value: '3', tone: 'neutral' }
```

---

## 9. `/catalogs` (Catálogos públicos)

**Ainda não migrado pra V4**. Server Component que delega pra `CatalogsView`.

### Eyebrow
```
MAIO · 3 CATALOGOS · 47 PEDIDOS VIA LINK · TICKET MEDIO R$ 142
```

### Title hero
```
title="Catalogos"
titleItalicSuffix="pra compartilhar"
```

### LivePhrase

**Vazio** (`catalogs.length === 0`):
> Sem catálogo público ainda. Cria o primeiro, manda no WhatsApp, cliente escolhe sozinho.

**Ritmo OK**:
> 3 catálogos no ar, 47 pedidos chegaram pelo link. PLA preto é o mais clicado.

**Atenção** (link sem tráfego):
> Catálogo "Loja 3D" sem visita faz 12 dias. Bora repostar no story.

**Pico**:
> Link da bio puxou 124 visitas essa semana, 18 viraram orçamento.

### Tom esperado
- Card de catálogo: thumb da capa + slug clicável + métrica de tráfego ("124 visitas, 18 pedidos")
- CTA "Compartilhar link" copy `Copiar pro WhatsApp` (direto, não "Copiar para área de transferência")
- Empty state: foto/SVG smartphone com link aberto + frase "Aqui tu monta página pública dos teus produtos. Cliente abre no celular, escolhe e manda pedido. Tu recebe direto no WhatsApp."

### KPIs
```
heroKpi: { label: 'PEDIDOS VIA LINK', value: '47', description: 'esse mês, ticket R$ 142.' }
sat1:    { label: 'CATALOGOS NO AR', value: '3', description: 'todos públicos.' }
sat2:    { label: 'VISITAS NA SEMANA', value: '124', tone: 'petrol' }
```

---

## 10. `/portfolios` (Portfólios públicos)

**Ainda não migrado pra V4**. Server Component que delega pra `PortfoliosView`.

### Eyebrow
```
MAIO · 1 PORTFOLIO · 89 VISITAS NA SEMANA · 4 CONTATOS
```

### Title hero
```
title="Portfolios"
titleItalicSuffix="que prospectam"
```

### LivePhrase

**Vazio**:
> Sem portfólio público ainda. Mostra teu trampo, cliente novo te encontra.

**Ritmo OK**:
> 1 portfólio no ar, 89 visitas essa semana, 4 viraram contato.

**Atenção**:
> Portfólio sem atualização faz 60 dias. Adiciona projeto novo, mantém vivo.

**Pico**:
> 240 visitas no mês, 11 contatos. Indicação do Insta puxando direto.

### Tom esperado
- Card portfolio: avatar + bio curta + métrica ("89 visitas / 4 contatos")
- Botão "Editar portfolio" (verbo direto)
- Empty state: foto/SVG impressora com peça pronta + frase "Aqui tu monta tua página de apresentação. Quem chega pelo Insta, indicação ou Google vê teu trabalho antes de pedir orçamento."

### KPIs
```
heroKpi: { label: 'VISITAS NA SEMANA', value: '89', description: '4 viraram contato.' }
sat1:    { label: 'PORTFOLIOS NO AR', value: '1', description: 'público.' }
sat2:    { label: 'CONTATOS DO MES', value: '4', tone: 'petrol' }
```

---

## 11. `/settings` (Configurações)

**Já tem `SettingsShell` V4** mas conteúdo das tabs (`GeneralTab`, `ProductionTab`, etc) precisa polir.

### Eyebrow
```
3 PROJETOS · 47 PEDIDOS · 23 LANCAMENTOS
```
(sem mês — settings é estado da conta, não período)

### Title hero
```
title="Configuracoes"
titleItalicSuffix="da tua conta"
```

### LivePhrase

**Estado padrão** (tem dados):
> Ajusta moeda, módulos ativos, categorias e tipos. Tudo que tu muda aqui vale pra todo projeto.

**Vazio** (conta nova):
> Conta fresquinha. Define moeda e ativa os módulos que tu vai usar antes de cadastrar produto.

### Tom esperado
- Cada `SectionCard` tem subtítulo curto explicativo (já tem em GeneralTab e ProductionTab, refinados pra "tu")
- Botão "Salvar" no fim, não no header
- Tabs: Geral / Finanças / CRM / Estoque / Produção / Catálogo / Conta
- Conta tab: avatar + email + plano + botão "Sair" discreto

### KPIs (sem KPIs de negócio — substitui por contadores de contexto)
```
heroKpi: { label: 'PROJETOS', value: '3', description: 'todos ativos.' }
sat1:    { label: 'PEDIDOS', value: '47', description: 'histórico total.' }
sat2:    { label: 'LANCAMENTOS', value: '23', description: 'só esse mês.' }
```

---

## 🎯 PRIORIZAÇÃO DE EXECUÇÃO (Felipe)

| Ordem | Módulo | Esforço | Bloqueio |
|---|---|---|---|
| 1 | `/finance` | baixo (já migrado, só polir livePhrase) | nenhum |
| 2 | `/inventory` | baixo (já migrado, só polir livePhrase) | nenhum |
| 3 | `/products` | baixo (já migrado, só polir livePhrase) | nenhum |
| 4 | `/production` | baixo (já migrado, só polir livePhrase) | nenhum |
| 5 | `/content` | médio (migrar pra V4 + remover roxo banido) | nenhum |
| 6 | `/decisions` | médio (migrar pra V4 + remover roxo banido) | nenhum |
| 7 | `/catalogs` | médio (refactor `CatalogsView` pra V4) | nenhum |
| 8 | `/portfolios` | médio (refactor `PortfoliosView` pra V4) | nenhum |
| 9 | `/settings` | médio (já tem SettingsShell, só polir tabs) | nenhum |
| 10 | `/customers` | BAIXO (já existe + V4, só refinar copy) | nenhum |
| 11 | `/leads` (opcional) | ALTO (decidir se separa do CRM ou mantém como tab) | decisão CEO |

---

## 📋 CHECKLIST anti-IA (rodar antes de mergear)

- [ ] `grep -rn '—\|–' app/ components/` retorna ZERO (em UI strings)
- [ ] `grep -rn '\bvocê\b' app/ components/` só retorna `termos/`, `privacidade/`, placeholders email
- [ ] Nenhum H1/H2 Fraunces termina em `.` (regex: `display-h\d.*\.<\/h`)
- [ ] Nenhuma palavra-IA da lista negra ("aproveitar", "robustez", "elevamos", "elegância", "potencializar", "plataforma", "solução", "completo")
- [ ] Tom maker BR: verbo presente, frase curta, vocabulário concreto (filamento/fila/recompra)
- [ ] LivePhrase tem variação por estado (não frase única estática)

---

## 🔗 Relacionados

- Padrão referência: `app/orders/page.tsx` (em prod)
- Brief de marca: `brand/BRIEF.md`
- Visual system: `brand/visual-system-v2.md`
- ModuleShell doc: `components/dashboard/v4/ModuleShell.md`
- Empty states já feitos: `app/{inventory,production,content,crm}/_components/*EmptyState.tsx`
- Memória CEO ZERO em-dash: `memory/feedback_zero_em_dash.md`
- Memória headlines sem ponto: `memory/feedback_headlines_editorial_sem_ponto_final.md`

---

**Carla · Copywriter G7 · 21/05/2026 (madrugada hardwork)**
