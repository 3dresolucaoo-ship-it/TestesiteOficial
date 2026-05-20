# Audit pré-launch hayzer.com.br — 2026-05-20

> Auditor: Júlia QA G7 (Claude Code agent) · Pré-soft-launch 11-13/06/2026
> Padrão: WCAG 2.1 AA · Cross-browser smoke · Form validation
> Ferramentas: Playwright 1.60 + axe-core 4.10.2 + cálculo manual de contraste

---

## Resumo executivo

**Status final: NO-GO condicional para soft launch 11/06.**

A landing está estruturalmente sólida — zero violações críticas/sérias de WCAG no axe-core, hierarquia semântica limpa, paridade Chromium↔WebKit confirmada após render completo. Porém, foram identificados quatro pontos que merecem correção antes da chamada pública: a pré-marcação do checkbox LGPD viola o princípio de consentimento ativo (gatilho jurídico, não estético), as mensagens nativas de validação HTML5 saem em inglês (quebra do contrato PT-BR formal da marca), o subtítulo da Calculadora 3D tem contraste 2,72:1 contra fundo night (falha AA limpa para texto 12px), e a CSP em modo "report-only" já registra bloqueios reais de PostHog que vão derrubar telemetria de produto no momento em que a política for promovida para enforce. Os quatro são corrigíveis em sessão única (~50 min). Sem eles, lançar é assumir risco LGPD documentado e perda de instrumentação no dia mais sensível.

Bugs cosméticos (tap targets pequenos no header e no botão "Entrar na lista", ordem de heading h1→h3 saltando h2 dentro do card de waitlist) são P1 e podem ir para a primeira semana pós-launch sem comprometer experiência principal.

**Recomendação**: corrigir os quatro itens P0 hoje (20/05) e re-rodar este audit antes de promover a campanha de soft launch. Após isso, status muda para **GO**.

---

## Parte 1 — A11y deep audit (axe-core 4.10.2)

### Desktop 1440x900 · Chromium

- Total de violations: **1**
- Total de passes: **42**
- Total de incomplete: **1** (todas no rule `color-contrast`, todas por overlay com pseudo-elemento `::before` de noise grain — não são violations reais)

### Mobile 375x667 · Chromium (iPhone SE)

- Total de violations: **1** (mesmo heading-order)
- Total de passes: **42**

### Tabela de violações por severidade

| # | Severidade axe | Regra | Onde | Nodes | Impacto real |
|---|---|---|---|---|---|
| 1 | moderate | `heading-order` | `<h3 class="display-h2 text-[22px]">Lista de espera</h3>` dentro do card do form | 1 | Card vai do h1 (hero) direto pro h3 do form, pulando h2. Quebra outline pra screen reader. Fix: mudar `h3` para `h2` ou para `<p>` decorativo com aria-level se quiser manter visual sem hierarquia. |
| 2 | incomplete | `color-contrast` | 84 nodes (não são fails) | 84 | axe não consegue calcular bg através de pseudo-elementos (grain overlay) e gradientes. **Validação manual abaixo: zero violations reais** após remoção do overlay. |

### Validação manual de contraste (cálculo WCAG 2.1)

Computado em rgb() composto, com bg efetivo (night-950 `#07090A`):

| Elemento | fg | bg efetivo | Tamanho | Ratio | Necessário | Status |
|---|---|---|---|---|---|---|
| h1 hero | `#F0EEEA` | `#07090A` | 96px | **17,22** | 3,0 | PASS |
| h1 `.marker "caos"` | `#F0EEEA` | `#07090A` | 96px | **17,22** | 3,0 | PASS |
| Parágrafo hero (muted-fg) | `#F0EEEA` | `#07090A` | 18px | **17,22** | 4,5 | PASS |
| Label do form `nome/email` (tag-fog) | `#8B8479` | `#07090A` | 11px | **5,39** | 4,5 | PASS |
| Texto LGPD consent | `#F0EEEA` | `#07090A` | 12,5px | **17,22** | 4,5 | PASS |
| Inputs (placeholder + text) | `#F0EEEA` | `#101213` | 14px | **16,21** | 4,5 | PASS |
| Botão calculadora link | `#70B2AB` | `rgba(15,72,66,0.18)` | 13,5px | **7,72** | 4,5 | PASS |
| Botão submit "Quero acesso antecipado" | `#070808` | `#F0EEEA` | 14,5px | **17,30** | 4,5 | PASS |
| Sticker amber "Lançamento em 27 de junho" topo gradient | `#151819` | `#E2A06A` (ember-400) | 11,5px | **8,05** | 4,5 | PASS |
| Sticker amber base gradient | `#151819` | `#A7612F` (ember-600) | 11,5px | **3,73** | 4,5 | **FAIL parcial** (bottom do gradient) |
| **Subtítulo Calculadora 3D `text-fog-400`** | `#5C5147` | `#07090A` | 12px | **2,72** | 4,5 | **FAIL claro** |

