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

- ✅ Funcionando: todas as seções da landing renderizam, mobile responsivo OK, dark mode paleta v2 aplicada
- ✅ Forms: etapa 1 valida Zod, redireciona pra /obrigado; etapa 2 opcional
- ✅ Migration `20260513_waitlist_leads.sql` aplicada em prod 2026-05-13
- ✅ Defesa anti-bot ativa: honeypot (campo `website` invisível) + time-check (≥2.5s entre render e submit) + rate-limit por IP hash (3 leads/24h, salt random 32 bytes em `WAITLIST_IP_SALT` desde 14/05). Falhas de bot retornam `success` fake.
- ✅ Security headers globais via `next.config.ts`: HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy.
- ✅ Vercel Bot Protection (Firewall) ativo em modo **Log** desde 14/05 (promover pra On após observação).
- ✅ **Rebranding Hayzer (14/05/2026)**: Logo (B→H), Footer (Hayzer + email contato `ola@hayzer.com.br`), WaitlistForm (texto LGPD), WhyDifferent (Com Hayzer), Step2Form (Como descobriu o Hayzer?), meta tags em `app/layout.tsx`. Ver `decisions/009-naming-hayzer.md`.
- ✅ **Domínio próprio em prod**: https://hayzer.com.br (registrado, SSL automático Vercel, A record 216.198.79.1).
- ✅ Fix footer mobile (14/05): watermark "feito no brasil." escala progressiva `text-[3.5rem→12.5rem]` (era 7.5rem fixo, cortava em <600px).
- ✅ **Logo Hayzer (15/05/2026)**: CEO trouxe PNG 1536x1024 (H verde com raízes orgânicas). Implementado em `Logo.tsx` via `<Image>` Next + `mix-blend-screen` (come o fundo preto da PNG, funciona em qualquer bg dark). Variants `sm` (h-9, 36px) e `lg` (h-20→24 com pulse petrol). Arquivo em `public/logo-hayzer.png`. Pulse migrado de `box-shadow` pra `drop-shadow` (acompanha contorno das raízes).
- ✅ **Foco vertical maker 3D (15/05/2026, ADR-010)**: Hero, Features, WhyDifferent + CTA reescritos pra Rafael (filamento, fila de impressão, comissão de marketplace, recompra de maker). Frase âncora destaque: "Quatro sistemas, nenhum conversa. Aqui é um, e fala português." CTA: "Quero acesso antecipado". `SEGMENT_OPTIONS` em `services/waitlistSchema.ts` refeitas (3 variants 3D + estética + loja física + serviço + outro).
- ✅ **WhatsApp CTA na /obrigado (15/05/2026)**: `components/landing/WhatsAppGroupCta.tsx` renderiza botão verde "Entra no grupo Hayzer Beta" entre `ThankYouHero` e `Step2Form`. Lê env var `NEXT_PUBLIC_WHATSAPP_GROUP_URL` — graceful: oculta se vazia. Testado fim-a-fim.
- ✅ **Resend SDK + email transacional (15/05/2026)**: `services/email.ts` com template HTML+texto (Gabriel CEO 1ª pessoa, signature). Wire-up em `app/waitlist/actions.ts` após `addLeadStep1` ok — falha silenciosa se Resend não configurado (lead persiste). 3 env vars Vercel setadas. DNS records propagados globalmente. Status Resend: `pending` (workflow interno AWS SES, verifica em 1-24h sozinho).
- ✅ **Bug RLS waitlist FIXADO (15/05/2026, commit `fccd49f`)**: `supabase-js` fazia `INSERT...RETURNING` que precisava de policy SELECT (anon não tem). Fix: `addLeadStep1` + `updateLeadStep2` usam `getSupabaseAdmin()` (service_role bypass). Server Action já valida Zod + bot guards — seguro. Causa adicional: `SUPABASE_SERVICE_ROLE_KEY` faltava no Vercel — adicionada.
- ⏳ Pendente: trocar rate-limit pra Upstash Redis quando volume > 100 leads/dia.
- ⏳ Pendente: rotacionar `RESEND_API_KEY` + `SUPABASE_SERVICE_ROLE_KEY` (expostas no chat de 14-15/05).

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

2026-05-14 (segunda parte) · **Rebranding Hayzer + domínio próprio em prod + defesa Tier 1 completa**:
- BVaz Hub → Hayzer (decisão registrada em `decisions/009-naming-hayzer.md`). 11 arquivos da landing atualizados.
- `hayzer.com.br` registrado, DNS configurado, SSL HTTPS automático Vercel.
- `WAITLIST_IP_SALT` random 32 bytes setado em prod (era fallback previsível).
- Vercel Bot Protection (Firewall) ativo em modo Log.
- Fix footer mobile watermark.
- 2 rodadas Diego de logo rejeitadas — CEO traz arte de fora.

2026-05-14 (primeira parte) · **Landing v2 (option-c-hybrid)** — Diego refez visual completo após feedback do CEO ("genérico, ar de IA, muito escuro"). Mudanças:

- **Tipografia**: Fraunces (serif editorial) pros h1/h2 + Geist sans body. Variable font axes `opsz` + `SOFT` no `app/layout.tsx`.
- **Paleta v2**: night (`#07090A` quase-preto) + fog (`#F2EFEA` off-white) + petrol (`#1F7669` verde-petróleo, foge do azul corporativo) + ember (`#D08A4A` âmbar acento). Override de tokens shadcn via `html.dark[data-layout="marketing"]` em `globals.css`.
- **Layout**: Hero split (col-7 logo+headline / col-5 form em "carta" com glassmorphism + sticker rotacionado). Features asymmetric grid 1.15fr/0.85fr (anti 2x2 padrão). WhyDifferent split com gradient verde-petróleo no lado "Com Hayzer".
- **Detalhes anti-IA**: noise grain via SVG inline (3 níveis: heavy/normal/soft), marker handmade âmbar em "caos", italic-soft com font-variation-settings em "sem"/"quatro coisas"/"cabeça", number stamps font-mono ("01 — estoque"), pulse-glow no logo grande, watermark "feito no brasil." 200px serif no footer, vinheta nas bordas do hero.
- **Componentes refatorados**: Logo (variants sm/lg+pulse), Header (btn-light), Hero (split + framer-motion staggered), WaitlistForm (dark glass + tag labels uppercase), Features (asymmetric + ícones SVG duotone petrol), WhyDifferent (tabela split), FinalCTA (display-h2 + 04.07.2026 mark), Footer (3 cols + watermark).
- **Mockups de referência**: `mockups/landing-v2/option-{a,b,c}-*.html` + `README.md` (Diego entregou A+B antes do limit API; C foi composição manual estrutura A + paleta B).

2026-05-13 · Setup inicial (Diego + Carla + Felipe via /design:component)
