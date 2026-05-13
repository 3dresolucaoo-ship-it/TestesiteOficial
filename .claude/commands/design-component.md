---
description: "Cria componente UI seguindo o design system fixo do BVaz (shadcn + Aceternity + Magic UI). Carla escreve copy se precisar, Diego desenha, Felipe implementa. Use para criar nova tela ou componente."
allowed-tools: Task, Read, Edit, Write, Glob, Grep
---

# /design:component — Criar Componente

Você ativou o fluxo de criação de componente da G7.

## O que criar
$ARGUMENTS

## Fluxo

### 1. Diego (Designer) — Especifica
Chama o subagent **diego-designer** com brief:
"Cria a especificação de design pro componente: $ARGUMENTS.

Inclua:
- Estrutura (layout, hierarquia)
- Tokens (cores, espaçamento, tipografia, animação) seguindo brand/BRIEF.md
- Estados (default/hover/focus/active/disabled/loading)
- Mobile (320-768px)
- Dark mode
- Auditoria anti-IA aplicada
- Referência específica (qual marca/biblioteca inspirou)"

### 2. Carla (Copy) — Se precisa de texto
Se o componente tem copy (texto, label, CTA, descrição):

Chama o subagent **carla-copy** com brief:
"Escreve copy pro componente: $ARGUMENTS.
Contexto: <onde aparece + objetivo>.
Brand: usa brand/BRIEF.md.
Entrega 3 versões + recomendação."

### 3. Felipe (Frontend) — Implementa
Chama o subagent **felipe-frontend** com brief:
"Implementa o componente em React 19 + Next.js 16 App Router + TypeScript + Tailwind 4 + shadcn/ui.

Use a especificação do Diego acima.
Use a copy da Carla acima (se aplicável).

Siga convenções:
- Server Component default
- Tipa tudo (zero `any`)
- Mobile-first
- Acessibilidade (a11y básica)
- PT-BR em UI"

### 4. (Opcional) Júlia — QA
Se o componente é crítico ou complexo:

Chama o subagent **julia-qa** com brief:
"Audita o componente recém-criado: $ARGUMENTS.
Checklist completo: golden path, edge cases, mobile, dark mode, a11y.
Reporta bugs com prioridade."

## Saída final pro CEO
```
## Componente: <nome>

### Design (Diego)
<resumo da especificação>

### Copy (Carla, se aplicável)
<copy final>

### Código (Felipe)
- Arquivos criados/editados: <lista>
- Localização: <path>

### QA (Júlia, se aplicável)
<status: aprovado / aprovado com ressalvas / reprovado>

### Próximo passo sugerido
<integrar onde + testar como>
```