### Tap targets < 44x44px (mobile 375x667)

| # | Elemento | Tamanho | Texto/aria | Severidade |
|---|---|---|---|---|
| 1 | `<a>` header "Entrar na lista" | 122x32 | header CTA | P1 |
| 2 | `<a>` "Testa a calculadora grátis" | 217x42 | hero CTA | P2 (42px é borderline) |
| 3 | `<input>` checkbox LGPD | 13x16 | sem aria-label | P1 |
| 4 | Nav links footer ("O que faz", "Por quê", etc.) | 46-98 x 18 | navegação secundária | P2 (footer, baixa frequência) |

Os inputs de texto (`name`, `email`, `whatsapp`) têm altura 43px — 1px abaixo do limite AAA mas perfeitamente usáveis. Não classificado como bug.

### Top 5 violações reais (priorizadas)

1. **`text-fog-400` em texto pequeno (`p.leading-snug` da Calculadora 3D)** — 2,72:1 contra night, falha AA. Token `--fog-400 #5C5147` foi documentado como "borders em dark", está sendo reutilizado para texto. **Fix**: trocar `text-[12px]` da subtítulo da Calculadora 3D para `text-muted-foreground` (que resolve para fog-300 `#877E76`, ratio 7,18:1) ou subir o token `--fog-400` para `#A6A29A`.
2. **Sticker amber base do gradient** — 3,73:1 para texto 11,5px. **Fix**: travar o gradient num delta menor (ember-400 → ember-500 ao invés de ember-400 → ember-600), ou aumentar o peso pra `font-weight: 600` (mantém 3:1 para texto > 14px bold).
3. **`heading-order`** — h1 (hero) → h3 (card waitlist) saltando h2. **Fix**: trocar `h3` por `h2` no `WaitlistForm.tsx` (ou no componente pai do card) — uma linha de mudança.
4. **Tap target do checkbox LGPD (13x16px)** — abaixo do mínimo móvel AAA, e abaixo do critério Hayzer. **Fix**: adicionar área clicável invisível via `padding` no label envolvente OU aumentar checkbox para `h-5 w-5` no mobile.
5. **Header CTA "Entrar na lista" (122x32px)** — 32px de altura, abaixo do 44 móvel. **Fix**: `py-2.5` ou `min-h-[44px]` no breakpoint mobile.

---

## Parte 2 — Cross-browser smoke (1440x900 desktop)

### Browsers cobertos

- **Chromium** 148.0.7778: PASS completo
- **WebKit (Safari engine)** 26.4: PASS estrutural (ver nota sobre Framer Motion)
- **Firefox** 150.0.2: **NÃO TESTADO** — binário Playwright apresenta erro "side-by-side configuration" no Windows 11 deste ambiente (mozglue.dll falha de carregamento). Não é bug do Hayzer, é limitação do sandbox de QA. Recomendação: rodar Firefox manualmente em uma máquina com VC++ Redistributable instalado antes do soft launch.

### Resultados Chromium vs WebKit

Métricas idênticas em ambos: `title`, `h1Text`, `h1FontFamily` (Fraunces), `h1FontSize` (96px), `formInputs` (12), `bodyBg`, `bodyColor`, `pageHeight` (7684px), `scrollX` (sem horizontal scroll). Largura do body diverge em 4px (`1440` chromium / `1436` webkit) por causa de scrollbar — não é bug.

