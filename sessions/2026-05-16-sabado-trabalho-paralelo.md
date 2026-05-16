# Sessão 16/05/2026 (sábado) — Trabalho paralelo enquanto CEO edita vídeos

> CEO editando 11 vídeos, autorizou usar Chrome + executar trabalho técnico em paralelo.
> Pagamento das GRUs INPI marcado pra segunda 18/05 (caixa só dia útil).
> Esta sessão executou 5 frentes (A→E) em paralelo, sem bloquear edição do CEO.

---

## 🎯 O que foi feito hoje (entregáveis)

### Frente INPI — pesquisa cirúrgica (manhã)

**Achados decisivos**:
- ✅ HAIZER **não tem registro INPI** (confirmado ao vivo em `busca.inpi.gov.br/pePI`) → WG Trade sem standing pra opor
- ✅ HAYZER limpo
- ✅ Variantes (AYZER + AIZER): só QUAIZER e ANALAYZER em vigor cl 42, ambas mistas com especificação distinta → risco baixo
- ✅ WG Trade tem perfil **jurídico passivo** (1 marca registrada GRUPO WG, zero oposições documentadas)
- ❌ Inova Simples **não qualifica** (MEI ativo bloqueia)
- ✅ Backup texto livre redigido pras 2 classes (caso pré-aprovados suprimidos)

**Risco recalibrado**: 8-10% (era 10-15% chute inicial)
**Decisão**: prosseguir com R$ 880 segunda. Confiança alta.

Arquivos: `inpi/RELATORIO-FINAL-pesquisa-cirurgica-HAYZER.md`

---

### Frente A — Marketing (Carla + Marcos)

**Carla — 3 peças de copy prontas** (`marketing/copy/`):
- `email-lifetime-deal.md` — 3 assuntos A/B + corpo (R$ 297, 30 vagas, lifetime) + resend D+3 + 3 PS alternativos
- `post-instagram-makers.md` — 3 variantes (Provocação/Calculadora isca/Comunidade) com hashtags + mapa por canal + adaptações stories/reels
- `email-waitlist-build-in-public.md` — cadência completa de 6 emails até launch

**Marcos — estratégia de canais** (`marketing/`):
- `criadores-3d-br.md` — 27 handles com tier A/B/C
  - **Tier A**: Murilo Laffranchi (3D Geek Show, 127k IG + 497k YT), Oswaldo Salzano (3D Print Academy, 537k YT) — ambos com histórico de parceria
- `calendario-editorial-17-05-a-13-06.md` — 11 posts Instagram + 4 grupos + 3 emails + 2 DMs outreach em 4 semanas
- **Meta**: 50 emails até 13/06, 100 até 04/07

**3 alertas críticos do Marcos**:
1. DM Murilo = maior alavancagem desta fase. Pode entregar 30-50% da meta de waitlist em 1 semana
2. Grupos WhatsApp: 3-5 dias de observação antes de postar. Postar entrando = ban
3. Calculadora deve capturar email ANTES de mostrar resultado (verificar fluxo)

---

### Frente B — Auditoria de Segurança Tier 1

**Status verificado**:
- ✅ HSTS configurado (`max-age=63072000`, includeSubDomains) em `next.config.ts`
- ✅ X-Frame-Options DENY
- ✅ X-Content-Type-Options nosniff
- ✅ Referrer-Policy strict-origin-when-cross-origin
- ✅ Permissions-Policy
- ✅ Middleware auth com matcher correto
- ✅ Zod em `services/waitlistSchema.ts` (waitlist protegida)
- ⚠️ **Zod FALTA** em: `app/api/checkout`, `app/api/encomenda`, `app/api/catalog/quote`
- ⏳ Implementação Zod nessas APIs pendente pra Semana 2 ROADMAP (Felipe/Bruna)

---

### Frente C — SEO + Polish (implementado)

