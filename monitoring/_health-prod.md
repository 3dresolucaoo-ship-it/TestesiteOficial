# Health Prod — Hayzer

Log acumulado dos smoke tests diarios. Atualizado automaticamente as 06h BRT.

| Data | Status | Rotas | Prod SHA | Supabase | Nota |
|------|--------|-------|----------|----------|------|
| 07/06 | AMARELO | 3/4 | 9a06284 (~18h) | OK — 5 leads 7d | /calc/pro 404 esperado + search_index ausente (3x consecutivo) |
| 06/06 | AMARELO | 3/4 | c54ef0a (~32h) | OK — 6 leads | /calc/pro 404 esperado + search_index ausente |
| 05/06 | AMARELO | 3/4 | c54ef0a (~8h) | OK — 3 leads | /calc/pro 404 esperado + search_index ausente |

## Alertas recorrentes (nao criticos)

- **/calculadora/pro → 404**: esperado. Rota nunca implementada. ADR-024 revogou Calc Pro em 21/05.
- **search_index view ausente**: presente ha 3 smoke tests consecutivos. Avaliar criar a view antes do soft launch (13/06) ou remover da checklist se nao usada.

## Ultimo critico

Nenhum critico registrado ate o momento.
