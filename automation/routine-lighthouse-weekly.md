# Routine: lighthouse-weekly-audit

> Spec pra Routine Claude Code dashboard. CEO cria via UI seguindo spec abaixo.

## Objetivo

Rodar Lighthouse semanal em `hayzer.com.br` e gerar relatorio comparativo com semana anterior. Detectar regressoes de performance antes de chegar em prod relevante.

## Schedule

- **Quando**: Segunda 9h BRT (apos pillars-review-semanal, que tambem roda 9h)
- **Frequencia**: 1x/semana
- **Janela**: ~10-15min de execucao

## Trigger

Cron expression: `0 12 * * 1` (12h UTC = 9h BRT segunda)

## Prompt da Routine

```
Roda audit Lighthouse semanal de hayzer.com.br e compara com semana anterior.

Passos:
1. Executa Lighthouse mobile (default) em https://hayzer.com.br via npx -y lighthouse
2. Extrai scores: performance, accessibility, best-practices, seo
3. Extrai Core Web Vitals: LCP, FCP, CLS, TBT, SI
4. Compara com snapshot da semana anterior em monitoring/lighthouse/SEMANA-N-1.json
5. Salva snapshot atual em monitoring/lighthouse/YYYY-MM-DD.json
6. Gera relatorio em monitoring/lighthouse/relatorio-YYYY-MM-DD.md com:
   - Tabela: metrica | semana ant | atual | delta | status (verde/amarelo/vermelho)
   - Top 5 audits que pioraram (se houver)
   - Top 5 audits que melhoraram (se houver)
   - Recomendacao acionavel (se algum score caiu >5 pontos)
7. Se algum score critico cair >10 pontos OU LCP >5s OU TBT >5s: postar alerta no Discord webhook #critico
8. Caso contrario: postar resumo em #digest

Output: relatorio markdown + JSON snapshot + Discord post.
```

## Conectores necessarios

- Bash (rodar lighthouse + node)
- Filesystem (escrever monitoring/lighthouse/)
- Webhook Discord (NEXT_PUBLIC + DISCORD_WEBHOOK_DIGEST/CRITICO)

## Quota estimada

- 1 run/semana = 4 runs/mes
- Tempo execucao: ~10-15min
- Custo Anthropic: ~30k tokens/run = ~120k tokens/mes (1.2% janela semanal Max 5x)

## Diretorios criados

```
monitoring/lighthouse/
├── 2026-05-19.json    (snapshot semana 1)
├── 2026-05-26.json    (snapshot semana 2)
├── relatorio-2026-05-26.md  (primeiro comparativo)
└── ...
```

## Threshold pra alerta critico

| Metrica | Threshold |
|---|---|
| Performance score | -10 pontos vs semana ant |
| LCP | >5.0s |
| TBT | >5.0s |
| CLS | >0.1 |
| Acessibility | <90 |
| SEO | <90 |

## Quando criar

Antes do soft launch 11/06/2026 (precisa ja ter 2-3 baselines pra detectar regressao).

## Status

⏳ Spec pronta 20/05. **Pendente CEO criar a Routine no dashboard claude.ai/code/routines** seguindo prompt acima.

## Memorias relacionadas

- `automation/CLAUDE.md`
- `decisions/018-rolling-releases-pre-launch.md`
