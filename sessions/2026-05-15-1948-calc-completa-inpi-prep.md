# Sessão 15/05/2026 (manhã→19:48) — Calculadora 3D completa + Resend us-east-1 + UI obrigado + INPI prep

> Snapshot imutável. Continuação da sessão maratona 14-15/05.
> Cole o bloco "Pra continuar depois do /clear" no início da próxima sessão.

## 🎯 Tema da sessão

Destravar Fase 1 pré-launch: rotacionar/recriar Resend, polir UI da `/waitlist/obrigado`, e construir **Calculadora 3D completa** (`/calculadora`) como lead magnet diferenciado pra puxar waitlist.

## ⏱️ Duração

~10h ativas. Manhã (Resend us-east-1 + rotação API key + Speed Insights + teste fim-a-fim) → tarde (fixes UI /obrigado) → tarde-noite (Calculadora 3D V1 → V2 com tabela canais → V3 com Phosphor + slider + dropdown) → noite (PT-BR formal + renomear /rc→/rcs + pesquisa INPI 2026).

## ✅ Entregas

1. **Resend us-east-1 destravado** — domain sa-east-1 estava pending 18h+. Recriado via API em us-east-1. DKIM + MX trocados no Registro.br via Chrome MCP. **Verified em 30s.** (commit auto-session)
2. **RESEND_API_KEY rotacionada** — `hayzer-prod-v2` ativa em prod, velha deletada via API. Vercel env var atualizada via Chrome MCP.
3. **Speed Insights confirmado ativo** — slug do team estava errado (`ship-its-projects` vs `5027s-projects`), por isso aparecia 404. Já estava habilitado.
4. **Teste fim-a-fim waitlist em prod** — `teste-rotacao-v2@hayzer-test.com` cadastrou OK. Lead salvou no DB. Zero warnings nos logs Vercel. Welcome email saiu com nova key.
5. **Fix UI /waitlist/obrigado** (commits `7b4bf7e` `6746c0e` `7525a55` `5f2aa15` `5619224`):
   - Dropdown selects nativos: `color-scheme: dark` no CSS força tema escuro no dropdown nativo (era branco no Windows)
   - Emoji 🥳 antes + 🎉 depois de "Você entrou"
   - Texto: "Mandei a confirmação **para o email:** X" (era "pra")
   - WhatsApp CTA mais brilhante: gradient verde + glow externo 40px via inline style (Tailwind 4 não compila `shadow-[..., ...]` arbitrary com vírgula)
   - Grain texture no fundo da `/obrigado` (consistência com landing)
   - Step2Form card destacado via **utility `.surface-strong`** nova no `globals.css` (bg-card/30 retornava transparente — bug Tailwind 4 latente)
