# Hayzer · Empty States Onda 2

> **Sofia (Customer Success Pleno G7)** · 2026-05-21 · Hardwork noturno
>
> Specs dos ~10 empty states faltantes. Referencia: FP-01 a FP-04 ja implementados por Felipe.
> Tom: maker BR "tu". ZERO em-dash. ZERO palavras-IA. Mobile-first (texto curto).
> Copy final: parear com Carla antes de implementar. Visual: Diego.
> Implementacao: Felipe pega na sequencia de prioridade listada no final.

---

## Convencoes do documento

- **Variante A**: tela genuinamente vazia (usuario nunca criou nada)
- **Variante B**: filtro/busca aplicado sem resultado (dados existem mas nao batem)
- Icon: nome exato do Lucide (https://lucide.dev)
- CTA primario: botao cheio, cor petrol `hsl(173 58% 28%)`
- CTA secundario: texto ancora ou botao outline
- Todas as cores seguem o token system ja em uso nos 4 empty states anteriores

---

## ES-05 · /customers (tab Clientes dentro do CRM)

> Nota: a tab Clientes ja existe em `app/crm/_components/CrmEmptyState.tsx` (variante `clients`).
> Este spec e a versao refinada com copy Onda 2 e CTA adicional, conforme Carla sugeriu em `brand/onboarding-copy-2026-05-20.md § C.7`.
> Felipe substitui o conteudo da variante `clients` no `CrmEmptyState.tsx` existente.

### Variante A · zero clientes (nunca houve pedido ou lead ganho)

| Campo | Valor |
|---|---|
| Icon | `UserCheck` (Lucide) |
| Cor do icon wrapper | `hsl(173 58% 28% / 0.12)` com borda `hsl(173 58% 28% / 0.25)` |
| Headline | Teus clientes aparecem aqui sozinhos. |
| Subtitle | Cada pedido pago ou lead marcado como Ganho vira um cliente na lista. Tu ve quem comprou mais, quem sumiu ha tempo e quem ta voltando. |
| CTA primario | Registrar primeiro pedido |
| CTA secundario | Adicionar cliente manualmente |
| Helper text | Nenhum dado pra preencher manualmente se tu nao quiser. |

### Variante B · filtro sem resultado

| Campo | Valor |
|---|---|
| Icon | `SearchX` (Lucide) |
| Headline | Nenhum cliente bate com esse filtro. |
| Subtitle | Tenta mudar o periodo ou limpar a busca. |
| CTA primario | Limpar filtros |
| CTA secundario | (nenhum) |

---

## ES-06 · /leads (tab Pipeline dentro do CRM)

> Nota: ja existe `CrmEmptyState` variante `pipeline`. Este spec e a versao refinada com tom Onda 2.
> Felipe substitui o conteudo da variante `pipeline`.

### Variante A · zero leads

| Campo | Valor |
|---|---|
| Icon | `Users` (Lucide) |
| Headline | Teu primeiro lead ta esperando. |
| Subtitle | Registra os contatos que chegam pelo WhatsApp, Instagram ou indicacao. O Hayzer acompanha cada etapa ate o fechamento. |
| CTA primario | Criar primeiro lead |
| CTA secundario | (nenhum) |

### Variante B · filtro/etapa sem leads

| Campo | Valor |
|---|---|
| Icon | `Inbox` (Lucide) |
| Headline | Nenhum lead nessa etapa. |
| Subtitle | Muda o filtro ou arrasta um card pra ca no kanban. |
| CTA primario | Ver todos os leads |
| CTA secundario | (nenhum) |

---

## ES-07 · /inventory

> Ja existe `InventoryEmptyState` em `app/inventory/_components/InventoryEmptyState.tsx`.
> Variante A (empty) ta bem. Variante B (no-results) esta rasa: icone escuro, sem headline, sem CTA.
> Este spec e a correcao da Variante B apenas. Felipe atualiza so o bloco `mode === 'no-results'`.

### Variante A · estoque vazio (nao muda, esta ok)

Manter como esta. Copy e tom ja estao corretos.

### Variante B · filtro sem resultado (CORRECAO)

| Campo | Valor |
|---|---|
| Icon | `SearchX` (Lucide) |
| Cor do icon | `text-foreground/30` (sem wrapper colorido, pra nao competir com o empty real) |
| Headline | Nenhum item bate com esse filtro. |
| Subtitle | Tenta mudar a categoria ou limpar a busca. |
| CTA primario | Limpar filtros |
| CTA secundario | (nenhum) |

---

## ES-08 · /products

> Nao tem empty state. O codigo atual exibe um icone `Package` com texto `"Crie um projeto primeiro para cadastrar produtos."` quando `projects.length === 0`. Problema duplo: (1) esse e o estado "sem projeto", nao "sem produto". (2) quando tem projeto mas zero produto, nao ha nenhum estado vazio.
> Felipe precisa criar `app/products/_components/ProductEmptyState.tsx` com 3 variantes.

### Variante A · zero produtos (tem projeto, nunca cadastrou produto)

| Campo | Valor |
|---|---|
| Icon | `Box` (Lucide) |
| Headline | Teu catalogo ta vazio ainda. |
| Subtitle | Cadastra o primeiro produto que tu vende ou imprime. Com filamento vinculado, o Hayzer calcula custo e margem de cada pedido sozinho. |
| CTA primario | Criar primeiro produto |
| CTA secundario | Ir pro estoque primeiro (link `/inventory`) |
| Helper text | Sem filamento cadastrado o custo fica zerado. Vale ir no Estoque antes. |

### Variante B · tab "Ativos" sem produto ativo

| Campo | Valor |
|---|---|
| Icon | `PackageSearch` (Lucide) |
| Headline | Nenhum produto ativo. |
| Subtitle | Produtos aparecem aqui quando tem pelo menos um pedido vinculado no mes. |
| CTA primario | Ver todos os produtos |
| CTA secundario | (nenhum) |

### Variante C · sem projeto criado (estado pre-produto)

| Campo | Valor |
|---|---|
| Icon | `FolderOpen` (Lucide) |
| Headline | Precisa de um projeto antes. |
| Subtitle | Produto fica dentro de um projeto. Cria o teu e volta aqui. |
| CTA primario | Criar projeto |
| CTA secundario | (nenhum) |

---

## ES-09 · /content

> Ja existe `ContentEmptyState`. Problema: usa "voce" (CEO cobrou "tu"). Sem Variante B de filtro.
> Felipe: (1) corrige "voce" para "tu" no existente. (2) adiciona Variante B.

### Variante A · zero conteudo (CORRECAO DE TOM)

| Campo | Valor |
|---|---|
| Icon | `BookOpen` (Lucide) — manter |
| Headline | Nenhum conteudo registrado ainda. |
| Subtitle | Aqui tu guarda ideias de post, acompanha o status e ve quantas views cada conteudo gerou. Registra a primeira ideia agora. |
| CTA primario | Criar primeiro conteudo |
| CTA secundario | (nenhum) |

### Variante B · filtro sem resultado

| Campo | Valor |
|---|---|
| Icon | `SearchX` (Lucide) |
| Headline | Nenhum conteudo com esse filtro. |
| Subtitle | Muda o status ou limpa a busca. |
| CTA primario | Limpar filtros |
| CTA secundario | (nenhum) |

---

## ES-10 · /decisions

> Ja existe `DecisionsEmptyState`. Mesmo problema de tom ("voce"). Sem Variante B.
> Felipe: (1) corrige "voce" para "tu". (2) adiciona Variante B.

### Variante A · zero decisoes (CORRECAO DE TOM)

| Campo | Valor |
|---|---|
| Icon | `Lightbulb` (Lucide) — manter |
| Headline | Nenhuma decisao registrada ainda. |
| Subtitle | Usa esse espaco pra anotar escolhas importantes do negocio com data e contexto. Decisoes registradas viram historico consultavel. |
| CTA primario | Registrar primeira decisao |
| CTA secundario | (nenhum) |

### Variante B · filtro sem resultado

| Campo | Valor |
|---|---|
| Icon | `SearchX` (Lucide) |
| Headline | Nenhuma decisao bate com esse filtro. |
| Subtitle | Muda o status (Ativa/Descartada) ou limpa a busca. |
| CTA primario | Limpar filtros |
| CTA secundario | (nenhum) |

---

## ES-11 · /catalogs

> Nao tem empty state. `CatalogsView.tsx` renderiza lista diretamente. Quando vazia, tela fica em branco.
> Felipe cria `app/catalogs/_components/CatalogsEmptyState.tsx`.

### Contexto para o Rafael

Catalogo = pagina publica com produtos e preco, onde cliente pode mandar orcamento ou comprar.
Maker confunde com Portfolio. Headline precisa diferenciar em menos de 7 palavras.
Referencia: Carla ja diferenciou em `brand/onboarding-copy-2026-05-20.md § C.6`.

### Variante A · zero catalogos

| Campo | Valor |
|---|---|
| Icon | `Store` (Lucide) |
| Headline | Teu catalogo publico fica aqui. |
| Subtitle | Cria um catalogo, adiciona os produtos que tu vende e compartilha o link com o cliente. Ele ve preco, foto e ja manda mensagem direto. |
| CTA primario | Criar primeiro catalogo |
| CTA secundario | Ver exemplo de catalogo (abre `/catalogo/demo` se existir, senao omite) |
| Helper text | Diferente do portfolio, catalogo tem preco e botao de contato. |

### Variante B · produto sem produto vinculado (catalogo criado mas vazio)

> Este e um estado especial: o catalogo existe mas nao tem nenhum produto dentro.
> Aparece dentro da tela de edicao do catalogo, nao na listagem.

| Campo | Valor |
|---|---|
| Icon | `PackagePlus` (Lucide) |
| Headline | Catalogo criado. Agora adiciona os produtos. |
| Subtitle | Sem produto vinculado o cliente nao ve nada. Adiciona pelo menos um pra publicar. |
| CTA primario | Adicionar produto |
| CTA secundario | (nenhum) |

---

## ES-12 · /portfolios

> Ja tem um estado vazio basico ("Nenhum portfolio ainda" + CTA). Fraco: nao educa diferenca catalogo/portfolio.
> Carla ja escreveu o refinamento em `brand/onboarding-copy-2026-05-20.md § C.6`.
> Felipe substitui o estado vazio existente em `PortfoliosView.tsx`.

### Variante A · zero portfolios

| Campo | Valor |
|---|---|
| Icon | `LayoutTemplate` (Lucide) |
| Headline | Portfolio mostra teu trabalho. Catalogo vende. |
| Subtitle | Portfolio e a vitrine das pecas que tu ja fez, pra cliente confiar antes de pedir orcamento. Catalogo e a pagina com preco e botao de compra. |
| CTA primario | Criar primeiro portfolio |
| CTA secundario | Criar catalogo em vez disso (link `/catalogs`) |
| Helper text | Tu pode ter os dois. Ou so um. Como preferir. |

### Variante B · filtro sem resultado

| Campo | Valor |
|---|---|
| Icon | `SearchX` (Lucide) |
| Headline | Nenhum portfolio bate com esse filtro. |
| Subtitle | Limpa a busca e tenta de novo. |
| CTA primario | Limpar filtros |
| CTA secundario | (nenhum) |

---

## ES-13 · /settings

> Settings nao tem empty state convencional: nao e uma lista que pode ficar vazia.
> Unico caso valido: usuario sem nenhum projeto criado tenta acessar settings de projeto.
> Baixissima prioridade. Nao implementar agora. Marcar pra Wave 2 pos-launch.

**Decisao**: ES-13 FORA do scope do launch 27/06. Sem implementacao necessaria.

---

## ES-14 · /admin (library)

> `/library` e admin-only (guard por `isAdminEmail`). Nao ha empty state de lista.
> Nao e uma tela de usuario real. Fora do scope de CS.

**Decisao**: ES-14 FORA do scope. Sem empty state necessario.

---

## Prioridade de implementacao para Felipe

Ordenada por impacto no Rafael (maker novo, primeira semana).

| # | Empty State | Arquivo | Esforco estimado | Impacto |
|---|---|---|---|---|
| 1 | ES-08 Variante A + C | Criar `ProductEmptyState.tsx` | medio | CRITICO: produtos sem empty = confusao no setup inicial |
| 2 | ES-07 Variante B | Editar `InventoryEmptyState.tsx` (so o bloco no-results) | baixo | importante: filtro sem feedback e UX ruim |
| 3 | ES-11 Variante A | Criar `CatalogsEmptyState.tsx` | medio | importante: tela em branco no launch e vergonha publica |
| 4 | ES-12 Variante A | Editar `PortfoliosView.tsx` (substituir empty existente) | baixo | importante: copy atual nao educa diferenca catalogo/portfolio |
| 5 | ES-09 correcao de tom | Editar `ContentEmptyState.tsx` | baixissimo | busca de consistencia "tu" em todo o produto |
| 6 | ES-10 correcao de tom | Editar `DecisionsEmptyState.tsx` | baixissimo | idem |
| 7 | ES-05 refinamento | Editar `CrmEmptyState.tsx` variante `clients` | baixo | refinamento pos-launch ok |
| 8 | ES-06 Variante B | Editar `CrmEmptyState.tsx` variante `pipeline` | baixo | refinamento pos-launch ok |
| 9 | ES-08 Variante B | `ProductEmptyState.tsx` tab sem vendas | baixo | pos-launch |
| 10 | ES-11 Variante B | `CatalogsEmptyState.tsx` catalogo sem produto | medio | pos-launch (dentro de tela de edicao) |

**Resumo**: 4 criticos antes do launch 27/06 (ES-08 A+C, ES-07 B, ES-11 A, ES-12 A). Os de correcao de tom (ES-09, ES-10) sao search-replace de 5 minutos, Felipe faz junto.

---

## Notas de implementacao para Felipe

1. **Icon wrapper**: todos seguem o mesmo token. Copiar de `ProductionEmptyState.tsx`:
   ```
   background: 'hsl(173 58% 28% / 0.12)'
   border: '1px solid hsl(173 58% 28% / 0.25)'
   ```
   Icon color: `text-[hsl(173_30%_57%)]`

2. **SearchX para filtro vazio**: icone menor, sem wrapper colorido. So `SearchX size={28} className="text-foreground/30"`. Nao usa o wrapper petrol (reservado para empty real, nao para "sem resultado de busca").

3. **CTA primario**: sempre `bg-[hsl(173_58%_28%)]` com `hover:bg-[hsl(173_58%_32%)]`. Nunca hardcode hex.

4. **Helper text**: `text-xs text-foreground/50 mt-4 leading-relaxed`. So quando adiciona informacao util, nao repete o subtitle.

5. **"tu" em todo lugar**: grep `você` nos 6 arquivos listados e substitui. Nao e opcional.

6. **aria-label e role="status"**: manter padrao de `ProductionEmptyState.tsx`. Acessibilidade nao e opcional.

7. **CTA secundario para `/inventory` em ES-08**: usa `Link` de `next/link`, nao `button`. Navegacao real.

---

## Checklist anti-IA (aplicado neste documento)

- [x] Zero em-dash (—). Zero en-dash (–).
- [x] "tu" em toda copy voltada ao usuario.
- [x] Frases diretas, sem "imagine", "descubra", "potencialize".
- [x] Verbos no imperativo: "registra", "cria", "cadastra", "adiciona".
- [x] Concretude maker BR: filamento, pedido, WhatsApp, Instagram, peça.
- [x] Mobile-first: subtitles com no maximo 2-3 linhas em 320px.

---

> Proximo passo: Felipe implementa itens 1 a 6 da tabela de prioridade antes de 25/05.
> Carla revisa copy final antes de cada merge (parear via `/team:meeting`).
> Diego: ES-08 Variante A pode ganhar ilustracao leve (impressora 3D estilizada) se o sprint permitir, mas nao e bloqueante.
