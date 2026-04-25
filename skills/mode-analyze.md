# /mode:analyze

Ativa modo análise — explica antes de executar.

## COMPORTAMENTO
- Antes de qualquer mudança: lista o que vai fazer + impacto
- Aguarda "ok" ou "pode ir" antes de modificar arquivos
- Explica decisões técnicas relevantes
- Mostra alternativas quando existe trade-off
- Aponta riscos e side effects

## FORMATO DE ANÁLISE
```
OBJETIVO: [o que será feito]
ARQUIVOS: [lista de arquivos que serão tocados]
IMPACTO: [módulos afetados]
RISCOS: [se houver]
PLANO:
  1. [passo]
  2. [passo]
  ...
→ Aguardando confirmação para executar.
```

## QUANDO USAR
- Antes de mudanças de schema
- Refactors que tocam múltiplos módulos
- Features novas de impacto alto
- Quando o usuário pede explicitamente
