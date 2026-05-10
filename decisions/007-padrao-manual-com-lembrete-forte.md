# ADR 007 — Padrão "Manual com Lembrete Forte"

> **Status:** 📐 Padrão de UI/UX (a aplicar em features futuras)
> **Data:** 2026-05-10
> **Predecessores:** ADR 006

---

## Contexto

Várias features do Mapa do Negócio (ADR 006) e do ROADMAP dependem de **dados que não dá pra automatizar**:

- Tempo de produção por pedido (Wave 4a)
- Concorrentes e preços observados (Wave 7)
- Baseline de seguidores em redes sociais (Wave 7)
- Suprimentos comprados fora de catálogo (Wave 2)
- Custo manual de jobs específicos

**Problema clássico**: ferramentas com entrada manual viram tabelas vazias depois de 2 meses. Usuário cadastra com entusiasmo, esquece, dado fica desatualizado, ferramenta perde confiança, abandona.

Construir essas features sem mecanismo de retenção = jogar tempo de desenvolvimento fora.

---

## Decisão

Toda feature que dependa de input manual recorrente **deve seguir o padrão "Manual com Lembrete Forte"**:

### 1. Frequência esperada explícita

Cada tipo de dado declara sua **cadência esperada**:
- `daily` — esperado todo dia útil
- `weekly` — esperado uma vez por semana
- `monthly` — esperado uma vez por mês
- `quarterly` — esperado uma vez por trimestre
- `on_event` — só quando evento acontece (ex: novo concorrente surgiu)

Salva em `<tabela>_meta` ou direto na tabela com `expected_cadence text`.

### 2. UI mostra "última atualização" sempre visível

Cada tela com dados desse tipo deve mostrar, em destaque:
```
┌─────────────────────────────────┐
│ 🕐 Atualizado há 7 dias         │
│    (esperado: semanal)          │
└─────────────────────────────────┘
```

Quando dentro da cadência → texto neutro (cinza).
Quando 1.5x da cadência → amarelo.
Quando 2x da cadência → vermelho com CTA "Atualizar agora".

### 3. Lembrete persistente (não modal)

Em vez de modal intrusivo, usar **banner persistente no topo da tela** quando dado está atrasado:

```
⚠️ Você não atualiza concorrentes há 73 dias.
   Sem isso, "Mapa do Crescimento" mostra dado antigo.
   [Atualizar agora] [Lembrar em 7 dias] [Não me cobrar mais]
```

"Não me cobrar mais" deve ser uma escolha consciente, não default. Salva em preferência do usuário.

### 4. Captura sem fricção

Cada dado manual deve ter:
- **Um único input** quando possível (não wizard de 5 passos)
- **Pré-preenchimento inteligente** (último valor, sugestão baseada em contexto)
- **Atalho de teclado** pra power users (`Cmd+K` abre quick-input)
- **Salvamento incremental** (ao dar tab/blur, não só ao clicar "salvar")

### 5. Mostrar valor imediato

Após cada input, **mostrar o que esse dado destrava**:
```
✅ Concorrente atualizado.
   Insight calculado: você está R$ 12 mais barato que a média dos 3 maiores.
   Ver no [Mapa do Crescimento]
```

Sem feedback de valor, usuário não conecta input → benefício, abandona.

### 6. Degradação graceful sem o dado

Se dado está desatualizado/ausente, **não mentir**. Card afetado deve mostrar:
- "Dado desatualizado há X dias — pode estar errado"
- "Cadastre concorrentes pra desbloquear este insight"

Nunca calcular silenciosamente em cima de dado obsoleto.

---

## Onde aplicar

| Feature | Cadência | Aplicação |
|---|---|---|
| Wave 2 — Supplier prices | `on_event` (quando comprar) + `monthly` (revisão) | Banner se >60d sem atualização |
| Wave 4a — Tempo de produção | `daily` (a cada pedido produzido) | Quick-input no detalhe da order |
| Wave 7 — Concorrentes | `quarterly` | Banner forte se >90d |
| Wave 7 — Social baseline | `monthly` | Banner se >45d |
| Custos fixos (ADR 004 Onda 3) | `monthly` | Lembrete no início do mês |

---

## O que está fora do escopo

- ❌ Notificações push/email — só dentro do app por enquanto
- ❌ Gamificação (streaks, achievements) — pode parecer brinquedo
- ❌ IA pra preencher por inferência — dado errado é pior que dado ausente

---

## Resultado esperado

Features com input manual mantém **>60% de taxa de atualização ativa** após 90 dias de uso. Sem esse padrão, baseline histórica de SaaS é <20%.
