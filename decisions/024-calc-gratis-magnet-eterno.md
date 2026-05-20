# ADR 024 — Calc Grátis sem cap como magnet eterno, Hayzer completo como produto pago

> Status: accepted
> Data: 2026-05-21
> Autor: Gabriel (CEO) — decisão de madrugada após comparação com Vultrix3D

---

## Contexto

Em 20/05/2026 o CEO aceitou o ADR-023, que convertia a Calc Pro de modelo lifetime (R$ 37) para freemium subscription (R$ 19/mês com cap de 5 cálculos/dia na tier grátis).

Na madrugada de 21/05/2026, ao analisar a concorrência — especialmente Vultrix3D e outras ferramentas gratuitas de calc 3D no mercado BR — o CEO identificou que a premissa central do ADR-023 estava errada: **uma calculadora isolada não tem moat suficiente para sustentar mensalidade**.

O produto real do Hayzer é o sistema completo: CRM, financeiro, produção, estoque, catálogo, portfólios, decisões, conteúdo, clientes, configurações e pedidos integrados. A calculadora é uma porta de entrada, não um produto independente.

Soft launch: 11-13/06/2026. Launch público: 27/06/2026.

---

## Decisão

**A Calculadora é grátis, sem cap, sem modal de upsell, sem cadastro obrigatório. Funciona para sempre.**

### Papel da Calculadora

- Ferramenta de topo de funil (TOFU) para captura de lead maker 3D BR
- Captura email via formulário de waitlist do Hayzer (não via paywall)
- Não cobra, não bloqueia, não limita
- Watermark "feito com Hayzer" no PDF é o único elemento de branding

### O que é cobrado

- **Hayzer completo**: módulo de pedidos + clientes + financeiro + produção + estoque + catálogos + portfólios + decisões + conteúdo + configurações, todos integrados
- Preço a definir na janela pré-launch: faixa estimada R$ 49-99/mês
- Soft launch 11-13/06 · Launch público 27/06/2026

### O que NÃO existe mais

- `/calculadora/pro` — rota removida
- `CalcUpsellModal` — componente removido
- Cap de 5 cálculos/dia — lógica removida
- `calcProSubscription` — service removido
- Migration `20260520_calc_pro_subscriptions.sql` — não será aplicada (nunca chegou a prod)
- Eventos PostHog: `calc_free_limite_atingido`, `calc_pro_checkout_click`, `calc_pro_pitch_view` — removidos

---

## Alternativas consideradas

- **A: Manter ADR-023 (freemium R$ 19/mês)** — descartada porque calc isolada não tem moat; cap de 5/dia afasta lead no momento de maior interesse; concorrência já precificou calc como commodity.
- **B: Calc paga desde o primeiro uso (paywall total)** — descartada porque zero chance de tração orgânica. Maker BR vai para concorrente grátis imediatamente.
- **C: Calc grátis com upsell pop-up agressivo** — descartada porque pop-up de upsell para produto ainda não lançado gera ruído sem conversão. O produto pago (Hayzer completo) ainda não está pronto para vender.

---

## Consequências

### Positivas
- Funil mais limpo: calc captura email → lead entra na waitlist → converte para Hayzer completo no launch
- Zero fricção na calc: maker usa, salva PDF, divulga — efeito boca a boca sem atrito
- Foco do time concentrado no produto principal (os 11 módulos restantes), não na monetização precoce de feature isolada
- Narrativa coerente: "Hayzer é o sistema — a calc é um dos benefícios"

### Negativas / Riscos
- **Zero receita early-stage da calc**: sem MRR da calc até o produto completo lançar. Tradeoff aceito explicitamente pelo CEO.
- **Sem validação de willingness-to-pay antes do launch**: ADR-023 usava a calc como teste de pricing. Agora essa validação acontece só em 27/06 com o produto completo.
- **Calc vira custo puro**: hosting, PDF gerado, etc., sem retorno direto. Baixo volume esperado — risco controlado.

### Reversibilidade

Baixo custo de reverter se necessário: adicionar paywall na calc é 1-2 dias de trabalho (Felipe + Bruna). Nenhum dado de usuário foi comprometido. Migration nunca foi aplicada em prod.

---

## Impacto técnico imediato

### Deletado por Felipe (frontend)
- `app/calculadora/pro/` — rota e página
- `components/calculadora/CalcUpsellModal.tsx` — componente de upsell
- Lógica de rate limit / cap diário na `/calculadora`

### Deletado por Bruna (backend)
- `services/calcProSubscription.ts` — service layer
- `app/api/calc-pro/status/route.ts` — endpoint de status
- Handlers de eventos Stripe subscription em `app/api/webhooks/payment/route.ts`
- Funções `getCheckoutUrlSubscription`, `cancelSubscription`, `createPortalSession` em `payments/stripe.ts` (ou marcadas como unused)

### Migration não-aplicada
- `supabase/migrations/20260520_calc_pro_subscriptions.sql` — nunca chegou a prod. Manter no repo como referência histórica ou deletar. Decisão: manter (custo zero, serve como histórico).

### Env vars a remover do Vercel (nunca foram configuradas em prod)
- `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_CALC_PRO`
- `NEXT_PUBLIC_CALC_PRO_PRICE_MONTHLY`
- `STRIPE_CALC_PRO_WEBHOOK_SECRET`
- `STRIPE_CALC_PRO_PRICE_ID`

### PostHog events removidos
- `calc_free_limite_atingido`
- `calc_pro_checkout_click`
- `calc_pro_pitch_view`

### Arquivo arquivado
- `payments/setup-stripe-calc-pro.md` → `payments/_archived/setup-stripe-calc-pro.md`

---

## Métricas para avaliar (90 dias pós-launch público, 27/06)

- **Taxa de conversão waitlist → paying user do Hayzer completo**: meta mínima 2%, boa 5%+
- **Emails capturados via calc até launch**: sinal de tração TOFU
- **NPS da calc grátis** (survey opcional pós-PDF): valida se o produto encanta antes de cobrar

Se conversão waitlist → paying estiver abaixo de 1% em 90 dias, revisitar se a calc deveria ter alguma monetização direta.

---

## Quando revisitar

- **Data**: 27/09/2026 (90 dias pós-launch)
- **Evento**: se conversão waitlist → paying < 1% em 90d
- **Evento**: se surgir concorrente com calc paga e tração real no mercado BR maker 3D

---

## Relacionados

- `decisions/023-calc-pro-freemium-subscription.md` — ADR revogado (histórico do raciocínio anterior)
- `payments/_archived/setup-stripe-calc-pro.md` — guia arquivado (superseded por esta decisão)
- `ROADMAP.md` — remover Semana 3 Calc Pro da fila
