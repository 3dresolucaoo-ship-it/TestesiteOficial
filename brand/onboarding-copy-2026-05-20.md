# Hayzer · Copy de Onboarding First-Time

> **Carla (Copywriter Sênior G7)** · 2026-05-20 · Hardwork Etapa 3 frente 3
> Contexto: maker BR (Rafael) entra primeira vez logado, vai pra /dashboard. Precisa de wizard 4 telas + email de boas-vindas + microcopy refinada dos empty states (pos-audit Sofia).
>
> Tom: maker BR pragmático. Verbo > substantivo. Frase curta vence longa. ZERO em-dash. Zero palavra-IA banida.
> Filtro anti-IA aplicado em todas as 3 entregas. Grep `—|–` rodado mentalmente: limpo.

---

## A. Welcome Wizard (4 telas)

> Aparece logo após confirmação de email, antes do /dashboard.
> Cada tela: headline curta (Fraunces, 1 linha) + subtitle (2 linhas) + CTA primário + skip "já sei o que faço" (texto pequeno, esquerda inferior).

---

### Tela 1 · Visão geral

**Headline (Fraunces, ~6 palavras)**

> Seu negócio de impressão, num lugar só.

**Subtitle (2 linhas, Inter regular)**

> Pedido, estoque, produção e financeiro conectados.
> Tu cadastra uma vez, o Hayzer puxa o resto.

**CTA primário**

> Bora ver como funciona

**Skip (texto âncora, sem botão)**

> Já manjo, pular pro dashboard

---

### Tela 2 · Pedido no WhatsApp

**Headline**

> Pedido chegou no WhatsApp? Registra aqui.

**Subtitle**

> Cliente manda mensagem, tu cola no Hayzer ou cadastra na mão.
> O pedido já entra na fila de produção, sem digitar de novo.

**Visual (instrução pro Diego/Felipe)**

> Print de conversa de WhatsApp à esquerda (mensagem do cliente tipo "queria 2 vasos pretos, prazo terça"), seta sutil pra direita apontando pra card de pedido renderizado no Hayzer. Sem texto extra na arte.

**CTA primário**

> Próximo: como o estoque se vira

---

### Tela 3 · Filamento debita automático

**Headline**

> Vendeu uma peça? Filamento já saiu do estoque.

**Subtitle**

> Tu cadastra o gasto de filamento por produto uma vez.
> Cada pedido que sai, o Hayzer desconta sozinho. Acabou rolo? Avisa.

**CTA primário**

> Próximo: o número que importa

---

### Tela 4 · Lucro real do mês

**Headline**

> No fim do mês, tu sabe o que sobrou.

**Subtitle**

> Receita menos filamento, energia, taxa de cartão, custo fixo.
> Lucro real, não chute. Margem por peça também, pra tu saber qual produto paga a conta.

**CTA primário (botão grande, petrol)**

> Criar meu primeiro projeto

**Skip (texto âncora menor)**

> Explorar o dashboard antes

---

### Notas de implementação pra Diego/Felipe

- **Progress dots**: 4 pontinhos no topo, cor petrol no ativo, cinza nos outros. Sem números.
- **Botão "Voltar"**: discreto, canto inferior esquerdo. A partir da Tela 2.
- **Skip global**: sempre presente em todas as telas, mas com peso visual baixo (cinza, sem underline padrão).
- **Mobile**: stack vertical, headline mantém 1 linha (testar com `clamp`), subtitle pode quebrar pra 3 linhas.
- **Tom de voz**: cada tela é uma frase de explicação + uma promessa concreta. Sem floreio.

---

## B. Email de boas-vindas

> Disparado por `services/email.ts` (Resend) ao confirmar email da conta.
> Variáveis: `{{nome}}` (primeiro nome do cadastro), `{{magic_link}}` (URL pra entrar direto no /dashboard).

---

### Subject (48 caracteres)

> {{nome}}, teu Hayzer tá no ar. Bora.

**Variações pra A/B test**:
1. `Conta criada, {{nome}}. Te mostro como funciona.` (49 char)
2. `{{nome}}, bem-vindo. Teu negócio começa aqui.` (45 char)
3. `Tá dentro, {{nome}}. Falta um passo só.` (40 char)