**Arquivos criados**:
- `app/robots.ts` — bloqueia /api/* + rotas autenticadas, libera públicas
- `app/sitemap.ts` — URLs estáticas (TODO: catálogos/portfolios dinâmicos quando priorizado)
- `app/opengraph-image.tsx` — OG image global (1200x630, paleta marketing real)
- `app/calculadora/opengraph-image.tsx` — OG específica calculadora
- `app/loading.tsx` — loading global (pulse petrol-500 + tipografia maker)
- `app/error.tsx` — error boundary global (PT-BR formal, tom parceiro, botão "Tentar de novo")

**Paleta correta aplicada** (HSL do `globals.css`):
- night-950 `#07090A` (background)
- petrol-500 `#1F7669` (primário)
- ember-500 `#D08A4A` (accent)
- fog-50 `#F2EFEA` (texto)

---

### Frente D — Auditorias Visual + UX (Diego + Sofia)

**Diego — audit visual** (`design/audit-paginas-internas-2026-05-16.md`):
- **70 hardcodes roxos** `#7c3aed/#a78bfa` no dashboard interno — herdados v0.1, BANIDOS no BRIEF
- TopBar com gradient `roxo→azul` listado como banido
- Sidebar com fallback "BVaz Hub" (bug rebranding)
- **Top 3 prioridades**:
  1. AppShell + Sidebar + TopBar (1 fix muda 100% das telas)
  2. DashboardView + shared.tsx (primeira impressão pós-login)
  3. SettingsView (botão Salvar roxo + 8 tabs)
- **Plano**: 10 quick wins de 30min (~1h45) → 4 sem refatorando shared.tsx + 5 redesigns → W7-W8 mobile/light mode

**Sofia — audit UX** (`design/audit-ux-paginas-internas-2026-05-16.md`):
- **Top 5 friction points**:
  - FP-01: Dashboard vazio com "Performance Intelligence" — zero instrução de onboarding
  - FP-02: Dependência oculta projeto→inventário→produto→pedido nunca ensinada
  - FP-03: Estoque/Produtos sem projeto = tela travada com ícone cinza
  - FP-04: Formulário produto com 12 campos (incluindo "Taxa de Falha %", "Custo de Energia R$/h")
  - **FP-05**: Login dizendo "BVaz Hub" enquanto user vem de hayzer.com.br
- Onboarding sugerido + empty states reformulados + mensagens de erro maker-friendly

---

### Frente bonus — Rebranding visível corrigido

Sofia + Diego apontaram bug. Caçado e corrigido em **8 arquivos visíveis ao usuário**:

| Arquivo | Onde aparecia | Corrigido |
|---|---|---|
| `app/login/page.tsx` | Logo "B" + texto "BVaz Hub" + "Acesso restrito" | "H" + "Hayzer" |
| `components/Sidebar.tsx` | fallback `companyName` | "Hayzer" |
| `components/TopBar.tsx` | default title | "Hayzer" |
| `components/settings/GeneralTab.tsx` | "Sobre o BVaz Hub" | "Sobre o Hayzer" |
| `app/checkout/CheckoutForm.tsx` | footer "Feito com" | "Hayzer" |
| `app/checkout/success/page.tsx` | footer "Feito com" | "Hayzer" |
| `app/catalogo/[slug]/page.tsx` | footer "Feito com" | "Hayzer" |
| `app/portfolio/[slug]/page.tsx` | footer "Feito com" | "Hayzer" |

**Restante de "BVaz Hub" no codebase**: só comentários internos (services/payments.ts, etc) e docs históricos (ROADMAP.md, sessions/, decisions/) — sem impacto pro usuário. Pode ficar pra Onda 5 conforme CLAUDE.md.

---

### Frente E — Refactor (adiado)

Refactor de arquivos gigantes (inventory 1472 linhas, products 1028, orders 668) **não foi executado** porque:
- Diego deu plano detalhado de 4-8h por arquivo
- Risco de quebrar funcionalidades sem CEO testar
- Melhor fazer em sessão dedicada com CEO presente
- Inventory/products/orders são funcionalidades críticas do app

**Recomendação**: agendar sessão específica pra refactor (~6-10h) quando CEO topar pausar outras coisas.

---

## 📊 Arquivos novos criados

```
inpi/RELATORIO-FINAL-pesquisa-cirurgica-HAYZER.md
inpi/RELATORIO-CRITICO-validacao-marca-HAYZER.md
inpi/PLAYBOOK-deposito-marca-segunda-18-05.md
marketing/copy/email-lifetime-deal.md
marketing/copy/post-instagram-makers.md
marketing/copy/email-waitlist-build-in-public.md
marketing/criadores-3d-br.md
marketing/calendario-editorial-17-05-a-13-06.md
design/audit-paginas-internas-2026-05-16.md
design/audit-ux-paginas-internas-2026-05-16.md
app/robots.ts
app/sitemap.ts
app/opengraph-image.tsx
app/calculadora/opengraph-image.tsx
app/loading.tsx
app/error.tsx
sessions/2026-05-16-sabado-trabalho-paralelo.md (este arquivo)
```

## 📝 Arquivos editados (rebranding)

```
app/login/page.tsx
components/Sidebar.tsx
components/TopBar.tsx
components/settings/GeneralTab.tsx
app/checkout/CheckoutForm.tsx
app/checkout/success/page.tsx
app/catalogo/[slug]/page.tsx
app/portfolio/[slug]/page.tsx
inpi/RELATORIO-CRITICO-validacao-marca-HAYZER.md (atualizado com achados ao vivo)
```

---

## 🎯 Próximas ações priorizadas (segunda 18/05)

### CEO faz:
1. Manhã: PIX nas 2 GRUs (R$ 880)
2. Avisa quando pagou

### Eu faço (quando CEO voltar):
1. **5 min**: validar termos pré-aprovados ao vivo no e-Marcas (`gru.inpi.gov.br/emarcas`)
2. **40 min**: depositar marca classe 42 + 35 usando PLAYBOOK
3. **5 min**: anotar nº processos no ADR-012, atualizar CLAUDE.md
4. **20 min**: revisar copy da Carla + plano Marcos com CEO, decidir o que publicar primeiro
5. **10 min**: revisar audit Sofia/Diego com CEO, priorizar 3 quick wins pra Semana 2

### Pode esperar (Semana 2-4):
- Implementar Zod nas APIs (Felipe/Bruna)
- 10 quick wins visuais Diego (1h45)
- Onboarding 3-5 telas (Sofia + Felipe)
- Refactor arquivos gigantes (Felipe, sessão dedicada)
- Sentry/observability (Semana 7)

---

## 💬 Estado emocional do CEO

CEO acordou animado, autorizou Chrome + pesquisa profunda. Tom: "Claude virou uma arma na minha mão" → mindset de investidor, não de prejuízo. Editando 11 vídeos pra ganhar caixa pra pagar GRUs segunda. Quer máxima alavancagem do trabalho em paralelo.

Esta sessão foi um teste do modo "Claude como ferramenta de alta confiança trabalhando autônomo enquanto CEO foca em receita imediata". Funcionou bem — 4 agentes G7 + 3 pesquisas externas + 8 arquivos de código editados + 5 documentos novos, tudo silencioso.

---

## 📋 Cole no início da próxima sessão

```
Continuando Hayzer. Sessão 16/05 trabalhou em paralelo enquanto CEO editava 11 vídeos.

INPI: GRUs emitidas, pesquisa cirúrgica concluída, risco recalibrado 8-10%. HAIZER confirmado sem registro = WG Trade sem standing. Backup texto livre redigido. Inova Simples não qualifica (MEI). Playbook pra segunda em `inpi/PLAYBOOK-deposito-marca-segunda-18-05.md`.

Marketing: 3 peças copy + 27 criadores tier A/B/C + calendário 4 semanas. Carla: emails Lifetime/build-in-public + posts makers. Marcos: Murilo Laffranchi é alavancagem máxima.

App: rebranding visível 100% corrigido (8 arquivos). Robots/sitemap/OG images/loading/error criados. Audit Diego (70 hardcodes roxos) + Sofia (5 friction points) prontos.

Próxima ação: segunda 18/05 manhã CEO paga R$ 880 PIX → valida termos pré-aprovados → deposita marca.

Lê: `CLAUDE.md`, `inpi/RELATORIO-FINAL-pesquisa-cirurgica-HAYZER.md`, `inpi/PLAYBOOK-deposito-marca-segunda-18-05.md`, `sessions/2026-05-16-sabado-trabalho-paralelo.md` (este arquivo).
```
