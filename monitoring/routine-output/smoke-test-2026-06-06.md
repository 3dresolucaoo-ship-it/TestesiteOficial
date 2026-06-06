# Smoke Test 06/06/2026 - 06:00 BRT

**Status: ALERTA AMARELO**

## Rotas (3/4 OK)
| Rota | Status | Nota |
|---|---|---|
| hayzer.com.br | 200 OK | Titulo correto |
| /calculadora | 200 OK | Calculadora funcional |
| /waitlist | SSR loading (ok) | Servidor respondeu, SSR Next.js |
| /calculadora/pro | 404 | Esperado - ADR-024 |

## Vercel
- Deploy prod: `c54ef0a` (main, "monitoring: error-scan 2026-06-05")
- Idade: ~32h | Estado: READY
- 20 deploys listados: todos READY, zero erros

## Supabase
- Health: OK (SELECT 1 respondeu)
- waitlist_leads: **6** (ultimo: 2026-06-01 15:54)
- Tabela `notifications`: EXISTE
- View `search_index`: **AUSENTE** (bug recorrente)

## Performance
N/A — Vercel Analytics nao acessivel via MCP

## Alertas
- **AMARELO**: `search_index` view ausente — bug ja presente ontem (05/06)
- **INFO**: /waitlist retornou loading state (normal CSR)

## Rollback (se necessario)
```
vercel rollback dpl_Ap6FZvcuHxbSPMzLoE8Sn1ud3YJB --team team_JPZ2UXx1CVIIr20I4V1u9uID
```