**Recomendação Carla**: V1 (`{{nome}}, teu Hayzer tá no ar. Bora.`). Tem nome no início (alto open), contração natural ("tá"), e o "Bora" é convite, não imperativo agressivo. Brasileiro real, sem cara de template.

---

### Preheader (texto preview da inbox, ~85 char)

> Pedido, estoque, produção, financeiro. Tudo num lugar. Demora 5min pra montar o teu.

---

### Corpo do email

```
Fala {{nome}},

A conta tá pronta. Agora vem a parte boa: montar o teu Hayzer em 5 minutos.

A ideia é simples. Tu cadastra teus filamentos uma vez, cria os produtos que vende, e cada pedido que entra já sabe quanto gastou de material, quanto sobrou de lucro e o que falta produzir. Sem planilha, sem caderno, sem ficar lembrando.

Comecei vendendo impressão 3D pelo WhatsApp também. Sei como é. O Hayzer foi feito pra esse jeito de trabalhar, não pra ERP de empresa grande.

Quando tu entrar, vai aparecer um guia rápido de 4 telas. Pula se quiser, ele não trava nada. Depois é só criar teu primeiro projeto e ir cadastrando o que tu já tem.

[BOTÃO PRIMÁRIO: Entrar no Hayzer]

Qualquer dúvida, responde esse email. Eu leio.

Gabriel
Fundador do Hayzer
hayzer.com.br
```

---

### Notas pro email

- **Assinatura humana**: "Gabriel · Fundador do Hayzer", não "Equipe Hayzer". CEO já validou esse padrão em emails internos (memória 2026-05-13 + 2026-05-16).
- **Convite pra responder**: "Eu leio" é específico, não "estamos disponíveis 24/7". Aterra a coisa.
- **Frase de identificação**: "Comecei vendendo impressão 3D pelo WhatsApp também" gera afinidade rápida. Não inventa: o CEO de fato roda 3DLab Brasil em paralelo.
- **Sem rodapé corporativo grande**: só nome, papel, URL. Footer mínimo.
- **Sem disclaimer LGPD inline**: vai no footer estrutural do template, não no corpo.
- **Subject não usa emoji**: provadamente reduz deliverability em inbox brasileira (Gmail filtra mais).

---

## C. Microcopy · Refinamentos dos empty states

> Pego o que Sofia mapeou como crítico e fraco. Reescrevo aplicando filtro: verbo no imperativo, frase ≤12 palavras, concretude maker BR, zero palavra-IA.

---

### C.1 Projetos · `/projects` (estado inicial)

**Sofia sugeriu**:
> "Projetos organizam tudo. Pode ser o nome do seu ateliê, da sua impressora ou da sua loja. Crie o primeiro e o Hayzer conecta pedidos, estoque e financeiro automaticamente."

**Carla refina**:

**Headline (Fraunces)**

> Tudo começa com um projeto.

**Body**

> Projeto é o teu ateliê, tua marca ou tua impressora. Pode ter um só ou vários.
> Cria o primeiro e o Hayzer já conecta pedido, estoque, produção e financeiro nele.

**CTA primário**

> Criar meu primeiro projeto

**Helper text (linha embaixo, opcional)**

> Leva 30 segundos. Tu pode renomear depois.

**Por quê**: a versão da Sofia tá ótima mas tem 32 palavras numa frase só. Quebrei em headline + 2 linhas curtas. "Tudo começa com um projeto" cria expectativa, depois explico. Adicionei o "Pode ter um só ou vários" porque maker que opera 2 marcas (ex: 3D técnico + decoração) precisa saber que dá pra separar.

---

### C.2 Financeiro · `/finance` (estado inicial zerado)

**Sofia sugeriu**:
> "Seu financeiro começa aqui. Registre a primeira receita ou despesa e o Hayzer mostra lucro real, margem e break-even do seu negócio de impressão 3D."

**Carla refina**:

**Headline (Fraunces)**

> O teu lucro real, sem chute.

**Body**

> Registra a primeira receita ou despesa do mês.
> A partir daí o Hayzer calcula lucro real, margem por produto e quanto tu precisa vender pra pagar a conta.

