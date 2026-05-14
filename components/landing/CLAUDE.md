# components/landing — Cérebro

> Componentes da **landing pública** (`/`) e tela de obrigado (`/waitlist/obrigado`).

## 📦 O que tem aqui

| Componente | Onde aparece | Tipo |
|---|---|---|
| `Logo.tsx` | Header + Footer | Server (display) |
| `Header.tsx` | Topo da landing + páginas LGPD | Server (sticky) |
| `Hero.tsx` | `/` — primeira tela | Client (motion) |
| `WaitlistForm.tsx` | Dentro do Hero | Client (form + Server Action) |
| `Features.tsx` | `/` — seção #features | Client (motion + view) |
| `WhyDifferent.tsx` | `/` — seção #por-que (compara concorrentes) | Client (motion) |
| `FinalCTA.tsx` | `/` — fim da landing | Client (motion) |
| `Footer.tsx` | Toda landing + LGPD | Server |
| `ThankYouHero.tsx` | `/waitlist/obrigado` | Client (motion) |
| `Step2Form.tsx` | `/waitlist/obrigado` — form qualificação | Client (form + Server Action) |

## 🎯 Status

- ✅ Funcionando: todas as seções da landing renderizam, mobile responsivo OK, dark mode Paleta B aplicada
- ✅ Forms: etapa 1 valida Zod, redireciona pra /obrigado; etapa 2 opcional
- ✅ Migration `20260513_waitlist_leads.sql` aplicada em prod 2026-05-13
- ✅ Defesa anti-bot ativa (2026-05-13): honeypot (campo `website` invisível) + time-check (≥2.5s entre render e submit) + rate-limit por IP hash (3 leads/24h, salt em `WAITLIST_IP_SALT`). Falhas de bot retornam `success` fake pra não vazar dica.
- ✅ Security headers globais via `next.config.ts`: HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy.
- ⏳ Pendente: configurar Resend pra email de confirmação (semana 3)
- ⏳ Pendente: ativar Vercel BotID toggle no Dashboard Vercel + integrar SDK `botid` na action (semana 2)
- ⏳ Pendente: trocar rate-limit pra Upstash Redis quando volume > 100 leads/dia

## 📐 Convenções

- **Tom**: anti-IA — Carla (G7) valida todo copy. Banido: "plataforma", "solução", "que ajuda", "revolucionário"
- **Visual**: Paleta B (dark premium) — sem gradiente roxo, sem cantos arredondados excessivos
- **Tipografia**: Geist Sans + tracking-tight em headings
- **Espaçamento**: sistema 4/8/16/24/32/48/64/96 (Tailwind padrão)
- **Animação**: Framer Motion, ≤500ms, ease-out, com `viewport={{ once: true }}`
- **Mobile-first**: testar 375px antes de desktop
- **Acessibilidade**: aria-labels em inputs, focus-visible em todos os botões

## 🧪 Como testar

```bash
npm run dev
# Abre http://localhost:3001/
# Testa:
# - Hero aparece com h1 "Seu negócio, sem caos."
# - Form aceita email+nome+whatsapp+checkbox LGPD
# - Mobile (DevTools 375px) layout single-column
# - Dark mode é o default
```

Testes manuais:
1. Submit form com email vazio → erro Zod
2. Submit form sem checkbox LGPD → erro "precisa aceitar"
3. Submit válido → redireciona `/waitlist/obrigado`
4. Tela obrigado mostra email + form qualificação
5. Form etapa 2: submit ou "Agora não" — ambos OK

## 🚨 Não mexer sem avisar

- `Hero.tsx` — texto do H1 ("Seu negócio, sem caos.") foi decisão de marca; muda só via `/brand:update`
- `WaitlistForm.tsx` — schema Zod vive em `services/waitlistSchema.ts`, não duplica aqui
- `WhyDifferent.tsx` — preços dos concorrentes (Bling R$119, etc.) — verificar antes de mudar

## 🔄 Relacionados

- `services/waitlist.ts` — onde o backend mora
- `services/waitlistSchema.ts` — schemas Zod (etapa 1 + etapa 2)
- `app/waitlist/actions.ts` — Server Actions
- `app/page.tsx` — monta a landing
- `app/waitlist/obrigado/page.tsx` — tela de obrigado
- `brand/BRIEF.md` — fonte da verdade da marca
- `brand/design-system.md` — tokens

## 🔄 Última atualização

2026-05-14 · **Landing v2 (option-c-hybrid)** — Diego refez visual completo após feedback do CEO ("genérico, ar de IA, muito escuro"). Mudanças:

- **Tipografia**: Fraunces (serif editorial) pros h1/h2 + Geist sans body. Variable font axes `opsz` + `SOFT` no `app/layout.tsx`.
- **Paleta v2**: night (`#07090A` quase-preto) + fog (`#F2EFEA` off-white) + petrol (`#1F7669` verde-petróleo, foge do azul corporativo) + ember (`#D08A4A` âmbar acento). Override de tokens shadcn via `html.dark[data-layout="marketing"]` em `globals.css`.
- **Layout**: Hero split (col-7 logo+headline / col-5 form em "carta" com glassmorphism + sticker rotacionado). Features asymmetric grid 1.15fr/0.85fr (anti 2x2 padrão). WhyDifferent split com gradient verde-petróleo no lado "Com BVaz Hub".
- **Detalhes anti-IA**: noise grain via SVG inline (3 níveis: heavy/normal/soft), marker handmade âmbar em "caos", italic-soft com font-variation-settings em "sem"/"quatro coisas"/"cabeça", number stamps font-mono ("01 — estoque"), pulse-glow no logo grande, watermark "feito no brasil." 200px serif no footer, vinheta nas bordas do hero.
- **Componentes refatorados**: Logo (variants sm/lg+pulse), Header (btn-light), Hero (split + framer-motion staggered), WaitlistForm (dark glass + tag labels uppercase), Features (asymmetric + ícones SVG duotone petrol), WhyDifferent (tabela split), FinalCTA (display-h2 + 04.07.2026 mark), Footer (3 cols + watermark).
- **Mockups de referência**: `mockups/landing-v2/option-{a,b,c}-*.html` + `README.md` (Diego entregou A+B antes do limit API; C foi composição manual estrutura A + paleta B).

2026-05-13 · Setup inicial (Diego + Carla + Felipe via /design:component)
