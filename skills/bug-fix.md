# /bug:fix

Debug estruturado — achar e corrigir sem quebrar sistema.

## INPUT
```
/bug:fix [descrição do bug] [módulo]
```

## PROTOCOLO

### 1. LOCALIZAR (ler apenas o necessário)
```
Frontend → Service → DB
```
- [ ] Request está sendo feito? (`app/[rota]`)
- [ ] project_id está sendo enviado?
- [ ] Service recebe e filtra project_id?
- [ ] Query retorna dados? (checar com supabaseAdmin se RLS)
- [ ] Componente renderiza o resultado?

### 2. ISOLAR
- Identificar a linha exata do erro
- Confirmar se é: tipagem / lógica / query / RLS / UI
- **PARAR** ao encontrar — não continuar explorando

### 3. CORRIGIR
- Alterar apenas o necessário
- Não refatorar código não relacionado
- Não adicionar features durante bug fix

### 4. VALIDAR
- O fluxo completo funciona?
- Outros módulos continuam funcionando?
- project_id isolation intacto?

## SAÍDA (formato fixo)
```
ERRO: [o que estava quebrado]
CAUSA: [por que estava quebrando]
FIX: [o que foi alterado — arquivo:linha]
```
