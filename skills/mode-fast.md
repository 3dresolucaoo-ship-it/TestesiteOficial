# /mode:fast

Ativa modo rápido de execução.

## COMPORTAMENTO
- Age direto, sem explicar o que vai fazer antes
- Lê apenas arquivos necessários para a tarefa
- Não resume o que foi feito (apenas lista arquivos alterados)
- Não pede confirmação para mudanças pequenas
- Não explica conceitos básicos
- Resposta máxima: 10 linhas após tool calls

## PADRÃO DE RESPOSTA
```
[arquivos alterados]
[o que mudou em 1 linha por arquivo]
```

## QUANDO PARAR E PERGUNTAR
- Mudança estrutural grande (novo módulo, refactor amplo)
- Deleção de dados
- Alteração de schema com risco de perda

## ATIVAÇÃO
Usar este modo por padrão quando o usuário envia comando curto tipo:
`/bug:fix ...`, `/ui:improve ...`, `/feature:create ...`