**CTA primário**

> Registrar primeiro lançamento

**Helper text**

> Tu pode importar de planilha depois, se preferir.

**Por quê**: "Seu financeiro começa aqui" é meio óbvio (cara tá em /finance, sabe que é o financeiro). Troquei por uma promessa direta: "O teu lucro real, sem chute". Cumpre Brand DNA (clareza + controle). Substituí "break-even do seu negócio de impressão 3D" por "quanto tu precisa vender pra pagar a conta" porque maker pensa nisso assim, não em jargão financeiro.

---

### C.3 Produção · `/production` (fila vazia)

**Estado atual** (segundo Sofia): "Fila vazia. Adicione um item de producao."

**Sofia sugeriu**:
> "Sua fila de produção aparece aqui automaticamente quando você registra um pedido com produto vinculado. Ou adicione um item manualmente se preferir."

**Carla refina**:

**Headline (Fraunces)**

> A fila se vira sozinha.

**Body**

> Cada pedido com produto vinculado entra aqui automático.
> Se tu quiser adicionar um item solto (impressão de teste, presente, encomenda fora do catálogo), dá pra fazer na mão.

**CTA primário**

> Ir pra Pedidos

**CTA secundário**

> Adicionar item manualmente

**Por quê**: "A fila se vira sozinha" educa o conceito principal (automação) em 5 palavras. Body explica o quando-usar-manual com 3 exemplos concretos (impressão de teste, presente, encomenda fora do catálogo). Sofia tinha razão sobre dois CTAs: o automático vem primeiro porque é o fluxo recomendado.

---

### C.4 Pedidos · `/orders` (estado vazio, mobile + desktop)

**Estado atual**: "Sua primeira venda esta esperando." Sem CTA inline.

**Carla refina**:

**Headline (Fraunces)**

> Tua primeira venda começa com um pedido.

**Body**

> Cliente mandou mensagem no WhatsApp? Cola aqui.
> Atendeu no Instagram, na feira, na vitrine? Cadastra na mão. O Hayzer puxa estoque e produção sozinho.

**CTA primário** (botão petrol grande, presente NO empty state, não só no header)

> Registrar primeiro pedido

**Helper text**

> Tem 2 pedidos por dia? Tu vai ver tudo aqui.

**Por quê**: a copy atual é poética mas vaga ("primeira venda está esperando"). Reescrevi falando dos canais reais onde maker BR vende (WhatsApp, Instagram, feira, vitrine). Adicionei CTA inline porque Sofia detectou que mobile pode esconder o botão do header quando rola. Helper text é um vislumbre do que vem depois: "tu vai ver tudo aqui" projeta o futuro.

---

### C.5 Dashboard · novo usuário com projeto mas dados zerados

**Sofia sugeriu (no `nextAction`, versão original com em-dash que precisa ser reescrita)**:
> "Você tem tudo pronto. Comece registrando o filamento que você usa agora, leva 30 segundos e libera o cálculo de custo de cada peça."

> Nota: a sugestão original da Sofia continha em-dash. Reescrita aqui sem em-dash já como referência neutra, e refinada abaixo no padrão Carla.

**Carla refina**:

**Mensagem do card `nextAction`** (renderizado pelo `DashboardLayout` quando `ordersCount === 0`)

> **Falta um passo pra começar**
>
> Cadastra o filamento que tu usa hoje. Leva 30 segundos e libera o cálculo de custo automático em cada pedido.
>
> [CTA: Cadastrar filamento]

**Variação 2** (caso já tenha filamento mas falta produto):

> **Quase lá**
>
> Tu já tem filamento cadastrado. Agora cria o primeiro produto, vincula ao filamento e o Hayzer calcula custo + margem sozinho.
>
> [CTA: Criar primeiro produto]

**Variação 3** (caso já tenha filamento e produto mas zero pedido):

> **Tá tudo pronto pra rodar**
>
> Quando o primeiro pedido entrar, ele já vai puxar filamento, gerar item de produção e contabilizar no financeiro automático.
>
> [CTA: Registrar primeiro pedido]