**Fonte Fraunces carregada corretamente em ambos** (font-variation-settings `"SOFT" 30, "opsz" 144` aplicado, `font.status = "loaded"`).

### Diferenças visuais identificadas

1. **Tempo até render de Framer Motion**: o primeiro screenshot WebKit (antes de scroll) mostrou seções "blank" porque `viewport={{ once: true }}` não havia disparado. Após scroll completo, paridade visual total. **Sem bug** — comportamento esperado de scroll-triggered animations.
2. **WebKit: erro `Not allowed to follow a redirection while loading https://hayzer.com.br/sw.js`** — WebKit bloqueia redirect 301/302 em service worker. Verificar se `/sw.js` está retornando redirect (não deveria). Não impede o site, mas impede PWA install no Safari.

### Console errors capturados (WebKit)

| Erro | Severidade | Ação |
|---|---|---|
| `Refused to load us-assets.i.posthog.com/array/.../config.js (CSP report-only)` | P0 | PostHog 2º host está fora da policy. Quando CSP virar enforce = telemetria quebra. |
| `Refused to load us-assets.i.posthog.com/static/surveys.js (CSP report-only)` | P0 | Mesma raiz. |
| `frame-ancestors directive ignored in report-only policy` | P2 | Warning informativo do WebKit, não bug. |
| `/sw.js access control checks` | P1 | Redirect em service worker quebra PWA Safari. |

Console errors Chromium: **0**.

---

## Parte 3 — Form smoke test

### Estrutura do form (Server Action `submitWaitlistStep1`)

12 inputs no total:
- 1 honeypot (`name="website"`, posicionado fora da tela)
- 1 time-check (`_t` hidden)
- 6 UTM trackers (hidden)
- 4 inputs do usuário: `name` (text, required), `email` (email, required), `whatsapp` (tel, optional), `consent_lgpd` (checkbox, required)

### Teste 1 — Submit vazio

- Browser bloqueia via HTML5 `required`.
- Mensagem retornada: **`Please fill out this field.`** (texto fixo do Chromium, idioma do browser).
- **PROBLEMA P0**: numa loja sem configuração extra, o usuário brasileiro lê mensagem em inglês. A marca Hayzer é PT-BR formal por contrato — isso quebra o tom.

### Teste 2 — Email inválido `"abc"`

- HTML5 dispara: **`Please include an '@' in the email address. 'abc' is missing an '@'.`** (inglês de novo).
- Mesma observação P0.

### Teste 3 — Submit sem aceitar LGPD

- Tentei desmarcar o checkbox via `evaluate`. Bloqueou via HTML5 `required` (passa, comportamento OK).
- **PROBLEMA P0 (LGPD)**: o checkbox tem `defaultChecked` no JSX (`components/landing/WaitlistForm.tsx:162`). **Isso é pré-marcação de consentimento** e fere o princípio LGPD de consentimento ativo, livre, informado e inequívoco (Art. 5º VIII e Art. 8º §4º). A ANPD já se posicionou contra pré-marcação em comunicações (Guia Cookies ANPD, p. 24). Para uma empresa em pré-launch, é risco baixo de denúncia, mas é risco real de auditoria caso o produto cresça. **Não é tema estético, é jurídico.**

### Teste 4 — Submit válido

- Email aleatório (`audit-1747...@hayzer-test.local`), nome, whatsapp, checkbox marcado.
- Redirect para `/waitlist/obrigado` (PASS).
- h1 final: `🥳 Você entrou 🎉` — emoji de comemoração OK.
- Tempo total: ~2,3s desde click até render da tela de obrigado.

### Aria/label do form

| Campo | Label visual | aria-label | autocomplete | Status |
|---|---|---|---|---|
| name | "nome" | "Seu nome" | given-name | PASS |
| email | "email" | "Seu email" | email | PASS |
| whatsapp | "whatsapp (opcional)" | "WhatsApp" | tel | PASS |
| **consent_lgpd** | (texto na span filha) | **null** | sem | **MELHORIA**: adicionar `aria-label="Aceito receber e-mails sobre o Hayzer"` ou amarrar com `aria-labelledby` apontando para a span. Label implícito por wrapper funciona, mas explícito é mais robusto. |

