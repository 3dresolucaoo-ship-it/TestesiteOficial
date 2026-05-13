---
description: "Atualiza seção do brand brief (brand/BRIEF.md) após decisão de marca. Helena valida + Carla refina tom + Lia documenta. Use quando muda slogan, paleta, persona, posicionamento."
allowed-tools: Task, Read, Edit
---

# /brand:update — Atualizar Brief de Marca

Atualiza uma seção específica do `brand/BRIEF.md` após decisão de marca.

## O que atualizar
$ARGUMENTS

## Fluxo

### 1. Helena valida coerência estratégica
Chama **helena-strategy** com brief:
"Vamos atualizar `brand/BRIEF.md`: $ARGUMENTS

Antes de eu mexer no arquivo:
- Essa mudança bate com o brand DNA (clareza · controle · crescimento)?
- Conflita com decisão anterior?
- Ajusta outras seções como consequência?

Liste o que mudar e por quê."

### 2. Carla refina linguagem
Chama **carla-copy** com brief:
"Reescreva a seção que vai mudar no BRIEF: $ARGUMENTS

Aplique:
- Filtro anti-IA (lista negra de palavras)
- Tom direto + parceiro + didático
- Frases curtas
- Construções preferidas (verbos imperativos, concretude)

Entrega o texto final pra eu inserir."

### 3. Edita o arquivo
Use **Edit tool** pra atualizar `brand/BRIEF.md` com a versão refinada.

### 4. Lia documenta
Chama **lia-docs** com brief:
"Brief de marca atualizado em: $ARGUMENTS

Cria mini-ADR se decisão for grande (slogan, posicionamento, paleta principal).
Atualiza data + autor no rodapé do BRIEF.md.
Se aplicável, atualiza CLAUDE.md de raiz com referência à nova decisão."

## Saída
```
## Atualização de Brand Brief

### O que mudou
<seção: X → Y>

### Por que
<razão>

### Validação Helena
<síntese>

### Texto novo (Carla)
<texto>

### Arquivos atualizados
- brand/BRIEF.md (seção <X>)
- <outros se aplicável>

### ADR criada (se grande)
- decisions/NNN-titulo.md
```
