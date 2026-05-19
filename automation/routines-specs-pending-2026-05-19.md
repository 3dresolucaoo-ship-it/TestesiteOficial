# Routines pendentes — Spec manual pra CEO criar no claude.ai/code/routines

> 2026-05-19 noite — Chrome MCP travou na Routine 4 (mojibake nos acentos). Memória `feedback_chrome_mcp_claude_dashboard_trava` confirma padrão. Pivot pra spec manual.

## Status

| # | Routine | Status | Trig ID |
|---|---|---|---|
| 1 | `concorrencia-diaria-light` | ✅ Criada via Chrome MCP | `trig_01Rzym6XH1DFBkaLkPQE8ARb` |
| 2 | `concorrencia-semanal-deep` | ✅ Criada via Chrome MCP | `trig_018m8v3FW656PkVtgwz3huY8` |
| 3 | `comunidades-maker-semanal` | ✅ Criada via Chrome MCP | `trig_01RBHzDHiuVnbhW4mtwaEP3F` |
| 4 | `mercado-maker-mensal` | ⏳ Spec abaixo, CEO cria | — |
| 5 | `waitlist-funnel-diario` | ⏳ Spec abaixo, CEO cria | — |
| 6 | `anthropic-dev-tools-semanal` | ⏳ Spec abaixo, CEO cria | — |

## Como criar cada uma (você faz)

1. Abre `claude.ai/code/routines`
2. Clica **"+ Nova rotina"**
3. **Copia Nome** abaixo no campo "Nome"
4. **Copia Instruções** abaixo no campo "Instruções"
5. Seleciona repositório: **`3dresolucaoo-ship-it/TestesiteOficial`**
6. Clica **"Agendamento"** → define frequência (ver schedule)
7. Conectores: deixa default (Google Drive + Sentry + Stripe + Supabase + Vercel)
8. Clica **"Criar"**

---

## Routine 4 — `mercado-maker-mensal`

**Schedule**: Personalizado · Cron: `0 10 1-7 * 1` (1ª segunda do mês, 10h BRT)

**OU** usa "Semanal" → segunda-feira 10h e ignora 3 segundas do mês manualmente (mais simples mas roda toda segunda)

**Recomendado**: usar **Personalizado** com cron `0 10 1-7 * 1`

### Instruções (copia tudo abaixo)

```
Pesquisa profunda mensal do mercado maker 3D BR (1h execução). Deep dive macro.

Missão: atualizar dados quantitativos do mercado, influenciadores, regulamentação, tendências. Material pra Helena+Marcos analisarem mensalmente.

O que fazer (ordem):

1. TAM Brasil update:
- IMARC Group Brazil 3D Printing Market
- Grand View Research Desktop 3D Printing BR
- Statista 3D printing Brazil (se acessível)
- Manufatura Digital - Mapa Aditiva
Compare versus snapshot do mês anterior.

2. Preços máquinas BR (5 lojas):
- GTMax3D (Bambu A1, P1S, X1C, H2D)
- 3DPrime (Ender 3 V3, Creality)
- Beehive 3D (P1S)
- 3DCure (resina)
- Filamentos3DBrasil (PLA, PETG)
Detectar mudanças de preço relevantes.

3. Top 10 influenciadores growth:
- Cotrim13D (562k YT, 145k IG)
- 3D Geek Show (Murilo, 127k IG)
- 3D Print Academy (Oswaldo, 50k IG)
- Caçadores de Renda (Danilo)
- Outros mapeados
Growth rate mensal de cada (VidIQ ou SocialBlade quando possível).

4. Bambu Lab announcements:
- bambulab.com/pt-br/news
- Blog Bambu Lab oficial
Firmware, hardware, controvérsias.

5. Tributação updates:
- COSIT 97/2019 (impressão 3D = industrialização)
- Reforma Tributária EC 132/2023 updates
- MEI limites 2026

6. Hotmart top cursos "impressão 3D" crescimento.

7. MakerWorld trending categories.

8. Expo3DBR e eventos (expo3dbr.com.br).

Output: relatório markdown estruturado (max 2000 palavras):
- Diff TAM vs mês passado
- 5 mudanças relevantes de preço máquinas BR
- Top 10 influencer growth rates
- Bambu Lab eventos do mês
- Tributação updates relevantes
- 3 oportunidades novas detectadas
- 3 riscos novos detectados

Salvar em:
- g7-app/data/routine-output/mercado-maker-YYYY-MM.json
- Contextos Projetos/02 - Frentes ativas/5g - Mercado Maker 3D BR YYYY-MM-DD.md (versão mensal)

Convenção: PT-BR, zero em-dash, tom direto. Cada número precisa fonte com link.
```

---

## Routine 5 — `waitlist-funnel-diario`

**Schedule**: Diário, 08:00 BRT

### Instruções (copia tudo abaixo)