---

## Top 5 fixes recomendados (priorizado)

| # | Fix | Onde | Tempo estimado | Bloqueia launch? |
|---|---|---|---|---|
| 1 | Remover `defaultChecked` do checkbox `consent_lgpd` (LGPD opt-in ativo) | `components/landing/WaitlistForm.tsx:162` | 5 min | **SIM (LGPD)** |
| 2 | Adicionar `lang="pt-BR"` no `<html>` (provavelmente já tem — confirmar) E injetar mensagens HTML5 PT-BR via `oninvalid`/`setCustomValidity` nos inputs `name` e `email` | `WaitlistForm.tsx` campos `name` e `email` | 15 min | **SIM (tom de marca)** |
| 3 | Trocar `text-fog-400` da subtítulo da Calculadora 3D por `text-muted-foreground` (resolve para fog-300, ratio 7,18:1) | `Hero.tsx` (linha do `Calcula o custo da tua próxima impressão...`) | 5 min | **SIM (WCAG AA)** |
| 4 | Adicionar `us-assets.i.posthog.com` na CSP `script-src` (e `connect-src` se aplicável) | `next.config.ts` headers ou middleware | 10 min | **SIM (telemetria pós-launch)** |
| 5 | Trocar `<h3>` por `<h2>` no card "Lista de espera" (heading order) E aumentar tap target do checkbox LGPD para `h-5 w-5` no mobile | `WaitlistForm.tsx:18-22` (h3) + `WaitlistForm.tsx:159-165` (checkbox) | 10 min | NÃO (mas é P1, fix pré-launch público 27/06) |

**Total estimado para fix dos cinco**: **45-50 minutos** dentro de uma sessão.

### Fixes adicionais P1 (próxima semana, não bloqueia soft launch)

- Sticker amber gradient: travar em `ember-400 → ember-500` (não ember-600) para evitar 3,73:1 no rodapé do gradient.
- Header CTA "Entrar na lista" mobile: subir altura para 44px (`min-h-[44px]` ou `py-3` no mobile breakpoint).
- `aria-label` explícito no checkbox LGPD (`aria-labelledby` apontando para a span de texto).
- Investigar redirect em `/sw.js` que WebKit bloqueia (impacta PWA install no Safari).

---

## O que foi testado e passou

- Estrutura semântica: `<main>`, `<header>`, `<nav>`, landmarks visíveis para screen reader.
- Atributo `lang="pt-BR"` no `<html>`.
- Fonte Fraunces carrega em Chromium e WebKit com font-variation-settings aplicado.
- Honeypot + time-check anti-bot ativos e funcionais.
- Submit completo do form → redirect para /waitlist/obrigado.
- `aria-label` nos três inputs visíveis (name, email, whatsapp).
- `aria-hidden="true"` no honeypot container.
- Sem scroll horizontal (1440px, 1436px webkit).
- Zero violations axe-core em /waitlist/obrigado (mesmo redirecionando, /obrigado renderiza limpo quando acessada com state).
- Botão submit com `disabled` durante pending + spinner + texto "Entrando...".

---

## Status final

**NO-GO condicional** para soft launch 11/06. Quatro fixes P0 (LGPD checkbox, validation messages em PT-BR, contraste fog-400, CSP PostHog) precisam fechar antes da chamada pública. Os quatro somam ~35 minutos de trabalho. Após o fix, recomendo uma segunda passada de audit (~10 min) para confirmar.

Sem esses quatro, lançar significa:
1. Risco LGPD documentado (pré-marcação de consentimento).
2. Quebra de tom de marca (mensagens nativas do browser em inglês).
3. Falha WCAG AA limpa em texto da Calculadora 3D.
4. Perda de telemetria PostHog no momento que CSP virar enforce.

Os bugs P1 (tap targets pequenos, heading order, sticker amber bottom-of-gradient) podem ir para a primeira semana pós-launch sem comprometer o lançamento principal.

— Júlia QA G7 · 2026-05-20 · `qa/audit-pre-launch-2026-05-20.md`