6. **Calculadora 3D Fase 1 completa em prod** (`hayzer.com.br/calculadora`):
   - Base: 5 inputs (filamento R$/kg, peso g, tempo h, consumo W, margem %) + 3 outputs (custo, lucro, preço sugerido). Cálculo client-side. Defaults sensatos PLA R$110, 100g, 3h, 150W, 50%. (commit `dc89576`)
   - Layout split desktop + stack mobile. Sticky output em desktop.
   - Fix middleware + LayoutSwitch pra `/calculadora` ser pública (commits `60230e2`).
   - CTA waitlist ember brilhante (Diego: glow duplo 24px + 40px outer halo, microcopy "Quero o Hayzer antes"). Container CTA com watermark "preço justo." atrás. (commit `243ea66`)
   - **Tabela "preço por canal de venda"** — diferencial vs concorrentes (Custos3D, MakerFlow, 3D Prime). 5 canais BR: WhatsApp 0%, ML 12%, Shopee 14%, Amazon 15%, Americanas 16.5%. **Gross-up correto** `preço/(1-comissão/100)` — não `preço*(1+comissão)` que erra. WhatsApp destacado com inset border-left petrol + badge "melhor margem". (commit `b32ae64`)
   - **Bug input não apagava 0** — state mudado de number pra string + `onFocus={e => e.target.select()}` (commit `79ef5bc`)
   - **UX intuitivo V2** (commit `da2f879`): ícones contextuais por campo + presets chips + semáforo de margem + pulse no preço + helpers reescritos "dá solução" + microcopy zero-dúvida + botão "Copiar pro cliente" + frase de conexão pós-tabela (Marcos red flag #7 "lead magnet desconectado").
   - **Fix copy + presets removidos** (commit `cafda20`): CEO discordou — copiar só o valor (não texto inteiro) + remover chips presets (poluição visual antes dos inputs).
   - **Phosphor Icons duotone** (commit `ade4516`): substituiu lucide-react. Disc (filamento), Cube (peça), Hourglass, Plug, TrendUp, WhatsappLogo, ShoppingCart, Storefront. Pacote `@phosphor-icons/react` instalado.
   - **Slider de margem + dropdown impressora** (commit `bb33984`):
     - Slider 0-200% com `accent-color` que muda conforme semáforo (verde/âmbar/vermelho)
     - Labels "0% prejuízo / 50% saudável / 200% premium" abaixo do slider
     - Input número combo (w-32) sincronizado pra valor exato
     - Dropdown com 8 modelos comuns BR (Ender 3 V2 80W / Bambu A1 100W / P1S 150W / X1C 250W / Creality K1 200W / Anycubic Kobra 130W / Prusa MK4 120W) que pré-preenche W ao escolher
7. **PT-BR formal em textos instrucionais** (commit `d1090ef`): 11 trocas de "pra/pro/tá" por "para/está" em textos visíveis (semáforo, helpers, botão, subtitles). Mantido tom maker BR autêntico em copy de marca.
8. **Slash command renomeado** `/rc` → `/rcs` (conflito com comando interno). Conteúdo reforçado pra entregar SEMPRE bloco copiável no fim do output.
9. **Memories persistentes salvas**:
   - `feedback_risco_solucao.md` — risco vem com solução, custo, próxima ação
   - `feedback_consultar_g7.md` — chamar agente G7 ANTES de feature de marketing/visual/estratégia
10. **Pesquisa INPI 2026 atualizada** (external-researcher): taxa unificada desde set/2025. R$ 440/classe PF/MEI/ME/EPP, R$ 880/classe PJ. Cobre depósito + concessão + 10 anos. URLs corretas: cadastro `gov.br/inpi/pt-br/cadastro-no-e-inpi`, GRU `meu.inpi.gov.br/pag/`, e-Marcas `marcas.inpi.gov.br/emarcas/`. Recomendação: nominativa "HAYZER" nas classes 35 + 42, lista pré-aprovada (código GRU 389). Total ~R$ 880 como PF/MEI.

## 🔴 Blockers / Pendências críticas

- **B (INPI)**: aguardando CEO escolher PF/MEI + se tem cadastro e-INPI. Eu guio via Chrome MCP no gov.br quando ele responder.
- **C (Post canais maker 3D)**: plano revisado pelo Marcos pronto (LinkedIn é #7, não #1). Prioridade: grupos WhatsApp SP/MG/PR + Instagram nicho + DM Murilo Laffranchi. Aguarda CEO ativar.
- **Rotacionar SUPABASE_SERVICE_ROLE_KEY**: adiada pra janela noturna (Reset JWT causa 2-5min downtime).

## 📐 Decisões registradas (ADRs)

Não houve ADR novo formal nesta sessão (last: ADR-011 RLS+RETURNING de manhã). Decisões menores documentadas inline no CLAUDE.md raiz e memories.

## 📦 Commits

```
62800f2 auto: claude session changes
0a96cbc auto: claude session changes
d1090ef fix(copy): corrige portugues coloquial 'pra/pro/ta' em textos visiveis
bb33984 feat(calculadora): slider de margem + dropdown impressora
ade4516 feat(calculadora): substitui icones lucide por Phosphor Icons duotone
cafda20 fix(calculadora): remove presets chips + copia so o valor
da2f879 feat(calculadora): UX intuitivo - icones contextuais + presets + semaforo + copy WhatsApp
79ef5bc fix(calculadora): inputs numéricos não conseguiam apagar o 0
b32ae64 feat(calculadora): tabela 'preco por canal' - diferencial vs concorrentes
243ea66 feat(calculadora): CTA chamativo + audit visual completa (Diego)
60230e2 fix(layout): adiciona /calculadora em MARKETING_PATHS
dc89576 feat(calculadora): lead magnet calculadora de custo de impressao 3D
5619224 fix(step2form): da peso ao card via .surface-strong (bg-card/30 sumia)
5f2aa15 fix(wpp-cta): glow via inline style (Tailwind 4 nao compila shadow-[...])
7525a55 fix(obrigado): texto email + WhatsApp brilhante + grain no fundo
6746c0e fix(obrigado): adiciona emoji 🥳 antes do "Voce entrou"
7b4bf7e fix(landing): dark scheme em <select> + bg solido + emoji no obrigado
```

## 🔐 Itens de segurança a lembrar

- **RESEND_API_KEY**: rotacionada ✅ (v2 `hayzer-prod-v2` ativa, antiga deletada)
- **SUPABASE_SERVICE_ROLE_KEY**: adiada pra janela noturna (Reset JWT do Supabase invalida anon + service_role juntos, causando downtime 2-5min até atualizar 2 env vars no Vercel + redeploy)
- **RESEND_API_KEY antiga** (re_dC5mthxm_...) — apareceu em commits/snapshot anterior, mas já está DELETADA via API. Não pode ser usada.

## 🚀 Próximas ações (priorizadas)

1. **B — INPI HAYZER**: CEO responde PF/MEI + se tem cadastro e-INPI, eu guio Chrome MCP. ~30-45min ativo + cartão (R$ 880).
2. **C — Post canais maker 3D**: depois do INPI (proteção legal). Carla escreve copy + Marcos define canal + CEO publica.
3. **Rotacionar SUPABASE_SERVICE_ROLE_KEY**: janela noturna.
4. **Fase 2 Calculadora** (futuro, semana 2-3):
   - URL com params (`?peso=200&horas=3...`) pra compartilhamento de resultado
   - OG image dinâmica via `next/og` (preview rich no WhatsApp/LinkedIn)
   - Event tracking `calc_page_view / first_input / result_seen / table_scroll / interaction_depth / cta_click` (Vercel Analytics custom events)
   - Sticky CTA bottom dinâmico após 4+ interações (sinal alta intenção, Marcos)
   - Aplicar `.surface-strong` em outros cards afetados pelo bug Tailwind 4
5. **Marketing — pré-divulgação calc**: CEO testa com Héquison + Falconi privadamente, povoa grupo Hayzer Beta com 5-10 contatos diretos antes de divulgar amplamente (Marcos red flag #2).

## 👥 Agentes G7 envolvidos

- **Diego** (designer): 2 rodadas — (1) audit visual da calc V1 com 3 opções de CTA + 5 melhorias prioritárias + spec da tabela canais; (2) ícones intuitivos + dinamismo (semáforo + pulse + presets) + bug iOS 16px
- **Carla** (copy): copy da calc V1 + copy da tabela "preço por canal"
- **Marcos** (marketing): canais reais maker 3D BR 2026 (descobriu 3 concorrentes diretos: Custos3D, MakerFlow, 3D Prime) + plano divulgação revisado sem LinkedIn como #1 + métricas conversão + viralização + red flag "lead magnet desconectado" + comissões marketplace 2026
- **Sofia** (CS): UX leigo (5 dúvidas reais maker) + helpers "dá solução" + empty states + microcopy zero-dúvida + botão "Copiar pro cliente"
- **external-researcher**: INPI 2026 atualizado (taxa unificada set/2025, R$ 440/classe PF, fluxo e-Marcas atual, especificação Nice classes 35/42)

## 🧠 Aprendizados técnicos

1. **Tailwind 4 bug latente — `bg-X/Y` arbitrary retorna transparente.** Quando token é HSL split (ex: `--card: 200 11% 6%`), classes `bg-card/30` e similares computam como `rgba(0,0,0,0)`. Workaround: inline style com `hsl(var(--card) / 0.6)` OU utility class no globals.css.
2. **Tailwind 4 não compila `shadow-[v1, v2]` arbitrary com vírgula** — usar inline style + onMouseEnter/Leave pra hover.
3. **iOS zoom em inputs <16px** — input precisa `text-[16px]` mínimo + `h-12` ou similar. Diego pegou, eu não tinha.
4. **Input controlled bug "não apaga 0"** — `parseFloat("")` = NaN → meu código setava 0 → preso. Fix: state como **string** + `onFocus={e => e.target.select()}`.
5. **`color-scheme: dark` no `<select>`** força browser usar tema escuro no dropdown nativo (era branco no Windows).
6. **Resend AWS SES sa-east-1 é menos ativo que us-east-1.** Quando travar pending >24h, deletar + recriar em us-east-1 resolve em 30s.
7. **Vercel session redirect tricky** — slug do team na URL pode estar errado e mascarado como 404 (`bvaz-hub/speed-insights` vs `bvaz-hub/observability`).
8. **LayoutSwitch separado do middleware** — `MARKETING_PATHS` precisa do path tbm pra rota pública não cair em AppShell dashboard quando user logado.
9. **INPI mudou em set/2025** — taxa unificada. Não tem mais "depósito + concessão" em 2 GRUs. Agora 1 GRU cobre tudo + 10 anos.
10. **LinkedIn é canal #7 pra maker 3D BR, não #1** — Marcos pegou meu viés. Real: grupos WhatsApp por estado (impressao3dbrasil.com.br tem links) + Instagram nicho + DM criadores (Murilo Laffranchi 580k cross-platform).

---

## 📋 Pra continuar depois do /clear

(Cole o bloco abaixo no início da próxima sessão.)