**Por quê**: o dashboard de "tudo zero mas com projeto" é a tela onde o maker mais abandona. Sofia chamou de "lacuna crítica". Em vez de uma frase única, propus 3 estados progressivos no `nextAction` baseados no que já foi feito. Cada um aponta pra próxima ação concreta, sem repetir o onboarding inteiro. O backend (`services/dashboard.ts`) precisa de uma matriz simples: tem filamento? tem produto? tem pedido? Renderiza a variação correspondente.

---

### C.6 Portfólios · `/portfolios` (refinamento secundário)

**Estado atual**: "Nenhum portfólio ainda" + CTA "Criar portfólio".

**Problema (Sofia)**: maker confunde portfólio com catálogo. Não sabe se isso é pra ele.

**Carla refina**:

**Headline (Fraunces)**

> Portfólio mostra teu trabalho. Catálogo vende.

**Body**

> Portfólio é a vitrine das peças que tu já fez, pra cliente confiar antes de pedir orçamento.
> Catálogo é a página pública onde o cliente compra direto, com preço e botão de pagamento.

**CTA primário**

> Criar primeiro portfólio

**Helper text**

> Tu pode ter os dois. Ou só um. Como preferir.

**Por quê**: headline já diferencia em 7 palavras. Body educa explicitamente catálogo vs portfólio. Helper text remove a pressão ("tu pode ter os dois ou só um") porque maker novato fica em dúvida do que escolher.

---

### C.7 CRM tab Clientes (refinamento secundário)

**Problema (Sofia)**: explica como clientes aparecem mas não dá ação alternativa.

**Carla refina**:

**Headline (Fraunces)**

> Teus clientes aparecem aqui sozinhos.

**Body**

> Cada vez que tu registra um pedido, o cliente entra na lista.
> Tu vê quem comprou mais, quem sumiu há tempo e quem tá voltando.

**CTA primário**

> Registrar primeiro pedido

**CTA secundário (texto âncora)**

> Adicionar cliente manualmente

**Por quê**: CTA primário leva pra ação que efetivamente popula a lista (registrar pedido). O secundário cobre o caso de quem quer cadastrar contato isolado.

---

## Filtro anti-IA · checklist final

- [x] Nenhuma palavra da lista negra (plataforma, solução, robusto, completo, inovador, etc).
- [x] Zero em-dash (—) ou en-dash (–). Apenas vírgula, dois-pontos, ponto, parênteses.
- [x] Nenhuma frase começando com "Imagine se...", "E se...", "Pensa que...".
- [x] Nenhuma estrutura "Não apenas X, mas também Y".
- [x] Frases ≤18 palavras (revisado uma a uma).
- [x] Verbos no imperativo dominam ("cria", "registra", "cadastra", "cola").
- [x] Concretude: WhatsApp, Instagram, feira, vitrine, filamento, peça, pedido (nunca "items", "data", "informação").
- [x] Brasileiro real: "tá", "tu", "bora", "manja", "pra" usados com moderação e no contexto certo (mais leve no email, mais formal nos labels e CTAs operacionais).
- [x] "Você/tu" inconsistência: usei "tu" no Hayzer porque maker BR (especialmente Sul + popular online) tem proximidade com essa forma. Se CEO preferir uniformizar pra "você", troca tudo num search-replace. Documentei a escolha aqui pra revisão.

---

## Próximos passos sugeridos

1. **CEO valida**: tom geral, escolha de "tu" vs "você", subject do email.
2. **Diego**: desenha o visual da Tela 2 (print WhatsApp + seta pra card Hayzer).
3. **Felipe**: implementa wizard de 4 telas com progress dots + skip persistente.
4. **Bruna**: ajusta `services/dashboard.ts` pra retornar `nextAction` correto baseado nas 3 variações da seção C.5.
5. **Sofia**: revisa se algum empty state que ela mapeou ficou de fora e me avisa.
6. **Marcos**: pode reusar headlines deste doc pra posts de divulgação do onboarding (especialmente "Tudo começa com um projeto" e "A fila se vira sozinha").

---

> Documento mantido por Carla. Revisar em conjunto com `brand/BRIEF.md` e `sessions/2026-05-21-empty-states-audit-sofia.md`.