```
Digest diário matutino do funil waitlist Hayzer (10min execução).

Missão: dar ao CEO visibilidade da entrada de leads e qualidade nas últimas 24h, junto com o café da manhã.

O que fazer:

1. Query Supabase tabela waitlist_leads (último 24h):
SELECT COUNT(*) total_new,
       COUNT(*) FILTER (WHERE step = 2) completed_step_2,
       utm_source,
       COUNT(*) per_source
FROM waitlist_leads
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY utm_source;

2. Calcular:
- Total leads novos último dia
- % que completou etapa 2 (qualidade)
- Breakdown UTM source (LinkedIn, WhatsApp, organic, direct, etc)
- Comparação vs média últimos 7 dias (tendência alta/baixa)
- Tempo médio entre step 1 e step 2

3. Acumulado:
- Total waitlist atual
- Crescimento últimos 7 dias
- Top 3 UTMs no acumulado

4. Output esperado (max 300 palavras):
Digest formatado:

📊 WAITLIST DIGEST · DD/MM
─────────────────────────
Hoje: X leads (Y completaram etapa 2 = Z%)
Acumulado: T leads totais
Crescimento 7d: +N%

UTM source:
- linkedin: X (Y%)
- whatsapp: X (Y%)
- organic: X (Y%)
- direct: X (Y%)

Tendência: ↑ alta / → estável / ↓ baixa vs média 7d

Ação recomendada (se houver):
- (ex: "spike de leads orgânicos hoje, vale post novo")
- (ex: "nenhum lead de LinkedIn em 3 dias, retomar")

Salvar em:
- g7-app/data/routine-output/waitlist-funnel-YYYY-MM-DD.json
- Contextos Projetos/07 - Métricas/_Dashboard waitlist.md (append do dia, manter últimos 30)

Convenção: PT-BR, zero em-dash, tom direto, conciso.
```

**Variáveis de ambiente necessárias** (setar no dashboard Anthropic):
- `SUPABASE_URL`: pegar de Vercel env
- `SUPABASE_SERVICE_ROLE_KEY`: pegar de Vercel env (já existe lá)

---

## Routine 6 — `anthropic-dev-tools-semanal`

**Schedule**: Semanal, sexta-feira 18:00 BRT

### Instruções (copia tudo abaixo)

```
Acompanhamento semanal Anthropic + dev tools (20min execução).

Missão: detectar novidades Claude/Anthropic + ferramentas dev pra adotar proativamente. Memória CEO: feedback_buscar_novidades_anthropic_proativamente.

O que fazer:

1. Anthropic changelog:
- https://www.anthropic.com/news
- https://docs.anthropic.com/en/release-notes/api
- https://docs.claude.com/en/release-notes/claude-code
- claude.ai/changelog (se acessível)

2. Claude Code novas features:
- Routines, Skills, MCPs novos
- Updates SDK
- Updates dashboard

3. Skills marketplace:
- github.com/anthropics/skills (releases)
- forrestchang/andrej-karpathy-skills (novidades)
- Skills mencionadas em alphasignal.ai, latent.space

4. Concorrentes dev tools updates (Cursor, Aider, Codex, Devin):
- changelog/blog deles esta semana
- features novas relevantes

5. YouTube BR dev tools:
- Alessandro Varela (canal)
- Tropic Hub
- Eli Rigobeli
- Maestros da IA
- Matheus Battisti (Hora de Codar)
Top 3 vídeos da semana sobre AI dev tools.

6. Twitter/X feeds (Karpathy, Simon Willison, Andrew Karpathy, AnthropicAI).

Output (max 500 palavras):
- 3 novidades Anthropic relevantes pra Hayzer
- 2 dev tools concorrentes com feature interessante
- TOP 2 ações recomendadas pra adotar OU "nada relevante esta semana"

Salvar em:
- g7-app/data/routine-output/anthropic-dev-tools-YYYY-MM-DD.json
- Contextos Projetos/14 - Anthropic + Dev Tools/_Changelog acompanhado.md (append)

Convenção: PT-BR, zero em-dash, tom direto.
```

---

## Conectores (todas as 6 routines)

Default Claude Code já vem com 5: **Google Drive, Sentry, Stripe, Supabase, Vercel**.

⚠️ **Aviso**: Routines 2 e 3 estão aparecendo com só "Google Drive" no display após criação. Pode ser display incompleto OU conectores Sentry/Stripe/Supabase/Vercel realmente sumiram. **Verificar manualmente cada Routine após criar** clicando nela e conferindo aba "Conectores 5".

Se sumir, adicionar via UI: clicar "+ Adicionar conector" e marcar os 4 que faltam.

---

## Histórico

- 2026-05-19 noite — Operação hardwork. Chrome MCP criou 3/6 routines. Pivot pra spec manual nas 3 restantes (mojibake + form reset no claude.ai). CEO cria com copia/cola.
- Próxima validação: amanhã 8h verificar se Routines rodaram (Routine 2 deve rodar HOJE 22h, Routine 1 idem).
