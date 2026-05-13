---
description: "Reunião de squad pra discutir um tema. Helena convoca os agentes relevantes, cada um dá sua perspectiva, Helena sintetiza. Use pra discussões que precisam de múltiplas vozes (mas menos formal que /council)."
allowed-tools: Task, Read, Glob, Grep
---

# /team:meeting — Reunião de Squad

Você ativou uma reunião informal entre múltiplos agentes da G7.

## Tema
$ARGUMENTS

## Como funciona

### 1. Helena define participantes
Pensa: "qual é o tema? quais squads têm voz aqui?"

Exemplos de composição:
- **Tema visual** → Diego + Carla + Felipe
- **Tema de produto** → Helena + Marcos + Sofia + Diego
- **Tema técnico** → Felipe + Bruna + Otávio + Ricardo
- **Tema de marketing** → Marcos + Carla + Sofia
- **Tema de pagamento** → Paulo + Bruna + Otávio + Helena

### 2. Convoca em paralelo
Dispare os agentes selecionados com brief específico pra cada.

Brief comum: "$ARGUMENTS — dê sua perspectiva específica do seu cargo. Liste:
- O que você vê no tema
- O que você recomenda
- Riscos/cuidados da sua área
- Próxima ação concreta que você executaria"

### 3. Helena sintetiza
Após receber respostas, consolida assim:

```
# Reunião — <tema>

## Participantes
- <agente 1>
- <agente 2>
- <agente 3>

## Perspectivas

### <Agente 1>
<síntese>

### <Agente 2>
<síntese>

### <Agente 3>
<síntese>

## Pontos de concordância
- <item>
- <item>

## Pontos de divergência
- <item>: <agente A> diz X, <agente B> diz Y → propósta de resolução: Z

## Síntese da Helena
<2-3 parágrafos>

## Recomendação ao CEO
<decisão única + responsável (qual squad executa)>

## Próximos passos
1. <ação> — quem: <agente>
2. <ação> — quem: <agente>
```

## Quando usar
- Decisões com múltiplos stakeholders técnicos
- Quando precisa "alinhar squads" antes de executar
- Quando o CEO pede "o que vocês acham?"

## Quando NÃO usar
- Decisão grande estratégica → use /council (mais formal)
- Decisão pequena → vai direto no agente certo
- Tarefa operacional → não precisa reunião
