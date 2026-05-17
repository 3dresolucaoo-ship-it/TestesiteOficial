# ADR 013 — Logo H+raízes preservada como ativo de marca fixo

> **Data**: 17/05/2026
> **Status**: Aceito — regra permanente
> **Decisor**: Gabriel (CEO)
> **Custo de reversão**: ALTO — CEO investiu tempo/iteração na arte; recriar via IA falhou 2x antes

---

## Contexto

A logo atual do Hayzer (PNG `public/logo-hayzer.png` — H verde com raízes orgânicas saindo da base, 1536×1024px) foi trazida pelo CEO em 14/05/2026 após 2 tentativas falhas de gerar via agente IA (Diego rejeitou ambas as rodadas). Está em produção via `components/Logo.tsx` usando `<Image>` Next + `mix-blend-screen` pra eliminar fundo preto. Variants `sm` (h-9) e `lg` (h-20→24 com pulse petrol).

Nos 3 mockups dashboard arquiteturais entregues em 16/05 (V1 Dataviz / V2 Hero / V3 Editorial), Diego usou variantes da logo (em alguns casos "H Fraunces" tipográfico inventado em vez da arte real). CEO reagiu negativamente em 17/05:

> "sobre os 3 mockups, nao mude a logo ano gostei matenha a que eu fiz!"

E posteriormente, ao escolher caminho A (híbrido V4):

> "não muda logo por favor"

---

## Decisão

**A logo do Hayzer está congelada como ativo de marca. Daqui pra frente:**

1. Toda referência visual em mockup, componente, doc de design ou peça de marketing usa **`public/logo-hayzer.png`** via `components/Logo.tsx` — nada de redesenhar, recriar tipograficamente, "iterar" ou substituir por placeholder
2. Variants permitidas: `sm`, `lg` (já implementadas). Novas variants exigem aprovação CEO antes
3. Evolução de logo só com pedido explícito do CEO — não é trabalho de design implícito em redesigns futuros
4. Em mockups HTML estáticos, usar `<img src="/logo-hayzer.png">` ou referência equivalente, jamais SVG inventado

**Aplica-se a TODOS os agentes G7** (Diego, Felipe, Carla, Marcos, qualquer outro). Lia documenta. Quem desrespeitar, perde a entrega.

---

## Justificativa

1. **Investimento emocional + tempo do CEO** — a arte é dele, e ele explicitou 2x que gosta. Iterar sem pedido é desperdício
2. **2 tentativas IA falharam** — agente Diego rejeitou 2 rodadas de SVG manual antes; tentar de novo é repetir erro conhecido
3. **Identidade de marca exige consistência** — Hayzer está em fase early (waitlist, calculadora pública, /mockups admin); trocar logo agora confunde os primeiros 100 usuários
4. **Custo de oportunidade** — tempo gasto redesenhando logo é tempo NÃO gasto melhorando dataviz, UX, conversão, dopamina-operacional
5. **A logo já tem signature visual forte** — H + raízes orgânicas = metáfora do produto (raízes = sistema crescendo desde a base). Coerente com posicionamento.

---

## Implicações práticas

- **Diego (designer)**: ao criar mockup novo, SEMPRE referenciar `public/logo-hayzer.png` ou variante existente em `Logo.tsx`. Nunca desenhar "H tipográfico" alternativo.
- **Felipe (frontend)**: nunca trocar `components/Logo.tsx` por SVG inline sem ADR novo.
- **Carla (copy)**: em peças de marketing, usar arquivo de marca oficial; jamais sugerir "redesign de identidade".
- **Marcos (marketing)**: peças de divulgação (post LinkedIn, banner, vídeo) usam SEMPRE a logo oficial.
- **Mockup V4** (em construção, sessão 17/05): respeita esta regra desde o início.

---

## Memória persistente associada

Salvar em `~/.claude/projects/.../memory/` como `design_logo_hayzer_preservada.md`:

> **Regra fixa**: Logo Hayzer (H+raízes, `public/logo-hayzer.png`) é ativo de marca congelado. CEO investiu na arte, 2 tentativas IA falharam. Daqui em diante, NUNCA recriar/redesenhar/substituir sem pedido explícito. Aplica a todos os agentes G7.
>
> **Por quê**: Investimento emocional + tempo CEO; 2 tentativas IA já falharam; identidade exige consistência em fase early; custo de oportunidade alto.
>
> **Como aplicar**: Em mockup HTML usar `<img src="/logo-hayzer.png">`; em React usar `<Logo />` de `components/Logo.tsx`; nunca inventar SVG tipográfico alternativo.

---

## Relacionados

- `decisions/009-naming-hayzer.md` — escolha do nome Hayzer
- `components/Logo.tsx` — implementação atual (mix-blend-screen)
- `public/logo-hayzer.png` — arquivo oficial da arte
- `mockups/dashboard/v4-hibrido.html` (a ser criado) — primeiro mockup que respeita esta regra desde o brief

---

## Lições aprendidas

1. **Investimento do CEO em ativo de marca é decisão fechada** — não-negociável até pedido explícito de reabertura
2. **Quando agente IA falha 2x num mesmo desafio criativo**, parar de tentar e usar o que o humano trouxe
3. **Documentar logo como "ativo congelado" cedo evita re-debate em redesigns futuros** — vira regra fixa do squad
