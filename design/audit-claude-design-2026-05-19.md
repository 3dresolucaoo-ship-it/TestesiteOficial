# Audit: Design System Hayzer no claude.ai/design (Task C)

> **Data**: 2026-05-19 (madrugada)
> **Operador**: Claude (eu) via Chrome MCP
> **Status do audit**: ⚠️ **CHROME MCP TRAVOU NO 2º CLIQUE — PIVOT PRA SPEC MANUAL**

---

## 1. Estado real (verificado ao vivo)

**Achado #1 — Existe apenas 1 Design System na conta** chamado **"Design System"** (label "Default"). URL: `https://claude.ai/design/p/9dc76a67-a1eb-4fa3-8af3-67f9d0ad4f9b`.

**Achado #2 — A memória estava errada sobre a data**. A memória `reference_claude_design_workflow.md` (salva 2026-05-18) afirmava: "CEO já tem Design System 'Default' criado em 20/04 — auditar drift". Verificação ao vivo mostrou que o card aparece como **"Your design · Today"** (criado HOJE, 19/05). Ou foi recriado, ou a data 20/04 era estimativa errada.

**Achado #3 — O Design System está com setup INCOMPLETO**. Ao abrir a página do Design System, aparece o formulário de configuração inicial:

```
heading "Set up your design system"
generic "Tell us about your company and attach any design resources you have."

generic "Company name and blurb"
textbox placeholder="e.g. Mission Impastabowl: fast-casual pasta restaurant..."

heading "Provide examples of your design system and products (all optional)"
- Link code on GitHub (github.com/owner/repo)
- Link code from your computer (drag folder)
- Upload a .fig file
- Add fonts, logos and assets
- Any other notes?
```

**Os campos estão vazios.** Nenhum nome de empresa, nenhum repo GitHub, nenhum fig, nenhuma fonte/logo, nenhuma nota.

---

## 2. Implicação prática

**Drift vs `globals.css` = 100%.** Não há nada configurado no Claude Design pra comparar com o código real do Hayzer (paleta night+petrol+ember, Fraunces serif, Geist sans, glow petrol, raízes SVG, etc).

**Não dá pra "auditar drift"** porque não existe um lado pra comparar. O que existe é uma oportunidade: **configurar o Design System direito agora, antes de gerar Prototypes**.

---

## 3. O que deveria estar lá (input pra config futura)

Quando CEO (ou eu via Chrome MCP) for configurar o Design System Hayzer, os inputs precisam ser:

### Campo "Company name and blurb"
```
Hayzer — SaaS pra maker 3D brasileiro. 
Hub financeiro + estoque + pedidos + impressão em uma plataforma. 
Foco vertical maker 3D (Rafael persona). Paleta night+petrol+ember, 
Fraunces serif na marca, Geist sans operacional.
```

### Campo "Link code on GitHub"
```
https://github.com/3dresolucaoo-ship-it/TestesiteOficial
```
**Atenção**: GitHub não está conectado (aparece "Connect GitHub to continue"). CEO precisa autorizar OAuth GitHub no Claude Design primeiro.

### Campo "Add fonts, logos and assets"
- `public/logo-hayzer.png` (H + raízes orgânicas, congelada via ADR-013)
- Fontes via Google Fonts: Fraunces variable + Geist sans/mono
- Paleta (notas):
  - night `#0B0F12` (canvas)
  - petrol `#0E5E5C` (CTA, brand)
  - ember `#D97757` (accent, glow)
  - fog `#9CA3AF` (muted)
  - light grain SVG overlay (10% opacity)

### Campo "Any other notes?"
```
Princípios:
- Fraunces serif ≤15% (apenas marca/pausa) + Geist sans 85% (operacional)
- ZERO em-dash em copy (memória feedback_zero_em_dash)
- Anti-IA aesthetic: sem gradientes roxos, sem AI clichés ("Elevate", "Seamless"), 
  sem rounded-full em containers grandes
- Tom PT-BR formal em textos instrucionais ("para", não "pra/pro")
- Logo H + raízes orgânicas verdes em fundo escuro com mix-blend-screen

Inspirações:
- Linear (typography)
- Vercel (negative space)
- Stripe (forms/inputs)
- Notion (cards/bento)
- Editorial/Apple-design (Fraunces hero)

Referências internas:
- mockups/orders-v4-tom-novo.html (aprovado pelo CEO 18/05)
- components/visual-library/ (9 componentes prontos)
- brand/BRIEF.md (consolidado)
- design/visual-library-catalog.md (15 elementos catalogados)
```

---

## 4. Recomendação concreta

**Próxima ação**: configurar o Design System Hayzer no claude.ai/design com os inputs acima.

**Quem opera**: posso operar via Chrome MCP, mas:
- ⚠️ Risco: Chrome MCP TRAVOU nesta sessão no 2º clique (renderer freeze, CDP timeout 30s). Memória `feedback_chrome_mcp_claude_dashboard_trava` confirma padrão. claude.ai (Anthropic) tem proteção anti-bot agressiva.
- 💡 Plan B: CEO operar manualmente (5-10 min), colando os inputs acima. Eu acompanho via Chrome MCP só pra ver o resultado final (screenshot do Design System configurado).

**Sem essa config**, gerar Prototypes via Claude Design vai produzir mockups genéricos que não refletem o brand Hayzer (sem night+petrol+ember, sem Fraunces, sem grain). Investimento de ~5min de setup retorna 100% de coerência nos prototypes futuros.

---

## 5. Lições aprendidas (atualizar memórias)

1. **Memória estava errada sobre a data de criação** ("20/04"). Atualizar `reference_claude_design_workflow.md` com fato real ("criado 19/05, setup vazio, drift impossível de medir até configurar").

2. **Chrome MCP no claude.ai trava de fato** — confirmado nesta sessão. 1ª tentativa (read_page) OK, 2ª tentativa (screenshot após click no card) timeout 30s. Memória `feedback_chrome_mcp_claude_dashboard_trava` já estava certa — não insistir após 2 falhas.

3. **"Auditar X" precisa ter X existindo** — antes de auditar drift, verificar se há algo do outro lado. Se vazio, pivot pra "configurar X" em vez de "auditar X".

---

## 6. Bloqueio Figma + GitHub (informativo)

A página de setup mostra 2 alertas:

```
"Connect Figma to continue — You attached a Figma link, but Figma isn't connected yet."
"Connect GitHub to continue — You attached a GitHub repo, but GitHub isn't connected yet."
```

Significa que o setup espera (ou aceita opcionalmente) integração com Figma e GitHub. CEO pode:
- **Skip** ambos (configurar só com fonts/logos/notes — mais simples)
- **Conectar GitHub** pro Claude Design ler o repo (ler `globals.css` + componentes reais, gerar Design System mais fiel)
- **Conectar Figma** se houver protótipo Figma (não há no Hayzer hoje)

Recomendação: **conectar GitHub** + skip Figma. Claude Design lê o código real e gera tokens fiel ao `globals.css` atual. Risco: GitHub OAuth scope (read-only suficiente, não pode escrever).

---

## Histórico

- 2026-05-19 madrugada — Audit Task C executado via Chrome MCP, Chrome travou no 2º clique, pivot pra spec manual completa.
- Memória `reference_claude_design_workflow.md` precisa update (fato corrigido sobre data de criação).
- CEO decide se configura manualmente ou se eu re-tento via Chrome MCP em sessão futura.
